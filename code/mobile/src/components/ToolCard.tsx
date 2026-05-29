import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Tool } from '../types/domain';
import StatusBadge from './StatusBadge';
import { colors, fonts, radius, spacing, statusInk, typography } from '../theme';

interface Props {
  tool: Tool;
  onPress: () => void;
}

export default function ToolCard({ tool, onPress }: Props) {
  const ink = statusInk[tool.status];
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        paddingLeft: spacing.md + 4,
        paddingRight: spacing.md,
        marginBottom: spacing.sm,
        position: 'relative',
        overflow: 'hidden',
      }}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        backgroundColor: ink.ink,
        opacity: 0.7,
      }} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={[typography.body, { color: colors.textHi, fontWeight: '600' }]} numberOfLines={1}>
          {tool.name}
        </Text>
        <Text style={{
          fontFamily: fonts.mono,
          fontSize: 11,
          color: colors.textMuted,
          letterSpacing: 1,
        }}>
          {tool.partNumber} · #{tool.id}
        </Text>
      </View>
      <StatusBadge status={tool.status} />
      <Ionicons name="chevron-forward" size={16} color={colors.textDim} />
    </TouchableOpacity>
  );
}
