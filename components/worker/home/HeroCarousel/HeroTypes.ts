import { ImageSourcePropType } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export type HeroType = "job" | "market";

export interface HeroBannerItem {
  id: string;
  type: HeroType;

  title: string;
  subtitle: string;

  buttonLabel: string;

  icon: keyof typeof Ionicons.glyphMap;

  image: ImageSourcePropType;

  route: string;

  colors: readonly [string, string];
}