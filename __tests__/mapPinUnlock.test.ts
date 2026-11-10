import {PIN_COUNT} from '../src/constants/config';
import {allPins, canUnlock, nextLockedPin, pinAt} from '../src/game/pins';
import {getState, resetForTests, unlockNextPin} from '../src/game/ledgerStore';

describe('map pins', () => {
  beforeEach(() => {
    resetForTests();
  });

  it('has twelve pins with rising thresholds', () => {
    const pins = allPins();
    expect(pins).toHaveLength(PIN_COUNT);
    for (let i = 1; i < pins.length; i++) {
      expect(pins[i].requiredIceCm).toBeGreaterThanOrEqual(
        pins[i - 1].requiredIceCm,
      );
    }
  });

  it('always offers a reachable first pin', () => {
    expect(pinAt(0).requiredIceCm).toBeLessThanOrEqual(10);
    expect(nextLockedPin(0)).not.toBeNull();
    expect(nextLockedPin(PIN_COUNT)).toBeNull();
  });

  it('refuses an unlock on thin ice or an unfinished list', () => {
    const pin = pinAt(0);
    expect(canUnlock(pin, pin.requiredIceCm - 2, 7, 7)).toBe(false);
    expect(canUnlock(pin, pin.requiredIceCm, 6, 7)).toBe(false);
    expect(canUnlock(pin, pin.requiredIceCm, 7, 7)).toBe(true);
  });

  it('advances the map by one and then stops at twelve', () => {
    expect(unlockNextPin()).toBe(pinAt(0).name);
    expect(getState().unlockedPins).toBe(1);
    for (let i = 1; i < PIN_COUNT; i++) {
      unlockNextPin();
    }
    expect(getState().unlockedPins).toBe(PIN_COUNT);
    expect(unlockNextPin()).toBeNull();
    expect(getState().unlockedPins).toBe(PIN_COUNT);
  });
});
