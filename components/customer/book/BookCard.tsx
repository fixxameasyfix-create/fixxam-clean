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

import type {
  AppIconName,
} from "@/components/ui/AppIcon";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  title: string;

  description: string;

  /**
   * Existing icon value from BookGrid.
   * AppIcon supports the project's legacy
   * icon aliases.
   */
  icon: string;

  iconColor: string;

  iconBackground: string;

  onPress: () => void;

  compact?: boolean;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/* ==============================================================
   COMPONENT
============================================================== */

function BookCard({
  title,
  description,
  icon,
  iconColor,
  iconBackground,
  onPress,
  compact = false,
}: Props) {
  const safeTitle =
    cleanString(title) ||
    "Booking option";

  const safeDescription =
    cleanString(description);

  const resolvedIcon =
    (cleanString(icon) ||
      "service") as AppIconName;

  const resolvedIconColor =
    cleanString(iconColor) ||
    CustomerColors.primary;

  const resolvedIconBackground =
    cleanString(iconBackground) ||
    CustomerColors.primarySoft;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        safeTitle
      }
      accessibilityHint={
        safeDescription ||
        undefined
      }
      onPress={onPress}
      style={({
        pressed,
      }) => [
        styles.card,

        compact
          ? styles.compactCard
          : null,

        pressed
          ? styles.pressed
          : null,
      ]}
    >
      {/* ======================================================
          ICON
      ====================================================== */}

      <View
        style={[
          styles.iconBox,

          compact
            ? styles.compactIconBox
            : null,

          {
            backgroundColor:
              resolvedIconBackground,
          },
        ]}
      >
        <AppIcon
          name={
            resolvedIcon
          }
          role="customer"
          size={
            compact
              ? "sm"
              : "lg"
          }
          color={
            resolvedIconColor
          }
        />
      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <View
        style={[
          styles.content,

          compact
            ? styles.compactContent
            : null,
        ]}
      >
        <AppText
          variant={
            compact
              ? "bodyMedium"
              : "bodyLarge"
          }
          weight="bold"
          numberOfLines={
            compact
              ? 1
              : 2
          }
          ellipsizeMode="tail"
          style={styles.title}
        >
          {safeTitle}
        </AppText>

        {!compact &&
        safeDescription ? (
          <AppText
            variant="body"
            tone="secondary"
            numberOfLines={3}
            ellipsizeMode="tail"
            style={
              styles.description
            }
          >
            {safeDescription}
          </AppText>
        ) : null}
      </View>

      {/* ======================================================
          NEXT
      ====================================================== */}

      <View
        style={[
          styles.arrowBox,

          compact
            ? styles.compactArrowBox
            : null,
        ]}
      >
        <AppIcon
          name="next"
          role="customer"
          size="xs"
          color={
            compact
              ? Colors.textSecondary
              : CustomerColors.primary
          }
        />
      </View>
    </Pressable>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       CARD
    ======================================================== */

    card: {
      width: "100%",

      minHeight: 220,

      position: "relative",

      padding:
        FixxamTokens.spacing.lg,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      overflow: "hidden",

      ...FixxamTokens.shadow.card,
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

    /* ========================================================
       ICON
    ======================================================== */

    iconBox: {
      width: 72,

      height: 72,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.lg,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      flex: 1,

      minWidth: 0,

      marginTop:
        FixxamTokens.spacing.lg,

      paddingRight:
        FixxamTokens.spacing.xl,

      paddingBottom:
        FixxamTokens.spacing.xl,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    description: {
      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 21,
    },

    /* ========================================================
       ARROW
    ======================================================== */

    arrowBox: {
      position: "absolute",

      right:
        FixxamTokens.spacing.md,

      bottom:
        FixxamTokens.spacing.md,

      width: 36,

      height: 36,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    /* ========================================================
       COMPACT CARD
    ======================================================== */

    compactCard: {
      minHeight: 72,

      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,
    },

    compactIconBox: {
      width: 44,

      height: 44,

      borderRadius:
        FixxamTokens.radius.md,
    },

    compactContent: {
      flex: 1,

      minWidth: 0,

      marginTop: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      paddingRight: 44,

      paddingBottom: 0,
    },

    compactArrowBox: {
      right:
        FixxamTokens.spacing.sm,

      bottom: undefined,

      top: "50%",

      marginTop: -16,

      width: 32,

      height: 32,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },
  });

export default memo(
  BookCard,
);