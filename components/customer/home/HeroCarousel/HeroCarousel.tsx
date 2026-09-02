import React, { useState } from "react";

import {
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

import Carousel from "react-native-reanimated-carousel";

import HeroBanner from "./HeroBanner";
import { heroData } from "./HeroData";
import HeroPagination from "./HeroPagination";

export default function HeroCarousel() {
  const { width } = useWindowDimensions();

  const [activeIndex, setActiveIndex] =
    useState(0);

  const bannerWidth = width - 32;
  const bannerHeight = Math.round(
    bannerWidth * 0.42,
  );

  return (
    <View style={styles.container}>
      <Carousel
        width={width}
        height={bannerHeight}
        data={heroData}
        loop
        autoPlay
        autoPlayInterval={4500}
        pagingEnabled
        snapEnabled
        scrollAnimationDuration={600}
        onSnapToItem={setActiveIndex}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <HeroBanner item={item} />
          </View>
        )}
      />

      <HeroPagination
        total={heroData.length}
        activeIndex={activeIndex}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 12,
  },

  itemContainer: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",
  },
});