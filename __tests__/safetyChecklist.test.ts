import {CHECKLIST_ROWS} from '../src/constants/config';
import {
  FALLBACK_CHECKLIST,
  checklistComplete,
  doneCount,
  generateChecklist,
  isSolvable,
} from '../src/game/checklist';

describe('safety checklist', () => {
  it('always generates seven solvable rows', () => {
    for (let seed = 0; seed < 40; seed++) {
      const rows = generateChecklist(seed * 1013);
      expect(rows).toHaveLength(CHECKLIST_ROWS);
      expect(isSolvable(rows)).toBe(true);
    }
  });

  it('is deterministic for a given seed', () => {
    const a = generateChecklist(4242).map(r => r.id);
    const b = generateChecklist(4242).map(r => r.id);
    expect(a).toEqual(b);
  });

  it('produces different lists for different seeds', () => {
    const a = generateChecklist(1).map(r => r.id).join();
    const b = generateChecklist(999331).map(r => r.id).join();
    expect(a).not.toEqual(b);
  });

  it('keeps a solvable hardcoded fallback', () => {
    expect(isSolvable(FALLBACK_CHECKLIST)).toBe(true);
  });

  it('only completes at seven of seven', () => {
    const six = new Array(CHECKLIST_ROWS).fill(true);
    six[3] = false;
    expect(doneCount(six)).toBe(6);
    expect(checklistComplete(six)).toBe(false);
    expect(checklistComplete(new Array(CHECKLIST_ROWS).fill(true))).toBe(true);
  });
});
