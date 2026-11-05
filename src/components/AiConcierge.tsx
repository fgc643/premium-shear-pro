import { useEffect, useMemo, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type ToolUIPart, type UIMessage } from 'ai';
import { CalendarCheck, CalendarSearch, MessageCircle, RotateCcw, X } from 'lucide-react';
import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea, type PromptInputMessage } from '@/components/ai-elements/prompt-input';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from '@/components/ai-elements/tool';
import { Button } from '@/components/ui/button';
import { CONCIERGE_EVENT } from '@/lib/ai';
import avatar from '@/assets/concierge-avatar.png';

const STORAGE_KEY = 'elite-concierge-chat-v1';

const loadMessages = (): UIMessage[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const suggestions = [
  'Quero agendar um corte para amanhã',
  'Qual corte combina com rosto redondo?',
  'Quanto custa corte + barba?',
  'Quais horários livres no sábado?',
];

const toolTitles: Record<string, string> = {
  'tool-verificar_horarios': 'Consultando a agenda',
  'tool-criar_agendamento': 'Registrando agendamento',
};

const formatBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const formatDate = (d: string) => {
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};

type SlotsOutput = { data: string; disponivel: boolean; motivo?: string; horarios_livres: string[] };
type BookingOutput = { sucesso: boolean; motivo?: string; servico?: string; preco?: number; data?: string; horario?: string; nome?: string };

const AiConcierge = () => {
  const [open, setOpen] = useState(false);
  const initialMessages = useMemo(loadMessages, []);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`,
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      }),
    [],
  );

  const { messages, sendMessage, status, stop, setMessages, error, clearError } = useChat({
    id: 'elite-concierge',
    messages: initialMessages,
    transport,
  });

  const busy = status === 'submitted' || status === 'streaming';

  // Persist the conversation in this browser once each response settles.
  useEffect(() => {
    if (status !== 'ready' && status !== 'error') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* storage full or blocked */
    }
  }, [messages, status]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    if (error) clearError();
    sendMessage({ text: t });
  };

  // Allow other parts of the site to open the concierge with a message.
  useEffect(() => {
    const handler = (e: Event) => {
      const text = (e as CustomEvent<{ text?: string }>).detail?.text;
      setOpen(true);
      if (text) setTimeout(() => send(text), 50);
    };
    window.addEventListener(CONCIERGE_EVENT, handler);
    return () => window.removeEventListener(CONCIERGE_EVENT, handler);
  });

  // Keep the composer focused while chatting.
  useEffect(() => {
    if (!open || busy) return;
    const el = document.querySelector<HTMLTextAreaElement>('#concierge-panel textarea');
    el?.focus();
  }, [open, busy, messages.length]);

  const handleSubmit = (msg: PromptInputMessage) => send(msg.text);

  const resetChat = () => {
    stop();
    setMessages([]);
    clearError();
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const renderToolResult = (part: ToolUIPart) => {
    if (part.state !== 'output-available') return null;
    if (part.type === 'tool-verificar_horarios') {
      const out = part.output as SlotsOutput;
      if (!out?.horarios_livres?.length) return null;
      return (
        <div className="flex flex-wrap gap-1.5">
          {out.horarios_livres.map((h) => (
            <button
              key={h}
              type="button"
              disabled={busy}
              onClick={() => send(`Quero o horário das ${h} no dia ${formatDate(out.data)}`)}
              className="rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
            >
              {h}
            </button>
          ))}
        </div>
      );
    }
    if (part.type === 'tool-criar_agendamento') {
      const out = part.output as BookingOutput;
      if (!out?.sucesso) return null;
      return (
        <div className="rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm">
          <div className="mb-1 flex items-center gap-2 font-semibold text-foreground">
            <CalendarCheck className="h-4 w-4 text-primary" /> Agendamento registrado
          </div>
          <p className="text-muted-foreground">
            {out.servico} · {out.preco !== undefined && formatBRL(out.preco)}
            <br />
            {out.data && formatDate(out.data)} às {out.horario} · {out.nome}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        aria-label={open ? 'Fechar concierge' : 'Abrir concierge com IA'}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-primary/50 bg-card py-1.5 pl-1.5 pr-4 shadow-[0_8px_40px_hsl(42_87%_45%_/_0.35)] transition-transform hover:scale-105 sm:bottom-6 sm:right-6"
      >
        <img src={avatar} alt="" width={44} height={44} className="h-11 w-11 rounded-full" />
        <span className="text-left leading-tight">
          <span className="block text-sm font-semibold text-foreground">{open ? 'Fechar' : 'Concierge IA'}</span>
          {!open && <span className="block text-xs text-muted-foreground">Agende em segundos</span>}
        </span>
        {open ? <X className="h-4 w-4 text-muted-foreground" /> : <MessageCircle className="h-4 w-4 text-primary" />}
      </button>

      {open && (
        <div
          id="concierge-panel"
          role="dialog"
          aria-label="Concierge Elite Barber"
          className="fixed inset-x-2 bottom-20 top-16 z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-fade-in sm:inset-x-auto sm:right-6 sm:top-auto sm:bottom-24 sm:h-[620px] sm:max-h-[calc(100vh-8rem)] sm:w-[400px]"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border bg-gradient-to-r from-primary/15 to-transparent px-4 py-3">
            <img src={avatar} alt="Concierge Elite Barber" width={40} height={40} className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <p className="font-display text-base font-bold text-foreground">Concierge Elite</p>
              <p className="text-xs text-muted-foreground">Assistente com IA · tira dúvidas e agenda</p>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={resetChat} title="Nova conversa" aria-label="Nova conversa">
              <RotateCcw />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)} aria-label="Fechar">
              <X />
            </Button>
          </div>

          <Conversation className="min-h-0 flex-1">
            <ConversationContent className="gap-5 p-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <img src={avatar} alt="" width={72} height={72} className="h-16 w-16 rounded-full" />
                  <div>
                    <p className="font-display text-lg font-bold text-foreground">Olá! Sou o Concierge Elite.</p>
                    <p className="text-sm text-muted-foreground">
                      Recomendo o corte ideal para você e marco seu horário aqui mesmo.
                    </p>
                  </div>
                  <div className="grid w-full gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => send(s)}
                        className="rounded-lg border border-border bg-secondary/60 px-3 py-2 text-left text-sm text-foreground transition-colors hover:border-primary hover:bg-primary/10"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message, mi) => {
                const isLast = mi === messages.length - 1;
                return (
                  <Message from={message.role} key={message.id}>
                    <MessageContent
                      className={
                        message.role === 'user'
                          ? 'group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground'
                          : 'w-full'
                      }
                    >
                      {message.parts.map((part, i) => {
                        const key = `${message.id}-${i}`;
                        if (part.type === 'text') {
                          return message.role === 'assistant' ? (
                            <MessageResponse key={key}>{part.text}</MessageResponse>
                          ) : (
                            <p key={key} className="whitespace-pre-wrap">{part.text}</p>
                          );
                        }
                        if (part.type === 'reasoning') {
                          if (!part.text.trim()) return null;
                          return (
                            <Reasoning key={key} isStreaming={isLast && status === 'streaming' && part.state === 'streaming'} defaultOpen={false}>
                              <ReasoningTrigger />
                              <ReasoningContent>{part.text}</ReasoningContent>
                            </Reasoning>
                          );
                        }
                        if (part.type.startsWith('tool-')) {
                          const tp = part as ToolUIPart;
                          const Icon = tp.type === 'tool-criar_agendamento' ? CalendarCheck : CalendarSearch;
                          return (
                            <div key={key} className="flex flex-col gap-2">
                              <Tool defaultOpen={false} className="mb-0">
                                <ToolHeader
                                  type={tp.type}
                                  state={tp.state}
                                  title={toolTitles[tp.type] ?? 'Ferramenta'}
                                  icon={<Icon className="h-4 w-4 text-primary" />}
                                />
                                <ToolContent>
                                  <ToolInput input={tp.input} />
                                  <ToolOutput output={tp.output} errorText={tp.errorText} />
                                </ToolContent>
                              </Tool>
                              {renderToolResult(tp)}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </MessageContent>
                  </Message>
                );
              })}

              {status === 'submitted' && (
                <Message from="assistant">
                  <MessageContent>
                    <Shimmer>Pensando...</Shimmer>
                  </MessageContent>
                </Message>
              )}

              {error && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  A demonstração de IA está indisponível no momento. Tente novamente mais tarde.
                </div>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <div className="border-t border-border p-3">
            <PromptInput onSubmit={handleSubmit}>
              <PromptInputTextarea placeholder="Pergunte ou peça um horário..." autoFocus />
              <PromptInputFooter className="justify-end">
                <PromptInputSubmit status={status} onStop={stop} />
              </PromptInputFooter>
            </PromptInput>
            <p className="mt-1.5 text-center text-[11px] text-muted-foreground">
              Atendimento com IA · confirme detalhes pelo WhatsApp (11) 94786-8207
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AiConcierge;
