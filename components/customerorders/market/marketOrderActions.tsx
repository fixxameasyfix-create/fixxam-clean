import React, {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { router } from "expo-router";

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

import MarketOrderChat from "./marketOrderChat";

import type {
  MarketStatus,
} from "./marketOrder.utils";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  orderId: string;

  status: MarketStatus;

  storeId?: string;

  sellerId?: string;

  storePhone?: string;

  note?: string;
};

/* ==============================================================
   COMPONENT
============================================================== */

function MarketOrderActions({
  orderId,
  status,
  storeId,
  sellerId,
  storePhone,
  note,
}: Props) {
  const [
    cancelling,
    setCancelling,
  ] = useState(false);

  /* ============================================================
     NORMALIZE
  ============================================================ */

  const cleanOrderId =
    useMemo(() => {
      if (
        typeof orderId !==
        "string"
      ) {
        return "";
      }

      return orderId.trim();
    }, [orderId]);

  const cleanPhone =
    useMemo(() => {
      if (
        typeof storePhone !==
        "string"
      ) {
        return "";
      }

      return storePhone.trim();
    }, [storePhone]);

  const cleanNote =
    useMemo(() => {
      if (
        typeof note !==
        "string"
      ) {
        return "";
      }

      return note.trim();
    }, [note]);

  /* ============================================================
     ACTION AVAILABILITY
  ============================================================ */

  /*
   * Customer can cancel only while
   * the seller has not accepted yet.
   */
  const canCancel =
    status === "pending";

  /*
   * Tracking becomes available after
   * seller accepts the order.
   */
  const canTrack =
    status === "accepted" ||
    status === "in-progress";

  /*
   * Customer can contact the store
   * for all non-terminal orders.
   */
  const canContactStore =
    status !== "cancelled" &&
    status !== "expired";

  /* ============================================================
     TRACK ORDER
  ============================================================ */

 const handleTrack =
  useCallback(() => {
    const cleanOrderId =
      orderId.trim();

    if (!cleanOrderId) {
      Alert.alert(
        "Unable to track",
        "Order ID is missing.",
      );

      return;
    }

    router.push({
      pathname:
        "/orders/market/track",
      params: {
        orderId:
          cleanOrderId,
      },
    });
  }, [orderId]);

  /* ============================================================
     CALL STORE
  ============================================================ */

  const handleCallStore =
    useCallback(async () => {
      if (!cleanPhone) {
        Alert.alert(
          "Phone unavailable",
          "The store phone number is not available for this order.",
        );

        return;
      }

      const phoneUrl =
        `tel:${cleanPhone}`;

      try {
        const supported =
          await Linking.canOpenURL(
            phoneUrl,
          );

        if (!supported) {
          Alert.alert(
            "Unable to call",
            "Your device cannot make phone calls.",
          );

          return;
        }

        await Linking.openURL(
          phoneUrl,
        );
      } catch (error) {
        console.error(
          "MARKET_ORDER_CALL_STORE_ERROR:",
          error,
        );

        Alert.alert(
          "Unable to call",
          "Something went wrong while trying to call the store.",
        );
      }
    }, [
      cleanPhone,
    ]);

  /* ============================================================
     CANCEL ORDER
  ============================================================ */

  const confirmCancel =
    useCallback(async () => {
      const user =
        auth.currentUser;

      if (!user) {
        Alert.alert(
          "Sign in required",
          "Please sign in again to cancel this order.",
        );

        return;
      }

      if (!cleanOrderId) {
        Alert.alert(
          "Unable to cancel",
          "Order ID is missing.",
        );

        return;
      }

      if (!canCancel) {
        Alert.alert(
          "Order cannot be cancelled",
          "This order can no longer be cancelled.",
        );

        return;
      }

      if (cancelling) {
        return;
      }

      setCancelling(true);

      try {
        const orderRef =
          doc(
            db,
            "orders",
            cleanOrderId,
          );

        /*
         * IMPORTANT:
         *
         * Firestore Security Rules must also
         * enforce customer ownership and
         * pending status.
         */

        await updateDoc(
          orderRef,
          {
            status:
              "cancelled",

            cancelledAt:
              serverTimestamp(),

            cancelledBy:
              user.uid,

            updatedAt:
              serverTimestamp(),
          },
        );

        Alert.alert(
          "Order Cancelled",
          "Your market order has been cancelled successfully.",
        );
      } catch (error) {
        console.error(
          "MARKET_ORDER_CANCEL_ERROR:",
          error,
        );

        Alert.alert(
          "Unable to cancel",
          getCancelErrorMessage(
            error,
          ),
        );
      } finally {
        setCancelling(false);
      }
    }, [
      cancelling,
      canCancel,
      cleanOrderId,
    ]);

  /* ============================================================
     CANCEL CONFIRMATION
  ============================================================ */

  const handleCancel =
    useCallback(() => {
      if (
        cancelling ||
        !canCancel
      ) {
        return;
      }

      Alert.alert(
        "Cancel Order?",
        "Are you sure you want to cancel this market order?",
        [
          {
            text: "Keep Order",
            style: "cancel",
          },
          {
            text: "Cancel Order",
            style: "destructive",
            onPress:
              confirmCancel,
          },
        ],
      );
    }, [
      cancelling,
      canCancel,
      confirmCancel,
    ]);

  /* ============================================================
     TERMINAL ORDER
  ============================================================ */

  if (
    status === "cancelled" ||
    status === "expired"
  ) {
    if (!cleanNote) {
      return null;
    }

    return (
      <OrderNote
        note={cleanNote}
      />
    );
  }

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <>
      {/* ========================================================
          ORDER NOTE
      ======================================================== */}

      {cleanNote ? (
        <OrderNote
          note={cleanNote}
        />
      ) : null}

      {/* ========================================================
          ACTIONS
      ======================================================== */}

      <View
        style={
          styles.actionsCard
        }
      >
        {/* ======================================================
            CANCEL ORDER
        ====================================================== */}

        {canCancel ? (
          <ActionButton
            icon="close-circle-outline"
            label={
              cancelling
                ? "CANCELLING..."
                : "CANCEL ORDER"
            }
            variant="danger"
            onPress={
              handleCancel
            }
            disabled={
              cancelling
            }
            loading={
              cancelling
            }
          />
        ) : null}

        {/* ======================================================
            TRACK ORDER
        ====================================================== */}

        {canTrack ? (
          <ActionButton
            icon="navigate-outline"
            label="TRACK ORDER"
            variant="success"
            onPress={
              handleTrack
            }
          />
        ) : null}

        {/* ======================================================
            CALL STORE
        ====================================================== */}

        {canContactStore ? (
          <ActionButton
            icon="call-outline"
            label="CALL STORE"
            variant="secondary"
            onPress={
              handleCallStore
            }
            disabled={
              !cleanPhone
            }
          />
        ) : null}

        {/* ======================================================
            CHAT STORE
        ====================================================== */}

        {canContactStore ? (
          <MarketOrderChat
            orderId={
              cleanOrderId
            }
            storeId={
              storeId
            }
            sellerId={
              sellerId
            }
          />
        ) : null}
      </View>
    </>
  );
}

