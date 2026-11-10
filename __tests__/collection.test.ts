import {SPECIES_COUNT} from '../src/constants/config';
import {applyEntry, discoveredCount, emptyCollection} from '../src/game/collection';
import {commitEntry, emptyCatch} from '../src/game/entryModel';
import {freshDraft} from '../src/game/ledgerStore';

function entryWithCatch(counts: number[]) {
  return commitEntry({...freshDraft(1, null), iceCm: 18, catch: counts}, 90, 12);
}

describe('collection', () => {
  it('starts with five undiscovered species', () => {
    const start = emptyCollection();
    expect(start).toHaveLength(SPECIES_COUNT);
    expect(discoveredCount(start)).toBe(0);
    start.forEach(record => {
      expect(record.count).toBe(0);
      expect(record.firstDayIndex).toBeNull();
    });
  });

  it('reveals a species the first time it is logged', () => {
    const counts = emptyCatch();
    counts[2] = 2;
    const result = applyEntry(emptyCollection(), entryWithCatch(counts), 'BIRCH BAY');
    expect(result.discovered).toEqual([2]);
    expect(result.collection[2].discovered).toBe(true);
    expect(result.collection[2].count).toBe(2);
    expect(result.collection[2].firstPin).toBe('BIRCH BAY');
    expect(discoveredCount(result.collection)).toBe(1);
  });

  it('adds to the count without re-announcing a known species', () => {
    const counts = emptyCatch();
    counts[2] = 1;
    const first = applyEntry(emptyCollection(), entryWithCatch(counts), null);
    const second = applyEntry(first.collection, entryWithCatch(counts), null);
    expect(second.discovered).toEqual([]);
    expect(second.collection[2].count).toBe(2);
  });

  it('leaves species alone when nothing was caught', () => {
    const result = applyEntry(emptyCollection(), entryWithCatch(emptyCatch()), null);
    expect(result.discovered).toEqual([]);
    expect(discoveredCount(result.collection)).toBe(0);
  });
});
