import React, {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Toast from "react-native-toast-message";

import {
  getAuth,
} from "firebase/auth";

import {
  doc,
  getFirestore,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  orderId?: string | null;

  status?: string | null;

  unavailableProductCount?: number | null;
};

type MarketOrderStatus =
  | "pending"
  | "accepted"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "expired";

type BusyAction =
  | "primary"
  | "cancel"
  | null;

/* ============================================================
   HELPERS
============================================================ */

function safeString(
  value: unknown,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value.trim();
}

function safeCount(
  value: unknown,
): number {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(
      value,
    ),
  );
}

function normalizeStatus(
  value: unknown,
): MarketOrderStatus {
  const status =
    safeString(
      value,
    )
      .toLowerCase()
      .replace(
        /[_\s]+/g,
        "-",
      );

  switch (
    status
  ) {
    case "accepted":
      return "accepted";

    case "in-progress":
    case "on-the-way":
      return "in-progress";

    case "completed":
    case "delivered":
      return "completed";

    case "cancelled":
    case "canceled":
      return "cancelled";

    case "expired":
      return "expired";

    case "pending":
    default:
      return "pending";
  }
}

function normalizeOrderType(
  value: unknown,
): string {
  return safeString(
    value,
  ).toLowerCase();
}

function countUnavailableProducts(
  value: unknown,
): number {
  if (
    !Array.isArray(
      value,
    )
  ) {
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
          safeString(
            item,
          );

        if (
          productId
        ) {
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

      const record =
        item as Record<
          string,
          unknown
        >;

      const productId =
        safeString(
          record.productId,
        ) ||
        safeString(
          record.id,
        );

      if (
        productId
      ) {
        productIds.add(
          productId,
        );
      }
    },
  );

  return productIds.size;
}

function getPrimaryConfig(
  status: MarketOrderStatus,
) {
  switch (
    status
  ) {
    case "accepted":
      return {
        label:
          "Start delivery",

        icon:
          "navigation" as const,
      };

    case "in-progress":
      return {
        label:
          "Complete order",

        icon:
          "check" as const,
      };

    case "pending":
    default:
      return {
        label:
          "Accept order",

        icon:
          "check" as const,
      };
  }
}

function getErrorMessage(
  error: unknown,
): {
  title: string;
  message: string;
} {
  const code =
    error instanceof Error
      ? error.message
      : "";

  switch (
    code
  ) {
    case "AUTH_REQUIRED":
      return {
        title:
          "Sign in required",

        message:
          "Please sign in again to continue.",
      };

    case "INVALID_ORDER":
      return {
        title:
          "Order unavailable",

        message:
          "This order could not be found.",
      };

    case "NOT_MARKET_ORDER":
      return {
        title:
          "Invalid order",

        message:
          "This is not a market order.",
      };

    case "ORDER_ASSIGNED":
      return {
        title:
          "Order unavailable",

        message:
          "This order is assigned to another worker.",
      };

    case "NOT_ASSIGNED":
      return {
        title:
          "Cannot cancel order",

        message:
          "You can only cancel an order assigned to you.",
      };

    case "UNAVAILABLE_PRODUCTS":
      return {
        title:
          "Products unavailable",

        message:
          "Resolve unavailable products before accepting this order.",
      };

    case "STATUS_CHANGED":
      return {
        title:
          "Order updated",

        message:
          "The order status has changed. Please refresh and try again.",
      };

    default:
      return {
        title:
          "Something went wrong",

        message:
          "Unable to update this order. Please try again.",
      };
  }
}

/* ============================================================
   COMPONENT
============================================================ */

