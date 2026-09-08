import React, {
  memo,
} from "react";

import {
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

/* ============================================================
   TYPES
============================================================ */

type Props = {
  message?: string | null;
};

/* ============================================================
   COMPONENT
============================================================ */

function WorkerOfferMessage({
  message,
}: Props) {
  const safeMessage =
    typeof message === "string"
      ? message.trim()
      : "";

  if (!safeMessage) {
    return null;
  }

  return (
    <View
      style={styles.container}
    >
      <View
        style={styles.iconContainer}
      >
        <AppIcon
          name="messages"
          size="xs"
          color={
            Colors.textSecondary
          }
        />
      </View>

      <AppText
        variant="caption"
        tone="secondary"
        style={styles.message}
      >
        “{safeMessage}”
      </AppText>
    </View>
  );
}

export default memo(
  WorkerOfferMessage,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems:
        "flex-start",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.background,
    },

    iconContainer: {
      width: 28,

      height: 28,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    message: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      lineHeight: 17,
    },
  });