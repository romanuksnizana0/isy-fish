/**
 * The core logging loop — a split panel: the board changes with the step, the
 * bottom strip and the big commit button never move.
 *
 * Nothing here ends the run by itself: with no input at all the screen stays
 * open indefinitely. ABORT RUN is the honest bad-input path and reaches the
 * report immediately.
 */
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import {
  Anchor,
  ArrowLeft,
  Cloud,
  Droplets,
  Home,
  Layers,
  Link2,
  Minus,
  Moon,
  Mountain,
  Plus,
  Save,
  Snowflake,
  Star,
  Sun,
  Target,
  Thermometer,
  Timer,
  Waves,
  Wind,
  Zap,
} from 'lucide-react-native';
import {
  BOARD_W,
  ENTRY_STEPS,
  HIT_SLOP,
  PANEL_BOTTOM_PAD,
  TEMP_STEP_C,
} from '../constants/config';
import {iconPause} from '../assets';
import {theme} from '../constants/theme';
import ScreenShell from '../components/ScreenShell';
import ScreenHeader from '../components/ScreenHeader';
import RoundIconButton from '../components/RoundIconButton';
import StepRail from '../components/StepRail';
import IceGauge from '../components/IceGauge';
import VerdictChip from '../components/VerdictChip';
import ChipBoard from '../components/ChipBoard';
import type {ChipItem} from '../components/ChipBoard';
import SpeciesCard from '../components/SpeciesCard';
import StatStrip from '../components/StatStrip';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import type {Draft, GearKey, NoteTag, WeatherKey} from '../game/entryModel';
import {
  NOTE_TAGS,
  SPECIES_NAMES,
  blockedReason,
  canCommit,
  clampTemp,
  isSafe,
  safetyScore,
  totalCatch,
} from '../game/entryModel';
import {commitDraft} from '../game/ledgerStore';
import {useSafeThreshold, useUnits} from '../hooks/useSettings';
import {useScreenTransition} from '../hooks/useScreenTransition';
import {formatTemp, formatThicknessShort} from '../utils/format';

type Props = {
  draft: Draft;
  onBack: () => void;
  onFinish: () => void;
};

const WEATHER_CHIPS: ChipItem[] = [
  {key: 'CLEAR', label: 'CLEAR', Icon: Sun},
  {key: 'OVERCAST', label: 'OVERCAST', Icon: Cloud},
  {key: 'SNOW', label: 'SNOW', Icon: Snowflake},
  {key: 'WIND', label: 'WIND', Icon: Wind},
  {key: 'THAW', label: 'THAW', Icon: Droplets},
  {key: 'NIGHT', label: 'NIGHT', Icon: Moon},
];

const GEAR_CHIPS: ChipItem[] = [
  {key: 'AUGER', label: 'AUGER', Icon: Target},
  {key: 'ROPE', label: 'ROPE', Icon: Link2},
  {key: 'SPIKES', label: 'SPIKES', Icon: Mountain},
  {key: 'SONAR', label: 'SONAR', Icon: Waves},
  {key: 'TIP-UPS', label: 'TIP-UPS', Icon: Anchor},
  {key: 'SHELTER', label: 'SHELTER', Icon: Home},
];

const TAG_CHIPS: ChipItem[] = [
  {key: 'MORNING BITE', label: 'MORNING BITE', Icon: Timer},
  {key: 'DEEP HOLE', label: 'DEEP HOLE', Icon: Layers},
  {key: 'LIGHT TACKLE', label: 'LIGHT TACKLE', Icon: Zap},
  {key: 'SLOW DAY', label: 'SLOW DAY', Icon: Star},
];

const STEP_TITLES = [
  'ICE THICKNESS',
  'WEATHER OVER THE HOLE',
  'SLED LOADOUT',
  'WHAT CAME UP',
];

const BLOBS = [
  {size: 210, color: 'rgba(0,166,203,0.12)', top: -50, left: -60},
  {size: 160, color: 'rgba(255,255,255,0.26)', bottom: 180, right: -50},
];

