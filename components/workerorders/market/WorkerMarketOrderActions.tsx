import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  doc,
  onSnapshot,
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

type WorkerMarketOrderActionsProps = {
  orderId: string;
  status?: string;
};

/* ============================================================
   HELPERS
============================================================ */

function normalizeStatus(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value
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
  const status =
    normalizeStatus(value);

  return (
    status ===
      "in-progress" ||
    status ===
      "on-the-way"
  );
}

function isCancelledStatus(
  value: unknown,
): boolean {
  const status =
    normalizeStatus(value);

  return (
    status ===
      "cancelled" ||
    status ===
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
  ] = useState(false);

  const [
    liveStatus,
    setLiveStatus,
  ] = useState<string>(
    normalizeStatus(status),
  );

  const [
    listening,
    setListening,
  ] = useState(true);

  /* ==========================================================
     NORMALIZED ORDER ID
  ========================================================== */

  const normalizedOrderId =
    orderId.trim();

  /* ==========================================================
     LIVE FIRESTORE STATUS
     
     IMPORTANT:
     Do not rely only on the status prop.
     Firestore is the source of truth.
  ========================================================== */

  useEffect(() => {
    if (!normalizedOrderId) {
      setLiveStatus("");
      setListening(false);
      return;
    }

    setListening(true);

    const orderRef =
      doc(
        db,
        "orders",
        normalizedOrderId,
      );

    const unsubscribe =
      onSnapshot(
        orderRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            setLiveStatus("");
            setListening(false);
            return;
          }

          const data =
            snapshot.data();

          setLiveStatus(
            normalizeStatus(
              data.status,
            ),
          );

          setListening(false);
        },
        (error) => {
          console.error(
            "FIXXAM_WORKER_MARKET_ORDER_LISTENER_ERROR:",
            error,
          );

          /*
           * Keep the prop as a temporary fallback if
           * Firestore listener has a problem.
           */
          setLiveStatus(
            normalizeStatus(
              status,
            ),
          );

          setListening(false);
        },
      );

    return () => {
      unsubscribe();
    };
  }, [
    normalizedOrderId,
    status,
  ]);

  /* ==========================================================
     EFFECTIVE STATUS
  ========================================================== */

  const effectiveStatus =
    liveStatus ||
    normalizeStatus(status);

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
     COMMON VALIDATION
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

      if (!normalizedOrderId) {
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
        user,
        normalizedOrderId,
      };
    }, [
      normalizedOrderId,
    ]);

  /* ==========================================================
     ACCEPT ORDER
  ========================================================== */

  const handleAccept =
    useCallback(async () => {
      if (submitting) {
        return;
      }

      const validation =
        validateWorker();

      if (!validation) {
        return;
      }

      const {
        user,
        normalizedOrderId,
      } = validation;

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

            /* ----------------------------------------------
               WORKER OWNERSHIP
            ---------------------------------------------- */

            const workerId =
              typeof data.workerId ===
              "string"
                ? data.workerId.trim()
                : "";

            if (
              !workerId ||
              workerId !==
                user.uid
            ) {
              throw new Error(
                "NOT_ASSIGNED_WORKER",
              );
            }

            /* ----------------------------------------------
               MARKET ORDER
            ---------------------------------------------- */

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

            /* ----------------------------------------------
               CURRENT FIRESTORE STATUS
               
               This is the real source of truth.
            ---------------------------------------------- */

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

            /* ----------------------------------------------
               ACCEPT
            ---------------------------------------------- */

            transaction.update(
              orderRef,
              {
                status:
                  "accepted",

                offerStatus:
                  "accepted",

                acceptedBy:
                  user.uid,

                acceptedAt:
                  serverTimestamp(),

                updatedAt:
                  serverTimestamp(),
              },
            );
          },
        );

        Toast.show({
          type: "success",
          text1:
            "Order accepted",
          text2:
            "The order is now ready for delivery.",
        });
      } catch (error) {
        console.error(
          "FIXXAM_WORKER_ACCEPT_MARKET_ORDER_ERROR:",
          error,
        );

        const errorCode =
          error instanceof Error
            ? error.message
            : "";

        switch (
          errorCode
        ) {
          case "ORDER_NOT_FOUND":
            Toast.show({
              type: "error",
              text1:
                "Order not found",
              text2:
                "This order may have been removed.",
            });
            break;

          case "NOT_ASSIGNED_WORKER":
            Toast.show({
              type: "error",
              text1:
                "Permission denied",
              text2:
                "You are not assigned to this order.",
            });
            break;

          case "ORDER_NOT_PENDING":
            Toast.show({
              type: "info",
              text1:
                "Order already updated",
              text2:
                "The order has already been processed.",
            });
            break;

          case "NOT_MARKET_ORDER":
            Toast.show({
              type: "error",
              text1:
                "Invalid order",
              text2:
                "This is not a market order.",
            });
            break;

          default:
            Toast.show({
              type: "error",
              text1:
                "Unable to accept order",
              text2:
                "Please check your connection and try again.",
            });
        }
      } finally {
        setSubmitting(false);
      }
    }, [
      submitting,
      validateWorker,
    ]);

  /* ==========================================================
     ON THE WAY
  ========================================================== */

  const handleOnTheWay =
    useCallback(async () => {
      if (submitting) {
        return;
      }

      const validation =
        validateWorker();

      if (!validation) {
        return;
      }

      const {
        user,
        normalizedOrderId,
      } = validation;

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

            /* ----------------------------------------------
               WORKER OWNERSHIP
            ---------------------------------------------- */

            const workerId =
              typeof data.workerId ===
              "string"
                ? data.workerId.trim()
                : "";

            if (
              !workerId ||
              workerId !==
                user.uid
            ) {
              throw new Error(
                "NOT_ASSIGNED_WORKER",
              );
            }

            /* ----------------------------------------------
               MARKET ORDER
            ---------------------------------------------- */

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

            /* ----------------------------------------------
               CURRENT STATUS
            ---------------------------------------------- */

            const currentStatus =
              normalizeStatus(
                data.status,
              );

            if (
              currentStatus !==
              "accepted"
            ) {
              throw new Error(
                "ORDER_NOT_ACCEPTED",
              );
            }

            /* ----------------------------------------------
               ON THE WAY
            ---------------------------------------------- */

            transaction.update(
              orderRef,
              {
                status:
                  "in-progress",

                offerStatus:
                  "in-progress",

                onTheWayBy:
                  user.uid,

                onTheWayAt:
                  serverTimestamp(),

                updatedAt:
                  serverTimestamp(),
              },
            );
          },
        );

        Toast.show({
          type: "success",
          text1:
            "Order is on the way",
          text2:
            "The customer can now track the order.",
        });
      } catch (error) {
        console.error(
          "FIXXAM_WORKER_ON_THE_WAY_MARKET_ORDER_ERROR:",
          error,
        );

        const errorCode =
          error instanceof Error
            ? error.message
            : "";

        switch (
          errorCode
        ) {
          case "ORDER_NOT_FOUND":
            Toast.show({
              type: "error",
              text1:
                "Order not found",
              text2:
                "This order may have been removed.",
            });
            break;

          case "NOT_ASSIGNED_WORKER":
            Toast.show({
              type: "error",
              text1:
                "Permission denied",
              text2:
                "You are not assigned to this order.",
            });
            break;

          case "ORDER_NOT_ACCEPTED":
            Toast.show({
              type: "info",
              text1:
                "Order already updated",
              text2:
                "The order is no longer waiting for this action.",
            });
            break;

          case "NOT_MARKET_ORDER":
            Toast.show({
              type: "error",
              text1:
                "Invalid order",
              text2:
                "This is not a market order.",
            });
            break;

          default:
            Toast.show({
              type: "error",
              text1:
                "Unable to update order",
              text2:
                "Please check your connection and try again.",
            });
        }
      } finally {
        setSubmitting(false);
      }
    }, [
      submitting,
      validateWorker,
    ]);

  /* ==========================================================
     COMPLETE ORDER
  ========================================================== */

  const completeOrder =
    useCallback(async () => {
      if (submitting) {
        return;
      }

      const validation =
        validateWorker();

      if (!validation) {
        return;
      }

      const {
        user,
        normalizedOrderId,
      } = validation;

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

            /* ----------------------------------------------
               WORKER OWNERSHIP
            ---------------------------------------------- */

            const workerId =
              typeof data.workerId ===
              "string"
                ? data.workerId.trim()
                : "";

            if (
              !workerId ||
              workerId !==
                user.uid
            ) {
              throw new Error(
                "NOT_ASSIGNED_WORKER",
              );
            }

            /* ----------------------------------------------
               MARKET ORDER
            ---------------------------------------------- */

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

            /* ----------------------------------------------
               CURRENT STATUS
            ---------------------------------------------- */

            const currentStatus =
              normalizeStatus(
                data.status,
              );

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

            /* ----------------------------------------------
               COMPLETE
            ---------------------------------------------- */

            transaction.update(
              orderRef,
              {
                status:
                  "completed",

                offerStatus:
                  "completed",

                completedBy:
                  user.uid,

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

        Toast.show({
          type: "success",
          text1:
            "Order completed",
          text2:
            "The order has been marked as completed.",
        });
      } catch (error) {
        console.error(
          "FIXXAM_WORKER_COMPLETE_MARKET_ORDER_ERROR:",
          error,
        );

        const errorCode =
          error instanceof Error
            ? error.message
            : "";

        switch (
          errorCode
        ) {
          case "ORDER_NOT_FOUND":
            Toast.show({
              type: "error",
              text1:
                "Order not found",
              text2:
                "This order may have been removed.",
            });
            break;

          case "NOT_ASSIGNED_WORKER":
            Toast.show({
              type: "error",
              text1:
                "Permission denied",
              text2:
                "You are not assigned to this order.",
            });
            break;

          case "ORDER_NOT_IN_PROGRESS":
            Toast.show({
              type: "info",
              text1:
                "Order already updated",
              text2:
                "This order is not currently on the way.",
            });
            break;

          case "NOT_MARKET_ORDER":
            Toast.show({
              type: "error",
              text1:
                "Invalid order",
              text2:
                "This is not a market order.",
            });
            break;

          default:
            Toast.show({
              type: "error",
              text1:
                "Unable to complete order",
              text2:
                "Please check your connection and try again.",
            });
        }
      } finally {
        setSubmitting(false);
      }
    }, [
      submitting,
      validateWorker,
    ]);

  /* ==========================================================
     COMPLETE CONFIRMATION
  ========================================================== */

  const handleComplete =
    useCallback(() => {
      if (submitting) {
        return;
      }

      Alert.alert(
        "Complete Order?",
        "If you are sure this order is already settled, press Complete Order to finish this order.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Complete Order",
            style: "destructive",
            onPress: () => {
              void completeOrder();
            },
          },
        ],
      );
    }, [
      completeOrder,
      submitting,
    ]);

  /* ==========================================================
     LISTENER LOADING
  ========================================================== */

  if (
    listening &&
    !effectiveStatus
  ) {
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
            color="#2563EB"
          />

          <AppText
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
     COMPLETED / CANCELLED / EXPIRED
  ========================================================== */

  if (
    isCompleted ||
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
            styles.finalNotice,
            isCompleted &&
              styles.completedNotice,
            (isCancelled ||
              isExpired) &&
              styles.closedNotice,
          ]}
        >
          <View
            style={
              styles.finalIcon
            }
          >
            <Ionicons
              name={
                isCompleted
                  ? "checkmark-circle"
                  : isCancelled
                    ? "close-circle"
                    : "hourglass"
              }
              size={22}
              color={
                isCompleted
                  ? "#15803D"
                  : isCancelled
                    ? "#B91C1C"
                    : "#64748B"
              }
            />
          </View>

          <View
            style={
              styles.finalContent
            }
          >
            <AppText
              weight="bold"
              style={
                styles.finalTitle
              }
            >
              {isCompleted
                ? "Order completed"
                : isCancelled
                  ? "Order cancelled"
                  : "Order expired"}
            </AppText>

            <AppText
              style={
                styles.finalText
              }
            >
              {isCompleted
                ? "This market order has been successfully completed."
                : "No further action is available for this order."}
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
          style={
            styles.notice
          }
        >
          <View
            style={
              styles.noticeIcon
            }
          >
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#D97706"
            />
          </View>

          <View
            style={
              styles.noticeContent
            }
          >
            <AppText
              weight="bold"
              style={
                styles.noticeTitle
              }
            >
              New market order
            </AppText>

            <AppText
              style={
                styles.noticeText
              }
            >
              Review the products and
              delivery information before
              accepting this order.
            </AppText>
          </View>
        </View>

        <Pressable
          disabled={
            submitting
          }
          onPress={
            handleAccept
          }
          style={({ pressed }) => [
            styles.primaryButton,

            pressed &&
              !submitting &&
              styles.pressed,

            submitting &&
              styles.disabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Accept market order"
          accessibilityState={{
            disabled:
              submitting,
            busy:
              submitting,
          }}
        >
          {submitting ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <Ionicons
              name="checkmark-circle-outline"
              size={22}
              color="#FFFFFF"
            />
          )}

          <AppText
            weight="bold"
            style={
              styles.primaryButtonText
            }
          >
            {submitting
              ? "ACCEPTING..."
              : "ACCEPT ORDER"}
          </AppText>
        </Pressable>
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
          style={
            styles.readyNotice
          }
        >
          <View
            style={
              styles.readyIcon
            }
          >
            <Ionicons
              name="checkmark-circle"
              size={21}
              color="#15803D"
            />
          </View>

          <View
            style={
              styles.noticeContent
            }
          >
            <AppText
              weight="bold"
              style={
                styles.readyTitle
              }
            >
              Order accepted
            </AppText>

            <AppText
              style={
                styles.readyText
              }
            >
              You have accepted this order.
              Start the delivery when you
              are ready.
            </AppText>
          </View>
        </View>

        <Pressable
          disabled={
            submitting
          }
          onPress={
            handleOnTheWay
          }
          style={({ pressed }) => [
            styles.primaryButton,

            pressed &&
              !submitting &&
              styles.pressed,

            submitting &&
              styles.disabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Mark order as on the way"
          accessibilityState={{
            disabled:
              submitting,
            busy:
              submitting,
          }}
        >
          {submitting ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <Ionicons
              name="navigate-outline"
              size={22}
              color="#FFFFFF"
            />
          )}

          <AppText
            weight="bold"
            style={
              styles.primaryButtonText
            }
          >
            {submitting
              ? "UPDATING..."
              : "ON THE WAY"}
          </AppText>
        </Pressable>
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
        <View
          style={
            styles.deliveryNotice
          }
        >
          <View
            style={
              styles.deliveryIcon
            }
          >
            <Ionicons
              name="navigate"
              size={21}
              color="#2563EB"
            />
          </View>

          <View
            style={
              styles.noticeContent
            }
          >
            <AppText
              weight="bold"
              style={
                styles.deliveryTitle
              }
            >
              Order is on the way
            </AppText>

            <AppText
              style={
                styles.deliveryText
              }
            >
              The customer can now track
              this order.
            </AppText>
          </View>
        </View>

        {/* ====================================================
            WARNING
        ==================================================== */}

        <View
          style={
            styles.warning
          }
        >
          <View
            style={
              styles.warningIcon
            }
          >
            <Ionicons
              name="warning-outline"
              size={20}
              color="#B45309"
            />
          </View>

          <View
            style={
              styles.warningContent
            }
          >
            <AppText
              weight="bold"
              style={
                styles.warningTitle
              }
            >
              Before completing
            </AppText>

            <AppText
              style={
                styles.warningText
              }
            >
              If you are sure this order has
              already been delivered and the
              payment/order settlement has
              been properly handled, you can
              complete the order.
            </AppText>
          </View>
        </View>

        {/* ====================================================
            COMPLETE
        ==================================================== */}

        <Pressable
          disabled={
            submitting
          }
          onPress={
            handleComplete
          }
          style={({ pressed }) => [
            styles.completeButton,

            pressed &&
              !submitting &&
              styles.pressed,

            submitting &&
              styles.disabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Complete order"
          accessibilityState={{
            disabled:
              submitting,
            busy:
              submitting,
          }}
        >
          {submitting ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <Ionicons
              name="checkmark-done-circle-outline"
              size={22}
              color="#FFFFFF"
            />
          )}

          <AppText
            weight="bold"
            style={
              styles.primaryButtonText
            }
          >
            {submitting
              ? "COMPLETING..."
              : "COMPLETE ORDER"}
          </AppText>
        </Pressable>
      </View>
    );
  }

  /* ==========================================================
     UNKNOWN STATUS
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
        <Ionicons
          name="alert-circle-outline"
          size={20}
          color="#64748B"
        />

        <AppText
          style={
            styles.unknownText
          }
        >
          This order is not available for
          worker action.
        </AppText>
      </View>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      marginBottom: 12,
    },

    /* ========================================================
       LOADING
    ======================================================== */

    loadingNotice: {
      minHeight: 48,
      paddingHorizontal: 14,
      borderRadius: 14,
      backgroundColor:
        "#EFF6FF",
      borderWidth: 1,
      borderColor:
        "#BFDBFE",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 9,
    },

    loadingText: {
      fontSize: 10,
      color: "#475569",
    },

    /* ========================================================
       PENDING NOTICE
    ======================================================== */

    notice: {
      flexDirection:
        "row",
      padding: 14,
      marginBottom: 10,
      borderRadius: 17,
      backgroundColor:
        "#FFF7E8",
      borderWidth: 1,
      borderColor:
        "#FDE68A",
    },

    noticeIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    noticeContent: {
      flex: 1,
      minWidth: 0,
      marginLeft: 10,
    },

    noticeTitle: {
      fontSize: 12,
      color: "#92400E",
    },

    noticeText: {
      marginTop: 4,
      fontSize: 10,
      lineHeight: 16,
      color: "#78716C",
    },

    /* ========================================================
       ACCEPTED
    ======================================================== */

    readyNotice: {
      flexDirection:
        "row",
      padding: 14,
      marginBottom: 10,
      borderRadius: 17,
      backgroundColor:
        "#ECFDF5",
      borderWidth: 1,
      borderColor:
        "#BBF7D0",
    },

    readyIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    readyTitle: {
      fontSize: 12,
      color: "#166534",
    },

    readyText: {
      marginTop: 4,
      fontSize: 10,
      lineHeight: 16,
      color: "#64748B",
    },

    /* ========================================================
       DELIVERY
    ======================================================== */

    deliveryNotice: {
      flexDirection:
        "row",
      padding: 14,
      marginBottom: 10,
      borderRadius: 17,
      backgroundColor:
        "#EFF6FF",
      borderWidth: 1,
      borderColor:
        "#BFDBFE",
    },

    deliveryIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    deliveryTitle: {
      fontSize: 12,
      color: "#1D4ED8",
    },

    deliveryText: {
      marginTop: 4,
      fontSize: 10,
      lineHeight: 16,
      color: "#64748B",
    },

    /* ========================================================
       WARNING
    ======================================================== */

    warning: {
      flexDirection:
        "row",
      padding: 14,
      marginBottom: 10,
      borderRadius: 17,
      backgroundColor:
        "#FFFBEB",
      borderWidth: 1,
      borderColor:
        "#FDE68A",
    },

    warningIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    warningContent: {
      flex: 1,
      minWidth: 0,
      marginLeft: 10,
    },

    warningTitle: {
      fontSize: 12,
      color: "#92400E",
    },

    warningText: {
      marginTop: 4,
      fontSize: 10,
      lineHeight: 16,
      color: "#78716C",
    },

    /* ========================================================
       PRIMARY BUTTON
    ======================================================== */

    primaryButton: {
      minHeight: 55,
      borderRadius: 17,
      backgroundColor:
        "#2563EB",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 8,
    },

    primaryButtonText: {
      fontSize: 12,
      color: "#FFFFFF",
    },

    /* ========================================================
       COMPLETE BUTTON
    ======================================================== */

    completeButton: {
      minHeight: 55,
      borderRadius: 17,
      backgroundColor:
        "#16A34A",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 8,
    },

    /* ========================================================
       FINAL
    ======================================================== */

    finalNotice: {
      flexDirection:
        "row",
      padding: 14,
      borderRadius: 17,
      backgroundColor:
        "#F8FAFC",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    completedNotice: {
      backgroundColor:
        "#ECFDF5",
      borderColor:
        "#BBF7D0",
    },

    closedNotice: {
      backgroundColor:
        "#F8FAFC",
      borderColor:
        "#E2E8F0",
    },

    finalIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    finalContent: {
      flex: 1,
      minWidth: 0,
      marginLeft: 10,
    },

    finalTitle: {
      fontSize: 12,
      color: "#0F172A",
    },

    finalText: {
      marginTop: 4,
      fontSize: 10,
      lineHeight: 16,
      color: "#64748B",
    },

    /* ========================================================
       UNKNOWN
    ======================================================== */

    unknownNotice: {
      minHeight: 48,
      paddingHorizontal: 14,
      borderRadius: 14,
      backgroundColor:
        "#F8FAFC",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 8,
    },

    unknownText: {
      flex: 1,
      fontSize: 10,
      lineHeight: 15,
      color: "#64748B",
    },

    /* ========================================================
       INTERACTION
    ======================================================== */

    pressed: {
      opacity: 0.82,
      transform: [
        {
          scale: 0.99,
        },
      ],
    },

    disabled: {
      opacity: 0.6,
    },
  });