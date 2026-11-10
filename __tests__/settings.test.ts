/**
 * The five Settings options, each checked through the one place that owns them.
 * Pure logic: the store plus the formatters, no React and no native modules.
 */
import {
  commitDraft,
  freshDraft,
  getState,
  resetForTests,
  resetSeason,
  unlockNextPin,
  updateSettings,
} from '../src/game/ledgerStore';
import {isSafe} from '../src/game/entryModel';
import {formatThickness, formatThicknessShort} from '../src/utils/format';
import {
  SAFE_THRESHOLD_DEFAULT_CM,
  SAFE_THRESHOLD_MAX_CM,
  SAFE_THRESHOLD_MIN_CM,
} from '../src/constants/config';

describe('settings', () => {
  beforeEach(() => {
    resetForTests();
  });

  it('starts on centimetres with the default safe threshold', () => {
    const s = getState().settings;
    expect(s.units).toBe('cm');
    expect(s.safeThresholdCm).toBe(SAFE_THRESHOLD_DEFAULT_CM);
    expect(s.highContrast).toBe(false);
    expect(s.reducedMotion).toBe(false);
  });

  it('units change every thickness readout', () => {
    expect(formatThickness(18, 'cm')).toBe('18 CM');
    expect(formatThicknessShort(18, 'cm')).toBe('18CM');

    updateSettings({units: 'in'});
    const units = getState().settings.units;
    expect(units).toBe('in');
    expect(formatThickness(18, units)).toBe('7.1 IN');
    expect(formatThicknessShort(18, units)).toBe('7.1IN');
  });

  it('the safe threshold flips the verdict for the same reading', () => {
    updateSettings({safeThresholdCm: 10});
    expect(isSafe(12, getState().settings.safeThresholdCm)).toBe(true);

    updateSettings({safeThresholdCm: 16});
    expect(isSafe(12, getState().settings.safeThresholdCm)).toBe(false);
  });

  it('the threshold bounds leave room for the first pin', () => {
    expect(SAFE_THRESHOLD_MIN_CM).toBeLessThan(SAFE_THRESHOLD_DEFAULT_CM);
    expect(SAFE_THRESHOLD_MAX_CM).toBeGreaterThan(SAFE_THRESHOLD_DEFAULT_CM);
  });

  it('the threshold decides the outcome a committed entry gets', () => {
    updateSettings({safeThresholdCm: 20});
    const thin = commitDraft({...freshDraft(5, null), iceCm: 14});
    expect(thin.outcome).toBe('unsafe');

    resetForTests();
    updateSettings({safeThresholdCm: 10});
    const thick = commitDraft({...freshDraft(5, null), iceCm: 14});
    expect(thick.outcome).toBe('logged');
  });

  it('the accessibility switches are persisted in the store', () => {
    updateSettings({highContrast: true});
    expect(getState().settings.highContrast).toBe(true);

    updateSettings({reducedMotion: true});
    expect(getState().settings.reducedMotion).toBe(true);
    // One option never clobbers another.
    expect(getState().settings.highContrast).toBe(true);
  });

  it('resetting the season clears progress but keeps the options', () => {
    updateSettings({units: 'in', safeThresholdCm: 9, highContrast: true});
    commitDraft({...freshDraft(1, null), iceCm: 20, catch: [1, 0, 0, 0, 0]});
    unlockNextPin();
    expect(getState().entries.length).toBe(1);
    expect(getState().unlockedPins).toBe(1);

    resetSeason();

    const after = getState();
    expect(after.entries).toHaveLength(0);
    expect(after.unlockedPins).toBe(0);
    expect(after.safeStreak).toBe(0);
    expect(after.collection.every(r => !r.discovered)).toBe(true);
    expect(after.settings.units).toBe('in');
    expect(after.settings.safeThresholdCm).toBe(9);
    expect(after.settings.highContrast).toBe(true);
  });
});
