import React, {
  memo,
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  AppText,
} from "@/components/ui";

import {
  auth,
  db,
} from "@/firebase/config";

type Props = {
  visible: boolean;
  orderId: string;
  onClose: () => void;
  onCancelled?: () => void;
};

function CancelMarketOrderModal({
  visible,
  orderId,
  onClose,
  onCancelled,
}: Props) {
  const [
    cancelling,
    setCancelling,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const handleCancel =
    useCallback(async () => {
      const user =
        auth.currentUser;

      if (!user) {
        setError(
          "Please sign in again.",
        );
        return;
      }

      if (!orderId.trim()) {
        setError(
          "Order ID is missing.",
        );
        return;
      }

      setCancelling(true);
      setError(null);

      try {
        const orderRef =
          doc(
            db,
            "orders",
            orderId,
          );

        await updateDoc(
          orderRef,
          {
            status: "cancelled",

            cancelledBy:
              "customer",

            cancelledAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),
          },
        );

        onCancelled?.();
        onClose();
      } catch (cancelError) {
        console.error(
          "CANCEL_MARKET_ORDER_ERROR:",
          cancelError,
        );

        setError(
          "Unable to cancel this order. Please try again.",
        );
      } finally {
        setCancelling(false);
      }
    }, [
      orderId,
      onCancelled,
      onClose,
    ]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={
        cancelling
          ? undefined
          : onClose
      }
    >
      <View
        style={
          styles.overlay
        }
      >
        <View
          style={
            styles.modal
          }
        >
          <View
            style={
              styles.iconBox
            }
          >
            <Ionicons
              name="close-circle-outline"
              size={28}
              color="#DC2626"
            />
          </View>

          <AppText
            weight="bold"
            style={
              styles.title
            }
          >
            Cancel Order?
          </AppText>

          <AppText
            center
            style={
              styles.message
            }
          >
            Are you sure you want to
            cancel this order? This
            action cannot be undone.
          </AppText>

          {error ? (
            <View
              style={
                styles.errorBox
              }
            >
              <Ionicons
                name="alert-circle-outline"
                size={16}
                color="#DC2626"
              />

              <AppText
                style={
                  styles.errorText
                }
              >
                {error}
              </AppText>
            </View>
          ) : null}

          <View
            style={
              styles.actions
            }
          >
            <Pressable
              disabled={
                cancelling
              }
              onPress={
                onClose
              }
              style={({ pressed }) => [
                styles.button,
                styles.keepButton,
                pressed &&
                  !cancelling &&
                  styles.pressed,
              ]}
            >
              <AppText
                weight="bold"
                style={
                  styles.keepText
                }
              >
                KEEP ORDER
              </AppText>
            </Pressable>

            <Pressable
              disabled={
                cancelling
              }
              onPress={
                handleCancel
              }
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                pressed &&
                  !cancelling &&
                  styles.pressed,
              ]}
            >
              {cancelling ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <AppText
                  weight="bold"
                  style={
                    styles.cancelText
                  }
                >
                  CANCEL ORDER
                </AppText>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default memo(
  CancelMarketOrderModal,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    overlay: {
      flex: 1,
      paddingHorizontal: 22,
      backgroundColor:
        "rgba(15,23,42,0.45)",
      alignItems: "center",
      justifyContent:
        "center",
    },

    modal: {
      width: "100%",
      padding: 20,
      borderRadius: 22,
      backgroundColor:
        "#FFFFFF",
      alignItems: "center",
    },

    iconBox: {
      width: 58,
      height: 58,
      borderRadius: 19,
      backgroundColor:
        "#FEF2F2",
      alignItems: "center",
      justifyContent:
        "center",
    },

    title: {
      marginTop: 13,
      fontSize: 17,
      color: "#0F172A",
    },

    message: {
      marginTop: 7,
      fontSize: 10,
      lineHeight: 16,
      color: "#64748B",
    },

    errorBox: {
      width: "100%",
      marginTop: 12,
      padding: 10,
      borderRadius: 11,
      backgroundColor:
        "#FEF2F2",
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },

    errorText: {
      flex: 1,
      fontSize: 8.5,
      lineHeight: 13,
      color: "#B91C1C",
    },

    actions: {
      width: "100%",
      marginTop: 18,
      gap: 8,
    },

    button: {
      minHeight: 46,
      borderRadius: 13,
      alignItems: "center",
      justifyContent:
        "center",
    },

    keepButton: {
      backgroundColor:
        "#F1F5F9",
    },

    cancelButton: {
      backgroundColor:
        "#DC2626",
    },

    keepText: {
      fontSize: 9.5,
      color: "#334155",
    },

    cancelText: {
      fontSize: 9.5,
      color: "#FFFFFF",
    },

    pressed: {
      opacity: 0.8,
      transform: [
        {
          scale: 0.98,
        },
      ],
    },
  });