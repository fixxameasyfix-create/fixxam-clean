import React, {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import Toast from "react-native-toast-message";

import {
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

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
  CustomerColors,
  FixxamTokens,
  Typography,
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

  counterOfferStatus?: CounterOfferStatus | null;

  counterOfferBy?: CounterOfferBy;

  offerRound?: number;

  maxNegotiationRounds?: number;

  workerName: string;

  onAcceptOffer: () => void;

  onCounterOffer?: () => void;

  onDeclineOffer: () => void;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const MAX_MESSAGE_LENGTH = 300;
const MIN_MESSAGE_LENGTH = 3;
const MAX_AMOUNT = 999_999_999;

const FIRST_WORKER_OFFER_ROUND = 1;
const CUSTOMER_COUNTER_ROUND = 2;

/* ==============================================================
   HELPERS
============================================================== */

function formatAmount(
  value?: number | null,
): string {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    return "₦0";
  }

  return `₦${Math.round(
    value,
  ).toLocaleString("en-NG")}`;
}

function normalizeRound(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(value),
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

function showSuccess(
  title: string,
  message: string,
) {
  Toast.show({
    type: "success",
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

  offerRound =
    FIRST_WORKER_OFFER_ROUND,

  maxNegotiationRounds = 3,

  workerName,

  onAcceptOffer,
  onCounterOffer,
  onDeclineOffer,
}: Props) {
  /* ==========================================================
     STATE
  ========================================================== */

  const [
    counterVisible,
    setCounterVisible,
  ] = useState(false);

  const [
    amountText,
    setAmountText,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  /* ==========================================================
     SAFE VALUES
  ========================================================== */

  const safeWorkerName =
    useMemo(
      () =>
        cleanText(
          workerName,
        ) || "the worker",
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
      [
        counterOfferMessage,
      ],
    );

  /* ==========================================================
     NEGOTIATION
  ========================================================== */

  const safeOfferRound =
    normalizeRound(
      offerRound,
    );

  const safeMaxRounds =
    typeof maxNegotiationRounds ===
      "number" &&
    Number.isFinite(
      maxNegotiationRounds,
    ) &&
    maxNegotiationRounds > 0
      ? Math.floor(
          maxNegotiationRounds,
        )
      : 3;

  const maxRoundReached =
    safeOfferRound >=
    safeMaxRounds;

  const activeWorkerAmount =
    counterOfferBy === "worker" &&
    counterOfferStatus === "sent"
      ? counterOfferAmount
      : offerAmount;

  /* ==========================================================
     OPEN COUNTER
  ========================================================== */

  const handleOpenCounter =
    useCallback(() => {
      if (submitting) {
        return;
      }

      if (maxRoundReached) {
        showError(
          "Negotiation limit reached",
          `You have reached the maximum of ${safeMaxRounds} negotiation rounds. You can still accept or decline the current offer.`,
        );

        return;
      }

      if (
        typeof activeWorkerAmount !==
          "number" ||
        !Number.isFinite(
          activeWorkerAmount,
        ) ||
        activeWorkerAmount <= 0
      ) {
        showError(
          "Offer unavailable",
          "The current worker offer is not available.",
        );

        return;
      }

      setAmountText("");
      setMessage("");
      setCounterVisible(true);

      onCounterOffer?.();
    }, [
      activeWorkerAmount,
      maxRoundReached,
      onCounterOffer,
      safeMaxRounds,
      submitting,
    ]);

  /* ==========================================================
     CLOSE COUNTER
  ========================================================== */

  const handleCloseCounter =
    useCallback(() => {
      if (submitting) {
        return;
      }

      setCounterVisible(false);
      setAmountText("");
      setMessage("");
    }, [submitting]);

  /* ==========================================================
     AMOUNT INPUT
  ========================================================== */

  const handleAmountChange =
    useCallback(
      (value: string) => {
        const digits =
          value.replace(
            /[^\d]/g,
            "",
          );

        setAmountText(
          digits.slice(
            0,
            String(
              MAX_AMOUNT,
            ).length,
          ),
        );
      },
      [],
    );

  /* ==========================================================
     SEND CUSTOMER COUNTER
  ========================================================== */

  const handleSendCounter =
    useCallback(async () => {
      if (submitting) {
        return;
      }

      const customerId =
        auth.currentUser?.uid?.trim();

      if (!customerId) {
        showError(
          "Sign in required",
          "Please sign in before sending a counter offer.",
        );

        return;
      }

      const cleanBookingId =
        bookingId.trim();

      if (!cleanBookingId) {
        showError(
          "Order unavailable",
          "This order could not be identified.",
        );

        return;
      }

      /* ======================================================
         AMOUNT
      ====================================================== */

      const cleanAmount =
        amountText
          .replace(
            /,/g,
            "",
          )
          .replace(
            /₦/gi,
            "",
          )
          .trim();

      const amount =
        Number(
          cleanAmount,
        );

      if (
        !cleanAmount ||
        !Number.isFinite(
          amount,
        ) ||
        amount <= 0
      ) {
        showError(
          "Invalid amount",
          "Please enter a valid counter offer amount.",
        );

        return;
      }

      if (
        !Number.isInteger(
          amount,
        )
      ) {
        showError(
          "Invalid amount",
          "Please enter a whole number amount.",
        );

        return;
      }

      if (
        amount >
        MAX_AMOUNT
      ) {
        showError(
          "Invalid amount",
          `Please enter an amount no higher than ${formatAmount(
            MAX_AMOUNT,
          )}.`,
        );

        return;
      }

      /* ======================================================
         MESSAGE
      ====================================================== */

      const cleanMessage =
        message.trim();

      if (
        cleanMessage.length >
        MAX_MESSAGE_LENGTH
      ) {
        showError(
          "Message too long",
          `Your message cannot be more than ${MAX_MESSAGE_LENGTH} characters.`,
        );

        return;
      }

      if (
        cleanMessage.length > 0 &&
        cleanMessage.length <
          MIN_MESSAGE_LENGTH
      ) {
        showError(
          "Message too short",
          `Please enter at least ${MIN_MESSAGE_LENGTH} characters or leave the message empty.`,
        );

        return;
      }

      if (maxRoundReached) {
        showError(
          "Negotiation limit reached",
          `You have reached the maximum of ${safeMaxRounds} negotiation rounds.`,
        );

        return;
      }

      try {
        setSubmitting(true);

        const bookingRef =
          doc(
            db,
            "bookings",
            cleanBookingId,
          );

        await runTransaction(
          db,
          async (
            transaction,
          ) => {
            const snapshot =
              await transaction.get(
                bookingRef,
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

            /* ==================================================
               CUSTOMER OWNERSHIP
            ================================================== */

            const bookingCustomerId =
              typeof data.customerId ===
              "string"
                ? data.customerId.trim()
                : "";

            if (
              !bookingCustomerId ||
              bookingCustomerId !==
                customerId
            ) {
              throw new Error(
                "ACCESS_DENIED",
              );
            }

            /* ==================================================
               OFFER STATUS
            ================================================== */

            if (
              data.offerStatus !==
              "sent"
            ) {
              throw new Error(
                "OFFER_NOT_AVAILABLE",
              );
            }

            /* ==================================================
               CURRENT ROUND
            ================================================== */

            const currentRound =
              normalizeRound(
                data.offerRound,
              );

            if (
              currentRound !==
              FIRST_WORKER_OFFER_ROUND
            ) {
              throw new Error(
                "INVALID_OFFER_ROUND",
              );
            }

            if (
              currentRound >=
              safeMaxRounds
            ) {
              throw new Error(
                "MAX_ROUNDS_REACHED",
              );
            }

            /* ==================================================
               EXISTING COUNTER
            ================================================== */

            const currentCounterStatus =
              data.counterOfferStatus ??
              "none";

            if (
              currentCounterStatus !==
              "none"
            ) {
              throw new Error(
                "COUNTER_ALREADY_EXISTS",
              );
            }

            /* ==================================================
               WORKER OFFER
            ================================================== */

            const workerOfferAmount =
              typeof data.offerAmount ===
                "number" &&
              Number.isFinite(
                data.offerAmount,
              )
                ? data.offerAmount
                : null;

            if (
              workerOfferAmount !==
                null &&
              amount ===
                workerOfferAmount
            ) {
              throw new Error(
                "SAME_AMOUNT",
              );
            }

            /* ==================================================
               WRITE CUSTOMER COUNTER
            ================================================== */

            transaction.update(
              bookingRef,
              {
                counterOfferAmount:
                  amount,

                counterOfferMessage:
                  cleanMessage ||
                  null,

                counterOfferStatus:
                  "sent",

                counterOfferBy:
                  "customer",

                counterOfferSentAt:
                  serverTimestamp(),

                counterOfferRespondedAt:
                  null,

                offerRound:
                  CUSTOMER_COUNTER_ROUND,

                offerStatus:
                  "countered",

                updatedAt:
                  serverTimestamp(),
              },
            );
          },
        );

        setCounterVisible(false);
        setAmountText("");
        setMessage("");

        showSuccess(
          "Counter offer sent",
          `Your counter offer of ${formatAmount(
            amount,
          )} has been sent to ${safeWorkerName}.`,
        );
      } catch (error) {
        console.error(
          "CUSTOMER_SEND_COUNTER_OFFER_ERROR",
          error,
        );

        const errorMessage =
          error instanceof Error
            ? error.message
            : "";

        const firebaseCode =
          (
            error as {
              code?: string;
            }
          )?.code;

        switch (
          errorMessage
        ) {
          case "ORDER_NOT_FOUND":
            showError(
              "Order not found",
              "This order no longer exists.",
            );
            break;

          case "ACCESS_DENIED":
            showError(
              "Access denied",
              "You cannot send a counter offer for this order.",
            );
            break;

          case "OFFER_NOT_AVAILABLE":
            showError(
              "Offer unavailable",
              "The worker offer is no longer available.",
            );
            break;

          case "INVALID_OFFER_ROUND":
            showError(
              "Negotiation unavailable",
              "This order has already moved to another negotiation round.",
            );
            break;

          case "MAX_ROUNDS_REACHED":
            showError(
              "Negotiation limit reached",
              `You have reached the maximum of ${safeMaxRounds} negotiation rounds.`,
            );
            break;

          case "COUNTER_ALREADY_EXISTS":
            showError(
              "Counter offer already sent",
              "A counter offer is already waiting for the worker.",
            );
            break;

          case "SAME_AMOUNT":
            showError(
              "Same amount",
              "Your counter offer must be different from the worker's current offer.",
            );
            break;

          default:
            if (
              firebaseCode ===
              "permission-denied"
            ) {
              showError(
                "Permission denied",
                "This counter offer could not be submitted.",
              );
            } else {
              showError(
                "Unable to send",
                "We could not send your counter offer. Please try again.",
              );
            }

            break;
        }
      } finally {
        setSubmitting(false);
      }
    }, [
      amountText,
      bookingId,
      maxRoundReached,
      message,
      safeMaxRounds,
      safeWorkerName,
      submitting,
    ]);

  /* ==========================================================
     ACCEPTED
  ========================================================== */

  if (
    offerStatus ===
      "accepted" ||
    counterOfferStatus ===
      "accepted"
  ) {
    return (
      <StatusCard
        icon="success"
        title="OFFER ACCEPTED"
        description="The negotiated offer has been accepted."
        tone="success"
      />
    );
  }

  /* ==========================================================
     DECLINED
  ========================================================== */

  if (
    offerStatus ===
      "declined" ||
    counterOfferStatus ===
      "declined"
  ) {
    return (
      <StatusCard
        icon="error"
        title="OFFER DECLINED"
        description="This offer is no longer active."
        tone="error"
      />
    );
  }

  /* ==========================================================
     CUSTOMER COUNTER SENT
  ========================================================== */

  const customerCounterSent =
    counterOfferBy ===
      "customer" &&
    counterOfferStatus ===
      "sent" &&
    typeof counterOfferAmount ===
      "number" &&
    Number.isFinite(
      counterOfferAmount,
    ) &&
    counterOfferAmount > 0;

  if (
    customerCounterSent
  ) {
    return (
      <View
        style={styles.section}
      >
        <View
          style={styles.card}
        >
          <View
            style={styles.header}
          >
            <View
              style={
                styles.primaryIcon
              }
            >
              <AppIcon
                name="refresh"
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
                style={
                  styles.primaryTitle
                }
              >
                COUNTER OFFER SENT
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.headerSubtitle
                }
              >
                Your counter offer is waiting for{" "}
                {safeWorkerName}.
              </AppText>
            </View>
          </View>

          <AmountBox
            label="YOUR COUNTER OFFER"
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

          <View
            style={
              styles.waitingBox
            }
          >
            <AppIcon
              name="clock"
              size="xs"
              color={
                Colors.warning
              }
            />

            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.waitingBoxText
              }
            >
              WAITING FOR WORKER
            </AppText>
          </View>
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
        style={styles.section}
      >
        <View
          style={
            styles.waitingCard
          }
        >
          <View
            style={
              styles.warningIcon
            }
          >
            <AppIcon
              name="clock"
              size="md"
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
              variant="caption"
              weight="bold"
              style={
                styles.waitingTitle
              }
            >
              WAITING FOR WORKER OFFER
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.waitingText
              }
            >
              The worker will review your request and send you an offer.
            </AppText>
          </View>
        </View>
      </View>
    );
  }

  /* ==========================================================
     WORKER COUNTER RECEIVED
  ========================================================== */

  const workerCounterReceived =
    counterOfferBy ===
      "worker" &&
    counterOfferStatus ===
      "sent" &&
    typeof counterOfferAmount ===
      "number" &&
    Number.isFinite(
      counterOfferAmount,
    ) &&
    counterOfferAmount > 0;

  if (
    workerCounterReceived
  ) {
    return (
      <>
        <OfferCard
          title="COUNTER OFFER RECEIVED"
          subtitle={`${safeWorkerName} has responded to your offer.`}
          label="WORKER COUNTER OFFER"
          amount={
            counterOfferAmount
          }
          message={
            safeCounterMessage
          }
          maxRoundReached={
            maxRoundReached
          }
          disabled={
            submitting
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

        <CounterOfferModal
          visible={
            counterVisible
          }
          amountText={
            amountText
          }
          message={message}
          submitting={
            submitting
          }
          currentAmount={
            counterOfferAmount
          }
          onAmountChange={
            handleAmountChange
          }
          onMessageChange={
            setMessage
          }
          onClose={
            handleCloseCounter
          }
          onSubmit={() => {
            void handleSendCounter();
          }}
        />
      </>
    );
  }

  /* ==========================================================
     INITIAL WORKER OFFER
  ========================================================== */

  const workerOfferReceived =
    offerStatus === "sent" &&
    typeof offerAmount ===
      "number" &&
    Number.isFinite(
      offerAmount,
    ) &&
    offerAmount > 0;

  if (
    workerOfferReceived
  ) {
    return (
      <>
        <OfferCard
          title="WORKER OFFER RECEIVED"
          subtitle={`${safeWorkerName} has sent you an offer.`}
          label="WORKER OFFER"
          amount={
            offerAmount
          }
          message={
            safeOfferMessage
          }
          maxRoundReached={
            maxRoundReached
          }
          disabled={
            submitting
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

        <CounterOfferModal
          visible={
            counterVisible
          }
          amountText={
            amountText
          }
          message={message}
          submitting={
            submitting
          }
          currentAmount={
            offerAmount
          }
          onAmountChange={
            handleAmountChange
          }
          onMessageChange={
            setMessage
          }
          onClose={
            handleCloseCounter
          }
          onSubmit={() => {
            void handleSendCounter();
          }}
        />
      </>
    );
  }

  /* ==========================================================
     FALLBACK
  ========================================================== */

  return (
    <StatusCard
      icon="info"
      title="NEGOTIATION UPDATE"
      description="The offer status is being updated."
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

  maxRoundReached: boolean;

  disabled: boolean;

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
  maxRoundReached,
  disabled,
  onAccept,
  onCounter,
  onDecline,
}: OfferCardProps) {
  return (
    <View
      style={styles.section}
    >
      <View
        style={styles.card}
      >
        <View
          style={styles.header}
        >
          <View
            style={
              styles.primaryIcon
            }
          >
            <AppIcon
              name="refresh"
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
              style={
                styles.primaryTitle
              }
            >
              {title}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.headerSubtitle
              }
            >
              {subtitle}
            </AppText>
          </View>
        </View>

        <AmountBox
          label={label}
          amount={amount}
        />

        {message ? (
          <MessageBox
            message={message}
          />
        ) : null}

        {maxRoundReached ? (
          <View
            style={
              styles.limitBox
            }
          >
            <AppIcon
              name="info"
              size="xs"
              color={
                Colors.warning
              }
            />

            <AppText
              variant="caption"
              style={
                styles.limitText
              }
            >
              Negotiation limit reached. You can still accept or decline this offer.
            </AppText>
          </View>
        ) : null}

        {/* ==================================================
            ACCEPT
        ================================================== */}

        <Pressable
          onPress={onAccept}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={`Accept ${formatAmount(
            amount,
          )}`}
          accessibilityState={{
            disabled,
          }}
          style={({
            pressed,
          }) => [
            styles.acceptButton,

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
            ACCEPT{" "}
            {formatAmount(
              amount,
            )}
          </AppText>
        </Pressable>

        {/* ==================================================
            SECONDARY ACTIONS
        ================================================== */}

        <View
          style={styles.actions}
        >
          <Pressable
            onPress={onCounter}
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
                ? styles.disabled
                : null,

              pressed &&
              !disabled
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
              weight="bold"
              style={
                styles.counterText
              }
            >
              COUNTER
            </AppText>
          </Pressable>

          <Pressable
            onPress={onDecline}
            disabled={
              disabled
            }
            accessibilityRole="button"
            accessibilityLabel="Decline worker offer"
            accessibilityState={{
              disabled,
            }}
            style={({
              pressed,
            }) => [
              styles.declineButton,

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
      </View>
    </View>
  );
}

/* ==============================================================
   AMOUNT BOX
============================================================== */

function AmountBox({
  label,
  amount,
}: {
  label: string;

  amount: number;
}) {
  return (
    <View
      style={
        styles.amountContainer
      }
    >
      <AppText
        variant="caption"
        tone="muted"
        weight="semibold"
        style={
          styles.amountLabel
        }
      >
        {label}
      </AppText>

      <AppText
        variant="heading2"
        weight="bold"
        style={styles.amount}
      >
        {formatAmount(
          amount,
        )}
      </AppText>
    </View>
  );
}

/* ==============================================================
   MESSAGE BOX
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
      style={styles.section}
    >
      <View
        style={
          styles.statusCard
        }
      >
        <View
          style={[
            styles.statusIcon,

            {
              backgroundColor:
                config.background,
            },
          ]}
        >
          <AppIcon
            name={icon}
            size="md"
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
            variant="caption"
            weight="bold"
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
   COUNTER OFFER MODAL
============================================================== */

type CounterOfferModalProps = {
  visible: boolean;

  amountText: string;

  message: string;

  submitting: boolean;

  currentAmount?: number | null;

  onAmountChange: (
    value: string,
  ) => void;

  onMessageChange: (
    value: string,
  ) => void;

  onClose: () => void;

  onSubmit: () => void;
};

function CounterOfferModal({
  visible,
  amountText,
  message,
  submitting,
  currentAmount,
  onAmountChange,
  onMessageChange,
  onClose,
  onSubmit,
}: CounterOfferModalProps) {
  const insets =
    useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={
        onClose
      }
    >
      <KeyboardAvoidingView
        style={
          styles.modalRoot
        }
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <Pressable
          style={
            styles.backdrop
          }
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close counter offer"
        />

        <View
          style={[
            styles.modalCard,

            {
              paddingBottom:
                Math.max(
                  insets.bottom,
                  FixxamTokens
                    .spacing.lg,
                ),
            },
          ]}
        >
          {/* ==================================================
              HEADER
          ================================================== */}

          <View
            style={
              styles.modalHeader
            }
          >
            <View
              style={
                styles.modalHeaderContent
              }
            >
              <AppText
                variant="bodyLarge"
                weight="bold"
              >
                Send Counter Offer
              </AppText>

              {typeof currentAmount ===
                "number" &&
              Number.isFinite(
                currentAmount,
              ) &&
              currentAmount >
                0 ? (
                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.modalSubtitle
                  }
                >
                  Current offer:{" "}
                  {formatAmount(
                    currentAmount,
                  )}
                </AppText>
              ) : null}
            </View>

            <Pressable
              onPress={onClose}
              disabled={
                submitting
              }
              accessibilityRole="button"
              accessibilityLabel="Close"
              accessibilityState={{
                disabled:
                  submitting,
              }}
              style={({
                pressed,
              }) => [
                styles.closeButton,

                pressed &&
                !submitting
                  ? styles.pressed
                  : null,
              ]}
            >
              <AppIcon
                name="close"
                size="sm"
                color={
                  Colors.textPrimary
                }
              />
            </Pressable>
          </View>

          {/* ==================================================
              AMOUNT
          ================================================== */}

          <AppText
            variant="caption"
            weight="semibold"
            style={
              styles.inputLabel
            }
          >
            Counter amount
          </AppText>

          <View
            style={
              styles.amountInputContainer
            }
          >
            <AppText
              variant="bodyLarge"
              weight="bold"
              style={
                styles.currency
              }
            >
              ₦
            </AppText>

            <TextInput
              value={
                amountText
              }
              onChangeText={
                onAmountChange
              }
              keyboardType="number-pad"
              returnKeyType="done"
              placeholder="Enter amount"
              placeholderTextColor={
                Colors.textMuted
              }
              editable={
                !submitting
              }
              maxLength={
                String(
                  MAX_AMOUNT,
                ).length
              }
              style={
                styles.amountInput
              }
              accessibilityLabel="Counter offer amount"
            />
          </View>

          {/* ==================================================
              MESSAGE
          ================================================== */}

          <View
            style={
              styles.messageHeader
            }
          >
            <AppText
              variant="caption"
              weight="semibold"
            >
              Message
            </AppText>

            <AppText
              variant="caption"
              tone="muted"
            >
              {message.length}/
              {MAX_MESSAGE_LENGTH}
            </AppText>
          </View>

          <TextInput
            value={message}
            onChangeText={
              onMessageChange
            }
            editable={
              !submitting
            }
            multiline
            maxLength={
              MAX_MESSAGE_LENGTH
            }
            textAlignVertical="top"
            placeholder="Add a short message (optional)"
            placeholderTextColor={
              Colors.textMuted
            }
            style={
              styles.messageInput
            }
            accessibilityLabel="Counter offer message"
          />

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <View
            style={
              styles.modalActions
            }
          >
            <Pressable
              onPress={onClose}
              disabled={
                submitting
              }
              accessibilityRole="button"
              accessibilityLabel="Cancel counter offer"
              accessibilityState={{
                disabled:
                  submitting,
              }}
              style={({
                pressed,
              }) => [
                styles.modalCancel,

                submitting
                  ? styles.disabled
                  : null,

                pressed &&
                !submitting
                  ? styles.pressed
                  : null,
              ]}
            >
              <AppText
                variant="body"
                weight="semibold"
                tone="secondary"
              >
                Cancel
              </AppText>
            </Pressable>

            <Pressable
              onPress={onSubmit}
              disabled={
                submitting
              }
              accessibilityRole="button"
              accessibilityLabel="Send counter offer"
              accessibilityState={{
                disabled:
                  submitting,
              }}
              style={({
                pressed,
              }) => [
                styles.modalSubmit,

                submitting
                  ? styles.disabled
                  : null,

                pressed &&
                !submitting
                  ? styles.pressed
                  : null,
              ]}
            >
              {submitting ? (
                <ActivityIndicator
                  size="small"
                  color={
                    Colors.textInverse
                  }
                />
              ) : (
                <>
                  <AppIcon
                    name="refresh"
                    size="xs"
                    color={
                      Colors.textInverse
                    }
                  />

                  <AppText
                    variant="body"
                    weight="bold"
                    style={
                      styles.modalSubmitText
                    }
                  >
                    Send Counter
                  </AppText>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ==============================================================
   EXPORT
============================================================== */

export default memo(
  CustomerOrderOfferSection,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    section: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.md,
    },

    card: {
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

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection: "row",

      alignItems: "center",
    },

    primaryIcon: {
      width:
        FixxamTokens.size
          .iconBox,

      height:
        FixxamTokens.size
          .iconBox,

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

    primaryTitle: {
      color:
        CustomerColors.primary,
    },

    headerSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       AMOUNT
    ======================================================== */

    amountContainer: {
      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.background,
    },

    amountLabel: {
      letterSpacing: 0.6,
    },

    amount: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       MESSAGE
    ======================================================== */

    messageContainer: {
      marginTop:
        FixxamTokens.spacing.sm,

      paddingTop:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems:
        "flex-start",

      gap:
        FixxamTokens.spacing.xs,

      borderTopWidth: 1,

      borderTopColor:
        Colors.divider,
    },

    messageText: {
      flex: 1,

      minWidth: 0,
    },

    /* ========================================================
       WAITING
    ======================================================== */

    waitingCard: {
      minHeight: 80,

      flexDirection: "row",

      alignItems: "center",

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    warningIcon: {
      width:
        FixxamTokens.size
          .iconBox,

      height:
        FixxamTokens.size
          .iconBox,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.warningSoft,
    },

    waitingContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    waitingTitle: {
      color:
        Colors.warning,
    },

    waitingText: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    waitingBox: {
      minHeight: 40,

      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.warningSoft,
    },

    waitingBoxText: {
      color:
        Colors.warning,
    },

    limitBox: {
      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems:
        "flex-start",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.warningSoft,
    },

    limitText: {
      flex: 1,

      color:
        Colors.warning,
    },

    /* ========================================================
       ACTIONS
    ======================================================== */

    acceptButton: {
      minHeight:
        FixxamTokens.size
          .buttonHeight,

      marginTop:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

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

    actions: {
      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      gap:
        FixxamTokens.spacing.sm,
    },

    counterButton: {
      flex: 1,

      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

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

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

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
       STATUS
    ======================================================== */

    statusCard: {
      minHeight: 76,

      padding:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    statusIcon: {
      width:
        FixxamTokens.size
          .iconBox,

      height:
        FixxamTokens.size
          .iconBox,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.full,
    },

    statusContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    statusDescription: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       MODAL
    ======================================================== */

    modalRoot: {
      flex: 1,

      justifyContent:
        "flex-end",
    },

    backdrop: {
      ...StyleSheet.absoluteFillObject,

      backgroundColor:
        Colors.overlayMedium,
    },

    modalCard: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.lg,

      borderTopLeftRadius:
        FixxamTokens.radius.xl,

      borderTopRightRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,
    },

    modalHeader: {
      flexDirection: "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,
    },

    modalHeaderContent: {
      flex: 1,

      minWidth: 0,
    },

    modalSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    closeButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    inputLabel: {
      marginTop:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.xs,
    },

    amountInputContainer: {
      height:
        FixxamTokens.size
          .inputHeight,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.input,

      backgroundColor:
        Colors.surface,
    },

    currency: {
      marginRight:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    amountInput: {
      flex: 1,

      height: "100%",

      paddingVertical: 0,

      fontSize:
        Typography.fontSize.md,

      color:
        Colors.textPrimary,
    },

    messageHeader: {
      marginTop:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.xs,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",
    },

    messageInput: {
      minHeight: 108,

      maxHeight: 150,

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.input,

      backgroundColor:
        Colors.surface,

      fontSize:
        Typography.fontSize.md,

      color:
        Colors.textPrimary,
    },

    modalActions: {
      marginTop:
        FixxamTokens.spacing.lg,

      flexDirection: "row",

      gap:
        FixxamTokens.spacing.sm,
    },

    modalCancel: {
      flex: 1,

      minHeight:
        FixxamTokens.size
          .buttonHeight,

      alignItems: "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        Colors.surface,
    },

    modalSubmit: {
      flex: 1,

      minHeight:
        FixxamTokens.size
          .buttonHeight,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    modalSubmitText: {
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