export default memo(
  MarketOrderActions,
);

/* ==============================================================
   ORDER NOTE
============================================================== */

const OrderNote = memo(
  ({
    note,
  }: {
    note: string;
  }) => {
    return (
      <View
        style={
          styles.noteCard
        }
      >
        <AppText
          weight="bold"
          style={
            styles.noteTitle
          }
        >
          Order Note
        </AppText>

        <View
          style={
            styles.noteBox
          }
        >
          <Ionicons
            name="document-text-outline"
            size={18}
            color="#64748B"
          />

          <AppText
            style={
              styles.noteText
            }
          >
            {note}
          </AppText>
        </View>
      </View>
    );
  },
);

OrderNote.displayName =
  "OrderNote";

/* ==============================================================
   ACTION BUTTON
============================================================== */

const ActionButton = memo(
  ({
    icon,
    label,
    variant,
    onPress,
    disabled = false,
    loading = false,
  }: {
    icon: keyof typeof Ionicons.glyphMap;

    label: string;

    variant:
      | "success"
      | "secondary"
      | "danger";

    onPress: () => void;

    disabled?: boolean;

    loading?: boolean;
  }) => {
    const config =
      getButtonConfig(
        variant,
      );

    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={
          label
        }
        accessibilityState={{
          disabled,
          busy: loading,
        }}
        style={({ pressed }) => [
          styles.actionButton,

          config.button,

          disabled &&
            styles.disabled,

          pressed &&
            !disabled &&
            styles.pressed,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={
              config.icon
            }
          />
        ) : (
          <Ionicons
            name={icon}
            size={19}
            color={
              config.icon
            }
          />
        )}

        <AppText
          weight="bold"
          style={[
            styles.actionText,
            {
              color:
                config.text,
            },
          ]}
        >
          {label}
        </AppText>
      </Pressable>
    );
  },
);

