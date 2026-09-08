import React, {
  memo,
  useCallback,
  useMemo,
} from "react";

import {
  Linking,
  StyleSheet,
  View,
} from "react-native";

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

/* ============================================================
   TYPES
============================================================ */

type Props = {
  customerName: string;

  customerPhone?: string;

  orderId: string;

  onChat?: () => void;
};

/* ============================================================
   PHONE
============================================================ */

function normalizePhoneForCall(
  value: string,
): string {
  const trimmed =
    value.trim();

  if (!trimmed) {
    return "";
  }

  const hasLeadingPlus =
    trimmed.startsWith("+");

  const digits =
    trimmed.replace(
      /\D/g,
      "",
    );

  if (!digits) {
    return "";
  }

  return hasLeadingPlus
    ? `+${digits}`
    : digits;
}

/* ============================================================
   COMPONENT
============================================================ */

function WorkerMarketCustomer({
  customerName,
  customerPhone,
  orderId,
  onChat,
}: Props) {
  /* ==========================================================
     DISPLAY VALUES
  ========================================================== */

  const displayName =
    useMemo(
      () =>
        customerName.trim() ||
        "Customer",
      [
        customerName,
      ],
    );

  const displayPhone =
    useMemo(
      () =>
        customerPhone?.trim() ||
        "",
      [
        customerPhone,
      ],
    );

  const callablePhone =
    useMemo(
      () =>
        normalizePhoneForCall(
          displayPhone,
        ),
      [
        displayPhone,
      ],
    );

  const hasPhone =
    callablePhone.length > 0;

  /* ==========================================================
     CALL
  ========================================================== */

  const handleCall =
    useCallback(async () => {
      if (!hasPhone) {
        Toast.show({
          type: "info",

          text1:
            "Phone unavailable",

          text2:
            "This customer does not have a valid phone number.",
        });

        return;
      }

      const phoneUrl =
        `tel:${callablePhone}`;

      try {
        const supported =
          await Linking.canOpenURL(
            phoneUrl,
          );

        if (!supported) {
          Toast.show({
            type: "error",

            text1:
              "Calling unavailable",

            text2:
              "Your device cannot make phone calls.",
          });

          return;
        }

        await Linking.openURL(
          phoneUrl,
        );
      } catch (error) {
        console.error(
          "WORKER_MARKET_CALL_ERROR:",
          error,
        );

        Toast.show({
          type: "error",

          text1:
            "Unable to call customer",

          text2:
            "Please try again.",
        });
      }
    }, [
      callablePhone,
      hasPhone,
    ]);

  /* ==========================================================
     CHAT
  ========================================================== */

  const handleChat =
    useCallback(() => {
      if (onChat) {
        onChat();

        return;
      }

      Toast.show({
        type: "info",

        text1:
          "Chat unavailable",

        text2:
          "Chat is not available for this order.",
      });
    }, [
      onChat,
    ]);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View
      style={
        styles.card
      }
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <AppText
        variant="heading3"
        weight="bold"
        style={
          styles.title
        }
      >
        Customer
      </AppText>

      {/* ======================================================
          CUSTOMER
      ====================================================== */}

      <View
        style={
          styles.customerRow
        }
      >
        <View
          style={
            styles.avatar
          }
        >
          <AppIcon
            name="profile"
            role="worker"
            size="md"
            color={
              WorkerColors.primary
            }
          />
        </View>

        <View
          style={
            styles.customerInfo
          }
        >
          <AppText
            variant="bodyMedium"
            weight="bold"
            numberOfLines={1}
            style={
              styles.customerName
            }
          >
            {displayName}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            style={
              styles.customerPhone
            }
          >
            {displayPhone ||
              "Phone number unavailable"}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          ACTIONS
      ====================================================== */}

      <View
        style={
          styles.actions
        }
      >
        <View
          style={
            styles.action
          }
        >
          <AppButton
            title="Chat"
            role="worker"
            variant="outline"
            leftIconName="messages"
            onPress={
              handleChat
            }
            style={
              styles.button
            }
          />
        </View>

        <View
          style={
            styles.action
          }
        >
          <AppButton
            title={
              hasPhone
                ? "Call"
                : "Unavailable"
            }
            role="worker"
            variant="primary"
            leftIconName="phone"
            disabled={
              !hasPhone
            }
            onPress={
              handleCall
            }
            style={
              styles.button
            }
          />
        </View>
      </View>

      {/* ======================================================
          ORDER CONTEXT FOR ACCESSIBILITY
      ====================================================== */}

      <View
        accessible
        accessibilityLabel={`Customer details for order ${orderId}`}
        style={
          styles.accessibilityContext
        }
      />
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

WorkerMarketCustomer.displayName =
  "WorkerMarketCustomer";

export default memo(
  WorkerMarketCustomer,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    card: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.lg,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       CUSTOMER
    ======================================================== */

    customerRow: {
      marginTop:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    avatar: {
      width:
        FixxamTokens.size.avatarMd,

      height:
        FixxamTokens.size.avatarMd,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    customerInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    customerName: {
      color:
        Colors.textPrimary,
    },

    customerPhone: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       ACTIONS
    ======================================================== */

    actions: {
      marginTop:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      gap:
        FixxamTokens.spacing.sm,
    },

    action: {
      flex: 1,

      minWidth: 0,
    },

    button: {
      width: "100%",
    },

    accessibilityContext: {
      width: 0,

      height: 0,
    },
  });