import { createOpenAI } from "npm:@ai-sdk/openai@4.0.106";
import { streamText, type ModelMessage, type ToolSet, type StopCondition } from "npm:ai@7.0.159";

import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.ts";

export const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
export const CHAT_MODEL = "openai/gpt-6-astra";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

type CallOptions = {
  tools?: ToolSet;
  stopWhen?: StopCondition<any, any>;
  effort?: "low" | "medium" | "high";
  onError?: (error: unknown) => void;
};

export function createResponsesCall(
  request: Request,
  config: { apiKey: string; model?: string },
  messages: ModelMessage[],
  instructions?: string,
  options: CallOptions = {},
) {
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey: config.apiKey,
    headers: { "Lovable-API-Key": config.apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  const result = streamText({
    model: provider.responses(config.model ?? CHAT_MODEL),
    ...(instructions ? { instructions } : {}),
    messages,
    abortSignal: request.signal,
    maxRetries: 1,
    ...(options.tools ? { tools: options.tools } : {}),
    ...(options.stopWhen ? { stopWhen: options.stopWhen } : {}),
    onError: ({ error }: { error: unknown }) => options.onError?.(error),
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: options.effort ?? "medium",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  return { result, runIdFetch, withRunId: (res: Response) => withLovableAiGatewayRunIdHeader(res, runIdFetch, corsHeaders) };
}

/** Converts gateway/SDK errors into a status and a safe Portuguese message. */
export function describeAiError(err: unknown): { status: number; message: string } {
  // deno-lint-ignore no-explicit-any
  const e = err as any;
  const candidates = [e, e?.lastError, e?.cause, ...(Array.isArray(e?.errors) ? e.errors : [])];
  const apiErr = candidates.find((c) => c && typeof c.statusCode === "number");
  if (e?.name === "AbortError") return { status: 499, message: "Solicitação cancelada." };
  if (!apiErr) return { status: 500, message: "Não foi possível falar com a IA agora. Tente novamente em instantes." };
  const status: number = apiErr.statusCode;
  let upstream = "";
  try {
    const body = JSON.parse(apiErr.responseBody ?? "{}");
    upstream = body?.error?.message ?? body?.message ?? "";
  } catch { /* ignore */ }
  if (status === 429) return { status, message: "Muitas solicitações à IA agora. Aguarde um minuto e tente de novo." };
  if (status === 402) return { status, message: upstream || "Os créditos de IA acabaram. O dono do site precisa adicionar créditos." };
  if (status === 403) return { status, message: upstream || "O acesso à IA está bloqueado para este site." };
  if (status === 401) return { status, message: "A IA não está configurada corretamente." };
  if (status === 400) return { status, message: upstream || "Não consegui processar esse pedido." };
  return { status, message: "A IA está instável no momento. Tente novamente em instantes." };
}

export function saoPauloNow() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const date = `${get("year")}-${get("month")}-${get("day")}`;
  const time = `${get("hour") === "24" ? "00" : get("hour")}:${get("minute")}`;
  const weekday = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "long" }).format(now);
  return { date, time, weekday };
}

export const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
];

export const brl = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
