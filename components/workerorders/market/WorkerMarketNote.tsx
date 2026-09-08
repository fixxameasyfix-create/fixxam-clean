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
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  note?: string | null;
};

/* ============================================================
   COMPONENT
============================================================ */

function WorkerMarketNote({
  note,
}: Props) {
  const normalizedNote =
    typeof note === "string"
      ? note.trim()
      : "";

  if (!normalizedNote) {
    return null;
  }

  return (
    <View
      style={
        styles.card
      }
      accessibilityLabel={`Customer note: ${normalizedNote}`}
    >
      {/* ======================================================
          ICON
      ====================================================== */}

      <View
        style={
          styles.iconBox
        }
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

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <View
        style={
          styles.content
        }
      >
        <AppText
          variant="bodyMedium"
          weight="bold"
          style={
            styles.title
          }
        >
          Customer Note
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          style={
            styles.text
          }
        >
          {normalizedNote}
        </AppText>
      </View>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

WorkerMarketNote.displayName =
  "WorkerMarketNote";

export default memo(
  WorkerMarketNote,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    card: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        WorkerColors.primarySoft,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    iconBox: {
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
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    content: {
      flex: 1,

      minWidth: 0,
    },

    title: {
      color:
        WorkerColors.primary,
    },

    text: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },
  });