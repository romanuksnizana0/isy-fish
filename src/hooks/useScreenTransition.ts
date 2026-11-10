/**
 * The entrance every screen shares: a short cross-fade plus a 12 px lift.
 * Transform and opacity only, so the native driver is safe here.
 */
import {useEffect, useRef} from 'react';
import {Animated} from 'react-native';
import {REDUCED_MOTION_MS, SCREEN_FADE_MS} from '../constants/config';
import {useReducedMotion} from './useSettings';

export function useScreenTransition() {
  const progress = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();

  useEffect(() => {
    progress.setValue(0);
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: reduced ? REDUCED_MOTION_MS : SCREEN_FADE_MS,
      useNativeDriver: true,
    });
    anim.start();
    return () => {
      anim.stop();
    };
  }, [progress, reduced]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });

  return {opacity: progress, translateY};
}

/**
 * Staggered entrance for bento tiles. `index` spaces the delay 60 ms apart.
 */
export function useStagger(index: number) {
  const progress = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();

  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: reduced ? REDUCED_MOTION_MS : 300,
      delay: reduced ? 0 : index * 60,
      useNativeDriver: true,
    });
    anim.start();
    return () => {
      anim.stop();
    };
  }, [index, progress, reduced]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 0],
  });

  return {opacity: progress, translateY};
}
