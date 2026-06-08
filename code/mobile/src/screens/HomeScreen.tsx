import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useAuth } from '../context/AuthContext';
import { useShift } from '../context/ShiftContext';
import { colors, fonts, spacing, radius, typography, btn, layout } from '../theme';
import GridBackdrop from '../components/GridBackdrop';
import Panel from '../components/Panel';
import LED from '../components/LED';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function HomeScreen({ navigation }: Props) {
  const { currentUser, logout } = useAuth();
  const { activeShift }         = useShift();
  const now = useClock();

  const firstName = currentUser?.name.split(' ')[0] ?? '';
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase();

  return (
    <SafeAreaView style={layout.screen} edges={['top', 'left', 'right']}>
      <GridBackdrop opacity={0.35} />
      <View style={s.amberGlow} pointerEvents="none" />

      <View style={s.topBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <LED color={colors.go} size={6} />
          <Text style={s.topBarText}>READY</Text>
          <Text style={s.topBarDivider}>·</Text>
          <Text style={s.topBarText}>{currentUser?.role}</Text>
        </View>
        <TouchableOpacity onPress={() => { logout(); navigation.replace('Login'); }} hitSlop={10}>
          <Text style={s.logout}>SIGN OUT</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.greetBlock}>
          <Text style={s.eyebrow}>{dateStr}</Text>
          <Text style={s.greet}>Welcome,</Text>
          <Text style={s.greetName}>{firstName}.</Text>
        </View>

        <View style={s.clockRow}>
          <View style={s.clockBox}>
            <Text style={s.clockNum}>{hh}<Text style={s.clockSep}>:</Text>{mm}<Text style={s.clockSep}>:</Text>{ss}</Text>
            <Text style={s.clockLabel}>LOCAL TIME</Text>
          </View>
          <View style={s.clockBox}>
            <Text style={[s.clockNum, { color: colors.amber }]}>{activeShift ? 'ON_GOING' : 'STBY'}</Text>
            <Text style={s.clockLabel}>SHIFT STATE</Text>
          </View>
        </View>

        <Panel label={activeShift ? "Active Shift" : "No Active Shift"} accent="amber" style={{ marginTop: spacing.lg }}>
          <Text style={[typography.body, { color: colors.text, marginBottom: spacing.md }]}>
            {activeShift ? 'You have an ongoing shift.' : 'Begin a new shift to access cabinet tools and report activity.'}
          </Text>

          <TouchableOpacity 
            style={btn.primary} 
            onPress={() => navigation.navigate('ShiftDashboard')} 
            activeOpacity={0.85}
          >
            <Ionicons name={activeShift ? "settings" : "play"} size={14} color="#0A0A0A" />
            <Text style={btn.primaryLabel}>Shift</Text>
          </TouchableOpacity>
        </Panel>

        <View style={s.checklist}>
          <Text style={s.checklistLabel}>PRE-SHIFT CHECKLIST</Text>
          {[
            { icon: 'shield-checkmark-outline' as const, text: 'Verify cabinet status before selection' },
            { icon: 'time-outline' as const,             text: 'Ensure enough time is allocated' },
            { icon: 'warning-outline' as const,          text: 'Return all tools before ending shift' },
          ].map(item => (
            <View key={item.text} style={s.checkRow}>
              <Ionicons name={item.icon} size={14} color={colors.amber} />
              <Text style={[typography.small, { color: colors.text, flex: 1 }]}>
                {item.text}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  amberGlow: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.amber,
    opacity: 0.06,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  topBarText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1.5,
  },
  topBarDivider: { color: colors.textDim, fontSize: 10 },
  logout: {
    fontFamily: fonts.displayBold,
    fontSize: 10,
    color: colors.stop,
    letterSpacing: 2,
  },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  greetBlock: { marginTop: spacing.lg, marginBottom: spacing.lg },
  eyebrow: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.amber,
    letterSpacing: 2.5,
  },
  greet: {
    fontFamily: fonts.displayBold,
    fontSize: 36,
    color: colors.textHi,
    letterSpacing: 0.5,
    marginTop: spacing.sm,
    lineHeight: 38,
  },
  greetName: {
    fontFamily: fonts.displayBold,
    fontSize: 36,
    color: colors.amber,
    letterSpacing: 0.5,
    lineHeight: 38,
  },
  clockRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  clockBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  clockNum: {
    fontFamily: fonts.mono,
    fontSize: 22,
    color: colors.textHi,
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  clockSep: { color: colors.textDim },
  clockLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginTop: 4,
  },
  checklist: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  checklistLabel: {
    fontFamily: fonts.displayBold,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
