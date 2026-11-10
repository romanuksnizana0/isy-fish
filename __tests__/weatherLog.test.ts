import {WEATHER_KEYS, confidence} from '../src/game/entryModel';

describe('weather log', () => {
  it('offers exactly six distinct conditions', () => {
    expect(WEATHER_KEYS).toHaveLength(6);
    expect(new Set(WEATHER_KEYS).size).toBe(6);
  });

  it('drops the day confidence on a thaw', () => {
    const clear = confidence(20, 'CLEAR', -10, ['AUGER', 'ROPE', 'SPIKES']);
    const thaw = confidence(20, 'THAW', -10, ['AUGER', 'ROPE', 'SPIKES']);
    expect(thaw).toBeLessThan(clear);
  });

  it('rewards thicker ice and full safety gear', () => {
    const thin = confidence(4, 'CLEAR', -10, []);
    const thick = confidence(30, 'CLEAR', -10, ['AUGER', 'ROPE', 'SPIKES']);
    expect(thick).toBeGreaterThan(thin);
    expect(thick).toBeLessThanOrEqual(1);
    expect(thin).toBeGreaterThanOrEqual(0);
  });

  it('treats above-zero days as no help at all', () => {
    const below = confidence(16, 'CLEAR', -12, []);
    const above = confidence(16, 'CLEAR', 3, []);
    expect(above).toBeLessThan(below);
  });
});
