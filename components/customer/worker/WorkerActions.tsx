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
  onReview: () => void;

  onCall: () => void;

  onFavorite: () => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerActions({
  onReview,
  onCall,
  onFavorite,
}: Props) {
  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          REVIEWS
      ====================================================== */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="View worker reviews"
        onPress={
          onReview
        }
        style={({
          pressed,
        }) => [
          styles.actionButton,

          pressed
            ? styles.pressed
            : null,
        ]}
      >
        <AppIcon
          name="star"
          role="customer"
          size="sm"
          color={
            Colors.warning
          }
        />

        <AppText
          variant="caption"
          weight="bold"
          numberOfLines={1}
          style={
            styles.actionText
          }
        >
          Reviews
        </AppText>
      </Pressable>

      {/* ======================================================
          CALL
      ====================================================== */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Call worker"
        onPress={
          onCall
        }
        style={({
          pressed,
        }) => [
          styles.actionButton,
          styles.callButton,

          pressed
            ? styles.pressed
            : null,
        ]}
      >
        <AppIcon
          name="phone"
          role="customer"
          size="sm"
          color={
            Colors.textInverse
          }
        />

        <AppText
          variant="caption"
          weight="bold"
          numberOfLines={1}
          style={
            styles.callText
          }
        >
          Call
        </AppText>
      </Pressable>

      {/* ======================================================
          SAVE
      ====================================================== */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Save worker"
        onPress={
          onFavorite
        }
        style={({
          pressed,
        }) => [
          styles.actionButton,

          pressed
            ? styles.pressed
            : null,
        ]}
      >
        <AppIcon
          name="heart"
          role="customer"
          size="sm"
          state="muted"
        />

        <AppText
          variant="caption"
          weight="bold"
          numberOfLines={1}
          style={
            styles.actionText
          }
        >
          Save
        </AppText>
      </Pressable>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      flexDirection:
        "row",

      gap:
        FixxamTokens.spacing.sm,

      marginHorizontal:
        FixxamTokens.spacing.lg,

      marginTop:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       ACTION
    ======================================================== */

    actionButton: {
      flex: 1,

      minWidth: 0,

      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        Colors.surface,
    },

    actionText: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       CALL
    ======================================================== */

    callButton: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primary,
    },

    callText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       PRESSED
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

export default memo(
  WorkerActions,
);