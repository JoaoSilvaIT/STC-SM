import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import type { Language } from '../i18n';
import type { ThemeName, Theme } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Called when the user confirms sign-out (host handles navigation). */
  onLogout: () => void;
}

const THEME_OPTIONS: { name: ThemeName; labelKey: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { name: 'light', labelKey: 'settings.light', icon: 'sunny-outline' },
  { name: 'dark',  labelKey: 'settings.dark',  icon: 'moon-outline' },
];

const LANGUAGE_OPTIONS: { code: Language; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
];

export default function SettingsDrawer({ visible, onClose, onLogout }: Props) {
  const theme = useTheme();
  const { colors, spacing } = theme;
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const { currentUser } = useAuth();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const panelWidth = Math.min(300, width * 0.8);

  const s = useMemo(() => makeStyles(theme), [theme]);

  // Keep the Modal mounted through the close animation so it slides out.
  const [mounted, setMounted] = useState(visible);
  const translateX = useRef(new Animated.Value(panelWidth)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(translateX, { toValue: 0, duration: 240, useNativeDriver: true }),
        Animated.timing(backdrop,   { toValue: 1, duration: 240, useNativeDriver: true }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(translateX, { toValue: panelWidth, duration: 200, useNativeDriver: true }),
        Animated.timing(backdrop,   { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(({ finished }) => { if (finished) setMounted(false); });
    }
  }, [visible, mounted, panelWidth, translateX, backdrop]);

  if (!mounted) return null;

  const initials = currentUser?.name?.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() ?? '?';

  return (
    <Modal transparent visible={mounted} onRequestClose={onClose} animationType="none">
      <View style={StyleSheet.absoluteFill}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View
            style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }, { opacity: backdrop.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }) }]}
          />
        </Pressable>

        <Animated.View style={[s.panel, { width: panelWidth, transform: [{ translateX }] }]}>
          <View style={[s.panelInner, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.md }]}>
            <View style={s.header}>
              <Text style={s.headerTitle}>{t('settings.title')}</Text>
              <TouchableOpacity onPress={onClose} hitSlop={10} style={s.closeBtn}>
                <Ionicons name="close" size={18} color={colors.textHi} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: spacing.lg }} showsVerticalScrollIndicator={false}>
              <View style={s.profile}>
                <View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.profileName} numberOfLines={1}>{currentUser?.name ?? 'Unknown'}</Text>
                  <Text style={s.profileRole} numberOfLines={1}>{currentUser?.role ?? ''}</Text>
                </View>
              </View>

              <View>
                <Text style={s.sectionLabel}>{t('settings.appearance')}</Text>
                <View style={s.segment}>
                  {THEME_OPTIONS.map(opt => {
                    const active = theme.name === opt.name;
                    return (
                      <TouchableOpacity
                        key={opt.name}
                        style={[s.segmentBtn, active && s.segmentBtnActive]}
                        onPress={() => theme.setTheme(opt.name)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name={opt.icon} size={16} color={active ? colors.amber : colors.textMuted} />
                        <Text style={[s.segmentText, active && s.segmentTextActive]}>{t(opt.labelKey)}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View>
                <Text style={s.sectionLabel}>{t('settings.language')}</Text>
                <View style={s.segment}>
                  {LANGUAGE_OPTIONS.map(opt => {
                    const active = language === opt.code;
                    return (
                      <TouchableOpacity
                        key={opt.code}
                        style={[s.segmentBtn, active && s.segmentBtnActive]}
                        onPress={() => setLanguage(opt.code)}
                        activeOpacity={0.8}
                      >
                        <Text style={[s.segmentText, active && s.segmentTextActive]}>{opt.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity style={s.signOut} onPress={onLogout} activeOpacity={0.8}>
              <Ionicons name="log-out-outline" size={18} color={colors.stop} />
              <Text style={s.signOutText}>{t('settings.signOut')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const makeStyles = ({ colors, spacing, radius, fonts, typography }: Theme) => StyleSheet.create({
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    backgroundColor: colors.bgElevated,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  panelInner: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 19,
    color: colors.textHi,
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.amberSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.displayBold,
    color: colors.amber,
    fontSize: 14,
  },
  profileName: {
    ...typography.subtitle,
  },
  profileRole: {
    ...typography.small,
    textTransform: 'capitalize',
  },
  sectionLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  segment: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 11,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  segmentBtnActive: {
    borderColor: colors.amber,
    backgroundColor: colors.amberSoft,
  },
  segmentText: {
    fontFamily: fonts.displayMedium,
    color: colors.textMuted,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  segmentTextActive: {
    color: colors.textHi,
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 13,
    marginTop: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.stop,
    backgroundColor: colors.stopSoft,
  },
  signOutText: {
    fontFamily: fonts.displayBold,
    color: colors.stop,
    fontSize: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
