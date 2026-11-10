/**
 * Season progress: the twelve-pin map, the season counters and the ice trend
 * of the last seven entries. The content scrolls, the MENU route does not.
 */
import React from 'react';
import {Animated, ScrollView, StyleSheet, Text, View} from 'react-native';
import {ArrowLeft, BarChart3, Flame} from 'lucide-react-native';
import {
  BOARD_FRAME,
  PANEL_BOTTOM_PAD,
  PIN_BOARD_W,
  PIN_COUNT,
} from '../constants/config';
import {iconHome} from '../assets';
import {theme} from '../constants/theme';
import ScreenShell from '../components/ScreenShell';
import ScreenHeader from '../components/ScreenHeader';
import RoundIconButton from '../components/RoundIconButton';
import PinTile from '../components/PinTile';
import BentoTile from '../components/BentoTile';
import StatStrip from '../components/StatStrip';
import IceSparkline from '../components/IceSparkline';
import SecondaryButton from '../components/SecondaryButton';
import {allPins} from '../game/pins';
import {averageIceCm, bestCatchCount, recentIce} from '../game/ledgerStore';
import {useLedger} from '../hooks/useLedger';
import {useSafeThreshold, useUnits} from '../hooks/useSettings';
import {useScreenTransition} from '../hooks/useScreenTransition';
import {formatThicknessShort} from '../utils/format';

type Props = {
  onMenu: () => void;
};

const BLOBS = [
  {size: 220, color: 'rgba(0,85,139,0.12)', top: -50, right: -60},
  {size: 180, color: 'rgba(255,255,255,0.28)', bottom: 120, left: -70},
];

export default function StatsScreen({onMenu}: Props) {
  const {opacity, translateY} = useScreenTransition();
  const entries = useLedger(s => s.entries.length);
  const unlockedPins = useLedger(s => s.unlockedPins);
  const bestStreak = useLedger(s => s.bestSafeStreak);
  const avgIce = useLedger(averageIceCm);
  const bestCatch = useLedger(bestCatchCount);
  const trend = useLedger(recentIce);
  const units = useUnits();
  const threshold = useSafeThreshold();
  const pins = allPins();

  const stripItems = [
    {
      label: 'AVG ICE',
      value: avgIce > 0 ? formatThicknessShort(avgIce, units) : '-',
      tone: theme.colors.accent,
    },
    {
      label: 'BEST CATCH',
      value: bestCatch > 0 ? String(bestCatch) : '-',
      tone: theme.colors.warm,
    },
    {
      label: 'PINS',
      value: unlockedPins + '/' + PIN_COUNT,
      tone: theme.colors.deep,
    },
  ];

  return (
    <ScreenShell overlay={theme.gradients.stats} blobs={BLOBS}>
      <ScreenHeader
        title="SEASON PROGRESS"
        subtitle={unlockedPins + '/' + PIN_COUNT + ' PINS ON THE MAP'}
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
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollInner}
          showsVerticalScrollIndicator={false}>
          <View
            style={[styles.mapBoard, {width: PIN_BOARD_W, padding: BOARD_FRAME - 2}]}>
            {pins.map(pin => (
              <PinTile
                key={pin.name}
                pin={pin}
                unlocked={pin.index < unlockedPins}
                units={units}
              />
            ))}
          </View>

          <View style={styles.row}>
            <View style={styles.slot}>
              <BentoTile
                caption="ENTRIES"
                Icon={BarChart3}
                value={entries}
                emptyLabel="NO ENTRIES YET"
                accent={theme.colors.deep}
                height={96}
                index={0}
              />
            </View>
            <View style={styles.slot}>
              <BentoTile
                caption="BEST SAFE STREAK"
                Icon={Flame}
                value={bestStreak}
                emptyLabel="NO SAFE RUN YET"
                accent={theme.colors.warm}
                height={96}
                index={1}
              />
            </View>
          </View>

          <View style={styles.stripWrap}>
            <StatStrip items={stripItems} />
          </View>

          <View style={styles.chartWrap}>
            <IceSparkline values={trend} thresholdCm={threshold} />
          </View>

          <Text style={styles.footnote}>
            LOCKED PINS SHOW THE ICE THICKNESS THEY STILL ASK FOR
          </Text>
        </ScrollView>

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
  scroll: {flex: 1},
  scrollInner: {paddingBottom: 12},
  mapBoard: {
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    borderRadius: theme.radius.xl,
    backgroundColor: 'rgba(255,255,255,0.42)',
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginBottom: 12,
  },
  row: {flexDirection: 'row', gap: 12, marginBottom: 12},
  slot: {flex: 1},
  stripWrap: {marginBottom: 12},
  chartWrap: {alignItems: 'center'},
  footnote: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: theme.colors.text.muted,
  },
});
