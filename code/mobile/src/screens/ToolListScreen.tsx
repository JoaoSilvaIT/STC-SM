import React, { useMemo, useState } from 'react';
import { FlatList, View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useShift } from '../context/ShiftContext';
import ToolCard from '../components/ToolCard';
import ScreenHeader from '../components/ScreenHeader';
import { colors, fonts, radius, spacing, statusInk, typography, layout } from '../theme';
import type { ToolStatus } from '../types/domain';
import LED from '../components/LED';

type Props = NativeStackScreenProps<RootStackParamList, 'ToolList'>;

type Filter = 'ALL' | ToolStatus;

const FILTERS: { key: Filter; label: string; color: string }[] = [
  { key: 'ALL',       label: 'All',       color: colors.text },
  { key: 'AVAILABLE', label: 'Available', color: statusInk.AVAILABLE.ink },
  { key: 'IN_USE',    label: 'In-Use',    color: statusInk.IN_USE.ink },
  { key: 'BROKEN',    label: 'Broken',    color: statusInk.BROKEN.ink },
  { key: 'MISSING',   label: 'Missing',   color: statusInk.MISSING.ink },
];

export default function ToolListScreen({ navigation }: Props) {
  const { cabinetTools } = useShift();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [query, setQuery] = useState('');
  const [queryFocus, setQueryFocus] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cabinetTools.filter(t => {
      const matchesFilter = filter === 'ALL' || t.status === filter;
      const matchesQuery  = q === '' ||
        t.name.toLowerCase().includes(q) ||
        t.partNumber.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [cabinetTools, filter, query]);

  const counts = useMemo(() => ({
    AVAILABLE: cabinetTools.filter(t => t.status === 'AVAILABLE').length,
    IN_USE:    cabinetTools.filter(t => t.status === 'IN_USE').length,
    BROKEN:    cabinetTools.filter(t => t.status === 'BROKEN').length,
    MISSING:   cabinetTools.filter(t => t.status === 'MISSING').length,
  }), [cabinetTools]);

  return (
    <SafeAreaView style={layout.screen} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="Tool Inventory"
        subtitle={`${cabinetTools.length} REGISTERED`}
        onBack={() => navigation.goBack()}
      />

      <View style={s.searchBlock}>
        <View style={[s.searchWrap, queryFocus && s.searchFocus]}>
          <Ionicons name="search" size={14} color={queryFocus ? colors.amber : colors.textDim} />
          <TextInput
            style={s.search}
            placeholder="Search name or part number"
            placeholderTextColor={colors.textDim}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setQueryFocus(true)}
            onBlur={() => setQueryFocus(false)}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={10}>
              <Ionicons name="close-circle" size={16} color={colors.textDim} />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={f => f.key}
          contentContainerStyle={{ paddingVertical: spacing.sm, gap: spacing.xs }}
          renderItem={({ item }) => {
            const active = filter === item.key;
            const count = item.key === 'ALL'
              ? cabinetTools.length
              : counts[item.key as ToolStatus];
            return (
              <TouchableOpacity
                style={[s.chip, active && { borderColor: item.color, backgroundColor: item.color + '14' }]}
                onPress={() => setFilter(item.key)}
                activeOpacity={0.7}
              >
                {item.key !== 'ALL' && <LED color={item.color} size={5} />}
                <Text style={[s.chipText, active && { color: item.color }]}>{item.label}</Text>
                <Text style={[s.chipCount, active && { color: item.color }]}>{count}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={t => String(t.id)}
        renderItem={({ item }) => (
          <ToolCard tool={item} onPress={() => navigation.navigate('ToolDetail', { toolId: item.id })} />
        )}
        contentContainerStyle={{ padding: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xl }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="search-outline" size={32} color={colors.textDim} />
            <Text style={[typography.label, { marginTop: spacing.sm }]}>NO MATCHES</Text>
            <Text style={[typography.small, { marginTop: 4 }]}>
              Adjust filters or clear your search.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  searchBlock: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  searchFocus: {
    borderColor: colors.amber,
    backgroundColor: colors.surfaceAlt,
  },
  search: {
    flex: 1,
    color: colors.textHi,
    fontSize: 14,
    paddingVertical: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipText: {
    fontFamily: fonts.displayBold,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  chipCount: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
});
