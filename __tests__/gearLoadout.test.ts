import {GEAR_KEYS, SAFETY_GEAR, safetyScore} from '../src/game/entryModel';

describe('gear loadout', () => {
  it('offers six items, three of which are safety gear', () => {
    expect(GEAR_KEYS).toHaveLength(6);
    expect(SAFETY_GEAR).toHaveLength(3);
    SAFETY_GEAR.forEach(key => {
      expect(GEAR_KEYS).toContain(key);
    });
  });

  it('counts only the safety items', () => {
    expect(safetyScore([])).toBe(0);
    expect(safetyScore(['SONAR', 'SHELTER', 'TIP-UPS'])).toBe(0);
    expect(safetyScore(['ROPE'])).toBe(1);
    expect(safetyScore(['ROPE', 'SPIKES', 'AUGER', 'SONAR'])).toBe(3);
  });

  it('never exceeds three', () => {
    expect(safetyScore(GEAR_KEYS)).toBe(3);
  });
});
