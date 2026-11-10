/**
 * The one header in the app. Every screen passes a title and optional slots, so
 * the back button, the badge and the spacing can never drift apart.
 */
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {HEADER_HEIGHT, HEADER_TOP_PAD} from '../constants/config';
import {theme} from '../constants/theme';
import {useHighContrast} from '../hooks/useSettings';

type Props = {
  title: string;
  subtitle?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
};

export default function ScreenHeader({title, subtitle, leftSlot, rightSlot}: Props) {
  const highContrast = useHighContrast();
  return (
    <View
      style={[
        styles.header,
        highContrast ? styles.headerContrast : null,
      ]}>
      <View style={styles.side}>{leftSlot ?? null}</View>
      <View style={styles.titleWrap}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.sideRight}>{rightSlot ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: HEADER_TOP_PAD,
    height: HEADER_TOP_PAD + HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerContrast: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.borderStrong,
  },
  side: {width: 56, alignItems: 'flex-start', justifyContent: 'center'},
  sideRight: {minWidth: 56, alignItems: 'flex-end', justifyContent: 'center'},
  titleWrap: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  title: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: theme.colors.text.primary,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: theme.colors.text.secondary,
  },
});
