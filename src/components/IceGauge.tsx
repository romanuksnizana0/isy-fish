/**
 * The drill-core gauge: the reading is set with the two 56 px round buttons or
 * by pressing the core column itself. The gesture is non-obvious, so the screen
 * that owns this gauge prints a hint naming the gesture and its result.
 *
 * The fill animates its HEIGHT, a layout property, so every animation in this
 * file passes useNativeDriver: false. Press feedback lives on the buttons.
 */
import React, {useEffect, useRef} from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Minus, Plus} from 'lucide-react-native';
import {
  HIT_SLOP,
  ICE_MAX_CM,
  ICE_STEP_CM,
  REDUCED_MOTION_MS,
} from '../constants/config';
import {theme} from '../constants/theme';
import {clampIce} from '../game/entryModel';
import {useReducedMotion} from '../hooks/useSettings';
import {formatThickness} from '../utils/format';
import PulseValue from './PulseValue';
import type {Units} from '../game/ledgerStore';

type Props = {
  valueCm: number;
  thresholdCm: number;
  units: Units;
  onChange: (cm: number) => void;
};

const COLUMN_H = 236;
const COLUMN_W = 92;
const BTN = 56;

export default function IceGauge({valueCm, thresholdCm, units, onChange}: Props) {
  const fill = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();
  const ratio = Math.max(0, Math.min(1, valueCm / ICE_MAX_CM));

  useEffect(() => {
    const anim = Animated.timing(fill, {
      toValue: ratio,
      duration: reduced ? REDUCED_MOTION_MS : 220,
      useNativeDriver: false,
    });
    anim.start();
    return () => {
      anim.stop();
    };
  }, [fill, ratio, reduced]);

  const fillHeight = fill.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const onColumnPress = (locationY: number) => {
    const fromBottom = COLUMN_H - locationY;
    const next = clampIce((fromBottom / COLUMN_H) * ICE_MAX_CM);
    onChange(next);
  };

  const markerBottom = (thresholdCm / ICE_MAX_CM) * COLUMN_H;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Thinner reading"
          hitSlop={HIT_SLOP}
          onPress={() => onChange(clampIce(valueCm - ICE_STEP_CM))}
          style={({pressed}) => [styles.btn, pressed ? styles.btnPressed : null]}>
          <Minus size={24} color={theme.colors.deep} strokeWidth={2.6} />
        </Pressable>

        <Pressable
          accessibilityRole="adjustable"
          accessibilityLabel="Ice core gauge"
          onPress={e => onColumnPress(e.nativeEvent.locationY)}
          style={styles.column}>
          <View style={styles.track} />
          <Animated.View style={[styles.fillWrap, {height: fillHeight}]}>
            <LinearGradient
              colors={theme.gradients.gauge as unknown as string[]}
              start={{x: 0.5, y: 1}}
              end={{x: 0.5, y: 0}}
              style={styles.fillGradient}
            />
          </Animated.View>
          <View style={[styles.threshold, {bottom: markerBottom}]} />
          <Text style={styles.thresholdLabel}>SAFE LINE</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Thicker reading"
          hitSlop={HIT_SLOP}
          onPress={() => onChange(clampIce(valueCm + ICE_STEP_CM))}
          style={({pressed}) => [styles.btn, pressed ? styles.btnPressed : null]}>
          <Plus size={24} color={theme.colors.deep} strokeWidth={2.6} />
        </Pressable>
      </View>

      <PulseValue text={formatThickness(valueCm, units)} style={styles.readout} />
      <Text style={styles.hint}>PRESS THE CORE OR USE + / - TO SET THICKNESS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {alignItems: 'center'},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  btn: {
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {backgroundColor: 'rgba(0,166,203,0.18)'},
  column: {
    width: COLUMN_W,
    height: COLUMN_H,
    borderRadius: theme.radius.xxl,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  track: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.track,
  },
  fillWrap: {width: '100%'},
  fillGradient: {width: '100%', height: '100%'},
  threshold: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: theme.colors.danger,
    opacity: 0.75,
  },
  thresholdLabel: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: theme.colors.text.secondary,
  },
  readout: {
    marginTop: 12,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: theme.colors.text.primary,
  },
  hint: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});
