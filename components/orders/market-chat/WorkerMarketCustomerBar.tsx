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
  customerName: string;

  customerPhone: string;

  onOpenItems: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

function WorkerMarketCustomerBar({
  customerName,
  customerPhone,
  onOpenItems,
}: Props) {
  const displayName =
    customerName.trim() ||
    "Customer";

  const displayPhone =
    customerPhone.trim() ||
    "Phone unavailable";

  return (
    <View
      style={
        styles.customerBar
      }
    >
      {/* ======================================================
          CUSTOMER
      ====================================================== */}

      <View
        style={
          styles.customerAvatar
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

      <View
        style={
          styles.customerInfo
        }
      >
        <AppText
          variant="bodyMedium"
          weight="bold"
          numberOfLines={1}
          style={
            styles.customerName
          }
        >
          {displayName}
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={1}
          style={
            styles.customerPhone
          }
        >
          {displayPhone}
        </AppText>
      </View>

      {/* ======================================================
          ITEMS
      ====================================================== */}

      <Pressable
        onPress={
          onOpenItems
        }
        accessibilityRole="button"
        accessibilityLabel="View order items"
        style={({
          pressed,
        }) => [
          styles.itemsButton,

          pressed
            ? styles.pressed
            : null,
        ]}
      >
        <AppIcon
          name="cart"
          role="worker"
          size="xs"
          color={
            WorkerColors.primary
          }
        />

        <AppText
          variant="caption"
          weight="bold"
          style={
            styles.itemsButtonText
          }
        >
          ITEMS
        </AppText>
      </Pressable>
    </View>
  );
}

export default memo(
  WorkerMarketCustomerBar,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    customerBar: {
      minHeight: 66,

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
        Colors.surface,
    },

    /* ========================================================
       CUSTOMER
    ======================================================== */

    customerAvatar: {
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
        WorkerColors.primarySoft,
    },

    customerInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    customerName: {
      color:
        Colors.textPrimary,
    },

    customerPhone: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       ITEMS
    ======================================================== */

    itemsButton: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexShrink: 0,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    itemsButtonText: {
      color:
        WorkerColors.primary,
    },

    /* ========================================================
       INTERACTION
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