/**
 * The safe-expedition check — the only thing that unlocks a pin on the map.
 * Seven generated rows, a progress ring, and a refusal that always explains
 * itself and offers the way out.
 */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Animated, ScrollView, StyleSheet, Text, View} from 'react-native';
import {
  ArrowLeft,
  Award,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  MapPin,
  ShieldCheck,
  Snowflake,
} from 'lucide-react-native';
import {CHECKLIST_ROWS, PANEL_BOTTOM_PAD, PIN_COUNT} from '../constants/config';
import {iconHome} from '../assets';
import {theme} from '../constants/theme';
import ScreenShell from '../components/ScreenShell';
import ScreenHeader from '../components/ScreenHeader';
import RoundIconButton from '../components/RoundIconButton';
import ChecklistRow from '../components/ChecklistRow';
import ProgressRing from '../components/ProgressRing';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import EmptyState from '../components/EmptyState';
import {generateChecklist} from '../game/checklist';
import {nextLockedPin} from '../game/pins';
import {makeSeed} from '../game/rng';
import {lastIceCm, unlockNextPin} from '../game/ledgerStore';
import {useLedger} from '../hooks/useLedger';
import {useSafeThreshold, useReducedMotion, useUnits} from '../hooks/useSettings';
import {useScreenTransition} from '../hooks/useScreenTransition';
import {formatThicknessShort} from '../utils/format';

type Props = {
  onMenu: () => void;
  onStats: () => void;
  onCollection: () => void;
  onLogEntry: () => void;
};

const BLOBS = [
  {size: 240, color: 'rgba(0,85,139,0.18)', top: -60, left: -70},
  {size: 170, color: 'rgba(127,232,197,0.16)', bottom: 140, right: -50},
];

