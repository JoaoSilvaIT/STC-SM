import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useShift } from '../context/ShiftContext';
import { useTheme } from '../context/ThemeContext';
import { fonts, spacing, radius, type Palette } from '../theme';
import ScreenHeader from '../components/ScreenHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'EndShift'>;

function shiftDuration(startTime: string): { h: string; m: string } {
  const [sH, sM] = startTime.split(':').map(Number);
  const startMins = (sH || 0) * 60 + (sM || 0);
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  let diff = nowMins - startMins;
  if (diff < 0) diff += 24 * 60;
  return { h: String(Math.floor(diff / 60)).padStart(2, '0'), m: String(diff % 60).padStart(2, '0') };
}

export default function EndShiftScreen({ navigation }: Props) {
  const { activeShift, cabinetTools, activities, endShift } = useShift();
  const { colors, typography, btn, layout } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [acknowledged, setAcknowledged] = useState(false);

  if (!activeShift) return null;

  const inUseTools    = cabinetTools.filter(t => t.status === 'IN_USE');
  const brokenTools   = cabinetTools.filter(t => t.status === 'BROKEN' || t.status === 'MISSING');
  const toolsTaken    = activities.filter(a => a.type === 'TOOL_REMOVED').length;
  const toolsReturned = activities.filter(a => a.type === 'TOOL_RETURNED').length;
  const anomalies     = activities.filter(a => a.type === 'CABINET_ANOMALY').length;
  const hasFOD        = inUseTools.length > 0;
  const canConfirm    = !hasFOD || acknowledged;
  const dur           = shiftDuration(activeShift.startTime);

  async function handleConfirm() {
    await endShift();
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  }

  return (
    <SafeAreaView style={layout.screen} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="End Shift"
        subtitle={`SH-${String(activeShift.id).padStart(4, '0')}`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.summaryHero}>
          <Text style={s.summaryLabel}>SHIFT SUMMARY</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
            <Text style={s.durBig}>{dur.h}</Text>
            <Text style={s.durUnit}>H</Text>
            <Text style={s.durSep}>:</Text>
            <Text style={s.durBig}>{dur.m}</Text>
            <Text style={s.durUnit}>M</Text>
          </View>
        </View>

        <View style={s.statsGrid}>
          <StatCell value={toolsTaken}    label="TAKEN"     color={colors.warn} />
          <StatCell value={toolsReturned} label="RETURNED"  color={colors.go} />
          <StatCell value={brokenTools.length} label="BROKEN"    color={colors.stop} muted={brokenTools.length === 0} />
          <StatCell value={anomalies}     label="ANOMALIES" color={colors.sky}  muted={anomalies === 0} />
        </View>

        {hasFOD ? (
          <View style={s.fodCard}>
            <View style={s.fodHeader}>
              <View style={s.fodIcon}>
                <Ionicons name="warning" size={18} color={colors.stop} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.fodTitle}>FOD RISK DETECTED</Text>
                <Text style={s.fodSubtitle}>
                  {inUseTools.length} tool{inUseTools.length !== 1 ? 's' : ''} not returned to cabinet
                </Text>
              </View>
            </View>

            <View style={s.fodList}>
              {inUseTools.map(t => (
                <View key={t.id} style={s.fodTool}>
                  <View style={s.fodDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.body, { color: colors.textHi }]}>{t.name}</Text>
                    <Text style={[typography.mono, { color: colors.stop }]}>{t.partNumber}</Text>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[s.ackBtn, acknowledged && s.ackBtnActive]}
              onPress={() => setAcknowledged(v => !v)}
              activeOpacity={0.8}
            >
              <View style={[s.checkbox, acknowledged && s.checkboxActive]}>
                {acknowledged && <Ionicons name="checkmark" size={12} color="#0A0A0A" />}
              </View>
              <Text style={[typography.small, { color: acknowledged ? colors.textHi : colors.text, flex: 1, lineHeight: 17 }]}>
                I acknowledge FOD risk and confirm all tools are accounted for and recorded.
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.allClear}>
            <View style={s.allClearIcon}>
              <Ionicons name="checkmark-circle" size={20} color={colors.go} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.allClearTitle}>ALL TOOLS ACCOUNTED FOR</Text>
              <Text style={s.allClearSub}>Cabinet inventory matches checkout records.</Text>
            </View>
          </View>
        )}

        <View style={{ height: spacing.lg }} />

        <TouchableOpacity
          style={[btn.danger, !canConfirm && s.btnDisabled]}
          onPress={handleConfirm}
          disabled={!canConfirm}
          activeOpacity={0.85}
        >
          <Ionicons name="stop" size={14} color="#FFFFFF" />
          <Text style={btn.dangerLabel}>Confirm End Shift</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[btn.ghost, { marginTop: spacing.sm }]} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Text style={btn.ghostLabel}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCell({ value, label, color, muted = false }: { value: number; label: string; color: string; muted?: boolean }) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={[s.stat, muted && { opacity: 0.4 }]}>
      <Text style={{
        fontFamily: fonts.mono,
        fontSize: 26,
        color,
        fontVariant: ['tabular-nums'],
      }}>
        {String(value).padStart(2, '0')}
      </Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },

  summaryHero: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontFamily: fonts.displayBold,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
  },
  durBig: {
    fontFamily: fonts.mono,
    fontSize: 40,
    color: colors.textHi,
    fontVariant: ['tabular-nums'],
  },
  durUnit: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.textMuted,
    letterSpacing: 1,
    marginLeft: 2,
    marginRight: 6,
  },
  durSep: {
    fontFamily: fonts.mono,
    fontSize: 40,
    color: colors.amber,
  },
  summarySub: {
    color: colors.text,
    fontSize: 13,
    marginTop: spacing.xs,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  stat: {
    flexBasis: '47%',
    flexGrow: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'flex-start',
  },
  statLabel: {
    fontFamily: fonts.displayBold,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1.8,
    marginTop: 4,
  },

  fodCard: {
    borderWidth: 1,
    borderColor: colors.stop + '88',
    borderRadius: radius.md,
    backgroundColor: colors.stopSoft + '55',
    padding: spacing.md,
    gap: spacing.md,
  },
  fodHeader: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  fodIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.stopSoft,
    borderWidth: 1,
    borderColor: colors.stop + '66',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fodTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 12,
    color: colors.stop,
    letterSpacing: 1.5,
  },
  fodSubtitle: {
    fontSize: 12,
    color: colors.text,
    marginTop: 2,
  },
  fodList: { gap: spacing.sm },
  fodTool: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.bg + '88',
    borderRadius: radius.sm,
  },
  fodDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.stop,
  },

  ackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.bg + '66',
    borderWidth: 1,
    borderColor: colors.border,
  },
  ackBtnActive: { borderColor: colors.amber },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.borderHi,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxActive: {
    borderColor: colors.amber,
    backgroundColor: colors.amber,
  },

  allClear: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.goSoft + '55',
    borderWidth: 1,
    borderColor: colors.go + '55',
  },
  allClearIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.goSoft,
    borderWidth: 1,
    borderColor: colors.go + '55',
    alignItems: 'center',
    justifyContent: 'center',
  },
  allClearTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 12,
    color: colors.go,
    letterSpacing: 1.5,
  },
  allClearSub: {
    fontSize: 12,
    color: colors.text,
    marginTop: 2,
  },

  btnDisabled: { opacity: 0.3 },
});
