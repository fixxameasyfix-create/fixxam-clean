import { FixxamTokens } from "./fixxamtokens";

export const FIXXAM = {
  // Heights
  INPUT_HEIGHT: FixxamTokens.size.inputHeight,
  BUTTON_HEIGHT: FixxamTokens.size.buttonHeight,
  CARD_HEIGHT: FixxamTokens.size.cardMinHeight,

  // Icons
  ICON_SIZE_SM: FixxamTokens.size.iconXs,
  ICON_SIZE_MD: FixxamTokens.size.iconSm,
  ICON_SIZE_LG: FixxamTokens.size.iconMd,
  ICON_SIZE_XL: FixxamTokens.size.iconXl,

  // Typography
  BODY_SIZE: FixxamTokens.font.body,
  CAPTION_SIZE: FixxamTokens.font.caption,
  SMALL_SIZE: FixxamTokens.font.small,

  FONT_LG: FixxamTokens.font.body,

  TITLE_SIZE: FixxamTokens.font.title,
  HEADING_SIZE: FixxamTokens.font.heading,
  DISPLAY_SIZE: FixxamTokens.font.display,

  // Radius
  BORDER_RADIUS_SM: FixxamTokens.radius.sm,
  BORDER_RADIUS_MD: FixxamTokens.radius.md,
  BORDER_RADIUS_LG: FixxamTokens.radius.lg,
  BORDER_RADIUS_XL: FixxamTokens.radius.xl,
  BORDER_RADIUS_FULL: FixxamTokens.radius.full,

  // Animation
  ANIMATION_FAST: FixxamTokens.motion.fast,
  ANIMATION_NORMAL: FixxamTokens.motion.normal,
  ANIMATION_SLOW: FixxamTokens.motion.slow,

  // Opacity
  DISABLED_OPACITY: FixxamTokens.motion.disabledOpacity,
  PRESSED_OPACITY: FixxamTokens.motion.pressedOpacity,

  // OTP
  OTP_BOX_SIZE: FixxamTokens.size.otpBox,
} as const;

export default FIXXAM;