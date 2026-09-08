import React, {
  useCallback,
} from "react";

import {
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

import {
  Image,
} from "expo-image";

import {
  router,
} from "expo-router";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

import type {
  HeroBannerItem,
} from "./HeroTypes";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  item: HeroBannerItem;
};

/* ============================================================
   CONSTANTS
============================================================ */

const BANNER_ASPECT_RATIO = 0.42;

/* ============================================================
   COMPONENT
============================================================ */

export default function HeroBanner({
  item,
}: Props) {
  const {
    width: screenWidth,
  } = useWindowDimensions();

  /* ==========================================================
     RESPONSIVE SIZE
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

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const handlePress =
    useCallback(() => {
      /*
       * Preserve the existing
       * dynamic banner route.
       */
      router.push(
        item.route as never,
      );
    }, [
      item.route,
    ]);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <Pressable
      onPress={
        handlePress
      }
      accessibilityRole="button"
      accessibilityLabel="Home banner"
      accessibilityHint="Opens banner destination"
      style={({
        pressed,
      }) => [
        styles.container,

        {
          width:
            bannerWidth,

          height:
            bannerHeight,
        },

        pressed
          ? styles.pressed
          : null,
      ]}
    >
      <Image
        source={
          item.image
        }
        style={
          styles.image
        }
        contentFit="cover"
        transition={150}
        cachePolicy="memory-disk"
      />
    </Pressable>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       BANNER
    ======================================================== */

    container: {
      overflow:
        "hidden",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.disabledBackground,
    },

    /* ========================================================
       IMAGE
    ======================================================== */

    image: {
      width: "100%",

      height: "100%",
    },

    /* ========================================================
       PRESS
    ======================================================== */

    pressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },
  });