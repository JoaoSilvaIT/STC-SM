import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useShift } from '../context/ShiftContext';
import { colors, fonts, spacing, radius, typography, btn, layout } from '../theme';
import GridBackdrop from '../components/GridBackdrop';
import Panel from '../components/Panel';
import LED from '../components/LED';

type Props = NativeStackScreenProps<RootStackParamList, 'ShiftDashboard'>;

function shiftDuration(iso: string): { h: string; m: string } {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return { h: String(h).padStart(2, '0'), m: String(m).padStart(2, '0') };
}

type ActionRow = {
  label: string;
  hint: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen: keyof RootStackParamList;
  accent: 'amber' | 'stop' | 'sky';
};

const ACTION_ROWS: ActionRow[] = [
  { label: 'Tools',          hint: 'Take or return tools',     icon: 'construct-outline',    screen: 'ToolList', accent: 'amber' },
  { label: 'Report Anomaly', hint: 'Log cabinet malfunction',  icon: 'alert-circle-outline', screen: 'Anomaly',  accent: 'stop'  },
  { label: 'Activity Log',   hint: 'Shift timeline',           icon: 'pulse-outline',        screen: 'Activity', accent: 'sky'   },
];

const accentInk: Record<ActionRow['accent'], string> = {
  amber: colors.amber,
  stop:  colors.stop,
  sky:   colors.sky,
};

export default function ShiftDashboardScreen({ navigation }: Props) {
  const { activeShift, activeCabinet, cabinetTools } = useShift();
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (!activeShift) return null;

  const cabinet   = activeCabinet;
  const available = cabinetTools.filter(t => t.status === 'AVAILABLE').length;
  const inUse     = cabinetTools.filter(t => t.status === 'IN_USE').length;
  const broken    = cabinetTools.filter(t => t.status === 'BROKEN' || t.status === 'MISSING').length;
  const total     = cabinetTools.length;
  const duration  = shiftDuration(activeShift.startTime);

  return (
    <SafeAreaView style={layout.screen} edges={['top', 'left', 'right']}>
      <GridBackdrop opacity={0.3} />

      <View style={s.statusBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <LED color={colors.go} size={6} pulse />
          <Text style={s.statusText}>ACTIVE SHIFT</Text>
        </View>
        <Text style={s.statusCode}>SH-{String(activeShift.id).padStart(4, '0')}</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.heroCard}>
          <View style={s.heroAmberBar} />
          <View style={s.heroTop}>
            <View>
              <Text style={s.heroEyebrow}>STATION</Text>
              <Text style={s.heroCabinet}>{cabinet?.name ?? '—'}</Text>
              <Text style={s.heroLocation}>{cabinet?.location}</Text>
            </View>
            <View style={s.regBadge}>
              <Text style={s.regLabel}>A/C REG</Text>
              <Text style={s.regValue} selectable>{activeShift.aircraftReg}</Text>
            </View>
          </View>

          <View style={s.timerRow}>
            <Text style={s.timerLabel}>ELAPSED</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={s.timerBig}>{duration.h}</Text>
              <Text style={s.timerUnit}>H</Text>
              <Text style={s.timerSep}>:</Text>
              <Text style={s.timerBig}>{duration.m}</Text>
              <Text style={s.timerUnit}>M</Text>
            </View>
          </View>
        </View>

        <Panel label="Inventory · Live" accent="amber" trailing={
          <Text style={s.panelMeta}>{total} TOOLS</Text>
        }>
          <View style={s.invRow}>
            <InvBlock value={available} label="AVAILABLE" color={colors.go} />
            <View style={s.invDivider} />
            <InvBlock value={inUse}     label="IN-USE"    color={colors.amber} />
            <View style={s.invDivider} />
            <InvBlock value={broken}    label="BROKEN"    color={colors.stop} muted={broken === 0} />
          </View>
          {inUse > 0 && (
            <View style={s.warningStrip}>
              <Ionicons name="information-circle" size={14} color={colors.amber} />
              <Text style={s.warningText} selectable>
                {inUse} tool{inUse !== 1 ? 's' : ''} currently checked out under your shift.
              </Text>
            </View>
          )}
        </Panel>

        <View style={{ height: spacing.sm }} />

        <View style={{ gap: spacing.sm }}>
          {ACTION_ROWS.map(({ label, hint, icon, screen, accent }) => (
            <TouchableOpacity
              key={screen}
              style={s.actionRow}
              onPress={() => navigation.navigate(screen as any)}
              activeOpacity={0.8}
            >
              <View style={[s.actionIcon, { borderColor: accentInk[accent] + '40' }]}>
                <Ionicons name={icon} size={20} color={accentInk[accent]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.subtitle, { color: colors.textHi }]}>{label}</Text>
                <Text style={typography.small}>{hint}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textDim} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={btn.danger} onPress={() => navigation.navigate('EndShift')} activeOpacity={0.85}>
          <Ionicons name="stop" size={14} color="#FFFFFF" />
          <Text style={btn.dangerLabel}>End Shift</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function InvBlock({ value, label, color, muted = false }: { value: number; label: string; color: string; muted?: boolean }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', opacity: muted ? 0.4 : 1 }}>
      <Text style={{
        fontFamily: fonts.mono,
        fontSize: 30,
        color,
        fontVariant: ['tabular-nums'],
        letterSpacing: -0.5,
      }}>
        {String(value).padStart(2, '0')}
      </Text>
      <Text style={{
        fontFamily: fonts.displayBold,
        fontSize: 9,
        color: colors.textMuted,
        letterSpacing: 1.8,
        marginTop: 2,
      }}>
        {label}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  statusText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.go,
    letterSpacing: 1.5,
  },
  statusCode: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1.5,
  },
  scroll: { padding: spacing.md, paddingBottom: spacing.lg, gap: spacing.sm },

  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 8px 32px rgba(255, 176, 32, 0.06)',
  },
  heroAmberBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.amber,
    opacity: 0.7,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  heroEyebrow: {
    fontFamily: fonts.displayBold,
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 2,
  },
  heroCabinet: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    color: colors.textHi,
    letterSpacing: 1,
    marginTop: 2,
  },
  heroLocation: {
    fontSize: 12,
    color: colors.text,
    marginTop: 2,
  },
  regBadge: {
    borderWidth: 1,
    borderColor: colors.amber + '55',
    backgroundColor: colors.amberGlow,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  regLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.amber,
    letterSpacing: 1.5,
  },
  regValue: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.textHi,
    letterSpacing: 1,
    marginTop: 2,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  timerLabel: {
    fontFamily: fonts.displayBold,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
  },
  timerBig: {
    fontFamily: fonts.mono,
    fontSize: 32,
    color: colors.textHi,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  timerUnit: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 1,
    marginLeft: 2,
    marginRight: 4,
  },
  timerSep: {
    fontFamily: fonts.mono,
    fontSize: 32,
    color: colors.amber,
    marginHorizontal: 2,
  },
  invRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  invDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.hairline,
  },
  panelMeta: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1.5,
  },
  warningStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.amberSoft + '40',
  },
  warningText: {
    flex: 1,
    fontSize: 11,
    color: colors.amber,
    letterSpacing: 0.3,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 68,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },

  footer: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    backgroundColor: colors.bg,
  },
});
