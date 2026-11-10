/**
 * Species discovery. The five sprites are the five fish of the season; a
 * species joins the collection the first time one comes up through the hole.
 */
import {SPECIES_COUNT} from '../constants/config';
import type {LedgerEntry, WeatherKey} from './entryModel';
import {SPECIES_NAMES} from './entryModel';

export type SpeciesRecord = {
  index: number;
  name: string;
  count: number;
  discovered: boolean;
  firstDayIndex: number | null;
  firstPin: string | null;
  bestWeather: WeatherKey | null;
};

export function emptyCollection(): SpeciesRecord[] {
  const out: SpeciesRecord[] = [];
  for (let i = 0; i < SPECIES_COUNT; i++) {
    out.push({
      index: i,
      name: SPECIES_NAMES[i],
      count: 0,
      discovered: false,
      firstDayIndex: null,
      firstPin: null,
      bestWeather: null,
    });
  }
  return out;
}

/**
 * Fold one entry into the collection. Returns a new array plus the indices that
 * were discovered for the first time (the Report shows a NEW SPECIES badge).
 */
export function applyEntry(
  collection: readonly SpeciesRecord[],
  entry: LedgerEntry,
  pinName: string | null,
): {collection: SpeciesRecord[]; discovered: number[]} {
  const discovered: number[] = [];
  const next = collection.map(rec => {
    const caught = entry.catch[rec.index] || 0;
    if (caught <= 0) {
      return rec;
    }
    const isNew = !rec.discovered;
    if (isNew) {
      discovered.push(rec.index);
    }
    return {
      ...rec,
      count: rec.count + caught,
      discovered: true,
      firstDayIndex: rec.firstDayIndex === null ? entry.dayIndex : rec.firstDayIndex,
      firstPin: rec.firstPin === null ? pinName : rec.firstPin,
      bestWeather: rec.bestWeather === null ? entry.weather : rec.bestWeather,
    };
  });
  return {collection: next, discovered};
}

export function discoveredCount(collection: readonly SpeciesRecord[]): number {
  return collection.filter(r => r.discovered).length;
}
