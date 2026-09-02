import React, {
  useCallback,
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
   CONSTANTS
============================================================ */

const CUSTOMER_UNAVAILABLE_MESSAGE =
  "This product is currently not available. Please try another store.";

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
  ] = useState<
    "accept" | "unavailable" | null
  >(null);

  const isPending =
    status === "pending";

  /* ==========================================================
     ACCEPT
  ========================================================== */

  const handleAccept =
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

      if (!orderId.trim()) {
        Toast.show({
          type: "error",
          text1:
            "Invalid order",
          text2:
            "Order ID is missing.",
        });

        return;
      }

      try {
        setLoadingAction(
          "accept",
        );

        const orderRef =
          doc(
            db,
            "orders",
            orderId.trim(),
          );

        await runTransaction(
          db,
          async (transaction) => {
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

            const workerId =
              typeof data.workerId ===
              "string"
                ? data.workerId.trim()
                : "";

            const currentStatus =
              typeof data.status ===
              "string"
                ? data.status
                    .trim()
                    .toLowerCase()
                : "pending";

            if (
              workerId !==
              user.uid
            ) {
              throw new Error(
                "NOT_ASSIGNED_WORKER",
              );
            }

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
                status: "accepted",
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
    }, [orderId]);

  /* ==========================================================
     UNAVAILABLE
  ========================================================== */

  const handleUnavailable =
    useCallback(() => {
      Alert.alert(
        "Product unavailable",
        "Are you sure the requested product is currently unavailable?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Unavailable",
            style: "destructive",
            onPress: async () => {
              await markUnavailable(
                orderId,
                setLoadingAction,
              );
            },
          },
        ],
      );
    }, [orderId]);

  /* ==========================================================
     HIDDEN WHEN NOT PENDING
  ========================================================== */

  if (!isPending) {
    return null;
  }

  const busy =
    loadingAction !== null;

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
            responding.
          </AppText>
        </View>
      </View>

      {/* ======================================================
          ACCEPT
      ====================================================== */}

      <Pressable
        disabled={busy}
        onPress={
          handleAccept
        }
        style={({ pressed }) => [
          styles.acceptButton,
          pressed &&
            !busy &&
            styles.pressed,
          busy &&
            styles.disabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Accept market order"
        accessibilityState={{
          disabled: busy,
          busy:
            loadingAction ===
            "accept",
        }}
      >
        {loadingAction ===
        "accept" ? (
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
            styles.acceptText
          }
        >
          {loadingAction ===
          "accept"
            ? "ACCEPTING..."
            : "ACCEPT ORDER"}
        </AppText>
      </Pressable>

      {/* ======================================================
          UNAVAILABLE
      ====================================================== */}

      <Pressable
        disabled={busy}
        onPress={
          handleUnavailable
        }
        style={({ pressed }) => [
          styles.unavailableButton,
          pressed &&
            !busy &&
            styles.pressed,
          busy &&
            styles.disabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Mark product unavailable"
        accessibilityState={{
          disabled: busy,
          busy:
            loadingAction ===
            "unavailable",
        }}
      >
        {loadingAction ===
        "unavailable" ? (
          <ActivityIndicator
            size="small"
            color="#B91C1C"
          />
        ) : (
          <Ionicons
            name="close-circle-outline"
            size={21}
            color="#B91C1C"
          />
        )}

        <AppText
          weight="bold"
          style={
            styles.unavailableText
          }
        >
          {loadingAction ===
          "unavailable"
            ? "UPDATING..."
            : "UNAVAILABLE"}
        </AppText>
      </Pressable>
    </View>
  );
}

/* ============================================================
   UNAVAILABLE ACTION
============================================================ */

async function markUnavailable(
  orderId: string,
  setLoadingAction: React.Dispatch<
    React.SetStateAction<
      "accept" |
        "unavailable" |
        null
    >
  >,
) {
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

  if (!orderId.trim()) {
    Toast.show({
      type: "error",
      text1: "Invalid order",
      text2:
        "Order ID is missing.",
    });

    return;
  }

  try {
    setLoadingAction(
      "unavailable",
    );

    const orderRef =
      doc(
        db,
        "orders",
        orderId.trim(),
      );

    await runTransaction(
      db,
      async (transaction) => {
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

        const workerId =
          typeof data.workerId ===
          "string"
            ? data.workerId.trim()
            : "";

        const currentStatus =
          typeof data.status ===
          "string"
            ? data.status
                .trim()
                .toLowerCase()
            : "pending";

        if (
          workerId !==
          user.uid
        ) {
          throw new Error(
            "NOT_ASSIGNED_WORKER",
          );
        }

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
            status: "cancelled",

            offerStatus:
              "cancelled",

            cancellationReason:
              "product_unavailable",

            customerMessage:
              CUSTOMER_UNAVAILABLE_MESSAGE,

            cancelledBy:
              user.uid,

            cancelledAt:
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
}

/* ============================================================
   ERROR HANDLER
============================================================ */

function handleActionError(
  error: unknown,
  action:
    | "accept"
    | "unavailable",
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
          "This order has already been processed.",
      });
      break;

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
      marginBottom: 12,
    },

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

    acceptButton: {
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

    acceptText: {
      fontSize: 12,
      color: "#FFFFFF",
    },

    unavailableButton: {
      minHeight: 52,
      marginTop: 9,
      borderRadius: 16,
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
      gap: 8,
    },

    unavailableText: {
      fontSize: 11,
      color: "#B91C1C",
    },

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