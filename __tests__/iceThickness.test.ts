import {ICE_MAX_CM, ICE_STEP_CM} from '../src/constants/config';
import {clampIce, clampTemp, isSafe} from '../src/game/entryModel';

describe('ice thickness', () => {
  it('snaps every reading onto the 2 cm grid', () => {
    expect(clampIce(0)).toBe(0);
    expect(clampIce(1)).toBe(2);
    expect(clampIce(17)).toBe(18);
    expect(clampIce(ICE_MAX_CM)).toBe(ICE_MAX_CM);
    expect(clampIce(9) % ICE_STEP_CM).toBe(0);
  });

  it('never leaves the 0..40 range', () => {
    expect(clampIce(-12)).toBe(0);
    expect(clampIce(999)).toBe(ICE_MAX_CM);
  });

  it('flips the verdict exactly at the threshold', () => {
    expect(isSafe(11, 12)).toBe(false);
    expect(isSafe(12, 12)).toBe(true);
    expect(isSafe(40, 12)).toBe(true);
  });

  it('clamps the temperature to the field range', () => {
    expect(clampTemp(-99)).toBe(-30);
    expect(clampTemp(99)).toBe(5);
    expect(clampTemp(-7.4)).toBe(-7);
  });
});
