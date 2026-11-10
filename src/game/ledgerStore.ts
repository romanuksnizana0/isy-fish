/**
 * The single repository. Every write in the app goes through here; screens and
 * components never mutate each other's state. The store is a module singleton
 * with a hydrate()/persist() seam so the backing store can be swapped without
 * touching UI code — the default adapter keeps the season in memory, which is
 * all an offline, no-dependency build needs.
 */
import {PIN_COUNT, SAFE_THRESHOLD_DEFAULT_CM, SPARKLINE_WINDOW} from '../constants/config';
import type {Draft, EntryOutcome, LedgerEntry} from './entryModel';
import {
  commitEntry as buildEntry,
  emptyCatch,
  isSafe,
  totalCatch,
} from './entryModel';
import type {SpeciesRecord} from './collection';
import {applyEntry, discoveredCount, emptyCollection} from './collection';
import {pinAt} from './pins';
import {briefFor, dailyStreak, satisfiesBrief, todayIndex} from './daily';

export type Units = 'cm' | 'in';

export type Settings = {
  units: Units;
  safeThresholdCm: number;
  highContrast: boolean;
  reducedMotion: boolean;
};

export type LedgerState = {
  entries: LedgerEntry[];
  unlockedPins: number;
  collection: SpeciesRecord[];
  safeStreak: number;
  bestSafeStreak: number;
  completedDays: number[];
  settings: Settings;
  attempt: number;
  lastEntry: LedgerEntry | null;
  lastOutcome: EntryOutcome | null;
  lastDiscovered: number[];
  lastPinName: string | null;
};

export type StorageAdapter = {
  read: () => string | null;
  write: (raw: string) => void;
};

function initialState(): LedgerState {
  return {
    entries: [],
    unlockedPins: 0,
    collection: emptyCollection(),
    safeStreak: 0,
    bestSafeStreak: 0,
    completedDays: [],
    settings: {
      units: 'cm',
      safeThresholdCm: SAFE_THRESHOLD_DEFAULT_CM,
      highContrast: false,
      reducedMotion: false,
    },
    attempt: 0,
    lastEntry: null,
    lastOutcome: null,
    lastDiscovered: [],
    lastPinName: null,
  };
}

let state: LedgerState = initialState();
const listeners = new Set<() => void>();

let memory: string | null = null;
let storage: StorageAdapter = {
  read: () => memory,
  write: (raw: string) => {
    memory = raw;
  },
};

function emit(): void {
  listeners.forEach(fn => fn());
}

function set(patch: Partial<LedgerState>): void {
  state = {...state, ...patch};
  persist();
  emit();
}

/* ---- public store surface ---------------------------------------------- */

export function getState(): LedgerState {
  return state;
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Swap the backing store (tests, or a native module added later). */
export function setStorage(adapter: StorageAdapter): void {
  storage = adapter;
}

export function persist(): void {
  try {
    storage.write(
      JSON.stringify({
        entries: state.entries,
        unlockedPins: state.unlockedPins,
        collection: state.collection,
        safeStreak: state.safeStreak,
        bestSafeStreak: state.bestSafeStreak,
        completedDays: state.completedDays,
        settings: state.settings,
      }),
    );
  } catch (err) {
    // A failed write must never take the app down — the season simply stays
    // in memory for this run.
  }
}

export function hydrate(): void {
  try {
    const raw = storage.read();
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw);
    state = {
      ...state,
      entries: parsed.entries || [],
      unlockedPins: parsed.unlockedPins || 0,
      collection: parsed.collection || emptyCollection(),
      safeStreak: parsed.safeStreak || 0,
      bestSafeStreak: parsed.bestSafeStreak || 0,
      completedDays: parsed.completedDays || [],
      settings: {...state.settings, ...(parsed.settings || {})},
    };
    emit();
  } catch (err) {
    // Corrupt payload: keep the clean initial season rather than crash.
  }
}

