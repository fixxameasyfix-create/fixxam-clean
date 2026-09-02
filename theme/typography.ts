import { normalize } from "@/utils/responsive";

export const Typography = {
  fontSize: {
    xs: normalize(12),
    sm: normalize(14),
    md: normalize(16),
    lg: normalize(18),
    xl: normalize(22),
    xxl: normalize(28),
    display: normalize(36),
  },

  fontWeight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  } as const,
};
    export default Typography