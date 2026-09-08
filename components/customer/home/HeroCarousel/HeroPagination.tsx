import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  total: number;

  activeIndex: number;
};

type DotProps = {
  active: boolean;
};

/* ============================================================
   CONSTANTS
============================================================ */

const DOT_SIZE = 8;

const ACTIVE_DOT_WIDTH = 24;

const INACTIVE_OPACITY = 0.35;

const INACTIVE_SCALE = 0.9;

const SPRING_CONFIG = {
  damping: 18,
  stiffness: 220,
  mass: 0.7,
};

/* ============================================================
   DOT
============================================================ */

const Dot = memo(
  function Dot({
    active,
  }: DotProps) {
    const animatedStyle =
      useAnimatedStyle(
        () => ({
          width: withSpring(
            active
              ? ACTIVE_DOT_WIDTH
              : DOT_SIZE,
            SPRING_CONFIG,
          ),

          opacity:
            withSpring(
              active
                ? 1
                : INACTIVE_OPACITY,
              SPRING_CONFIG,
            ),

          transform: [
            {
              scale:
                withSpring(
                  active
                    ? 1
                    : INACTIVE_SCALE,
                  SPRING_CONFIG,
                ),
            },
          ],
        }),
        [active],
      );

    return (
      <Animated.View
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={[
          styles.dot,

          active
            ? styles.activeDot
            : null,

          animatedStyle,
        ]}
      />
    );
  },
);

/* ============================================================
   COMPONENT
============================================================ */

function HeroPagination({
  total,
  activeIndex,
}: Props) {
  const safeTotal =
    Math.max(
      0,
      Math.floor(total),
    );

  /*
   * No pagination is needed
   * for zero or one banner.
   */
  if (
    safeTotal <= 1
  ) {
    return null;
  }

  const safeActiveIndex =
    Math.min(
      Math.max(
        0,
        activeIndex,
      ),
      safeTotal - 1,
    );

  return (
    <View
      style={styles.container}
      accessibilityRole="adjustable"
      accessibilityLabel={`Banner ${
        safeActiveIndex + 1
      } of ${safeTotal}`}
    >
      {Array.from({
        length:
          safeTotal,
      }).map(
        (_, index) => (
          <Dot
            key={index}
            active={
              index ===
              safeActiveIndex
            }
          />
        ),
      )}
    </View>
  );
}

export default memo(
  HeroPagination,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CONTAINER
    ======================================================== */

    container: {
      marginTop:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      justifyContent:
        "center",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       DOT
    ======================================================== */

    dot: {
      width:
        DOT_SIZE,

      height:
        DOT_SIZE,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabled,
    },

    activeDot: {
      backgroundColor:
        CustomerColors.primary,
    },
  });