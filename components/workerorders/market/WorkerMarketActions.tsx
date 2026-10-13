import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import Toast from "react-native-toast-message";

import {
  AppButton,
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import {
  auth,
  db,
} from "@/firebase/config";

/* ============================================================
   TYPES
============================================================ */

type WorkerMarketOrderActionsProps = {
  orderId: string;

  status?: string;

  unavailableProductCount?: number;
};

type LoadingAction =
  | "accept"
  | "unavailable"
  | null;

type MarketOrderAction =
  | "accept"
  | "unavailable";

type ActionErrorCode =
  | "ORDER_NOT_FOUND"
  | "NOT_ASSIGNED_WORKER"
  | "NOT_MARKET_ORDER"
  | "ORDER_NOT_PENDING"
  | "PRODUCTS_UNAVAILABLE";

type FirebaseLikeError = {
  code?: unknown;
};

/* ============================================================
   CONSTANTS
============================================================ */

const CUSTOMER_UNAVAILABLE_MESSAGE =
  "This product is currently not available. Please try another store.";

/* ============================================================
   HELPERS
============================================================ */

function normalizeStatus(
  value: unknown,
): string {
  return String(
    value ?? "",
  )
    .trim()
    .toLowerCase()
    .replace(
      /[_\s]+/g,
      "-",
    );
}

function getUnavailableProductCount(
  value: unknown,
): number {
  if (!Array.isArray(value)) {
    return 0;
  }

  const productIds =
    new Set<string>();

  value.forEach(
    item => {
      if (
        typeof item ===
        "string"
      ) {
        const productId =
          item.trim();

        if (productId) {
          productIds.add(
            productId,
          );
        }

        return;
      }

      if (
        !item ||
        typeof item !==
          "object"
      ) {
        return;
      }

      const productId =
        "productId" in item &&
        typeof item.productId ===
          "string"
          ? item.productId.trim()
          : "";

      if (productId) {
        productIds.add(
          productId,
        );
      }
    },
  );

  return productIds.size;
}

function getFirebaseErrorCode(
  error: unknown,
): string {
  if (
    typeof error !==
      "object" ||
    error === null ||
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

export default function WorkerMarketOrderActions({
  orderId,
  status,
  unavailableProductCount = 0,
}: WorkerMarketOrderActionsProps) {
  const [
    loadingAction,
    setLoadingAction,
  ] =
    useState<LoadingAction>(
      null,
    );

  const actionInFlightRef =
    useRef(false);

  /* ==========================================================
     NORMALIZED STATE
  ========================================================== */

  const cleanOrderId =
    useMemo(
      () =>
        orderId.trim(),
      [
        orderId,
      ],
    );

  const isPending =
    normalizeStatus(
      status,
    ) === "pending";

  const hasUnavailableProducts =
    unavailableProductCount >
    0;

  const busy =
    loadingAction !==
    null;

  /* ==========================================================
     VALIDATION
  ========================================================== */

  const validateAction =
    useCallback(() => {
      const user =
        auth.currentUser;

      if (!user) {
        Toast.show({
          type:
            "error",

          text1:
            "Sign in required",

          text2:
            "Please sign in again.",
        });

        return null;
      }

      if (!cleanOrderId) {
        Toast.show({
          type:
            "error",

          text1:
            "Order unavailable",

          text2:
            "Order information is missing.",
        });

        return null;
      }

      return {
        orderId:
          cleanOrderId,

        workerId:
          user.uid,
      };
    }, [
      cleanOrderId,
    ]);

  /* ==========================================================
     RUN ACTION
  ========================================================== */

  const runAction =
    useCallback(
      async (
        action: MarketOrderAction,
      ) => {
        if (
          actionInFlightRef.current
        ) {
          return;
        }

        const validation =
          validateAction();

        if (!validation) {
          return;
        }

        actionInFlightRef.current =
          true;

        setLoadingAction(
          action,
        );

        try {
          await updateMarketOrder(
            validation.orderId,
            validation.workerId,
            action,
          );

          if (
            action ===
            "accept"
          ) {
            Toast.show({
              type:
                "success",

              text1:
                "Order accepted",

              text2:
                "This order is ready for the next delivery step.",
            });

            return;
          }

          Toast.show({
            type:
              "success",

            text1:
              "Order updated",

            text2:
              "The customer has been notified.",
          });
        } catch (error) {
          if (__DEV__) {
            console.warn(
              action ===
              "accept"
                ? "WORKER_ACCEPT_MARKET_ORDER_ERROR"
                : "WORKER_UNAVAILABLE_MARKET_ORDER_ERROR",
              error,
            );
          }

          handleActionError(
            error,
            action,
          );
        } finally {
          actionInFlightRef.current =
            false;

          setLoadingAction(
            null,
          );
        }
      },
      [
        validateAction,
      ],
    );

  /* ==========================================================
     ACCEPT
  ========================================================== */

  const handleAccept =
    useCallback(() => {
      if (
        actionInFlightRef.current
      ) {
        return;
      }

      if (
        hasUnavailableProducts
      ) {
        Toast.show({
          type:
            "info",

          text1:
            "Products need attention",

          text2:
            "Resolve unavailable products before accepting this order.",
        });

        return;
      }

      void runAction(
        "accept",
      );
    }, [
      hasUnavailableProducts,
      runAction,
    ]);

  /* ==========================================================
     WHOLE ORDER UNAVAILABLE
  ========================================================== */

  const handleUnavailable =
    useCallback(() => {
      if (
        actionInFlightRef.current
      ) {
        return;
      }

      const validation =
        validateAction();

      if (!validation) {
        return;
      }

      Alert.alert(
        "Can't fulfil this order?",
        "This will cancel the entire market order and notify the customer that the requested product cannot be fulfilled.",
        [
          {
            text:
              "Keep Order",

            style:
              "cancel",
          },

          {
            text:
              "Cancel Order",

            style:
              "destructive",

            onPress: () => {
              void runAction(
                "unavailable",
              );
            },
          },
        ],
      );
    }, [
      runAction,
      validateAction,
    ]);

  /* ==========================================================
     ONLY PENDING ORDER HAS THESE ACTIONS
  ========================================================== */

  if (!isPending) {
    return null;
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          STATUS
      ====================================================== */}

      <View
        style={
          styles.statusRow
        }
      >
        <View
          style={
            styles.statusIcon
          }
        >
          <AppIcon
            name={
              hasUnavailableProducts
                ? "warning"
                : "package"
            }
            size="sm"
            color={
              hasUnavailableProducts
                ? Colors.warning
                : WorkerColors.primary
            }
          />
        </View>

        <View
          style={
            styles.statusContent
          }
        >
          <AppText
            variant="bodyMedium"
            weight="medium"
            style={
              styles.statusTitle
            }
          >
            {hasUnavailableProducts
              ? "Products need attention"
              : "Ready to accept"}
          </AppText>

          <AppText
            variant="caption"
            style={
              styles.statusText
            }
          >
            {hasUnavailableProducts
              ? `${unavailableProductCount} ${
                  unavailableProductCount ===
                  1
                    ? "product is"
                    : "products are"
                } unavailable. Resolve this before accepting the order.`
              : "Review the products and delivery details before accepting."}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          PRIMARY ACTION
      ====================================================== */}

      <AppButton
        title={
          loadingAction ===
          "accept"
            ? "Accepting..."
            : "Accept order"
        }
        role="worker"
        variant="primary"
        leftIconName="check"
        loading={
          loadingAction ===
          "accept"
        }
        disabled={
          busy ||
          hasUnavailableProducts
        }
        onPress={
          handleAccept
        }
        style={
          styles.primaryButton
        }
      />

      {/* ======================================================
          SECONDARY DESTRUCTIVE ACTION
      ====================================================== */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cannot fulfil this order"
        accessibilityState={{
          disabled:
            busy,
        }}
        disabled={
          busy
        }
        hitSlop={8}
        onPress={
          handleUnavailable
        }
        style={({
          pressed,
        }) => [
          styles.unavailableAction,

          busy
            ? styles.disabled
            : null,

          pressed &&
          !busy
            ? styles.pressed
            : null,
        ]}
      >
        <AppIcon
          name="error"
          size="xs"
          color={
            Colors.error
          }
        />

        <AppText
          variant="bodyMedium"
          weight="medium"
          style={
            styles.unavailableText
          }
        >
          {loadingAction ===
          "unavailable"
            ? "Updating..."
            : "Can't fulfil this order"}
        </AppText>
      </Pressable>
    </View>
  );
}

/* ============================================================
   MARKET ORDER TRANSACTION
============================================================ */

async function updateMarketOrder(
  orderId: string,
  workerUid: string,
  action: MarketOrderAction,
): Promise<void> {
  const orderRef =
    doc(
      db,
      "orders",
      orderId,
    );

  await runTransaction(
    db,
    async transaction => {
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

      /* ======================================================
         OWNERSHIP
      ====================================================== */

      const assignedWorkerId =
        typeof data.workerId ===
        "string"
          ? data.workerId.trim()
          : "";

      if (
        !assignedWorkerId ||
        assignedWorkerId !==
          workerUid
      ) {
        throw new Error(
          "NOT_ASSIGNED_WORKER",
        );
      }

      /* ======================================================
         MARKET ORDER
      ====================================================== */

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

      /* ======================================================
         STATUS
      ====================================================== */

      const currentStatus =
        normalizeStatus(
          data.status,
        );

      if (
        currentStatus !==
        "pending"
      ) {
        throw new Error(
          "ORDER_NOT_PENDING",
        );
      }

      /* ======================================================
         ACCEPT
      ====================================================== */

      if (
        action ===
        "accept"
      ) {
        /*
         * Transaction-level protection.
         *
         * Even if UI state is stale, an order with a reported
         * unavailable product cannot be accepted.
         */
        if (
          getUnavailableProductCount(
            data.unavailableProducts,
          ) >
          0
        ) {
          throw new Error(
            "PRODUCTS_UNAVAILABLE",
          );
        }

        transaction.update(
          orderRef,
          {
            status:
              "accepted",

            offerStatus:
              "accepted",

            acceptedBy:
              workerUid,

            acceptedAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),
          },
        );

        return;
      }

      /* ======================================================
         CANCEL ENTIRE ORDER
      ====================================================== */

      transaction.update(
        orderRef,
        {
          status:
            "cancelled",

          offerStatus:
            "cancelled",

          cancellationReason:
            "product_unavailable",

          customerMessage:
            CUSTOMER_UNAVAILABLE_MESSAGE,

          cancelledBy:
            workerUid,

          cancelledAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        },
      );
    },
  );
}

/* ============================================================
   ERROR HANDLER
============================================================ */

function handleActionError(
  error: unknown,
  action: MarketOrderAction,
): void {
  const message =
    error instanceof
    Error
      ? (
          error.message as
            ActionErrorCode
        )
      : "";

  switch (message) {
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
          "This order has already been processed.",
      });

      return;

    case "PRODUCTS_UNAVAILABLE":
      Toast.show({
        type:
          "info",

        text1:
          "Products need attention",

        text2:
          "Resolve unavailable products before accepting this order.",
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
        "This action is no longer available. Refresh the order and try again.",
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
      action ===
      "accept"
        ? "Unable to accept order"
        : "Unable to update order",

    text2:
      "Please try again.",
  });
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.lg,
    },

    /* ========================================================
       TRUECALLER-STYLE STATUS ROW
    ======================================================== */

    statusRow: {
      minHeight: 64,

      marginBottom:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    statusIcon: {
      width: 42,

      height: 42,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    statusContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    statusTitle: {
      color:
        Colors.textPrimary,
    },

    statusText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       PRIMARY CTA
    ======================================================== */

    primaryButton: {
      width: "100%",
    },

    /* ========================================================
       SECONDARY ACTION
    ======================================================== */

    unavailableAction: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.md,
    },

    unavailableText: {
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