/**
 * Splash. A brand card and nothing else: no call-to-action, no stat chips, no
 * touch handler anywhere. The hold is driven by a timer of exactly
 * LOADER_DURATION_MS and the screen hands over by itself when it expires.
 *
 * The overlay here is the under-ice treatment — deliberately the opposite of
 * the bright Home screen, so the two never read as the same frame.
 */
import React, {useEffect, useRef} from 'react';
import {Animated, Image, StyleSheet, Text, View} from 'react-native';
import {LOADER_DURATION_MS} from '../constants/config';
import {logo} from '../assets';
import {theme} from '../constants/theme';
import ScreenShell from '../components/ScreenShell';
import LoadingBar from '../components/LoadingBar';

type Props = {
  onDone: () => void;
};

const BLOBS = [
  {size: 220, color: 'rgba(0,166,203,0.14)', top: -40, left: -50},
  {size: 160, color: 'rgba(0,166,203,0.14)', top: 180, right: -60},
  {size: 120, color: 'rgba(127,232,197,0.12)', bottom: 60, left: 30},
];

export default function LoaderScreen({onDone}: Props) {
  const card = useRef(new Animated.Value(0)).current;
  const title = useRef(new Animated.Value(0)).current;
  const sub = useRef(new Animated.Value(0)).current;
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const entrance = Animated.parallel([
      Animated.spring(card, {
        toValue: 1,
        tension: theme.animation.entrance.tension,
        friction: theme.animation.entrance.friction,
        useNativeDriver: true,
      }),
      Animated.timing(title, {
        toValue: 1,
        duration: 420,
        delay: 180,
        useNativeDriver: true,
      }),
      Animated.timing(sub, {
        toValue: 1,
        duration: 420,
        delay: 320,
        useNativeDriver: true,
      }),
    ]);
    entrance.start();

    // Timer-driven handover. Never an animation callback, never a tap.
    const timer = setTimeout(() => {
      doneRef.current();
    }, LOADER_DURATION_MS);

    return () => {
      clearTimeout(timer);
      entrance.stop();
    };
  }, [card, sub, title]);

  const cardScale = card.interpolate({inputRange: [0, 1], outputRange: [0.82, 1]});
  const titleLift = title.interpolate({inputRange: [0, 1], outputRange: [16, 0]});
  const subLift = sub.interpolate({inputRange: [0, 1], outputRange: [12, 0]});

  return (
    <ScreenShell
      overlay={theme.gradients.loader}
      locations={[0, 0.52, 1]}
      blobs={BLOBS}
      horizon>
      <View style={styles.center}>
        <Animated.View
          style={[
            styles.brandCard,
            {opacity: card, transform: [{scale: cardScale}]},
          ]}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        <Animated.Text
          style={[
            styles.title,
            {opacity: title, transform: [{translateY: titleLift}]},
          ]}>
          ISYFISH
        </Animated.Text>

        <Animated.Text
          style={[
            styles.subtitle,
            {opacity: sub, transform: [{translateY: subLift}]},
          ]}>
          NORTHERN ICE LEDGER
        </Animated.Text>

        <View style={styles.barWrap}>
          <LoadingBar durationMs={LOADER_DURATION_MS} width={200} />
          <Text style={styles.loading}>LOADING...</Text>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  brandCard: {
    width: 168,
    height: 168,
    borderRadius: theme.radius.brand,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {width: 112, height: 112},
  title: {
    marginTop: 26,
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 4,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,166,203,0.55)',
    textShadowRadius: 18,
    textShadowOffset: {width: 0, height: 0},
  },
  subtitle: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2.4,
    color: theme.colors.text.onDarkSoft,
  },
  barWrap: {marginTop: 44, alignItems: 'center'},
  loading: {
    marginTop: 12,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    color: 'rgba(209,231,238,0.70)',
  },
});
