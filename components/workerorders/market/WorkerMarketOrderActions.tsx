import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  View,
} from "react-native";

import {
  doc,
  onSnapshot,
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
};

type MarketOrderAction =
  | "accept"
  | "on-the-way"
  | "complete";

type ActionErrorCode =
  | "ORDER_NOT_FOUND"
  | "NOT_ASSIGNED_WORKER"
  | "NOT_MARKET_ORDER"
  | "ORDER_NOT_PENDING"
  | "ORDER_NOT_ACCEPTED"
  | "ORDER_NOT_IN_PROGRESS";

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

function isInProgressStatus(
  value: unknown,
): boolean {
  const normalized =
    normalizeStatus(
      value,
    );

  return (
    normalized ===
      "in-progress" ||
    normalized ===
      "on-the-way"
  );
}

function isCancelledStatus(
  value: unknown,
): boolean {
  const normalized =
    normalizeStatus(
      value,
    );

  return (
    normalized ===
      "cancelled" ||
    normalized ===
      "canceled"
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
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    liveStatus,
    setLiveStatus,
  ] =
    useState<string | null>(
      null,
    );

  const [
    listening,
    setListening,
  ] =
    useState(true);

  const [
    orderExists,
    setOrderExists,
  ] =
    useState<boolean | null>(
      null,
    );

  const [
    listenerFailed,
    setListenerFailed,
  ] =
    useState(false);

  const actionInFlightRef =
    useRef(false);

  /* ==========================================================
     ORDER ID
  ========================================================== */

  const normalizedOrderId =
    useMemo(
      () =>
        orderId.trim(),
      [
        orderId,
      ],
    );

  /* ==========================================================
     LIVE FIRESTORE STATUS
  ========================================================== */

  useEffect(() => {
    if (
      !normalizedOrderId
    ) {
      setLiveStatus(
        null,
      );

      setOrderExists(
        false,
      );

      setListenerFailed(
        false,
      );

      setListening(
        false,
      );

      return;
    }

    setListening(
      true,
    );

    setOrderExists(
      null,
    );

    setListenerFailed(
      false,
    );

    const orderRef =
      doc(
        db,
        "orders",
        normalizedOrderId,
      );

    const unsubscribe =
      onSnapshot(
        orderRef,

        snapshot => {
          if (
            !snapshot.exists()
          ) {
            setLiveStatus(
              null,
            );

            setOrderExists(
              false,
            );

            setListenerFailed(
              false,
            );

            setListening(
              false,
            );

            return;
          }

          const nextStatus =
            normalizeStatus(
              snapshot.data()
                .status,
            );

          setLiveStatus(
            nextStatus,
          );

          setOrderExists(
            true,
          );

          setListenerFailed(
            false,
          );

          setListening(
            false,
          );
        },

        listenerError => {
          console.error(
            "FIXXAM_WORKER_MARKET_ORDER_LISTENER_ERROR:",
            listenerError,
          );

          /*
           * Only when the listener itself fails do we
           * temporarily fall back to the status prop.
           */
          setLiveStatus(
            null,
          );

          setOrderExists(
            null,
          );

          setListenerFailed(
            true,
          );

          setListening(
            false,
          );
        },
      );

    return unsubscribe;
  }, [
    normalizedOrderId,
  ]);

  /* ==========================================================
     EFFECTIVE STATUS
  ========================================================== */

  const effectiveStatus =
    listenerFailed
      ? normalizeStatus(
          status,
        )
      : liveStatus ??
        "";

  const isPending =
    effectiveStatus ===
    "pending";

  const isAccepted =
    effectiveStatus ===
    "accepted";

  const isInProgress =
    isInProgressStatus(
      effectiveStatus,
    );

  const isCompleted =
    effectiveStatus ===
    "completed";

  const isCancelled =
    isCancelledStatus(
      effectiveStatus,
    );

  const isExpired =
    effectiveStatus ===
    "expired";

  /* ==========================================================
     VALIDATION
  ========================================================== */

  const validateWorker =
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

      if (
        !normalizedOrderId
      ) {
        Toast.show({
          type: "error",

          text1:
            "Invalid order",

          text2:
            "Order ID is missing.",
        });

        return null;
      }

      return {
        orderId:
          normalizedOrderId,

        workerId:
          user.uid,
      };
    }, [
      normalizedOrderId,
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
          validateWorker();

        if (!validation) {
          return;
        }

        actionInFlightRef.current =
          true;

        setSubmitting(
          true,
        );

        try {
          await updateMarketOrder(
            validation.orderId,
            validation.workerId,
            action,
          );

          showActionSuccess(
            action,
          );
        } catch (error) {
          console.error(
            `FIXXAM_WORKER_MARKET_ORDER_${action
              .replace(
                /-/g,
                "_",
              )
              .toUpperCase()}_ERROR:`,
            error,
          );

          handleActionError(
            error,
            action,
          );
        } finally {
          actionInFlightRef.current =
            false;

          setSubmitting(
            false,
          );
        }
      },
      [
        validateWorker,
      ],
    );

  /* ==========================================================
     ACCEPT
  ========================================================== */

  const handleAccept =
    useCallback(() => {
      void runAction(
        "accept",
      );
    }, [
      runAction,
    ]);

  /* ==========================================================
     ON THE WAY
  ========================================================== */

  const handleOnTheWay =
    useCallback(() => {
      void runAction(
        "on-the-way",
      );
    }, [
      runAction,
    ]);

  /* ==========================================================
     COMPLETE CONFIRMATION
  ========================================================== */

  const handleComplete =
    useCallback(() => {
      if (
        actionInFlightRef.current
      ) {
        return;
      }

      Alert.alert(
        "Complete Order?",

        "Only complete this order after delivery and payment or order settlement have been properly handled.",

        [
          {
            text:
              "Cancel",

            style:
              "cancel",
          },

          {
            text:
              "Complete Order",

            onPress:
              () => {
                void runAction(
                  "complete",
                );
              },
          },
        ],
      );
    }, [
      runAction,
    ]);

  /* ==========================================================
     LOADING
  ========================================================== */

  if (listening) {
    return (
      <View
        style={
          styles.container
        }
      >
        <View
          style={
            styles.loadingNotice
          }
        >
          <ActivityIndicator
            size="small"
            color={
              WorkerColors.primary
            }
          />

          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.loadingText
            }
          >
            Checking order status...
          </AppText>
        </View>
      </View>
    );
  }

  /* ==========================================================
     ORDER NOT FOUND
  ========================================================== */

  if (
    orderExists === false
  ) {
    return (
      <View
        style={
          styles.container
        }
      >
        <View
          style={[
            styles.stateNotice,
            styles.closedNotice,
          ]}
        >
          <View
            style={
              styles.stateIcon
            }
          >
            <AppIcon
              name="error"
              size="sm"
              color={
                Colors.error
              }
            />
          </View>

          <View
            style={
              styles.stateContent
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.stateTitle
              }
            >
              Order unavailable
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.stateText
              }
            >
              This order may have been removed or is no longer available.
            </AppText>
          </View>
        </View>
      </View>
    );
  }

  /* ==========================================================
     COMPLETED
  ========================================================== */

  if (isCompleted) {
    return (
      <View
        style={
          styles.container
        }
      >
        <View
          style={[
            styles.stateNotice,
            styles.completedNotice,
          ]}
        >
          <View
            style={
              styles.stateIcon
            }
          >
            <AppIcon
              name="success"
              size="md"
              color={
                Colors.success
              }
            />
          </View>

          <View
            style={
              styles.stateContent
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.stateTitle
              }
            >
              Order completed
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.stateText
              }
            >
              This market order has been successfully completed.
            </AppText>
          </View>
        </View>
      </View>
    );
  }

  /* ==========================================================
     CANCELLED / EXPIRED
  ========================================================== */

  if (
    isCancelled ||
    isExpired
  ) {
    return (
      <View
        style={
          styles.container
        }
      >
        <View
          style={[
            styles.stateNotice,
            styles.closedNotice,
          ]}
        >
          <View
            style={
              styles.stateIcon
            }
          >
            <AppIcon
              name={
                isCancelled
                  ? "error"
                  : "clock"
              }
              size="md"
              color={
                isCancelled
                  ? Colors.error
                  : Colors.textSecondary
              }
            />
          </View>

          <View
            style={
              styles.stateContent
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.stateTitle
              }
            >
              {isCancelled
                ? "Order cancelled"
                : "Order expired"}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.stateText
              }
            >
              No further action is available for this order.
            </AppText>
          </View>
        </View>
      </View>
    );
  }

  /* ==========================================================
     PENDING
  ========================================================== */

  if (isPending) {
    return (
      <View
        style={
          styles.container
        }
      >
        <View
          style={[
            styles.stateNotice,
            styles.pendingNotice,
          ]}
        >
          <View
            style={
              styles.stateIcon
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
              styles.stateContent
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.stateTitle
              }
            >
              New market order
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.stateText
              }
            >
              Review the products and delivery information before accepting this order.
            </AppText>
          </View>
        </View>

        <AppButton
          title={
            submitting
              ? "ACCEPTING..."
              : "ACCEPT ORDER"
          }
          role="worker"
          variant="primary"
          leftIconName="check"
          loading={
            submitting
          }
          disabled={
            submitting
          }
          onPress={
            handleAccept
          }
          style={
            styles.actionButton
          }
        />
      </View>
    );
  }

  /* ==========================================================
     ACCEPTED
  ========================================================== */

  if (isAccepted) {
    return (
      <View
        style={
          styles.container
        }
      >
        <View
          style={[
            styles.stateNotice,
            styles.acceptedNotice,
          ]}
        >
          <View
            style={
              styles.stateIcon
            }
          >
            <AppIcon
              name="success"
              size="sm"
              color={
                Colors.success
              }
            />
          </View>

          <View
            style={
              styles.stateContent
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.stateTitle
              }
            >
              Order accepted
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.stateText
              }
            >
              You have accepted this order. Start the delivery when you are ready.
            </AppText>
          </View>
        </View>

        <AppButton
          title={
            submitting
              ? "UPDATING..."
              : "ON THE WAY"
          }
          role="worker"
          variant="primary"
          leftIconName="navigation"
          loading={
            submitting
          }
          disabled={
            submitting
          }
          onPress={
            handleOnTheWay
          }
          style={
            styles.actionButton
          }
        />
      </View>
    );
  }

  /* ==========================================================
     IN PROGRESS
  ========================================================== */

  if (isInProgress) {
    return (
      <View
        style={
          styles.container
        }
      >
        {/* ====================================================
            DELIVERY STATUS
        ==================================================== */}

        <View
          style={[
            styles.stateNotice,
            styles.progressNotice,
          ]}
        >
          <View
            style={
              styles.stateIcon
            }
          >
            <AppIcon
              name="navigation"
              role="worker"
              size="sm"
              color={
                WorkerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.stateContent
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.stateTitle
              }
            >
              Order is on the way
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.stateText
              }
            >
              The customer can now track this order.
            </AppText>
          </View>
        </View>

        {/* ====================================================
            WARNING
        ==================================================== */}

        <View
          style={[
            styles.stateNotice,
            styles.warningNotice,
          ]}
        >
          <View
            style={
              styles.stateIcon
            }
          >
            <AppIcon
              name="warning"
              size="sm"
              color={
                Colors.warning
              }
            />
          </View>

          <View
            style={
              styles.stateContent
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.stateTitle
              }
            >
              Before completing
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.stateText
              }
            >
              Only complete the order after delivery and payment or order settlement have been properly handled.
            </AppText>
          </View>
        </View>

        {/* ====================================================
            COMPLETE
        ==================================================== */}

        <AppButton
          title={
            submitting
              ? "COMPLETING..."
              : "COMPLETE ORDER"
          }
          role="worker"
          variant="primary"
          leftIconName="success"
          loading={
            submitting
          }
          disabled={
            submitting
          }
          onPress={
            handleComplete
          }
          style={
            styles.actionButton
          }
        />
      </View>
    );
  }

  /* ==========================================================
     UNKNOWN
  ========================================================== */

  return (
    <View
      style={
        styles.container
      }
    >
      <View
        style={
          styles.unknownNotice
        }
      >
        <AppIcon
          name="info"
          size="sm"
          color={
            Colors.textSecondary
          }
        />

        <AppText
          variant="body"
          tone="secondary"
          style={
            styles.unknownText
          }
        >
          This order is not available for worker action.
        </AppText>
      </View>
    </View>
  );
}