/** Test seam — restores the pristine season without touching storage. */
export function resetForTests(): void {
  state = initialState();
  memory = null;
  emit();
}

/* ---- actions ------------------------------------------------------------ */

export function newAttempt(): number {
  const attempt = state.attempt + 1;
  set({attempt});
  return attempt;
}

export function updateSettings(patch: Partial<Settings>): void {
  set({settings: {...state.settings, ...patch}});
}

export function commitDraft(draft: Draft, outcome?: EntryOutcome): LedgerEntry {
  const threshold = state.settings.safeThresholdCm;
  const day = todayIndex();
  const entry = buildEntry(draft, day, threshold, outcome);
  if (entry.outcome === 'aborted') {
    set({lastEntry: entry, lastOutcome: 'aborted', lastDiscovered: []});
    return entry;
  }
  const pin = state.unlockedPins > 0 ? pinAt(state.unlockedPins - 1).name : null;
  const applied = applyEntry(state.collection, entry, pin);
  const safe = isSafe(entry.iceCm, threshold);
  const safeStreak = safe ? state.safeStreak + 1 : 0;
  const brief = briefFor(day);
  const ticksToday =
    satisfiesBrief(brief, entry) && state.completedDays.indexOf(day) < 0;
  set({
    entries: state.entries.concat(entry),
    collection: applied.collection,
    safeStreak,
    bestSafeStreak: Math.max(state.bestSafeStreak, safeStreak),
    completedDays: ticksToday
      ? state.completedDays.concat(day)
      : state.completedDays,
    lastEntry: entry,
    lastOutcome: entry.outcome,
    lastDiscovered: applied.discovered,
  });
  return entry;
}

export function unlockNextPin(): string | null {
  if (state.unlockedPins >= PIN_COUNT) {
    return null;
  }
  const pin = pinAt(state.unlockedPins);
  const day = todayIndex();
  const brief = briefFor(day);
  // A 7/7 check is the one objective an entry cannot satisfy on its own.
  const ticksToday =
    brief.kind === 'fullCheck' && state.completedDays.indexOf(day) < 0;
  set({
    unlockedPins: state.unlockedPins + 1,
    lastPinName: pin.name,
    completedDays: ticksToday
      ? state.completedDays.concat(day)
      : state.completedDays,
  });
  return pin.name;
}

export function tickDaily(dayIndex: number): void {
  if (state.completedDays.indexOf(dayIndex) >= 0) {
    return;
  }
  set({completedDays: state.completedDays.concat(dayIndex)});
}

export function resetSeason(): void {
  const settings = state.settings;
  state = {...initialState(), settings};
  persist();
  emit();
}

/* ---- derived selectors (cheap, pure) ------------------------------------ */

export function lastIceCm(s: LedgerState): number {
  if (s.entries.length === 0) {
    return 0;
  }
  return s.entries[s.entries.length - 1].iceCm;
}

export function averageIceCm(s: LedgerState): number {
  if (s.entries.length === 0) {
    return 0;
  }
  const sum = s.entries.reduce((a, e) => a + e.iceCm, 0);
  return Math.round((sum / s.entries.length) * 10) / 10;
}

export function bestCatchCount(s: LedgerState): number {
  return s.entries.reduce((best, e) => Math.max(best, totalCatch(e.catch)), 0);
}

export function recentIce(s: LedgerState): number[] {
  return s.entries.slice(-SPARKLINE_WINDOW).map(e => e.iceCm);
}

export function speciesFound(s: LedgerState): number {
  return discoveredCount(s.collection);
}

export function currentDailyStreak(s: LedgerState): number {
  return dailyStreak(s.completedDays, todayIndex());
}

export function freshDraft(seed: number, objective: string | null): Draft {
  return {
    iceCm: 0,
    weather: 'CLEAR',
    tempC: -8,
    gear: [],
    catch: emptyCatch(),
    tags: [],
    seed,
    objective,
  };
}
