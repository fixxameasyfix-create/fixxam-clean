import React, {
  useCallback,
  useState,
} from "react";

import {
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

import Carousel from "react-native-reanimated-carousel";

import {
  FixxamTokens,
} from "@/theme";

import HeroBanner from "./HeroBanner";
import {
  heroData,
} from "./HeroData";
import HeroPagination from "./HeroPagination";

import type {
  HeroBannerItem,
} from "./HeroTypes";

/* ============================================================
   CONSTANTS
============================================================ */

const BANNER_ASPECT_RATIO = 0.42;

const AUTO_PLAY_INTERVAL = 4500;

const SCROLL_ANIMATION_DURATION = 600;

/* ============================================================
   COMPONENT
============================================================ */

export default function HeroCarousel() {
  const {
    width: screenWidth,
  } = useWindowDimensions();

  const [
    activeIndex,
    setActiveIndex,
  ] = useState(0);

  /* ==========================================================
     EMPTY
  ========================================================== */

  if (
    heroData.length ===
    0
  ) {
    return null;
  }

  /* ==========================================================
     SIZE
  ========================================================== */

  const bannerWidth =
    Math.max(
      0,
      screenWidth -
        FixxamTokens.spacing.lg *
          2,
    );

  const bannerHeight =
    Math.round(
      bannerWidth *
        BANNER_ASPECT_RATIO,
    );

  const hasMultipleBanners =
    heroData.length > 1;

  /* ==========================================================
     SNAP
  ========================================================== */

  const handleSnapToItem =
    useCallback(
      (
        index: number,
      ) => {
        setActiveIndex(
          index,
        );
      },
      [],
    );

  /* ==========================================================
     RENDER ITEM
  ========================================================== */

  const renderItem =
    useCallback(
      ({
        item,
      }: {
        item: HeroBannerItem;
        index: number;
      }) => (
        <View
          style={
            styles.itemContainer
          }
        >
          <HeroBanner
            item={item}
          />
        </View>
      ),
      [],
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View
      style={
        styles.container
      }
    >
      <Carousel
        width={
          screenWidth
        }
        height={
          bannerHeight
        }
        data={
          heroData
        }
        loop={
          hasMultipleBanners
        }
        autoPlay={
          hasMultipleBanners
        }
        autoPlayInterval={
          AUTO_PLAY_INTERVAL
        }
        pagingEnabled
        snapEnabled
        scrollAnimationDuration={
          SCROLL_ANIMATION_DURATION
        }
        onSnapToItem={
          handleSnapToItem
        }
        renderItem={
          renderItem
        }
      />

      {hasMultipleBanners ? (
        <HeroPagination
          total={
            heroData.length
          }
          activeIndex={
            activeIndex
          }
        />
      ) : null}
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      marginTop:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.md,
    },

    itemContainer: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",
    },
  });