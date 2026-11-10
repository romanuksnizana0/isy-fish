/**
 * The seven-row safe-expedition check. Rows are generated from the run seed, so
 * two visits offer a different list, and a generated list is only accepted when
 * every row is satisfiable with the gear the player can actually carry.
 */
import {CHECKLIST_ROWS} from '../constants/config';
import type {GearKey} from './entryModel';
import {GEAR_KEYS} from './entryModel';
import {mulberry32, shuffle} from './rng';

export type ChecklistRowSpec = {
  id: string;
  label: string;
  /** Gear this row depends on, if any. Rows without gear are always doable. */
  needs: GearKey | null;
};

const POOL: ChecklistRowSpec[] = [
  {id: 'drill', label: 'ICE DRILLED IN 3 SPOTS', needs: 'AUGER'},
  {id: 'rope', label: 'ROPE IN REACH', needs: 'ROPE'},
  {id: 'spikes', label: 'SPIKES WORN', needs: 'SPIKES'},
  {id: 'plan', label: 'TOLD SOMEONE THE PLAN', needs: null},
  {id: 'thaw', label: 'NO THAW IN 48H', needs: null},
  {id: 'light', label: 'DAYLIGHT MARGIN 2H', needs: null},
  {id: 'exit', label: 'EXIT ROUTE MARKED', needs: null},
  {id: 'sonar', label: 'DEPTH CHECKED ON SONAR', needs: 'SONAR'},
  {id: 'shelter', label: 'SHELTER PEGGED DOWN', needs: 'SHELTER'},
  {id: 'tipups', label: 'TIP-UPS SPACED APART', needs: 'TIP-UPS'},
  {id: 'edge', label: 'SHORE EDGE PROBED', needs: null},
  {id: 'buddy', label: 'BUDDY WITHIN SIGHT', needs: null},
];

/** The guarantee used when generation cannot produce a solvable list. */
export const FALLBACK_CHECKLIST: ChecklistRowSpec[] = [
  POOL[0],
  POOL[1],
  POOL[2],
  POOL[3],
  POOL[4],
  POOL[5],
  POOL[6],
];

/** Every gear row must name gear that exists in the sled loadout. */
export function isSolvable(rows: readonly ChecklistRowSpec[]): boolean {
  if (rows.length !== CHECKLIST_ROWS) {
    return false;
  }
  const ids: Record<string, boolean> = {};
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (ids[row.id]) {
      return false;
    }
    ids[row.id] = true;
    if (row.needs !== null && GEAR_KEYS.indexOf(row.needs) < 0) {
      return false;
    }
  }
  return true;
}

/**
 * Up to 20 attempts to draw a solvable seven-row list, then the hardcoded
 * fallback. The fallback is a guarantee, not the game.
 */
export function generateChecklist(seed: number): ChecklistRowSpec[] {
  for (let attempt = 0; attempt < 20; attempt++) {
    const rnd = mulberry32((seed + attempt * 7919) >>> 0);
    const rows = shuffle(rnd, POOL).slice(0, CHECKLIST_ROWS);
    if (isSolvable(rows)) {
      return rows;
    }
  }
  return FALLBACK_CHECKLIST.slice();
}

export function checklistComplete(done: readonly boolean[]): boolean {
  return done.length === CHECKLIST_ROWS && done.every(Boolean);
}

export function doneCount(done: readonly boolean[]): number {
  return done.filter(Boolean).length;
}
