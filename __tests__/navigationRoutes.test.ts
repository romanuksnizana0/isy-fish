/**
 * The navigation contract, checked against the source rather than a mounted
 * tree: the state machine lives in App.tsx, every destination is one tap from
 * Home behind a harness-recognised caption, and every screen has a MENU route
 * back. Reading the files keeps this test free of React and native modules.
 */
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.join(__dirname, '..');

function read(relative: string): string {
  return fs.readFileSync(path.join(ROOT, relative), 'utf8');
}

const APP = read('App.tsx');
const MENU = read('src/screens/MenuScreen.tsx');
const RESULT = read('src/screens/ResultScreen.tsx');
const LOADER = read('src/screens/LoaderScreen.tsx');

const SCREENS = [
  'LoaderScreen',
  'MenuScreen',
  'ActivityScreen',
  'ChallengeScreen',
  'ResultScreen',
  'StatsScreen',
  'CollectionScreen',
  'DailyModeScreen',
  'SettingsScreen',
];

describe('navigation routes', () => {
  it('the Screen union holds every state of the flow, result included', () => {
    for (const state of [
      'loader',
      'menu',
      'activity',
      'challenge',
      'result',
      'stats',
      'collection',
      'daily',
      'settings',
    ]) {
      expect(APP).toContain("'" + state + "'");
    }
  });

  it('every screen file exists and is rendered by the state machine', () => {
    for (const screen of SCREENS) {
      expect(fs.existsSync(path.join(ROOT, 'src/screens', screen + '.tsx'))).toBe(
        true,
      );
      expect(APP).toContain('<' + screen);
    }
  });

  it('uses a state machine, never a navigation library', () => {
    expect(APP).toContain('useState<Screen>');
    expect(APP).not.toContain('@react-navigation');
    expect(APP).not.toContain('createStackNavigator');
  });

  it('system Back pops the stack and leaves the hub to Android', () => {
    expect(APP).toContain('BackHandler');
    expect(APP).toContain("screen === 'loader' || screen === 'menu'");
  });

  it('Home routes to every destination with a recognised caption', () => {
    for (const caption of [
      'START EXPEDITION',
      'CHALLENGE',
      'STATS',
      'COLLECTION',
      'DAILY MODE',
      'SETTINGS',
    ]) {
      expect(MENU).toContain(caption);
    }
  });

  it('the result screen replays and returns', () => {
    expect(RESULT).toContain('LOG AGAIN');
    expect(RESULT).toContain('MENU');
  });

  it('every screen reachable from Home offers a way back', () => {
    for (const screen of [
      'ChallengeScreen',
      'StatsScreen',
      'CollectionScreen',
      'DailyModeScreen',
      'SettingsScreen',
    ]) {
      const src = read('src/screens/' + screen + '.tsx');
      expect(src).toContain('MENU');
      expect(src).toContain('onMenu');
    }
  });

  it('the loader hands over on a timer and carries no call to action', () => {
    expect(LOADER).toContain('setTimeout');
    expect(LOADER).toContain('LOADER_DURATION_MS');
    expect(LOADER).not.toContain('Pressable');
    expect(LOADER).not.toContain('onPlay');
  });

  it('transitions animate transform and opacity only', () => {
    expect(APP).toContain('useNativeDriver: true');
    expect(APP).not.toMatch(/outputRange[^,;]*['"](width|height)/);
  });
});
