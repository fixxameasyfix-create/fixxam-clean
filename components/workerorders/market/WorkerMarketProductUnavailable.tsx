import React, {
  memo,
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

  onReported?: (
    productId: string,
  ) => void;
};

type ActionErrorCode =
  | "ORDER_NOT_FOUND"
  | "NOT_ASSIGNED_WORKER"
  | "NOT_MARKET_ORDER"
  | "ORDER_NOT_PENDING"
  | "PRODUCT_NOT_FOUND"
  | "ALREADY_REPORTED";

type FirebaseLikeError = {
  code?: unknown;
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

function containsProductId(
  value: unknown,
  productId: string,
): boolean {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return false;
  }

  return value.some(
    item => {
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
        ) === productId ||
        normalizeString(
          record.id,
        ) === productId
      );
    },
  );
}

function orderContainsProduct(
  products: unknown,
  productId: string,
): boolean {
  if (
    !Array.isArray(
      products,
    )
  ) {
    return false;
  }

  return products.some(
    item => {
      if (
        !item ||
        typeof item !==
          "object"
      ) {
        return false;
      }

      const data =
        item as Record<
          string,
          unknown
        >;

      return (
        normalizeString(
          data.productId,
        ) === productId ||
        normalizeString(
          data.id,
        ) === productId
      );
    },
  );
}

function getFirebaseErrorCode(
  error: unknown,
): string {
  if (
    !error ||
    typeof error !==
      "object" ||
    !("code" in error)
  ) {
    return "";
  }

  const code =
    (
      error as FirebaseLikeError
    ).code;

  return typeof code ===
    "string"
    ? code
    : "";
}

/* ============================================================
   COMPONENT
============================================================ */

