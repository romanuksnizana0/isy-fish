/**
 * The one tile primitive of the bento grid. Hierarchy comes from tile SIZE, not
 * from heavier effects, so every tile shares the same border, radius and
 * shadow. A tile with nothing to show prints its themed zero line instead of a
 * bare 0 — an empty rounded box reads as a broken skeleton.
 */
import React from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import {HIT_SLOP} from '../constants/config';
import {theme} from '../constants/theme';
import {usePressScale} from '../hooks/usePressScale';
import {useHighContrast} from '../hooks/useSettings';
import {useStagger} from '../hooks/useScreenTransition';
import type {IconComponent} from './PrimaryButton';

type Props = {
  caption: string;
  Icon: IconComponent;
  /** Numeric readout. When 0 the tile shows `emptyLabel` instead. */
  value?: number;
  /** Pre-formatted readout that wins over `value` when present. */
  valueText?: string;
  emptyLabel?: string;
  accent?: string;
  height?: number;
  index?: number;
  onPress?: () => void;
};

export default function BentoTile({
  caption,
  Icon,
  value,
  valueText,
  emptyLabel,
  accent,
  height,
  index,
  onPress,
}: Props) {
  const {scale, onPressIn, onPressOut} = usePressScale(0.97);
  const {opacity, translateY} = useStagger(index ?? 0);
  const highContrast = useHighContrast();
  const tone = accent ?? theme.colors.deep;
  const h = height ?? 112;

  const hasValue = valueText !== undefined || (value !== undefined && value > 0);
  const readout =
    valueText !== undefined ? valueText : value !== undefined ? String(value) : '';

  const body = (
    <Animated.View
      style={[
        styles.card,
        highContrast ? styles.cardContrast : null,
        theme.shadows.tile,
        {opacity: opacity, transform: [{translateY: translateY}, {scale: scale}]},
      ]}>
      <View style={[styles.iconWell, {backgroundColor: tone + '1A'}]}>
        <Icon size={22} color={tone} strokeWidth={2.2} />
      </View>
      {hasValue ? (
        <Text style={[styles.value, {color: tone}]} numberOfLines={1}>
          {readout}
        </Text>
      ) : (
        <Text style={styles.empty} numberOfLines={2}>
          {emptyLabel ?? 'NOTHING YET'}
        </Text>
      )}
      <Text style={styles.caption} numberOfLines={1}>
        {caption}
      </Text>
    </Animated.View>
  );

  if (!onPress) {
    return <View style={[styles.press, {height: h}]}>{body}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={caption}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT_SLOP}
      style={[styles.press, {height: h}]}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {width: '100%'},
  card: {
    width: '100%',
    height: '100%',
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.tile,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  cardContrast: {borderWidth: 2, borderColor: theme.colors.borderStrong},
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.4,
  },
  empty: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: theme.colors.text.muted,
    lineHeight: 14,
  },
  caption: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: theme.colors.text.secondary,
  },
});
