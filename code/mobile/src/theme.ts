import { Platform, StyleSheet, type TextStyle } from 'react-native';

/**
 * THEME SELECTION
 * ---------------------------------------------------------------------------
 * The app renders the LIGHT palette so the mobile UI matches the web dashboard.
 * The original avionics DARK palette is kept fully intact below — to flip the
 * whole app back to dark, change `ACTIVE_THEME` to 'dark' (single line).
 */
export type ThemeName = 'light' | 'dark';

export type Palette = {
  bg: string;        bgElevated: string; surface: string;   surfaceAlt: string; surfaceHi: string;
  border: string;    borderHi: string;   hairline: string;
  amber: string;     amberSoft: string;  amberGlow: string;
  go: string;        goSoft: string;     stop: string;       stopSoft: string;
  warn: string;      warnSoft: string;   sky: string;
  textHi: string;    text: string;       textMuted: string;  textDim: string;
  primary: string;   danger: string;     warning: string;    success: string;    textPrimary: string;
};

// Original avionics DARK palette — kept ready for when you want to flip back.
export const darkColors: Palette = {
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
};

// LIGHT palette mirroring the web app's `html[data-theme='light']` tokens.
export const lightColors: Palette = {
  bg:          '#EBF0F7',              // --bg-primary
  bgElevated:  '#F6F8FC',              // --bg-surface
  surface:     '#FFFFFF',              // --bg-elevated (cards)
  surfaceAlt:  '#F6F8FC',              // --bg-surface
  surfaceHi:   '#DDE3EF',              // --bg-inset
  border:      'rgba(50, 65, 110, 0.18)', // --border-default
  borderHi:    'rgba(50, 65, 110, 0.32)', // --border-strong
  hairline:    'rgba(50, 65, 110, 0.07)', // --border-subtle

  amber:       '#B8720A',              // --amber
  amberSoft:   'rgba(184, 114, 10, 0.13)', // --amber-soft
  amberGlow:   'rgba(184, 114, 10, 0.22)', // --amber-glow

  go:          '#069944',              // --clear
  goSoft:      'rgba(6, 153, 68, 0.12)',   // --clear-soft
  stop:        '#CC2010',              // --risk
  stopSoft:    'rgba(204, 32, 16, 0.10)',  // --risk-soft
  warn:        '#C2680A',
  warnSoft:    'rgba(194, 104, 10, 0.13)',
  sky:         '#0A82B8',              // --info

  textHi:      '#0E1628',              // --text-primary
  text:        '#364260',              // --text-secondary
  textMuted:   '#7888A8',              // --text-muted
  textDim:     '#9AA8C4',

  primary:     '#B8720A',
  danger:      '#CC2010',
  warning:     '#C2680A',
  success:     '#069944',
  textPrimary: '#0E1628',
};

export const palettes = { dark: darkColors, light: lightColors } as const;

/** Flip this to 'dark' to switch the entire app back to the dark theme. */
export const ACTIVE_THEME: ThemeName = 'light';

export const isDarkTheme: boolean = ACTIVE_THEME === ('dark' as ThemeName);

// Active palette consumed across the app. Everything (typography, layout, btn,
// statusInk) derives from this, so switching ACTIVE_THEME re-themes the app.
export const colors = palettes[ACTIVE_THEME];

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

// ---------------------------------------------------------------------------
// Palette-dependent tokens are exposed as FACTORIES so a theme can be built at
// runtime for any palette. The static exports below (`typography`, `layout`,
// `btn`, `statusInk`) are kept as defaults for the ACTIVE_THEME palette so any
// module that still imports them directly keeps working; reactive consumers
// should pull these from `useTheme()` instead.
// ---------------------------------------------------------------------------

export const makeTypography = (c: Palette) => ({
  display: {
    fontFamily: displayBold,
    fontSize: 28,
    letterSpacing: 0.5,
    color: c.textHi,
  } satisfies TextStyle,
  title: {
    fontFamily: displayBold,
    fontSize: 22,
    color: c.textHi,
    letterSpacing: 0.3,
  } satisfies TextStyle,
  subtitle: {
    fontFamily: displayMedium,
    fontSize: 16,
    color: c.textHi,
    letterSpacing: 0.2,
  } satisfies TextStyle,
  body: {
    fontSize: 15,
    color: c.text,
    lineHeight: 21,
  } satisfies TextStyle,
  small: {
    fontSize: 13,
    color: c.textMuted,
    lineHeight: 18,
  } satisfies TextStyle,
  mono: {
    fontFamily: mono,
    fontSize: 12,
    color: c.textMuted,
    letterSpacing: 0.5,
  } satisfies TextStyle,
  monoHi: {
    fontFamily: mono,
    fontSize: 13,
    color: c.amber,
    letterSpacing: 1,
  } satisfies TextStyle,
  label: {
    fontFamily: displayMedium,
    fontSize: 11,
    color: c.textMuted,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  } satisfies TextStyle,
  metric: {
    fontFamily: mono,
    fontSize: 32,
    color: c.textHi,
    letterSpacing: 0,
    fontVariant: ['tabular-nums'],
  } satisfies TextStyle,
});

export const makeLayout = (c: Palette) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: c.bg,
  },
  safeContent: {
    flex: 1,
    padding: spacing.md,
  },
  card: {
    backgroundColor: c.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.border,
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

export const makeBtn = (c: Palette) => StyleSheet.create({
  primary: {
    backgroundColor: c.amber,
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
    backgroundColor: c.stop,
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
    borderColor: c.borderHi,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  ghostLabel: {
    color: c.text,
    fontFamily: displayMedium,
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  } satisfies TextStyle,
  label: {
    color: c.textHi,
    fontFamily: displayBold,
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
  } satisfies TextStyle,
  labelMuted: {
    color: c.textMuted,
    fontFamily: displayMedium,
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  } satisfies TextStyle,
});

export const makeStatusInk = (c: Palette) => ({
  AVAILABLE: { ink: c.go,    soft: c.goSoft,    label: 'AVAILABLE' },
  IN_USE:    { ink: c.amber, soft: c.amberSoft, label: 'IN-USE'   },
  BROKEN:    { ink: c.stop,  soft: c.stopSoft,  label: 'BROKEN'    },
  MISSING:   { ink: c.warn,  soft: c.warnSoft,  label: 'MISSING'   },
} as const);

// A fully-resolved theme for a given palette — what `useTheme()` returns.
export type Theme = {
  name: ThemeName;
  isDark: boolean;
  colors: Palette;
  typography: ReturnType<typeof makeTypography>;
  layout: ReturnType<typeof makeLayout>;
  btn: ReturnType<typeof makeBtn>;
  statusInk: ReturnType<typeof makeStatusInk>;
  fonts: typeof fonts;
  spacing: typeof spacing;
  radius: typeof radius;
};

export function buildTheme(name: ThemeName): Theme {
  const c = palettes[name];
  return {
    name,
    isDark: name === 'dark',
    colors: c,
    typography: makeTypography(c),
    layout: makeLayout(c),
    btn: makeBtn(c),
    statusInk: makeStatusInk(c),
    fonts,
    spacing,
    radius,
  };
}

// Backward-compatible static exports (ACTIVE_THEME palette).
export const typography = makeTypography(colors);
export const layout = makeLayout(colors);
export const btn = makeBtn(colors);
export const statusInk = makeStatusInk(colors);
