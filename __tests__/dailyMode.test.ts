import {STREAK_WINDOW} from '../src/constants/config';
import {
  briefFor,
  dailyStreak,
  dayIndexOf,
  satisfiesBrief,
  streakWindow,
} from '../src/game/daily';
import {commitEntry, emptyCatch} from '../src/game/entryModel';
import {freshDraft} from '../src/game/ledgerStore';

function entryWith(patch: {iceCm?: number; catch?: number[]; gear?: any[]}) {
  return commitEntry(
    {...freshDraft(1, null), ...patch} as any,
    100,
    12,
  );
}

describe('daily mode', () => {
  it('gives the same brief all day and a different one tomorrow', () => {
    const a = briefFor(20000);
    const b = briefFor(20000);
    const c = briefFor(20001);
    expect(a).toEqual(b);
    expect(a.kind + a.target + a.weather).not.toEqual(
      c.kind + c.target + c.weather,
    );
  });

  it('derives the day index from a local date', () => {
    const d1 = dayIndexOf(new Date(2026, 0, 10, 2, 0, 0));
    const d2 = dayIndexOf(new Date(2026, 0, 10, 23, 0, 0));
    const d3 = dayIndexOf(new Date(2026, 0, 11, 1, 0, 0));
    expect(d1).toBe(d2);
    expect(d3).toBe(d1 + 1);
  });

  it('measures a thick-ice objective against the reading', () => {
    const brief = {...briefFor(1), kind: 'thickIce' as const, target: 18};
    expect(satisfiesBrief(brief, entryWith({iceCm: 16}))).toBe(false);
    expect(satisfiesBrief(brief, entryWith({iceCm: 18}))).toBe(true);
  });

  it('measures a two-species objective against distinct species', () => {
    const brief = {...briefFor(1), kind: 'twoSpecies' as const, target: 2};
    const one = emptyCatch();
    one[0] = 4;
    const two = emptyCatch();
    two[0] = 1;
    two[3] = 1;
    expect(satisfiesBrief(brief, entryWith({catch: one}))).toBe(false);
    expect(satisfiesBrief(brief, entryWith({catch: two}))).toBe(true);
  });

  it('builds a seven-cell window and counts the streak', () => {
    const today = 500;
    const window = streakWindow([500, 499, 497], today);
    expect(window).toHaveLength(STREAK_WINDOW);
    expect(window[STREAK_WINDOW - 1]).toBe(true);
    expect(window[STREAK_WINDOW - 2]).toBe(true);
    expect(window[STREAK_WINDOW - 3]).toBe(false);
    expect(dailyStreak([500, 499, 497], today)).toBe(2);
    expect(dailyStreak([], today)).toBe(0);
  });
});
