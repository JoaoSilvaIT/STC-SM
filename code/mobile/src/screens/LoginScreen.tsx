import React, { useMemo, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { fonts, spacing, radius, type Palette } from '../theme';
import GridBackdrop from '../components/GridBackdrop';
import Logo from '../components/Logo';
import LED from '../components/LED';
import { useTranslation } from 'react-i18next';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login, loading } = useAuth();
  const { t } = useTranslation();
  const { colors, typography, btn, layout } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    setError('');
    try {
      const result = await login(email.trim(), password);
      if (result === 'ok') {
        navigation.replace('Home');
      } else if (result === 'not_mechanic') {
        setError(t('login.errNotMechanic'));
      } else {
        setError(t('login.errInvalid'));
      }
    } catch {
      setError(t('login.errNetwork'));
    }
  }

  return (
    <KeyboardAvoidingView
      style={layout.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <GridBackdrop opacity={0.4} />
      <View style={s.amberGlow} pointerEvents="none" />

      <View style={s.scroll}>
        <View style={s.statusBar}>
          <View style={s.statusItem}>
            <LED color={colors.go} size={6} />
            <Text style={s.statusText}>{t('login.sysOnline')}</Text>
          </View>
          <Text style={s.statusCode}>v1.0 · ATL-MRO</Text>
        </View>

        <View style={s.brandBlock}>
          <Logo size={64} />
          <View style={{ height: 28 }} />
          <Text style={s.eyebrow}>{t('login.eyebrow')}</Text>
          <Text style={s.brand}>{t('login.brand')}</Text>
          <Text style={s.tagline}>
            {t('login.tagline')}
          </Text>
        </View>

        <View style={s.formBlock}>
          <Text style={s.fieldLabel}>{t('login.operatorId')}</Text>
          <View style={[s.inputWrap, emailFocus && s.inputWrapFocus]}>
            <Ionicons name="person-outline" size={16} color={emailFocus ? colors.amber : colors.textDim} />
            <TextInput
              style={s.input}
              placeholder="operator@atl-mro.pt"
              placeholderTextColor={colors.textDim}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={{ height: spacing.sm }} />

          <Text style={s.fieldLabel}>{t('login.accessKey')}</Text>
          <View style={[s.inputWrap, passFocus && s.inputWrapFocus]}>
            <Ionicons name="key-outline" size={16} color={passFocus ? colors.amber : colors.textDim} />
            <TextInput
              style={s.input}
              placeholder="••••••••"
              placeholderTextColor={colors.textDim}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPassFocus(true)}
              onBlur={() => setPassFocus(false)}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textDim} />
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={s.errorRow}>
              <Ionicons name="alert-circle" size={14} color={colors.stop} />
              <Text style={s.errorText} selectable>{error}</Text>
            </View>
          ) : null}

          <View style={{ height: spacing.lg }} />

          <TouchableOpacity style={[btn.primary, loading && { opacity: 0.6 }]} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            <Text style={btn.primaryLabel}>{loading ? t('login.signingIn') : t('login.signIn')}</Text>
            <Ionicons name="arrow-forward" size={16} color="#0A0A0A" />
          </TouchableOpacity>
        </View>

        <View style={s.footer}>
          <View style={s.footerLine} />
          <Text style={s.footerText}>
            {t('login.footer')}
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  amberGlow: {
    position: 'absolute',
    top: -120,
    left: -60,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: colors.amber,
    opacity: 0.08,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statusItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  statusText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.go,
    letterSpacing: 1.5,
  },
  statusCode: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textDim,
    letterSpacing: 1.5,
  },
  brandBlock: {
    alignItems: 'flex-start',
    marginTop: spacing.xxl,
    marginBottom: spacing.xxl,
  },
  eyebrow: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.amber,
    letterSpacing: 3,
    marginBottom: spacing.xs,
  },
  brand: {
    fontFamily: fonts.displayBold,
    fontSize: 42,
    color: colors.textHi,
    letterSpacing: 1,
    lineHeight: 44,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.md,
    maxWidth: 280,
    lineHeight: 20,
  },
  formBlock: {
    gap: 0,
  },
  fieldLabel: {
    fontFamily: fonts.displayBold,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: spacing.xs,
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
  },
  inputWrapFocus: {
    borderColor: colors.amber,
    backgroundColor: colors.surfaceAlt,
  },
  input: {
    flex: 1,
    color: colors.textHi,
    fontSize: 15,
    paddingVertical: 14,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.stopSoft,
  },
  errorText: {
    color: colors.stop,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
  footerLine: {
    width: 32,
    height: 1,
    backgroundColor: colors.borderHi,
    marginBottom: spacing.md,
  },
  footerText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textDim,
    letterSpacing: 1.5,
  },
});
