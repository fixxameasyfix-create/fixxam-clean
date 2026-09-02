import React, { useEffect } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";

import { AppText } from "@/components/ui";

import { HeroBannerItem } from "./HeroTypes";

const AnimatedPressable =
  Animated.createAnimatedComponent(Pressable);

type Props = {
  item: HeroBannerItem;
};

export default function HeroBanner({ item }: Props) {

    const scale = useSharedValue(1);

const animatedButtonStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

const imageOffset = useSharedValue(0);

useEffect(() => {
  imageOffset.value = withSpring(-6);

  const timer = setInterval(() => {
    imageOffset.value = withSpring(
      imageOffset.value === 0 ? -6 : 0,
    );
  }, 1800);

  return () => clearInterval(timer);
}, []);

const imageAnimatedStyle = useAnimatedStyle(() => ({
  transform: [
    {
      translateY: imageOffset.value,
    },
  ],
}));


  return (
    <LinearGradient
      colors={item.colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >

<View style={styles.circleLarge} />
<View style={styles.circleSmall} />

      <View style={styles.left}>
        <View style={styles.badge}>
          <Ionicons
            name={item.icon}
            size={22}
            color="#FFFFFF"
          />
        </View>

        <AppText
          weight="bold"
          style={styles.title}
        >
          {item.title}
        </AppText>

        <AppText style={styles.subtitle}>
          {item.subtitle}
        </AppText>

        <AnimatedPressable
  onPressIn={() => {
    scale.value = withSpring(0.96);
  }}
  onPressOut={() => {
    scale.value = withSpring(1);
  }}
  onPress={() => router.push(item.route as never)}
  style={[styles.button, animatedButtonStyle]}
>
  <AppText
    weight="bold"
    style={styles.buttonText}
  >
    {item.buttonLabel}
  </AppText>

  <Ionicons
    name="arrow-forward"
    size={18}
    color="#FF6B00"
  />
</AnimatedPressable>
      </View>

      <View style={styles.right}>
  <Animated.View
  style={[
    styles.imageWrapper,
    imageAnimatedStyle,
  ]}
>
  <Image
    source={item.image}
    resizeMode="contain"
    style={styles.image}
  />
</Animated.View>
</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 132,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    borderRadius: 20,
    overflow: "hidden",

    paddingHorizontal: 18,
    paddingVertical: 16,
  },

  left: {
    flex: 1,
    justifyContent: "space-evenly",
    paddingRight: 8,
  },

  right: {
    width: 105,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  badge: {
    width: 34,
    height: 34,

    borderRadius: 17,

    backgroundColor: "rgba(255,255,255,0.18)",

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 8,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 20,
  },

  subtitle: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },

  button: {
    alignSelf: "flex-start",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    height: 32,

    paddingHorizontal: 14,

    borderRadius: 16,

    backgroundColor: "#FFFFFF",

    marginTop: 7,
  },

  buttonText: {
    color: "#FF6B00",
    fontSize: 9,
    fontWeight: "600",
    marginRight: 4,
  },

  imageWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width: 80,
    height: 80,
  },

  circleLarge: {
    position: "absolute",

    width: 150,
    height: 150,

    borderRadius: 75,

    backgroundColor: "rgba(255,255,255,0.08)",

    top: -60,
    right: -40,
  },

  circleSmall: {
    position: "absolute",

    width: 80,
    height: 80,

    borderRadius: 40,

    backgroundColor: "rgba(255,255,255,0.06)",

    bottom: -18,
    left: -18,
  },
});