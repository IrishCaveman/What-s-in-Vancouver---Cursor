import { describe, expect, it, vi } from 'vitest';
import {
  christmasMarketFallback,
  isWithinChristmasMarketSeason,
  normalizeChristmasMarketRows,
  toSupabaseEventRow
} from './vancouverChristmasMarket';

describe('Vancouver Christmas Market guardrail', () => {
  it('drops May 2026 and only accepts the holiday market season', () => {
    expect(isWithinChristmasMarketSeason('2026-05-18T12:00:00-07:00')).toBe(false);
    expect(isWithinChristmasMarketSeason('2026-10-31T12:00:00-07:00')).toBe(false);
    expect(isWithinChristmasMarketSeason('2026-11-13T12:00:00-08:00')).toBe(true);
    expect(isWithinChristmasMarketSeason('2026-12-24T20:00:00-08:00')).toBe(true);
    expect(isWithinChristmasMarketSeason('2026-12-25T12:00:00-08:00')).toBe(false);
  });

  it('injects and commits verified fallback metadata for off-season empty states', async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const supabase = {
      from: vi.fn(() => ({ upsert }))
    };

    const events = await normalizeChristmasMarketRows([], supabase);

    expect(events).toEqual([christmasMarketFallback]);
    expect(upsert).toHaveBeenCalledWith(toSupabaseEventRow(christmasMarketFallback), { onConflict: 'id' });
  });
});
