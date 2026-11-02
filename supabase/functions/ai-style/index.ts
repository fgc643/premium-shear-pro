import { createClient } from "npm:@supabase/supabase-js@2.86.2";
import { brl, corsHeaders, createResponsesCall, describeAiError, jsonResponse } from "../_shared/responses.ts";

const MAX_BYTES = 6 * 1024 * 1024;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Método não permitido" }, 405);

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return jsonResponse({ error: "A IA não está configurada." }, 500);

  let image = "";
  let note = "";
  try {
    const body = await req.json();
    image = String(body?.image ?? "");
    note = String(body?.note ?? "").slice(0, 300);
  } catch {
    return jsonResponse({ error: "Pedido inválido." }, 400);
  }
  if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image)) {
    return jsonResponse({ error: "Envie uma foto em JPG, PNG ou WEBP." }, 400);
  }
  if (image.length * 0.75 > MAX_BYTES) return jsonResponse({ error: "A foto é grande demais (máx. 6 MB)." }, 400);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    auth: { persistSession: false },
  });
  const { data: services } = await supabase
    .from("services").select("name,price,duration_minutes,description").eq("is_active", true);
  const list = (services ?? [])
    .map((s) => `- ${s.name} (${brl(Number(s.price))}, ${s.duration_minutes} min): ${s.description ?? ""}`)
    .join("\n");

  const instructions = `Você é o consultor de estilo da Elite Barber Studio, barbearia premium. Analise a foto enviada e responda em português do Brasil, em markdown, com estas seções curtas:
### Seu perfil
Formato de rosto provável, tipo de cabelo e de barba (se houver) — 2 a 3 frases.
### Cortes recomendados
2 ou 3 opções em lista, cada uma com o motivo em uma frase.
### Barba
Uma recomendação (ou dica de cuidado se não houver barba).
### Serviços ideais para você
Indique 1 a 3 serviços SOMENTE desta lista, com o preço em **negrito**:
${list}

Seja elegante e positivo, sem comentar aparência de forma negativa, idade, etnia ou outros atributos sensíveis. Se a foto não mostrar um rosto/cabelo com clareza, diga isso educadamente e peça outra foto com o rosto de frente e boa luz.`;

  let streamError: unknown = null;
  const { result } = createResponsesCall(
    req,
    { apiKey },
    [{
      role: "user",
      content: [
        { type: "text", text: note ? `Analise meu estilo. Observação: ${note}` : "Analise meu estilo e recomende cortes." },
        { type: "image", image: new URL(image) },
      ],
    }],
    instructions,
    { effort: "low", onError: (e) => { streamError = e; } },
  );

  try {
    const text = (await result.text).trim();
    if (!text) return jsonResponse({ error: "A IA não conseguiu analisar esta foto. Tente outra foto." }, 422);
    return jsonResponse({ text });
  } catch (e) {
    const { status, message } = describeAiError(streamError ?? e);
    return jsonResponse({ error: message }, status);
  }
});
