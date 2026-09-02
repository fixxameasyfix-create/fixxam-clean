import React, { memo, useEffect, useRef } from "react";

import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  visible: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

function BookingConfirmationModal({
  visible,
  loading = false,
  onCancel,
  onConfirm,
}: Props) {
  const translateY = useRef(
    new Animated.Value(450),
  ).current;

  const backdropOpacity = useRef(
    new Animated.Value(0),
  ).current;

  /*
   * Prevent accidental duplicate confirmation.
   */
  const confirmingRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      confirmingRef.current = false;

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 160,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),

        Animated.timing(translateY, {
          toValue: 450,
          duration: 180,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();

      return;
    }

    confirmingRef.current = false;

    translateY.setValue(450);
    backdropOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),

      Animated.spring(translateY, {
        toValue: 0,
        damping: 22,
        stiffness: 180,
        mass: 0.8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    visible,
    backdropOpacity,
    translateY,
  ]);

  /*
   * ==========================================================
   * CONFIRM
   * ==========================================================
   */

  const handleConfirm = () => {
    if (loading) {
      return;
    }

    if (confirmingRef.current) {
      return;
    }

    confirmingRef.current = true;

    onConfirm();
  };

  /*
   * ==========================================================
   * CANCEL
   * ==========================================================
   */

  const handleCancel = () => {
    if (loading) {
      return;
    }

    onCancel();
  };

  /*
   * ==========================================================
   * BACK
   * ==========================================================
   */

  const handleRequestClose = () => {
    if (!loading) {
      onCancel();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleRequestClose}
    >
      <View style={styles.root}>
        {/* ==================================================
            BACKDROP
        ================================================== */}

        <Animated.View
          pointerEvents="none"
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity,
            },
          ]}
        />

        {/* ==================================================
            OUTSIDE TAP
        ================================================== */}

        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleCancel}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Close booking confirmation"
        />

        {/* ==================================================
            BOTTOM SHEET
        ================================================== */}

        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [
                {
                  translateY,
                },
              ],
            },
          ]}
        >
          {/* HANDLE */}

          <View style={styles.handle} />

          {/* ICON */}

          <View style={styles.iconBox}>
            <Ionicons
              name="checkmark-circle"
              size={34}
              color="#2563EB"
            />
          </View>

          {/* TITLE */}

          <AppText
            weight="bold"
            style={styles.title}
          >
            Confirm Booking
          </AppText>

          {/* DESCRIPTION */}

          <AppText style={styles.description}>
            Please confirm your booking before sending
            your request to the worker.
          </AppText>

          {/* INFO */}

          <View style={styles.infoBox}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="information-circle"
                size={19}
                color="#2563EB"
              />
            </View>

            <View style={styles.infoContent}>
              <AppText
                weight="bold"
                style={styles.infoTitle}
              >
                What happens next?
              </AppText>

              <AppText style={styles.infoText}>
                The worker will review your request
                and send the final estimate after
                receiving your booking.
              </AppText>
            </View>
          </View>

          {/* ACTIONS */}

          <View style={styles.actions}>
            {/* CANCEL */}

            <Pressable
              disabled={loading}
              onPress={handleCancel}
              accessibilityRole="button"
              accessibilityLabel="Cancel booking"
              accessibilityState={{
                disabled: loading,
              }}
              style={({ pressed }) => [
                styles.cancelButton,
                pressed &&
                  !loading &&
                  styles.pressed,
                loading && styles.disabled,
              ]}
            >
              <AppText
                weight="bold"
                style={styles.cancelText}
              >
                Cancel
              </AppText>
            </Pressable>

            {/* CONFIRM */}

            <Pressable
              disabled={loading}
              onPress={handleConfirm}
              accessibilityRole="button"
              accessibilityLabel="Confirm and send booking"
              accessibilityState={{
                disabled: loading,
                busy: loading,
              }}
              hitSlop={4}
              style={({ pressed }) => [
                styles.confirmButton,
                pressed &&
                  !loading &&
                  styles.pressed,
                loading &&
                  styles.confirmDisabled,
              ]}
            >
              {loading ? (
                <>
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />

                  <AppText
                    weight="bold"
                    style={styles.confirmText}
                  >
                    Sending...
                  </AppText>
                </>
              ) : (
                <>
                  <AppText
                    weight="bold"
                    style={styles.confirmText}
                  >
                    Confirm & Send
                  </AppText>

                  <Ionicons
                    name="arrow-forward"
                    size={19}
                    color="#FFFFFF"
                  />
                </>
              )}
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default memo(
  BookingConfirmationModal,
);

