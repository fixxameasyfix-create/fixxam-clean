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
   HELPERS
============================================================ */

function normalizePhone(
  value?: string,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

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
    useMemo(
      () =>
        normalizePhone(
          phone,
        ),
      [
        phone,
      ],
    );

  const disabled =
    !cleanPhone;

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

      const phoneUrl =
        `tel:${cleanPhone}`;

      try {
        const supported =
          await Linking.canOpenURL(
            phoneUrl,
          );

        if (!supported) {
          showErrorToast(
            "Calling unavailable",
            "Your device cannot make phone calls.",
          );

          return;
        }

        await Linking.openURL(
          phoneUrl,
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
        variant="bodyMedium"
        weight="semibold"
        numberOfLines={1}
        style={[
          styles.text,

          disabled
            ? styles.disabledText
            : null,
        ]}
      >
        Call store
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
      flex:
        1,

      minWidth:
        0,

      minHeight:
        FixxamTokens.size.minimumTouchTarget,

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
        1,

      borderColor:
        CustomerColors.primary,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        Colors.surface,
    },

    text: {
      flexShrink:
        1,

      color:
        CustomerColors.primary,
    },

    disabled: {
      borderColor:
        Colors.border,

      backgroundColor:
        Colors.disabledBackground,

      opacity:
        FixxamTokens.motion.disabledOpacity,
    },

    disabledText: {
      color:
        Colors.textMuted,
    },

    pressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },
  });