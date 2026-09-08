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

type Props = {
  orderId: string;

  serviceName: string;

  customerName: string;
};

function MakeOfferOrderCard({
  orderId,
  serviceName,
  customerName,
}: Props) {
  return (
    <View
      style={
        styles.orderCard
      }
    >
      <View
        style={
          styles.serviceIcon
        }
      >
        <AppIcon
          name="professional"
          role="worker"
          size="md"
          color={
            WorkerColors.primary
          }
        />
      </View>

      <View
        style={
          styles.orderInfo
        }
      >
        <AppText
          variant="caption"
          tone="secondary"
          style={
            styles.orderLabel
          }
        >
          SERVICE
        </AppText>

        <AppText
          variant="bodyMedium"
          weight="bold"
          numberOfLines={1}
          style={
            styles.serviceName
          }
        >
          {serviceName}
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={1}
          style={
            styles.customerText
          }
        >
          Customer:{" "}
          {customerName}
        </AppText>
      </View>

      <View
        style={
          styles.orderBadge
        }
      >
        <AppText
          variant="caption"
          weight="bold"
          numberOfLines={1}
          style={
            styles.orderBadgeText
          }
        >
          #{orderId}
        </AppText>
      </View>
    </View>
  );
}

export default memo(
  MakeOfferOrderCard,
);

const styles =
  StyleSheet.create({
    orderCard: {
      width: "100%",

      minHeight: 78,

      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    serviceIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    orderInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    orderLabel: {
      letterSpacing: 0.8,

      color:
        Colors.textMuted,
    },

    serviceName: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textPrimary,
    },

    customerText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    orderBadge: {
      maxWidth: 100,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.sm,

      backgroundColor:
        Colors.disabledBackground,
    },

    orderBadgeText: {
      color:
        Colors.textSecondary,
    },
  });