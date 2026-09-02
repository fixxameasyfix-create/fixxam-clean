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

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View style={styles.container}>
      <Carousel
        width={width}
        height={132}
        data={heroData}
        loop
        autoPlay
        autoPlayInterval={4500}
        pagingEnabled
        snapEnabled
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.96,
          parallaxScrollingOffset: 28,
          parallaxAdjacentItemScale: 0.9,
        }}
        scrollAnimationDuration={700}
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
    marginTop: 6,
    marginBottom: 10,
  },

  itemContainer: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
});