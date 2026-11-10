/**
 * OCEAN_FRESH — the design-system preset chosen for IsyFish, copied locally so
 * the app owns its tokens. The only override on top of the preset is the warm
 * lantern accent, which marks unlocks and catches and nothing else.
 */
export const theme = {
  name: 'OCEAN_FRESH',

  colors: {
    bg: {
      base: '#E8F4F8',
      surface: '#D1E7EE',
      raised: '#B8DBE5',
      deep: '#9DCEDB',
      underIce: '#04293A',
      underIceAlt: '#072B3F',
    },
    tile: 'rgba(255,255,255,0.78)',
    tileSoft: 'rgba(255,255,255,0.62)',
    tileStrong: 'rgba(255,255,255,0.86)',
    accent: '#00A6CB',
    deep: '#00558B',
    warm: '#F2A65A',
    mint: '#7FE8C5',
    success: '#0E7C5A',
    successBg: 'rgba(127,232,197,0.20)',
    danger: '#C0462B',
    dangerBg: 'rgba(217,91,61,0.14)',
    border: 'rgba(0,85,139,0.14)',
    borderStrong: 'rgba(0,85,139,0.34)',
    track: 'rgba(0,85,139,0.10)',
    text: {
      primary: '#04293A',
      secondary: '#3E6F85',
      muted: '#7FA3B3',
      onDark: '#FFFFFF',
      onDarkSoft: 'rgba(209,231,238,0.82)',
    },
  },

  gradients: {
    cta: ['#00558B', '#00A6CB'],
    ctaDisabled: ['#9DB3BD', '#8FA6B1'],
    gauge: ['#9DCEDB', '#00A6CB', '#00558B'],
    progress: ['#00A6CB', '#7FE8C5'],
    warm: ['#F2A65A', '#F7C892'],
    loader: ['rgba(4,41,58,0.94)', 'rgba(0,85,139,0.86)', 'rgba(7,43,63,0.96)'],
    menu: [
      'rgba(232,244,248,0.92)',
      'rgba(209,231,238,0.80)',
      'rgba(157,206,219,0.62)',
    ],
    activity: ['rgba(232,244,248,0.94)', 'rgba(184,219,229,0.70)'],
    challenge: ['rgba(0,85,139,0.26)', 'rgba(232,244,248,0.94)'],
    result: ['rgba(0,166,203,0.28)', 'rgba(232,244,248,0.96)'],
    stats: ['rgba(157,206,219,0.72)', 'rgba(232,244,248,0.94)'],
    collection: ['rgba(232,244,248,0.90)', 'rgba(127,232,197,0.22)'],
    daily: ['rgba(4,41,58,0.38)', 'rgba(232,244,248,0.92)'],
    settings: ['rgba(232,244,248,0.94)', 'rgba(209,231,238,0.84)'],
  },

  radius: {sm: 12, md: 16, lg: 18, xl: 20, xxl: 24, brand: 32, pill: 999},

  spacing: {xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32},

  typography: {
    hero: {fontSize: 42, fontWeight: '800' as const, letterSpacing: 4},
    screenTitle: {fontSize: 26, fontWeight: '800' as const, letterSpacing: 0.4},
    headerTitle: {fontSize: 15, fontWeight: '700' as const, letterSpacing: 1.4},
    readout: {fontSize: 34, fontWeight: '800' as const},
    tileValue: {fontSize: 22, fontWeight: '800' as const},
    body: {fontSize: 15, fontWeight: '500' as const, lineHeight: 21},
    button: {fontSize: 16, fontWeight: '800' as const, letterSpacing: 1.4, lineHeight: 24},
    buttonLarge: {fontSize: 19, fontWeight: '800' as const, letterSpacing: 1.3, lineHeight: 24},
    caption: {fontSize: 11, fontWeight: '600' as const, letterSpacing: 1.2},
  },

  shadows: {
    tile: {
      shadowColor: '#00558B',
      shadowOpacity: 0.1,
      shadowRadius: 10,
      shadowOffset: {width: 0, height: 4},
      elevation: 3,
    },
    cta: {
      shadowColor: '#00558B',
      shadowOpacity: 0.32,
      shadowRadius: 18,
      shadowOffset: {width: 0, height: 8},
      elevation: 8,
    },
    panel: {
      shadowColor: '#00558B',
      shadowOpacity: 0.16,
      shadowRadius: 16,
      shadowOffset: {width: 0, height: -6},
      elevation: 12,
    },
  },

  animation: {
    entrance: {tension: 180, friction: 12},
    press: {tension: 300, friction: 14},
    pulse: {tension: 220, friction: 10},
  },
} as const;

export type Theme = typeof theme;

/** High-contrast overrides (SettingsScreen row 3) — applied on top of `theme`. */
export const CONTRAST = {
  textPrimary: '#04293A',
  textSecondary: '#0B2B3C',
  border: 'rgba(0,85,139,0.34)',
  borderWidth: 2,
  bgImageOpacityDrop: 0.12,
};
