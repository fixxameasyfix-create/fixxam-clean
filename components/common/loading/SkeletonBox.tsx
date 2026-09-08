import React, {
  memo,
  useEffect,
  useRef,
} from "react";

import {
  Animated,
  type DimensionValue,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from "react-native";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

export interface SkeletonBoxProps {
  width?: DimensionValue;

  height: number;

  borderRadius?: number;

  animated?: boolean;

  color?: string;

  style?: StyleProp<ViewStyle>;
}

function SkeletonBox({
  width = "100%",
  height,

  borderRadius =
    FixxamTokens.radius.md,

  animated = true,

  color = Colors.iconBackground,

  style,
}: SkeletonBoxProps) {
  const opacity = useRef(
    new Animated.Value(
      animated ? 0.5 : 1,
    ),
  ).current;

  useEffect(() => {
    if (!animated) {
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
          toValue: 0.5,
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
  }, [animated, opacity]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: color,
          opacity,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: "hidden",
  },
});

export default memo(SkeletonBox);