import { Platform, StyleSheet, type TextStyle } from 'react-native';

export const colors = {
  bg:          '#07090F',
  bgElevated:  '#0B0E18',
  surface:     '#0F1320',
  surfaceAlt:  '#161B2C',
  surfaceHi:   '#1B2238',
  border:      '#1E243A',
  borderHi:    '#2A334F',
  hairline:    '#11162A',

  amber:       '#FFB020',
  amberSoft:   '#7A4A00',
  amberGlow:   'rgba(255, 176, 32, 0.18)',

  go:          '#3DDC97',
  goSoft:      '#0E3A2A',
  stop:        '#FF5252',
  stopSoft:    '#3A1414',
  warn:        '#F0A500',
  warnSoft:    '#3A2A00',
  sky:         '#5BC0EB',

  textHi:      '#F2F4FA',
  text:        '#D6D9E4',
  textMuted:   '#7A819A',
  textDim:     '#4A5070',

  primary:     '#FFB020',
  danger:      '#FF5252',
  warning:     '#F0A500',
  success:     '#3DDC97',
  textPrimary: '#F2F4FA',
} as const;

export const spacing = {
  xxs: 2,
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;

export const radius = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
} as const;

const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });
const displayBold = Platform.select({
  ios: 'AvenirNext-Heavy',
  android: 'sans-serif-condensed',
  default: 'System',
});
const displayMedium = Platform.select({
  ios: 'AvenirNext-DemiBold',
  android: 'sans-serif-medium',
  default: 'System',
});

export const fonts = { mono, displayBold, displayMedium } as const;

export const typography = {
  display: {
    fontFamily: displayBold,
    fontSize: 28,
    letterSpacing: 0.5,
    color: colors.textHi,
  } satisfies TextStyle,
  title: {
    fontFamily: displayBold,
    fontSize: 22,
    color: colors.textHi,
    letterSpacing: 0.3,
  } satisfies TextStyle,
  subtitle: {
    fontFamily: displayMedium,
    fontSize: 16,
    color: colors.textHi,
    letterSpacing: 0.2,
  } satisfies TextStyle,
  body: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 21,
  } satisfies TextStyle,
  small: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  } satisfies TextStyle,
  mono: {
    fontFamily: mono,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 0.5,
  } satisfies TextStyle,
  monoHi: {
    fontFamily: mono,
    fontSize: 13,
    color: colors.amber,
    letterSpacing: 1,
  } satisfies TextStyle,
  label: {
    fontFamily: displayMedium,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  } satisfies TextStyle,
  metric: {
    fontFamily: mono,
    fontSize: 32,
    color: colors.textHi,
    letterSpacing: 0,
    fontVariant: ['tabular-nums'],
  } satisfies TextStyle,
} as const;

export const layout = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  safeContent: {
    flex: 1,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export const btn = StyleSheet.create({
  primary: {
    backgroundColor: colors.amber,
    borderRadius: radius.md,
    paddingVertical: 16,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    boxShadow: '0 6px 24px rgba(255, 176, 32, 0.18)',
  },
  primaryLabel: {
    color: '#0A0A0A',
    fontFamily: displayBold,
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
  } satisfies TextStyle,
  danger: {
    backgroundColor: colors.stop,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    boxShadow: '0 4px 18px rgba(255, 82, 82, 0.22)',
  },
  dangerLabel: {
    color: '#FFFFFF',
    fontFamily: displayBold,
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
  } satisfies TextStyle,
  ghost: {
    borderWidth: 1,
    borderColor: colors.borderHi,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  ghostLabel: {
    color: colors.text,
    fontFamily: displayMedium,
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  } satisfies TextStyle,
  label: {
    color: colors.textHi,
    fontFamily: displayBold,
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
  } satisfies TextStyle,
  labelMuted: {
    color: colors.textMuted,
    fontFamily: displayMedium,
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  } satisfies TextStyle,
});

export const statusInk = {
  AVAILABLE: { ink: colors.go,    soft: colors.goSoft,   label: 'AVAILABLE' },
  IN_USE:    { ink: colors.amber, soft: colors.amberSoft, label: 'IN-USE'   },
  BROKEN:    { ink: colors.stop,  soft: colors.stopSoft, label: 'BROKEN'    },
  MISSING:   { ink: colors.warn,  soft: colors.warnSoft, label: 'MISSING'   },
} as const;
