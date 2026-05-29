import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

interface Props {
  color: string;
  size?: number;
  pulse?: boolean;
}

export default function LED({ color, size = 8, pulse = false }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!pulse) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.35, duration: 900, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, opacity]);

  return (
    <View style={{
      width: size + 4,
      height: size + 4,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <View style={{
        position: 'absolute',
        width: size + 4,
        height: size + 4,
        borderRadius: (size + 4) / 2,
        backgroundColor: color,
        opacity: 0.18,
      }} />
      <Animated.View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity,
          boxShadow: `0 0 ${size}px ${color}`,
        }}
      />
    </View>
  );
}
