/**
 * Press feedback the safe way on this stack: the Pressable stays the PARENT and
 * drives an Animated.View CHILD. No native-driver transform ever sits above a
 * touch target, so onPress cannot be swallowed on Android release.
 */
import {useCallback, useRef} from 'react';
import {Animated} from 'react-native';
import {theme} from '../constants/theme';
import {useReducedMotion} from './useSettings';

export function usePressScale(target: number = 0.96) {
  const scale = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotion();

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: reduced ? 1 : target,
      tension: theme.animation.press.tension,
      friction: theme.animation.press.friction,
      useNativeDriver: true,
    }).start();
  }, [reduced, scale, target]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: theme.animation.press.tension,
      friction: theme.animation.press.friction,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  return {scale, onPressIn, onPressOut};
}
