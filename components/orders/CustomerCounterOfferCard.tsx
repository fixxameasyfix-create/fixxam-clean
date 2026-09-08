import React, {
  memo,
  useCallback,
  useMemo,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  AppCard,
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type CustomerCounterOfferCardProps = {
  amount: number;

  message?: string | null;

  onAccept: () => void;

  onCounter: () => void;

  onDecline: () => void;

  disabled?: boolean;
};

/* ==============================================================
   HELPERS
============================================================== */

function normalizeAmount(
  amount: number,
): number {
  if (
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    return 0;
  }

  return amount;
}

function formatAmount(
  amount: number,
): string {
  return `₦${normalizeAmount(
    amount,
  ).toLocaleString("en-NG", {
    maximumFractionDigits: 2,
  })}`;
}

/* ==============================================================
   COMPONENT
============================================================== */

function CustomerCounterOfferCard({
  amount,
  message,
  onAccept,
  onCounter,
  onDecline,
  disabled = false,
}: CustomerCounterOfferCardProps) {
  const formattedAmount =
    useMemo(
      () =>
        formatAmount(
          amount,
        ),
      [amount],
    );

  const safeMessage =
    useMemo(() => {
      if (
        typeof message !==
        "string"
      ) {
        return "";
      }

      return message.trim();
    }, [message]);

  const handleAccept =
    useCallback(() => {
      if (disabled) {
        return;
      }

      onAccept();
    }, [
      disabled,
      onAccept,
    ]);

  const handleCounter =
    useCallback(() => {
      if (disabled) {
        return;
      }

      onCounter();
    }, [
      disabled,
      onCounter,
    ]);

  const handleDecline =
    useCallback(() => {
      if (disabled) {
        return;
      }

      onDecline();
    }, [
      disabled,
      onDecline,
    ]);

  return (
    <AppCard
      style={styles.card}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={styles.header}
      >
        <View
          style={
            styles.iconContainer
          }
        >
          <AppIcon
            name="swap"
            role="customer"
            size="md"
            color={
              CustomerColors.primary
            }
          />
        </View>

        <View
          style={
            styles.headerContent
          }
        >
          <AppText
            variant="caption"
            weight="bold"
            style={styles.title}
          >
            COUNTER OFFER RECEIVED
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.subtitle
            }
          >
            Worker has responded to your offer.
          </AppText>
        </View>
      </View>

      {/* ======================================================
          OFFER
      ====================================================== */}

      <View
        style={styles.offerBox}
      >
        <AppText
          variant="caption"
          weight="semibold"
          tone="muted"
          style={
            styles.offerLabel
          }
        >
          WORKER COUNTER OFFER
        </AppText>

        <AppText
          variant="heading2"
          weight="bold"
          style={styles.amount}
        >
          {formattedAmount}
        </AppText>

        {safeMessage ? (
          <View
            style={
              styles.messageBox
            }
          >
            <AppIcon
              name="messages"
              role="customer"
              size="xs"
              state="muted"
            />

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.message
              }
            >
              {safeMessage}
            </AppText>
          </View>
        ) : null}
      </View>

      {/* ======================================================
          ACCEPT
      ====================================================== */}

      <Pressable
        onPress={
          handleAccept
        }
        disabled={
          disabled
        }
        accessibilityRole="button"
        accessibilityLabel={`Accept worker counter offer of ${formattedAmount}`}
        accessibilityState={{
          disabled,
        }}
        style={({
          pressed,
        }) => [
          styles.acceptButton,

          disabled
            ? styles.disabledButton
            : null,

          pressed &&
          !disabled
            ? styles.pressedButton
            : null,
        ]}
      >
        <AppIcon
          name="success"
          size="sm"
          color={
            Colors.textInverse
          }
        />

        <AppText
          variant="caption"
          weight="bold"
          style={
            styles.acceptText
          }
        >
          ACCEPT {formattedAmount}
        </AppText>
      </Pressable>

      {/* ======================================================
          SECONDARY ACTIONS
      ====================================================== */}

      <View
        style={
          styles.secondaryActions
        }
      >
        <Pressable
          onPress={
            handleCounter
          }
          disabled={
            disabled
          }
          accessibilityRole="button"
          accessibilityLabel="Send counter offer"
          accessibilityState={{
            disabled,
          }}
          style={({
            pressed,
          }) => [
            styles.counterButton,

            disabled
              ? styles.disabledButton
              : null,

            pressed &&
            !disabled
              ? styles.pressedButton
              : null,
          ]}
        >
          <AppIcon
            name="swap"
            role="customer"
            size="xs"
            color={
              CustomerColors.primary
            }
          />

          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.counterText
            }
          >
            COUNTER
          </AppText>
        </Pressable>

        <Pressable
          onPress={
            handleDecline
          }
          disabled={
            disabled
          }
          accessibilityRole="button"
          accessibilityLabel="Decline worker counter offer"
          accessibilityState={{
            disabled,
          }}
          style={({
            pressed,
          }) => [
            styles.declineButton,

            disabled
              ? styles.disabledButton
              : null,

            pressed &&
            !disabled
              ? styles.pressedButton
              : null,
          ]}
        >
          <AppIcon
            name="error"
            size="xs"
            color={
              Colors.error
            }
          />

          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.declineText
            }
          >
            DECLINE
          </AppText>
        </Pressable>
      </View>
    </AppCard>
  );
}

export default memo(
  CustomerCounterOfferCard,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    card: {
      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      gap:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        CustomerColors.primarySoft,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection: "row",

      alignItems: "center",
    },

    iconContainer: {
      width:
        FixxamTokens.size
          .iconBox,

      height:
        FixxamTokens.size
          .iconBox,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    headerContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    title: {
      color:
        CustomerColors.primary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       OFFER
    ======================================================== */

    offerBox: {
      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    offerLabel: {
      letterSpacing: 0.8,
    },

    amount: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    messageBox: {
      marginTop:
        FixxamTokens.spacing.sm,

      paddingTop:
        FixxamTokens.spacing.sm,

      borderTopWidth: 1,

      borderTopColor:
        Colors.divider,

      flexDirection: "row",

      alignItems:
        "flex-start",

      gap:
        FixxamTokens.spacing.xs,
    },

    message: {
      flex: 1,

      minWidth: 0,
    },

    /* ========================================================
       ACCEPT
    ======================================================== */

    acceptButton: {
      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    acceptText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       SECONDARY
    ======================================================== */

    secondaryActions: {
      flexDirection: "row",

      gap:
        FixxamTokens.spacing.sm,
    },

    counterButton: {
      flex: 1,

      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        CustomerColors.primary,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        Colors.surface,
    },

    counterText: {
      color:
        CustomerColors.primary,
    },

    declineButton: {
      flex: 1,

      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.error,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        Colors.surface,
    },

    declineText: {
      color:
        Colors.error,
    },

    /* ========================================================
       STATES
    ======================================================== */

    disabledButton: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    pressedButton: {
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