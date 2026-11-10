import {
  commitDraft,
  freshDraft,
  getState,
  hydrate,
  persist,
  resetForTests,
  setStorage,
  subscribe,
  updateSettings,
} from '../src/game/ledgerStore';

describe('ledger store', () => {
  beforeEach(() => {
    resetForTests();
  });

  it('notifies subscribers on every write', () => {
    let calls = 0;
    const unsubscribe = subscribe(() => {
      calls += 1;
    });
    updateSettings({units: 'in'});
    expect(calls).toBe(1);
    unsubscribe();
    updateSettings({units: 'cm'});
    expect(calls).toBe(1);
  });

  it('round-trips the season through the storage seam', () => {
    let raw: string | null = null;
    setStorage({
      read: () => raw,
      write: value => {
        raw = value;
      },
    });
    commitDraft({...freshDraft(1, null), iceCm: 24});
    updateSettings({units: 'in', safeThresholdCm: 16});
    persist();
    expect(raw).not.toBeNull();

    resetForTests();
    hydrate();
    expect(getState().entries).toHaveLength(1);
    expect(getState().entries[0].iceCm).toBe(24);
    expect(getState().settings.units).toBe('in');
    expect(getState().settings.safeThresholdCm).toBe(16);

    setStorage({read: () => null, write: () => {}});
  });

  it('survives a corrupt payload instead of crashing', () => {
    setStorage({read: () => '{not json', write: () => {}});
    expect(() => hydrate()).not.toThrow();
    expect(getState().entries).toHaveLength(0);
    setStorage({read: () => null, write: () => {}});
  });
});
