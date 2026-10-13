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
  onRate: () => void;

  onCall: () => void;

  onFavorite: () => void;

  rating?: boolean;

  saved?: boolean;

  saving?: boolean;
};

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerActions({
  onRate,
  onCall,
  onFavorite,
  rating = false,
  saved = false,
  saving = false,
}: Props) {
  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          RATE — 3 STARS
      ====================================================== */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Rate worker 3 stars"
        accessibilityState={{
          disabled: rating,
        }}
        disabled={
          rating
        }
        onPress={
          onRate
        }
        style={({
          pressed,
        }) => [
          styles.actionButton,

          rating
            ? styles.disabledButton
            : null,

          pressed &&
          !rating
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
          {rating
            ? "Rating..."
            : "Rate"}
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
          SAVE / UNSAVE
      ====================================================== */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          saved
            ? "Remove saved worker"
            : "Save worker"
        }
        accessibilityState={{
          disabled:
            saving,
          selected:
            saved,
        }}
        disabled={
          saving
        }
        onPress={
          onFavorite
        }
        style={({
          pressed,
        }) => [
          styles.actionButton,

          saved
            ? styles.savedButton
            : null,

          saving
            ? styles.disabledButton
            : null,

          pressed &&
          !saving
            ? styles.pressed
            : null,
        ]}
      >
        <AppIcon
          name="heart"
          role="customer"
          size="sm"
          color={
            saved
              ? CustomerColors.primary
              : Colors.textSecondary
          }
        />

        <AppText
          variant="caption"
          weight="bold"
          numberOfLines={1}
          style={[
            styles.actionText,

            saved
              ? styles.savedText
              : null,
          ]}
        >
          {saving
            ? "Saving..."
            : saved
              ? "Saved"
              : "Save"}
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

    disabledButton: {
      opacity: 0.6,
    },

    savedButton: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    savedText: {
      color:
        CustomerColors.primary,
    },

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