export default function ChallengeScreen({
  onMenu,
  onStats,
  onCollection,
  onLogEntry,
}: Props) {
  const {opacity, translateY} = useScreenTransition();
  const unlockedPins = useLedger(s => s.unlockedPins);
  const attempt = useLedger(s => s.attempt);
  const ice = useLedger(lastIceCm);
  const units = useUnits();
  const threshold = useSafeThreshold();
  const reduced = useReducedMotion();

  const pin = nextLockedPin(unlockedPins);
  const seed = useMemo(
    () => makeSeed(unlockedPins + 1, attempt + 1),
    [attempt, unlockedPins],
  );
  const rows = useMemo(() => generateChecklist(seed), [seed]);
  const [done, setDone] = useState<boolean[]>(() =>
    new Array(CHECKLIST_ROWS).fill(false),
  );
  const [unlockedName, setUnlockedName] = useState<string | null>(null);

  const burst = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setDone(new Array(CHECKLIST_ROWS).fill(false));
  }, [seed]);

  const doneCount = done.filter(Boolean).length;
  const iceOk = pin ? ice >= pin.requiredIceCm : false;
  const ready = doneCount >= CHECKLIST_ROWS && iceOk;

  const toggle = useCallback((index: number) => {
    setDone(prev => {
      const next = prev.slice();
      next[index] = !next[index];
      return next;
    });
  }, []);

  const confirm = useCallback(() => {
    const name = unlockNextPin();
    if (!name) {
      return;
    }
    setUnlockedName(name);
    if (reduced) {
      return;
    }
    burst.setValue(0);
    Animated.timing(burst, {
      toValue: 1,
      duration: 520,
      useNativeDriver: true,
    }).start();
  }, [burst, reduced]);

  const burstScale = burst.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1.5],
  });
  const burstOpacity = burst.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 0],
  });

  return (
    <ScreenShell overlay={theme.gradients.challenge} blobs={BLOBS}>
      <ScreenHeader
        title="SAFE EXPEDITION CHECK"
        subtitle={pin ? 'NEXT PIN - ' + pin.name : 'SEASON COMPLETE'}
        leftSlot={
          <RoundIconButton
            Icon={ArrowLeft}
            onPress={onMenu}
            accessibilityLabel="Back to home"
          />
        }
      />

      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.body,
          {opacity: opacity, transform: [{translateY: translateY}]},
        ]}>
        {!pin ? (
          <View style={styles.centerBlock}>
            <EmptyState
              title="EVERY PIN UNLOCKED - SEASON COMPLETE"
              hint="All twelve pins of the northern lake map are open. The archive is yours."
              Icon={Award}
              actionLabel="COLLECTION"
              ActionIcon={BookOpen}
              onAction={onCollection}
            />
          </View>
        ) : unlockedName ? (
          <View style={styles.centerBlock}>
            <View style={styles.burstWrap} pointerEvents="none">
              <Animated.View
                style={[
                  styles.burstRing,
                  {opacity: burstOpacity, transform: [{scale: burstScale}]},
                ]}
              />
              <View style={styles.burstCore}>
                <MapPin size={28} color={theme.colors.text.onDark} strokeWidth={2.4} />
              </View>
            </View>
            <Text style={styles.unlockTitle}>{'PIN UNLOCKED - ' + unlockedName}</Text>
            <Text style={styles.unlockHint}>
              {'THAT MAKES ' + (unlockedPins) + '/' + PIN_COUNT + ' ON THE MAP'}
            </Text>
          </View>
        ) : (
          <View style={styles.listWrap}>
            <View style={styles.pinCard}>
              <View style={styles.pinIcon}>
                <ShieldCheck size={22} color={theme.colors.deep} strokeWidth={2.3} />
              </View>
              <View style={styles.pinText}>
                <Text style={styles.pinName} numberOfLines={1}>
                  {pin.name}
                </Text>
                <Text style={styles.pinNeed} numberOfLines={2}>
                  {'NEEDS ' +
                    formatThicknessShort(pin.requiredIceCm, units) +
                    ' ICE - ' +
                    pin.requiredGear.join(', ')}
                </Text>
              </View>
              <ProgressRing done={doneCount} total={CHECKLIST_ROWS} size={64} />
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollInner}
              showsVerticalScrollIndicator={false}>
              {rows.map((row, i) => (
                <ChecklistRow
                  key={row.id}
                  label={row.label}
                  done={done[i]}
                  onToggle={() => toggle(i)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {pin && !unlockedName && !iceOk ? (
          <Text style={styles.blocked}>
            {'ICE TOO THIN FOR THIS PIN - NEED ' +
              formatThicknessShort(pin.requiredIceCm, units) +
              ', LAST READING ' +
              (ice > 0 ? formatThicknessShort(ice, units) : 'NONE')}
          </Text>
        ) : null}

        {pin && !unlockedName ? (
          <PrimaryButton
            label="CONFIRM CHECK"
            Icon={ClipboardCheck}
            onPress={confirm}
            disabled={!ready}
          />
        ) : null}

        {pin && !unlockedName && !iceOk ? (
          <View style={styles.gap} pointerEvents="none" />
        ) : null}

        {pin && !unlockedName && !iceOk ? (
          <SecondaryButton
            label="LOG AN ENTRY"
            Icon={Snowflake}
            onPress={onLogEntry}
          />
        ) : null}

        {unlockedName ? (
          <SecondaryButton label="STATS" Icon={BarChart3} onPress={onStats} />
        ) : null}

        <View style={styles.gap} pointerEvents="none" />

        <SecondaryButton label="MENU" source={iconHome} onPress={onMenu} />
      </Animated.View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: PANEL_BOTTOM_PAD,
  },
  listWrap: {flex: 1},
  centerBlock: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  scroll: {flex: 1, marginTop: 10},
  scrollInner: {paddingBottom: 6},
  pinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pinIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,85,139,0.10)',
  },
  pinText: {flex: 1},
  pinName: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
    color: theme.colors.text.primary,
  },
  pinNeed: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 13,
    letterSpacing: 0.6,
    color: theme.colors.text.secondary,
  },
  burstWrap: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  burstRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    borderColor: theme.colors.warm,
  },
  burstCore: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.deep,
  },
  unlockTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  unlockHint: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: theme.colors.text.secondary,
  },
  blocked: {
    marginVertical: 10,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    lineHeight: 14,
    color: theme.colors.danger,
    textAlign: 'center',
  },
  gap: {height: 10},
});
