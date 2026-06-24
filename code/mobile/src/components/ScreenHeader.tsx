import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface Props {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  trailing?: React.ReactNode;
}

export default function ScreenHeader({ title, subtitle, onBack, trailing }: Props) {
  const { colors, typography } = useTheme();
  return (
    <View style={{
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.hairline,
      gap: spacing.md,
    }}>
      {onBack && (
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          hitSlop={10}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="chevron-back" size={18} color={colors.textHi} />
        </TouchableOpacity>
      )}
      <View style={{ flex: 1 }}>
        {subtitle && (
          <Text style={[typography.label, { marginBottom: 2 }]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
        <Text style={{
          fontFamily: fonts.displayBold,
          fontSize: 22,
          color: colors.textHi,
          letterSpacing: 0.3,
        }} numberOfLines={1}>
          {title}
        </Text>
      </View>
      {trailing}
    </View>
  );
}
