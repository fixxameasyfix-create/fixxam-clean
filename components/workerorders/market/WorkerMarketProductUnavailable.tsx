import React, {
  useCallback,
  useMemo,
  useRef,
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
  Timestamp,
} from "firebase/firestore";

import Toast from "react-native-toast-message";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

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
   HELPERS
============================================================ */

function normalizeString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function normalizeStatus(
  value: unknown,
): string {
  return normalizeString(
    value,
  )
    .toLowerCase()
    .replace(
      /[_\s]+/g,
      "-",
    );
}

function isClosedStatus(
  value: unknown,
): boolean {
  const status =
    normalizeStatus(
      value,
    );

  return (
    status === "cancelled" ||
    status === "canceled" ||
    status === "completed" ||
    status === "expired"
  );
}

function containsProductId(
  value: unknown,
  productId: string,
): boolean {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.some(
    item => {
      /*
       * Migration-safe:
       * supports legacy string[] and
       * current object[] values.
       */
      if (
        typeof item ===
        "string"
      ) {
        return (
          item.trim() ===
          productId
        );
      }

      if (
        !item ||
        typeof item !==
          "object"
      ) {
        return false;
      }

      const record =
        item as Record<
          string,
          unknown
        >;

      return (
        normalizeString(
          record.productId,
        ) === productId
      );
    },
  );
}

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
  ] =
    useState(false);

  const submissionRef =
    useRef(false);

  /* ==========================================================
     NORMALIZED VALUES
  ========================================================== */

  const normalizedOrderId =
    useMemo(
      () =>
        orderId.trim(),
      [orderId],
    );

  const normalizedProductId =
    useMemo(
      () =>
        productId.trim(),
      [productId],
    );

  const normalizedProductName =
    useMemo(
      () =>
        productName.trim() ||
        "Product",
      [productName],
    );

  const blocked =
    disabled ||
    submitting;

  /* ==========================================================
     SUBMIT
  ========================================================== */

  const submitUnavailable =
    useCallback(async () => {
      if (
        submissionRef.current ||
        disabled
      ) {
        return;
      }

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

      submissionRef.current =
        true;

      setSubmitting(
        true,
      );

      try {
        const orderRef =
          doc(
            db,
            "orders",
            normalizedOrderId,
          );

        await runTransaction(
          db,
          async transaction => {
            const snapshot =
              await transaction.get(
                orderRef,
              );

            /* ==================================================
               ORDER EXISTS
            ================================================== */

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
               WORKER OWNERSHIP
            ================================================== */

            const workerId =
              normalizeString(
                data.workerId,
              );

            if (
              !workerId ||
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

            if (
              isClosedStatus(
                data.status,
              )
            ) {
              throw new Error(
                "ORDER_CLOSED",
              );
            }

            /* ==================================================
               DUPLICATE CHECK
            ================================================== */

            if (
              containsProductId(
                data.unavailableProducts,
                normalizedProductId,
              )
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
                      normalizedProductName,

                    reportedBy:
                      user.uid,

                    /*
                     * Timestamp.now() is intentional.
                     *
                     * serverTimestamp() remains top-level
                     * because transform sentinels should not
                     * be nested inside arrayUnion values.
                     */
                    reportedAt:
                      Timestamp.now(),
                  }),

                updatedAt:
                  serverTimestamp(),
              },
            );
          },
        );

        /* ======================================================
           LOCAL UI UPDATE
        ====================================================== */

        onReported?.(
          normalizedProductId,
        );

        Toast.show({
          type: "success",

          text1:
            "Customer notified",

          text2:
            `"${normalizedProductName}" was marked unavailable.`,
        });
      } catch (error) {
        console.error(
          "FIXXAM_WORKER_MARK_PRODUCT_UNAVAILABLE_ERROR:",
          error,
        );

        handleError(
          error,
        );
      } finally {
        submissionRef.current =
          false;

        setSubmitting(
          false,
        );
      }
    }, [
      disabled,
      normalizedOrderId,
      normalizedProductId,
      normalizedProductName,
      onReported,
    ]);

  /* ==========================================================
     CONFIRM
  ========================================================== */

  const handleUnavailable =
    useCallback(() => {
      if (
        blocked ||
        submissionRef.current
      ) {
        return;
      }

      Alert.alert(
        "Product unavailable",

        `"${normalizedProductName}" is not available at the moment. Notify the customer?`,

        [
          {
            text:
              "Cancel",

            style:
              "cancel",
          },

          {
            text:
              "Notify Customer",

            style:
              "destructive",

            onPress:
              () => {
                void submitUnavailable();
              },
          },
        ],
      );
    }, [
      blocked,
      normalizedProductName,
      submitUnavailable,
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
        blocked
      }
      accessibilityRole="button"
      accessibilityLabel={`Mark ${normalizedProductName} unavailable`}
      accessibilityState={{
        disabled:
          blocked,

        busy:
          submitting,
      }}
      style={({
        pressed,
      }) => [
        styles.button,

        blocked
          ? styles.disabled
          : null,

        pressed &&
        !blocked
          ? styles.pressed
          : null,
      ]}
    >
      {submitting ? (
        <ActivityIndicator
          size="small"
          color={
            Colors.error
          }
        />
      ) : (
        <AppIcon
          name="error"
          size="xs"
          color={
            Colors.error
          }
        />
      )}

      <AppText
        variant="caption"
        weight="bold"
        numberOfLines={1}
        style={
          styles.text
        }
      >
        {submitting
          ? "Updating..."
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
): void {
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
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderWidth: 1,

      borderColor:
        Colors.error,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.errorSoft,
    },

    text: {
      color:
        Colors.error,
    },

    disabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    pressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },
  });