function WorkerMarketProductUnavailable({
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
      [
        orderId,
      ],
    );

  const normalizedProductId =
    useMemo(
      () =>
        productId.trim(),
      [
        productId,
      ],
    );

  const normalizedProductName =
    useMemo(
      () =>
        productName.trim() ||
        "Product",
      [
        productName,
      ],
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

      if (
        !user
      ) {
        Toast.show({
          type:
            "error",

          text1:
            "Sign in required",

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
          type:
            "error",

          text1:
            "Product unavailable",

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

            /* ================================================
               ORDER EXISTS
            ================================================ */

            if (
              !snapshot.exists()
            ) {
              throw new Error(
                "ORDER_NOT_FOUND",
              );
            }

            const data =
              snapshot.data();

            /* ================================================
               WORKER OWNERSHIP
            ================================================ */

            const assignedWorkerId =
              normalizeString(
                data.workerId,
              );

            if (
              !assignedWorkerId ||
              assignedWorkerId !==
                user.uid
            ) {
              throw new Error(
                "NOT_ASSIGNED_WORKER",
              );
            }

            /* ================================================
               MARKET ORDER
            ================================================ */

            const orderType =
              normalizeStatus(
                data.orderType,
              );

            const type =
              normalizeStatus(
                data.type,
              );

            if (
              orderType !==
                "market" &&
              type !==
                "market"
            ) {
              throw new Error(
                "NOT_MARKET_ORDER",
              );
            }

            /* ================================================
               STATUS
            ================================================ */

            if (
              normalizeStatus(
                data.status,
              ) !==
              "pending"
            ) {
              throw new Error(
                "ORDER_NOT_PENDING",
              );
            }

            /* ================================================
               PRODUCT MUST BELONG TO ORDER
            ================================================ */

            if (
              !orderContainsProduct(
                data.products,
                normalizedProductId,
              )
            ) {
              throw new Error(
                "PRODUCT_NOT_FOUND",
              );
            }

            /* ================================================
               DUPLICATE CHECK
            ================================================ */

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

            /* ================================================
               UPDATE
            ================================================ */

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
                     * Nested serverTimestamp() cannot be used
                     * inside arrayUnion().
                     *
                     * This timestamp is display metadata.
                     * The trusted document update timestamp
                     * remains updatedAt below.
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

        onReported?.(
          normalizedProductId,
        );

        Toast.show({
          type:
            "success",

          text1:
            "Marked unavailable",

          text2:
            `${normalizedProductName} was reported to the customer.`,
        });
      } catch (
        error
      ) {
        if (
          __DEV__
        ) {
          console.warn(
            "WORKER_MARK_PRODUCT_UNAVAILABLE_ERROR",
            error,
          );
        }

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
        "Product unavailable?",
        `Mark "${normalizedProductName}" as unavailable for this order?`,
        [
          {
            text:
              "Cancel",

            style:
              "cancel",
          },

          {
            text:
              "Mark Unavailable",

            style:
              "destructive",

            onPress: () => {
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
     ACTION
  ========================================================== */

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Mark ${normalizedProductName} unavailable`}
      accessibilityHint="Report this product as unavailable for the current order"
      accessibilityState={{
        disabled:
          blocked,

        busy:
          submitting,
      }}
      disabled={
        blocked
      }
      hitSlop={{
        top:
          8,

        bottom:
          8,

        left:
          8,

        right:
          8,
      }}
      onPress={
        handleUnavailable
      }
      style={({
        pressed,
      }) => [
        styles.action,

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
        weight="medium"
        numberOfLines={1}
        style={
          styles.text
        }
      >
        {submitting
          ? "Updating..."
          : "Mark unavailable"}
      </AppText>
    </Pressable>
  );
}

/* ============================================================
   MEMO
============================================================ */

WorkerMarketProductUnavailable.displayName =
  "WorkerMarketProductUnavailable";

export default memo(
  WorkerMarketProductUnavailable,
);

/* ============================================================
   ERROR HANDLER
============================================================ */

function handleError(
  error: unknown,
): void {
  const message =
    error instanceof
    Error
      ? (
          error.message as
            ActionErrorCode
        )
      : "";

  switch (
    message
  ) {
    case "ORDER_NOT_FOUND":
      Toast.show({
        type:
          "error",

        text1:
          "Order unavailable",

        text2:
          "This order could not be found.",
      });

      return;

    case "NOT_ASSIGNED_WORKER":
      Toast.show({
        type:
          "error",

        text1:
          "Order unavailable",

        text2:
          "You are no longer assigned to this order.",
      });

      return;

    case "NOT_MARKET_ORDER":
      Toast.show({
        type:
          "error",

        text1:
          "Invalid order",

        text2:
          "This is not a market order.",
      });

      return;

    case "ORDER_NOT_PENDING":
      Toast.show({
        type:
          "info",

        text1:
          "Order changed",

        text2:
          "Products can no longer be updated for this order.",
      });

      return;

    case "PRODUCT_NOT_FOUND":
      Toast.show({
        type:
          "error",

        text1:
          "Product unavailable",

        text2:
          "This product is no longer part of the order.",
      });

      return;

    case "ALREADY_REPORTED":
      Toast.show({
        type:
          "info",

        text1:
          "Already unavailable",

        text2:
          "This product has already been reported.",
      });

      return;
  }

  const firebaseCode =
    getFirebaseErrorCode(
      error,
    );

  if (
    firebaseCode ===
      "permission-denied" ||
    firebaseCode ===
      "firestore/permission-denied"
  ) {
    Toast.show({
      type:
        "error",

      text1:
        "Order changed",

      text2:
        "This product can no longer be updated. Refresh the order.",
    });

    return;
  }

  if (
    firebaseCode ===
      "unavailable" ||
    firebaseCode ===
      "firestore/unavailable"
  ) {
    Toast.show({
      type:
        "error",

      text1:
        "Connection problem",

      text2:
        "Check your internet connection and try again.",
    });

    return;
  }

  Toast.show({
    type:
      "error",

    text1:
      "Unable to update product",

    text2:
      "Please try again.",
  });
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    action: {
      minHeight:
        28,

      alignSelf:
        "flex-start",

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.sm,

      backgroundColor:
        Colors.errorSoft,
    },

    text: {
      lineHeight:
        16,

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