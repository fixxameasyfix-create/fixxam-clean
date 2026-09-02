import React, {
  memo,
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { AppText } from "@/components/ui";

import {
  auth,
  db,
} from "@/firebase/config";

/* ============================================================
   TYPES
============================================================ */

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

  /* ==========================================================
     NEGOTIATION
  ========================================================== */

  offerRound?: number;
  maxNegotiationRounds?: number;

  workerName: string;

  onAcceptOffer: () => void;
  onCounterOffer?: () => void;
  onDeclineOffer: () => void;
};

/* ============================================================
   HELPERS
============================================================ */

function formatAmount(
  value?: number | null,
): string {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return "₦0";
  }

  return `₦${value.toLocaleString("en-NG")}`;
}

/* ============================================================
   COMPONENT
============================================================ */

function CustomerOrderOfferSection({
  bookingId,
  offerStatus,
  offerAmount,
  offerMessage,
  counterOfferAmount,
  counterOfferMessage,
  counterOfferStatus,
  counterOfferBy,

  offerRound = 1,
  maxNegotiationRounds = 3,

  workerName,
  onAcceptOffer,
  onCounterOffer,
  onDeclineOffer,
}: Props) {
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
     NEGOTIATION STATE
  ========================================================== */

  const safeOfferRound =
    Number.isFinite(offerRound) &&
    offerRound > 0
      ? Math.floor(offerRound)
      : 1;

  const safeMaxRounds =
    Number.isFinite(
      maxNegotiationRounds,
    ) &&
    maxNegotiationRounds > 0
      ? Math.floor(
          maxNegotiationRounds,
        )
      : 3;

  const maxRoundReached =
    safeOfferRound >= safeMaxRounds;

  /* ==========================================================
     OPEN COUNTER MODAL
  ========================================================== */

  const handleOpenCounter =
    useCallback(() => {
      if (maxRoundReached) {
        Alert.alert(
          "Negotiation limit reached",
          `You have reached the maximum of ${safeMaxRounds} negotiation rounds. You can still accept or decline the current offer.`,
        );

        return;
      }

      const currentAmount =
        counterOfferBy === "worker"
          ? counterOfferAmount
          : offerAmount;

      if (
        typeof currentAmount !==
          "number" ||
        currentAmount <= 0
      ) {
        Alert.alert(
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
      counterOfferAmount,
      counterOfferBy,
      maxRoundReached,
      offerAmount,
      onCounterOffer,
      safeMaxRounds,
    ]);

  /* ==========================================================
     CLOSE COUNTER MODAL
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
     SEND CUSTOMER COUNTER
  ========================================================== */

  const handleSendCounter =
    useCallback(async () => {
      const customerId =
        auth.currentUser?.uid;

      if (!customerId) {
        Alert.alert(
          "Sign in required",
          "Please sign in before sending a counter offer.",
        );

        return;
      }

      if (!bookingId.trim()) {
        Alert.alert(
          "Order unavailable",
          "This order could not be identified.",
        );

        return;
      }

      if (maxRoundReached) {
        Alert.alert(
          "Negotiation limit reached",
          `You have reached the maximum of ${safeMaxRounds} negotiation rounds.`,
        );

        return;
      }

      const cleanAmount =
        amountText
          .replace(/,/g, "")
          .replace(/₦/gi, "")
          .trim();

      const amount =
        Number(cleanAmount);

      const cleanMessage =
        message.trim();

      /* --------------------------------------------------------
         AMOUNT VALIDATION
      -------------------------------------------------------- */

      if (
        !cleanAmount ||
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        Alert.alert(
          "Invalid amount",
          "Please enter a valid counter offer amount.",
        );

        return;
      }

      if (!Number.isInteger(amount)) {
        Alert.alert(
          "Invalid amount",
          "Please enter a whole number amount.",
        );

        return;
      }

      /* --------------------------------------------------------
         COMPARE CURRENT OFFER
      -------------------------------------------------------- */

      const currentAmount =
        counterOfferBy === "worker"
          ? counterOfferAmount
          : offerAmount;

      if (
        typeof currentAmount ===
          "number" &&
        amount === currentAmount
      ) {
        Alert.alert(
          "Same amount",
          "Your counter offer must be different from the current offer.",
        );

        return;
      }

      /* --------------------------------------------------------
         MESSAGE
      -------------------------------------------------------- */

      if (
        cleanMessage.length > 300
      ) {
        Alert.alert(
          "Message too long",
          "Your message cannot be more than 300 characters.",
        );

        return;
      }

      /* --------------------------------------------------------
         ORDER STATE
      -------------------------------------------------------- */

      if (
        offerStatus !== "sent" &&
        offerStatus !== "countered"
      ) {
        Alert.alert(
          "Offer unavailable",
          "This offer is no longer available for negotiation.",
        );

        return;
      }

      try {
        setSubmitting(true);

        const bookingRef =
          doc(
            db,
            "bookings",
            bookingId,
          );

        await updateDoc(
  bookingRef,
  {
    /*
     * Keep worker's original offer.
     */
    offerAmount:
      offerAmount ?? null,

    offerMessage:
      offerMessage ?? null,

    /*
     * CUSTOMER COUNTER
     */
    counterOfferAmount:
      amount,

    counterOfferMessage:
      cleanMessage || null,

    counterOfferStatus:
      "sent",

    counterOfferBy:
      "customer",

    counterOfferSentAt:
      serverTimestamp(),

    counterOfferRespondedAt:
      null,

    /*
     * Negotiation state
     *
     * Example:
     * 1 = worker first offer
     * 2 = customer counter
     * 3 = worker counter
     */
    offerRound:
      Math.min(
        safeMaxRounds,
        safeOfferRound + 1,
      ),

    offerStatus:
      "countered",

    updatedAt:
      serverTimestamp(),
  },
);

        setCounterVisible(false);
        setAmountText("");
        setMessage("");

        Alert.alert(
          "Counter offer sent",
          `Your counter offer of ${formatAmount(
            amount,
          )} has been sent to ${workerName}.`,
        );
      } catch (error) {
        console.error(
          "CUSTOMER_SEND_COUNTER_OFFER_ERROR",
          error,
        );

        Alert.alert(
          "Unable to send",
          "We could not send your counter offer. Please try again.",
        );
      } finally {
        setSubmitting(false);
      }
    }, [
      amountText,
      bookingId,
      counterOfferAmount,
      counterOfferBy,
      message,
      maxRoundReached,
      offerAmount,
      offerMessage,
      offerStatus,
      safeMaxRounds,
      workerName,
    ]);

  /* ==========================================================
     CUSTOMER COUNTER SENT
  ========================================================== */

  const customerCounterSent =
    counterOfferBy === "customer" &&
    counterOfferStatus === "sent" &&
    typeof counterOfferAmount ===
      "number" &&
    counterOfferAmount > 0;

  if (customerCounterSent) {
    return (
      <View style={styles.section}>
        <View style={styles.sentCard}>
          <View style={styles.header}>
            <View style={styles.sentIcon}>
              <Ionicons
                name="swap-horizontal-outline"
                size={24}
                color="#7C3AED"
              />
            </View>

            <View style={styles.headerContent}>
              <AppText
                weight="bold"
                style={styles.sentTitle}
              >
                COUNTER OFFER SENT
              </AppText>

              <AppText
                style={styles.sentSubtitle}
              >
                Your counter offer is waiting for{" "}
                {workerName}.
              </AppText>
            </View>
          </View>

          <View
            style={
              styles.counterAmountContainer
            }
          >
            <AppText
              style={styles.amountLabel}
            >
              YOUR COUNTER OFFER
            </AppText>

            <AppText
              weight="bold"
              style={styles.amount}
            >
              {formatAmount(
                counterOfferAmount,
              )}
            </AppText>
          </View>

          {counterOfferMessage ? (
            <View
              style={styles.messageContainer}
            >
              <Ionicons
                name="chatbubble-outline"
                size={17}
                color="#64748B"
              />

              <AppText
                style={styles.messageText}
              >
                "{counterOfferMessage}"
              </AppText>
            </View>
          ) : null}

          <View style={styles.waitingBox}>
            <Ionicons
              name="time-outline"
              size={18}
              color="#D97706"
            />

            <AppText
              weight="bold"
              style={styles.waitingBoxText}
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

  if (offerStatus === "none") {
    return (
      <View style={styles.section}>
        <View style={styles.waitingCard}>
          <View style={styles.waitingIcon}>
            <Ionicons
              name="time-outline"
              size={24}
              color="#D97706"
            />
          </View>

          <View style={styles.waitingContent}>
            <AppText
              weight="bold"
              style={styles.waitingTitle}
            >
              WAITING FOR WORKER OFFER
            </AppText>

            <AppText
              style={styles.waitingText}
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

  if (
    offerStatus === "countered" &&
    counterOfferBy === "worker" &&
    counterOfferStatus === "sent" &&
    typeof counterOfferAmount ===
      "number"
  ) {
    return (
      <>
        <View style={styles.section}>
          <View style={styles.counterCard}>
            <View style={styles.header}>
              <View style={styles.counterIcon}>
                <Ionicons
                  name="swap-horizontal-outline"
                  size={24}
                  color="#7C3AED"
                />
              </View>

              <View style={styles.headerContent}>
                <AppText
                  weight="bold"
                  style={styles.counterTitle}
                >
                  COUNTER OFFER RECEIVED
                </AppText>

                <AppText
                  style={styles.counterSubtitle}
                >
                  {workerName} has responded with a new offer.
                </AppText>
              </View>
            </View>

            <View style={styles.amountContainer}>
              <AppText
                style={styles.amountLabel}
              >
                WORKER COUNTER OFFER
              </AppText>

              <AppText
                weight="bold"
                style={styles.amount}
              >
                {formatAmount(
                  counterOfferAmount,
                )}
              </AppText>
            </View>

            {counterOfferMessage ? (
              <View
                style={
                  styles.messageContainer
                }
              >
                <AppText
                  style={styles.messageText}
                >
                  "{counterOfferMessage}"
                </AppText>
              </View>
            ) : null}

            <Pressable
              onPress={onAcceptOffer}
              accessibilityRole="button"
              accessibilityLabel={`Accept ${formatAmount(
                counterOfferAmount,
              )} counter offer`}
              style={({ pressed }) => [
                styles.acceptButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#FFFFFF"
              />

              <AppText
                weight="bold"
                style={styles.acceptText}
              >
                ACCEPT{" "}
                {formatAmount(
                  counterOfferAmount,
                )}
              </AppText>
            </Pressable>

            <View style={styles.actionsRow}>
              <Pressable
                onPress={
                  maxRoundReached
                    ? undefined
                    : handleOpenCounter
                }
                disabled={
                  maxRoundReached
                }
                accessibilityRole="button"
                accessibilityLabel="Make another counter offer"
                accessibilityState={{
                  disabled:
                    maxRoundReached,
                }}
                style={({ pressed }) => [
                  styles.counterButton,
                  maxRoundReached &&
                    styles.counterButtonDisabled,
                  pressed &&
                    !maxRoundReached &&
                    styles.pressed,
                ]}
              >
                <Ionicons
                  name="swap-horizontal-outline"
                  size={18}
                  color={
                    maxRoundReached
                      ? "#94A3B8"
                      : "#2563EB"
                  }
                />

                <AppText
                  weight="bold"
                  style={[
                    styles.counterButtonText,
                    maxRoundReached &&
                      styles.disabledActionText,
                  ]}
                >
                  COUNTER
                </AppText>
              </Pressable>

              <Pressable
                onPress={onDeclineOffer}
                accessibilityRole="button"
                accessibilityLabel="Decline counter offer"
                style={({ pressed }) => [
                  styles.declineButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color="#DC2626"
                />

                <AppText
                  weight="bold"
                  style={
                    styles.declineButtonText
                  }
                >
                  DECLINE
                </AppText>
              </Pressable>
            </View>

            {maxRoundReached ? (
              <View style={styles.roundLimitBox}>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color="#64748B"
                />

                <AppText
                  style={styles.roundLimitText}
                >
                  Maximum negotiation rounds reached. You can still accept or decline this offer.
                </AppText>
              </View>
            ) : null}
          </View>
        </View>

        <CounterOfferModal
          visible={counterVisible}
          workerName={workerName}
          currentOffer={
            counterOfferAmount
          }
          amountText={amountText}
          message={message}
          submitting={submitting}
          onChangeAmount={
            setAmountText
          }
          onChangeMessage={
            setMessage
          }
          onClose={
            handleCloseCounter
          }
          onSubmit={
            handleSendCounter
          }
        />
      </>
    );
  }

  /* ==========================================================
     WORKER OFFER RECEIVED
  ========================================================== */

  if (
    offerStatus === "sent" &&
    typeof offerAmount === "number"
  ) {
    return (
      <>
        <View style={styles.section}>
          <View style={styles.offerCard}>
            <View style={styles.header}>
              <View style={styles.offerIcon}>
                <Ionicons
                  name="cash-outline"
                  size={24}
                  color="#2563EB"
                />
              </View>

              <View style={styles.headerContent}>
                <AppText
                  weight="bold"
                  style={styles.offerTitle}
                >
                  OFFER RECEIVED
                </AppText>

                <AppText
                  style={styles.offerSubtitle}
                >
                  {workerName} has sent you an offer.
                </AppText>
              </View>
            </View>

            <View style={styles.amountContainer}>
              <AppText
                style={styles.amountLabel}
              >
                WORKER OFFER
              </AppText>

              <AppText
                weight="bold"
                style={styles.amount}
              >
                {formatAmount(
                  offerAmount,
                )}
              </AppText>
            </View>

            {offerMessage ? (
              <View
                style={
                  styles.messageContainer
                }
              >
                <AppText
                  style={styles.messageText}
                >
                  "{offerMessage}"
                </AppText>
              </View>
            ) : null}

            <Pressable
              onPress={onAcceptOffer}
              accessibilityRole="button"
              accessibilityLabel={`Accept ${formatAmount(
                offerAmount,
              )} worker offer`}
              style={({ pressed }) => [
                styles.acceptButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#FFFFFF"
              />

              <AppText
                weight="bold"
                style={styles.acceptText}
              >
                ACCEPT{" "}
                {formatAmount(
                  offerAmount,
                )}
              </AppText>
            </Pressable>

            <View style={styles.actionsRow}>
              <Pressable
                onPress={
                  maxRoundReached
                    ? undefined
                    : handleOpenCounter
                }
                disabled={
                  maxRoundReached
                }
                accessibilityRole="button"
                accessibilityLabel="Counter worker offer"
                accessibilityState={{
                  disabled:
                    maxRoundReached,
                }}
                style={({ pressed }) => [
                  styles.counterButton,
                  maxRoundReached &&
                    styles.counterButtonDisabled,
                  pressed &&
                    !maxRoundReached &&
                    styles.pressed,
                ]}
              >
                <Ionicons
                  name="swap-horizontal-outline"
                  size={18}
                  color={
                    maxRoundReached
                      ? "#94A3B8"
                      : "#2563EB"
                  }
                />

                <AppText
                  weight="bold"
                  style={[
                    styles.counterButtonText,
                    maxRoundReached &&
                      styles.disabledActionText,
                  ]}
                >
                  COUNTER
                </AppText>
              </Pressable>

              <Pressable
                onPress={onDeclineOffer}
                accessibilityRole="button"
                accessibilityLabel="Decline worker offer"
                style={({ pressed }) => [
                  styles.declineButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color="#DC2626"
                />

                <AppText
                  weight="bold"
                  style={
                    styles.declineButtonText
                  }
                >
                  DECLINE
                </AppText>
              </Pressable>
            </View>

            {maxRoundReached ? (
              <View style={styles.roundLimitBox}>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color="#64748B"
                />

                <AppText
                  style={styles.roundLimitText}
                >
                  Maximum negotiation rounds reached. You can still accept or decline this offer.
                </AppText>
              </View>
            ) : null}
          </View>
        </View>

        <CounterOfferModal
          visible={counterVisible}
          workerName={workerName}
          currentOffer={offerAmount}
          amountText={amountText}
          message={message}
          submitting={submitting}
          onChangeAmount={
            setAmountText
          }
          onChangeMessage={
            setMessage
          }
          onClose={
            handleCloseCounter
          }
          onSubmit={
            handleSendCounter
          }
        />
      </>
    );
  }

  /* ==========================================================
     ACCEPTED
  ========================================================== */

  if (offerStatus === "accepted") {
    const acceptedAmount =
      counterOfferAmount ??
      offerAmount;

    return (
      <View style={styles.section}>
        <View style={styles.acceptedCard}>
          <View style={styles.acceptedIcon}>
            <Ionicons
              name="checkmark-circle"
              size={25}
              color="#16A34A"
            />
          </View>

          <View style={styles.acceptedContent}>
            <AppText
              weight="bold"
              style={styles.acceptedTitle}
            >
              OFFER ACCEPTED
            </AppText>

            <AppText
              style={styles.acceptedText}
            >
              {acceptedAmount != null
                ? `${formatAmount(
                    acceptedAmount,
                  )} accepted.`
                : "The worker offer has been accepted."}
            </AppText>
          </View>
        </View>
      </View>
    );
  }

  /* ==========================================================
     DECLINED
  ========================================================== */

  if (offerStatus === "declined") {
    return (
      <View style={styles.section}>
        <View style={styles.declinedCard}>
          <View style={styles.declinedIcon}>
            <Ionicons
              name="close-circle-outline"
              size={24}
              color="#DC2626"
            />
          </View>

          <View style={styles.declinedContent}>
            <AppText
              weight="bold"
              style={styles.declinedTitle}
            >
              OFFER DECLINED
            </AppText>

            <AppText
              style={styles.declinedText}
            >
              This worker offer was declined.
            </AppText>
          </View>
        </View>
      </View>
    );
  }

  return null;
}

export default memo(
  CustomerOrderOfferSection,
);

/* ============================================================
   COUNTER OFFER MODAL
============================================================ */

function CounterOfferModal({
  visible,
  workerName,
  currentOffer,
  amountText,
  message,
  submitting,
  onChangeAmount,
  onChangeMessage,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  workerName: string;
  currentOffer?: number | null;
  amountText: string;
  message: string;
  submitting: boolean;
  onChangeAmount: (
    value: string,
  ) => void;
  onChangeMessage: (
    value: string,
  ) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const cleanAmount =
    amountText
      .replace(/,/g, "")
      .replace(/₦/gi, "")
      .trim();

  const numericAmount =
    Number(cleanAmount);

  const canSubmit =
    cleanAmount.length > 0 &&
    Number.isFinite(numericAmount) &&
    numericAmount > 0 &&
    Number.isInteger(numericAmount) &&
    !submitting;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalRoot}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={
            submitting
              ? undefined
              : onClose
          }
        />

        <View style={styles.modalCard}>
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <View
              style={
                styles.modalTitleContainer
              }
            >
              <AppText
                weight="bold"
                style={styles.modalTitle}
              >
                Counter Offer
              </AppText>

              <AppText
                style={styles.modalSubtitle}
              >
                Make a new offer to the worker
              </AppText>
            </View>

            <Pressable
              onPress={onClose}
              disabled={submitting}
              style={styles.closeButton}
            >
              <Ionicons
                name="close"
                size={21}
                color="#0F172A"
              />
            </Pressable>
          </View>

          <View style={styles.modalHero}>
            <View
              style={
                styles.modalHeroIcon
              }
            >
              <Ionicons
                name="swap-horizontal-outline"
                size={29}
                color="#2563EB"
              />
            </View>

            <AppText
              weight="bold"
              style={styles.modalHeroTitle}
            >
              Negotiate the price
            </AppText>

            <AppText
              center
              style={styles.modalHeroText}
            >
              Enter the amount you are willing to pay for this service.
            </AppText>
          </View>

          <View
            style={
              styles.currentOfferCard
            }
          >
            <View
              style={
                styles.currentOfferIcon
              }
            >
              <Ionicons
                name="person-outline"
                size={22}
                color="#2563EB"
              />
            </View>

            <View
              style={
                styles.currentOfferInfo
              }
            >
              <AppText
                style={
                  styles.currentOfferLabel
                }
              >
                WORKER OFFER
              </AppText>

              <AppText
                weight="bold"
                style={
                  styles.currentWorkerName
                }
                numberOfLines={1}
              >
                {workerName}
              </AppText>
            </View>

            <View
              style={
                styles.currentAmountContainer
              }
            >
              <AppText
                style={
                  styles.currentAmountLabel
                }
              >
                CURRENT
              </AppText>

              <AppText
                weight="bold"
                style={
                  styles.currentAmount
                }
              >
                {formatAmount(
                  currentOffer,
                )}
              </AppText>
            </View>
          </View>

          <View
            style={styles.formSection}
          >
            <AppText
              weight="bold"
              style={styles.formLabel}
            >
              Your Counter Offer
            </AppText>

            <View
              style={
                styles.amountInputContainer
              }
            >
              <View
                style={
                  styles.nairaContainer
                }
              >
                <AppText
                  weight="bold"
                  style={
                    styles.nairaText
                  }
                >
                  ₦
                </AppText>
              </View>

              <TextInput
                value={amountText}
                onChangeText={
                  onChangeAmount
                }
                keyboardType="number-pad"
                placeholder="Enter amount"
                placeholderTextColor="#94A3B8"
                editable={!submitting}
                maxLength={10}
                style={
                  styles.amountInput
                }
              />
            </View>
          </View>

          <View
            style={styles.formSection}
          >
            <View
              style={
                styles.messageLabelRow
              }
            >
              <AppText
                weight="bold"
                style={styles.formLabel}
              >
                Message to Worker
              </AppText>

              <AppText
                style={
                  styles.characterCount
                }
              >
                {message.length}/300
              </AppText>
            </View>

            <View
              style={
                styles.messageInputContainer
              }
            >
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color="#2563EB"
                style={
                  styles.messageInputIcon
                }
              />

              <TextInput
                value={message}
                onChangeText={
                  onChangeMessage
                }
                placeholder="Write a message to the worker..."
                placeholderTextColor="#94A3B8"
                multiline
                maxLength={300}
                editable={!submitting}
                textAlignVertical="top"
                style={
                  styles.messageInput
                }
              />
            </View>

            <AppText
              style={styles.helperText}
            >
              Explain your counter offer briefly.
            </AppText>
          </View>

          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#64748B"
            />

            <AppText
              style={styles.infoText}
            >
              The worker will receive your counter offer and can accept, decline, or respond with another offer.
            </AppText>
          </View>

          <Pressable
            onPress={onSubmit}
            disabled={!canSubmit}
            style={({ pressed }) => [
              styles.sendButton,
              !canSubmit &&
                styles.sendButtonDisabled,
              pressed &&
                canSubmit &&
                styles.pressed,
            ]}
          >
            {submitting ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <>
                <AppText
                  weight="bold"
                  style={
                    styles.sendButtonText
                  }
                >
                  SEND COUNTER OFFER
                </AppText>

                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#FFFFFF"
                />
              </>
            )}
          </Pressable>

          <Pressable
            onPress={onClose}
            disabled={submitting}
            style={styles.cancelButton}
          >
            <AppText
              weight="bold"
              style={
                styles.cancelButtonText
              }
            >
              CANCEL
            </AppText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    section: {
      marginTop: 18,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
    },

    headerContent: {
      flex: 1,
      marginLeft: 11,
    },

    pressed: {
      opacity: 0.8,
      transform: [
        {
          scale: 0.985,
        },
      ],
    },

    /* ========================================================
       OFFER
    ======================================================== */

    offerCard: {
      padding: 15,
      borderRadius: 20,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#BFDBFE",
    },

    offerIcon: {
      width: 50,
      height: 50,
      borderRadius: 16,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    offerTitle: {
      fontSize: 12,
      color: "#2563EB",
      letterSpacing: 0.3,
    },

    offerSubtitle: {
      marginTop: 4,
      fontSize: 10,
      lineHeight: 15,
      color: "#64748B",
    },

    /* ========================================================
       COUNTER RECEIVED
    ======================================================== */

    counterCard: {
      padding: 15,
      borderRadius: 20,
      backgroundColor: "#FAF8FF",
      borderWidth: 1,
      borderColor: "#DDD6FE",
    },

    counterIcon: {
      width: 50,
      height: 50,
      borderRadius: 16,
      backgroundColor: "#EDE9FE",
      alignItems: "center",
      justifyContent: "center",
    },

    counterTitle: {
      fontSize: 12,
      color: "#7C3AED",
      letterSpacing: 0.3,
    },

    counterSubtitle: {
      marginTop: 4,
      fontSize: 10,
      lineHeight: 15,
      color: "#64748B",
    },

    /* ========================================================
       AMOUNT
    ======================================================== */

    amountContainer: {
      marginTop: 15,
      padding: 13,
      borderRadius: 15,
      backgroundColor: "#F8FAFC",
    },

    counterAmountContainer: {
      marginTop: 15,
      padding: 15,
      borderRadius: 16,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E9D5FF",
    },

    amountLabel: {
      fontSize: 8,
      letterSpacing: 1,
      color: "#94A3B8",
    },

    amount: {
      marginTop: 3,
      fontSize: 28,
      color: "#2563EB",
    },

    /* ========================================================
       MESSAGE
    ======================================================== */

    messageContainer: {
      marginTop: 10,
      padding: 11,
      borderRadius: 14,
      backgroundColor: "#F8FAFC",
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 7,
    },

    messageText: {
      flex: 1,
      fontSize: 11,
      lineHeight: 18,
      color: "#334155",
    },

    /* ========================================================
       ACCEPT
    ======================================================== */

    acceptButton: {
      minHeight: 48,
      marginTop: 14,
      borderRadius: 14,
      backgroundColor: "#2563EB",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
    },

    acceptText: {
      fontSize: 11,
      color: "#FFFFFF",
    },

    /* ========================================================
       ACTIONS
    ======================================================== */

    actionsRow: {
      marginTop: 9,
      flexDirection: "row",
      gap: 9,
    },

    counterButton: {
      flex: 1,
      minHeight: 45,
      borderRadius: 13,
      backgroundColor: "#EFF6FF",
      borderWidth: 1,
      borderColor: "#BFDBFE",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },

    counterButtonDisabled: {
      backgroundColor: "#F1F5F9",
      borderColor: "#E2E8F0",
    },

    counterButtonText: {
      fontSize: 10,
      color: "#2563EB",
    },

    disabledActionText: {
      color: "#94A3B8",
    },

    declineButton: {
      flex: 1,
      minHeight: 45,
      borderRadius: 13,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#FECACA",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },

    declineButtonText: {
      fontSize: 10,
      color: "#DC2626",
    },

    roundLimitBox: {
      marginTop: 10,
      paddingHorizontal: 11,
      paddingVertical: 9,
      borderRadius: 12,
      backgroundColor: "#F8FAFC",
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 7,
    },

    roundLimitText: {
      flex: 1,
      fontSize: 9,
      lineHeight: 14,
      color: "#64748B",
    },

    /* ========================================================
       WAITING
    ======================================================== */

    waitingCard: {
      padding: 14,
      borderRadius: 18,
      backgroundColor: "#FFF7E8",
      borderWidth: 1,
      borderColor: "#FDE68A",
      flexDirection: "row",
      alignItems: "center",
    },

    waitingIcon: {
      width: 47,
      height: 47,
      borderRadius: 15,
      backgroundColor: "#FEF3C7",
      alignItems: "center",
      justifyContent: "center",
    },

    waitingContent: {
      flex: 1,
      marginLeft: 10,
    },

    waitingTitle: {
      fontSize: 11,
      color: "#92400E",
    },

    waitingText: {
      marginTop: 4,
      fontSize: 9.5,
      lineHeight: 15,
      color: "#A16207",
    },

    waitingBox: {
      marginTop: 12,
      minHeight: 47,
      borderRadius: 14,
      backgroundColor: "#FFF7E8",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 7,
    },

    waitingBoxText: {
      fontSize: 10,
      color: "#D97706",
    },

    /* ========================================================
       SENT
    ======================================================== */

    sentCard: {
      padding: 15,
      borderRadius: 20,
      backgroundColor: "#FFFBEB",
      borderWidth: 1,
      borderColor: "#FDE68A",
    },

    sentIcon: {
      width: 50,
      height: 50,
      borderRadius: 16,
      backgroundColor: "#F3E8FF",
      alignItems: "center",
      justifyContent: "center",
    },

    sentTitle: {
      fontSize: 12,
      color: "#7C3AED",
      letterSpacing: 0.3,
    },

    sentSubtitle: {
      marginTop: 4,
      fontSize: 10,
      lineHeight: 15,
      color: "#64748B",
    },

    /* ========================================================
       ACCEPTED
    ======================================================== */

    acceptedCard: {
      padding: 14,
      borderRadius: 18,
      backgroundColor: "#ECFDF5",
      borderWidth: 1,
      borderColor: "#BBF7D0",
      flexDirection: "row",
      alignItems: "center",
    },

    acceptedIcon: {
      width: 47,
      height: 47,
      borderRadius: 15,
      backgroundColor: "#DCFCE7",
      alignItems: "center",
      justifyContent: "center",
    },

    acceptedContent: {
      flex: 1,
      marginLeft: 10,
    },

    acceptedTitle: {
      fontSize: 11,
      color: "#15803D",
    },

    acceptedText: {
      marginTop: 4,
      fontSize: 9.5,
      lineHeight: 15,
      color: "#166534",
    },

    /* ========================================================
       DECLINED
    ======================================================== */

    declinedCard: {
      padding: 14,
      borderRadius: 18,
      backgroundColor: "#FEF2F2",
      borderWidth: 1,
      borderColor: "#FECACA",
      flexDirection: "row",
      alignItems: "center",
    },

    declinedIcon: {
      width: 47,
      height: 47,
      borderRadius: 15,
      backgroundColor: "#FEE2E2",
      alignItems: "center",
      justifyContent: "center",
    },

    declinedContent: {
      flex: 1,
      marginLeft: 10,
    },

    declinedTitle: {
      fontSize: 11,
      color: "#B91C1C",
    },

    declinedText: {
      marginTop: 4,
      fontSize: 9.5,
      lineHeight: 15,
      color: "#991B1B",
    },

    /* ========================================================
       MODAL
    ======================================================== */

    modalRoot: {
      flex: 1,
      justifyContent: "flex-end",
    },

    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor:
        "rgba(15, 23, 42, 0.45)",
    },

    modalCard: {
      maxHeight: "92%",
      paddingHorizontal: 18,
      paddingTop: 10,
      paddingBottom:
        Platform.OS === "ios"
          ? 28
          : 18,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      backgroundColor: "#FFFFFF",
    },

    modalHandle: {
      alignSelf: "center",
      width: 42,
      height: 4,
      borderRadius: 4,
      backgroundColor: "#CBD5E1",
      marginBottom: 12,
    },

    modalHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },

    modalTitleContainer: {
      flex: 1,
    },

    modalTitle: {
      fontSize: 21,
      color: "#0F172A",
    },

    modalSubtitle: {
      marginTop: 3,
      fontSize: 11,
      color: "#64748B",
    },

    closeButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: "#F8FAFC",
      alignItems: "center",
      justifyContent: "center",
    },

    /* ========================================================
       HERO
    ======================================================== */

    modalHero: {
      marginTop: 13,
      alignItems: "center",
    },

    modalHeroIcon: {
      width: 65,
      height: 65,
      borderRadius: 20,
      backgroundColor: "#EFF6FF",
      borderWidth: 1,
      borderColor: "#DBEAFE",
      alignItems: "center",
      justifyContent: "center",
    },

    modalHeroTitle: {
      marginTop: 10,
      fontSize: 20,
      color: "#0F172A",
    },

    modalHeroText: {
      marginTop: 4,
      maxWidth: 320,
      fontSize: 10.5,
      lineHeight: 16,
      color: "#64748B",
      textAlign: "center",
    },

    /* ========================================================
       CURRENT OFFER
    ======================================================== */

    currentOfferCard: {
      marginTop: 15,
      padding: 12,
      borderRadius: 17,
      backgroundColor: "#EFF6FF",
      borderWidth: 1,
      borderColor: "#BFDBFE",
      flexDirection: "row",
      alignItems: "center",
    },

    currentOfferIcon: {
      width: 45,
      height: 45,
      borderRadius: 14,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
    },

    currentOfferInfo: {
      flex: 1,
      marginLeft: 9,
    },

    currentOfferLabel: {
      fontSize: 8,
      letterSpacing: 0.8,
      color: "#64748B",
    },

    currentWorkerName: {
      marginTop: 2,
      fontSize: 12,
      color: "#0F172A",
    },

    currentAmountContainer: {
      alignItems: "flex-end",
      marginLeft: 8,
    },

    currentAmountLabel: {
      fontSize: 7.5,
      color: "#64748B",
    },

    currentAmount: {
      marginTop: 2,
      fontSize: 15,
      color: "#2563EB",
    },

    /* ========================================================
       FORM
    ======================================================== */

    formSection: {
      marginTop: 12,
    },

    formLabel: {
      fontSize: 11.5,
      color: "#0F172A",
    },

    amountInputContainer: {
      height: 56,
      marginTop: 7,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "#CBD5E1",
      backgroundColor: "#FFFFFF",
      flexDirection: "row",
      alignItems: "center",
      overflow: "hidden",
    },

    nairaContainer: {
      width: 53,
      height: "100%",
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    nairaText: {
      fontSize: 22,
      color: "#2563EB",
    },

    amountInput: {
      flex: 1,
      height: "100%",
      paddingHorizontal: 13,
      fontSize: 17,
      fontWeight: "600",
      color: "#0F172A",
    },

    messageLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    characterCount: {
      fontSize: 9,
      color: "#94A3B8",
    },

    messageInputContainer: {
      minHeight: 92,
      marginTop: 7,
      padding: 11,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "#CBD5E1",
      backgroundColor: "#FFFFFF",
      flexDirection: "row",
      alignItems: "flex-start",
    },

    messageInputIcon: {
      marginTop: 2,
    },

    messageInput: {
      flex: 1,
      minHeight: 70,
      marginLeft: 8,
      padding: 0,
      fontSize: 12,
      lineHeight: 18,
      color: "#0F172A",
    },

    helperText: {
      marginTop: 4,
      fontSize: 9,
      color: "#94A3B8",
    },

    /* ========================================================
       INFO
    ======================================================== */

    infoBox: {
      marginTop: 11,
      padding: 10,
      borderRadius: 13,
      backgroundColor: "#F8FAFC",
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 7,
    },

    infoText: {
      flex: 1,
      fontSize: 9.5,
      lineHeight: 15,
      color: "#64748B",
    },

    /* ========================================================
       SEND
    ======================================================== */

    sendButton: {
      minHeight: 54,
      marginTop: 14,
      borderRadius: 16,
      backgroundColor: "#2563EB",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },

    sendButtonDisabled: {
      backgroundColor: "#A5BDF3",
    },

    sendButtonText: {
      fontSize: 10.5,
      color: "#FFFFFF",
    },

    cancelButton: {
      minHeight: 40,
      alignItems: "center",
      justifyContent: "center",
    },

    cancelButtonText: {
      fontSize: 10.5,
      color: "#64748B",
    },
  });