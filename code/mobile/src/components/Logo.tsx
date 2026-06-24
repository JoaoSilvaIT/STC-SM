import React from 'react';
import { View, Text } from 'react-native';
import { colors, fonts } from '../theme';

interface Props {
  size?: number;
  tone?: 'amber' | 'mute';
}

export default function Logo({ size = 56, tone = 'amber' }: Props) {
  const stroke = tone === 'amber' ? colors.amber : colors.text;
  const fill   = tone === 'amber' ? colors.amberGlow : 'transparent';
  return (
    <View style={{ width: size, height: size + 20, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderWidth: 1,
          borderColor: stroke,
          backgroundColor: fill,
          transform: [{ rotate: '45deg' }],
          borderRadius: size * 0.08,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size * 0.6,
          height: size * 0.6,
          borderWidth: 1,
          borderColor: stroke,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          width: size * 0.18,
          height: size * 0.18,
          backgroundColor: stroke,
          boxShadow: `0 0 ${size * 0.18}px ${stroke}`,
        }}
      />
      <Text
        style={{
          position: 'absolute',
          bottom: -16,
          fontFamily: fonts.mono,
          fontSize: 9,
          letterSpacing: 3,
          color: colors.textMuted,
        }}
      >
        STC·SM
      </Text>
    </View>
  );
}
