/**
 * The last seven drill readings, with the safety threshold drawn across them.
 * Below two entries there is no trend to show, so the chart is replaced by its
 * themed line instead of an empty frame.
 */
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Svg, {Circle, Line, Polyline} from 'react-native-svg';
import {BOARD_W, ICE_MAX_CM} from '../constants/config';
import {theme} from '../constants/theme';

type Props = {
  values: readonly number[];
  thresholdCm: number;
};

const H = 96;

export default function IceSparkline({values, thresholdCm}: Props) {
  if (values.length < 2) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>LOG TWO ENTRIES TO SEE THE TREND</Text>
      </View>
    );
  }

  const w = BOARD_W - 24;
  const stepX = values.length > 1 ? w / (values.length - 1) : w;
  const toY = (cm: number) => H - 10 - (Math.min(cm, ICE_MAX_CM) / ICE_MAX_CM) * (H - 20);
  const points = values.map((v, i) => i * stepX + ',' + toY(v)).join(' ');
  const thresholdY = toY(thresholdCm);

  return (
    <View style={[styles.wrap, {width: BOARD_W}]}>
      <Svg width={w} height={H}>
        <Line
          x1={0}
          y1={thresholdY}
          x2={w}
          y2={thresholdY}
          stroke={theme.colors.danger}
          strokeWidth={1.5}
          strokeDasharray={[6, 5]}
        />
        <Polyline
          points={points}
          fill="none"
          stroke={theme.colors.accent}
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {values.map((v, i) => (
          <Circle
            key={'p' + i}
            cx={i * stepX}
            cy={toY(v)}
            r={4}
            fill={theme.colors.deep}
          />
        ))}
      </Svg>
      <Text style={styles.caption}>ICE TREND - LAST {values.length} ENTRIES</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.66)',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  caption: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  fallback: {
    alignSelf: 'center',
    width: BOARD_W,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.58)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
  },
  fallbackText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: theme.colors.text.muted,
    textAlign: 'center',
  },
});
