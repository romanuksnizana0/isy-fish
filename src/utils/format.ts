/**
 * Display formatting. Thickness is stored in centimetres everywhere; inches
 * exist only at the edge, when a reading is printed.
 */
import type {Units} from '../game/ledgerStore';

export const CM_PER_INCH = 2.54;

export function toUnits(cm: number, units: Units): number {
  return units === 'in' ? Math.round((cm / CM_PER_INCH) * 10) / 10 : cm;
}

export function unitLabel(units: Units): string {
  return units === 'in' ? 'IN' : 'CM';
}

/** "18 CM" / "7.1 IN" — one decimal in inches, none in centimetres. */
export function formatThickness(cm: number, units: Units): string {
  const value = toUnits(cm, units);
  const text = units === 'in' ? value.toFixed(1) : String(Math.round(value));
  return text + ' ' + unitLabel(units);
}

/** Compact form for stat strips: "18CM". */
export function formatThicknessShort(cm: number, units: Units): string {
  const value = toUnits(cm, units);
  const text = units === 'in' ? value.toFixed(1) : String(Math.round(value));
  return text + unitLabel(units);
}

/** Temperature with a plain ASCII minus so Roboto never has to guess. */
export function formatTemp(tempC: number): string {
  const rounded = Math.round(tempC);
  return (rounded > 0 ? '+' : '') + rounded + 'C';
}

const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

/** Day index back to a short human date, e.g. "14 FEB". */
export function formatDay(dayIndex: number): string {
  const date = new Date(dayIndex * 86400000);
  return date.getUTCDate() + ' ' + MONTHS[date.getUTCMonth()];
}

/** Values the strip has no reading for print a dash, never an empty box. */
export function dashIfZero(value: number, text: string): string {
  return value > 0 ? text : '-';
}

export function pct(part: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(1, part / total));
}
