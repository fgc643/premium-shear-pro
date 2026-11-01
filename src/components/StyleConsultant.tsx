import { useRef, useState } from 'react';
import { Camera, ImageUp, Loader2, RefreshCw, ScanFace, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageResponse } from '@/components/ai-elements/message';
import { fileToResizedDataUrl, invokeAi, openConcierge } from '@/lib/ai';

const StyleConsultant = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onFile = async (file?: File) => {
    if (!file) return;
    setError('');
    setResult('');
    if (!file.type.startsWith('image/')) { setError('Escolha um arquivo de imagem.'); return; }
    if (file.size > 15 * 1024 * 1024) { setError('A foto é muito grande (máx. 15 MB).'); return; }
    try {
      setImage(await fileToResizedDataUrl(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível ler a foto.');
    }
  };

  const analyze = async () => {
    if (!image || loading) return;
    setLoading(true);
    setError('');
    setResult('');
    try {
      setResult(await invokeAi('ai-style', { image, note }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao analisar a foto.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult('');
    setError('');
    setNote('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <section id="consultor" className="relative overflow-hidden bg-secondary/40 py-24">
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
            <ScanFace className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Consultor de Estilo com IA</span>
          </div>
          <h2 className="mb-4 font-display text-4xl font-bold text-foreground md:text-5xl">
            Descubra o <span className="text-gradient-gold">corte ideal</span> para você
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Envie uma selfie de frente e nossa IA analisa o formato do seu rosto, cabelo e barba para indicar os
            cortes e serviços que mais valorizam seu estilo.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
          {/* Upload */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
              aria-label="Enviar foto"
            />
            {image ? (
              <div className="relative overflow-hidden rounded-xl bg-secondary">
                <img src={image} alt="Sua foto" className="aspect-[4/5] w-full object-cover object-center" />
                <Button size="sm" variant="secondary" className="absolute right-2 top-2" onClick={reset} disabled={loading}>
                  <RefreshCw className="mr-1" /> Trocar
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-primary/40 bg-secondary/50 text-center transition-colors hover:border-primary hover:bg-primary/5"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
                <span className="font-semibold text-foreground">Tirar ou enviar selfie</span>
                <span className="px-6 text-xs text-muted-foreground">Rosto de frente, boa luz, sem boné. A foto não fica salva.</span>
              </button>
            )}

            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={300}
              placeholder="Opcional: ex. quero algo mais moderno"
              className="mt-4 bg-secondary border-border"
            />
            <Button variant="gold" className="mt-3 w-full" disabled={!image || loading} onClick={analyze}>
              {loading ? <Loader2 className="mr-2 animate-spin" /> : <ImageUp className="mr-2" />}
              {loading ? 'Analisando seu estilo...' : 'Analisar meu estilo'}
            </Button>
          </div>

          {/* Result */}
          <div className="min-h-[300px] rounded-2xl border border-border bg-card p-6 shadow-sm">
            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}
            {!result && !error && !loading && (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                <ScanFace className="h-12 w-12 text-primary/60" />
                <p className="max-w-sm">Sua análise personalizada aparece aqui: perfil do rosto, cortes recomendados, barba e serviços ideais.</p>
              </div>
            )}
            {loading && (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-4 animate-pulse rounded bg-secondary" style={{ width: `${90 - i * 9}%` }} />
                ))}
              </div>
            )}
            {result && (
              <div className="space-y-5">
                <div className="text-foreground">
                  <MessageResponse>{result}</MessageResponse>
                </div>
                <Button
                  variant="gold"
                  onClick={() => openConcierge('Fiz a análise de estilo e quero agendar um dos serviços recomendados para mim.')}
                >
                  <CalendarPlus className="mr-2" /> Agendar com o Concierge IA
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StyleConsultant;
