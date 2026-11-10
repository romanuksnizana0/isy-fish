/**
 * The 44 px round plate used for Back and for the run-abort control. Takes
 * either a lucide icon component or one of the generated PNG glyphs.
 */
import React from 'react';
import {
  Animated,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import type {ImageSourcePropType} from 'react-native';
import {buttonRound} from '../assets';
import {HEADER_HIT_SLOP} from '../constants/config';
import {theme} from '../constants/theme';
import {usePressScale} from '../hooks/usePressScale';
import type {IconComponent} from './PrimaryButton';

type Props = {
  onPress: () => void;
  Icon?: IconComponent;
  source?: ImageSourcePropType;
  accessibilityLabel: string;
};

const SIZE = 44;
const GLYPH = 24;

export default function RoundIconButton({
  onPress,
  Icon,
  source,
  accessibilityLabel,
}: Props) {
  const {scale, onPressIn, onPressOut} = usePressScale(0.92);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HEADER_HIT_SLOP}
      style={styles.press}>
      <Animated.View style={[styles.inner, {transform: [{scale}]}]}>
        <ImageBackground
          source={buttonRound}
          resizeMode="contain"
          style={styles.plate}
          imageStyle={styles.plateImage}>
          <View style={styles.glyphBox}>
            {source ? (
              <Image source={source} style={styles.glyph} resizeMode="contain" />
            ) : Icon ? (
              <Icon size={GLYPH} color={theme.colors.text.primary} strokeWidth={2.2} />
            ) : null}
          </View>
        </ImageBackground>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.80)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  plate: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateImage: {opacity: 0.5},
  glyphBox: {
    width: GLYPH,
    height: GLYPH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {width: GLYPH, height: GLYPH},
});
