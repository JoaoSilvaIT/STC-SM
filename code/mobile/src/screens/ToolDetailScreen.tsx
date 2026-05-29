import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useShift } from '../context/ShiftContext';
import StatusBadge from '../components/StatusBadge';
import ScreenHeader from '../components/ScreenHeader';
import Panel from '../components/Panel';
import { colors, fonts, spacing, radius, typography, btn, layout, statusInk } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ToolDetail'>;

export default function ToolDetailScreen({ route, navigation }: Props) {
  const { toolId }                                          = route.params;
  const { cabinetTools, activeCabinet, takeTool, returnTool, markBroken } = useShift();
  const tool = cabinetTools.find(t => t.id === toolId);

  if (!tool) return null;

  const cabinet = activeCabinet;
  const ink     = statusInk[tool.status];

  function handleMarkBroken() {
    Alert.alert(
      'Mark As Broken',
      `Confirm tool "${tool!.name}" is non-serviceable. This will remove it from the available pool.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Mark Broken', style: 'destructive', onPress: async () => { await markBroken(toolId); navigation.goBack(); } },
      ],
    );
  }

  return (
    <SafeAreaView style={layout.screen} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="Tool"
        subtitle={`ID · #${tool.id}`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.hero}>
          <View style={[s.heroAccent, { backgroundColor: ink.ink }]} />
          <View style={s.heroBody}>
            <Text style={s.heroLabel}>{cabinet?.name} · {cabinet?.location}</Text>
            <Text style={s.heroName} selectable>{tool.name}</Text>
            <Text style={s.heroPart} selectable>{tool.partNumber}</Text>
            <View style={{ marginTop: spacing.md }}>
              <StatusBadge status={tool.status} size="md" />
            </View>
          </View>
        </View>

        <Panel label="Specifications">
          <Row label="PART NUMBER"    value={tool.partNumber} mono />
          <Row label="CABINET"        value={cabinet?.name ?? '—'} />
          <Row label="BAY"            value={cabinet?.location ?? '—'} />
          <Row label="CURRENT STATUS" value={ink.label} color={ink.ink} mono last />
        </Panel>

        <View style={{ height: spacing.md }} />

        <Text style={[typography.label, { marginBottom: spacing.sm }]}>ACTIONS</Text>

        <View style={{ gap: spacing.sm }}>
          {tool.status === 'AVAILABLE' && (
            <TouchableOpacity
              style={btn.primary}
              onPress={async () => { await takeTool(toolId); navigation.goBack(); }}
              activeOpacity={0.85}
            >
              <Ionicons name="arrow-up-circle" size={16} color="#0A0A0A" />
              <Text style={btn.primaryLabel}>Take Tool</Text>
            </TouchableOpacity>
          )}

          {tool.status === 'IN_USE' && (
            <TouchableOpacity
              style={[btn.primary, { backgroundColor: colors.go, boxShadow: '0 6px 24px rgba(61, 220, 151, 0.22)' }]}
              onPress={async () => { await returnTool(toolId); navigation.goBack(); }}
              activeOpacity={0.85}
            >
              <Ionicons name="arrow-down-circle" size={16} color="#072014" />
              <Text style={[btn.primaryLabel, { color: '#072014' }]}>Return Tool</Text>
            </TouchableOpacity>
          )}

          {(tool.status === 'AVAILABLE' || tool.status === 'IN_USE') && (
            <TouchableOpacity style={s.dangerOutline} onPress={handleMarkBroken} activeOpacity={0.85}>
              <Ionicons name="warning" size={14} color={colors.stop} />
              <Text style={[btn.label, { color: colors.stop }]}>Mark As Broken</Text>
            </TouchableOpacity>
          )}

          {tool.status === 'BROKEN' && (
            <View style={s.notice}>
              <Ionicons name="construct" size={16} color={colors.stop} />
              <Text style={[typography.body, { color: colors.stop, flex: 1 }]} selectable>
                Out of service. Tool must be inspected before returning to pool.
              </Text>
            </View>
          )}

          {tool.status === 'MISSING' && (
            <View style={s.notice}>
              <Ionicons name="search-outline" size={16} color={colors.warn} />
              <Text style={[typography.body, { color: colors.warn, flex: 1 }]} selectable>
                Tool location unknown. Report to supervisor if not found.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, mono, color, last }: { label: string; value: string; mono?: boolean; color?: string; last?: boolean }) {
  return (
    <View style={[s.row, last && { borderBottomWidth: 0, paddingBottom: 0 }]}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text
        selectable
        style={[
          mono ? typography.mono : typography.body,
          { color: color ?? (mono ? colors.textHi : colors.text), fontSize: 13, letterSpacing: mono ? 1 : 0 },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },

  hero: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  heroAccent: {
    width: 4,
    opacity: 0.8,
  },
  heroBody: { flex: 1, padding: spacing.md },
  heroLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  heroName: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: colors.textHi,
    letterSpacing: 0.3,
    lineHeight: 26,
  },
  heroPart: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.amber,
    letterSpacing: 1.5,
    marginTop: spacing.xs,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  rowLabel: {
    fontFamily: fonts.displayBold,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1.8,
  },

  dangerOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.stop + '55',
    borderRadius: radius.md,
    paddingVertical: 14,
    backgroundColor: colors.stopSoft + '40',
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
