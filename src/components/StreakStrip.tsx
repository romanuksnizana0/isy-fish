/**
 * Seven day cells ending today: completed days carry the lantern amber, today
 * is outlined, missed days stay hollow.
 */
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {theme} from '../constants/theme';

type Props = {
  days: readonly boolean[];
  todayIndex: number;
};

const LETTERS = ['6', '5', '4', '3', '2', '1', '0'];

export default function StreakStrip({days, todayIndex}: Props) {
  return (
    <View style={styles.strip}>
      {days.map((done, i) => {
        const isToday = i === todayIndex;
        return (
          <View
            key={'day' + i}
            style={[
              styles.cell,
              done ? styles.cellDone : null,
              isToday ? styles.cellToday : null,
            ]}>
            <Text
              style={[styles.text, done ? styles.textDone : null]}
              numberOfLines={1}>
              {isToday ? 'NOW' : LETTERS[i]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cell: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cellDone: {
    backgroundColor: theme.colors.warm,
    borderColor: 'rgba(242,166,90,0.75)',
  },
  cellToday: {borderWidth: 2, borderColor: theme.colors.accent},
  text: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: theme.colors.text.secondary,
  },
  textDone: {color: '#3A2208'},
});
