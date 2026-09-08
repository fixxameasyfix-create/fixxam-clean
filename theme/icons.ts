import { FixxamTokens } from "./fixxamtokens";

export const IconTokens = {
  size: {
    xs: FixxamTokens.size.iconXs,
    sm: FixxamTokens.size.iconSm,
    md: FixxamTokens.size.iconMd,
    lg: FixxamTokens.size.iconLg,
    xl: FixxamTokens.size.iconXl,
  },

  strokeWidth: {
    regular: 2,
    medium: 2.25,
    strong: 2.5,
  },
} as const;

export type FixxamIconSize = keyof typeof IconTokens.size;
export type FixxamIconWeight = keyof typeof IconTokens.strokeWidth;

export default IconTokens;