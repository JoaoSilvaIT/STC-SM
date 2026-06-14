import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useShift } from '../context/ShiftContext';
import { useAuth } from '../context/AuthContext';
import { getShiftsByUser } from '../api/shifts';
import { getCabinet } from '../api/cabinets';
import type { Shift, Cabinet } from '../types/domain';
import { colors, fonts, spacing, radius, typography, btn, layout } from '../theme';
import ScreenHeader from '../components/ScreenHeader';
import LED from '../components/LED';

type Props = NativeStackScreenProps<RootStackParamList, 'StartShift'>;

export default function StartShiftScreen({ navigation }: Props) {
  const { currentUser } = useAuth();
  const { activeShift, startShift, endShift, loading: shiftCtxLoading } = useShift();

  const [assignedShift, setAssignedShift] = useState<Shift | null>(null);
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) return;

    if (activeShift) {
      setAssignedShift(activeShift);
      getCabinet(activeShift.cabinetId)
        .then(setCabinet)
        .catch(() => setError('Failed to load cabinet details'))
        .finally(() => setLoading(false));
      return;
    }

    getShiftsByUser(currentUser.id)
      .then(async shifts => {
        if (shifts.length === 0) {
          setError('No shift assigned to this mechanic.');
          setLoading(false);
          return;
        }

        const ongoing = shifts.find(s => s.status === 'ACTIVE');
        const selected = ongoing || shifts[shifts.length - 1];
        setAssignedShift(selected);

        try {
          const cab = await getCabinet(selected.cabinetId);
          setCabinet(cab);
        } catch (e) {
          setError('Failed to load cabinet details');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load assigned shift');
        setLoading(false);
      });
  }, [currentUser, activeShift]);

  async function handleToggleShift() {
    if (!assignedShift) return;
    try {
      if (assignedShift.status === 'ACTIVE') {
        await endShift();
        navigation.goBack();
      } else {
        await startShift(assignedShift);
        navigation.replace('ShiftDashboard');
      }
    } catch (e) {
      setError('Operation failed.');
    }
  }

  const formatTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '00:00';
    }
  };
  
  const isOngoing = assignedShift?.status === 'ACTIVE';

  return (
    <SafeAreaView style={layout.screen} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="Shift Details"
        subtitle="MECHANIC ASSIGNMENT"
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.amber} />
        </View>
      ) : error ? (
        <View style={s.center}>
          <Text style={[typography.small, { color: colors.stop }]}>{error}</Text>
        </View>
      ) : assignedShift && cabinet ? (
        <View style={s.content}>
          <View style={s.card}>
            <Text style={typography.label}>ASSIGNED CABINET</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs }}>
              <LED color={cabinet.status === 'OPEN' ? colors.go : colors.stop} size={8} />
              <Text style={s.cabName}>{cabinet.name}</Text>
            </View>
            <Text style={s.cabLocation}>{cabinet.location}</Text>
            <Text style={s.cabLocation}>Status: {cabinet.status}</Text>
          </View>

          <View style={s.card}>
            <Text style={typography.label}>SHIFT HOURS</Text>
            <View style={{ marginTop: spacing.xs }}>
              <Text style={s.timeText}>
                {formatTime(assignedShift.startTime)} - {assignedShift.endTime ? formatTime(assignedShift.endTime) : 'TBD'}
              </Text>
            </View>
            <Text style={s.cabLocation}>Status: {assignedShift.status}</Text>
          </View>
        </View>
      ) : null}

      <View style={s.footer}>
        <TouchableOpacity
          style={[btn.primary, (shiftCtxLoading || !assignedShift) && s.btnDisabled]}
          onPress={handleToggleShift}
          disabled={shiftCtxLoading || !assignedShift}
          activeOpacity={0.85}
        >
          <Text style={btn.primaryLabel}>
            {shiftCtxLoading ? 'Processing...' : isOngoing ? 'End Shift' : 'Start Shift'}
          </Text>
          <Ionicons name={isOngoing ? 'stop' : 'play'} size={16} color="#0A0A0A" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.md, flex: 1, gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  cabName: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: colors.textHi,
  },
  cabLocation: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  timeText: {
    fontFamily: fonts.mono,
    fontSize: 18,
    color: colors.amber,
  },
  footer: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    backgroundColor: colors.bgElevated,
  },
  btnDisabled: { opacity: 0.3 },
});
