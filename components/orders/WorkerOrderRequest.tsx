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

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  description: string;
};

/* ==============================================================
   COMPONENT
============================================================== */

const WorkerOrderRequest = memo(
  function WorkerOrderRequest({
    description,
  }: Props) {
    const safeDescription =
      useMemo(
        () =>
          typeof description === "string"
            ? description.trim()
            : "",
        [description],
      );

    return (
      <View
        style={styles.requestCard}
        accessible
        accessibilityLabel={`Service request. ${
          safeDescription ||
          "No description provided."
        }`}
      >
        <View
          style={styles.requestIcon}
        >
          <AppIcon
            name="messages"
            role="worker"
            size="sm"
            color={
              WorkerColors.primary
            }
          />
        </View>

        <AppText
          variant="body"
          style={styles.description}
        >
          {safeDescription ||
            "No description provided."}
        </AppText>
      </View>
    );
  },
);

WorkerOrderRequest.displayName =
  "WorkerOrderRequest";

export default WorkerOrderRequest;

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    requestCard: {
      padding:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems:
        "flex-start",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    requestIcon: {
      width: 44,

      height: 44,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    description: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      lineHeight: 19,

      color:
        Colors.textPrimary,
    },
  });