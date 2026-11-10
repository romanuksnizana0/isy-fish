/**
 * The four-dot step rail. The active dot stretches to 28 px.
 *
 * Width is a layout property, so this animation runs on the JS driver
 * (useNativeDriver: false). Nothing in this file uses the native driver.
 */
import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {ENTRY_STEPS, REDUCED_MOTION_MS} from '../constants/config';
import {theme} from '../constants/theme';
import {useReducedMotion} from '../hooks/useSettings';

type Props = {
  step: number;
  total?: number;
};

const DOT = 8;
const ACTIVE = 28;

function Dot({active, reduced}: {active: boolean; reduced: boolean}) {
  const size = useRef(new Animated.Value(active ? ACTIVE : DOT)).current;

  useEffect(() => {
    const anim = Animated.timing(size, {
      toValue: active ? ACTIVE : DOT,
      duration: reduced ? REDUCED_MOTION_MS : 220,
      useNativeDriver: false,
    });
    anim.start();
    return () => {
      anim.stop();
    };
  }, [active, reduced, size]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width: size,
          backgroundColor: active ? theme.colors.deep : 'rgba(0,85,139,0.22)',
        },
      ]}
    />
  );
}

export default function StepRail({step, total}: Props) {
  const reduced = useReducedMotion();
  const count = total ?? ENTRY_STEPS;
  const indexes: number[] = [];
  for (let i = 1; i <= count; i++) {
    indexes.push(i);
  }
  return (
    <View style={styles.rail}>
      {indexes.map(i => (
        <Dot key={'dot' + i} active={i === step} reduced={reduced} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 24,
  },
  dot: {height: DOT, borderRadius: DOT / 2},
});