/* ============================================================
   FIRESTORE TRANSACTION
============================================================ */

async function updateMarketOrder(
  orderId: string,
  workerId: string,
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

      /* ========================================================
         WORKER OWNERSHIP
      ======================================================== */

      const assignedWorkerId =
        typeof data.workerId ===
        "string"
          ? data.workerId.trim()
          : "";

      if (
        !assignedWorkerId ||
        assignedWorkerId !==
          workerId
      ) {
        throw new Error(
          "NOT_ASSIGNED_WORKER",
        );
      }

      /* ========================================================
         MARKET ORDER
      ======================================================== */

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

      /* ========================================================
         CURRENT STATUS
      ======================================================== */

      const currentStatus =
        normalizeStatus(
          data.status,
        );

      /* ========================================================
         ACCEPT
      ======================================================== */

      if (
        action ===
        "accept"
      ) {
        if (
          currentStatus !==
          "pending"
        ) {
          throw new Error(
            "ORDER_NOT_PENDING",
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
              workerId,

            acceptedAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),
          },
        );

        return;
      }

      /* ========================================================
         ON THE WAY
      ======================================================== */

      if (
        action ===
        "on-the-way"
      ) {
        if (
          currentStatus !==
          "accepted"
        ) {
          throw new Error(
            "ORDER_NOT_ACCEPTED",
          );
        }

        transaction.update(
          orderRef,
          {
            status:
              "in-progress",

            offerStatus:
              "in-progress",

            onTheWayBy:
              workerId,

            onTheWayAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),
          },
        );

        return;
      }

      /* ========================================================
         COMPLETE
      ======================================================== */

      if (
        currentStatus !==
          "in-progress" &&
        currentStatus !==
          "on-the-way"
      ) {
        throw new Error(
          "ORDER_NOT_IN_PROGRESS",
        );
      }

      transaction.update(
        orderRef,
        {
          status:
            "completed",

          offerStatus:
            "completed",

          completedBy:
            workerId,

          completedAt:
            serverTimestamp(),

          completionConfirmed:
            true,

          updatedAt:
            serverTimestamp(),
        },
      );
    },
  );
}

