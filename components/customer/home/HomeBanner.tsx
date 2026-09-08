import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

interface HomeBannerProps {
  onBookNow?: () => void;
}

/* ============================================================
   COMPONENT
============================================================ */

export default function HomeBanner({
  onBookNow,
}: HomeBannerProps) {
  return (
    <View
      style={styles.container}
    >
      {/* ======================================================
          CONTENT
      ====================================================== */}

      <View
        style={styles.left}
      >
        <AppText
          variant="heading2"
          weight="bold"
          style={styles.title}
        >
          Need a Professional?
        </AppText>

        <AppText
          variant="body"
          style={styles.subtitle}
        >
          anytime, anywhere.
        </AppText>

        {/* ====================================================
            BOOK NOW

            No route existed in the original
            component. Parent can provide
            onBookNow when the real destination
            is confirmed.
        ==================================================== */}

        <Pressable
          onPress={onBookNow}
          disabled={!onBookNow}
          accessibilityRole="button"
          accessibilityLabel="Book a professional"
          accessibilityState={{
            disabled: !onBookNow,
          }}
          style={({ pressed }) => [
            styles.button,

            pressed &&
            onBookNow
              ? styles.buttonPressed
              : null,
          ]}
        >
          <AppText
            variant="bodyMedium"
            weight="bold"
            style={
              styles.buttonText
            }
          >
            Book Now
          </AppText>

          <AppIcon
            name="next"
            role="customer"
            size="sm"
            color={
              CustomerColors.primary
            }
          />
        </Pressable>
      </View>

      {/* ======================================================
          PROFESSIONAL ICON
      ====================================================== */}

      <View
        style={styles.iconBox}
      >
        <AppIcon
          name="service"
          role="customer"
          size="xl"
          color={
            Colors.textInverse
          }
        />
      </View>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CONTAINER
    ======================================================== */

    container: {
      marginBottom:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingVertical:
        FixxamTokens.spacing.lg,

      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems: "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        CustomerColors.primary,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    left: {
      flex: 1,

      minWidth: 0,

      paddingRight:
        FixxamTokens.spacing.md,
    },

    title: {
      color:
        Colors.textInverse,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 20,

      color:
        CustomerColors.primarySoft,
    },

    /* ========================================================
       BUTTON
    ======================================================== */

    button: {
      alignSelf:
        "flex-start",

      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

      marginTop:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        Colors.surface,
    },

    buttonText: {
      color:
        CustomerColors.primary,
    },

    buttonPressed: {
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

    /* ========================================================
       ICON
    ======================================================== */

    iconBox: {
      width: 78,

      height: 78,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.overlayLight,
    },
  });