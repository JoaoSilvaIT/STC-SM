import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Props {
  rows?: number;
  cols?: number;
  opacity?: number;
}

export default function GridBackdrop({ rows = 22, cols = 9, opacity = 0.5 }: Props) {
  const { colors } = useTheme();
  const lines: React.ReactNode[] = [];
  for (let i = 1; i < rows; i++) {
    lines.push(
      <View
        key={`h${i}`}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${(i / rows) * 100}%`,
          height: 1,
          backgroundColor: colors.hairline,
        }}
      />
    );
  }
  for (let j = 1; j < cols; j++) {
    lines.push(
      <View
        key={`v${j}`}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${(j / cols) * 100}%`,
          width: 1,
          backgroundColor: colors.hairline,
        }}
      />
    );
  }
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity,
      }}
    >
      {lines}
    </View>
  );
}
