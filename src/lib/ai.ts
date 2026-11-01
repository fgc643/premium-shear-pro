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
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error('Não foi possível ler a foto.')); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Arquivo de imagem inválido.')); };
    img.src = url;
  });
}
