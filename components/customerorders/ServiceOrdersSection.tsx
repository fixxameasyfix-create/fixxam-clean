import React, { memo } from "react";
import {
  StyleSheet,
  View,
} from "react-native";

import OrderCard from "@/components/customerorders/orderCard";

import {
  AppText,
} from "@/components/ui";

import type {
  Order,
} from "@/components/customerorders/orders.types";

import {
  FixxamTokens,
  Colors,
} from "@/theme";

type Props = {
  orders: Order[];
  onPress: (order: Order) => void;
};

function ServiceOrdersSection({
  orders,
  onPress,
}: Props) {
  if (orders.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <AppText
            variant="heading3"
            weight="bold"
          >
            Service
          </AppText>

          <AppText
            variant="caption"
            style={styles.subtitle}
          >
            Your service requests
          </AppText>
        </View>

        <View style={styles.count}>
          <AppText
            variant="caption"
            weight="bold"
            style={styles.countText}
          >
            {orders.length}
          </AppText>
        </View>
      </View>

      <View style={styles.list}>
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onPress={() =>
              onPress(order)
            }
          />
        ))}
      </View>
    </View>
  );
}

export default memo(
  ServiceOrdersSection,
);

const styles = StyleSheet.create({
  container: {
    marginTop:
      FixxamTokens.spacing.lg,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom:
      FixxamTokens.spacing.sm,
  },

  subtitle: {
    marginTop: 2,
    color: Colors.textSecondary,
  },

  count: {
    minWidth: 34,
    height: 34,

    paddingHorizontal:
      FixxamTokens.spacing.sm,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 17,

    backgroundColor:
      Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  countText: {
    color: Colors.textSecondary,
  },

  list: {
    gap: FixxamTokens.spacing.sm,
  },
});