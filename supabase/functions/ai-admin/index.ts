import { createClient } from "npm:@supabase/supabase-js@2.86.2";
import { corsHeaders, createResponsesCall, describeAiError, jsonResponse, saoPauloNow } from "../_shared/responses.ts";

type BookingRow = {
  booking_date: string;
  booking_time: string;
  status: string | null;
  created_at: string;
  services: { name: string; price: number } | null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Método não permitido" }, 405);

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return jsonResponse({ error: "A IA não está configurada." }, 500);

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return jsonResponse({ error: "Faça login como administrador." }, 401);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: userData, error: userError } = await supabase.auth.getUser(authHeader.slice(7));
  if (userError || !userData.user) return jsonResponse({ error: "Sessão expirada. Entre novamente." }, 401);
  const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
  if (!isAdmin) return jsonResponse({ error: "Acesso restrito ao administrador." }, 403);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Pedido inválido." }, 400);
  }

  const now = saoPauloNow();
  let instructions = "";
  let prompt = "";

  if (body.action === "summary") {
    const from = new Date(Date.now() - 45 * 86400000).toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("bookings")
      .select("booking_date,booking_time,status,created_at,services(name,price)")
      .gte("booking_date", from)
      .order("booking_date");
    if (error) return jsonResponse({ error: "Não foi possível ler os agendamentos." }, 500);
    const rows = (data ?? []) as unknown as BookingRow[];

    const byStatus: Record<string, number> = {};
    const byService: Record<string, { qtd: number; receita: number }> = {};
    const byHour: Record<string, number> = {};
    const byWeekday: Record<string, number> = {};
    const byDay: Record<string, { qtd: number; receita: number }> = {};
    const wd = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
    for (const r of rows) {
      const st = r.status ?? "pending";
      byStatus[st] = (byStatus[st] ?? 0) + 1;
      if (st === "cancelled") continue;
      const name = r.services?.name ?? "Serviço";
      const price = Number(r.services?.price ?? 0);
      const paid = st === "confirmed" || st === "completed";
      byService[name] ??= { qtd: 0, receita: 0 };
      byService[name].qtd += 1;
      if (paid) byService[name].receita += price;
      const h = r.booking_time.slice(0, 5);
      byHour[h] = (byHour[h] ?? 0) + 1;
      const w = wd[new Date(`${r.booking_date}T12:00:00Z`).getUTCDay()];
      byWeekday[w] = (byWeekday[w] ?? 0) + 1;
      byDay[r.booking_date] ??= { qtd: 0, receita: 0 };
      byDay[r.booking_date].qtd += 1;
      if (paid) byDay[r.booking_date].receita += price;
    }
    const today = rows.filter((r) => r.booking_date === now.date)
      .map((r) => `${r.booking_time.slice(0, 5)} ${r.services?.name ?? ""} (${r.status})`);

    instructions = `Você é o analista de negócios da Elite Barber Studio. Responda em português do Brasil, em markdown, curto e prático, com estas seções:
### Hoje
Agenda e caixa de hoje em 1-2 frases.
### Destaques
3 a 4 tópicos com números (serviços mais procurados, horários e dias de pico, receita confirmada, pendentes a confirmar).
### Recomendações
3 ações concretas para aumentar faturamento ou ocupação (promoções em horários vazios, combos, lembretes).
Use valores em R$ no padrão brasileiro. Não invente dados além dos fornecidos. Receita = só agendamentos confirmados ou concluídos.`;
    prompt = `Data de hoje: ${now.weekday}, ${now.date}. Dados dos últimos 45 dias e futuros:
Total de agendamentos: ${rows.length}
Por status: ${JSON.stringify(byStatus)}
Por serviço: ${JSON.stringify(byService)}
Por horário: ${JSON.stringify(byHour)}
Por dia da semana: ${JSON.stringify(byWeekday)}
Por data: ${JSON.stringify(byDay)}
Agenda de hoje: ${today.length ? today.join("; ") : "nenhum agendamento"}`;
  } else if (body.action === "describe") {
    const name = String(body.name ?? "").slice(0, 80);
    const category = String(body.category ?? "").slice(0, 40);
    const price = Number(body.price ?? 0);
    const duration = Number(body.duration ?? 0);
    const current = String(body.current ?? "").slice(0, 300);
    if (!name) return jsonResponse({ error: "Informe o serviço." }, 400);
    instructions = `Você é redator de uma barbearia premium. Escreva UMA descrição de serviço em português do Brasil, com no máximo 110 caracteres, sedutora, elegante e que gere desejo de agendar. Sem aspas, sem emojis, sem preço, apenas o texto.`;
    prompt = `Serviço: ${name}\nCategoria: ${category}\nPreço: R$ ${price.toFixed(2)}\nDuração: ${duration} min\nDescrição atual: ${current || "nenhuma"}`;
  } else {
    return jsonResponse({ error: "Ação desconhecida." }, 400);
  }

  let streamError: unknown = null;
  const { result } = createResponsesCall(
    req,
    { apiKey },
    [{ role: "user", content: prompt }],
    instructions,
    { effort: "low", onError: (e) => { streamError = e; } },
  );
  try {
    let text = (await result.text).trim();
    if (!text) return jsonResponse({ error: "A IA não retornou resposta. Tente novamente." }, 502);
    if (body.action === "describe") text = text.replace(/^["“]|["”]$/g, "").slice(0, 160);
    return jsonResponse({ text });
  } catch (e) {
    const { status, message } = describeAiError(streamError ?? e);
    return jsonResponse({ error: message }, status);
  }
});
