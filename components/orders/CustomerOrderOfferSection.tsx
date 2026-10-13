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
  router,
} from "expo-router";

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

/* ==============================================================
   TYPES
============================================================== */

type OfferStatus =
  | "none"
  | "sent"
  | "accepted"
  | "declined"
  | "countered";

type CounterOfferStatus =
  | "none"
  | "sent"
  | "accepted"
  | "declined";

type CounterOfferBy =
  | "customer"
  | "worker"
  | null;

type Props = {
  bookingId: string;

  offerStatus: OfferStatus;

  offerAmount?: number | null;

  offerMessage?: string | null;

  counterOfferAmount?: number | null;

  counterOfferMessage?: string | null;

  counterOfferStatus?:
    | CounterOfferStatus
    | null;

  counterOfferBy?:
    CounterOfferBy;

  offerRound?: number;

  workerName: string;

  onAcceptOffer: () => void;

  onCounterOffer?: () => void;

  onDeclineOffer: () => void;
};

/* ==============================================================
   HELPERS
============================================================== */

function formatAmount(
  value?: number | null,
): string {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return "₦0";
  }

  return `₦${Math.round(
    value,
  ).toLocaleString("en-NG")}`;
}

function isValidAmount(
  value: unknown,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  );
}

function cleanText(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function showError(
  title: string,
  message: string,
) {
  Toast.show({
    type: "error",
    text1: title,
    text2: message,
  });
}

/* ==============================================================
   MAIN COMPONENT
============================================================== */

function CustomerOrderOfferSection({
  bookingId,

  offerStatus,
  offerAmount,
  offerMessage,

  counterOfferAmount,
  counterOfferMessage,
  counterOfferStatus,
  counterOfferBy,

  workerName,

  onAcceptOffer,
  onCounterOffer,
  onDeclineOffer,
}: Props) {
  const safeWorkerName =
    useMemo(
      () =>
        cleanText(workerName) ||
        "the worker",
      [workerName],
    );

  const safeOfferMessage =
    useMemo(
      () =>
        cleanText(
          offerMessage,
        ),
      [offerMessage],
    );

  const safeCounterMessage =
    useMemo(
      () =>
        cleanText(
          counterOfferMessage,
        ),
      [counterOfferMessage],
    );

  /* ==========================================================
     NEGOTIATION STATE
  ========================================================== */

  const customerCounterSent =
    offerStatus === "sent" &&
    counterOfferBy === "customer" &&
    counterOfferStatus === "sent" &&
    isValidAmount(
      counterOfferAmount,
    );

  const workerCounterReceived =
    offerStatus === "sent" &&
    counterOfferBy === "worker" &&
    counterOfferStatus === "sent" &&
    isValidAmount(
      counterOfferAmount,
    );

  const noCounterYet =
    (
      !counterOfferStatus ||
      counterOfferStatus === "none"
    ) &&
    (
      !counterOfferBy ||
      counterOfferBy === null
    );

  const initialWorkerOfferReceived =
    offerStatus === "sent" &&
    noCounterYet &&
    isValidAmount(
      offerAmount,
    );

  const canCustomerCounter =
    initialWorkerOfferReceived ||
    workerCounterReceived;

  const activeWorkerAmount =
    useMemo(() => {
      if (
        workerCounterReceived
      ) {
        return counterOfferAmount;
      }

      if (
        initialWorkerOfferReceived
      ) {
        return offerAmount;
      }

      return null;
    }, [
      counterOfferAmount,
      initialWorkerOfferReceived,
      offerAmount,
      workerCounterReceived,
    ]);

  /* ==========================================================
     OPEN COUNTER
  ========================================================== */

  const handleOpenCounter =
    useCallback(() => {
      const cleanBookingId =
        bookingId.trim();

      if (!cleanBookingId) {
        showError(
          "Order unavailable",
          "This order could not be identified.",
        );

        return;
      }

      if (!canCustomerCounter) {
        if (
          customerCounterSent
        ) {
          showError(
            "Waiting for worker",
            "Your counter offer is already waiting for the worker.",
          );

          return;
        }

        showError(
          "Counter unavailable",
          "There is no active worker offer available to counter.",
        );

        return;
      }

      if (
        !isValidAmount(
          activeWorkerAmount,
        )
      ) {
        showError(
          "Offer unavailable",
          "The current worker offer amount is unavailable.",
        );

        return;
      }

      onCounterOffer?.();

      router.push({
        pathname:
          "/(customer)/orders/counter-offer",

        params: {
          bookingId:
            cleanBookingId,
        },
      } as never);
    }, [
      activeWorkerAmount,
      bookingId,
      canCustomerCounter,
      customerCounterSent,
      onCounterOffer,
    ]);

  /* ==========================================================
     ACCEPTED
  ========================================================== */

  if (
    offerStatus === "accepted" ||
    counterOfferStatus === "accepted"
  ) {
return (
  <StatusCard
    icon="success"
    title="Offer accepted"
    description="Your offer has been accepted. Please wait for the worker to start the service."
    tone="success"
  />
);

}

  /* ==========================================================
     DECLINED
  ========================================================== */

  if (
    offerStatus === "declined" ||
    counterOfferStatus === "declined"
  ) {
    return (
      <StatusCard
        icon="error"
        title="Offer declined"
        description="The negotiation has ended."
        tone="error"
      />
    );
  }

  /* ==========================================================
     CUSTOMER COUNTER SENT
  ========================================================== */

  if (
    customerCounterSent
  ) {
    return (
      <View
        style={
          styles.section
        }
      >
        <View
          style={
            styles.card
          }
        >
          <View
            style={
              styles.compactHeader
            }
          >
            <View
              style={
                styles.primaryIcon
              }
            >
              <AppIcon
                name="refresh"
                role="customer"
                size="xs"
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
                variant="bodyMedium"
                weight="semibold"
                numberOfLines={1}
              >
                Counter offer sent
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                numberOfLines={1}
                style={
                  styles.headerSubtitle
                }
              >
                Waiting for {safeWorkerName}
              </AppText>
            </View>

            <StatusPill
              label="Waiting"
              tone="warning"
            />
          </View>

          <AmountRow
            label="Your offer"
            amount={
              counterOfferAmount
            }
          />

          {safeCounterMessage ? (
            <MessageBox
              message={
                safeCounterMessage
              }
            />
          ) : null}
        </View>
      </View>
    );
  }

  /* ==========================================================
     NO OFFER
  ========================================================== */

  if (
    offerStatus === "none"
  ) {
    return (
      <View
        style={
          styles.section
        }
      >
        <View
          style={
            styles.waitingCard
          }
        >
          <View
            style={
              styles.waitingIcon
            }
          >
            <AppIcon
              name="clock"
              size="xs"
              color={
                Colors.warning
              }
            />
          </View>

          <View
            style={
              styles.waitingContent
            }
          >
            <AppText
              variant="bodyMedium"
              weight="semibold"
              numberOfLines={1}
              style={
                styles.waitingTitle
              }
            >
              Waiting for worker offer
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={
                styles.waitingText
              }
            >
              {safeWorkerName} will send you a price.
            </AppText>
          </View>
        </View>
      </View>
    );
  }

  /* ==========================================================
     WORKER COUNTER
  ========================================================== */

  if (
    workerCounterReceived
  ) {
    return (
      <OfferCard
        title="Counter offer received"
        subtitle={`${safeWorkerName} sent a new price.`}
        label="Counter offer"
        amount={
          counterOfferAmount
        }
        message={
          safeCounterMessage
        }
        onAccept={
          onAcceptOffer
        }
        onCounter={
          handleOpenCounter
        }
        onDecline={
          onDeclineOffer
        }
      />
    );
  }

  /* ==========================================================
     INITIAL WORKER OFFER
  ========================================================== */

  if (
    initialWorkerOfferReceived
  ) {
    return (
      <OfferCard
        title="Worker offer"
        subtitle={`${safeWorkerName} sent you a price.`}
        label="Offer"
        amount={
          offerAmount
        }
        message={
          safeOfferMessage
        }
        onAccept={
          onAcceptOffer
        }
        onCounter={
          handleOpenCounter
        }
        onDecline={
          onDeclineOffer
        }
      />
    );
  }

  /* ==========================================================
     INVALID / UPDATING STATE
  ========================================================== */

  return (
    <StatusCard
      icon="info"
      title="Negotiation update"
      description={
        offerStatus === "sent"
          ? "The latest offer is being updated."
          : "The offer status is being updated."
      }
      tone="info"
    />
  );
}

/* ==============================================================
   OFFER CARD
============================================================== */

type OfferCardProps = {
  title: string;

  subtitle: string;

  label: string;

  amount: number;

  message?: string;

  onAccept: () => void;

  onCounter: () => void;

  onDecline: () => void;
};

function OfferCard({
  title,
  subtitle,
  label,
  amount,
  message,
  onAccept,
  onCounter,
  onDecline,
}: OfferCardProps) {
  return (
    <View
      style={
        styles.section
      }
    >
      <View
        style={
          styles.card
        }
      >
        {/* HEADER */}

        <View
          style={
            styles.compactHeader
          }
        >
          <View
            style={
              styles.primaryIcon
            }
          >
            <AppIcon
              name="wallet"
              role="customer"
              size="xs"
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
              variant="bodyMedium"
              weight="semibold"
              numberOfLines={1}
            >
              {title}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={
                styles.headerSubtitle
              }
            >
              {subtitle}
            </AppText>
          </View>
        </View>

        {/* PRICE */}

        <AmountRow
          label={
            label
          }
          amount={
            amount
          }
        />

        {/* MESSAGE */}

        {message ? (
          <MessageBox
            message={
              message
            }
          />
        ) : null}

        {/* ACCEPT */}

        <Pressable
          onPress={
            onAccept
          }
          accessibilityRole="button"
          accessibilityLabel={`Accept ${formatAmount(
            amount,
          )}`}
          style={({
            pressed,
          }) => [
            styles.acceptButton,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppIcon
            name="success"
            size="xs"
            color={
              Colors.textInverse
            }
          />

          <AppText
            variant="bodyMedium"
            weight="semibold"
            style={
              styles.acceptText
            }
          >
            Accept {formatAmount(amount)}
          </AppText>
        </Pressable>

        {/* SECONDARY ACTIONS */}

        <View
          style={
            styles.actions
          }
        >
          <Pressable
            onPress={
              onCounter
            }
            accessibilityRole="button"
            accessibilityLabel="Send counter offer"
            style={({
              pressed,
            }) => [
              styles.secondaryButton,

              pressed
                ? styles.pressed
                : null,
            ]}
          >
            <AppIcon
              name="refresh"
              role="customer"
              size="xs"
              color={
                CustomerColors.primary
              }
            />

            <AppText
              variant="caption"
              weight="semibold"
              style={
                styles.counterText
              }
            >
              Counter
            </AppText>
          </Pressable>

          <Pressable
            onPress={
              onDecline
            }
            accessibilityRole="button"
            accessibilityLabel="Decline worker offer"
            style={({
              pressed,
            }) => [
              styles.secondaryButton,
              styles.declineButton,

              pressed
                ? styles.declinePressed
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
              weight="semibold"
              style={
                styles.declineText
              }
            >
              Decline
            </AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/* ==============================================================
   AMOUNT
============================================================== */

function AmountRow({
  label,
  amount,
}: {
  label: string;

  amount: number;
}) {
  return (
    <View
      style={
        styles.amountRow
      }
    >
      <AppText
        variant="caption"
        tone="secondary"
        weight="semibold"
        numberOfLines={1}
        style={
          styles.amountLabel
        }
      >
        {label}
      </AppText>

      <AppText
        variant="bodyLarge"
        weight="bold"
        numberOfLines={1}
        style={
          styles.amount
        }
      >
        {formatAmount(
          amount,
        )}
      </AppText>
    </View>
  );
}

/* ==============================================================
   MESSAGE
============================================================== */

function MessageBox({
  message,
}: {
  message: string;
}) {
  return (
    <View
      style={
        styles.messageContainer
      }
    >
      <AppIcon
        name="messages"
        size="xs"
        color={
          Colors.textSecondary
        }
      />

      <AppText
        variant="caption"
        tone="secondary"
        numberOfLines={3}
        style={
          styles.messageText
        }
      >
        {message}
      </AppText>
    </View>
  );
}

/* ==============================================================
   STATUS PILL
============================================================== */

function StatusPill({
  label,
  tone,
}: {
  label: string;

  tone:
    | "warning"
    | "success";
}) {
  const isSuccess =
    tone === "success";

  return (
    <View
      style={[
        styles.statusPill,

        {
          backgroundColor:
            isSuccess
              ? Colors.successSoft
              : Colors.warningSoft,
        },
      ]}
    >
      <View
        style={[
          styles.statusDot,

          {
            backgroundColor:
              isSuccess
                ? Colors.success
                : Colors.warning,
          },
        ]}
      />

      <AppText
        variant="caption"
        weight="semibold"
        style={[
          styles.statusPillText,

          {
            color:
              isSuccess
                ? Colors.success
                : Colors.warning,
          },
        ]}
      >
        {label}
      </AppText>
    </View>
  );
}

/* ==============================================================
   STATUS CARD
============================================================== */

type StatusTone =
  | "success"
  | "error"
  | "info";

type StatusCardProps = {
  icon:
    | "success"
    | "error"
    | "info";

  title: string;

  description: string;

  tone: StatusTone;
};

function StatusCard({
  icon,
  title,
  description,
  tone,
}: StatusCardProps) {
  const config =
    tone === "success"
      ? {
          color:
            Colors.success,

          background:
            Colors.successSoft,
        }
      : tone === "error"
        ? {
            color:
              Colors.error,

            background:
              Colors.errorSoft,
          }
        : {
            color:
              Colors.info,

            background:
              Colors.infoSoft,
          };

  return (
    <View
      style={
        styles.section
      }
    >
      <View
        style={[
          styles.statusCard,

          {
            backgroundColor:
              config.background,
          },
        ]}
      >
        <View
          style={
            styles.statusIcon
          }
        >
          <AppIcon
            name={
              icon
            }
            size="xs"
            color={
              config.color
            }
          />
        </View>

        <View
          style={
            styles.statusContent
          }
        >
          <AppText
            variant="bodyMedium"
            weight="semibold"
            numberOfLines={1}
            style={{
              color:
                config.color,
            }}
          >
            {title}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={2}
            style={
              styles.statusDescription
            }
          >
            {description}
          </AppText>
        </View>
      </View>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    section: {
      width:
        "100%",

      marginTop:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      padding:
        FixxamTokens.spacing.sm,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    compactHeader: {
      minHeight:
        38,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    primaryIcon: {
      width:
        34,

      height:
        34,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    headerContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    headerSubtitle: {
      marginTop:
        1,

      lineHeight:
        16,
    },

    /* ========================================================
       AMOUNT
    ======================================================== */

    amountRow: {
      minHeight:
        44,

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    amountLabel: {
      flex:
        1,

      minWidth:
        0,
    },

    amount: {
      flexShrink:
        0,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       MESSAGE
    ======================================================== */

    messageContainer: {
      marginTop:
        8,

      paddingTop:
        8,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        FixxamTokens.spacing.xs,

      borderTopWidth:
        StyleSheet.hairlineWidth,

      borderTopColor:
        Colors.divider,
    },

    messageText: {
      flex:
        1,

      minWidth:
        0,

      lineHeight:
        17,
    },

    /* ========================================================
       WAITING
    ======================================================== */

    waitingCard: {
      minHeight:
        56,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        8,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.warningSoft,
    },

    waitingIcon: {
      width:
        34,

      height:
        34,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    waitingContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    waitingTitle: {
      color:
        Colors.textPrimary,
    },

    waitingText: {
      marginTop:
        1,

      lineHeight:
        16,
    },

    /* ========================================================
       ACCEPT
    ======================================================== */

    acceptButton: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.sm,

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
        CustomerColors.primary,
    },

    acceptText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       SECONDARY ACTIONS
    ======================================================== */

    actions: {
      marginTop:
        8,

      flexDirection:
        "row",

      gap:
        FixxamTokens.spacing.sm,
    },

    secondaryButton: {
      flex:
        1,

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

    counterText: {
      color:
        CustomerColors.primary,
    },

    declineButton: {
      borderColor:
        Colors.error,
    },

    declineText: {
      color:
        Colors.error,
    },

    /* ========================================================
       STATUS PILL
    ======================================================== */

    statusPill: {
      flexShrink:
        0,

      minHeight:
        22,

      paddingHorizontal:
        7,

      paddingVertical:
        2,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        4,

      borderRadius:
        FixxamTokens.radius.full,
    },

    statusDot: {
      width:
        5,

      height:
        5,

      borderRadius:
        FixxamTokens.radius.full,
    },

    statusPillText: {
      fontSize:
        10,
    },

    /* ========================================================
       STATUS CARD
    ======================================================== */

    statusCard: {
      minHeight:
        56,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        8,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,
    },

    statusIcon: {
      width:
        34,

      height:
        34,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    statusContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    statusDescription: {
      marginTop:
        1,

      lineHeight:
        16,
    },

    /* ========================================================
       PRESS
    ======================================================== */

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

    declinePressed: {
      backgroundColor:
        Colors.errorSoft,

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

/* ==============================================================
   EXPORT
============================================================== */

CustomerOrderOfferSection.displayName =
  "CustomerOrderOfferSection";

export default memo(
  CustomerOrderOfferSection,
);