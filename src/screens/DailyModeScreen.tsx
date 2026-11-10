/**
 * One brief per calendar day: the day's conditions, a single objective and the
 * seven-cell streak strip. The brief is seeded from the day index alone, so it
 * is the same from the first open of the day to the last.
 */
import React from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';
import {
  ArrowLeft,
  Award,
  Cloud,
  ClipboardCheck,
  Droplets,
  Moon,
  Snowflake,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react-native';
import {PANEL_BOTTOM_PAD, STREAK_WINDOW} from '../constants/config';
import {iconHome} from '../assets';
import {theme} from '../constants/theme';
import ScreenShell from '../components/ScreenShell';
import ScreenHeader from '../components/ScreenHeader';
import RoundIconButton from '../components/RoundIconButton';
import StreakStrip from '../components/StreakStrip';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import type {IconComponent} from '../components/PrimaryButton';
import type {WeatherKey} from '../game/entryModel';
import {briefFor, streakWindow, todayIndex} from '../game/daily';
import {currentDailyStreak} from '../game/ledgerStore';
import {useLedger} from '../hooks/useLedger';
import {useScreenTransition} from '../hooks/useScreenTransition';
import {formatTemp} from '../utils/format';

type Props = {
  onDailyRun: (objective: string) => void;
  onExpedition: () => void;
  onMenu: () => void;
};

const WEATHER_ICON: Record<WeatherKey, IconComponent> = {
  CLEAR: Sun,
  OVERCAST: Cloud,
  SNOW: Snowflake,
  WIND: Wind,
  THAW: Droplets,
  NIGHT: Moon,
};

const BLOBS = [
  {size: 250, color: 'rgba(4,41,58,0.22)', top: -70, left: -60},
  {size: 170, color: 'rgba(0,166,203,0.16)', bottom: 160, right: -60},
];

export default function DailyModeScreen({
  onDailyRun,
  onExpedition,
  onMenu,
}: Props) {
  const {opacity, translateY} = useScreenTransition();
  const completed = useLedger(s => s.completedDays);
  const streak = useLedger(currentDailyStreak);

  const today = todayIndex();
  const brief = briefFor(today);
  const days = streakWindow(completed, today);
  const doneToday = completed.indexOf(today) >= 0;
  const WeatherIcon = WEATHER_ICON[brief.weather];

  return (
    <ScreenShell overlay={theme.gradients.daily} blobs={BLOBS}>
      <ScreenHeader
        title="DAILY ICE BRIEF"
        subtitle={doneToday ? 'BRIEF COMPLETE' : 'ONE OBJECTIVE A DAY'}
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
        <View style={styles.hero}>
          <View style={styles.conditionRow}>
            <View style={styles.conditionPill}>
              <WeatherIcon size={20} color={theme.colors.deep} strokeWidth={2.3} />
              <Text style={styles.conditionText}>{brief.weather}</Text>
            </View>
            <View style={styles.conditionPill}>
              <Thermometer size={20} color={theme.colors.deep} strokeWidth={2.3} />
              <Text style={styles.conditionText}>{formatTemp(brief.tempC)}</Text>
            </View>
          </View>

          <Text style={styles.objectiveLabel}>OBJECTIVE TODAY</Text>
          <Text style={styles.objective}>
            {doneToday ? 'BRIEF COMPLETE - COME BACK TOMORROW' : brief.label}
          </Text>

          <View style={styles.rewardRow}>
            <Award size={16} color={theme.colors.warm} strokeWidth={2.4} />
            <Text style={styles.rewardText}>{'REWARD - ' + brief.reward}</Text>
          </View>
        </View>

        <View style={styles.streakWrap}>
          <Text style={styles.streakTitle}>
            {'STREAK - ' + streak + ' DAY' + (streak === 1 ? '' : 'S')}
          </Text>
          <StreakStrip days={days} todayIndex={STREAK_WINDOW - 1} />
          <Text style={styles.streakHint}>
            COMPLETED DAYS ARE AMBER, TODAY IS OUTLINED
          </Text>
        </View>

        <View style={styles.spacer} pointerEvents="none" />

        <Text style={styles.hint}>
          {doneToday
            ? 'THE BRIEF IS DONE - A FREE RUN STILL COUNTS FOR THE SEASON'
            : 'THE OBJECTIVE RIDES ALONG IN THE STAT STRIP'}
        </Text>

        {doneToday ? (
          <PrimaryButton
            label="START EXPEDITION"
            Icon={ClipboardCheck}
            onPress={onExpedition}
          />
        ) : (
          <PrimaryButton
            label="START DAILY RUN"
            Icon={ClipboardCheck}
            onPress={() => onDailyRun(brief.label)}
          />
        )}

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
    paddingTop: 14,
    paddingBottom: PANEL_BOTTOM_PAD,
  },
  hero: {
    borderRadius: theme.radius.xl,
    backgroundColor: 'rgba(255,255,255,0.80)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  conditionRow: {flexDirection: 'row', gap: 10, marginBottom: 14},
  conditionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(0,85,139,0.08)',
  },
  conditionText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    color: theme.colors.deep,
  },
  objectiveLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: theme.colors.text.muted,
  },
  objective: {
    marginTop: 6,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.6,
    lineHeight: 25,
    color: theme.colors.text.primary,
  },
  rewardRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    backgroundColor: 'rgba(242,166,90,0.18)',
    alignSelf: 'flex-start',
  },
  rewardText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#8A5415',
  },
  streakWrap: {
    marginTop: 14,
    alignItems: 'center',
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 14,
  },
  streakTitle: {
    marginBottom: 10,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: theme.colors.text.primary,
  },
  streakHint: {
    marginTop: 10,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: theme.colors.text.muted,
  },
  spacer: {flex: 1, minHeight: 10},
  hint: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: theme.colors.text.secondary,
  },
  gap: {height: 12},
});
