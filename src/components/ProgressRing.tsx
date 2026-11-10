/**
 * k/7 as a ring. Drawn with react-native-svg so the stroke stays crisp at any
 * density and no layout property has to be animated.
 */
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import {theme} from '../constants/theme';

type Props = {
  done: number;
  total: number;
  size?: number;
};

export default function ProgressRing({done, total, size}: Props) {
  const s = size ?? 72;
  const stroke = 7;
  const r = (s - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const ratio = total > 0 ? Math.max(0, Math.min(1, done / total)) : 0;
  const dash = circumference * ratio;
  const complete = ratio >= 1;

  return (
    <View style={[styles.wrap, {width: s, height: s}]}>
      <Svg width={s} height={s}>
        <Circle
          cx={s / 2}
          cy={s / 2}
          r={r}
          stroke="rgba(0,85,139,0.14)"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={s / 2}
          cy={s / 2}
          r={r}
          stroke={complete ? theme.colors.success : theme.colors.accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={[dash, circumference]}
          fill="none"
          rotation={-90}
          originX={s / 2}
          originY={s / 2}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.value}>{done + '/' + total}</Text>
        <Text style={styles.caption}>CHECKS</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {alignItems: 'center', justifyContent: 'center'},
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  caption: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: theme.colors.text.secondary,
  },
});
