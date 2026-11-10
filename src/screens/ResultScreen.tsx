/**
 * The session result — the mandatory report, and visually nothing like the
 * logging screen: a different overlay, no step rail, no board, and a headline
 * in the app's own words.
 */
import React from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Fish,
  RotateCcw,
  ShieldCheck,
  Snowflake,
  Star,
} from 'lucide-react-native';
import {HIT_SLOP, PANEL_BOTTOM_PAD, PIN_COUNT} from '../constants/config';
import {iconHome} from '../assets';
import {theme} from '../constants/theme';
import ScreenShell from '../components/ScreenShell';
import ScreenHeader from '../components/ScreenHeader';
import RoundIconButton from '../components/RoundIconButton';
import BentoTile from '../components/BentoTile';
import SpeciesCard from '../components/SpeciesCard';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import EmptyState from '../components/EmptyState';
import {SPECIES_NAMES, outcomeHeadline, totalCatch} from '../game/entryModel';
import {useLedger} from '../hooks/useLedger';
import {useSafeThreshold, useUnits} from '../hooks/useSettings';
import {useScreenTransition} from '../hooks/useScreenTransition';
import {formatThicknessShort} from '../utils/format';

type Props = {
  onLogAgain: () => void;
  onMenu: () => void;
  onStats: () => void;
};

const BLOBS = [
  {size: 230, color: 'rgba(242,166,90,0.18)', top: 60, right: -70},
  {size: 180, color: 'rgba(0,166,203,0.16)', bottom: 160, left: -60},
];

export default function ResultScreen({onLogAgain, onMenu, onStats}: Props) {
  const {opacity, translateY} = useScreenTransition();
  const entry = useLedger(s => s.lastEntry);
  const outcome = useLedger(s => s.lastOutcome);
  const entries = useLedger(s => s.entries.length);
  const unlockedPins = useLedger(s => s.unlockedPins);
  const discovered = useLedger(s => s.lastDiscovered);
  const units = useUnits();
  const threshold = useSafeThreshold();

  const headline = outcomeHeadline(outcome ?? 'aborted');
  const aborted = outcome === 'aborted';
  const unsafe = outcome === 'unsafe';
  const caught = entry ? totalCatch(entry.catch) : 0;
  const caughtIndexes = entry
    ? entry.catch.map((n, i) => (n > 0 ? i : -1)).filter(i => i >= 0)
    : [];

  return (
    <ScreenShell overlay={theme.gradients.result} blobs={BLOBS}>
      <ScreenHeader
        title="TRIP REPORT"
        subtitle={aborted ? 'NOTHING COMMITTED' : 'ENTRY SAVED TO THE SEASON LOG'}
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
        <View style={styles.headlineRow}>
          <View
            style={[
              styles.headlineIcon,
              unsafe || aborted ? styles.headlineIconWarn : null,
            ]}>
            {unsafe || aborted ? (
              <AlertTriangle size={24} color={theme.colors.danger} strokeWidth={2.4} />
            ) : (
              <CheckCircle2 size={24} color={theme.colors.success} strokeWidth={2.4} />
            )}
          </View>
          <Text
            style={[
              styles.headline,
              unsafe || aborted ? styles.headlineWarn : null,
            ]}>
            {headline}
          </Text>
        </View>

        {aborted || !entry ? (
          <EmptyState
            title="NO ENTRY WAS WRITTEN"
            hint="The run was aborted, so the season log is unchanged. Walk out again whenever the ice looks right."
            Icon={AlertTriangle}
            tone="warn"
          />
        ) : (
          <View>
            <View style={styles.row}>
              <View style={styles.slot}>
                <BentoTile
                  caption="ICE READING"
                  Icon={Snowflake}
                  valueText={formatThicknessShort(entry.iceCm, units)}
                  accent={
                    entry.iceCm >= threshold
                      ? theme.colors.success
                      : theme.colors.danger
                  }
                  height={104}
                  index={0}
                />
              </View>
              <View style={styles.slot}>
                <BentoTile
                  caption="WEATHER"
                  Icon={Star}
                  valueText={entry.weather}
                  accent={theme.colors.accent}
                  height={104}
                  index={1}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.slot}>
                <BentoTile
                  caption="SAFETY GEAR"
                  Icon={ShieldCheck}
                  valueText={entry.safetyScore + '/3'}
                  accent={theme.colors.deep}
                  height={104}
                  index={2}
                />
              </View>
              <View style={styles.slot}>
                <BentoTile
                  caption="CATCH"
                  Icon={Fish}
                  value={caught}
                  emptyLabel="NO FISH THIS TRIP"
                  accent={theme.colors.warm}
                  height={104}
                  index={3}
                />
              </View>
            </View>

            {caughtIndexes.length > 0 ? (
              <View style={styles.speciesRow}>
                {caughtIndexes.map(i => (
                  <SpeciesCard
                    key={SPECIES_NAMES[i]}
                    index={i}
                    name={SPECIES_NAMES[i]}
                    count={entry.catch[i]}
                    discovered
                    height={96}
                  />
                ))}
              </View>
            ) : (
              <Text style={styles.noFish}>NO FISH THIS TRIP</Text>
            )}

            {discovered.length > 0 ? (
              <View style={styles.newBadge}>
                <Star size={14} color="#8A5415" strokeWidth={2.6} />
                <Text style={styles.newBadgeText}>
                  {'NEW SPECIES - ' +
                    discovered.map(i => SPECIES_NAMES[i]).join(', ')}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        <View style={styles.spacer} pointerEvents="none" />

        <Text style={styles.progressLine}>
          {'SEASON LOG - ' +
            entries +
            ' ENTRIES - ' +
            unlockedPins +
            '/' +
            PIN_COUNT +
            ' PINS'}
        </Text>

        <PrimaryButton label="LOG AGAIN" Icon={RotateCcw} onPress={onLogAgain} />

        <View style={styles.gap} pointerEvents="none" />

        <SecondaryButton label="MENU" source={iconHome} onPress={onMenu} />

        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Open season stats"
          onPress={onStats}
          hitSlop={HIT_SLOP}
          style={styles.link}>
          <BarChart3 size={16} color={theme.colors.deep} strokeWidth={2.4} />
          <Text style={styles.linkText}>STATS</Text>
        </Pressable>
      </Animated.View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: PANEL_BOTTOM_PAD,
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  headlineIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.successBg,
  },
  headlineIconWarn: {backgroundColor: theme.colors.dangerBg},
  headline: {
    flex: 1,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: theme.colors.success,
  },
  headlineWarn: {color: theme.colors.danger},
  row: {flexDirection: 'row', gap: 12, marginBottom: 12},
  slot: {flex: 1},
  speciesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  noFish: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: theme.colors.text.muted,
  },
  newBadge: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    backgroundColor: 'rgba(242,166,90,0.20)',
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#8A5415',
  },
  spacer: {flex: 1, minHeight: 10},
  progressLine: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: theme.colors.text.secondary,
  },
  gap: {height: 12},
  link: {
    marginTop: 10,
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  linkText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    lineHeight: 16,
    color: theme.colors.deep,
  },
});
