import React from "react";

import {
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

import { router } from "expo-router";

import { HeroBannerItem } from "./HeroTypes";

type Props = {
  item: HeroBannerItem;
};

export default function HeroBanner({
  item,
}: Props) {
  const { width } = useWindowDimensions();

  const bannerWidth = width - 32;
  const bannerHeight = Math.round(
    bannerWidth * 0.42,
  );

  return (
    <Pressable
      onPress={() =>
        router.push(item.route as never)
      }
      style={({ pressed }) => [
        styles.container,
        {
          width: bannerWidth,
          height: bannerHeight,
        },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Home banner"
    >
      <Image
        source={item.image}
        resizeMode="cover"
        style={styles.image}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: "hidden",

    backgroundColor: "#F1F5F9",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  pressed: {
    opacity: 0.92,
  },
});