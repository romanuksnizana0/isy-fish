/**
 * One square of the twelve-pin map. Unlocked pins carry the deep-ice fill and
 * their name; locked ones show the thickness the lake still owes you.
 */
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Lock, MapPin} from 'lucide-react-native';
import {PIN_TILE} from '../constants/config';
import {theme} from '../constants/theme';
import {formatThicknessShort} from '../utils/format';
import type {Pin} from '../game/pins';
import type {Units} from '../game/ledgerStore';

type Props = {
  pin: Pin;
  unlocked: boolean;
  units: Units;
};

export default function PinTile({pin, unlocked, units}: Props) {
  return (
    <View style={[styles.slot, {width: PIN_TILE, height: PIN_TILE}]}>
      <View style={[styles.tile, unlocked ? styles.tileOpen : styles.tileLocked]}>
        <View style={styles.iconBox}>
          {unlocked ? (
            <MapPin size={20} color={theme.colors.text.onDark} strokeWidth={2.4} />
          ) : (
            <Lock size={20} color="rgba(4,41,58,0.35)" strokeWidth={2.2} />
          )}
        </View>
        <Text
          style={[styles.name, unlocked ? styles.nameOpen : null]}
          numberOfLines={2}>
          {unlocked ? pin.short : formatThicknessShort(pin.requiredIceCm, units)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {padding: 4},
  tile: {
    width: '100%',
    height: '100%',
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 4,
  },
  tileOpen: {backgroundColor: theme.colors.deep, borderColor: theme.colors.deep},
  tileLocked: {backgroundColor: 'rgba(0,85,139,0.08)'},
  iconBox: {width: 20, height: 20, alignItems: 'center', justifyContent: 'center'},
  name: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    textAlign: 'center',
    color: theme.colors.text.secondary,
  },
  nameOpen: {color: theme.colors.text.onDark},
});
