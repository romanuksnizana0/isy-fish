/**
 * The four persisted settings, pulled one at a time so a units change does not
 * re-render screens that only care about motion.
 */
import type {Settings, Units} from '../game/ledgerStore';
import {getState, updateSettings} from '../game/ledgerStore';
import {useLedger} from './useLedger';

export function useSettings(): Settings {
  return useLedger(s => s.settings);
}

export function useUnits(): Units {
  return useLedger(s => s.settings.units);
}

export function useSafeThreshold(): number {
  return useLedger(s => s.settings.safeThresholdCm);
}

export function useHighContrast(): boolean {
  return useLedger(s => s.settings.highContrast);
}

export function useReducedMotion(): boolean {
  return useLedger(s => s.settings.reducedMotion);
}

export function setUnits(units: Units): void {
  updateSettings({units});
}

export function setSafeThreshold(cm: number): void {
  updateSettings({safeThresholdCm: cm});
}

export function toggleHighContrast(): void {
  updateSettings({highContrast: !getState().settings.highContrast});
}

export function toggleReducedMotion(): void {
  updateSettings({reducedMotion: !getState().settings.reducedMotion});
}
