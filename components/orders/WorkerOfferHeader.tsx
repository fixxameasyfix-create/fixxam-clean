import React, {
  memo,
  useMemo,
} from "react";

import {
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
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type LegacyOfferIcon =
  | "cash-outline"
  | "swap-horizontal-outline";

type Props = {
  title: string;

  subtitle: string;

  icon?:
    | AppIconName
    | LegacyOfferIcon;
};

/* ============================================================
   HELPERS
============================================================ */

function resolveOfferIcon(
  icon:
    | AppIconName
    | LegacyOfferIcon,
): AppIconName {
  switch (icon) {
    case "cash-outline":
      return "payment";

    case "swap-horizontal-outline":
      return "refresh";

    default:
      return icon;
  }
}

/* ============================================================
   COMPONENT
============================================================ */

function WorkerOfferHeader({
  title,
  subtitle,
  icon = "payment",
}: Props) {
  const resolvedIcon =
    useMemo(
      () =>
        resolveOfferIcon(
          icon,
        ),
      [icon],
    );

  return (
    <View
      style={styles.container}
    >
      {/* ICON */}

      <View
        style={styles.icon}
      >
        <AppIcon
          name={resolvedIcon}
          role="worker"
          size="md"
          color={
            WorkerColors.primary
          }
        />
      </View>

      {/* CONTENT */}

      <View
        style={styles.content}
      >
        <AppText
          variant="bodyLarge"
          weight="bold"
          numberOfLines={2}
          style={styles.title}
        >
          {title}
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          style={
            styles.subtitle
          }
        >
          {subtitle}
        </AppText>
      </View>
    </View>
  );
}

export default memo(
  WorkerOfferHeader,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      flexDirection: "row",

      alignItems: "center",
    },

    icon: {
      width:
        FixxamTokens.size
          .iconBox,

      height:
        FixxamTokens.size
          .iconBox,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    content: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 16,
    },
  });