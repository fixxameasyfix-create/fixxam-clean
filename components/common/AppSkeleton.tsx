import React, {
  memo,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

import {
  Animated,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  type DimensionValue,
} from "react-native";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

export interface AppSkeletonProps {
  loading: boolean;

  children?: ReactNode;

  count?: number;

  width?: DimensionValue;

  height?: number;

  borderRadius?: number;

  gap?: number;

  animated?: boolean;

  padded?: boolean;

  style?: StyleProp<ViewStyle>;

  itemStyle?: StyleProp<ViewStyle>;
}

function AppSkeleton({
  loading,
  children,

  count = 3,

  width = "100%",
  height = 88,

  borderRadius =
    FixxamTokens.radius.card,

  gap = FixxamTokens.spacing.md,

  animated = true,

  padded = false,

  style,
  itemStyle,
}: AppSkeletonProps) {
  const opacity = useRef(
    new Animated.Value(0.55),
  ).current;

  useEffect(() => {
    if (!loading || !animated) {
      opacity.stopAnimation();
      opacity.setValue(1);

      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration:
            FixxamTokens.motion.slow,
          useNativeDriver: true,
        }),

        Animated.timing(opacity, {
          toValue: 0.55,
          duration:
            FixxamTokens.motion.slow,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [
    animated,
    loading,
    opacity,
  ]);

  if (!loading) {
    return <>{children}</>;
  }

  const safeCount = Math.max(
    1,
    Math.floor(count),
  );

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Loading content"
      style={[
        styles.container,

        padded
          ? styles.padded
          : null,

        style,
      ]}
    >
      {Array.from({
        length: safeCount,
      }).map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.item,

            {
              width,
              height,
              borderRadius,
              opacity,

              marginBottom:
                index === safeCount - 1
                  ? 0
                  : gap,
            },

            itemStyle,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  padded: {
    padding:
      FixxamTokens.spacing.lg,
  },

  item: {
    backgroundColor:
      Colors.iconBackground,

    overflow: "hidden",
  },
});

export default memo(AppSkeleton);