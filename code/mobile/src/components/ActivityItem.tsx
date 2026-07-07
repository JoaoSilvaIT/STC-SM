import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Activity, ActivityType } from '../types/domain';
import { fonts, spacing, type Palette } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

const makeIconMap = (colors: Palette): Record<ActivityType, { name: keyof typeof Ionicons.glyphMap; color: string }> => ({
  SHIFT_STARTED:        { name: 'play',              color: colors.amber },
  SHIFT_ENDED:          { name: 'stop',              color: colors.textMuted },
  TOOL_REMOVED:         { name: 'arrow-up',          color: colors.warn },
  TOOL_RETURNED:        { name: 'arrow-down',        color: colors.go },
  TOOL_BROKEN:          { name: 'warning',           color: colors.stop },
  TOOL_MISSING:         { name: 'search',            color: colors.stop },
  TOOL_MISSING_DETECTED:{ name: 'search',            color: colors.stop },
  TOOL_IN_MAINTENANCE:  { name: 'construct',         color: colors.warn },
  DOOR_OPENED:          { name: 'lock-open-outline', color: colors.sky },
  DOOR_CLOSED:          { name: 'lock-closed',       color: colors.sky },
  CABINET_ONLINE:       { name: 'checkmark-circle',  color: colors.go },
  CABINET_OFFLINE:      { name: 'close-circle',      color: colors.stop },
  CABINET_ANOMALY:      { name: 'alert',             color: colors.stop },
  CABINET_BROKEN:       { name: 'alert-circle',      color: colors.stop },
});

function relTime(iso: string, t: TFunction): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1)  return t('activity.time.justNow');
  if (mins < 60) return t('activity.time.minsAgo', { count: mins });
  return t('activity.time.hoursAgo', { count: Math.floor(mins / 60) });
}

function describeActivity(act: Activity, t: TFunction): string {
  const tool = act.toolName ? act.toolName : (act.toolId ? `Tool #${act.toolId}` : t('common.tool'));
  switch (act.type) {
    case 'SHIFT_STARTED':         return t('activity.type.shiftStarted');
    case 'SHIFT_ENDED':           return t('activity.type.shiftEnded');
    case 'TOOL_REMOVED':          return t('activity.type.toolRemoved', { tool });
    case 'TOOL_RETURNED':         return t('activity.type.toolReturned', { tool });
    case 'TOOL_BROKEN':           return t('activity.type.toolBroken', { tool });
    case 'TOOL_MISSING':          return t('activity.type.toolMissing', { tool });
    case 'TOOL_MISSING_DETECTED': return t('activity.type.toolMissingDetected', { tool });
    case 'TOOL_IN_MAINTENANCE':   return t('activity.type.toolInMaintenance', { tool });
    case 'DOOR_OPENED':           return t('activity.type.doorOpened');
    case 'DOOR_CLOSED':           return t('activity.type.doorClosed');
    case 'CABINET_ONLINE':        return t('activity.type.cabinetOnline');
    case 'CABINET_OFFLINE':       return t('activity.type.cabinetOffline');
    case 'CABINET_ANOMALY':       return t('activity.type.cabinetAnomaly');
    case 'CABINET_BROKEN':        return t('activity.type.cabinetBroken');
  }
}

interface Props {
  activity: Activity;
  isLast?: boolean;
}

export default function ActivityItem({ activity, isLast = false }: Props) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const { name, color } = makeIconMap(colors)[activity.type];
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
            {describeActivity(activity, t)}
          </Text>
          <Text style={{
            fontFamily: fonts.mono,
            fontSize: 10,
            color: colors.textDim,
            letterSpacing: 1,
          }}>
            {relTime(activity.timestamp, t)}
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
