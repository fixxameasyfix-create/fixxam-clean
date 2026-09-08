import { normalize } from "@/utils/responsive";

const fontSize = {
  xs: normalize(12),
  sm: normalize(14),
  md: normalize(16),
  lg: normalize(18),
  xl: normalize(22),
  xxl: normalize(28),
  display: normalize(36),
} as const;

const lineHeight = {
  xs: normalize(16),
  sm: normalize(20),
  md: normalize(24),
  lg: normalize(26),
  xl: normalize(30),
  xxl: normalize(36),
  display: normalize(44),
} as const;

const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export const Typography = {
  /*
   * Core Type Scale
   */
  fontSize,
  lineHeight,
  fontWeight,

  /*
   * Letter Spacing
   */
  letterSpacing: {
    tight: -0.4,
    normal: 0,
    wide: 0.2,
  },

  /*
   * Fixxam Semantic Typography
   */
  styles: {
    display: {
      fontSize: fontSize.display,
      lineHeight: lineHeight.display,
      fontWeight: fontWeight.bold,
      letterSpacing: -0.4,
    },

    heading1: {
      fontSize: fontSize.xxl,
      lineHeight: lineHeight.xxl,
      fontWeight: fontWeight.bold,
      letterSpacing: -0.3,
    },

    heading2: {
      fontSize: fontSize.xl,
      lineHeight: lineHeight.xl,
      fontWeight: fontWeight.bold,
      letterSpacing: -0.2,
    },

    heading3: {
      fontSize: fontSize.lg,
      lineHeight: lineHeight.lg,
      fontWeight: fontWeight.semibold,
      letterSpacing: 0,
    },

    bodyLarge: {
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      fontWeight: fontWeight.regular,
      letterSpacing: 0,
    },

    body: {
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      fontWeight: fontWeight.regular,
      letterSpacing: 0,
    },

    bodyMedium: {
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      fontWeight: fontWeight.medium,
      letterSpacing: 0,
    },

    label: {
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      fontWeight: fontWeight.semibold,
      letterSpacing: 0,
    },

    button: {
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      fontWeight: fontWeight.semibold,
      letterSpacing: 0,
    },

    caption: {
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      fontWeight: fontWeight.regular,
      letterSpacing: 0.2,
    },
  },
} as const;

export type FixxamTypography = typeof Typography;

export default Typography;