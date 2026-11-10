/**
 * One of the five fish. The sprite keeps its own aspect (contain, never
 * stretched) and is never wrapped in a clipping bubble; the count badge sits
 * inside the card with positive offsets so nothing peeks out of the corner.
 */
import React from 'react';
import {Animated, Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {HIT_SLOP, TILE} from '../constants/config';
import {SPRITES} from '../assets';
import {theme} from '../constants/theme';
import {usePressScale} from '../hooks/usePressScale';

type Props = {
  index: number;
  name: string;
  count: number;
  discovered: boolean;
  height?: number;
  hint?: string;
  onPress?: () => void;
};

export default function SpeciesCard({
  index,
  name,
  count,
  discovered,
  height,
  hint,
  onPress,
}: Props) {
  const {scale, onPressIn, onPressOut} = usePressScale(0.95);
  const h = height ?? 118;

  const inner = (
    <Animated.View
      style={[
        styles.card,
        count > 0 ? styles.cardActive : null,
        {transform: [{scale: scale}]},
      ]}>
      <Image
        source={SPRITES[index]}
        resizeMode="contain"
        style={[styles.sprite, discovered ? null : styles.spriteLocked]}
      />
      {discovered ? null : (
        <View style={styles.lockWrap}>
          <Text style={styles.lockMark}>?</Text>
        </View>
      )}
      {count > 0 ? (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{'x' + count}</Text>
        </View>
      ) : null}
      <Text style={styles.name} numberOfLines={1}>
        {discovered ? name : 'UNKNOWN'}
      </Text>
      {hint ? (
        <Text style={styles.hint} numberOfLines={1}>
          {hint}
        </Text>
      ) : null}
    </Animated.View>
  );

  if (!onPress) {
    return <View style={[styles.slot, {width: TILE, height: h}]}>{inner}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT_SLOP}
      style={[styles.slot, {width: TILE, height: h}]}>
      {inner}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {padding: 4},
  card: {
    width: '100%',
    height: '100%',
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(255,255,255,0.80)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  cardActive: {
    borderWidth: 2,
    borderColor: theme.colors.warm,
    backgroundColor: 'rgba(242,166,90,0.14)',
  },
  sprite: {width: '72%', height: '56%'},
  spriteLocked: {opacity: 0.18},
  lockWrap: {position: 'absolute', top: 18, left: 0, right: 0, alignItems: 'center'},
  lockMark: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.text.muted,
  },
  countBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 26,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: theme.colors.warm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#3A2208',
    fontVariant: ['tabular-nums'],
  },
  name: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.9,
    color: theme.colors.text.secondary,
  },
  hint: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: theme.colors.text.muted,
  },
});
