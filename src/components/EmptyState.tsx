/**
 * The one themed card for every empty, blocked or finished state. A refusal
 * always explains itself and offers a way out — never a blank area, never a
 * dead end.
 */
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {theme} from '../constants/theme';
import PrimaryButton from './PrimaryButton';
import type {IconComponent} from './PrimaryButton';

type Props = {
  title: string;
  hint: string;
  Icon?: IconComponent;
  tone?: 'neutral' | 'warn';
  actionLabel?: string;
  ActionIcon?: IconComponent;
  onAction?: () => void;
};

export default function EmptyState({
  title,
  hint,
  Icon,
  tone,
  actionLabel,
  ActionIcon,
  onAction,
}: Props) {
  const warn = tone === 'warn';
  return (
    <View style={[styles.card, warn ? styles.cardWarn : null]}>
      {Icon ? (
        <View style={[styles.iconWell, warn ? styles.iconWellWarn : null]}>
          <Icon
            size={24}
            color={warn ? theme.colors.danger : theme.colors.deep}
            strokeWidth={2.2}
          />
        </View>
      ) : null}
      <Text style={[styles.title, warn ? styles.titleWarn : null]}>{title}</Text>
      <Text style={styles.hint}>{hint}</Text>
      {actionLabel && onAction ? (
        <View style={styles.actionWrap}>
          <PrimaryButton
            label={actionLabel}
            Icon={ActionIcon}
            onPress={onAction}
            height={48}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    borderRadius: theme.radius.xl,
    backgroundColor: 'rgba(255,255,255,0.74)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  cardWarn: {
    backgroundColor: theme.colors.dangerBg,
    borderColor: 'rgba(192,70,43,0.30)',
  },
  iconWell: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,85,139,0.10)',
    marginBottom: 10,
  },
  iconWellWarn: {backgroundColor: 'rgba(192,70,43,0.14)'},
  title: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  titleWarn: {color: theme.colors.danger},
  hint: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    letterSpacing: 0.4,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  actionWrap: {marginTop: 14, width: '100%'},
});
