import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";

import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

type Props = {
  total: number;
  activeIndex: number;
};

type DotProps = {
  active: boolean;
};

function Dot({ active }: DotProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withSpring(active ? 24 : 8),
    opacity: withSpring(active ? 1 : 0.35),
    transform: [
      {
        scale: withSpring(active ? 1 : 0.9),
      },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        active && styles.activeDot,
        animatedStyle,
      ]}
    />
  );
}

export default function HeroPagination({
  total,
  activeIndex,
}: Props) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <Dot
          key={index}
          active={index === activeIndex}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 8,
    gap: 6,
  },

  dot: {
    height: 8,
    width: 8,
    borderRadius: 999,
    backgroundColor: "#D1D5DB",
  },

  activeDot: {
    backgroundColor: "#FF6B00",
  },
});