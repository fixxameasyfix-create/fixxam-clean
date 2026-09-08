import React, { memo } from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import type { AppIconName } from "@/components/ui/AppIcon";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import type { PaymentMethod } from "@/hooks/useCheckout";

type Props = {
  paymentMethod: PaymentMethod;
  loading: boolean;
  onChange: (method: PaymentMethod) => void;
};

type PaymentOptionProps = {
  icon: AppIconName;
  label: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
};

function PaymentOption({
  icon,
  label,
  selected,
  disabled,
  onPress,
}: PaymentOptionProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{
        checked: selected,
        disabled,
      }}
      style={({ pressed }) => [
        styles.payment,
        selected && styles.selectedPayment,
        disabled && styles.disabled,
        pressed && !disabled && styles.paymentPressed,
      ]}
    >
      <View style={styles.paymentIcon}>
        <AppIcon
          name={icon}
          role="customer"
          size="sm"
          color={CustomerColors.primary}
        />
      </View>

      <AppText
        variant="body"
        weight={selected ? "bold" : undefined}
        style={styles.paymentText}
      >
        {label}
      </AppText>

      <View
        style={[
          styles.radioOuter,
          selected && styles.radioOuterSelected,
        ]}
      >
        {selected && <View style={styles.radioInner} />}
      </View>
    </Pressable>
  );
}

function CheckoutPaymentSection({
  paymentMethod,
  loading,
  onChange,
}: Props) {
  return (
    <>
      <View style={styles.card}>
        <AppText
          variant="heading3"
          weight="bold"
          style={styles.sectionTitle}
        >
          Payment Method
        </AppText>

        <PaymentOption
          icon="wallet"
          label="Pay on Delivery"
          selected={paymentMethod === "cash"}
          disabled={loading}
          onPress={() => onChange("cash")}
        />

        <PaymentOption
          icon="payment"
          label="Card Payment"
          selected={paymentMethod === "card"}
          disabled={loading}
          onPress={() => onChange("card")}
        />

        <PaymentOption
          icon="wallet"
          label="Bank Transfer"
          selected={paymentMethod === "transfer"}
          disabled={loading}
          onPress={() => onChange("transfer")}
        />
      </View>

      <View style={styles.workerNotice}>
        <View style={styles.workerNoticeIcon}>
          <AppIcon
            name="profile"
            role="customer"
            size="sm"
            color={CustomerColors.primary}
          />
        </View>

        <View style={styles.workerNoticeContent}>
          <AppText
            variant="caption"
            weight="bold"
            style={styles.workerNoticeTitle}
          >
            Worker assigned
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={2}
            style={styles.workerNoticeText}
          >
            Your order will be sent directly to the assigned worker.
          </AppText>
        </View>

        <AppIcon
          name="success"
          size="sm"
          color={Colors.success}
        />
      </View>
    </>
  );
}

export default memo(CheckoutPaymentSection);

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

  payment: {
    minHeight: FixxamTokens.size.buttonHeight,
    marginBottom: FixxamTokens.spacing.sm,
    paddingHorizontal: FixxamTokens.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: FixxamTokens.radius.md,
    backgroundColor: Colors.background,
  },

  selectedPayment: {
    borderColor: CustomerColors.primary,
    backgroundColor: CustomerColors.primarySoft,
  },

  paymentPressed: {
    opacity: FixxamTokens.motion.pressedOpacity,
  },

  paymentIcon: {
    width: FixxamTokens.size.minimumTouchTarget,
    height: FixxamTokens.size.minimumTouchTarget,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: FixxamTokens.radius.md,
    backgroundColor: Colors.surface,
  },

  paymentText: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: FixxamTokens.spacing.md,
    color: Colors.textPrimary,
  },

  radioOuter: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.disabled,
    borderRadius: FixxamTokens.radius.full,
  },

  radioOuterSelected: {
    borderColor: CustomerColors.primary,
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: FixxamTokens.radius.full,
    backgroundColor: CustomerColors.primary,
  },

  workerNotice: {
    marginBottom: FixxamTokens.spacing.lg,
    padding: FixxamTokens.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: FixxamTokens.radius.lg,
    backgroundColor: Colors.successSoft,
  },

  workerNoticeIcon: {
    width: FixxamTokens.size.minimumTouchTarget,
    height: FixxamTokens.size.minimumTouchTarget,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: FixxamTokens.radius.md,
    backgroundColor: CustomerColors.primarySoft,
  },

  workerNoticeContent: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: FixxamTokens.spacing.sm,
  },

  workerNoticeTitle: {
    color: Colors.success,
  },

  workerNoticeText: {
    marginTop: FixxamTokens.spacing.xs,
    lineHeight: 16,
    color: Colors.textSecondary,
  },

  disabled: {
    opacity: FixxamTokens.motion.disabledOpacity,
  },
});