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
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  orderId: string;

  deleting: boolean;

  onBack: () => void;

  onOpenMenu: () => void;
};

/* ============================================================
   HELPERS
============================================================ */

function shortOrderId(
  value: string,
): string {
  const cleanValue =
    value.trim();

  if (
    cleanValue.length <=
    10
  ) {
    return cleanValue;
  }

  return `${cleanValue.slice(
    0,
    5,
  )}...${cleanValue.slice(
    -4,
  )}`;
}

/* ============================================================
   COMPONENT
============================================================ */

function WorkerMarketChatHeader({
  orderId,
  deleting,
  onBack,
  onOpenMenu,
}: Props) {
  const displayOrderId =
    shortOrderId(
      orderId,
    );

  return (
    <View
      style={
        styles.header
      }
    >
      {/* ======================================================
          BACK
      ====================================================== */}

      <Pressable
        onPress={
          onBack
        }
        disabled={
          deleting
        }
        accessibilityRole="button"
        accessibilityLabel="Go back"
        accessibilityState={{
          disabled:
            deleting,
        }}
        style={({
          pressed,
        }) => [
          styles.headerButton,

          pressed &&
          !deleting
            ? styles.headerPressed
            : null,

          deleting
            ? styles.disabled
            : null,
        ]}
      >
        <AppIcon
          name="back"
          size="md"
          color={
            Colors.textPrimary
          }
        />
      </Pressable>

      {/* ======================================================
          TITLE
      ====================================================== */}

      <View
        style={
          styles.headerInfo
        }
      >
        <AppText
          variant="bodyMedium"
          weight="bold"
          numberOfLines={1}
          style={
            styles.headerTitle
          }
        >
          Customer Chat
        </AppText>

        <View
          style={
            styles.metaRow
          }
        >
          <View
            style={
              styles.metaDot
            }
          />

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            style={
              styles.metaText
            }
          >
            Order #
            {displayOrderId}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          CUSTOMER ICON
      ====================================================== */}

      <View
        style={
          styles.customerIcon
        }
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        <AppIcon
          name="profile"
          role="worker"
          size="sm"
          color={
            WorkerColors.primary
          }
        />
      </View>

      {/* ======================================================
          MENU
      ====================================================== */}

      <Pressable
        onPress={
          onOpenMenu
        }
        disabled={
          deleting
        }
        accessibilityRole="button"
        accessibilityLabel="Open chat options"
        accessibilityState={{
          disabled:
            deleting,
        }}
        style={({
          pressed,
        }) => [
          styles.menuButton,

          pressed &&
          !deleting
            ? styles.headerPressed
            : null,

          deleting
            ? styles.disabled
            : null,
        ]}
      >
        <AppIcon
          name="more"
          size="md"
          color={
            Colors.textPrimary
          }
        />
      </Pressable>
    </View>
  );
}

export default memo(
  WorkerMarketChatHeader,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    header: {
      minHeight:
        FixxamTokens.size.headerHeight,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
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
        Colors.surface,
    },

    /* ========================================================
       BACK
    ======================================================== */

    headerButton: {
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
        Colors.disabledBackground,
    },

    /* ========================================================
       INFO
    ======================================================== */

    headerInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    headerTitle: {
      color:
        Colors.textPrimary,
    },

    metaRow: {
      marginTop:
        FixxamTokens.spacing.xxs,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    metaDot: {
      width: 6,

      height: 6,

      flexShrink: 0,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primary,
    },

    metaText: {
      flexShrink: 1,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       CUSTOMER
    ======================================================== */

    customerIcon: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      marginRight:
        FixxamTokens.spacing.xs,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    /* ========================================================
       MENU
    ======================================================== */

    menuButton: {
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
        Colors.background,
    },

    /* ========================================================
       INTERACTION
    ======================================================== */

    headerPressed: {
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

    disabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },
  });