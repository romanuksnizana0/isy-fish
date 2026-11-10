/**
 * One brief per calendar day. The seed uses the day index only, so the brief is
 * stable from the first open of the day to the last.
 */
import {STREAK_WINDOW} from '../constants/config';
import type {LedgerEntry, WeatherKey} from './entryModel';
import {WEATHER_KEYS, totalCatch} from './entryModel';
import {mulberry32, pick, randInt} from './rng';

export type ObjectiveKind = 'thickIce' | 'twoSpecies' | 'fullCheck' | 'safeGear';

export type DailyBrief = {
  dayIndex: number;
  weather: WeatherKey;
  tempC: number;
  kind: ObjectiveKind;
  /** Target value the objective is measured against. */
  target: number;
  label: string;
  reward: string;
};

const MS_PER_DAY = 86400000;

/** Days since the epoch, in local time. */
export function dayIndexOf(date: Date): number {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor(local.getTime() / MS_PER_DAY);
}

export function todayIndex(): number {
  return dayIndexOf(new Date());
}

export function briefFor(dayIndex: number): DailyBrief {
  const rnd = mulberry32((dayIndex * 2654435761) >>> 0);
  const weather = pick(rnd, WEATHER_KEYS);
  const tempC = randInt(rnd, -24, 1);
  const kinds: ObjectiveKind[] = ['thickIce', 'twoSpecies', 'fullCheck', 'safeGear'];
  const kind = pick(rnd, kinds);
  if (kind === 'thickIce') {
    const target = randInt(rnd, 7, 11) * 2; // 14..22 cm, on the 2 cm grid
    return {
      dayIndex,
      weather,
      tempC,
      kind,
      target,
      label: 'LOG AN ENTRY AT ' + target + 'CM OR THICKER',
      reward: '+1 SAFE STREAK',
    };
  }
  if (kind === 'twoSpecies') {
    return {
      dayIndex,
      weather,
      tempC,
      kind,
      target: 2,
      label: 'CATCH TWO DIFFERENT SPECIES',
      reward: 'COLLECTION HINT',
    };
  }
  if (kind === 'fullCheck') {
    return {
      dayIndex,
      weather,
      tempC,
      kind,
      target: 7,
      label: 'COMPLETE A 7/7 SAFETY CHECK',
      reward: 'UNLOCK HINT',
    };
  }
  return {
    dayIndex,
    weather,
    tempC,
    kind,
    target: 3,
    label: 'CARRY ALL THREE SAFETY ITEMS',
    reward: '+1 SAFE STREAK',
  };
}

/** Does this committed entry satisfy the day's objective? */
export function satisfiesBrief(brief: DailyBrief, entry: LedgerEntry): boolean {
  if (brief.kind === 'thickIce') {
    return entry.iceCm >= brief.target;
  }
  if (brief.kind === 'twoSpecies') {
    return entry.catch.filter(n => n > 0).length >= brief.target;
  }
  if (brief.kind === 'safeGear') {
    return entry.safetyScore >= brief.target;
  }
  return false; // fullCheck is ticked by ChallengeScreen, not by an entry
}

export function hasCatch(entry: LedgerEntry): boolean {
  return totalCatch(entry.catch) > 0;
}

/**
 * The seven-cell streak strip: one flag per day ending today. `completed` holds
 * the day indices that were ticked.
 */
export function streakWindow(
  completed: readonly number[],
  today: number,
): boolean[] {
  const out: boolean[] = [];
  for (let i = STREAK_WINDOW - 1; i >= 0; i--) {
    out.push(completed.indexOf(today - i) >= 0);
  }
  return out;
}

/** Consecutive completed days ending today (or yesterday, if today is still open). */
export function dailyStreak(completed: readonly number[], today: number): number {
  let streak = 0;
  let cursor = completed.indexOf(today) >= 0 ? today : today - 1;
  while (completed.indexOf(cursor) >= 0) {
    streak += 1;
    cursor -= 1;
  }
  return streak;
}
