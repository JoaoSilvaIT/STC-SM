import React, { useMemo } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useShift } from '../context/ShiftContext';
import { useTheme } from '../context/ThemeContext';
import ActivityItem from '../components/ActivityItem';
import ScreenHeader from '../components/ScreenHeader';
import { fonts, spacing, type Palette } from '../theme';
import { useTranslation } from 'react-i18next';

type Props = NativeStackScreenProps<RootStackParamList, 'Activity'>;

export default function ActivityScreen({ navigation }: Props) {
  const { activities, activeShift } = useShift();
  const { t } = useTranslation();
  const { colors, typography, layout } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <SafeAreaView style={layout.screen} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title={t('activity.title')}
        subtitle={activeShift ? t('activity.shiftCode', { id: String(activeShift.id).padStart(4, '0') }) : t('activity.noShift')}
        onBack={() => navigation.goBack()}
        trailing={
          <View style={s.countPill}>
            <Text style={s.countText}>{String(activities.length).padStart(2, '0')}</Text>
          </View>
        }
      />

      {activities.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="pulse-outline" size={36} color={colors.textDim} />
          <Text style={[typography.label, { marginTop: spacing.md }]}>{t('activity.noEvents')}</Text>
          <Text style={[typography.small, { marginTop: spacing.xs }]}>
            {t('activity.emptyHint')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={a => String(a.id)}
          renderItem={({ item, index }) => (
            <ActivityItem activity={item} isLast={index === activities.length - 1} />
          )}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  countPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  countText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.amber,
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
});
