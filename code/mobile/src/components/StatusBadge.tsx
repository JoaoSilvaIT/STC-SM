import React from 'react';
import { View, Text } from 'react-native';
import type { ToolStatus } from '../types/domain';
import { colors, fonts, radius, statusInk } from '../theme';
import LED from './LED';

interface Props {
  status: ToolStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: Props) {
  const ink = statusInk[status];
  const isMd = size === 'md';
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: isMd ? 12 : 10,
      paddingVertical: isMd ? 6 : 4,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: ink.ink + '40',
      backgroundColor: ink.soft + '55',
    }}>
      <LED color={ink.ink} size={isMd ? 8 : 6} pulse={status === 'IN_USE'} />
      <Text style={{
        fontFamily: fonts.displayBold,
        fontSize: isMd ? 12 : 10,
        letterSpacing: 1.4,
        color: ink.ink,
      }}>
        {ink.label}
      </Text>
    </View>
  );
}