export default function ActivityScreen({draft, onBack, onFinish}: Props) {
  const [step, setStep] = useState(1);
  const [entry, setEntry] = useState<Draft>(draft);
  const {opacity, translateY} = useScreenTransition();
  const units = useUnits();
  const threshold = useSafeThreshold();
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  const safe = isSafe(entry.iceCm, threshold);
  const safety = safetyScore(entry.gear);
  const caught = totalCatch(entry.catch);
  const committable = canCommit(entry);
  const refusal = blockedReason(entry);

  const setIce = useCallback((cm: number) => {
    setEntry(prev => ({...prev, iceCm: cm}));
  }, []);

  const setWeather = useCallback((key: string) => {
    setEntry(prev => ({...prev, weather: key as WeatherKey}));
  }, []);

  const stepTemp = useCallback((delta: number) => {
    setEntry(prev => ({...prev, tempC: clampTemp(prev.tempC + delta)}));
  }, []);

  const toggleGear = useCallback((key: string) => {
    setEntry(prev => {
      const gear = prev.gear.slice();
      const at = gear.indexOf(key as GearKey);
      if (at >= 0) {
        gear.splice(at, 1);
      } else {
        gear.push(key as GearKey);
      }
      return {...prev, gear};
    });
  }, []);

  const toggleTag = useCallback((key: string) => {
    setEntry(prev => {
      const tags = prev.tags.slice();
      const at = tags.indexOf(key as NoteTag);
      if (at >= 0) {
        tags.splice(at, 1);
      } else {
        tags.push(key as NoteTag);
      }
      return {...prev, tags};
    });
  }, []);

  const addCatch = useCallback((index: number) => {
    setEntry(prev => {
      const next = prev.catch.slice();
      next[index] = (next[index] || 0) + 1;
      return {...prev, catch: next};
    });
  }, []);

  const onPrimary = useCallback(() => {
    if (step < ENTRY_STEPS) {
      setStep(s => s + 1);
      return;
    }
    commitDraft(entry);
    finishRef.current();
  }, [entry, step]);

  const onAbort = useCallback(() => {
    commitDraft(entry, 'aborted');
    finishRef.current();
  }, [entry]);

  const statItems = useMemo(
    () => [
      {
        label: 'ICE',
        value: entry.iceCm > 0 ? formatThicknessShort(entry.iceCm, units) : '-',
        tone: safe ? theme.colors.success : theme.colors.danger,
      },
      {
        label: 'SAFETY',
        value: safety > 0 ? safety + '/3' : '-',
        tone: theme.colors.deep,
      },
      {
        label: 'CATCH',
        value: caught > 0 ? String(caught) : '-',
        tone: caught > 0 ? theme.colors.warm : theme.colors.text.muted,
      },
    ],
    [caught, entry.iceCm, safe, safety, units],
  );

  return (
    <ScreenShell overlay={theme.gradients.activity} blobs={BLOBS}>
      <ScreenHeader
        title={'ICE ENTRY - STEP ' + step + '/' + ENTRY_STEPS}
        subtitle={STEP_TITLES[step - 1]}
        leftSlot={
          <RoundIconButton
            Icon={ArrowLeft}
            onPress={onBack}
            accessibilityLabel="Back to home"
          />
        }
        rightSlot={
          <RoundIconButton
            source={iconPause}
            onPress={onAbort}
            accessibilityLabel="Abort this run"
          />
        }
      />

      <View style={styles.railWrap}>
        <StepRail step={step} total={ENTRY_STEPS} />
      </View>

      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.board,
          {opacity: opacity, transform: [{translateY: translateY}]},
        ]}>
        {step === 1 ? (
          <View style={styles.stepWrap}>
            <IceGauge
              valueCm={entry.iceCm}
              thresholdCm={threshold}
              units={units}
              onChange={setIce}
            />
            <View style={styles.verdictWrap}>
              <VerdictChip safe={safe} thresholdCm={threshold} units={units} />
            </View>
          </View>
        ) : null}

        {step === 2 ? (
          <View style={styles.stepWrap}>
            <ChipBoard
              items={WEATHER_CHIPS}
              selected={[entry.weather]}
              mode="single"
              tileHeight={86}
              onToggle={setWeather}
            />
            <View style={styles.tempRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Colder"
                hitSlop={HIT_SLOP}
                onPress={() => stepTemp(-TEMP_STEP_C)}
                style={styles.tempBtn}>
                <Minus size={20} color={theme.colors.deep} strokeWidth={2.6} />
              </Pressable>
              <View style={styles.tempValueWrap}>
                <Thermometer size={18} color={theme.colors.deep} strokeWidth={2.2} />
                <Text style={styles.tempValue}>{formatTemp(entry.tempC)}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Warmer"
                hitSlop={HIT_SLOP}
                onPress={() => stepTemp(TEMP_STEP_C)}
                style={styles.tempBtn}>
                <Plus size={20} color={theme.colors.deep} strokeWidth={2.6} />
              </Pressable>
            </View>
          </View>
        ) : null}

        {step === 3 ? (
          <View style={styles.stepWrap}>
            <ChipBoard
              items={GEAR_CHIPS}
              selected={entry.gear}
              mode="multi"
              tileHeight={92}
              onToggle={toggleGear}
            />
            <View style={styles.safetyNote}>
              <Text style={styles.safetyValue}>{safety + '/3'}</Text>
              <Text style={styles.safetyText}>
                SAFETY ITEMS IN THE SLED - AUGER, ROPE, SPIKES
              </Text>
            </View>
          </View>
        ) : null}

        {step === 4 ? (
          <View style={styles.stepWrap}>
            <View style={[styles.speciesBoard, {width: BOARD_W}]}>
              {SPECIES_NAMES.map((name, i) => (
                <SpeciesCard
                  key={name}
                  index={i}
                  name={name}
                  count={entry.catch[i] || 0}
                  discovered
                  height={104}
                  onPress={() => addCatch(i)}
                />
              ))}
            </View>
            <ChipBoard
              items={TAG_CHIPS}
              selected={entry.tags}
              mode="multi"
              tileHeight={58}
              onToggle={toggleTag}
            />
          </View>
        ) : null}
      </Animated.View>

      <View style={styles.panel}>
        {entry.objective ? (
          <View style={styles.objective}>
            <Star size={14} color={theme.colors.warm} strokeWidth={2.6} />
            <Text style={styles.objectiveText} numberOfLines={1}>
              {entry.objective}
            </Text>
          </View>
        ) : null}

        <StatStrip items={statItems} />

        {step === ENTRY_STEPS && refusal ? (
          <Text style={styles.refusal}>{refusal}</Text>
        ) : (
          <View style={styles.panelGap} />
        )}

        <PrimaryButton
          label={step < ENTRY_STEPS ? 'NEXT STEP' : 'SAVE ENTRY'}
          Icon={step < ENTRY_STEPS ? Plus : Save}
          onPress={onPrimary}
          disabled={step === ENTRY_STEPS && !committable}
        />

        <View style={styles.panelGap} />

        <SecondaryButton label="ABORT RUN" tone="danger" onPress={onAbort} />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  railWrap: {paddingTop: 10, paddingBottom: 2},
  board: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  stepWrap: {alignItems: 'center', justifyContent: 'center'},
  verdictWrap: {marginTop: 12, width: BOARD_W, alignItems: 'center'},
  tempRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  tempBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.80)',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tempValueWrap: {
    minWidth: 120,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.66)',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tempValue: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  safetyNote: {
    marginTop: 12,
    width: BOARD_W,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(255,255,255,0.66)',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  safetyValue: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.deep,
    fontVariant: ['tabular-nums'],
  },
  safetyText: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    lineHeight: 14,
    color: theme.colors.text.secondary,
  },
  speciesBoard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
  },
  panel: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: PANEL_BOTTOM_PAD,
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    backgroundColor: theme.colors.tileStrong,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    shadowColor: '#00558B',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: -6},
    elevation: 12,
  },
  panelGap: {height: 12},
  objective: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    backgroundColor: 'rgba(242,166,90,0.16)',
  },
  objectiveText: {
    flex: 1,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#8A5415',
  },
  refusal: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: theme.colors.danger,
    textAlign: 'center',
  },
});
