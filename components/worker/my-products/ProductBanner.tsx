import React, {
  memo,
} from "react";

import {
  Pressable,
  StyleSheet,
} from "react-native";

import {
  Image,
} from "expo-image";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type ProductBannerProps = {
  onPress?: () => void;

  accessibilityLabel?: string;
};

/* ============================================================
   COMPONENT
============================================================ */

function ProductBanner({
  onPress,
  accessibilityLabel,
}: ProductBannerProps) {
  const interactive =
    typeof onPress ===
    "function";

  return (
    <Pressable
      onPress={
        onPress
      }
      disabled={
        !interactive
      }
      accessibilityRole={
        interactive
          ? "button"
          : undefined
      }
      accessibilityLabel={
        interactive
          ? accessibilityLabel ??
            "Open promotion"
          : undefined
      }
      style={({
        pressed,
      }) => [
        styles.container,

        pressed &&
        interactive
          ? styles.pressed
          : null,
      ]}
    >
      <Image
        source={require("@/assets/images/banners/market-banner.png")}
        contentFit="cover"
        transition={150}
        style={
          styles.banner
        }
      />
    </Pressable>
  );
}

/* ============================================================
   MEMO
============================================================ */

const MemoizedProductBanner =
  memo(
    ProductBanner,
  );

MemoizedProductBanner.displayName =
  "ProductBanner";

export default MemoizedProductBanner;

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.xs,

      overflow:
        "hidden",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    banner: {
      width: "100%",

      height: 170,

      borderRadius:
        FixxamTokens.radius.xl,
    },

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