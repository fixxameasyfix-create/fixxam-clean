import React, {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
} from "react-native";

import {
  arrayUnion,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import Ionicons from "@expo/vector-icons/Ionicons";

import Toast from "react-native-toast-message";

import {
  AppText,
} from "@/components/ui";

import {
  auth,
  db,
} from "@/firebase/config";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  orderId: string;
  productId: string;
  productName: string;
  disabled?: boolean;

  /**
   * Called only after Firestore successfully
   * records the unavailable product.
   */
  onReported?: (
    productId: string,
  ) => void;
};

/* ============================================================
   COMPONENT
============================================================ */

export default function WorkerMarketProductUnavailable({
  orderId,
  productId,
  productName,
  disabled = false,
  onReported,
}: Props) {
  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  /* ==========================================================
     CONFIRM
  ========================================================== */

  const handleUnavailable =
    useCallback(() => {
      if (
        submitting ||
        disabled
      ) {
        return;
      }

      Alert.alert(
        "Product unavailable",
        `"${productName}" is not available at the moment. Notify the customer?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Notify Customer",
            style: "destructive",
            onPress: () => {
              void submitUnavailable();
            },
          },
        ],
      );
    }, [
      submitting,
      disabled,
      productName,
    ]);

  /* ==========================================================
     SUBMIT
  ========================================================== */

  const submitUnavailable =
    useCallback(async () => {
      const user =
        auth.currentUser;

      if (!user) {
        Toast.show({
          type: "error",
          text1:
            "Authentication required",
          text2:
            "Please sign in again.",
        });

        return;
      }

      const normalizedOrderId =
        orderId.trim();

      const normalizedProductId =
        productId.trim();

      const normalizedProductName =
        productName.trim();

      if (
        !normalizedOrderId ||
        !normalizedProductId
      ) {
        Toast.show({
          type: "error",
          text1:
            "Invalid product",
          text2:
            "Product information is missing.",
        });

        return;
      }

      try {
        setSubmitting(true);

        const orderRef =
          doc(
            db,
            "orders",
            normalizedOrderId,
          );

        await runTransaction(
          db,
          async (
            transaction,
          ) => {
            const snapshot =
              await transaction.get(
                orderRef,
              );

            if (
              !snapshot.exists()
            ) {
              throw new Error(
                "ORDER_NOT_FOUND",
              );
            }

            const data =
              snapshot.data();

            /* ==================================================
               WORKER CHECK
            ================================================== */

            const workerId =
              typeof data.workerId ===
              "string"
                ? data.workerId.trim()
                : "";

            if (
              workerId !==
              user.uid
            ) {
              throw new Error(
                "NOT_ASSIGNED_WORKER",
              );
            }

            /* ==================================================
               ORDER STATUS
            ================================================== */

            const status =
              typeof data.status ===
              "string"
                ? data.status
                    .trim()
                    .toLowerCase()
                : "";

            if (
              status ===
                "cancelled" ||
              status ===
                "canceled" ||
              status ===
                "completed" ||
              status ===
                "expired"
            ) {
              throw new Error(
                "ORDER_CLOSED",
              );
            }

            /* ==================================================
               DUPLICATE CHECK
            ================================================== */

            const unavailableProducts =
              Array.isArray(
                data.unavailableProducts,
              )
                ? data.unavailableProducts
                : [];

            const alreadyReported =
              unavailableProducts.some(
                (item: unknown) => {
                  if (
                    !item ||
                    typeof item !==
                      "object"
                  ) {
                    return false;
                  }

                  const value =
                    item as Record<
                      string,
                      unknown
                    >;

                  return (
                    typeof value.productId ===
                      "string" &&
                    value.productId.trim() ===
                      normalizedProductId
                  );
                },
              );

            if (
              alreadyReported
            ) {
              throw new Error(
                "ALREADY_REPORTED",
              );
            }

            /* ==================================================
               UPDATE
            ================================================== */

            transaction.update(
              orderRef,
              {
                unavailableProducts:
                  arrayUnion({
                    productId:
                      normalizedProductId,

                    productName:
                      normalizedProductName ||
                      "Product",

                    reportedBy:
                      user.uid,

                    reportedAt:
                      serverTimestamp(),
                  }),

                updatedAt:
                  serverTimestamp(),
              },
            );
          },
        );

        /*
         * Update parent UI immediately.
         *
         * This happens only after the transaction
         * has completed successfully.
         */
        onReported?.(
          normalizedProductId,
        );

        Toast.show({
          type: "success",
          text1:
            "Customer notified",
          text2:
            `"${normalizedProductName || "Product"}" was marked unavailable.`,
        });
      } catch (error) {
        console.error(
          "FIXXAM_WORKER_MARK_PRODUCT_UNAVAILABLE_ERROR:",
          error,
        );

        handleError(error);
      } finally {
        setSubmitting(false);
      }
    }, [
      orderId,
      productId,
      productName,
      onReported,
    ]);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <Pressable
      onPress={
        handleUnavailable
      }
      disabled={
        submitting ||
        disabled
      }
      style={({ pressed }) => [
        styles.button,
        disabled &&
          styles.disabled,
        pressed &&
          !disabled &&
          !submitting &&
          styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Mark ${productName} unavailable`}
      accessibilityState={{
        disabled:
          submitting ||
          disabled,
        busy: submitting,
      }}
    >
      {submitting ? (
        <ActivityIndicator
          size="small"
          color="#B91C1C"
        />
      ) : (
        <Ionicons
          name="close-circle-outline"
          size={15}
          color="#B91C1C"
        />
      )}

      <AppText
        weight="bold"
        style={styles.text}
      >
        {submitting
          ? "Updating..."
          : disabled
            ? "Unavailable"
            : "Unavailable"}
      </AppText>
    </Pressable>
  );
}

/* ============================================================
   ERROR HANDLER
============================================================ */

function handleError(
  error: unknown,
) {
  const message =
    error instanceof Error
      ? error.message
      : "";

  switch (message) {
    case "ORDER_NOT_FOUND":
      Toast.show({
        type: "error",
        text1:
          "Order not found",
        text2:
          "This order is no longer available.",
      });
      return;

    case "NOT_ASSIGNED_WORKER":
      Toast.show({
        type: "error",
        text1:
          "Permission denied",
        text2:
          "You are not assigned to this order.",
      });
      return;

    case "ORDER_CLOSED":
      Toast.show({
        type: "info",
        text1:
          "Order closed",
        text2:
          "You can no longer update this order.",
      });
      return;

    case "ALREADY_REPORTED":
      Toast.show({
        type: "info",
        text1:
          "Already reported",
        text2:
          "This product has already been marked unavailable.",
      });
      return;

    default:
      Toast.show({
        type: "error",
        text1:
          "Unable to update product",
        text2:
          "Please check your connection and try again.",
      });
  }
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    button: {
      minHeight: 34,
      paddingHorizontal: 9,
      borderRadius: 10,
      backgroundColor:
        "#FEF2F2",
      borderWidth: 1,
      borderColor:
        "#FECACA",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 5,
    },

    disabled: {
      opacity: 0.65,
    },

    pressed: {
      opacity: 0.8,
    },

    text: {
      fontSize: 8.5,
      color: "#B91C1C",
    },
  });