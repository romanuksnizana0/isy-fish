/**
 * The one primary call-to-action. Pressable is the PARENT and the animated
 * layer is its CHILD, which is the only arrangement that keeps onPress alive on
 * Android release builds.
 *
 * Icon geometry is fixed: a 24 x 24 box, gap 10, and a label whose lineHeight
 * equals the icon height, so the glyph and the text share one baseline.
 */
import React from 'react';
import type {ForwardRefExoticComponent} from 'react';
import {
  Animated,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type {SvgProps} from 'react-native-svg';
import {buttonRect} from '../assets';
import {CTA_HEIGHT, CTA_HIT_SLOP} from '../constants/config';
import {theme} from '../constants/theme';
import {usePressScale} from '../hooks/usePressScale';

/**
 * Every icon in the app is a lucide-react-native glyph. The package does not
 * export its own `LucideIcon` type, so the app owns one that matches it
 * exactly — otherwise each `Icon={Snowflake}` would be a type error.
 */
export type IconComponent = ForwardRefExoticComponent<
  SvgProps & {size?: string | number; absoluteStrokeWidth?: boolean}
>;

type Props = {
  label: string;
  Icon?: IconComponent;
  onPress: () => void;
  disabled?: boolean;
  height?: number;
  large?: boolean;
  accessibilityLabel?: string;
};

const ICON = 24;

export default function PrimaryButton({
  label,
  Icon,
  onPress,
  disabled,
  height,
  large,
  accessibilityLabel,
}: Props) {
  const {scale, onPressIn, onPressOut} = usePressScale(0.96);
  const buttonHeight = height ?? CTA_HEIGHT;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{disabled: !!disabled}}
      disabled={disabled}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={CTA_HIT_SLOP}
      style={[
        styles.press,
        {height: buttonHeight},
        disabled ? styles.pressDisabled : theme.shadows.cta,
      ]}>
      <Animated.View style={[styles.fill, {transform: [{scale}]}]}>
        <ImageBackground
          source={buttonRect}
          resizeMode="stretch"
          style={styles.fill}
          imageStyle={styles.plate}>
          <LinearGradient
            colors={
              disabled
                ? (theme.gradients.ctaDisabled as unknown as string[])
                : (theme.gradients.cta as unknown as string[])
            }
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.gradient}
          />
          <View style={styles.row}>
            {Icon ? (
              <View style={styles.iconBox}>
                <Icon size={ICON} color={theme.colors.text.onDark} strokeWidth={2.2} />
              </View>
            ) : null}
            <Text style={[styles.label, large ? styles.labelLarge : null]}>
              {label}
            </Text>
          </View>
        </ImageBackground>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    width: '100%',
    borderRadius: theme.radius.lg,
  },
  pressDisabled: {opacity: 0.45},
  fill: {
    width: '100%',
    height: '100%',
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  plate: {borderRadius: theme.radius.lg, opacity: 0.55},
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.92,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 14,
  },
  iconBox: {
    width: ICON,
    height: ICON,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    lineHeight: ICON,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: theme.colors.text.onDark,
    textAlign: 'center',
  },
  labelLarge: {fontSize: 19, letterSpacing: 1.3},
});
