import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useShift } from '../context/ShiftContext';
import { listCabinets } from '../api/cabinets';
import type { Cabinet } from '../types/domain';
import { colors, fonts, spacing, radius, typography, btn, layout } from '../theme';
import ScreenHeader from '../components/ScreenHeader';
import LED from '../components/LED';

type Props = NativeStackScreenProps<RootStackParamList, 'StartShift'>;

const cabinetStatusInk: Record<Cabinet['status'], { color: string; label: string }> = {
  OPEN:     { color: colors.go,      label: 'OPEN'     },
  CLOSED:   { color: colors.sky,     label: 'CLOSED'   },
  BROKEN:   { color: colors.stop,    label: 'BROKEN'   },
  INACTIVE: { color: colors.textDim, label: 'INACTIVE' },
};

export default function StartShiftScreen({ navigation }: Props) {
  const { startShift, loading: shiftLoading } = useShift();

  const [cabinets, setCabinets]       = useState<Cabinet[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError]   = useState('');
  const [selectedId, setSelected]     = useState<number | null>(null);
  const [aircraftReg, setReg]         = useState('');
  const [regFocus, setRegFocus]       = useState(false);

  useEffect(() => {
    listCabinets()
      .then(setCabinets)
      .catch(() => setFetchError('Failed to load cabinets'))
      .finally(() => setFetchLoading(false));
  }, []);

  async function handleBegin() {
    const cabinet = cabinets.find(c => c.id === selectedId);
    if (!cabinet || !aircraftReg.trim()) return;
    try {
      await startShift(cabinet, aircraftReg.trim().toUpperCase());
      navigation.replace('ShiftDashboard');
    } catch {
      // error is stored in ShiftContext.error
    }
  }

  function renderCabinet({ item }: { item: Cabinet }) {
    const selectable = item.status === 'OPEN';
    const isSelected = item.id === selectedId;
    const ink = cabinetStatusInk[item.status];

    return (
      <TouchableOpacity
        style={[
          s.cab,
          isSelected && s.cabSelected,
          !selectable && s.cabDisabled,
        ]}
        onPress={() => selectable && setSelected(item.id)}
        disabled={!selectable}
        activeOpacity={0.8}
      >
        {isSelected && <View style={s.cabAccent} />}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
          <LED color={ink.color} size={6} pulse={item.status === 'OPEN' && isSelected} />
          <Text style={[s.cabStatusText, { color: ink.color }]}>{ink.label}</Text>
        </View>

        <Text style={[s.cabName, !selectable && { color: colors.textDim }]}>{item.name}</Text>
        <Text style={s.cabLocation} numberOfLines={2}>{item.location}</Text>

        {isSelected && (
          <View style={s.cabCheck}>
            <Ionicons name="checkmark" size={14} color="#0A0A0A" />
          </View>
        )}
      </TouchableOpacity>
    );
  }

  const openCount = cabinets.filter(c => c.status === 'OPEN').length;
  const canBegin  = !!selectedId && aircraftReg.trim().length > 0 && !shiftLoading;

  return (
    <SafeAreaView style={layout.screen} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="Start Shift"
        subtitle="STEP 1 OF 1"
        onBack={() => navigation.goBack()}
      />

      {fetchLoading ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.amber} />
        </View>
      ) : fetchError ? (
        <View style={s.center}>
          <Text style={[typography.small, { color: colors.stop }]}>{fetchError}</Text>
        </View>
      ) : (
        <FlatList
          data={cabinets}
          keyExtractor={c => String(c.id)}
          renderItem={renderCabinet}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.sm }}
          ListHeaderComponent={
            <View style={s.intro}>
              <Text style={typography.label}>SELECT CABINET</Text>
              <Text style={[typography.small, { marginTop: 4 }]}>
                Open stations only · {openCount} available
              </Text>
            </View>
          }
          contentContainerStyle={s.list}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        />
      )}

      <View style={s.footer}>
        <Text style={typography.label}>AIRCRAFT REGISTRATION</Text>
        <View style={[s.inputWrap, regFocus && s.inputFocus]}>
          <Ionicons name="airplane" size={14} color={regFocus ? colors.amber : colors.textDim} />
          <TextInput
            style={s.input}
            placeholder="CS-TUG"
            placeholderTextColor={colors.textDim}
            value={aircraftReg}
            onChangeText={setReg}
            onFocus={() => setRegFocus(true)}
            onBlur={() => setRegFocus(false)}
            autoCapitalize="characters"
            maxLength={10}
          />
        </View>

        <View style={{ height: spacing.md }} />

        <TouchableOpacity
          style={[btn.primary, !canBegin && s.btnDisabled]}
          onPress={handleBegin}
          disabled={!canBegin}
          activeOpacity={0.85}
        >
          <Text style={btn.primaryLabel}>{shiftLoading ? 'Starting…' : 'Begin Shift'}</Text>
          <Ionicons name="arrow-forward" size={16} color="#0A0A0A" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  intro:  { marginBottom: spacing.md },
  list:   { padding: spacing.md },
  cab: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: 110,
    position: 'relative',
    overflow: 'hidden',
  },
  cabSelected: {
    borderColor: colors.amber,
    backgroundColor: colors.surfaceAlt,
  },
  cabDisabled: { opacity: 0.4 },
  cabAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.amber,
  },
  cabStatusText: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  cabName: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: colors.textHi,
    letterSpacing: 0.5,
  },
  cabLocation: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 15,
  },
  cabCheck: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    backgroundColor: colors.bgElevated,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  inputFocus: {
    borderColor: colors.amber,
    backgroundColor: colors.surfaceAlt,
  },
  input: {
    flex: 1,
    color: colors.textHi,
    fontSize: 16,
    fontFamily: fonts.mono,
    letterSpacing: 2,
    paddingVertical: 14,
  },
  btnDisabled: { opacity: 0.3 },
});
