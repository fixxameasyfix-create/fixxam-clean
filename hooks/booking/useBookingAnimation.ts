import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function useBookingAnimation() {
  const progress = useSharedValue(0);

  const containerStyle =
    useAnimatedStyle(() => {
      return {
        opacity: withTiming(
          1,
          {
            duration: 200,
          }
        ),
      };
    });

  const fadeStyle =
    useAnimatedStyle(() => {
      return {
        opacity: 1,
      };
    });

  const footerStyle =
    useAnimatedStyle(() => {
      return {
        opacity: 1,
      };
    });

  return {
    containerStyle,
    fadeStyle,
    footerStyle,
  };
}