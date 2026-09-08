import React, {
  memo,
  useCallback,
  useMemo,
} from "react";

import {
  Linking,
  Pressable,
  StyleSheet,
} from "react-native";

import Toast from "react-native-toast-message";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  phone?: string;
};

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

/* ============================================================
   COMPONENT
============================================================ */

function MarketOrderCall({
  phone,
}: Props) {
  const cleanPhone =
    useMemo(() => {
      if (
        typeof phone !== "string"
      ) {
        return "";
      }

      return phone
        .trim()
        .replace(
          /[^+\d]/g,
          "",
        );
    }, [
      phone,
    ]);

  const disabled =
    cleanPhone.length === 0;

  /* ==========================================================
     CALL STORE
  ========================================================== */

  const handleCall =
    useCallback(async () => {
      if (!cleanPhone) {
        showInfoToast(
          "Phone unavailable",
          "The store phone number is not available.",
        );

        return;
      }

      const url =
        `tel:${cleanPhone}`;

      try {
        const supported =
          await Linking.canOpenURL(
            url,
          );

        if (!supported) {
          showErrorToast(
            "Calling unavailable",
            "Your device cannot make phone calls.",
          );

          return;
        }

        await Linking.openURL(
          url,
        );
      } catch (
        error
      ) {
        console.error(
          "MARKET_ORDER_CALL_STORE_ERROR:",
          error,
        );

        showErrorToast(
          "Unable to call store",
          "Please try again.",
        );
      }
    }, [
      cleanPhone,
    ]);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <Pressable
      onPress={
        handleCall
      }
      disabled={
        disabled
      }
      accessibilityRole="button"
      accessibilityLabel="Call store"
      accessibilityState={{
        disabled,
      }}
      style={({
        pressed,
      }) => [
        styles.button,

        disabled
          ? styles.disabled
          : null,

        pressed &&
        !disabled
          ? styles.pressed
          : null,
      ]}
    >
      <AppIcon
        name="phone"
        role="customer"
        size="sm"
        color={
          disabled
            ? Colors.textMuted
            : CustomerColors.primary
        }
      />

      <AppText
        variant="caption"
        weight="bold"
        style={[
          styles.text,

          disabled
            ? styles.disabledText
            : null,
        ]}
      >
        CALL STORE
      </AppText>
    </Pressable>
  );
}

/* ============================================================
   MEMO
============================================================ */

const MemoizedMarketOrderCall =
  memo(
    MarketOrderCall,
  );

MemoizedMarketOrderCall.displayName =
  "MarketOrderCall";

export default MemoizedMarketOrderCall;

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    button: {
      minHeight:
        FixxamTokens.size.buttonHeight,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        CustomerColors.primary,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    text: {
      color:
        CustomerColors.primary,
    },

    disabled: {
      borderColor:
        Colors.border,

      backgroundColor:
        Colors.disabledBackground,

      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    disabledText: {
      color:
        Colors.textMuted,
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