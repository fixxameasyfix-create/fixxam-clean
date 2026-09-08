import React, { memo } from "react";

import {
  ActivityIndicator,
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
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import { formatNaira } from "@/hooks/useCheckout";

type Props = {
  subtotal: number;
  discountTotal: number;
  total: number;
  hasDiscount: boolean;
  loading: boolean;
  cartReady: boolean;
  onPlaceOrder: () => void;
};

function CheckoutTotalCard({
  subtotal,
  discountTotal,
  total,
  hasDiscount,
  loading,
  cartReady,
  onPlaceOrder,
}: Props) {
  const disabled =
    loading || !cartReady;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <AppText
          variant="body"
          tone="secondary"
          style={styles.label}
        >
          Subtotal
        </AppText>

        <AppText
          variant="body"
          weight="bold"
          style={styles.value}
        >
          {formatNaira(subtotal)}
        </AppText>
      </View>

      {hasDiscount && (
        <View style={styles.row}>
          <AppText
            variant="body"
            style={styles.discount}
          >
            Discount
          </AppText>

          <AppText
            variant="body"
            weight="bold"
            style={styles.discount}
          >
            -{formatNaira(discountTotal)}
          </AppText>
        </View>
      )}

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <View style={styles.totalContent}>
          <AppText
            variant="bodyLarge"
            weight="bold"
            style={styles.totalLabel}
          >
            Total Amount
          </AppText>

          {hasDiscount && (
            <AppText
              variant="caption"
              style={styles.savedText}
            >
              You saved {formatNaira(discountTotal)}
            </AppText>
          )}
        </View>

        <AppText
          variant="heading2"
          weight="bold"
          style={styles.totalPrice}
        >
          {formatNaira(total)}
        </AppText>
      </View>

      <Pressable
        disabled={disabled}
        onPress={onPlaceOrder}
        accessibilityRole="button"
        accessibilityLabel="Place order"
        accessibilityState={{
          disabled,
          busy: loading,
        }}
        style={({ pressed }) => [
          styles.placeButton,
          disabled && styles.placeButtonDisabled,
          pressed && !disabled && styles.pressed,
        ]}
      >
        {loading && (
          <ActivityIndicator
            color={Colors.textInverse}
            size="small"
          />
        )}

        <AppText
          variant="bodyLarge"
          weight="bold"
          style={[
            styles.placeText,
            !cartReady && styles.placeTextDisabled,
          ]}
        >
          {loading
            ? "Placing Order..."
            : "Place Order"}
        </AppText>

        {!loading && (
          <AppIcon
            name="next"
            size="sm"
            color={
              cartReady
                ? Colors.textInverse
                : Colors.textMuted
            }
          />
        )}
      </Pressable>
    </View>
  );
}

export default memo(CheckoutTotalCard);

const styles = StyleSheet.create({
  card: {
    padding: FixxamTokens.spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: FixxamTokens.radius.xl,
    backgroundColor: Colors.surface,
    ...FixxamTokens.shadow.card,
  },

  row: {
    marginBottom: FixxamTokens.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: FixxamTokens.spacing.md,
  },

  label: {
    color: Colors.textSecondary,
  },

  value: {
    color: Colors.textPrimary,
  },

  discount: {
    color: Colors.success,
  },

  divider: {
    height: 1,
    marginVertical: FixxamTokens.spacing.sm,
    backgroundColor: Colors.divider,
  },

  totalRow: {
    marginTop: FixxamTokens.spacing.sm,
    marginBottom: FixxamTokens.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: FixxamTokens.spacing.md,
  },

  totalContent: {
    flex: 1,
    minWidth: 0,
  },

  totalLabel: {
    color: Colors.textPrimary,
  },

  savedText: {
    marginTop: FixxamTokens.spacing.xs,
    color: Colors.success,
  },

  totalPrice: {
    flexShrink: 0,
    color: CustomerColors.primary,
  },

  placeButton: {
    minHeight: FixxamTokens.size.buttonHeight,
    paddingHorizontal: FixxamTokens.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: FixxamTokens.spacing.sm,
    borderRadius: FixxamTokens.radius.button,
    backgroundColor: CustomerColors.primary,
  },

  placeButtonDisabled: {
    backgroundColor: Colors.disabledBackground,
  },

  placeText: {
    color: Colors.textInverse,
  },

  placeTextDisabled: {
    color: Colors.textMuted,
  },

  pressed: {
    opacity: FixxamTokens.motion.pressedOpacity,
    transform: [
      {
        scale: FixxamTokens.motion.scalePressed,
      },
    ],
  },
});