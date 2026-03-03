/**
 * InsightPlug Design System
 *
 * Based on Becker's Economic Theory:
 * EV Adoption is governed by two primitive constraints:
 * 1) MONEY (Budget & Capital Efficiency)
 * 2) TIME (Labor & Transaction Cost Reduction)
 */

export const colors = {
  // Base palette
  background: '#F9FAFB',
  card: '#FFFFFF',
  border: '#E5E7EB',

  // Text hierarchy
  primary: '#111827',      // Primary text
  secondary: '#6B7280',    // Muted text
  tertiary: '#9CA3AF',     // Tertiary text

  // Semantic colors
  positive: '#059669',     // Emerald - for surplus/positive outcomes
  timeAccent: '#3B82F6',   // Blue - for time metrics
  neutral: '#6B7280',      // Gray - for neutral elements
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
  section: '48px',
};

export const typography = {
  kpiLarge: {
    fontSize: '40px',
    fontWeight: '700',
    lineHeight: '1.2',
  },
  kpiMedium: {
    fontSize: '32px',
    fontWeight: '700',
    lineHeight: '1.2',
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    lineHeight: '1.4',
  },
  subtitle: {
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '1.4',
  },
  body: {
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '1.6',
  },
  caption: {
    fontSize: '12px',
    fontWeight: '400',
    lineHeight: '1.4',
  },
};

export const cardStyles = {
  container: {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: '16px',
    padding: spacing.xl,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
};

export const dimensionColors = {
  money: colors.positive,    // Emerald for MONEY
  time: colors.timeAccent,   // Blue for TIME
};

