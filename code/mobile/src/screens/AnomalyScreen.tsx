import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useShift, type AnomalyType } from '../context/ShiftContext';
import { colors, fonts, spacing, radius, typography, btn, layout } from '../theme';
import ScreenHeader from '../components/ScreenHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'Anomaly'>;

const ANOMALY_OPTIONS: { label: string; value: AnomalyType; icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap; hint: string }[] = [
  { label: 'Door Malfunction', value: 'DOOR_MALFUNCTION', icon: 'lock-open-outline',    hint: 'Door fails to open, close or seal'      },
  { label: 'Power Issue',      value: 'POWER_ISSUE',      icon: 'flash-outline',        hint: 'Cabinet is unpowered or unstable'       },
  { label: 'Sensor Failure',   value: 'SENSOR_FAILURE',   icon: 'pulse-outline',        hint: 'False readings or unresponsive sensor'  },
  { label: 'Other',            value: 'OTHER',            icon: 'help-circle-outline',  hint: 'Anything not covered above'             },
];

export default function AnomalyScreen({ navigation }: Props) {
  const { logAnomaly }            = useShift();
  const [selected, setSelected]   = useState<AnomalyType | null>(null);
  const [notes, setNotes]         = useState('');
  const [notesFocus, setNotesFocus] = useState(false);

  function handleSubmit() {
    if (!selected) return;
    logAnomaly(selected, notes.trim());
    navigation.goBack();
  }

  return (
    <SafeAreaView style={layout.screen} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="Report Anomaly"
        subtitle="INCIDENT LOG"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.banner}>
          <Ionicons name="warning" size={16} color={colors.stop} />
          <Text style={s.bannerText} selectable>
            Anomalies are logged against shift {''} and forwarded to the maintenance queue.
          </Text>
        </View>

        <Text style={[typography.label, { marginBottom: spacing.sm }]}>CATEGORY</Text>
        <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
          {ANOMALY_OPTIONS.map(opt => {
            const active = selected === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[s.option, active && s.optionActive]}
                onPress={() => setSelected(opt.value)}
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

        <Text style={[typography.label, { marginBottom: spacing.sm }]}>OBSERVATIONS · OPTIONAL</Text>
        <View style={[s.textareaWrap, notesFocus && s.textareaFocus]}>
          <TextInput
            style={s.textarea}
            placeholder="Describe what you observed…"
            placeholderTextColor={colors.textDim}
            value={notes}
            onChangeText={setNotes}
            onFocus={() => setNotesFocus(true)}
            onBlur={() => setNotesFocus(false)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={s.charCount}>{notes.length}/240</Text>
        </View>

        <View style={{ height: spacing.lg }} />

        <TouchableOpacity
          style={[btn.primary, !selected && s.btnDisabled]}
          onPress={handleSubmit}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <Ionicons name="send" size={14} color="#0A0A0A" />
          <Text style={btn.primaryLabel}>Submit Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.stopSoft + '55',
    borderWidth: 1,
    borderColor: colors.stop + '40',
    marginBottom: spacing.lg,
  },
  bannerText: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    lineHeight: 17,
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

  textareaWrap: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    paddingBottom: spacing.sm,
    minHeight: 120,
  },
  textareaFocus: {
    borderColor: colors.amber,
    backgroundColor: colors.surfaceAlt,
  },
  textarea: {
    color: colors.textHi,
    fontSize: 14,
    lineHeight: 19,
    minHeight: 80,
  },
  charCount: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textDim,
    letterSpacing: 1,
    textAlign: 'right',
  },
  btnDisabled: { opacity: 0.3 },
});