const styles = StyleSheet.create({
  /*
   * ==========================================================
   * ROOT
   * ==========================================================
   */

  root: {
    flex: 1,
    justifyContent: "flex-end",
  },

  /*
   * ==========================================================
   * BACKDROP
   * ==========================================================
   */

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.62)",
  },

  /*
   * ==========================================================
   * SHEET
   * ==========================================================
   */

  sheet: {
    width: "100%",

    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,

    backgroundColor: "#FFFFFF",

    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,

    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 24,

    shadowOffset: {
      width: 0,
      height: -8,
    },

    elevation: 24,
  },

  /*
   * ==========================================================
   * HANDLE
   * ==========================================================
   */

  handle: {
    alignSelf: "center",

    width: 42,
    height: 4,

    borderRadius: 2,

    backgroundColor: "#CBD5E1",

    marginBottom: 16,
  },

  /*
   * ==========================================================
   * ICON
   * ==========================================================
   */

  iconBox: {
    width: 62,
    height: 62,

    borderRadius: 20,

    alignSelf: "center",

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#EFF6FF",

    borderWidth: 1,
    borderColor: "#BFDBFE",

    marginBottom: 14,
  },

  /*
   * ==========================================================
   * TITLE
   * ==========================================================
   */

  title: {
    fontSize: 23,
    lineHeight: 29,

    textAlign: "center",

    color: "#0F172A",
  },

  /*
   * ==========================================================
   * DESCRIPTION
   * ==========================================================
   */

  description: {
    marginTop: 7,

    paddingHorizontal: 8,

    fontSize: 14,
    lineHeight: 21,

    textAlign: "center",

    color: "#64748B",
  },

  /*
   * ==========================================================
   * INFO
   * ==========================================================
   */

  infoBox: {
    flexDirection: "row",

    marginTop: 18,

    padding: 13,

    borderRadius: 17,

    backgroundColor: "#EFF6FF",

    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  infoIcon: {
    width: 30,
    height: 30,

    borderRadius: 10,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FFFFFF",
  },

  infoContent: {
    flex: 1,
    marginLeft: 10,
  },

  infoTitle: {
    fontSize: 13,
    color: "#1E40AF",
  },

  infoText: {
    marginTop: 3,

    fontSize: 12.5,
    lineHeight: 18,

    color: "#3B82F6",
  },

  /*
   * ==========================================================
   * ACTIONS
   * ==========================================================
   */

  actions: {
    flexDirection: "row",

    gap: 10,

    marginTop: 20,
  },

  cancelButton: {
    flex: 0.85,

    height: 50,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 15,

    backgroundColor: "#F8FAFC",

    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  confirmButton: {
    flex: 1.35,

    height: 50,

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    gap: 8,

    borderRadius: 15,

    backgroundColor: "#2563EB",

    shadowColor: "#2563EB",
    shadowOpacity: 0.18,
    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 5,
  },

  /*
   * ==========================================================
   * TEXT
   * ==========================================================
   */

  cancelText: {
    fontSize: 14,
    color: "#475569",
  },

  confirmText: {
    fontSize: 14,
    color: "#FFFFFF",
  },

  /*
   * ==========================================================
   * STATES
   * ==========================================================
   */

  pressed: {
    opacity: 0.82,

    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  disabled: {
    opacity: 0.5,
  },

  confirmDisabled: {
    opacity: 0.65,
  },
});