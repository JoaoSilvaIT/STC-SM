import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Activity, ActivityType } from '../types/domain';
import { colors, fonts, spacing, typography } from '../theme';

const iconMap: Record<ActivityType, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
  SHIFT_STARTED:        { name: 'play',              color: colors.amber },
  SHIFT_ENDED:          { name: 'stop',              color: colors.textMuted },
  TOOL_REMOVED:         { name: 'arrow-up',          color: colors.warn },
  TOOL_RETURNED:        { name: 'arrow-down',        color: colors.go },
  TOOL_BROKEN:          { name: 'warning',           color: colors.stop },
  TOOL_MISSING_DETECTED:{ name: 'search',            color: colors.stop },
  DOOR_OPENED:          { name: 'lock-open-outline', color: colors.sky },
  DOOR_CLOSED:          { name: 'lock-closed',       color: colors.sky },
  CABINET_ONLINE:       { name: 'checkmark-circle',  color: colors.go },
  CABINET_OFFLINE:      { name: 'close-circle',      color: colors.stop },
  CABINET_ANOMALY:      { name: 'alert',             color: colors.stop },
};

function relTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1)  return 'JUST NOW';
  if (mins < 60) return `${mins}M AGO`;
  return `${Math.floor(mins / 60)}H AGO`;
}

function describeActivity(act: Activity): string {
  const tool = act.toolName ? act.toolName : (act.toolId ? `Tool #${act.toolId}` : null);
  switch (act.type) {
    case 'SHIFT_STARTED':         return 'Shift Started';
    case 'SHIFT_ENDED':           return 'Shift Ended';
    case 'TOOL_REMOVED':          return tool ? `${tool} Removed` : 'Tool Removed';
    case 'TOOL_RETURNED':         return tool ? `${tool} Returned` : 'Tool Returned';
    case 'TOOL_BROKEN':           return tool ? `${tool} Marked Broken` : 'Tool Marked Broken';
    case 'TOOL_MISSING_DETECTED': return tool ? `${tool} Missing` : 'Tool Missing';
    case 'DOOR_OPENED':           return 'Cabinet Door Opened';
    case 'DOOR_CLOSED':           return 'Cabinet Door Closed';
    case 'CABINET_ONLINE':        return 'Cabinet Online';
    case 'CABINET_OFFLINE':       return 'Cabinet Offline';
    case 'CABINET_ANOMALY':       return 'Cabinet Anomaly';
  }
}

interface Props {
  activity: Activity;
  isLast?: boolean;
}

export default function ActivityItem({ activity, isLast = false }: Props) {
  const { name, color } = iconMap[activity.type];
  return (
    <View style={{ flexDirection: 'row', gap: spacing.md, minHeight: 64 }}>
      <View style={{ width: 28, alignItems: 'center' }}>
        <View style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: colors.bgElevated,
          borderWidth: 1,
          borderColor: color + '55',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Ionicons name={name} size={14} color={color} />
        </View>
        {!isLast && (
          <View style={{
            flex: 1,
            width: 1,
            backgroundColor: colors.border,
            marginTop: 2,
          }} />
        )}
      </View>

      <View style={{ flex: 1, paddingBottom: spacing.md, gap: 2 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[typography.body, { color: colors.textHi }]}>
            {describeActivity(activity)}
          </Text>
          <Text style={{
            fontFamily: fonts.mono,
            fontSize: 10,
            color: colors.textDim,
            letterSpacing: 1,
          }}>
            {relTime(activity.timestamp)}
          </Text>
        </View>
        {activity.notes && (
          <Text style={[typography.small, { color: colors.textMuted }]} selectable numberOfLines={2}>
            {activity.notes}
          </Text>
        )}
      </View>
    </View>
  );
}
