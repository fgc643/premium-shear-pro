import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const CONCIERGE_EVENT = 'open-concierge';

/** Opens the AI concierge chat, optionally sending a first message. */
export const openConcierge = (text?: string) => {
  window.dispatchEvent(new CustomEvent(CONCIERGE_EVENT, { detail: { text } }));
};

/** Calls a one-shot AI backend function and returns its text, or throws a readable error. */
export async function invokeAi(name: 'ai-style' | 'ai-admin', body: Record<string, unknown>): Promise<string> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    if (error instanceof FunctionsHttpError) {
      try {
        const payload = await error.context.json();
        throw new Error(payload?.error || 'Não foi possível falar com a IA.');
      } catch (e) {
        if (e instanceof Error && e.message) throw e;
      }
    }
    throw new Error('Não foi possível falar com a IA. Verifique sua conexão.');
  }
  if (!data?.text) throw new Error(data?.error || 'A IA não retornou resposta.');
  return data.text as string;
}

/** Resizes an image file to a JPEG data URL (max side `max` px) to keep uploads light. */
export function fileToResizedDataUrl(file: File, max = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        if (!w || !h) throw new Error('empty');
        const scale = Math.min(1, max / Math.max(w, h));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(w * scale));
        canvas.height = Math.max(1, Math.round(h * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('no ctx');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        canvas.width = 0; canvas.height = 0; // free memory on phones
        if (!dataUrl.startsWith('data:image/jpeg')) throw new Error('bad output');
        resolve(dataUrl);
      } catch {
        reject(new Error('Não foi possível ler esta foto. Tente outra foto (JPG ou PNG).'));
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Arquivo de imagem inválido.')); };
    img.src = url;
  });
}