ActionButton.displayName =
  "ActionButton";

/* ==============================================================
   BUTTON CONFIG
============================================================== */

function getButtonConfig(
  variant:
    | "success"
    | "secondary"
    | "danger",
) {
  switch (
    variant
  ) {
    case "success":
      return {
        button:
          styles.successButton,
        icon: "#FFFFFF",
        text: "#FFFFFF",
      };

    case "danger":
      return {
        button:
          styles.dangerButton,
        icon: "#DC2626",
        text: "#DC2626",
      };

    case "secondary":
    default:
      return {
        button:
          styles.secondaryButton,
        icon: "#2563EB",
        text: "#2563EB",
      };
  }
}

/* ==============================================================
   FIRESTORE ERROR
============================================================== */

function getCancelErrorMessage(
  error: unknown,
): string {
  if (
    typeof error ===
      "object" &&
    error !== null &&
    "code" in error
  ) {
    const code =
      String(
        (
          error as {
            code?: unknown;
          }
        ).code ?? "",
      );

    switch (code) {
      case "permission-denied":
        return "You are not allowed to cancel this order.";

      case "not-found":
        return "This order no longer exists.";

      case "failed-precondition":
        return "This order has already changed and can no longer be cancelled.";

      case "unavailable":
        return "The service is temporarily unavailable. Please try again.";

      case "unauthenticated":
        return "Your session has expired. Please sign in again.";

      default:
        break;
    }
  }

  return "Something went wrong. Please try again.";
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       NOTE
    ======================================================== */

    noteCard: {
      marginTop: 10,
      padding: 14,
      borderRadius: 18,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    noteTitle: {
      fontSize: 14,
      color: "#0F172A",
    },

    noteBox: {
      marginTop: 10,
      padding: 11,
      borderRadius: 12,
      backgroundColor:
        "#F8FAFC",
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      gap: 8,
    },

    noteText: {
      flex: 1,
      fontSize: 9.5,
      lineHeight: 15,
      color: "#475569",
    },

    /* ========================================================
       ACTION CARD
    ======================================================== */

    actionsCard: {
      marginTop: 10,
      padding: 12,
      borderRadius: 18,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      gap: 8,
    },

    /* ========================================================
       BUTTON
    ======================================================== */

    actionButton: {
      minHeight: 48,
      paddingHorizontal: 14,
      borderRadius: 14,
      borderWidth: 1,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 8,
    },

    /* ========================================================
       SUCCESS
    ======================================================== */

    successButton: {
      backgroundColor:
        "#16A34A",
      borderColor:
        "#16A34A",
    },

    /* ========================================================
       SECONDARY
    ======================================================== */

    secondaryButton: {
      backgroundColor:
        "#EFF6FF",
      borderColor:
        "#DBEAFE",
    },

    /* ========================================================
       DANGER
    ======================================================== */

    dangerButton: {
      backgroundColor:
        "#FEF2F2",
      borderColor:
        "#FECACA",
    },

    /* ========================================================
       TEXT
    ======================================================== */

    actionText: {
      fontSize: 10,
    },

    /* ========================================================
       STATES
    ======================================================== */

    disabled: {
      opacity: 0.45,
    },

    pressed: {
      opacity: 0.75,
      transform: [
        {
          scale: 0.98,
        },
      ],
    },
  });