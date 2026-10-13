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
    useMemo(
      () =>
        typeof note ===
        "string"
          ? note.trim()
          : "",
      [
        note,
      ],
    );

  if (
    !normalizedNote
  ) {
    return null;
  }

  return (
    <View
      accessible
      accessibilityLabel={`Customer note. ${normalizedNote}`}
      style={
        styles.card
      }
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={
          styles.header
        }
      >
        <View
          style={
            styles.icon
          }
        >
          <AppIcon
            name="messages"
            size="xs"
            color={
              WorkerColors.primary
            }
          />
        </View>

        <AppText
          variant="bodyLarge"
          weight="bold"
          numberOfLines={1}
          style={
            styles.title
          }
        >
          Customer note
        </AppText>
      </View>

      {/* ======================================================
          NOTE
      ====================================================== */}

      <AppText
        variant="body"
        style={
          styles.note
        }
      >
        {normalizedNote}
      </AppText>
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
      width:
        "100%",

      marginBottom:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    icon: {
      width:
        28,

      height:
        28,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    title: {
      flex:
        1,

      minWidth:
        0,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       NOTE
    ======================================================== */

    note: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight:
        19,

      color:
        Colors.textSecondary,
    },
  });