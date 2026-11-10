/**
 * The thin split-panel readout. Every cell is the same width, the same height
 * and the same padding; only the number and its colour change. A cell with no
 * reading prints a dash, never an empty box.
 */
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {theme} from '../constants/theme';

export type StatItem = {
  label: string;
  value: string;
  tone?: string;
};

type Props = {
  items: readonly StatItem[];
};

export default function StatStrip({items}: Props) {
  if (items.length < 2) {
    return null;
  }
  return (
    <View style={styles.strip}>
      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          {i > 0 ? <View style={styles.divider} /> : null}
          <View style={styles.cell}>
            <Text
              style={[styles.value, {color: item.tone ?? theme.colors.deep}]}
              numberOfLines={1}>
              {item.value}
            </Text>
            <Text style={styles.label} numberOfLines={1}>
              {item.label}
            </Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(255,255,255,0.64)',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cell: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  divider: {width: 1, height: 28, backgroundColor: theme.colors.border},
  value: {
    fontSize: 17,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  label: {
    marginTop: 1,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.1,
    color: theme.colors.text.secondary,
  },
});
