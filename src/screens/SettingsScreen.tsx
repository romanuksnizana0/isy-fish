/**
 * Five options, each with a real persisted effect. There is no audio in this
 * app, so there is no volume control — a dead switch is worse than no switch.
 */
import React, {useState} from 'react';
import {Animated, ScrollView, StyleSheet, Text, View} from 'react-native';
import {
  Activity,
  ArrowLeft,
  Eye,
  Ruler,
  Snowflake,
  Trash2,
} from 'lucide-react-native';
import {
  PANEL_BOTTOM_PAD,
  SAFE_THRESHOLD_MAX_CM,
  SAFE_THRESHOLD_MIN_CM,
} from '../constants/config';
import {iconHome} from '../assets';
import {theme} from '../constants/theme';
import ScreenShell from '../components/ScreenShell';
import ScreenHeader from '../components/ScreenHeader';
import RoundIconButton from '../components/RoundIconButton';
import SettingRow from '../components/SettingRow';
import SecondaryButton from '../components/SecondaryButton';
import {resetSeason} from '../game/ledgerStore';
import type {Units} from '../game/ledgerStore';
import {
  setSafeThreshold,
  setUnits,
  toggleHighContrast,
  toggleReducedMotion,
  useHighContrast,
  useReducedMotion,
  useSafeThreshold,
  useUnits,
} from '../hooks/useSettings';
import {useScreenTransition} from '../hooks/useScreenTransition';
import {formatThickness} from '../utils/format';

type Props = {
  onMenu: () => void;
};

const BLOBS = [
  {size: 220, color: 'rgba(0,166,203,0.10)', top: -60, right: -60},
  {size: 160, color: 'rgba(255,255,255,0.30)', bottom: 140, left: -50},
];

export default function SettingsScreen({onMenu}: Props) {
  const {opacity, translateY} = useScreenTransition();
  const units = useUnits();
  const threshold = useSafeThreshold();
  const highContrast = useHighContrast();
  const reducedMotion = useReducedMotion();
  const [armed, setArmed] = useState(false);

  const onReset = () => {
    if (!armed) {
      setArmed(true);
      return;
    }
    resetSeason();
    setArmed(false);
  };

  return (
    <ScreenShell overlay={theme.gradients.settings} blobs={BLOBS}>
      <ScreenHeader
        title="SETTINGS"
        subtitle="OFFLINE - NO ACCOUNT - NO ADS"
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
          <SettingRow
            kind="segment"
            label="UNITS"
            hint="Every thickness readout, the gauge and the pin requirements."
            Icon={Ruler}
            options={['CM', 'IN']}
            selected={units.toUpperCase()}
            onSelect={value => setUnits(value.toLowerCase() as Units)}
          />

          <SettingRow
            kind="stepper"
            label="SAFE ICE THRESHOLD"
            hint="Drives the SAFE / UNSAFE verdict, the report headline and the pin gate."
            Icon={Snowflake}
            valueText={formatThickness(threshold, units)}
            canDown={threshold > SAFE_THRESHOLD_MIN_CM}
            canUp={threshold < SAFE_THRESHOLD_MAX_CM}
            onStep={delta =>
              setSafeThreshold(
                Math.max(
                  SAFE_THRESHOLD_MIN_CM,
                  Math.min(SAFE_THRESHOLD_MAX_CM, threshold + delta),
                ),
              )
            }
          />

          <SettingRow
            kind="switch"
            label="HIGH CONTRAST"
            hint="Thicker card borders and a quieter background photo."
            Icon={Eye}
            on={highContrast}
            onToggle={toggleHighContrast}
          />

          <SettingRow
            kind="switch"
            label="REDUCED MOTION"
            hint="Collapses springs and staggers into a short fade."
            Icon={Activity}
            on={reducedMotion}
            onToggle={toggleReducedMotion}
          />

          <SettingRow
            kind="danger"
            label="RESET SEASON DATA"
            hint="Clears entries, pins, the collection and every streak."
            Icon={Trash2}
            actionLabel={armed ? 'CONFIRM RESET' : 'RESET'}
            onAction={onReset}
          />

          {armed ? (
            <Text style={styles.armed}>
              PRESS CONFIRM RESET AGAIN TO CLEAR THE SEASON - THE FIRST PRESS
              CHANGES NOTHING
            </Text>
          ) : (
            <Text style={styles.footnote}>
              EVERY OPTION IS SAVED AND APPLIES ACROSS THE WHOLE APP
            </Text>
          )}
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
    paddingTop: 14,
    paddingBottom: PANEL_BOTTOM_PAD,
  },
  scroll: {flex: 1},
  scrollInner: {paddingBottom: 12},
  footnote: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: theme.colors.text.muted,
  },
  armed: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    lineHeight: 14,
    color: theme.colors.danger,
  },
});
