import React, {
  memo,
  useCallback,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Modal,
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
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  visible: boolean;

  orderId: string;

  onClose: () => void;

  onCancelled?: () => void;
};

type CancelResult =
  | "cancelled"
  | "already-cancelled";

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
   STATUS
============================================================ */

function normalizeOrderStatus(
  value: unknown,
): string {
  return typeof value === "string"
    ? value
        .trim()
        .toLowerCase()
        .replace(
          /_/g,
          "-",
        )
    : "";
}

/* ============================================================
   COMPONENT
============================================================ */

function CancelMarketOrderModalComponent({
  visible,
  orderId,
  onClose,
  onCancelled,
}: Props) {
  const [
    cancelling,
    setCancelling,
  ] =
    useState(false);

  const cancellationInFlight =
    useRef(false);

  /* ==========================================================
     CLOSE
  ========================================================== */

  const handleClose =
    useCallback(() => {
      if (
        cancellationInFlight.current ||
        cancelling
      ) {
        return;
      }

      onClose();
    }, [
      cancelling,
      onClose,
    ]);

  /* ==========================================================
     CANCEL ORDER
  ========================================================== */

  const handleCancel =
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

      const cleanOrderId =
        orderId.trim();

      if (!cleanOrderId) {
        showErrorToast(
          "Order unavailable",
          "Order ID is missing.",
        );

        return;
      }

      cancellationInFlight.current =
        true;

      setCancelling(true);

      try {
        const orderRef =
          doc(
            db,
            "orders",
            cleanOrderId,
          );

        const result =
          await runTransaction<
            CancelResult
          >(
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

              /* ==============================================
                 CUSTOMER OWNERSHIP

                 Firestore Security Rules must independently
                 enforce this ownership server-side.
              ============================================== */

              if (
                data.customerId !==
                user.uid
              ) {
                throw new Error(
                  "ORDER_ACCESS_DENIED",
                );
              }

              const status =
                normalizeOrderStatus(
                  data.status,
                );

              /* ==============================================
                 IDEMPOTENT CANCELLATION
              ============================================== */

              if (
                status ===
                "cancelled"
              ) {
                return "already-cancelled";
              }

              /* ==============================================
                 TERMINAL STATES
              ============================================== */

              if (
                status ===
                  "completed" ||
                status ===
                  "delivered" ||
                status ===
                  "expired"
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

                  cancelledBy:
                    "customer",

                  cancelledAt:
                    serverTimestamp(),

                  updatedAt:
                    serverTimestamp(),
                },
              );

              return "cancelled";
            },
          );

        if (
          result ===
          "already-cancelled"
        ) {
          showInfoToast(
            "Order already cancelled",
            "This order has already been cancelled.",
          );

          onCancelled?.();

          onClose();

          return;
        }

        showSuccessToast(
          "Order cancelled",
          "Your market order has been cancelled.",
        );

        onCancelled?.();

        onClose();
      } catch (
        cancelError
      ) {
        console.error(
          "CANCEL_MARKET_ORDER_ERROR:",
          cancelError,
        );

        const code =
          cancelError instanceof
          Error
            ? cancelError.message
            : "";

        switch (code) {
          case "ORDER_NOT_FOUND":
            showErrorToast(
              "Order unavailable",
              "This order could not be found.",
            );
            break;

          case "ORDER_ACCESS_DENIED":
            showErrorToast(
              "Access denied",
              "You do not have permission to cancel this order.",
            );
            break;

          case "ORDER_NOT_CANCELLABLE":
            showErrorToast(
              "Cannot cancel order",
              "This order can no longer be cancelled.",
            );
            break;

          default:
            showErrorToast(
              "Unable to cancel",
              "We could not cancel this order. Please try again.",
            );
        }
      } finally {
        cancellationInFlight.current =
          false;

        setCancelling(false);
      }
    }, [
      cancelling,
      onCancelled,
      onClose,
      orderId,
    ]);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={
        handleClose
      }
    >
      <Pressable
        style={
          styles.overlay
        }
        onPress={
          handleClose
        }
      >
        <Pressable
          style={
            styles.modal
          }
          onPress={(
            event,
          ) => {
            event.stopPropagation();
          }}
          accessible={false}
        >
          {/* ==================================================
              ICON
          ================================================== */}

          <View
            style={
              styles.iconBox
            }
          >
            <AppIcon
              name="error"
              size="lg"
              color={
                Colors.error
              }
            />
          </View>

          {/* ==================================================
              TITLE
          ================================================== */}

          <AppText
            variant="heading3"
            weight="bold"
            center
            style={
              styles.title
            }
          >
            Cancel Order?
          </AppText>

          {/* ==================================================
              MESSAGE
          ================================================== */}

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.message
            }
          >
            Are you sure you want to cancel this order? This action cannot be undone.
          </AppText>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <View
            style={
              styles.actions
            }
          >
            <Pressable
              disabled={
                cancelling
              }
              onPress={
                handleClose
              }
              accessibilityRole="button"
              accessibilityLabel="Keep order"
              accessibilityState={{
                disabled:
                  cancelling,
              }}
              style={({
                pressed,
              }) => [
                styles.button,
                styles.keepButton,

                pressed &&
                !cancelling
                  ? styles.pressed
                  : null,

                cancelling
                  ? styles.disabled
                  : null,
              ]}
            >
              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.keepText
                }
              >
                KEEP ORDER
              </AppText>
            </Pressable>

            <Pressable
              disabled={
                cancelling
              }
              onPress={() => {
                void handleCancel();
              }}
              accessibilityRole="button"
              accessibilityLabel="Cancel order"
              accessibilityState={{
                disabled:
                  cancelling,
                busy:
                  cancelling,
              }}
              style={({
                pressed,
              }) => [
                styles.button,
                styles.cancelButton,

                pressed &&
                !cancelling
                  ? styles.pressed
                  : null,

                cancelling
                  ? styles.disabled
                  : null,
              ]}
            >
              {cancelling ? (
                <ActivityIndicator
                  size="small"
                  color={
                    Colors.textInverse
                  }
                />
              ) : (
                <>
                  <AppIcon
                    name="close"
                    size="xs"
                    color={
                      Colors.textInverse
                    }
                  />

                  <AppText
                    variant="caption"
                    weight="bold"
                    style={
                      styles.cancelText
                    }
                  >
                    CANCEL ORDER
                  </AppText>
                </>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ============================================================
   MEMO
============================================================ */

const CancelMarketOrderModal =
  memo(
    CancelMarketOrderModalComponent,
  );

CancelMarketOrderModal.displayName =
  "CancelMarketOrderModal";

export default CancelMarketOrderModal;

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       OVERLAY
    ======================================================== */

    overlay: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.overlayMedium,
    },

    /* ========================================================
       MODAL
    ======================================================== */

    modal: {
      width: "100%",

      maxWidth: 420,

      padding:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       ICON
    ======================================================== */

    iconBox: {
      width: 60,

      height: 60,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.errorSoft,
    },

    /* ========================================================
       TEXT
    ======================================================== */

    title: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    message: {
      maxWidth: 320,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       ACTIONS
    ======================================================== */

    actions: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.lg,

      gap:
        FixxamTokens.spacing.sm,
    },

    button: {
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
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.button,
    },

    keepButton: {
      borderWidth: 1,

      borderColor:
        Colors.border,

      backgroundColor:
        Colors.disabledBackground,
    },

    cancelButton: {
      backgroundColor:
        Colors.error,
    },

    keepText: {
      color:
        Colors.textPrimary,
    },

    cancelText: {
      color:
        Colors.textInverse,
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