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
  FixxamTokens,
} from "@/theme";

import type {
  BookingStatus,
} from "@/types/booking";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  orderId: string;

  status: BookingStatus;

  onBack: () => void;
};

type StatusConfig = {
  label: string;

  backgroundColor: string;

  dotColor: string;

  textColor: string;
};

/* ==============================================================
   STATUS CONFIG
============================================================== */

function getStatusConfig(
  status: BookingStatus,
): StatusConfig {
  switch (status) {
    case "accepted":
      return {
        label: "ACCEPTED",
        backgroundColor:
          Colors.infoSoft,
        dotColor:
          Colors.info,
        textColor:
          Colors.info,
      };

    case "in-progress":
      return {
        label: "IN PROGRESS",
        backgroundColor:
          Colors.infoSoft,
        dotColor:
          Colors.info,
        textColor:
          Colors.info,
      };

    case "completed":
      return {
        label: "COMPLETED",
        backgroundColor:
          Colors.successSoft,
        dotColor:
          Colors.success,
        textColor:
          Colors.success,
      };

    case "cancelled":
      return {
        label: "CANCELLED",
        backgroundColor:
          Colors.errorSoft,
        dotColor:
          Colors.error,
        textColor:
          Colors.error,
      };

    case "expired":
      return {
        label: "EXPIRED",
        backgroundColor:
          Colors.disabledBackground,
        dotColor:
          Colors.textSecondary,
        textColor:
          Colors.textSecondary,
      };

    case "pending":
    default:
      return {
        label: "PENDING",
        backgroundColor:
          Colors.warningSoft,
        dotColor:
          Colors.warning,
        textColor:
          Colors.warning,
      };
  }
}

/* ==============================================================
   STATUS BADGE
============================================================== */

const StatusBadge = memo(
  function StatusBadge({
    status,
  }: {
    status: BookingStatus;
  }) {
    const config =
      getStatusConfig(status);

    return (
      <View
        accessible
        accessibilityLabel={`Order status ${config.label}`}
        style={[
          styles.statusBadge,
          {
            backgroundColor:
              config.backgroundColor,
          },
        ]}
      >
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor:
                config.dotColor,
            },
          ]}
        />

        <AppText
          variant="caption"
          weight="bold"
          numberOfLines={1}
          style={[
            styles.statusBadgeText,
            {
              color:
                config.textColor,
            },
          ]}
        >
          {config.label}
        </AppText>
      </View>
    );
  },
);

StatusBadge.displayName =
  "StatusBadge";

/* ==============================================================
   COMPONENT
============================================================== */

const WorkerOrderHeader = memo(
  function WorkerOrderHeader({
    orderId,
    status,
    onBack,
  }: Props) {
    const safeOrderId =
      typeof orderId === "string"
        ? orderId.trim()
        : "";

    return (
      <View
        style={
          styles.header
        }
      >
        {/* ====================================================
            BACK
        ==================================================== */}

        <Pressable
          onPress={
            onBack
          }
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          style={({
            pressed,
          }) => [
            styles.backButton,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppIcon
            name="back"
            size="xs"
            color={
              Colors.textPrimary
            }
          />
        </Pressable>

        {/* ====================================================
            TITLE
        ==================================================== */}

        <View
          style={
            styles.headerText
          }
        >
          <AppText
            variant="bodyLarge"
            weight="bold"
            numberOfLines={1}
            style={
              styles.headerTitle
            }
          >
            Order Details
          </AppText>

          {safeOrderId ? (
            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={
                styles.headerSubtitle
              }
            >
              #{safeOrderId}
            </AppText>
          ) : null}
        </View>

        {/* ====================================================
            STATUS
        ==================================================== */}

        <StatusBadge
          status={
            status
          }
        />
      </View>
    );
  },
);

WorkerOrderHeader.displayName =
  "WorkerOrderHeader";

export default WorkerOrderHeader;

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      width:
        "100%",

      minHeight:
        64,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,

      backgroundColor:
        Colors.background,
    },

    /* ========================================================
       BACK
    ======================================================== */

    backButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

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
       TITLE
    ======================================================== */

    headerText: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,

      marginRight:
        FixxamTokens.spacing.xs,
    },

    headerTitle: {
      color:
        Colors.textPrimary,
    },

    headerSubtitle: {
      marginTop:
        1,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       STATUS
    ======================================================== */

    statusBadge: {
      flexShrink:
        0,

      minHeight:
        26,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.chip,
    },

    statusDot: {
      width:
        6,

      height:
        6,

      borderRadius:
        FixxamTokens.radius.full,
    },

    statusBadgeText: {
      fontSize:
        10,

      letterSpacing:
        0.25,
    },

    /* ========================================================
       PRESS
    ======================================================== */

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