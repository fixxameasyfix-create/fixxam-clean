import React, { memo } from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

import {
  formatNaira,
  getSafeAmount,
} from "@/hooks/useCheckout";

import type {
  CheckoutCartItem,
} from "@/hooks/useCheckout";

type Props = {
  items: CheckoutCartItem[];
  totalQuantity: number;
};

function CheckoutOrderSummary({
  items,
  totalQuantity,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.summaryHeader}>
        <AppText
          variant="heading3"
          weight="bold"
          style={styles.sectionTitle}
        >
          Order Summary
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          style={styles.itemCount}
        >
          {totalQuantity}{" "}
          {totalQuantity === 1 ? "item" : "items"}
        </AppText>
      </View>

      {items.map(item => {
        const originalPrice = Number(item.price);
        const unitPrice = Number(item.unitPrice);
        const quantity = Number(item.quantity);

        const safeOriginalPrice =
          getSafeAmount(originalPrice);

        const safeUnitPrice =
          getSafeAmount(unitPrice);

        const safeQuantity =
          Number.isInteger(quantity) && quantity > 0
            ? quantity
            : 0;

        const hasItemDiscount =
          safeOriginalPrice > 0 &&
          safeUnitPrice < safeOriginalPrice;

        const originalTotal =
          safeOriginalPrice * safeQuantity;

        const finalTotal =
          safeUnitPrice * safeQuantity;

        const discountPercentage = Number(
          item.discountPercentage ?? 0,
        );

        return (
          <View
            key={item.id}
            style={styles.summaryRow}
          >
            <View style={styles.summaryProduct}>
              <AppText
                variant="body"
                numberOfLines={1}
                style={styles.summaryName}
              >
                {item.name}
              </AppText>

              <AppText
                variant="caption"
                style={styles.summaryQuantity}
              >
                Quantity: {safeQuantity}
              </AppText>

              {hasItemDiscount && (
                <View style={styles.itemPriceRow}>
                  <AppText
                    variant="caption"
                    style={styles.oldItemPrice}
                  >
                    {formatNaira(safeOriginalPrice)}
                  </AppText>

                  {Number.isFinite(discountPercentage) &&
                    discountPercentage > 0 && (
                      <View style={styles.discountBadge}>
                        <AppText
                          variant="caption"
                          weight="bold"
                          style={styles.discountBadgeText}
                        >
                          {Math.round(discountPercentage)}% OFF
                        </AppText>
                      </View>
                    )}
                </View>
              )}
            </View>

            <View style={styles.summaryPriceContainer}>
              {hasItemDiscount && (
                <AppText
                  variant="caption"
                  style={styles.oldTotalPrice}
                >
                  {formatNaira(originalTotal)}
                </AppText>
              )}

              <AppText
                variant="body"
                weight="bold"
                style={styles.summaryPrice}
              >
                {formatNaira(finalTotal)}
              </AppText>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default memo(CheckoutOrderSummary);

const styles = StyleSheet.create({
  card: {
    marginBottom: FixxamTokens.spacing.lg,
    padding: FixxamTokens.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: FixxamTokens.radius.xl,
    backgroundColor: Colors.surface,
    ...FixxamTokens.shadow.card,
  },

  sectionTitle: {
    marginBottom: FixxamTokens.spacing.md,
    color: Colors.textPrimary,
  },

  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: FixxamTokens.spacing.md,
  },

  itemCount: {
    marginBottom: FixxamTokens.spacing.md,
    flexShrink: 0,
    color: Colors.textSecondary,
  },

  summaryRow: {
    marginBottom: FixxamTokens.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: FixxamTokens.spacing.md,
  },

  summaryProduct: {
    flex: 1,
    minWidth: 0,
  },

  summaryName: {
    color: Colors.textPrimary,
  },

  summaryQuantity: {
    marginTop: FixxamTokens.spacing.xs,
    color: Colors.textMuted,
  },

  itemPriceRow: {
    marginTop: FixxamTokens.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: FixxamTokens.spacing.sm,
  },

  oldItemPrice: {
    color: Colors.textMuted,
    textDecorationLine: "line-through",
  },

  discountBadge: {
    paddingHorizontal: FixxamTokens.spacing.sm,
    paddingVertical: FixxamTokens.spacing.xxs,
    borderRadius: FixxamTokens.radius.chip,
    backgroundColor: Colors.successSoft,
  },

  discountBadgeText: {
    color: Colors.success,
  },

  summaryPriceContainer: {
    flexShrink: 0,
    alignItems: "flex-end",
  },

  oldTotalPrice: {
    marginBottom: FixxamTokens.spacing.xxs,
    color: Colors.textMuted,
    textDecorationLine: "line-through",
  },

  summaryPrice: {
    color: Colors.textPrimary,
  },
});