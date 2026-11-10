/**
 * The ledger entry: what one expedition records, and the pure maths derived
 * from it. No React, no storage, no native modules — all of this is unit tested.
 */
import {
  ICE_MAX_CM,
  ICE_STEP_CM,
  SPECIES_COUNT,
  TEMP_MAX_C,
  TEMP_MIN_C,
} from '../constants/config';

export type WeatherKey =
  | 'CLEAR'
  | 'OVERCAST'
  | 'SNOW'
  | 'WIND'
  | 'THAW'
  | 'NIGHT';

export type GearKey =
  | 'AUGER'
  | 'ROPE'
  | 'SPIKES'
  | 'SONAR'
  | 'TIP-UPS'
  | 'SHELTER';

export type NoteTag = 'MORNING BITE' | 'DEEP HOLE' | 'LIGHT TACKLE' | 'SLOW DAY';

export type EntryOutcome = 'logged' | 'unsafe' | 'aborted';

export const WEATHER_KEYS: WeatherKey[] = [
  'CLEAR',
  'OVERCAST',
  'SNOW',
  'WIND',
  'THAW',
  'NIGHT',
];

export const GEAR_KEYS: GearKey[] = [
  'AUGER',
  'ROPE',
  'SPIKES',
  'SONAR',
  'TIP-UPS',
  'SHELTER',
];

/** The three items that actually keep a person alive on thin ice. */
export const SAFETY_GEAR: GearKey[] = ['AUGER', 'ROPE', 'SPIKES'];

export const NOTE_TAGS: NoteTag[] = [
  'MORNING BITE',
  'DEEP HOLE',
  'LIGHT TACKLE',
  'SLOW DAY',
];

export const SPECIES_NAMES = [
  'PIKE',
  'PERCH',
  'TROUT',
  'BURBOT',
  'WHITEFISH',
] as const;

export type Draft = {
  iceCm: number;
  weather: WeatherKey;
  tempC: number;
  gear: GearKey[];
  /** catch[i] = how many of species i (0-based, matches sprite_{i+1}). */
  catch: number[];
  tags: NoteTag[];
  seed: number;
  objective: string | null;
};

export type LedgerEntry = Draft & {
  id: string;
  dayIndex: number;
  outcome: EntryOutcome;
  safetyScore: number;
  safe: boolean;
};

export function emptyCatch(): number[] {
  return new Array(SPECIES_COUNT).fill(0);
}

/** Clamp a drill reading onto the 0..40 cm grid in 2 cm steps. */
export function clampIce(cm: number): number {
  const stepped = Math.round(cm / ICE_STEP_CM) * ICE_STEP_CM;
  return Math.max(0, Math.min(ICE_MAX_CM, stepped));
}

export function clampTemp(c: number): number {
  return Math.max(TEMP_MIN_C, Math.min(TEMP_MAX_C, Math.round(c)));
}

/** 0..3 — how many of the three safety items are in the sled. */
export function safetyScore(gear: readonly GearKey[]): number {
  return SAFETY_GEAR.filter(k => gear.indexOf(k) >= 0).length;
}

/**
 * Day confidence 0..1. Thick ice and calm weather raise it; a thaw or a gale
 * cuts it hard. Used by the Daily brief and the Report headline copy.
 */
export function confidence(
  iceCm: number,
  weather: WeatherKey,
  tempC: number,
  gear: readonly GearKey[],
): number {
  const icePart = Math.min(1, iceCm / 24) * 0.5;
  const weatherPart =
    weather === 'THAW' ? 0 : weather === 'WIND' ? 0.08 : weather === 'NIGHT' ? 0.1 : 0.2;
  const tempPart = tempC > 0 ? 0 : Math.min(0.15, Math.abs(tempC) / 100);
  const gearPart = (safetyScore(gear) / 3) * 0.15;
  return Math.max(0, Math.min(1, icePart + weatherPart + tempPart + gearPart));
}

export function totalCatch(counts: readonly number[]): number {
  return counts.reduce((a, b) => a + b, 0);
}

export function isSafe(iceCm: number, thresholdCm: number): boolean {
  return iceCm >= thresholdCm;
}

/**
 * A blank entry cannot be committed: without a drill reading, a catch or a note
 * tag there is nothing to record. SAVE ENTRY is visibly disabled until then.
 */
export function canCommit(draft: Draft): boolean {
  return draft.iceCm > 0 || totalCatch(draft.catch) > 0 || draft.tags.length > 0;
}

/** The themed reason a commit is refused — shown instead of a silent dead button. */
export function blockedReason(draft: Draft): string | null {
  if (canCommit(draft)) {
    return null;
  }
  return 'ADD AN ICE READING, A CATCH OR THE SLOW DAY TAG';
}

export function outcomeOf(draft: Draft, thresholdCm: number): EntryOutcome {
  return isSafe(draft.iceCm, thresholdCm) ? 'logged' : 'unsafe';
}

/** The headline the Report prints — the app's own words, never "You win". */
export function outcomeHeadline(outcome: EntryOutcome): string {
  if (outcome === 'aborted') {
    return 'RUN ABORTED';
  }
  if (outcome === 'unsafe') {
    return 'UNSAFE - NO ENTRY';
  }
  return 'ENTRY LOGGED';
}

let entryCounter = 0;

export function commitEntry(
  draft: Draft,
  dayIndex: number,
  thresholdCm: number,
  outcome?: EntryOutcome,
): LedgerEntry {
  entryCounter += 1;
  const finalOutcome = outcome ?? outcomeOf(draft, thresholdCm);
  return {
    ...draft,
    gear: draft.gear.slice(),
    catch: draft.catch.slice(),
    tags: draft.tags.slice(),
    id: 'e' + dayIndex + '-' + entryCounter,
    dayIndex,
    outcome: finalOutcome,
    safetyScore: safetyScore(draft.gear),
    safe: isSafe(draft.iceCm, thresholdCm),
  };
}
