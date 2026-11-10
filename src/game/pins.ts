/**
 * The twelve pins of the northern lake map. Thresholds rise with the season, so
 * the first pin is always reachable and the last one demands real ice.
 */
import {PIN_COUNT} from '../constants/config';
import type {GearKey} from './entryModel';

export type Pin = {
  index: number;
  name: string;
  short: string;
  requiredIceCm: number;
  requiredGear: GearKey[];
};

const NAMES: Array<[string, string]> = [
  ['BIRCH BAY', 'BIRCH'],
  ['NORTH SHOAL', 'SHOAL'],
  ['BLACK CHANNEL', 'CHANNEL'],
  ['OTTER REEF', 'OTTER'],
  ['PINE NARROWS', 'PINE'],
  ['COLD SPRING', 'SPRING'],
  ['GRANITE POINT', 'GRANITE'],
  ['LANTERN COVE', 'LANTERN'],
  ['DEEP TROUGH', 'TROUGH'],
  ['WIND FLATS', 'FLATS'],
  ['OLD WEIR', 'WEIR'],
  ['NORTH END', 'NORTH END'],
];

const THRESHOLDS = [8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 22, 24];

const GEAR_RULES: GearKey[][] = [
  ['AUGER'],
  ['AUGER'],
  ['AUGER', 'ROPE'],
  ['AUGER', 'ROPE'],
  ['AUGER', 'ROPE'],
  ['AUGER', 'SPIKES'],
  ['AUGER', 'ROPE', 'SPIKES'],
  ['AUGER', 'ROPE', 'SPIKES'],
  ['AUGER', 'ROPE', 'SPIKES'],
  ['AUGER', 'ROPE', 'SPIKES'],
  ['AUGER', 'ROPE', 'SPIKES'],
  ['AUGER', 'ROPE', 'SPIKES'],
];

/** Built once, lazily, on first use — nothing heavy runs at module load. */
let cache: Pin[] | null = null;

export function allPins(): Pin[] {
  if (cache) {
    return cache;
  }
  const out: Pin[] = [];
  for (let i = 0; i < PIN_COUNT; i++) {
    out.push({
      index: i,
      name: NAMES[i][0],
      short: NAMES[i][1],
      requiredIceCm: THRESHOLDS[i],
      requiredGear: GEAR_RULES[i],
    });
  }
  cache = out;
  return out;
}

export function pinAt(index: number): Pin {
  const pins = allPins();
  return pins[Math.max(0, Math.min(pins.length - 1, index))];
}

/** The next pin still locked, or null when the season is complete. */
export function nextLockedPin(unlocked: number): Pin | null {
  if (unlocked >= PIN_COUNT) {
    return null;
  }
  return pinAt(unlocked);
}

export function canUnlock(
  pin: Pin,
  lastIceCm: number,
  checklistDone: number,
  checklistTotal: number,
): boolean {
  return lastIceCm >= pin.requiredIceCm && checklistDone >= checklistTotal;
}
