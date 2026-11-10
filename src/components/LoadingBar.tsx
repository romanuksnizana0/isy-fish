/**
 * The splash progress bar. Width is a layout property, so the fill animates on
 * the JS driver — this file never uses the native driver, which keeps the two
 * kinds of animation from ever meeting in one place.
 */
import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {theme} from '../constants/theme';

type Props = {
  durationMs: number;
  width?: number;
};

export default function LoadingBar({durationMs, width}: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const w = width ?? 200;

  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: durationMs,
      useNativeDriver: false,
    });
    anim.start();
    return () => {
      anim.stop();
    };
  }, [durationMs, progress]);

  const fill = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['4%', '100%'],
  });

  return (
    <View style={[styles.track, {width: w}]}>
      <Animated.View style={[styles.fill, {width: fill}]}>
        <LinearGradient
          colors={theme.gradients.progress as unknown as string[]}
          start={{x: 0, y: 0.5}}
          end={{x: 1, y: 0.5}}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  fill: {height: '100%', borderRadius: 3, overflow: 'hidden'},
  gradient: {width: '100%', height: '100%'},
});
