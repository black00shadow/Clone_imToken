// imToken exact design tokens (pixel-matched reference)
export const colors = {
  primary: '#007FFF',
  primaryDark: '#0062CC',
  primaryLight: '#EBF5FF',
  tokenlon: '#11CFCF',
  tokenlonDark: '#0BA8A8',
  background: '#F5F6F7',
  card: '#FFFFFF',
  text: '#191C1E',
  textSecondary: '#8B939E',
  textTertiary: '#C5CAD0',
  border: '#E8EAED',
  divider: '#F0F1F3',
  success: '#07C160',
  warning: '#FF9500',
  danger: '#FA5151',
  tabInactive: '#8B939E',
  tabActive: '#007FFF',
  headerGradient: ['#007FFF', '#0062CC'] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  h2: { fontSize: 20, fontWeight: '600' as const, lineHeight: 26 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  tab: { fontSize: 10, fontWeight: '500' as const },
};

export const layout = {
  tabBarHeight: 49,
  headerHeight: 88,
  quickActionSize: 48,
};
