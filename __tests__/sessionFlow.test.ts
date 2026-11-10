import {
  commitDraft,
  freshDraft,
  getState,
  resetForTests,
} from '../src/game/ledgerStore';

function draftWith(iceCm: number) {
  return {...freshDraft(77, null), iceCm, gear: ['ROPE' as const]};
}

describe('session flow', () => {
  beforeEach(() => {
    resetForTests();
  });

  it('commits a safe entry as logged', () => {
    const entry = commitDraft(draftWith(20));
    expect(entry.outcome).toBe('logged');
    expect(entry.safe).toBe(true);
    expect(getState().entries).toHaveLength(1);
    expect(getState().lastOutcome).toBe('logged');
  });

  it('commits a thin reading as unsafe but still records it', () => {
    const entry = commitDraft(draftWith(4));
    expect(entry.outcome).toBe('unsafe');
    expect(entry.safe).toBe(false);
    expect(getState().entries).toHaveLength(1);
  });

  it('writes nothing when the run is aborted', () => {
    const entry = commitDraft(draftWith(20), 'aborted');
    expect(entry.outcome).toBe('aborted');
    expect(getState().entries).toHaveLength(0);
    expect(getState().lastOutcome).toBe('aborted');
  });

  it('keeps the safety score on the committed entry', () => {
    const entry = commitDraft({
      ...freshDraft(1, null),
      iceCm: 18,
      gear: ['ROPE', 'SPIKES', 'AUGER', 'SONAR'],
    });
    expect(entry.safetyScore).toBe(3);
  });
});
