import React, {
  memo,
  useMemo,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
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
  amount: number;

  onAccept: () => void;

  onCounter: () => void;

  onDecline: () => void;

  loading?: boolean;
};

/* ============================================================
   HELPERS
============================================================ */

function normalizeAmount(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    return 0;
  }

  return Math.round(value);
}

/* ============================================================
   COMPONENT
============================================================ */

function WorkerOfferActions({
  amount,
  onAccept,
  onCounter,
  onDecline,
  loading = false,
}: Props) {
  const safeAmount =
    useMemo(
      () =>
        normalizeAmount(
          amount,
        ),
      [amount],
    );

  const formattedAmount =
    useMemo(
      () =>
        safeAmount.toLocaleString(
          "en-NG",
        ),
      [safeAmount],
    );

  return (
    <View
      style={
        styles.container
      }
    >
      {/* =====================================================
          ACCEPT
      ===================================================== */}

      <Pressable
        disabled={
          loading
        }
        onPress={
          onAccept
        }
        accessibilityRole="button"
        accessibilityLabel={`Accept ₦${formattedAmount}`}
        accessibilityHint="Accept the customer's offer"
        accessibilityState={{
          disabled:
            loading,

          busy:
            loading,
        }}
        style={({
          pressed,
        }) => [
          styles.acceptButton,

          pressed &&
          !loading
            ? styles.pressed
            : null,

          loading
            ? styles.disabled
            : null,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={
              Colors.textInverse
            }
          />
        ) : (
          <>
            <AppIcon
              name="check"
              role="worker"
              size="xs"
              color={
                Colors.textInverse
              }
            />

            <AppText
              variant="caption"
              weight="bold"
              numberOfLines={1}
              style={
                styles.acceptText
              }
            >
              Accept ₦
              {formattedAmount}
            </AppText>
          </>
        )}
      </Pressable>

      {/* =====================================================
          COUNTER + DECLINE
      ===================================================== */}

      <View
        style={
          styles.bottomRow
        }
      >
        {/* COUNTER */}

        <Pressable
          disabled={
            loading
          }
          onPress={
            onCounter
          }
          accessibilityRole="button"
          accessibilityLabel="Send counter offer"
          accessibilityHint="Send a different price to the customer"
          accessibilityState={{
            disabled:
              loading,
          }}
          style={({
            pressed,
          }) => [
            styles.counterButton,

            pressed &&
            !loading
              ? styles.pressed
              : null,

            loading
              ? styles.disabled
              : null,
          ]}
        >
          <AppIcon
            name="refresh"
            role="worker"
            size="xs"
            color={
              WorkerColors.primary
            }
          />

          <AppText
            variant="caption"
            weight="bold"
            numberOfLines={1}
            style={
              styles.counterText
            }
          >
            Counter
          </AppText>
        </Pressable>

        {/* DECLINE */}

        <Pressable
          disabled={
            loading
          }
          onPress={
            onDecline
          }
          accessibilityRole="button"
          accessibilityLabel="Decline offer"
          accessibilityHint="Decline the customer's offer"
          accessibilityState={{
            disabled:
              loading,
          }}
          style={({
            pressed,
          }) => [
            styles.declineButton,

            pressed &&
            !loading
              ? styles.pressed
              : null,

            loading
              ? styles.disabled
              : null,
          ]}
        >
          <AppIcon
            name="close"
            size="xs"
            color={
              Colors.error
            }
          />

          <AppText
            variant="caption"
            weight="bold"
            numberOfLines={1}
            style={
              styles.declineText
            }
          >
            Decline
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

WorkerOfferActions.displayName =
  "WorkerOfferActions";

export default memo(
  WorkerOfferActions,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width:
        "100%",

      marginTop:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       ACCEPT
    ======================================================== */

    acceptButton: {
      width:
        "100%",

      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

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

      backgroundColor:
        WorkerColors.primary,
    },

    acceptText: {
      flexShrink:
        1,

      color:
        Colors.textInverse,
    },

    /* ========================================================
       BOTTOM ROW
    ======================================================== */

    bottomRow: {
      width:
        "100%",

      marginTop:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       COUNTER
    ======================================================== */

    counterButton: {
      flex:
        1,

      minWidth:
        0,

      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

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
        StyleSheet.hairlineWidth,

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    counterText: {
      flexShrink:
        1,

      color:
        WorkerColors.primary,
    },

    /* ========================================================
       DECLINE
    ======================================================== */

    declineButton: {
      flex:
        1,

      minWidth:
        0,

      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

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
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.error,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        Colors.surface,
    },

    declineText: {
      flexShrink:
        1,

      color:
        Colors.error,
    },

    /* ========================================================
       STATES
    ======================================================== */

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

    disabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },
  });