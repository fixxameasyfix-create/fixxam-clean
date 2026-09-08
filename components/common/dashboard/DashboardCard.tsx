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
   * Official Fixxam icon name
   * or supported legacy alias.
   */
  icon:
    | AppIconName
    | (string & {});

  iconColor: string;

  iconBackground: string;

  onPress: () => void;

  badge?: string;
};

/* ==============================================================
   COMPONENT
============================================================== */

function DashboardCard({
  title,
  description,
  icon,
  iconColor,
  iconBackground,
  onPress,
  badge,
}: Props) {
  const safeBadge =
    typeof badge === "string"
      ? badge.trim()
      : "";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={
        description || undefined
      }
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,

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
          styles.iconContainer,

          {
            backgroundColor:
              iconBackground,
          },
        ]}
      >
        <AppIcon
          name={
            icon as AppIconName
          }
          role="customer"
          size="lg"
          color={iconColor}
        />
      </View>

      {/* ======================================================
          BADGE
      ====================================================== */}

      {safeBadge ? (
        <View
          style={styles.badge}
        >
          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.badgeText
            }
          >
            {safeBadge}
          </AppText>
        </View>
      ) : null}

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <AppText
        variant="bodyLarge"
        weight="bold"
        numberOfLines={2}
        ellipsizeMode="tail"
        style={styles.title}
      >
        {title}
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        numberOfLines={3}
        ellipsizeMode="tail"
        style={
          styles.description
        }
      >
        {description}
      </AppText>

      {/* ======================================================
          NEXT
      ====================================================== */}

      <View
        style={styles.arrow}
      >
        <AppIcon
          name="next"
          role="customer"
          size="sm"
          color={
            CustomerColors.primary
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
    card: {
      flex: 1,

      minHeight: 190,

      position: "relative",

      padding:
        FixxamTokens.spacing.lg,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

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

    iconContainer: {
      width: 62,

      height: 62,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.lg,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    title: {
      marginTop:
        FixxamTokens.spacing.lg,

      paddingRight:
        FixxamTokens.spacing.lg,

      color:
        Colors.textPrimary,
    },

    description: {
      marginTop:
        FixxamTokens.spacing.sm,

      paddingRight:
        FixxamTokens.spacing.xl,

      paddingBottom:
        FixxamTokens.spacing.xl,

      lineHeight: 22,
    },

    /* ========================================================
       ARROW
    ======================================================== */

    arrow: {
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
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    /* ========================================================
       BADGE
    ======================================================== */

    badge: {
      position: "absolute",

      top:
        FixxamTokens.spacing.md,

      left: 60,

      minHeight: 24,

      alignItems: "center",

      justifyContent: "center",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        Colors.error,
    },

    badgeText: {
      color:
        Colors.textInverse,
    },
  });

export default memo(
  DashboardCard,
);