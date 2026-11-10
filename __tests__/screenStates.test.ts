/**
 * Initial, empty, blocked and finished states. Every refusal has to name its
 * reason, every zero-value readout has to fall back to a themed line or a dash,
 * and nothing is ever allowed to dead-end.
 */
import {
  averageIceCm,
  bestCatchCount,
  commitDraft,
  currentDailyStreak,
  freshDraft,
  getState,
  lastIceCm,
  recentIce,
  resetForTests,
  speciesFound,
  unlockNextPin,
  updateSettings,
} from '../src/game/ledgerStore';
import {blockedReason, canCommit, outcomeHeadline} from '../src/game/entryModel';
import {canUnlock, nextLockedPin, pinAt} from '../src/game/pins';
import {checklistComplete, doneCount} from '../src/game/checklist';
import {dashIfZero, formatThicknessShort} from '../src/utils/format';
import {CHECKLIST_ROWS, PIN_COUNT, SPARKLINE_WINDOW} from '../src/constants/config';

describe('screen states', () => {
  beforeEach(() => {
    resetForTests();
  });

  it('the initial season reports zero everywhere instead of stale data', () => {
    const s = getState();
    expect(s.entries).toHaveLength(0);
    expect(speciesFound(s)).toBe(0);
    expect(lastIceCm(s)).toBe(0);
    expect(averageIceCm(s)).toBe(0);
    expect(bestCatchCount(s)).toBe(0);
    expect(currentDailyStreak(s)).toBe(0);
    expect(recentIce(s)).toHaveLength(0);
  });

  it('a blank entry is refused with a reason, not a silent dead button', () => {
    const blank = freshDraft(1, null);
    expect(canCommit(blank)).toBe(false);
    expect(blockedReason(blank)).toBeTruthy();
    expect(blockedReason(blank)).toContain('SLOW DAY');
  });

  it('any one of the three inputs is enough to commit', () => {
    const base = freshDraft(1, null);
    expect(canCommit({...base, iceCm: 12})).toBe(true);
    expect(canCommit({...base, catch: [0, 1, 0, 0, 0]})).toBe(true);
    expect(canCommit({...base, tags: ['SLOW DAY']})).toBe(true);
    expect(blockedReason({...base, iceCm: 12})).toBeNull();
  });

  it('every outcome has a headline in the app own words', () => {
    expect(outcomeHeadline('logged')).toBe('ENTRY LOGGED');
    expect(outcomeHeadline('unsafe')).toBe('UNSAFE - NO ENTRY');
    expect(outcomeHeadline('aborted')).toBe('RUN ABORTED');
    for (const outcome of ['logged', 'unsafe', 'aborted'] as const) {
      expect(outcomeHeadline(outcome).toLowerCase()).not.toContain('you win');
      expect(outcomeHeadline(outcome).toLowerCase()).not.toContain('game over');
    }
  });

  it('an unset readout prints a dash rather than an empty box', () => {
    expect(dashIfZero(0, '18CM')).toBe('-');
    expect(dashIfZero(18, formatThicknessShort(18, 'cm'))).toBe('18CM');
  });

  it('the pin gate blocks on thin ice and explains what is missing', () => {
    const pin = pinAt(0);
    expect(canUnlock(pin, 0, CHECKLIST_ROWS, CHECKLIST_ROWS)).toBe(false);
    expect(canUnlock(pin, pin.requiredIceCm, 3, CHECKLIST_ROWS)).toBe(false);
    expect(
      canUnlock(pin, pin.requiredIceCm, CHECKLIST_ROWS, CHECKLIST_ROWS),
    ).toBe(true);
  });

  it('an incomplete checklist is never counted as complete', () => {
    const partial = new Array(CHECKLIST_ROWS).fill(false);
    partial[0] = true;
    expect(doneCount(partial)).toBe(1);
    expect(checklistComplete(partial)).toBe(false);
    expect(checklistComplete(new Array(CHECKLIST_ROWS).fill(true))).toBe(true);
  });

  it('the finished season has no next pin left to offer', () => {
    for (let i = 0; i < PIN_COUNT; i++) {
      expect(nextLockedPin(getState().unlockedPins)).not.toBeNull();
      unlockNextPin();
    }
    expect(getState().unlockedPins).toBe(PIN_COUNT);
    expect(nextLockedPin(getState().unlockedPins)).toBeNull();
    // Nothing throws and nothing advances past the end of the map.
    expect(unlockNextPin()).toBeNull();
    expect(getState().unlockedPins).toBe(PIN_COUNT);
  });

  it('the trend keeps at most one window of readings', () => {
    updateSettings({safeThresholdCm: 8});
    for (let i = 0; i < SPARKLINE_WINDOW + 3; i++) {
      commitDraft({...freshDraft(i, null), iceCm: 10 + i * 2});
    }
    const trend = recentIce(getState());
    expect(trend).toHaveLength(SPARKLINE_WINDOW);
    expect(trend[trend.length - 1]).toBe(10 + (SPARKLINE_WINDOW + 2) * 2);
  });

  it('an aborted run leaves the season log untouched', () => {
    commitDraft({...freshDraft(1, null), iceCm: 18}, 'aborted');
    expect(getState().entries).toHaveLength(0);
    expect(getState().lastOutcome).toBe('aborted');
    expect(getState().lastDiscovered).toHaveLength(0);
  });
});
