/**
 * IsyFish — offline ice-fishing field ledger.
 *
 * Navigation is a state machine, not a library: one Screen union, one
 * in-memory back stack, system Back pops it, Back on the hub closes the app,
 * and the loader is never on the stack.
 */
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Animated, BackHandler, StatusBar, StyleSheet, View} from 'react-native';
import {REDUCED_MOTION_MS, SCREEN_FADE_MS} from './src/constants/config';
import {theme} from './src/constants/theme';
import LoaderScreen from './src/screens/LoaderScreen';
import MenuScreen from './src/screens/MenuScreen';
import ActivityScreen from './src/screens/ActivityScreen';
import ChallengeScreen from './src/screens/ChallengeScreen';
import ResultScreen from './src/screens/ResultScreen';
import StatsScreen from './src/screens/StatsScreen';
import CollectionScreen from './src/screens/CollectionScreen';
import DailyModeScreen from './src/screens/DailyModeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import type {Draft, WeatherKey} from './src/game/entryModel';
import {WEATHER_KEYS, clampIce, clampTemp, emptyCatch} from './src/game/entryModel';
import {hydrate, newAttempt} from './src/game/ledgerStore';
import {todayIndex} from './src/game/daily';
import {makeSeed, mulberry32, pick, randInt} from './src/game/rng';
import {useReducedMotion} from './src/hooks/useSettings';

type Screen =
  | 'loader'
  | 'menu'
  | 'activity'
  | 'challenge'
  | 'result'
  | 'stats'
  | 'collection'
  | 'daily'
  | 'settings';

/**
 * A fresh run: one seed per attempt, deterministic and reproducible. The seed
 * decides the suggested drill reading and the weather of the day, so two
 * consecutive runs open on a visibly different board.
 */
function makeDraft(objective: string | null): Draft {
  const attempt = newAttempt();
  const seed = makeSeed(todayIndex(), attempt);
  const rnd = mulberry32(seed);
  const weather = pick(rnd, WEATHER_KEYS) as WeatherKey;
  const iceCm = clampIce(randInt(rnd, 4, 13) * 2);
  const tempC = clampTemp(randInt(rnd, -22, -1));
  return {
    iceCm,
    weather,
    tempC,
    gear: [],
    catch: emptyCatch(),
    tags: [],
    seed,
    objective,
  };
}

export default function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('loader');
  const [draft, setDraft] = useState<Draft | null>(null);
  const stackRef = useRef<Screen[]>([]);
  const fade = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotion();

  useEffect(() => {
    hydrate();
  }, []);

  // Cross-fade on every screen change — transform/opacity only.
  useEffect(() => {
    fade.setValue(0);
    const anim = Animated.timing(fade, {
      toValue: 1,
      duration: reduced ? REDUCED_MOTION_MS : SCREEN_FADE_MS,
      useNativeDriver: true,
    });
    anim.start();
    return () => {
      anim.stop();
    };
  }, [fade, reduced, screen]);

  // The current screen is mirrored into a ref so navigation callbacks read the
  // live value instead of a stale closure.
  const screenRef = useRef<Screen>(screen);
  screenRef.current = screen;

  const push = useCallback((next: Screen) => {
    const current = screenRef.current;
    if (current !== 'loader') {
      stackRef.current = stackRef.current.concat(current);
    }
    setScreen(next);
  }, []);

  const goMenu = useCallback(() => {
    stackRef.current = [];
    setScreen('menu');
  }, []);

  const pop = useCallback((): boolean => {
    const stack = stackRef.current;
    if (stack.length === 0) {
      return false;
    }
    const previous = stack[stack.length - 1];
    stackRef.current = stack.slice(0, -1);
    setScreen(previous);
    return true;
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'loader' || screen === 'menu') {
        return false; // let Android close the app from the hub
      }
      return pop();
    });
    return () => sub.remove();
  }, [pop, screen]);

  const startExpedition = useCallback(
    (objective: string | null) => {
      setDraft(makeDraft(objective));
      push('activity');
    },
    [push],
  );

  const finishRun = useCallback(() => {
    stackRef.current = ['menu'];
    setScreen('result');
  }, []);

  const menuScreen = (
    <MenuScreen
      onExpedition={() => startExpedition(null)}
      onChallenge={() => push('challenge')}
      onStats={() => push('stats')}
      onCollection={() => push('collection')}
      onDaily={() => push('daily')}
      onSettings={() => push('settings')}
    />
  );

  const renderScreen = () => {
    switch (screen) {
      case 'loader':
        return <LoaderScreen onDone={goMenu} />;

      case 'menu':
        return menuScreen;

      case 'activity':
        return draft ? (
          <ActivityScreen draft={draft} onBack={goMenu} onFinish={finishRun} />
        ) : (
          menuScreen
        );

      case 'result':
        return (
          <ResultScreen
            onLogAgain={() => startExpedition(null)}
            onMenu={goMenu}
            onStats={() => push('stats')}
          />
        );

      case 'challenge':
        return (
          <ChallengeScreen
            onMenu={goMenu}
            onStats={() => push('stats')}
            onCollection={() => push('collection')}
            onLogEntry={() => startExpedition(null)}
          />
        );

      case 'stats':
        return <StatsScreen onMenu={goMenu} />;

      case 'collection':
        return (
          <CollectionScreen
            onMenu={goMenu}
            onExpedition={() => startExpedition(null)}
          />
        );

      case 'daily':
        return (
          <DailyModeScreen
            onDailyRun={objective => startExpedition(objective)}
            onExpedition={() => startExpedition(null)}
            onMenu={goMenu}
          />
        );

      case 'settings':
        return <SettingsScreen onMenu={goMenu} />;

      default:
        return <LoaderScreen onDone={goMenu} />;
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={screen === 'loader' ? 'light-content' : 'dark-content'}
      />
      <Animated.View
        pointerEvents="box-none"
        style={[styles.layer, {opacity: fade}]}>
        {renderScreen()}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: theme.colors.bg.base},
  layer: {flex: 1},
});
