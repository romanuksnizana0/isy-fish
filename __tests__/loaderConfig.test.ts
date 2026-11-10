/**
 * The splash contract. The hold is exactly 8000 ms, it is driven by a timer,
 * and the Loader is a brand card — no call to action, no tap-to-skip.
 */
import * as fs from 'fs';
import * as path from 'path';
import {
  LOADER_DURATION_MS,
  LOADER_FADE_MS,
  REDUCED_MOTION_MS,
  SCREEN_FADE_MS,
} from '../src/constants/config';

const LOADER = fs.readFileSync(
  path.join(__dirname, '..', 'src/screens/LoaderScreen.tsx'),
  'utf8',
);

describe('loader config', () => {
  it('holds for exactly 8000 ms', () => {
    expect(LOADER_DURATION_MS).toBe(8000);
  });

  it('is long enough for the capture window and never longer than the maximum', () => {
    expect(LOADER_DURATION_MS).toBeGreaterThanOrEqual(6000);
    expect(LOADER_DURATION_MS).toBeLessThanOrEqual(8000);
  });

  it('hands over on a timer, not on an animation callback', () => {
    expect(LOADER).toMatch(/setTimeout\([\s\S]{0,80}LOADER_DURATION_MS/);
    expect(LOADER).toContain('clearTimeout');
  });

  it('carries no touch handler at all', () => {
    for (const interactive of [
      'Pressable',
      'TouchableOpacity',
      'onPress',
      'onPlay',
    ]) {
      expect(LOADER).not.toContain(interactive);
    }
  });

  it('shows the brand card, the progress bar and the loading caption', () => {
    expect(LOADER).toContain('LoadingBar');
    expect(LOADER).toContain('LOADING');
    expect(LOADER).toContain('ISYFISH');
    expect(LOADER).toContain('logo');
  });

  it('uses the under-ice overlay, not the Home one', () => {
    expect(LOADER).toContain('theme.gradients.loader');
    expect(LOADER).not.toContain('theme.gradients.menu');
  });

  it('the transition timings stay inside the splash hold', () => {
    expect(SCREEN_FADE_MS).toBeLessThan(LOADER_DURATION_MS);
    expect(LOADER_FADE_MS).toBeLessThan(LOADER_DURATION_MS);
    expect(REDUCED_MOTION_MS).toBeLessThan(SCREEN_FADE_MS);
  });
});
