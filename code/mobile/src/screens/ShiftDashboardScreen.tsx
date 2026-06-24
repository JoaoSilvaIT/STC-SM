import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useShift } from '../context/ShiftContext';
import type { ActivityType, Tool } from '../types/domain';
import { colors, fonts, spacing, radius, typography, btn, layout } from '../theme';
import GridBackdrop from '../components/GridBackdrop';
import Panel from '../components/Panel';
import LED from '../components/LED';
import ScreenHeader from '../components/ScreenHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'ShiftDashboard'>;

function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours * 60) + (minutes || 0);
}

function shiftDuration(start: string): { h: string; m: string } {
  const startMins = timeToMinutes(start);
  const now = new Date();
  const endMins = (now.getHours() * 60) + now.getMinutes();
  let diffMins = endMins - startMins;
  if (diffMins < 0) {
    diffMins += 24 * 60;
  }
  const h = Math.floor(diffMins / 60);
  const m = diffMins % 60;
  return { h: String(h).padStart(2, '0'), m: String(m).padStart(2, '0') };
}

function isTimeWithinShift(startStr?: string | null, endStr?: string | null): boolean {
  if (!startStr) return true;

  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();

  const [sH, sM] = startStr.split(':').map(Number);
  const startMins = sH * 60 + (sM || 0);

  let endMins = 0;
  if (endStr) {
    const [eH, eM] = endStr.split(':').map(Number);
    endMins = eH * 60 + (eM || 0);
  } else {
    endMins = (startMins + 8 * 60) % (24 * 60);
  }

  if (startMins <= endMins) {
    return currentMins >= startMins && currentMins <= endMins;
  } else {
    return currentMins >= startMins || currentMins <= endMins;
  }
}

const ANOMALY_OPTIONS: { label: string; value: ActivityType; icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap; hint: string }[] = [
  { label: 'Broken Tool', value: 'TOOL_BROKEN', icon: 'hammer-outline', hint: 'A tool is damaged' },
  { label: 'Missing Tool', value: 'TOOL_MISSING', icon: 'search-outline', hint: 'A tool cannot be found' },
  { label: 'Cabinet Anomaly', value: 'CABINET_ANOMALY', icon: 'lock-open-outline', hint: 'Issue with the cabinet hardware' },
];

type ActionRow = {
  label: string;
  hint: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen: keyof RootStackParamList;
  accent: 'amber' | 'stop' | 'sky';
};

const ACTION_ROWS: ActionRow[] = [
  { label: 'Activity Log',   hint: 'Shift timeline',           icon: 'pulse-outline',        screen: 'Activity', accent: 'sky'   },
];

const accentInk: Record<ActionRow['accent'], string> = {
  amber: colors.amber,
  stop:  colors.stop,
  sky:   colors.sky,
};

