import {SPECIES_COUNT} from '../src/constants/config';
import {
  NOTE_TAGS,
  blockedReason,
  canCommit,
  emptyCatch,
  totalCatch,
} from '../src/game/entryModel';
import {freshDraft} from '../src/game/ledgerStore';

describe('catch notes', () => {
  it('starts with one counter per species', () => {
    expect(emptyCatch()).toHaveLength(SPECIES_COUNT);
    expect(totalCatch(emptyCatch())).toBe(0);
  });

  it('offers four distinct note tags', () => {
    expect(NOTE_TAGS).toHaveLength(4);
    expect(new Set(NOTE_TAGS).size).toBe(4);
  });

  it('refuses a blank entry and says why', () => {
    const blank = freshDraft(1, null);
    expect(canCommit(blank)).toBe(false);
    expect(blockedReason(blank)).toContain('SLOW DAY');
  });

  it('accepts an entry once anything was recorded', () => {
    const base = freshDraft(1, null);
    expect(canCommit({...base, iceCm: 14})).toBe(true);
    expect(canCommit({...base, tags: ['SLOW DAY']})).toBe(true);
    const withFish = emptyCatch();
    withFish[2] = 1;
    expect(canCommit({...base, catch: withFish})).toBe(true);
    expect(blockedReason({...base, iceCm: 14})).toBeNull();
  });
});
