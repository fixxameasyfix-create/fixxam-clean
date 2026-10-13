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
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  disabled?: boolean;

  onBack: () => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function MakeOfferHeader({
  disabled = false,
  onBack,
}: Props) {
  return (
    <View
      style={
        styles.container
      }
    >
      {/* ========================================================
          BACK
      ======================================================== */}

      <Pressable
        onPress={
          onBack
        }
        disabled={
          disabled
        }
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        accessibilityHint="Return to the order"
        accessibilityState={{
          disabled,
        }}
        style={({
          pressed,
        }) => [
          styles.backButton,

          pressed &&
          !disabled
            ? styles.pressed
            : null,

          disabled
            ? styles.disabled
            : null,
        ]}
      >
        <AppIcon
          name="back"
          size="xs"
          color={
            Colors.textPrimary
          }
        />
      </Pressable>

      {/* ========================================================
          TITLE
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
          Make Offer
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={1}
          style={
            styles.subtitle
          }
        >
          Set your price for this job
        </AppText>
      </View>
    </View>
  );
}

/* ==============================================================
   MEMO
============================================================== */

MakeOfferHeader.displayName =
  "MakeOfferHeader";

export default memo(
  MakeOfferHeader,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ==========================================================
       CONTAINER
    ========================================================== */

    container: {
      width:
        "100%",

      minHeight:
        60,

      paddingVertical:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    /* ==========================================================
       BACK
    ========================================================== */

    backButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    /* ==========================================================
       CONTENT
    ========================================================== */

    content: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        1,

      lineHeight:
        16,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       STATES
    ========================================================== */

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

    disabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },
  });