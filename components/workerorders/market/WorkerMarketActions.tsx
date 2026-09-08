import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  Alert,
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
};

type LoadingAction =
  | "accept"
  | "unavailable"
  | null;

type MarketOrderAction =
  | "accept"
  | "unavailable";

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

/* ============================================================
   COMPONENT
============================================================ */

export default function WorkerMarketOrderActions({
  orderId,
  status,
}: WorkerMarketOrderActionsProps) {
  const [
    loadingAction,
    setLoadingAction,
  ] =
    useState<LoadingAction>(
      null,
    );

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

  const busy =
    loadingAction !== null;

  /* ==========================================================
     VALIDATION
  ========================================================== */

  const validateAction =
    useCallback(() => {
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

        return null;
      }

      if (!cleanOrderId) {
        Toast.show({
          type: "error",

          text1:
            "Invalid order",

          text2:
            "Order ID is missing.",
        });

        return null;
      }

      return user;
    }, [
      cleanOrderId,
    ]);

  /* ==========================================================
     ACCEPT
  ========================================================== */

  const handleAccept =
    useCallback(async () => {
      if (busy) {
        return;
      }

      const user =
        validateAction();

      if (!user) {
        return;
      }

      try {
        setLoadingAction(
          "accept",
        );

        await updateMarketOrder(
          cleanOrderId,
          user.uid,
          "accept",
        );

        Toast.show({
          type: "success",

          text1:
            "Order accepted",

          text2:
            "You have accepted this market order.",
        });
      } catch (error) {
        console.error(
          "FIXXAM_WORKER_ACCEPT_MARKET_ORDER_ERROR:",
          error,
        );

        handleActionError(
          error,
          "accept",
        );
      } finally {
        setLoadingAction(
          null,
        );
      }
    }, [
      busy,
      cleanOrderId,
      validateAction,
    ]);

  /* ==========================================================
     UNAVAILABLE CONFIRMATION
  ========================================================== */

  const handleUnavailable =
    useCallback(() => {
      if (busy) {
        return;
      }

      const user =
        validateAction();

      if (!user) {
        return;
      }

      Alert.alert(
        "Product unavailable",

        "Are you sure the requested product is currently unavailable?",

        [
          {
            text:
              "Cancel",

            style:
              "cancel",
          },

          {
            text:
              "Unavailable",

            style:
              "destructive",

            onPress:
              async () => {
                try {
                  setLoadingAction(
                    "unavailable",
                  );

                  await updateMarketOrder(
                    cleanOrderId,
                    user.uid,
                    "unavailable",
                  );

                  Toast.show({
                    type:
                      "success",

                    text1:
                      "Product unavailable",

                    text2:
                      "The customer has been notified.",
                  });
                } catch (error) {
                  console.error(
                    "FIXXAM_WORKER_UNAVAILABLE_MARKET_ORDER_ERROR:",
                    error,
                  );

                  handleActionError(
                    error,
                    "unavailable",
                  );
                } finally {
                  setLoadingAction(
                    null,
                  );
                }
              },
          },
        ],
      );
    }, [
      busy,
      cleanOrderId,
      validateAction,
    ]);

  /* ==========================================================
     HIDDEN WHEN NOT PENDING
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
          NOTICE
      ====================================================== */}

      <View
        style={
          styles.notice
        }
      >
        <View
          style={
            styles.noticeIcon
          }
        >
          <AppIcon
            name="info"
            size="sm"
            color={
              Colors.warning
            }
          />
        </View>

        <View
          style={
            styles.noticeContent
          }
        >
          <AppText
            variant="bodyMedium"
            weight="bold"
            style={
              styles.noticeTitle
            }
          >
            New market order
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.noticeText
            }
          >
            Review the products and delivery information before responding.
          </AppText>
        </View>
      </View>

      {/* ======================================================
          ACCEPT
      ====================================================== */}

      <AppButton
        title={
          loadingAction ===
          "accept"
            ? "ACCEPTING..."
            : "ACCEPT ORDER"
        }
        role="worker"
        variant="primary"
        leftIconName="check"
        loading={
          loadingAction ===
          "accept"
        }
        disabled={
          busy
        }
        onPress={
          handleAccept
        }
        style={
          styles.button
        }
      />

      {/* ======================================================
          UNAVAILABLE
      ====================================================== */}

      <AppButton
        title={
          loadingAction ===
          "unavailable"
            ? "UPDATING..."
            : "UNAVAILABLE"
        }
        role="worker"
        variant="danger"
        leftIconName="error"
        loading={
          loadingAction ===
          "unavailable"
        }
        disabled={
          busy
        }
        onPress={
          handleUnavailable
        }
        style={[
          styles.button,
          styles.unavailableButton,
        ]}
      />
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

      const assignedWorkerId =
        typeof data.workerId ===
        "string"
          ? data.workerId.trim()
          : "";

      const currentStatus =
        normalizeStatus(
          data.status,
        );

      /* ========================================================
         OWNERSHIP
      ======================================================== */

      if (
        assignedWorkerId !==
        workerUid
      ) {
        throw new Error(
          "NOT_ASSIGNED_WORKER",
        );
      }

      /* ========================================================
         STATE TRANSITION
      ======================================================== */

      if (
        currentStatus !==
        "pending"
      ) {
        throw new Error(
          "ORDER_NOT_PENDING",
        );
      }

      /* ========================================================
         ACCEPT
      ======================================================== */

      if (
        action ===
        "accept"
      ) {
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

      /* ========================================================
         UNAVAILABLE
      ======================================================== */

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
          "This order may have been removed.",
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

    case "ORDER_NOT_PENDING":
      Toast.show({
        type: "info",

        text1:
          "Order already updated",

        text2:
          "This order has already been processed.",
      });

      return;

    default:
      Toast.show({
        type: "error",

        text1:
          action ===
          "accept"
            ? "Unable to accept order"
            : "Unable to update order",

        text2:
          "Please try again.",
      });
  }
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.md,

      gap:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       NOTICE
    ======================================================== */

    notice: {
      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      gap:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.warning,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.warningSoft,
    },

    noticeIcon: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    noticeContent: {
      flex: 1,

      minWidth: 0,

      justifyContent:
        "center",
    },

    noticeTitle: {
      color:
        Colors.textPrimary,
    },

    noticeText: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       ACTIONS
    ======================================================== */

    button: {
      width: "100%",
    },

    unavailableButton: {
      marginTop:
        FixxamTokens.spacing.xs,
    },
  });