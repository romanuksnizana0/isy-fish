/**
 * A number that pulses when it changes. Transform and opacity only, so the
 * native driver is the right one here.
 */
import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet} from 'react-native';
import type {TextStyle} from 'react-native';
import {theme} from '../constants/theme';
import {useReducedMotion} from '../hooks/useSettings';

type Props = {
  text: string;
  style?: TextStyle | TextStyle[];
};

export default function PulseValue({text, style}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotion();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduced) {
      return;
    }
    scale.setValue(1.12);
    const anim = Animated.spring(scale, {
      toValue: 1,
      tension: theme.animation.pulse.tension,
      friction: theme.animation.pulse.friction,
      useNativeDriver: true,
    });
    anim.start();
    return () => {
      anim.stop();
    };
  }, [reduced, scale, text]);

  return (
    <Animated.Text style={[styles.base, style, {transform: [{scale: scale}]}]}>
      {text}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: theme.colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
});
