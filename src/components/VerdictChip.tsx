/**
 * The safety spine of the app: one pill that answers "can I walk on this".
 * It updates on every change of the drill reading.
 */
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {AlertTriangle, CheckCircle2} from 'lucide-react-native';
import {theme} from '../constants/theme';
import {formatThickness} from '../utils/format';
import type {Units} from '../game/ledgerStore';

type Props = {
  safe: boolean;
  thresholdCm: number;
  units: Units;
};

export default function VerdictChip({safe, thresholdCm, units}: Props) {
  const tone = safe ? theme.colors.success : theme.colors.danger;
  const Icon = safe ? CheckCircle2 : AlertTriangle;
  return (
    <View
      style={[
        styles.chip,
        {backgroundColor: safe ? theme.colors.successBg : theme.colors.dangerBg},
      ]}>
      <View style={styles.iconBox}>
        <Icon size={18} color={tone} strokeWidth={2.4} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, {color: tone}]} numberOfLines={1}>
          {safe ? 'SAFE TO WALK' : 'UNSAFE ICE'}
        </Text>
        <Text style={styles.hint} numberOfLines={1}>
          {'THRESHOLD ' + formatThickness(thresholdCm, units)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
    gap: 10,
  },
  iconBox: {width: 18, height: 18, alignItems: 'center', justifyContent: 'center'},
  textWrap: {justifyContent: 'center'},
  title: {fontSize: 13, fontWeight: '800', letterSpacing: 1.2, lineHeight: 18},
  hint: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    color: theme.colors.text.secondary,
  },
});
