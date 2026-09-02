import { Dimensions, PixelRatio } from "react-native";

const { width, height } = Dimensions.get("window");

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

export const wp = (percentage: number) =>
  (width * percentage) / 100;

export const hp = (percentage: number) =>
  (height * percentage) / 100;

export const normalize = (size: number) => {
  const scale = width / 375;
  const newSize = size * scale;

  return Math.round(
    PixelRatio.roundToNearestPixel(newSize)
  );
};