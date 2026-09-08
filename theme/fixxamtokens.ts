import { Borders } from "./borders";
import { CustomerColors } from "./customerColors";
import { Shadows } from "./shadows";
import { Spacing } from "./spacing";
import { Typography } from "./typography";
import { WorkerColors } from "./workerColors";

export const FixxamTokens = {
  /*
   * Radius
   * Single source: borders.ts
   */
  radius: {
    none: Borders.none,
    xs: Borders.xs,
    sm: Borders.sm,
    md: Borders.md,
    lg: Borders.lg,
    xl: Borders.xl,
    full: Borders.full,

    button: Borders.button,
    input: Borders.input,
    search: Borders.search,
    card: Borders.card,
    modal: Borders.modal,
    bottomSheet: Borders.bottomSheet,
    badge: Borders.badge,
    avatar: Borders.avatar,


  iconButton: Borders.iconButton,
  image: Borders.image,
  chip: Borders.chip,

  },

  /*
   * Spacing
   * Single source: spacing.ts
   */
  spacing: {
    none: Spacing.none,
    xxs: Spacing.xxs,
    xs: Spacing.xs,
    sm: Spacing.sm,
    md: Spacing.md,
    lg: Spacing.lg,
    xl: Spacing.xl,
    xxl: Spacing.xxl,
    xxxl: Spacing.xxxl,

    screen: Spacing.screenPadding,
    section: Spacing.sectionGap,
    card: Spacing.cardPadding,
    form: Spacing.formGap,
    content: Spacing.contentGap,
  },

  /*
   * Component Sizes
   */
  size: {
    /*
     * Accessibility
     */
    minimumTouchTarget: 44,

    /*
     * Inputs / Buttons
     */
    inputHeight: 52,
    buttonHeight: 52,
    buttonSmallHeight: 44,

    /*
     * Navigation
     */
    headerHeight: 56,
    tabBarHeight: 64,

    authHeaderIcon: 64,


    /*
     * Cards
     */
    roleCardHeight: 84,

    /*
     * Icons
     */
    iconXs: 16,
    iconSm: 20,
    iconMd: 24,
    iconLg: 28,
    iconXl: 32,
    iconBox: 48,

    /*
     * Authentication
     */
    biometric: 56,
    otpBox: 52,

    /*
     * Avatars
     */
    avatarXs: 32,
    avatarSm: 40,
    avatarMd: 48,
    avatarLg: 56,
    avatarXl: 72,

    fab: 56,
fabLarge: 64,

  cardMinHeight: 72,
  },

  /*
   * Typography
   * Single source: typography.ts
   */
  font: {
    display: Typography.fontSize.display,
    title: Typography.fontSize.xxl,
    heading: Typography.fontSize.xl,
    subHeading: Typography.fontSize.lg,
    body: Typography.fontSize.md,
    caption: Typography.fontSize.sm,
    small: Typography.fontSize.xs,
  },

  /*
   * Shadows
   * Single source: shadows.ts
   */
  shadow: {
    none: Shadows.none,
    card: Shadows.card,
    button: Shadows.sm,
    floating: Shadows.floating,
    modal: Shadows.modal,
  },

  /*
   * Motion
   */
  motion: {
    fast: 150,
    normal: 220,
    slow: 300,

    pressedOpacity: 0.82,
    disabledOpacity: 0.5,

    scalePressed: 0.98,
  },
} as const;

/*
 * Compatibility colors.
 *
 * Brand colors come directly from the official
 * Customer and Worker palettes.
 */
export const FixxamColors = {
  /*
   * Role Brand
   */
  customer: CustomerColors.primary,
  customerSoft: CustomerColors.primarySoft,
  customerDark: CustomerColors.primaryDark,

  worker: WorkerColors.primary,
  workerSoft: WorkerColors.primarySoft,
  workerDark: WorkerColors.primaryDark,

  /*
   * Status
   */
  success: CustomerColors.success,
  warning: CustomerColors.warning,
  error: CustomerColors.error,
  info: CustomerColors.info,

  /*
   * Neutral
   */
  white: CustomerColors.white,
  black: CustomerColors.textPrimary,

  textPrimary: CustomerColors.textPrimary,
  textSecondary: CustomerColors.textSecondary,
  textMuted: CustomerColors.textMuted,

  border: CustomerColors.border,
  divider: CustomerColors.divider,

  background: CustomerColors.background,
  surface: CustomerColors.surface,
  card: CustomerColors.card,
} as const;

export type FixxamTokenType = typeof FixxamTokens;
export type FixxamColorType = typeof FixxamColors;

export default FixxamTokens;