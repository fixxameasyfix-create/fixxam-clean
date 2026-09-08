import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import {
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
  title?: string;

  children: React.ReactNode;

  style?: StyleProp<ViewStyle>;
};

/* ============================================================
   COMPONENT
============================================================ */

function ProfileSection({
  title,
  children,
  style,
}: Props) {
  const safeTitle =
    typeof title === "string"
      ? title.trim()
      : "";

  return (
    <View
      style={[
        styles.container,
        style,
      ]}
    >
      {/* ======================================================
          TITLE
      ====================================================== */}

      {safeTitle ? (
        <AppText
          variant="bodyMedium"
          weight="bold"
          numberOfLines={1}
          style={
            styles.title
          }
        >
          {safeTitle}
        </AppText>
      ) : null}

      {/* ======================================================
          SECTION CARD
      ====================================================== */}

      <View
        style={styles.card}
      >
        {children}
      </View>
    </View>
  );
}

export default memo(
  ProfileSection,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CONTAINER
    ======================================================== */

    container: {
      marginHorizontal:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.lg,
    },

    /* ========================================================
       TITLE
    ======================================================== */

    title: {
      marginBottom:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      overflow: "hidden",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },
  });