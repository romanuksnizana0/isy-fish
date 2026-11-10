import {
  averageIceCm,
  bestCatchCount,
  commitDraft,
  freshDraft,
  getState,
  lastIceCm,
  recentIce,
  resetForTests,
} from '../src/game/ledgerStore';
import {emptyCatch} from '../src/game/entryModel';

describe('progression', () => {
  beforeEach(() => {
    resetForTests();
  });

  it('grows the safe streak and breaks it on thin ice', () => {
    commitDraft({...freshDraft(1, null), iceCm: 20});
    commitDraft({...freshDraft(2, null), iceCm: 22});
    expect(getState().safeStreak).toBe(2);
    expect(getState().bestSafeStreak).toBe(2);
    commitDraft({...freshDraft(3, null), iceCm: 4});
    expect(getState().safeStreak).toBe(0);
    expect(getState().bestSafeStreak).toBe(2);
  });

  it('reports the last and average readings', () => {
    commitDraft({...freshDraft(1, null), iceCm: 10});
    commitDraft({...freshDraft(2, null), iceCm: 20});
    expect(lastIceCm(getState())).toBe(20);
    expect(averageIceCm(getState())).toBe(15);
    expect(recentIce(getState())).toEqual([10, 20]);
  });

  it('remembers the best catch day', () => {
    const three = emptyCatch();
    three[0] = 2;
    three[4] = 1;
    commitDraft({...freshDraft(1, null), iceCm: 18, catch: three});
    commitDraft({...freshDraft(2, null), iceCm: 18});
    expect(bestCatchCount(getState())).toBe(3);
  });

  it('starts an empty season with zeroes, not with fake values', () => {
    expect(getState().entries).toHaveLength(0);
    expect(averageIceCm(getState())).toBe(0);
    expect(bestCatchCount(getState())).toBe(0);
    expect(lastIceCm(getState())).toBe(0);
  });
});
