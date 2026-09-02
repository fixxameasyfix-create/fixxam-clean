import React from "react";

import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  visible: boolean;
  workerName?: string;
  onClose: () => void;
  onProductsOnly: () => void;
  onProductsAndBooking: () => void;
};

export default function ProductBookingChoiceModal({
  visible,
  workerName = "this worker",
  onClose,
  onProductsOnly,
  onProductsAndBooking,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>

          {/* HEADER */}

          <View style={styles.iconWrapper}>
            <Ionicons
              name="briefcase-outline"
              size={25}
              color="#2563EB"
            />
          </View>

          <AppText
            weight="bold"
            style={styles.title}
          >
            Continue with {workerName}?
          </AppText>

          <AppText style={styles.message}>
            Do you want to buy the products only,
            or also book this worker?
          </AppText>

          {/* PRODUCTS ONLY */}

          <Pressable
            style={({ pressed }) => [
              styles.optionButton,
              styles.productsButton,
              pressed && styles.pressed,
            ]}
            onPress={onProductsOnly}
          >
            <View style={styles.lightIcon}>
              <Ionicons
                name="cart-outline"
                size={18}
                color="#2563EB"
              />
            </View>

            <View style={styles.optionContent}>
              <AppText
                weight="bold"
                style={styles.productsTitle}
              >
                Products Only
              </AppText>

              <AppText
                numberOfLines={1}
                style={styles.productsSubtitle}
              >
                Continue to checkout
              </AppText>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#64748B"
            />
          </Pressable>

          {/* PRODUCTS + BOOKING */}

          <Pressable
            style={({ pressed }) => [
              styles.optionButton,
              styles.bookingButton,
              pressed && styles.pressed,
            ]}
            onPress={onProductsAndBooking}
          >
            <View style={styles.blueIcon}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.optionContent}>
              <AppText
                weight="bold"
                style={styles.bookingTitle}
              >
                Products + Booking
              </AppText>

              <AppText
                numberOfLines={1}
                style={styles.bookingSubtitle}
              >
                Buy products and book worker
              </AppText>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#FFFFFF"
            />
          </Pressable>

          {/* CANCEL */}

          <Pressable
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && styles.pressed,
            ]}
            onPress={onClose}
          >
            <AppText
              weight="bold"
              style={styles.cancelText}
            >
              Cancel
            </AppText>
          </Pressable>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.48)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },

  modal: {
    width: "100%",
    maxWidth: 360,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },

  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 10,
  },

  title: {
    fontSize: 18,
    textAlign: "center",
    color: "#0F172A",
  },

  message: {
    marginTop: 5,
    marginBottom: 14,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 17,
    color: "#64748B",
  },

  optionButton: {
    minHeight: 58,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    marginBottom: 8,
  },

  productsButton: {
    borderWidth: 1,
    borderColor: "#DBEAFE",
    backgroundColor: "#F8FAFC",
  },

  bookingButton: {
    backgroundColor: "#2563EB",
  },

  lightIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  blueIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  optionContent: {
    flex: 1,
    marginHorizontal: 9,
  },

  productsTitle: {
    fontSize: 13,
    color: "#0F172A",
  },

  productsSubtitle: {
    marginTop: 2,
    fontSize: 10,
    color: "#64748B",
  },

  bookingTitle: {
    fontSize: 13,
    color: "#FFFFFF",
  },

  bookingSubtitle: {
    marginTop: 2,
    fontSize: 10,
    color: "#DBEAFE",
  },

  cancelButton: {
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    marginTop: 2,
  },

  cancelText: {
    fontSize: 12,
    color: "#475569",
  },

  pressed: {
    opacity: 0.78,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },
});