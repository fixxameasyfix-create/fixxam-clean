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
  Linking,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import Toast from "react-native-toast-message";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import type {
  AppIconName,
} from "@/components/ui/AppIcon";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import MarketOrderChat from "./marketOrderChat";

import type {
  MarketStatus,
} from "./marketOrder.utils";

import {
  normalizeMarketStatus,
} from "./marketOrder.utils";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  orderId: string;

  status: MarketStatus;

  storeId?: string;

  sellerId?: string;

  storePhone?: string;

  note?: string;
};

type ActionVariant =
  | "primary"
  | "secondary"
  | "danger";

/* ============================================================
   TOAST
============================================================ */

function showErrorToast(
  title: string,
  message: string,
) {
  Toast.show({
    type: "error",
    text1: title,
    text2: message,
  });
}

function showInfoToast(
  title: string,
  message: string,
) {
  Toast.show({
    type: "info",
    text1: title,
    text2: message,
  });
}

function showSuccessToast(
  title: string,
  message?: string,
) {
  Toast.show({
    type: "success",

    text1: title,

    ...(message
      ? {
          text2: message,
        }
      : {}),
  });
}

/* ============================================================
   COMPONENT
============================================================ */

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
  ] =
    useState(false);

  const cancellationInFlight =
    useRef(false);

  /* ==========================================================
     NORMALIZE
  ========================================================== */

  const cleanOrderId =
    useMemo(
      () =>
        typeof orderId ===
        "string"
          ? orderId.trim()
          : "",
      [
        orderId,
      ],
    );

  const cleanPhone =
    useMemo(
      () =>
        typeof storePhone ===
        "string"
          ? storePhone.trim()
          : "",
      [
        storePhone,
      ],
    );

  const cleanNote =
    useMemo(
      () =>
        typeof note ===
        "string"
          ? note.trim()
          : "",
      [
        note,
      ],
    );

  /* ==========================================================
     ACTION AVAILABILITY
  ========================================================== */

  const canCancel =
    status === "pending";

  const canTrack =
    status === "accepted" ||
    status ===
      "in-progress";

  const canContactStore =
    status !== "cancelled" &&
    status !== "expired";

  /* ==========================================================
     TRACK ORDER
  ========================================================== */

  const handleTrack =
    useCallback(() => {
      if (!cleanOrderId) {
        showErrorToast(
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
    }, [
      cleanOrderId,
    ]);

  /* ==========================================================
     CALL STORE
  ========================================================== */

  const handleCallStore =
    useCallback(async () => {
      if (!cleanPhone) {
        showInfoToast(
          "Phone unavailable",
          "The store phone number is not available for this order.",
        );

        return;
      }

      const safePhone =
        cleanPhone.replace(
          /[^+\d]/g,
          "",
        );

      if (!safePhone) {
        showErrorToast(
          "Invalid phone number",
          "The store phone number is not valid.",
        );

        return;
      }

      const phoneUrl =
        `tel:${safePhone}`;

      try {
        const supported =
          await Linking.canOpenURL(
            phoneUrl,
          );

        if (!supported) {
          showErrorToast(
            "Unable to call",
            "Your device cannot make phone calls.",
          );

          return;
        }

        await Linking.openURL(
          phoneUrl,
        );
      } catch (
        callError
      ) {
        console.error(
          "MARKET_ORDER_CALL_STORE_ERROR:",
          callError,
        );

        showErrorToast(
          "Unable to call",
          "Something went wrong while trying to call the store.",
        );
      }
    }, [
      cleanPhone,
    ]);

  /* ==========================================================
     CANCEL ORDER
  ========================================================== */

  const confirmCancel =
    useCallback(async () => {
      if (
        cancellationInFlight.current ||
        cancelling
      ) {
        return;
      }

      const user =
        auth.currentUser;

      if (!user) {
        showErrorToast(
          "Sign in required",
          "Please sign in again to cancel this order.",
        );

        return;
      }

      if (!cleanOrderId) {
        showErrorToast(
          "Unable to cancel",
          "Order ID is missing.",
        );

        return;
      }

      if (!canCancel) {
        showInfoToast(
          "Order cannot be cancelled",
          "This order can no longer be cancelled.",
        );

        return;
      }

      cancellationInFlight.current =
        true;

      setCancelling(
        true,
      );

      try {
        const orderRef =
          doc(
            db,
            "orders",
            cleanOrderId,
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

            /* ================================================
               OWNERSHIP

               Firestore Security Rules must independently
               enforce this check server-side.
            ================================================ */

            if (
              data.customerId !==
              user.uid
            ) {
              throw new Error(
                "ORDER_ACCESS_DENIED",
              );
            }

            const currentStatus =
              normalizeMarketStatus(
                data.status,
              );

            if (
              currentStatus ===
              "cancelled"
            ) {
              throw new Error(
                "ORDER_ALREADY_CANCELLED",
              );
            }

            /*
             * Customer cancellation is only
             * allowed while order is pending.
             */
            if (
              currentStatus !==
              "pending"
            ) {
              throw new Error(
                "ORDER_NOT_CANCELLABLE",
              );
            }

            transaction.update(
              orderRef,
              {
                status:
                  "cancelled",

                cancelledAt:
                  serverTimestamp(),

                /*
                 * Preserve existing schema:
                 * cancelledBy contains user UID.
                 */
                cancelledBy:
                  user.uid,

                updatedAt:
                  serverTimestamp(),
              },
            );
          },
        );

        showSuccessToast(
          "Order cancelled",
          "Your market order has been cancelled successfully.",
        );
      } catch (
        cancelError
      ) {
        console.error(
          "MARKET_ORDER_CANCEL_ERROR:",
          cancelError,
        );

        showErrorToast(
          "Unable to cancel",
          getCancelErrorMessage(
            cancelError,
          ),
        );
      } finally {
        cancellationInFlight.current =
          false;

        setCancelling(
          false,
        );
      }
    }, [
      cancelling,
      canCancel,
      cleanOrderId,
    ]);

  /* ==========================================================
     CANCEL CONFIRMATION
  ========================================================== */

  const handleCancel =
    useCallback(() => {
      if (
        cancelling ||
        cancellationInFlight.current
      ) {
        return;
      }

      if (!canCancel) {
        showInfoToast(
          "Order cannot be cancelled",
          "This order can no longer be cancelled.",
        );

        return;
      }

      Alert.alert(
        "Cancel Order?",
        "Are you sure you want to cancel this market order?",
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
              void confirmCancel();
            },
          },
        ],
      );
    }, [
      cancelling,
      canCancel,
      confirmCancel,
    ]);

  /* ==========================================================
     TERMINAL ORDER
  ========================================================== */

  if (
    status === "cancelled" ||
    status === "expired"
  ) {
    if (!cleanNote) {
      return null;
    }

    return (
      <OrderNote
        note={
          cleanNote
        }
      />
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      {/* ======================================================
          ORDER NOTE
      ====================================================== */}

      {cleanNote ? (
        <OrderNote
          note={
            cleanNote
          }
        />
      ) : null}

      {/* ======================================================
          ACTIONS
      ====================================================== */}

      <View
        style={
          styles.actionsCard
        }
      >
        {/* ====================================================
            CANCEL
        ==================================================== */}

        {canCancel ? (
          <ActionButton
            icon="close"
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

        {/* ====================================================
            TRACK
        ==================================================== */}

        {canTrack ? (
          <ActionButton
            icon="navigation"
            label="TRACK ORDER"
            variant="primary"
            onPress={
              handleTrack
            }
          />
        ) : null}

        {/* ====================================================
            CALL STORE
        ==================================================== */}

        {canContactStore ? (
          <ActionButton
            icon="phone"
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

        {/* ====================================================
            CHAT STORE
        ==================================================== */}

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

/* ============================================================
   MEMO
============================================================ */

const MemoizedMarketOrderActions =
  memo(
    MarketOrderActions,
  );

MemoizedMarketOrderActions.displayName =
  "MarketOrderActions";

export default MemoizedMarketOrderActions;

/* ============================================================
   ORDER NOTE
============================================================ */

const OrderNote =
  memo(
    function OrderNote({
      note,
    }: {
      note: string;
    }) {
      return (
        <View
          style={
            styles.noteCard
          }
        >
          <AppText
            variant="body"
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
            <AppIcon
              name="file"
              size="sm"
              color={
                Colors.textSecondary
              }
            />

            <AppText
              variant="caption"
              tone="secondary"
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

/* ============================================================
   ACTION BUTTON
============================================================ */

const ActionButton =
  memo(
    function ActionButton({
      icon,
      label,
      variant,
      onPress,
      disabled = false,
      loading = false,
    }: {
      icon: AppIconName;

      label: string;

      variant:
        ActionVariant;

      onPress:
        () => void;

      disabled?: boolean;

      loading?: boolean;
    }) {
      const config =
        getButtonConfig(
          variant,
        );

      return (
        <Pressable
          onPress={
            onPress
          }
          disabled={
            disabled
          }
          accessibilityRole="button"
          accessibilityLabel={
            label
          }
          accessibilityState={{
            disabled,
            busy:
              loading,
          }}
          style={({
            pressed,
          }) => [
            styles.actionButton,

            config.button,

            disabled
              ? styles.disabled
              : null,

            pressed &&
            !disabled
              ? styles.pressed
              : null,
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
            <AppIcon
              name={icon}
              role="customer"
              size="sm"
              color={
                config.icon
              }
            />
          )}

          <AppText
            variant="caption"
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

/* ============================================================
   BUTTON CONFIG
============================================================ */

function getButtonConfig(
  variant: ActionVariant,
) {
  switch (variant) {
    case "primary":
      return {
        button:
          styles.primaryButton,

        icon:
          Colors.textInverse,

        text:
          Colors.textInverse,
      };

    case "danger":
      return {
        button:
          styles.dangerButton,

        icon:
          Colors.error,

        text:
          Colors.error,
      };

    case "secondary":
    default:
      return {
        button:
          styles.secondaryButton,

        icon:
          CustomerColors.primary,

        text:
          CustomerColors.primary,
      };
  }
}

/* ============================================================
   FIRESTORE ERROR
============================================================ */

function getCancelErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error
  ) {
    switch (
      error.message
    ) {
      case "ORDER_NOT_FOUND":
        return "This order no longer exists.";

      case "ORDER_ACCESS_DENIED":
        return "You are not allowed to cancel this order.";

      case "ORDER_ALREADY_CANCELLED":
        return "This order has already been cancelled.";

      case "ORDER_NOT_CANCELLABLE":
        return "This order has already changed and can no longer be cancelled.";

      default:
        break;
    }
  }

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

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       NOTE
    ======================================================== */

    noteCard: {
      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    noteTitle: {
      color:
        Colors.textPrimary,
    },

    noteBox: {
      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.background,
    },

    noteText: {
      flex: 1,

      lineHeight: 16,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       ACTION CARD
    ======================================================== */

    actionsCard: {
      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      gap:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       ACTION BUTTON
    ======================================================== */

    actionButton: {
      minHeight:
        FixxamTokens.size.buttonHeight,

      paddingHorizontal:
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

      borderRadius:
        FixxamTokens.radius.button,
    },

    /* ========================================================
       PRIMARY
    ======================================================== */

    primaryButton: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primary,
    },

    /* ========================================================
       SECONDARY
    ======================================================== */

    secondaryButton: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    /* ========================================================
       DANGER
    ======================================================== */

    dangerButton: {
      borderColor:
        Colors.error,

      backgroundColor:
        Colors.errorSoft,
    },

    /* ========================================================
       TEXT
    ======================================================== */

    actionText: {
      textAlign:
        "center",
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