export default function ShiftDashboardScreen({ navigation }: Props) {
  const { activeShift, assignedShift, activeCabinet, cabinetTools, logAnomaly, startShift, refreshAssignment, loading: shiftLoading } = useShift();
  const [, setTick] = useState(0);

  const [selectedAnomaly, setSelectedAnomaly] = useState<ActivityType | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [anomalySubmitted, setAnomalySubmitted] = useState(false);

  const isToolAnomaly = selectedAnomaly === 'TOOL_BROKEN' || selectedAnomaly === 'TOOL_MISSING';
  const canSubmit = !!selectedAnomaly && (!isToolAnomaly || !!selectedTool);

  // Re-render every 30s to keep the clock-based duration / shift-window check
  // current, and silently poll the backend so backoffice changes to this
  // mechanic's assignment (reassign / cancel) show up without leaving the screen.
  useEffect(() => {
    const id = setInterval(() => {
      setTick(t => t + 1);
      refreshAssignment(true);
    }, 30000);
    return () => clearInterval(id);
  }, [refreshAssignment]);

  const shift = activeShift || assignedShift;
  const cabinet = activeCabinet;
  const isOngoing = activeShift?.status === 'ACTIVE';

  if (!shift) {
    return (
        <SafeAreaView style={layout.screen}>
          <ScreenHeader title="Shift" onBack={() => navigation.goBack()} />
          <View style={s.center}>
            <Text style={typography.body}>No shift assigned to you.</Text>
          </View>
        </SafeAreaView>
    );
  }

  const duration  = shiftDuration(shift.startTime);

  async function handleStart() {
    if (!assignedShift) return;
    try {
      await startShift(assignedShift);
    } catch (e: any) {
      Alert.alert("Erro de Turno", e.message || 'A operação falhou. Verifique as horas permitidas.');
    }
  }

  function handleReportAnomaly() {
    if (!canSubmit || !selectedAnomaly) return;
    logAnomaly(selectedAnomaly, selectedTool?.id);
    setSelectedAnomaly(null);
    setSelectedTool(null);
    setAnomalySubmitted(true);
    setTimeout(() => setAnomalySubmitted(false), 3000);
  }

  const formatTime = (ts: string) => {
    if (!ts) return '--:--';
    return ts.slice(0, 5);
  };

  const isOutOfHours = shift && !isOngoing
      ? !isTimeWithinShift(shift.startTime, shift.endTime)
      : false;

  return (
      <SafeAreaView style={layout.screen} edges={['top', 'left', 'right']}>
        <GridBackdrop opacity={0.3} />

        <View style={s.statusBar}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <LED color={isOngoing ? colors.go : colors.textDim} size={6} pulse={isOngoing} />
            <Text style={[s.statusText, !isOngoing && { color: colors.textMuted }]}>
              {isOngoing ? 'ON GOING' : 'ASSIGNED'}
            </Text>
          </View>
          <Text style={s.statusCode}>SH-{String(shift.id).padStart(4, '0')}</Text>
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
            </View>

            <View style={s.timerRow}>
              <View>
                <Text style={s.timerLabel}>SHIFT HOURS</Text>
                <Text style={s.timeText}>
                  {formatTime(shift.startTime)} - {shift.endTime ? formatTime(shift.endTime) : 'TBD'}
                </Text>
              </View>
              {isOngoing && (
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={s.timerLabel}>ELAPSED</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                      <Text style={s.timerBig}>{duration.h}</Text>
                      <Text style={s.timerUnit}>H</Text>
                      <Text style={s.timerSep}>:</Text>
                      <Text style={s.timerBig}>{duration.m}</Text>
                      <Text style={s.timerUnit}>M</Text>
                    </View>
                  </View>
              )}
            </View>
          </View>

          {isOngoing && (
              <>
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

                <View style={{ height: spacing.md }} />

                <Panel label="Report Anomaly" accent="stop">
                  {anomalySubmitted ? (
                      <View style={s.successBanner}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.go} />
                        <Text style={s.successText}>Report submitted successfully.</Text>
                      </View>
                  ) : (
                      <View>
                        <Text style={[typography.label, { marginBottom: spacing.sm }]}>CATEGORY</Text>
                        <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
                          {ANOMALY_OPTIONS.map(opt => {
                            const active = selectedAnomaly === opt.value;
                            return (
                                <TouchableOpacity
                                    key={opt.value}
                                    style={[s.option, active && s.optionActive]}
                                    onPress={() => { setSelectedAnomaly(opt.value); setSelectedTool(null); }}
                                    activeOpacity={0.8}
                                >
                                  <View style={[s.optionIcon, active && { backgroundColor: colors.amber + '22', borderColor: colors.amber }]}>
                                    <Ionicons name={opt.icon} size={18} color={active ? colors.amber : colors.text} />
                                  </View>
                                  <View style={{ flex: 1 }}>
                                    <Text style={[typography.subtitle, { color: active ? colors.amber : colors.textHi }]}>
                                      {opt.label}
                                    </Text>
                                    <Text style={typography.small}>{opt.hint}</Text>
                                  </View>
                                  <View style={[s.radio, active && s.radioActive]}>
                                    {active && <View style={s.radioDot} />}
                                  </View>
                                </TouchableOpacity>
                            );
                          })}
                        </View>

                        {isToolAnomaly && (
                          <>
                            <View style={s.toolSectionDivider} />
                            <Text style={[typography.label, { marginBottom: spacing.sm }]}>AFFECTED TOOL</Text>
                            <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
                              {cabinetTools.map(tool => {
                                const active = selectedTool?.id === tool.id;
                                return (
                                  <TouchableOpacity
                                    key={tool.id}
                                    style={[s.toolOption, active && s.toolOptionActive]}
                                    onPress={() => setSelectedTool(tool)}
                                    activeOpacity={0.8}
                                  >
                                    <View style={[s.toolIndicator, active && { backgroundColor: colors.amber }]} />
                                    <Text style={[typography.body, { flex: 1, color: active ? colors.amber : colors.textHi }]}>
                                      {tool.name}
                                    </Text>
                                    <View style={[s.radio, active && s.radioActive]}>
                                      {active && <View style={s.radioDot} />}
                                    </View>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          </>
                        )}

                        <TouchableOpacity
                            style={[btn.primary, !canSubmit && s.btnDisabled, { backgroundColor: colors.stop }]}
                            onPress={handleReportAnomaly}
                            disabled={!canSubmit}
                            activeOpacity={0.85}
                        >
                          <Ionicons name="send" size={14} color="#FFFFFF" />
                          <Text style={[btn.primaryLabel, { color: '#FFFFFF' }]}>Submit Report</Text>
                        </TouchableOpacity>
                      </View>
                  )}
                </Panel>
              </>
          )}
          {!isOngoing && (
              <View style={{ flex: 1, justifyContent: 'center', paddingVertical: spacing.xxl }}>
                <View style={s.stbyCard}>
                  <Ionicons name="information-circle-outline" size={24} color={colors.amber} />
                  <Text style={[typography.body, { textAlign: 'center', color: colors.text }]}>
                    Your shift is assigned to this station. Press below to begin your work session.
                  </Text>
                </View>
              </View>
          )}
        </ScrollView>

        <View style={s.footer}>
          {isOngoing ? (
              <TouchableOpacity style={btn.danger} onPress={() => navigation.navigate('EndShift')} activeOpacity={0.85}>
                <Ionicons name="stop" size={14} color="#FFFFFF" />
                <Text style={btn.dangerLabel}>End Shift</Text>
              </TouchableOpacity>
          ) : (
              <TouchableOpacity
                  style={[btn.primary, (shiftLoading || isOutOfHours) && s.btnDisabled]}
                  onPress={handleStart}
                  disabled={shiftLoading || isOutOfHours}
                  activeOpacity={0.85}
              >
                {shiftLoading ? (
                    <ActivityIndicator color="#0A0A0A" size="small" />
                ) : (
                    <>
                      <Text style={btn.primaryLabel}>
                        {isOutOfHours ? 'Outside of shift hours' : 'START SHIFT'}
                      </Text>
                      {!isOutOfHours && <Ionicons name="play" size={16} color="#0A0A0A" />}
                    </>
                )}
              </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  timeText: {
    fontFamily: fonts.mono,
    fontSize: 18,
    color: colors.amber,
    marginTop: 2,
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
  stbyCard: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  optionActive: {
    borderColor: colors.amber,
    backgroundColor: colors.surfaceAlt,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.borderHi,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.amber },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.amber,
  },
  btnDisabled: { opacity: 0.3 },
  toolSectionDivider: {
    height: 1,
    backgroundColor: colors.hairline,
    marginBottom: spacing.md,
  },
  toolOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  toolOptionActive: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  toolIndicator: {
    width: 3,
    height: 28,
    borderRadius: 2,
    backgroundColor: colors.borderHi,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.goSoft + '55',
    borderWidth: 1,
    borderColor: colors.go + '55',
  },
  successText: {
    color: colors.go,
    fontFamily: fonts.displayBold,
    fontSize: 13,
  },
});