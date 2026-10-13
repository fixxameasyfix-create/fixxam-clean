import React, { memo } from "react";
import {
  StyleSheet,
  View,
} from "react-native";

import MarketOrderCard from "@/components/customerorders/marketOrderCard";

import {
  AppText,
} from "@/components/ui";

import type {
  MarketOrder,
} from "@/components/customerorders/orders.types";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

type Props = {
  orders: MarketOrder[];
  onPress: (
    order: MarketOrder,
  ) => void;
};

function MarketOrdersSection({
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
            Market
          </AppText>

          <AppText
            variant="caption"
            style={styles.subtitle}
          >
            Your market orders
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
          <MarketOrderCard
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
  MarketOrdersSection,
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