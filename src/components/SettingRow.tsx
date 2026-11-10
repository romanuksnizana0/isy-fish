/**
 * One settings card. Four kinds, one shape: a 68 px bento row with an icon
 * well, a label, a one-line explanation of what the option actually changes,
 * and the control on the right.
 */
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Check, Minus, Plus} from 'lucide-react-native';
import {HIT_SLOP} from '../constants/config';
import {theme} from '../constants/theme';
import type {IconComponent} from './PrimaryButton';

type SegmentProps = {
  kind: 'segment';
  options: readonly string[];
  selected: string;
  onSelect: (value: string) => void;
};

type StepperProps = {
  kind: 'stepper';
  valueText: string;
  onStep: (delta: number) => void;
  canDown: boolean;
  canUp: boolean;
};

type SwitchProps = {
  kind: 'switch';
  on: boolean;
  onToggle: () => void;
};

type DangerProps = {
  kind: 'danger';
  actionLabel: string;
  onAction: () => void;
};

type Props = {
  label: string;
  hint: string;
  Icon: IconComponent;
} & (SegmentProps | StepperProps | SwitchProps | DangerProps);

export default function SettingRow(props: Props) {
  const {label, hint, Icon} = props;
  const danger = props.kind === 'danger';
  const tone = danger ? theme.colors.danger : theme.colors.deep;

  return (
    <View style={[styles.row, danger ? styles.rowDanger : null]}>
      <View style={[styles.iconWell, {backgroundColor: tone + '1A'}]}>
        <Icon size={20} color={tone} strokeWidth={2.2} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.label, danger ? styles.labelDanger : null]} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.hint} numberOfLines={2}>
          {hint}
        </Text>
      </View>
      <View style={styles.control}>
        {props.kind === 'segment' ? (
          <View style={styles.segment}>
            {props.options.map(opt => {
              const active = opt === props.selected;
              return (
                <Pressable
                  key={opt}
                  accessibilityRole="button"
                  accessibilityLabel={opt}
                  accessibilityState={{selected: active}}
                  hitSlop={HIT_SLOP}
                  onPress={() => props.onSelect(opt)}
                  style={[styles.segmentCell, active ? styles.segmentActive : null]}>
                  <Text
                    style={[styles.segmentText, active ? styles.segmentTextActive : null]}>
                    {opt}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {props.kind === 'stepper' ? (
          <View style={styles.stepper}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Lower"
              disabled={!props.canDown}
              hitSlop={HIT_SLOP}
              onPress={() => props.onStep(-1)}
              style={[styles.stepBtn, props.canDown ? null : styles.stepBtnOff]}>
              <Minus size={18} color={theme.colors.deep} strokeWidth={2.6} />
            </Pressable>
            <Text style={styles.stepValue}>{props.valueText}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Raise"
              disabled={!props.canUp}
              hitSlop={HIT_SLOP}
              onPress={() => props.onStep(1)}
              style={[styles.stepBtn, props.canUp ? null : styles.stepBtnOff]}>
              <Plus size={18} color={theme.colors.deep} strokeWidth={2.6} />
            </Pressable>
          </View>
        ) : null}

        {props.kind === 'switch' ? (
          <Pressable
            accessibilityRole="switch"
            accessibilityLabel={label}
            accessibilityState={{checked: props.on}}
            hitSlop={HIT_SLOP}
            onPress={props.onToggle}
            style={[styles.track, props.on ? styles.trackOn : null]}>
            <View style={[styles.knob, props.on ? styles.knobOn : null]}>
              {props.on ? (
                <Check size={12} color={theme.colors.text.onDark} strokeWidth={3} />
              ) : null}
            </View>
          </Pressable>
        ) : null}

        {props.kind === 'danger' ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={props.actionLabel}
            hitSlop={HIT_SLOP}
            onPress={props.onAction}
            style={styles.dangerBtn}>
            <Text style={styles.dangerText} numberOfLines={1}>
              {props.actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    gap: 10,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.tile,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rowDanger: {
    backgroundColor: theme.colors.dangerBg,
    borderColor: 'rgba(192,70,43,0.28)',
  },
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {flex: 1, justifyContent: 'center'},
  label: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    color: theme.colors.text.primary,
  },
  labelDanger: {color: theme.colors.danger},
  hint: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 13,
    color: theme.colors.text.secondary,
  },
  control: {alignItems: 'flex-end', justifyContent: 'center'},
  segment: {
    flexDirection: 'row',
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  segmentCell: {
    width: 48,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  segmentActive: {backgroundColor: theme.colors.deep},
  segmentText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    color: theme.colors.text.secondary,
  },
  segmentTextActive: {color: theme.colors.text.onDark},
  stepper: {flexDirection: 'row', alignItems: 'center', gap: 6},
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.80)',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stepBtnOff: {opacity: 0.4},
  stepValue: {
    minWidth: 44,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  track: {
    width: 62,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,85,139,0.12)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  trackOn: {backgroundColor: 'rgba(0,166,203,0.28)', borderColor: theme.colors.accent},
  knob: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  knobOn: {alignSelf: 'flex-end', backgroundColor: theme.colors.accent},
  dangerBtn: {
    minWidth: 116,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(192,70,43,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(192,70,43,0.40)',
  },
  dangerText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: theme.colors.danger,
  },
});
