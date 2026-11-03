import { describe, expect, it } from 'bun:test';
import { isSlotPast } from './slots';

const now = new Date(2026, 10, 3, 14, 10); // 03/11/2026 14:10

describe('isSlotPast', () => {
  it('blocks a time earlier today', () => {
    expect(isSlotPast('2026-11-03', '14:00', now)).toBe(true);
  });
  it('allows a later time today', () => {
    expect(isSlotPast('2026-11-03', '14:30', now)).toBe(false);
  });
  it('allows any time on a future day', () => {
    expect(isSlotPast('2026-11-04', '09:00', now)).toBe(false);
  });
});
