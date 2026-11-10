/**
 * Home — a bento hub over the six destinations of the season. Bright ice
 * surface, the opposite read of the under-ice Loader.
 */
import React from 'react';
import {Animated, Image, StyleSheet, Text, View} from 'react-native';
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  MapPin,
  Settings as SettingsIcon,
  ShieldCheck,
} from 'lucide-react-native';
import {PIN_COUNT, SPECIES_COUNT} from '../constants/config';
import {logo} from '../assets';
import {theme} from '../constants/theme';
import ScreenShell from '../components/ScreenShell';
import ScreenHeader from '../components/ScreenHeader';
import BentoTile from '../components/BentoTile';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import {useLedger} from '../hooks/useLedger';
import {useScreenTransition} from '../hooks/useScreenTransition';
import {currentDailyStreak, speciesFound} from '../game/ledgerStore';

type Props = {
  onExpedition: () => void;
  onChallenge: () => void;
  onStats: () => void;
  onCollection: () => void;
  onDaily: () => void;
  onSettings: () => void;
};

const BLOBS = [
  {size: 240, color: 'rgba(0,166,203,0.14)', top: -70, right: -70},
  {size: 180, color: 'rgba(255,255,255,0.30)', bottom: 120, left: -60},
];

export default function MenuScreen({
  onExpedition,
  onChallenge,
  onStats,
  onCollection,
  onDaily,
  onSettings,
}: Props) {
  const {opacity, translateY} = useScreenTransition();
  const entries = useLedger(s => s.entries.length);
  const safeStreak = useLedger(s => s.safeStreak);
  const unlockedPins = useLedger(s => s.unlockedPins);
  const species = useLedger(speciesFound);
  const dailyStreak = useLedger(currentDailyStreak);

  return (
    <ScreenShell overlay={theme.gradients.menu} diagonal blobs={BLOBS}>
      <ScreenHeader
        title="ISYFISH"
        subtitle="SEASON 1 - OFFLINE"
        leftSlot={<Image source={logo} style={styles.logo} resizeMode="contain" />}
        rightSlot={
          <View style={styles.pinPill}>
            <MapPin size={16} color={theme.colors.deep} strokeWidth={2.4} />
            <Text style={styles.pinPillText}>
              {unlockedPins + '/' + PIN_COUNT + ' PINS'}
            </Text>
          </View>
        }
      />

      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.body,
          {opacity: opacity, transform: [{translateY: translateY}]},
        ]}>
        <View style={styles.row}>
          <View style={styles.slot}>
            <BentoTile
              caption="CHALLENGE"
              Icon={ShieldCheck}
              value={safeStreak}
              emptyLabel="NO SAFE RUN YET"
              accent={theme.colors.deep}
              index={0}
              onPress={onChallenge}
            />
          </View>
          <View style={styles.slot}>
            <BentoTile
              caption="STATS"
              Icon={BarChart3}
              value={entries}
              emptyLabel="NO ENTRIES YET"
              accent={theme.colors.accent}
              index={1}
              onPress={onStats}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.slot}>
            <BentoTile
              caption="COLLECTION"
              Icon={BookOpen}
              valueText={species > 0 ? species + '/' + SPECIES_COUNT : undefined}
              emptyLabel="NOTHING UNLOCKED YET"
              accent={theme.colors.warm}
              index={2}
              onPress={onCollection}
            />
          </View>
          <View style={styles.slot}>
            <BentoTile
              caption="DAILY MODE"
              Icon={CalendarDays}
              value={dailyStreak}
              emptyLabel="NO STREAK YET"
              accent={theme.colors.success}
              index={3}
              onPress={onDaily}
            />
          </View>
        </View>

        <View style={styles.spacer} pointerEvents="none" />

        <Text style={styles.hint}>ONE ENTRY PER TRIP - ICE, WEATHER, GEAR, CATCH</Text>

        <PrimaryButton
          label="START EXPEDITION"
          Icon={ClipboardCheck}
          onPress={onExpedition}
          height={120}
          large
        />

        <View style={styles.gap} pointerEvents="none" />
        <SecondaryButton
          label="SETTINGS"
          Icon={SettingsIcon}
          onPress={onSettings}
        />

        <View style={styles.gap} pointerEvents="none" />
        <View style={styles.pinCard}>
          <View style={styles.pinCardHead}>
            <Text style={styles.pinCardTitle}>SEASON PINS</Text>
            <Text style={styles.pinCardValue}>
              {unlockedPins + '/' + PIN_COUNT}
            </Text>
          </View>
          <View style={styles.pinTrack}>
            <View style={[styles.pinFill, {flex: Math.max(unlockedPins, 0.25)}]} />
            <View style={{flex: Math.max(PIN_COUNT - unlockedPins, 0.01)}} />
          </View>
          <Text style={styles.pinCardHint}>
            {unlockedPins > 0
              ? 'NEXT PIN NEEDS A 7/7 SAFETY CHECK'
              : 'NO PINS UNLOCKED YET - RUN A SAFETY CHECK'}
          </Text>
        </View>
      </Animated.View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  logo: {width: 34, height: 34},
  pinPill: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(0,85,139,0.18)',
  },
  pinPillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: theme.colors.deep,
    fontVariant: ['tabular-nums'],
  },
  body: {flex: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40},
  row: {flexDirection: 'row', gap: 12, marginBottom: 12},
  slot: {flex: 1},
  spacer: {flex: 1, minHeight: 8},
  gap: {height: 12},
  hint: {
    marginBottom: 10,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  pinCard: {
    width: '100%',
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.66)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pinCardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pinCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: theme.colors.text.secondary,
  },
  pinCardValue: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.deep,
    fontVariant: ['tabular-nums'],
  },
  pinTrack: {
    marginTop: 8,
    height: 6,
    flexDirection: 'row',
    borderRadius: 3,
    backgroundColor: theme.colors.track,
    overflow: 'hidden',
  },
  pinFill: {height: 6, borderRadius: 3, backgroundColor: theme.colors.accent},
  pinCardHint: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: theme.colors.text.muted,
  },
});
