import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

export default function DotLoader() {
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const dots = Array.from({ length: 12 });

  return (
    <Animated.View
      style={{
        width: 100,
        height: 100,
        transform: [{ rotate: spin }],
      }}
    >
      {dots.map((_, index) => {
        const angle = (index * 360) / 12;
        const radius = 38;

        const x = radius * Math.cos((angle * Math.PI) / 180);
        const y = radius * Math.sin((angle * Math.PI) / 180);

        const isOrange = index >= 6;

        return (
          <View
            key={index}
            style={{
              position: "absolute",
              left: 50 + x - 5,
              top: 50 + y - 5,
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor:
  index < 4
    ? "#FF7A00"
    : index < 8
    ? "#0B3D91"
    : "#FFFFFF",

borderWidth: 1,
borderColor: "#E5E7EB",
            }}
          />
        );
      })}
    </Animated.View>
  );
}