/**
 * Every screen's background stack: the one generated photo, a per-screen
 * gradient overlay and two or three soft blobs. Depth is always at least three
 * layers, and the overlay is what makes each screen read differently.
 */
import React from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {bgGame} from '../assets';
import {theme} from '../constants/theme';
import {useHighContrast} from '../hooks/useSettings';

export type Blob = {
  size: number;
  color: string;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

type Props = {
  overlay: readonly string[];
  locations?: readonly number[];
  diagonal?: boolean;
  blobs?: readonly Blob[];
  horizon?: boolean;
  children: React.ReactNode;
};

const DEFAULT_BLOBS: Blob[] = [
  {size: 220, color: 'rgba(0,166,203,0.12)', top: -60, left: -50},
  {size: 150, color: 'rgba(0,85,139,0.10)', top: 220, right: -56},
];

export default function ScreenShell({
  overlay,
  locations,
  diagonal,
  blobs,
  horizon,
  children,
}: Props) {
  const highContrast = useHighContrast();
  const list = blobs && blobs.length > 0 ? blobs : DEFAULT_BLOBS;

  return (
    <View style={styles.root}>
      <ImageBackground
        source={bgGame}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
        imageStyle={{opacity: highContrast ? 0.76 : 0.88}}
      />
      <LinearGradient
        colors={overlay as string[]}
        locations={locations as number[] | undefined}
        start={diagonal ? {x: 0, y: 0} : {x: 0.5, y: 0}}
        end={diagonal ? {x: 1, y: 1} : {x: 0.5, y: 1}}
        style={StyleSheet.absoluteFill}
      />
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {list.map((b, i) => (
          <View
            key={'blob' + i}
            style={[
              styles.blob,
              {
                width: b.size,
                height: b.size,
                borderRadius: b.size / 2,
                backgroundColor: b.color,
                top: b.top,
                bottom: b.bottom,
                left: b.left,
                right: b.right,
              },
            ]}
          />
        ))}
        {horizon ? <View style={styles.horizon} /> : null}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: theme.colors.bg.base},
  content: {flex: 1},
  blob: {position: 'absolute'},
  horizon: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '38%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
});
