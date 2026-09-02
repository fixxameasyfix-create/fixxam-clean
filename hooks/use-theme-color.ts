import { CustomerColors } from "@/theme";

export function useThemeColor(
  _props: {
    light?: string;
    dark?: string;
  },
  colorName: keyof typeof CustomerColors
) {
  return CustomerColors[colorName];
}