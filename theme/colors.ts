const Colors = {
  /*
   * Core
   */
  white: "#FFFFFF",
  black: "#000000",

  /*
   * Backgrounds / Surfaces
   */
  background: "#F8FAFC",
  surface: "#FFFFFF",
  card: "#FFFFFF",

  /*
   * Text
   */
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  textDisabled: "#CBD5E1",
  textInverse: "#FFFFFF",

  /*
   * Borders / Dividers
   */
  border: "#E2E8F0",
  borderStrong: "#CBD5E1",
  divider: "#E5E7EB",

  /*
   * Status
   */
  success: "#16A34A",
  successSoft: "#F0FDF4",

  warning: "#F59E0B",
  warningSoft: "#FFFBEB",

  error: "#DC2626",
  errorSoft: "#FEF2F2",

  info: "#0EA5E9",
  infoSoft: "#F0F9FF",

  /*
   * Disabled
   */
  disabled: "#CBD5E1",
  disabledBackground: "#F1F5F9",

  /*
   * Icons
   */
  icon: "#475569",
  iconMuted: "#94A3B8",
  iconBackground: "#F1F5F9",

  /*
   * Overlay
   */
  overlayLight: "rgba(15, 23, 42, 0.08)",
  overlayMedium: "rgba(15, 23, 42, 0.32)",
  overlayStrong: "rgba(15, 23, 42, 0.60)",

  /*
   * Shadow
   */
  shadow: "#0F172A",
} as const;

export type FixxamBaseColors = typeof Colors;

export default Colors;