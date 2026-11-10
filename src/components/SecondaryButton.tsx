/**
 * The quieter action under the CTA: translucent fill, one pixel border, the
 * same 24 x 24 icon geometry as PrimaryButton so the two never disagree.
 */
import React from 'react';
import {Animated, Image, Pressable, StyleSheet, Text, View} from 'react-native';
import type {ImageSourcePropType} from 'react-native';
import {HIT_SLOP, SECONDARY_HEIGHT} from '../constants/config';
import {theme} from '../constants/theme';
import {usePressScale} from '../hooks/usePressScale';
import type {IconComponent} from './PrimaryButton';

type Props = {
  label: string;
  Icon?: IconComponent;
  /** A generated PNG glyph instead of a vector icon — same 24 x 24 box. */
  source?: ImageSourcePropType;
  onPress: () => void;
  tone?: 'neutral' | 'danger';
  disabled?: boolean;
};

const ICON = 24;

export default function SecondaryButton({
  label,
  Icon,
  source,
  onPress,
  tone,
  disabled,
}: Props) {
  const {scale, onPressIn, onPressOut} = usePressScale(0.97);
  const danger = tone === 'danger';
  const color = danger ? theme.colors.danger : theme.colors.deep;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{disabled: !!disabled}}
      disabled={disabled}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT_SLOP}
      style={[
        styles.press,
        danger ? styles.pressDanger : null,
        disabled ? styles.disabled : null,
      ]}>
      <Animated.View style={[styles.inner, {transform: [{scale}]}]}>
        {source ? (
          <View style={styles.iconBox}>
            <Image source={source} style={styles.glyph} resizeMode="contain" />
          </View>
        ) : Icon ? (
          <View style={styles.iconBox}>
            <Icon size={ICON} color={color} strokeWidth={2.2} />
          </View>
        ) : null}
        <Text style={[styles.label, {color: color}]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    width: '100%',
    height: SECONDARY_HEIGHT,
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(0,85,139,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,85,139,0.20)',
    justifyContent: 'center',
  },
  pressDanger: {
    backgroundColor: theme.colors.dangerBg,
    borderColor: 'rgba(192,70,43,0.35)',
  },
  disabled: {opacity: 0.45},
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  iconBox: {
    width: ICON,
    height: ICON,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {width: ICON, height: ICON},
  label: {
    fontSize: 14,
    lineHeight: ICON,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
});
