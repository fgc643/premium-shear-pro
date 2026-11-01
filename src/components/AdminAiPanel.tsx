import { useEffect, useState } from 'react';
import { BrainCircuit, Loader2, PenLine, Save, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageResponse } from '@/components/ai-elements/message';
import { supabase, Service } from '@/lib/supabase';
import { invokeAi } from '@/lib/ai';
import { useToast } from '@/hooks/use-toast';

const AdminAiPanel = () => {
  const { toast } = useToast();
  const [summary, setSummary] = useState('');
  const [summaryError, setSummaryError] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadServices = async () => {
    const { data } = await supabase.from('services').select('*').order('category');
    setServices((data as Service[]) ?? []);
  };

  useEffect(() => {
    loadServices();
  }, []);

  const runSummary = async () => {
    setSummaryLoading(true);
    setSummaryError('');
    try {
      setSummary(await invokeAi('ai-admin', { action: 'summary' }));
    } catch (e) {
      setSummaryError(e instanceof Error ? e.message : 'Erro ao gerar análise.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const generateDescription = async (s: Service) => {
    setBusyId(s.id);
    try {
      const text = await invokeAi('ai-admin', {
        action: 'describe', name: s.name, category: s.category, price: Number(s.price),
        duration: s.duration_minutes, current: s.description ?? '',
      });
      setDrafts((d) => ({ ...d, [s.id]: text }));
    } catch (e) {
      toast({ title: 'IA indisponível', description: e instanceof Error ? e.message : 'Tente novamente.', variant: 'destructive' });
    } finally {
      setBusyId(null);
    }
  };

  const saveDescription = async (s: Service) => {
    const text = (drafts[s.id] ?? '').trim();
    if (!text) return;
    setBusyId(s.id);
    const { error } = await supabase.from('services').update({ description: text }).eq('id', s.id);
    setBusyId(null);
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível salvar a descrição.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Descrição atualizada', description: `${s.name} já aparece com o novo texto no site.` });
    setDrafts((d) => { const n = { ...d }; delete n[s.id]; return n; });
    loadServices();
  };

  return (
    <div className="mb-8 grid gap-6 lg:grid-cols-2">
      {/* Business insights */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-gold">
              <BrainCircuit className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Análise com IA</h2>
              <p className="text-sm text-muted-foreground">Resumo do dia, picos e recomendações</p>
            </div>
          </div>
          <Button variant="gold" size="sm" onClick={runSummary} disabled={summaryLoading}>
            {summaryLoading ? <Loader2 className="mr-1 animate-spin" /> : <Wand2 className="mr-1" />}
            {summary ? 'Atualizar análise' : 'Gerar análise'}
          </Button>
        </div>
        <div className="max-h-[480px] overflow-y-auto p-5 text-foreground">
          {summaryError && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{summaryError}</div>
          )}
          {summaryLoading && (
            <div className="space-y-3">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-4 animate-pulse rounded bg-secondary" style={{ width: `${95 - i * 8}%` }} />
              ))}
            </div>
          )}
          {!summaryLoading && summary && <MessageResponse>{summary}</MessageResponse>}
          {!summaryLoading && !summary && !summaryError && (
            <p className="text-sm text-muted-foreground">
              Clique em “Gerar análise” para a IA ler seus agendamentos e o caixa e sugerir ações para faturar mais.
            </p>
          )}
        </div>
      </div>

      {/* Service copywriter */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-gold">
            <PenLine className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Textos dos serviços</h2>
            <p className="text-sm text-muted-foreground">A IA escreve descrições que vendem</p>
          </div>
        </div>
        <div className="max-h-[480px] divide-y divide-border overflow-y-auto">
          {services.map((s) => {
            const draft = drafts[s.id];
            const busy = busyId === s.id;
            return (
              <div key={s.id} className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{s.name}</p>
                    <p className="text-sm text-muted-foreground">{s.description || 'Sem descrição'}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => generateDescription(s)} disabled={busy} className="shrink-0">
                    {busy && draft === undefined ? <Loader2 className="mr-1 animate-spin" /> : <Wand2 className="mr-1" />}
                    Gerar
                  </Button>
                </div>
                {draft !== undefined && (
                  <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <Textarea
                      value={draft}
                      maxLength={200}
                      onChange={(e) => setDrafts((d) => ({ ...d, [s.id]: e.target.value }))}
                      className="min-h-[60px] bg-card"
                    />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setDrafts((d) => { const n = { ...d }; delete n[s.id]; return n; })}>
                        Descartar
                      </Button>
                      <Button size="sm" variant="gold" onClick={() => saveDescription(s)} disabled={busy || !draft.trim()}>
                        <Save className="mr-1" /> Salvar no site
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminAiPanel;
