/**
 * The three-column board shared by weather, gear and note tags. Geometry comes
 * from the frame formula in constants/config, so tiles never overflow the
 * board frame.
 */
import React from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import {Check} from 'lucide-react-native';
import {BOARD_COLS, BOARD_FRAME, BOARD_W, HIT_SLOP, TILE} from '../constants/config';
import {theme} from '../constants/theme';
import {usePressScale} from '../hooks/usePressScale';
import type {IconComponent} from './PrimaryButton';

export type ChipItem = {
  key: string;
  label: string;
  Icon: IconComponent;
};

type Props = {
  items: readonly ChipItem[];
  selected: readonly string[];
  mode: 'single' | 'multi';
  tileHeight?: number;
  onToggle: (key: string) => void;
};

function Chip({
  item,
  active,
  tileHeight,
  onToggle,
}: {
  item: ChipItem;
  active: boolean;
  tileHeight: number;
  onToggle: (key: string) => void;
}) {
  const {scale, onPressIn, onPressOut} = usePressScale(0.95);
  const tone = active ? theme.colors.accent : theme.colors.text.secondary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityState={{selected: active}}
      onPress={() => onToggle(item.key)}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT_SLOP}
      style={[styles.slot, {width: TILE, height: tileHeight}]}>
      <Animated.View
        style={[
          styles.chip,
          active ? styles.chipActive : null,
          {transform: [{scale: scale}]},
        ]}>
        {active ? (
          <View style={styles.badge}>
            <Check size={12} color={theme.colors.text.onDark} strokeWidth={3} />
          </View>
        ) : null}
        <View style={styles.iconBox}>
          <item.Icon size={24} color={tone} strokeWidth={2.2} />
        </View>
        <Text style={[styles.label, active ? styles.labelActive : null]} numberOfLines={2}>
          {item.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function ChipBoard({
  items,
  selected,
  mode,
  tileHeight,
  onToggle,
}: Props) {
  const h = tileHeight ?? 86;
  const rows: ChipItem[][] = [];
  for (let i = 0; i < items.length; i += BOARD_COLS) {
    rows.push(items.slice(i, i + BOARD_COLS) as ChipItem[]);
  }
  return (
    <View
      style={[
        styles.board,
        {width: BOARD_W, padding: BOARD_FRAME - 2},
      ]}
      accessibilityLabel={mode === 'single' ? 'Pick one' : 'Pick any'}>
      {rows.map((row, ri) => (
        <View key={'row' + ri} style={styles.row}>
          {row.map(item => (
            <Chip
              key={item.key}
              item={item}
              active={selected.indexOf(item.key) >= 0}
              tileHeight={h}
              onToggle={onToggle}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    alignSelf: 'center',
    borderRadius: theme.radius.xl,
    backgroundColor: 'rgba(255,255,255,0.42)',
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  row: {flexDirection: 'row'},
  slot: {padding: 4},
  chip: {
    width: '100%',
    height: '100%',
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  chipActive: {
    borderWidth: 2,
    borderColor: theme.colors.accent,
    backgroundColor: 'rgba(0,166,203,0.12)',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {width: 24, height: 24, alignItems: 'center', justifyContent: 'center'},
  label: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  labelActive: {color: theme.colors.deep},
});
