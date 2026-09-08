import React, {
  memo,
} from "react";

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

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  onPress: () => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function AutomaticBookingBanner({
  onPress,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Book Automatically"
      accessibilityHint="Let Fixxam find the right worker nearby"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,

        pressed
          ? styles.pressed
          : null,
      ]}
    >
      {/* ========================================================
          ICON
      ======================================================== */}

      <View
        style={
          styles.iconBox
        }
      >
        <AppIcon
          name="professional"
          role="customer"
          size="lg"
          state="active"
        />
      </View>

      {/* ========================================================
          CONTENT
      ======================================================== */}

      <View
        style={
          styles.content
        }
      >
        <AppText
          variant="bodyLarge"
          weight="bold"
          numberOfLines={1}
          style={
            styles.title
          }
        >
          Book Automatically
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          numberOfLines={2}
          style={
            styles.description
          }
        >
          Let Fixxam find the right worker nearby.
        </AppText>
      </View>

      {/* ========================================================
          ARROW
      ======================================================== */}

      <View
        style={
          styles.arrow
        }
      >
        <AppIcon
          name="next"
          role="customer"
          size="sm"
          state="active"
        />
      </View>
    </Pressable>
  );
}

export default memo(
  AutomaticBookingBanner,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    card: {
      width: "100%",

      minHeight: 104,

      marginBottom:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    pressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },

    iconBox: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      flexShrink: 0,

      marginRight:
        FixxamTokens.spacing.md,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    content: {
      flex: 1,

      minWidth: 0,

      paddingRight:
        FixxamTokens.spacing.sm,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    description: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 19,

      color:
        Colors.textSecondary,
    },

    arrow: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },
  });