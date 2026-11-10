/**
 * One row of the safe-expedition check: 56 px tall, the whole row is the touch
 * target, and ticking it changes the row's fill as well as its icon.
 */
import React from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import {Check, Circle} from 'lucide-react-native';
import {HIT_SLOP} from '../constants/config';
import {theme} from '../constants/theme';
import {usePressScale} from '../hooks/usePressScale';

type Props = {
  label: string;
  done: boolean;
  onToggle: () => void;
};

export default function ChecklistRow({label, done, onToggle}: Props) {
  const {scale, onPressIn, onPressOut} = usePressScale(0.98);

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{checked: done}}
      onPress={onToggle}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT_SLOP}
      style={styles.press}>
      <Animated.View
        style={[styles.row, done ? styles.rowDone : null, {transform: [{scale: scale}]}]}>
        <View style={styles.markBox}>
          {done ? (
            <View style={styles.markFilled}>
              <Check size={14} color={theme.colors.text.onDark} strokeWidth={3} />
            </View>
          ) : (
            <Circle size={24} color={theme.colors.text.muted} strokeWidth={2} />
          )}
        </View>
        <Text
          style={[styles.label, done ? styles.labelDone : null]}
          numberOfLines={1}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {width: '100%', height: 50, marginBottom: 6},
  row: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 12,
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(255,255,255,0.70)',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rowDone: {
    backgroundColor: theme.colors.successBg,
    borderColor: 'rgba(14,124,90,0.35)',
  },
  markBox: {width: 24, height: 24, alignItems: 'center', justifyContent: 'center'},
  markFilled: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
    lineHeight: 18,
    color: theme.colors.text.secondary,
  },
  labelDone: {color: theme.colors.success},
});
