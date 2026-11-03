import { format } from 'date-fns';

/** True when the slot (HH:mm) on dateKey (yyyy-MM-dd) has already started, in local time. */
export function isSlotPast(dateKey: string | null, slot: string, now: Date = new Date()): boolean {
  if (!dateKey) return false;
  const today = format(now, 'yyyy-MM-dd');
  if (dateKey < today) return true;
  if (dateKey > today) return false;
  const [h, m] = slot.split(':').map(Number);
  return h * 60 + m <= now.getHours() * 60 + now.getMinutes();
}