function WorkerMarketOrderActions({
  orderId,
  status,
  unavailableProductCount,
}: Props) {
  const [
    busyAction,
    setBusyAction,
  ] =
    useState<BusyAction>(
      null,
    );

  /* ==========================================================
     FIREBASE
  ========================================================== */

  const firebaseAuth =
    useMemo(
      () =>
        getAuth(),
      [],
    );

  const firestore =
    useMemo(
      () =>
        getFirestore(),
      [],
    );

  /* ==========================================================
     NORMALIZED VALUES
  ========================================================== */

  const normalizedOrderId =
    useMemo(
      () =>
        safeString(
          orderId,
        ),
      [
        orderId,
      ],
    );

  const normalizedStatus =
    useMemo(
      () =>
        normalizeStatus(
          status,
        ),
      [
        status,
      ],
    );

  const unavailableCount =
    useMemo(
      () =>
        safeCount(
          unavailableProductCount,
        ),
      [
        unavailableProductCount,
      ],
    );

  const primaryConfig =
    useMemo(
      () =>
        getPrimaryConfig(
          normalizedStatus,
        ),
      [
        normalizedStatus,
      ],
    );

  const isBusy =
    busyAction !==
    null;

  const isClosed =
    normalizedStatus ===
      "completed" ||
    normalizedStatus ===
      "cancelled" ||
    normalizedStatus ===
      "expired";

  const canCancel =
    normalizedStatus ===
      "pending" ||
    normalizedStatus ===
      "accepted";

  /* ==========================================================
     CURRENT WORKER
  ========================================================== */

  const getWorkerUid =
    useCallback(() => {
      const uid =
        safeString(
          firebaseAuth
            .currentUser
            ?.uid,
        );

      if (
        !uid
      ) {
        throw new Error(
          "AUTH_REQUIRED",
        );
      }

      return uid;
    }, [
      firebaseAuth,
    ]);

  /* ==========================================================
     ACCEPT ORDER
  ========================================================== */

  const acceptOrder =
    useCallback(async () => {
      const workerUid =
        getWorkerUid();

      if (
        !normalizedOrderId
      ) {
        throw new Error(
          "INVALID_ORDER",
        );
      }

      const orderRef =
        doc(
          firestore,
          "orders",
          normalizedOrderId,
        );

      await runTransaction(
        firestore,
        async transaction => {
          const snapshot =
            await transaction.get(
              orderRef,
            );

          if (
            !snapshot.exists()
          ) {
            throw new Error(
              "INVALID_ORDER",
            );
          }

          const data =
            snapshot.data();

          const orderType =
            normalizeOrderType(
              data.orderType ??
                data.type,
            );

          if (
            orderType !==
            "market"
          ) {
            throw new Error(
              "NOT_MARKET_ORDER",
            );
          }

          const assignedWorkerId =
            safeString(
              data.workerId,
            ) ||
            safeString(
              data.sellerId,
            );

          if (
            assignedWorkerId &&
            assignedWorkerId !==
              workerUid
          ) {
            throw new Error(
              "ORDER_ASSIGNED",
            );
          }

          const currentStatus =
            normalizeStatus(
              data.status,
            );

          if (
            currentStatus !==
            "pending"
          ) {
            throw new Error(
              "STATUS_CHANGED",
            );
          }

          const firestoreUnavailableCount =
            countUnavailableProducts(
              data.unavailableProducts,
            );

          if (
            Math.max(
              unavailableCount,
              firestoreUnavailableCount,
            ) > 0
          ) {
            throw new Error(
              "UNAVAILABLE_PRODUCTS",
            );
          }

          transaction.update(
            orderRef,
            {
              status:
                "accepted",

              workerId:
                workerUid,

              acceptedAt:
                serverTimestamp(),

              updatedAt:
                serverTimestamp(),
            },
          );
        },
      );
    }, [
      firestore,
      getWorkerUid,
      normalizedOrderId,
      unavailableCount,
    ]);

  /* ==========================================================
     START DELIVERY
  ========================================================== */

  const startDelivery =
    useCallback(async () => {
      const workerUid =
        getWorkerUid();

      if (
        !normalizedOrderId
      ) {
        throw new Error(
          "INVALID_ORDER",
        );
      }

      const orderRef =
        doc(
          firestore,
          "orders",
          normalizedOrderId,
        );

      await runTransaction(
        firestore,
        async transaction => {
          const snapshot =
            await transaction.get(
              orderRef,
            );

          if (
            !snapshot.exists()
          ) {
            throw new Error(
              "INVALID_ORDER",
            );
          }

          const data =
            snapshot.data();

          const orderType =
            normalizeOrderType(
              data.orderType ??
                data.type,
            );

          if (
            orderType !==
            "market"
          ) {
            throw new Error(
              "NOT_MARKET_ORDER",
            );
          }

          const assignedWorkerId =
            safeString(
              data.workerId,
            ) ||
            safeString(
              data.sellerId,
            );

          if (
            !assignedWorkerId ||
            assignedWorkerId !==
              workerUid
          ) {
            throw new Error(
              "ORDER_ASSIGNED",
            );
          }

          const currentStatus =
            normalizeStatus(
              data.status,
            );

          if (
            currentStatus !==
            "accepted"
          ) {
            throw new Error(
              "STATUS_CHANGED",
            );
          }

          transaction.update(
            orderRef,
            {
              status:
                "in-progress",

              deliveryStartedAt:
                serverTimestamp(),

              updatedAt:
                serverTimestamp(),
            },
          );
        },
      );
    }, [
      firestore,
      getWorkerUid,
      normalizedOrderId,
    ]);

  /* ==========================================================
     COMPLETE ORDER
  ========================================================== */

  const completeOrder =
    useCallback(async () => {
      const workerUid =
        getWorkerUid();

      if (
        !normalizedOrderId
      ) {
        throw new Error(
          "INVALID_ORDER",
        );
      }

      const orderRef =
        doc(
          firestore,
          "orders",
          normalizedOrderId,
        );

      await runTransaction(
        firestore,
        async transaction => {
          const snapshot =
            await transaction.get(
              orderRef,
            );

          if (
            !snapshot.exists()
          ) {
            throw new Error(
              "INVALID_ORDER",
            );
          }

          const data =
            snapshot.data();

          const orderType =
            normalizeOrderType(
              data.orderType ??
                data.type,
            );

          if (
            orderType !==
            "market"
          ) {
            throw new Error(
              "NOT_MARKET_ORDER",
            );
          }

          const assignedWorkerId =
            safeString(
              data.workerId,
            ) ||
            safeString(
              data.sellerId,
            );

          if (
            !assignedWorkerId ||
            assignedWorkerId !==
              workerUid
          ) {
            throw new Error(
              "ORDER_ASSIGNED",
            );
          }

          const currentStatus =
            normalizeStatus(
              data.status,
            );

          if (
            currentStatus !==
            "in-progress"
          ) {
            throw new Error(
              "STATUS_CHANGED",
            );
          }

          transaction.update(
            orderRef,
            {
              status:
                "completed",

              completedAt:
                serverTimestamp(),

              updatedAt:
                serverTimestamp(),
            },
          );
        },
      );
    }, [
      firestore,
      getWorkerUid,
      normalizedOrderId,
    ]);

  /* ==========================================================
     PRIMARY ACTION
  ========================================================== */

  const handlePrimaryAction =
    useCallback(async () => {
      if (
        isBusy ||
        isClosed
      ) {
        return;
      }

      setBusyAction(
        "primary",
      );

      try {
        switch (
          normalizedStatus
        ) {
          case "accepted":
            await startDelivery();

            Toast.show({
              type:
                "success",

              text1:
                "Delivery started",

              text2:
                "The order is now on the way.",
            });

            break;

          case "in-progress":
            await completeOrder();

            Toast.show({
              type:
                "success",

              text1:
                "Order completed",

              text2:
                "The order has been marked as delivered.",
            });

            break;

          case "pending":
          default:
            await acceptOrder();

            Toast.show({
              type:
                "success",

              text1:
                "Order accepted",

              text2:
                "You can now prepare the order for delivery.",
            });

            break;
        }
      } catch (
        error
      ) {
        if (
          __DEV__
        ) {
          console.warn(
            "WORKER_MARKET_PRIMARY_ACTION_ERROR",
            error,
          );
        }

        const feedback =
          getErrorMessage(
            error,
          );

        Toast.show({
          type:
            "error",

          text1:
            feedback.title,

          text2:
            feedback.message,
        });
      } finally {
        setBusyAction(
          null,
        );
      }
    }, [
      acceptOrder,
      completeOrder,
      isBusy,
      isClosed,
      normalizedStatus,
      startDelivery,
    ]);

  /* ==========================================================
     CANCEL ORDER
  ========================================================== */

  const cancelOrder =
    useCallback(async () => {
      const workerUid =
        getWorkerUid();

      if (
        !normalizedOrderId
      ) {
        throw new Error(
          "INVALID_ORDER",
        );
      }

      const orderRef =
        doc(
          firestore,
          "orders",
          normalizedOrderId,
        );

      await runTransaction(
        firestore,
        async transaction => {
          const snapshot =
            await transaction.get(
              orderRef,
            );

          if (
            !snapshot.exists()
          ) {
            throw new Error(
              "INVALID_ORDER",
            );
          }

          const data =
            snapshot.data();

          const orderType =
            normalizeOrderType(
              data.orderType ??
                data.type,
            );

          if (
            orderType !==
            "market"
          ) {
            throw new Error(
              "NOT_MARKET_ORDER",
            );
          }

          const assignedWorkerId =
            safeString(
              data.workerId,
            ) ||
            safeString(
              data.sellerId,
            );

          if (
            !assignedWorkerId
          ) {
            throw new Error(
              "NOT_ASSIGNED",
            );
          }

          if (
            assignedWorkerId !==
            workerUid
          ) {
            throw new Error(
              "ORDER_ASSIGNED",
            );
          }

          const currentStatus =
            normalizeStatus(
              data.status,
            );

          if (
            currentStatus !==
              "pending" &&
            currentStatus !==
              "accepted"
          ) {
            throw new Error(
              "STATUS_CHANGED",
            );
          }

          transaction.update(
            orderRef,
            {
              status:
                "cancelled",

              cancelledBy:
                "worker",

              cancellationReason:
                "Worker cancelled order",

              cancelledAt:
                serverTimestamp(),

              updatedAt:
                serverTimestamp(),
            },
          );
        },
      );
    }, [
      firestore,
      getWorkerUid,
      normalizedOrderId,
    ]);

  /* ==========================================================
     CANCEL CONFIRMATION
  ========================================================== */

  const handleCancelConfirm =
    useCallback(async () => {
      if (
        isBusy ||
        !canCancel
      ) {
        return;
      }

      setBusyAction(
        "cancel",
      );

      try {
        await cancelOrder();

        Toast.show({
          type:
            "success",

          text1:
            "Order cancelled",

          text2:
            "This market order has been cancelled.",
        });
      } catch (
        error
      ) {
        if (
          __DEV__
        ) {
          console.warn(
            "WORKER_MARKET_CANCEL_ERROR",
            error,
          );
        }

        const feedback =
          getErrorMessage(
            error,
          );

        Toast.show({
          type:
            "error",

          text1:
            feedback.title,

          text2:
            feedback.message,
        });
      } finally {
        setBusyAction(
          null,
        );
      }
    }, [
      cancelOrder,
      canCancel,
      isBusy,
    ]);

  const handleCancelPress =
    useCallback(() => {
      if (
        isBusy ||
        !canCancel
      ) {
        return;
      }

      Alert.alert(
        "Cancel order?",
        "Are you sure you want to cancel this market order? This action cannot be undone.",
        [
          {
            text:
              "Keep order",

            style:
              "cancel",
          },

          {
            text:
              "Cancel order",

            style:
              "destructive",

            onPress:
              () => {
                void handleCancelConfirm();
              },
          },
        ],
      );
    }, [
      canCancel,
      handleCancelConfirm,
      isBusy,
    ]);

  /* ==========================================================
     CLOSED ORDER
  ========================================================== */

  if (
    isClosed
  ) {
    return null;
  }

  /* ==========================================================
     INVALID ORDER
  ========================================================== */

  if (
    !normalizedOrderId
  ) {
    return (
      <View
        accessible
        accessibilityLabel="Order actions are unavailable"
        style={
          styles.invalidBox
        }
      >
        <AppIcon
          name="error"
          size="xs"
          color={
            Colors.error
          }
        />

        <AppText
          variant="caption"
          weight="medium"
          style={
            styles.invalidText
          }
        >
          Order actions are unavailable.
        </AppText>
      </View>
    );
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
          PRIMARY
      ====================================================== */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          primaryConfig.label
        }
        accessibilityHint={
          normalizedStatus ===
          "pending"
            ? "Accept this market order"
            : normalizedStatus ===
                "accepted"
              ? "Mark this order as on the way"
              : "Mark this order as delivered"
        }
        accessibilityState={{
          disabled:
            isBusy,

          busy:
            busyAction ===
            "primary",
        }}
        disabled={
          isBusy
        }
        onPress={
          handlePrimaryAction
        }
        style={({
          pressed,
        }) => [
          styles.button,
          styles.primaryButton,

          isBusy
            ? styles.disabled
            : null,

          pressed &&
          !isBusy
            ? styles.pressed
            : null,
        ]}
      >
        {busyAction ===
        "primary" ? (
          <ActivityIndicator
            size="small"
            color="#FFFFFF"
          />
        ) : (
          <AppIcon
            name={
              primaryConfig.icon
            }
            size="xs"
            color="#FFFFFF"
          />
        )}

        <AppText
          variant="bodyMedium"
          weight="bold"
          numberOfLines={1}
          style={
            styles.primaryText
          }
        >
          {primaryConfig.label}
        </AppText>
      </Pressable>

      {/* ======================================================
          CANCEL
      ====================================================== */}

      {canCancel ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel order"
          accessibilityHint="Cancel this market order"
          accessibilityState={{
            disabled:
              isBusy,

            busy:
              busyAction ===
              "cancel",
          }}
          disabled={
            isBusy
          }
          onPress={
            handleCancelPress
          }
          style={({
            pressed,
          }) => [
            styles.button,
            styles.cancelButton,

            isBusy
              ? styles.disabled
              : null,

            pressed &&
            !isBusy
              ? styles.pressed
              : null,
          ]}
        >
          {busyAction ===
          "cancel" ? (
            <ActivityIndicator
              size="small"
              color={
                Colors.error
              }
            />
          ) : (
            <AppIcon
              name="close"
              size="xs"
              color={
                Colors.error
              }
            />
          )}

          <AppText
            variant="bodyMedium"
            weight="medium"
            numberOfLines={1}
            style={
              styles.cancelText
            }
          >
            Cancel order
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

WorkerMarketOrderActions.displayName =
  "WorkerMarketOrderActions";

export default memo(
  WorkerMarketOrderActions,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width:
        "100%",

      marginTop:
        FixxamTokens.spacing.xs,

      marginBottom:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       BUTTON
    ======================================================== */

    button: {
      minWidth:
        0,

      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderRadius:
        FixxamTokens.radius.md,
    },

    /* ========================================================
       PRIMARY
    ======================================================== */

    primaryButton: {
      flex:
        1.35,

      borderColor:
        WorkerColors.primary,

      backgroundColor:
        WorkerColors.primary,
    },

    primaryText: {
      flexShrink:
        1,

      textAlign:
        "center",

      color:
        "#FFFFFF",
    },

    /* ========================================================
       CANCEL
    ======================================================== */

    cancelButton: {
      flex:
        1,

      borderColor:
        Colors.error,

      backgroundColor:
        Colors.surface,
    },

    cancelText: {
      flexShrink:
        1,

      textAlign:
        "center",

      color:
        Colors.error,
    },

    /* ========================================================
       INVALID
    ======================================================== */

    invalidBox: {
      width:
        "100%",

      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.xs,

      marginBottom:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.error,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.errorSoft,
    },

    invalidText: {
      flexShrink:
        1,

      color:
        Colors.error,
    },

    /* ========================================================
       STATES
    ======================================================== */

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