/* ============================================================
   SUCCESS
============================================================ */

function showActionSuccess(
  action: MarketOrderAction,
): void {
  switch (action) {
    case "accept":
      Toast.show({
        type: "success",

        text1:
          "Order accepted",

        text2:
          "The order is now ready for delivery.",
      });

      return;

    case "on-the-way":
      Toast.show({
        type: "success",

        text1:
          "Order is on the way",

        text2:
          "The customer can now track the order.",
      });

      return;

    case "complete":
      Toast.show({
        type: "success",

        text1:
          "Order completed",

        text2:
          "The order has been marked as completed.",
      });
  }
}

/* ============================================================
   ERROR HANDLER
============================================================ */

function handleActionError(
  error: unknown,
  action: MarketOrderAction,
): void {
  const errorCode =
    error instanceof Error
      ? (error.message as ActionErrorCode)
      : "";

  switch (errorCode) {
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

    case "NOT_MARKET_ORDER":
      Toast.show({
        type: "error",

        text1:
          "Invalid order",

        text2:
          "This is not a market order.",
      });

      return;

    case "ORDER_NOT_PENDING":
      Toast.show({
        type: "info",

        text1:
          "Order already updated",

        text2:
          "The order has already been processed.",
      });

      return;

    case "ORDER_NOT_ACCEPTED":
      Toast.show({
        type: "info",

        text1:
          "Order already updated",

        text2:
          "The order is no longer waiting for this action.",
      });

      return;

    case "ORDER_NOT_IN_PROGRESS":
      Toast.show({
        type: "info",

        text1:
          "Order already updated",

        text2:
          "This order is not currently on the way.",
      });

      return;

    default:
      Toast.show({
        type: "error",

        text1:
          action ===
          "accept"
            ? "Unable to accept order"
            : action ===
                "complete"
              ? "Unable to complete order"
              : "Unable to update order",

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
    container: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       LOADING
    ======================================================== */

    loadingNotice: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        WorkerColors.primarySoft,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    loadingText: {
      color:
        Colors.textSecondary,
    },

    /* ========================================================
       STATE NOTICE
    ======================================================== */

    stateNotice: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderRadius:
        FixxamTokens.radius.lg,
    },

    pendingNotice: {
      borderColor:
        Colors.warning,

      backgroundColor:
        Colors.warningSoft,
    },

    acceptedNotice: {
      borderColor:
        Colors.success,

      backgroundColor:
        Colors.successSoft,
    },

    progressNotice: {
      borderColor:
        WorkerColors.primary,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    warningNotice: {
      borderColor:
        Colors.warning,

      backgroundColor:
        Colors.warningSoft,
    },

    completedNotice: {
      borderColor:
        Colors.success,

      backgroundColor:
        Colors.successSoft,
    },

    closedNotice: {
      borderColor:
        Colors.border,

      backgroundColor:
        Colors.disabledBackground,
    },

    stateIcon: {
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

    stateContent: {
      flex: 1,

      minWidth: 0,
    },

    stateTitle: {
      color:
        Colors.textPrimary,
    },

    stateText: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       ACTION
    ======================================================== */

    actionButton: {
      width: "100%",
    },

    /* ========================================================
       UNKNOWN
    ======================================================== */

    unknownNotice: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.disabledBackground,
    },

    unknownText: {
      flex: 1,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },
  });