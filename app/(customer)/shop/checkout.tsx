import React from "react";

import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import CheckoutDeliveryCard from "@/components/checkout/CheckoutDeliveryCard";
import CheckoutOrderSummary from "@/components/checkout/CheckoutOrderSummary";
import CheckoutPaymentSection from "@/components/checkout/CheckoutPaymentSection";
import CheckoutTotalCard from "@/components/checkout/CheckoutTotalCard";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import { useCheckout } from "@/hooks/useCheckout";

export default function CheckoutScreen() {
  const checkout = useCheckout();

  return (
    <>
      <AppScreen
        role="customer"
        contentContainerStyle={styles.screen}
      >
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <AppText
              variant="heading1"
              weight="bold"
              style={styles.title}
            >
              Checkout
            </AppText>

            <CheckoutDeliveryCard
              address={checkout.address}
              focused={checkout.addressFocused}
              loading={checkout.loading}
              locationLoading={checkout.locationLoading}
              latitude={checkout.latitude}
              longitude={checkout.longitude}
              onAddressChange={checkout.handleAddressChange}
              onFocusChange={checkout.setAddressFocused}
              onUseCurrentLocation={() => {
                void checkout.handleUseCurrentLocation();
              }}
            />

            <CheckoutPaymentSection
              paymentMethod={checkout.paymentMethod}
              loading={checkout.loading}
              onChange={checkout.setPaymentMethod}
            />

            <CheckoutOrderSummary
              items={checkout.items}
              totalQuantity={checkout.totalQuantity}
            />

            <CheckoutTotalCard
              subtotal={checkout.safeSubtotal}
              discountTotal={checkout.safeDiscountTotal}
              total={checkout.safeTotal}
              hasDiscount={checkout.hasDiscount}
              loading={checkout.loading}
              cartReady={checkout.cartReady}
              onPlaceOrder={() => {
                void checkout.handlePlaceOrder();
              }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </AppScreen>

      <Modal
        visible={checkout.loginModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={checkout.closeLoginModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={checkout.closeLoginModal}
            accessibilityRole="button"
            accessibilityLabel="Close login dialog"
          />

          <View
            accessibilityViewIsModal
            style={styles.loginModal}
          >
            <View style={styles.loginIcon}>
              <AppIcon
                name="lock"
                role="customer"
                size="md"
                color={CustomerColors.primary}
              />
            </View>

            <AppText
              variant="heading3"
              weight="bold"
              style={styles.loginTitle}
            >
              Login required
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={styles.loginMessage}
            >
              Please login to place an order.
            </AppText>

            <View style={styles.loginActions}>
              <Pressable
                onPress={checkout.closeLoginModal}
                disabled={checkout.loading}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                style={({ pressed }) => [
                  styles.modalSecondaryButton,
                  pressed &&
                    !checkout.loading &&
                    styles.pressed,
                ]}
              >
                <AppText
                  variant="caption"
                  weight="bold"
                  style={styles.cancelText}
                >
                  CANCEL
                </AppText>
              </Pressable>

              <Pressable
                onPress={checkout.handleLogin}
                disabled={checkout.loading}
                accessibilityRole="button"
                accessibilityLabel="Login"
                style={({ pressed }) => [
                  styles.modalPrimaryButton,
                  pressed &&
                    !checkout.loading &&
                    styles.pressed,
                ]}
              >
                <AppText
                  variant="caption"
                  weight="bold"
                  style={styles.loginText}
                >
                  LOGIN
                </AppText>

                <AppIcon
                  name="next"
                  size="xs"
                  color={Colors.textInverse}
                />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: Colors.background,
  },

  keyboard: {
    flex: 1,
  },

  container: {
    paddingHorizontal: FixxamTokens.spacing.lg,
    paddingTop: FixxamTokens.spacing.lg,
    paddingBottom: FixxamTokens.spacing.xxl,
  },

  title: {
    marginBottom: FixxamTokens.spacing.lg,
    color: Colors.textPrimary,
  },

  modalOverlay: {
    flex: 1,
    paddingHorizontal: FixxamTokens.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.overlayMedium,
  },

  loginModal: {
    width: "100%",
    maxWidth: 390,
    padding: FixxamTokens.spacing.xl,
    borderRadius: FixxamTokens.radius.xl,
    backgroundColor: Colors.surface,
    ...FixxamTokens.shadow.card,
  },

  loginIcon: {
    width: FixxamTokens.size.avatarLg,
    height: FixxamTokens.size.avatarLg,
    marginBottom: FixxamTokens.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: FixxamTokens.radius.lg,
    backgroundColor: CustomerColors.primarySoft,
  },

  loginTitle: {
    color: Colors.textPrimary,
  },

  loginMessage: {
    marginTop: FixxamTokens.spacing.sm,
    lineHeight: 21,
    color: Colors.textSecondary,
  },

  loginActions: {
    marginTop: FixxamTokens.spacing.xl,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: FixxamTokens.spacing.sm,
  },

  modalSecondaryButton: {
    minHeight: FixxamTokens.size.minimumTouchTarget,
    paddingHorizontal: FixxamTokens.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: FixxamTokens.radius.button,
    backgroundColor: Colors.surface,
  },

  modalPrimaryButton: {
    minHeight: FixxamTokens.size.minimumTouchTarget,
    paddingHorizontal: FixxamTokens.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: FixxamTokens.spacing.xs,
    borderRadius: FixxamTokens.radius.button,
    backgroundColor: CustomerColors.primary,
  },

  cancelText: {
    letterSpacing: 0.7,
    color: Colors.textSecondary,
  },

  loginText: {
    letterSpacing: 0.7,
    color: Colors.textInverse,
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