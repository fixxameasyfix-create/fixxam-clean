import React from "react";

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
  CustomerColors,
  FixxamTokens,
  WorkerColors,
  type FixxamRole,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  role: FixxamRole;

  verified?: boolean;
};

/* ============================================================
   COMPONENT
============================================================ */

export default function ProfileBadge({
  role,
  verified = true,
}: Props) {
  const isWorker =
    role === "worker";

  const roleColors =
    isWorker
      ? WorkerColors
      : CustomerColors;

  const accountLabel =
    isWorker
      ? "Worker Account"
      : "Customer Account";

  /* ==========================================================
     PENDING VERIFICATION
  ========================================================== */

  if (!verified) {
    return (
      <View
        style={[
          styles.container,
          styles.pendingContainer,
        ]}
        accessibilityRole="text"
        accessibilityLabel="Verification pending"
      >
        <AppIcon
          name="warning"
          size="xs"
          state="warning"
          color={
            Colors.warning
          }
        />

        <AppText
          variant="caption"
          weight="bold"
          style={
            styles.pendingText
          }
        >
          Verification Pending
        </AppText>
      </View>
    );
  }

  /* ==========================================================
     VERIFIED ACCOUNT
  ========================================================== */

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            roleColors.primarySoft,
        },
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Verified ${accountLabel}`}
    >
      <View
        style={
          styles.verifiedIcon
        }
      >
        <AppIcon
          name="verified"
          size="xs"
          state="success"
          color={
            Colors.success
          }
        />
      </View>

      <AppText
        variant="caption"
        weight="bold"
        style={[
          styles.text,
          {
            color:
              roleColors.primary,
          },
        ]}
      >
        {accountLabel}
      </AppText>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       BADGE
    ======================================================== */

    container: {
      alignSelf:
        "flex-start",

      minHeight: 24,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xxs,

      flexDirection: "row",

      alignItems: "center",

      borderRadius:
        FixxamTokens.radius.chip,
    },

    /* ========================================================
       VERIFIED
    ======================================================== */

    verifiedIcon: {
      marginRight:
        FixxamTokens.spacing.xxs,
    },

    text: {
      lineHeight: 14,
    },

    /* ========================================================
       PENDING
    ======================================================== */

    pendingContainer: {
      backgroundColor:
        Colors.warningSoft,
    },

    pendingText: {
      marginLeft:
        FixxamTokens.spacing.xxs,

      lineHeight: 14,

      color:
        Colors.warning,
    },
  });