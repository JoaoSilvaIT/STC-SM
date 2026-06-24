import React from 'react';
import { View, Text, type ViewStyle, type StyleProp } from 'react-native';
import { radius, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface Props {
  label?: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
  accent?: 'amber' | 'go' | 'stop' | 'sky' | 'none';
}

export default function Panel({ label, trailing, children, style, bodyStyle, accent = 'none' }: Props) {
  const { colors, typography } = useTheme();
  const accentLine: Record<NonNullable<Props['accent']>, string> = {
    amber: colors.amber,
    go:    colors.go,
    stop:  colors.stop,
    sky:   colors.sky,
    none:  colors.border,
  };
  const accentColor = accentLine[accent];
  return (
    <View style={[{
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    }, style]}>
      {label && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.md,
          paddingTop: spacing.md - 2,
          paddingBottom: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.hairline,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            {accent !== 'none' && (
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }} />
            )}
            <Text style={typography.label}>{label}</Text>
          </View>
          {trailing}
        </View>
      )}
      <View style={[{ padding: spacing.md }, bodyStyle]}>
        {children}
      </View>
    </View>
  );
}
