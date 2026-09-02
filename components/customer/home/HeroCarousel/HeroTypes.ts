import type { ImageSourcePropType } from "react-native";

export type HeroType =
  | "book"
  | "market";

export interface HeroBannerItem {
  id: string;
  type: HeroType;

  image: ImageSourcePropType;

  route: string;
}