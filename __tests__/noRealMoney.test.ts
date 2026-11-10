/**
 * The product constraint, enforced on the source: IsyFish is a field ledger.
 * Progression is entries, pins, species and streaks — there is no currency, no
 * wager, no purchase and no network anywhere in the app.
 */
import * as fs from 'fs';
import * as path from 'path';
import {getState, resetForTests} from '../src/game/ledgerStore';

const ROOT = path.join(__dirname, '..');

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      sourceFiles(full, out);
    } else if (/\.tsx?$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const FILES = [...sourceFiles(path.join(ROOT, 'src')), path.join(ROOT, 'App.tsx')];

function scan(pattern: RegExp): string[] {
  const hits: string[] = [];
  for (const file of FILES) {
    if (pattern.test(fs.readFileSync(file, 'utf8'))) {
      hits.push(path.relative(ROOT, file));
    }
  }
  return hits;
}

describe('no real money', () => {
  beforeEach(() => {
    resetForTests();
  });

  it('ships source files to check', () => {
    expect(FILES.length).toBeGreaterThan(20);
  });

  it('has no currency, wager or purchase vocabulary', () => {
    expect(
      scan(
        /\b(bet|bets|wager|jackpot|payout|currency|coin|coins|purchase|paywall|prize|cash|balance|credits?|gamble|casino|rtp)\b/i,
      ),
    ).toEqual([]);
  });

  it('has no ads, billing or in-app purchase packages', () => {
    expect(scan(/\b(admob|applovin|unity-?ads|billingclient|react-native-iap)\b/i)).toEqual(
      [],
    );
  });

  it('is fully offline — no network code and no INTERNET permission', () => {
    expect(scan(/\b(fetch\(|XMLHttpRequest|WebSocket|axios)/)).toEqual([]);
    const manifest = fs.readFileSync(
      path.join(ROOT, 'android/app/src/main/AndroidManifest.xml'),
      'utf8',
    );
    expect(manifest).not.toContain('android.permission.INTERNET');
  });

  it('the season state carries counters only — no balance of any kind', () => {
    const keys = Object.keys(getState());
    for (const key of keys) {
      expect(key.toLowerCase()).not.toMatch(/coin|credit|balance|wallet|cash/);
    }
    expect(keys).toEqual(
      expect.arrayContaining([
        'entries',
        'unlockedPins',
        'collection',
        'safeStreak',
        'completedDays',
      ]),
    );
  });

  it('declares only the four allowed runtime dependencies', () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'),
    );
    const deps = Object.keys(pkg.dependencies).sort();
    expect(deps).toEqual([
      'lucide-react-native',
      'react',
      'react-native',
      'react-native-linear-gradient',
      'react-native-svg',
    ]);
  });
});
