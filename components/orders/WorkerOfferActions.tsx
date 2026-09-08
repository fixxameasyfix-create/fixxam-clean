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
      style={styles.container}
    >
      {/* =====================================================
          ACCEPT
      ===================================================== */}

      <Pressable
        disabled={loading}
        onPress={onAccept}
        accessibilityRole="button"
        accessibilityLabel={`Accept ₦${formattedAmount}`}
        accessibilityState={{
          disabled: loading,
          busy: loading,
        }}
        style={({ pressed }) => [
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
            <View
              style={
                styles.acceptIcon
              }
            >
              <AppIcon
                name="check"
                role="worker"
                size="sm"
                color={
                  Colors.textInverse
                }
              />
            </View>

            <AppText
              variant="caption"
              weight="bold"
              numberOfLines={1}
              style={
                styles.acceptText
              }
            >
              ACCEPT ₦
              {formattedAmount}
            </AppText>
          </>
        )}
      </Pressable>

      {/* =====================================================
          COUNTER + DECLINE
      ===================================================== */}

      <View
        style={styles.bottomRow}
      >
        {/* ===================================================
            COUNTER
        =================================================== */}

        <Pressable
          disabled={loading}
          onPress={onCounter}
          accessibilityRole="button"
          accessibilityLabel="Send counter offer"
          accessibilityState={{
            disabled: loading,
          }}
          style={({ pressed }) => [
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
          <View
            style={
              styles.counterIcon
            }
          >
            <AppIcon
              name="refresh"
              role="worker"
              size="sm"
              color={
                WorkerColors.primary
              }
            />
          </View>

          <AppText
            variant="caption"
            weight="bold"
            numberOfLines={1}
            style={
              styles.counterText
            }
          >
            COUNTER
          </AppText>
        </Pressable>

        {/* ===================================================
            DECLINE
        =================================================== */}

        <Pressable
          disabled={loading}
          onPress={onDecline}
          accessibilityRole="button"
          accessibilityLabel="Decline offer"
          accessibilityState={{
            disabled: loading,
          }}
          style={({ pressed }) => [
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
          <View
            style={
              styles.declineIcon
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

          <AppText
            variant="caption"
            weight="bold"
            numberOfLines={1}
            style={
              styles.declineText
            }
          >
            DECLINE
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

export default memo(
  WorkerOfferActions,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       ACCEPT
    ======================================================== */

    acceptButton: {
      minHeight:
        FixxamTokens.size
          .buttonHeight,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        WorkerColors.primary,
    },

    acceptIcon: {
      width: 38,

      height: 38,

      marginRight:
        FixxamTokens.spacing.sm,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        "rgba(255,255,255,0.18)",
    },

    acceptText: {
      flexShrink: 1,

      letterSpacing: 0.2,

      color:
        Colors.textInverse,
    },

    /* ========================================================
       BOTTOM ROW
    ======================================================== */

    bottomRow: {
      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      gap:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       COUNTER
    ======================================================== */

    counterButton: {
      flex: 1,

      minHeight:
        FixxamTokens.size
          .buttonHeight,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    counterIcon: {
      width: 38,

      height: 38,

      marginRight:
        FixxamTokens.spacing.xs,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    counterText: {
      flexShrink: 1,

      letterSpacing: 0.2,

      color:
        WorkerColors.primary,
    },

    /* ========================================================
       DECLINE
    ======================================================== */

    declineButton: {
      flex: 1,

      minHeight:
        FixxamTokens.size
          .buttonHeight,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.error,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        Colors.errorSoft,
    },

    declineIcon: {
      width: 38,

      height: 38,

      marginRight:
        FixxamTokens.spacing.xs,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    declineText: {
      flexShrink: 1,

      letterSpacing: 0.2,

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