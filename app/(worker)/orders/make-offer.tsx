import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import Toast from "react-native-toast-message";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import {
  AppButton,
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import type {
  AppIconName,
} from "@/components/ui/AppIcon";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import MakeOfferHeader from "@/components/orders/make-offer/MakeOfferHeader";

import MakeOfferOrderCard from "@/components/orders/make-offer/MakeOfferOrderCard";

import MakeOfferFormSections from "@/components/orders/make-offer/MakeOfferFormSections";

import MakeOfferSummarySection from "@/components/orders/make-offer/MakeOfferSummarySection";

import {
  auth,
  db,
} from "@/firebase/config";

/* ==============================================================
   TYPES
============================================================== */

type MakeOfferParams = {
  orderId?:
    | string
    | string[];
};

type BookingStatus =
  | "pending"
  | "accepted"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "expired";

type OfferStatus =
  | "none"
  | "sent"
  | "accepted"
  | "declined"
  | "countered";

type CounterOfferBy =
  | "customer"
  | "worker"
  | null;

type CounterOfferStatus =
  | "none"
  | "sent"
  | "accepted"
  | "declined"
  | null;

type BookingData = {
  serviceName: string;

  customerName: string;

  workerId: string;

  status: BookingStatus;

  offerStatus: OfferStatus;

  offerRound: number;

  offerAmount?: number | null;

  offerMessage?: string | null;

  counterOfferAmount?: number | null;

  counterOfferMessage?: string | null;

  counterOfferBy: CounterOfferBy;

  counterOfferStatus: CounterOfferStatus;

  negotiationStatus?: string | null;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const MAX_MESSAGE_LENGTH =
  300;

const MIN_MESSAGE_LENGTH =
  3;

const MAX_AMOUNT =
  999_999_999;

const INITIAL_OFFER_ROUND =
  0;

const FIRST_OFFER_ROUND =
  1;

const OFFER_EXPIRY_HOURS =
  24;

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function normalizeStatus(
  value: unknown,
): BookingStatus {
  switch (value) {
    case "accepted":
      return "accepted";

    case "in-progress":
      return "in-progress";

    case "completed":
      return "completed";

    case "cancelled":
      return "cancelled";

    case "expired":
      return "expired";

    case "pending":
    default:
      return "pending";
  }
}

function normalizeOfferStatus(
  value: unknown,
): OfferStatus {
  switch (value) {
    case "sent":
      return "sent";

    case "accepted":
      return "accepted";

    case "declined":
      return "declined";

    case "countered":
      return "countered";

    case "none":
    default:
      return "none";
  }
}

function normalizeCounterOfferBy(
  value: unknown,
): CounterOfferBy {
  if (
    value === "customer" ||
    value === "worker"
  ) {
    return value;
  }

  return null;
}

function normalizeCounterOfferStatus(
  value: unknown,
): CounterOfferStatus {
  switch (value) {
    case "none":
      return "none";

    case "sent":
      return "sent";

    case "accepted":
      return "accepted";

    case "declined":
      return "declined";

    default:
      return null;
  }
}

function normalizeRound(
  value: unknown,
): number {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    )
  ) {
    return INITIAL_OFFER_ROUND;
  }

  return Math.max(
    INITIAL_OFFER_ROUND,
    Math.floor(
      value,
    ),
  );
}

function normalizeOptionalAmount(
  value: unknown,
): number | null {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    ) ||
    value <= 0
  ) {
    return null;
  }

  return value;
}

function mapBooking(
  data: Record<
    string,
    unknown
  >,
  workerId: string,
): BookingData {
  return {
    serviceName:
      cleanString(
        data.serviceName,
      ) ||
      "Service request",

    customerName:
      cleanString(
        data.customerName,
      ) ||
      "Customer",

    workerId,

    status:
      normalizeStatus(
        data.status,
      ),

    offerStatus:
      normalizeOfferStatus(
        data.offerStatus,
      ),

    offerRound:
      normalizeRound(
        data.offerRound,
      ),

    offerAmount:
      normalizeOptionalAmount(
        data.offerAmount,
      ),

    offerMessage:
      cleanString(
        data.offerMessage,
      ) ||
      null,

    counterOfferAmount:
      normalizeOptionalAmount(
        data.counterOfferAmount,
      ),

    counterOfferMessage:
      cleanString(
        data.counterOfferMessage,
      ) ||
      null,

    counterOfferBy:
      normalizeCounterOfferBy(
        data.counterOfferBy,
      ),

    counterOfferStatus:
      normalizeCounterOfferStatus(
        data.counterOfferStatus,
      ),

    negotiationStatus:
      cleanString(
        data.negotiationStatus,
      ) ||
      null,
  };
}

/* ==============================================================
   OFFER ERROR
============================================================== */

function showOfferError(
  error: unknown,
) {
  const firebaseError =
    error as {
      code?: string;
    };

  if (
    firebaseError?.code ===
    "permission-denied"
  ) {
    Toast.show({
      type: "error",

      text1:
        "Permission denied",

      text2:
        "You are not allowed to send this offer.",
    });

    return;
  }

  if (
    error instanceof Error
  ) {
    switch (
      error.message
    ) {
      case "ORDER_NOT_FOUND":
        Toast.show({
          type: "error",

          text1:
            "Order not found",

          text2:
            "This order no longer exists.",
        });

        return;

      case "ACCESS_DENIED":
        Toast.show({
          type: "error",

          text1:
            "Access denied",

          text2:
            "You cannot send an offer for this order.",
        });

        return;

      case "ORDER_NOT_PENDING":
        Toast.show({
          type: "info",

          text1:
            "Order unavailable",

          text2:
            "This order is no longer pending.",
        });

        return;

      case "OFFER_NOT_AVAILABLE":
        Toast.show({
          type: "info",

          text1:
            "Offer unavailable",

          text2:
            "This order already has an offer or negotiation in progress.",
        });

        return;

      case "INVALID_OFFER_ROUND":
        Toast.show({
          type: "info",

          text1:
            "Negotiation already started",

          text2:
            "This order is already in a negotiation round.",
        });

        return;

      default:
        break;
    }
  }

  Toast.show({
    type: "error",

    text1:
      "Unable to send offer",

    text2:
      "Something went wrong. Please try again.",
  });
}

/* ==============================================================
   SCREEN
============================================================== */

export default function MakeOfferScreen() {
  const params =
    useLocalSearchParams<MakeOfferParams>();

  /* ============================================================
     ORDER ID
  ============================================================ */

  const resolvedOrderId =
    useMemo(() => {
      if (
        typeof params.orderId ===
        "string"
      ) {
        return params.orderId.trim();
      }

      if (
        Array.isArray(
          params.orderId,
        )
      ) {
        return (
          params.orderId[0]?.trim() ||
          ""
        );
      }

      return "";
    }, [
      params.orderId,
    ]);

  /* ============================================================
     AUTH
  ============================================================ */

  const [
    authReady,
    setAuthReady,
  ] =
    useState(false);

  const [
    workerId,
    setWorkerId,
  ] =
    useState<
      string | null
    >(
      null,
    );

  /* ============================================================
     BOOKING
  ============================================================ */

  const [
    booking,
    setBooking,
  ] =
    useState<BookingData | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    loadingError,
    setLoadingError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  /* ============================================================
     FORM
  ============================================================ */

  const [
    amount,
    setAmount,
  ] =
    useState("");

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const submittingRef =
    useRef(false);

  /* ============================================================
     AUTH LISTENER
  ============================================================ */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        user => {
          const uid =
            cleanString(
              user?.uid,
            );

          setWorkerId(
            uid || null,
          );

          setAuthReady(
            true,
          );
        },
      );

    return unsubscribe;
  }, []);

  /* ============================================================
     REALTIME BOOKING
  ============================================================ */

  useEffect(() => {
    if (!authReady) {
      return;
    }

    if (!workerId) {
      setBooking(
        null,
      );

      setLoading(
        false,
      );

      setLoadingError(
        "Please sign in to send an offer.",
      );

      return;
    }

    if (
      !resolvedOrderId
    ) {
      setBooking(
        null,
      );

      setLoading(
        false,
      );

      setLoadingError(
        "Order ID is missing.",
      );

      return;
    }

    setLoading(
      true,
    );

    setLoadingError(
      null,
    );

    const bookingRef =
      doc(
        db,
        "bookings",
        resolvedOrderId,
      );

    const unsubscribe =
      onSnapshot(
        bookingRef,

        snapshot => {
          if (
            !snapshot.exists()
          ) {
            setBooking(
              null,
            );

            setLoading(
              false,
            );

            setLoadingError(
              "This order no longer exists.",
            );

            return;
          }

          const data =
            snapshot.data();

          if (
            cleanString(
              data.workerId,
            ) !==
            workerId
          ) {
            setBooking(
              null,
            );

            setLoading(
              false,
            );

            setLoadingError(
              "You do not have access to this order.",
            );

            return;
          }

          setBooking(
            mapBooking(
              data,
              workerId,
            ),
          );

          setLoading(
            false,
          );

          setLoadingError(
            null,
          );
        },

        snapshotError => {
          console.error(
            "MAKE_OFFER_BOOKING_LISTENER_ERROR:",
            snapshotError,
          );

          setBooking(
            null,
          );

          setLoading(
            false,
          );

          setLoadingError(
            "Unable to load this order. Please try again.",
          );
        },
      );

    return unsubscribe;
  }, [
    authReady,
    resolvedOrderId,
    workerId,
  ]);

  /* ============================================================
     AMOUNT
  ============================================================ */

  const numericAmount =
    useMemo(() => {
      const cleaned =
        amount.replace(
          /[^0-9]/g,
          "",
        );

      if (!cleaned) {
        return 0;
      }

      const value =
        Number(
          cleaned,
        );

      return Number.isFinite(
        value,
      )
        ? value
        : 0;
    }, [
      amount,
    ]);

  const formattedAmount =
    useMemo(() => {
      if (
        numericAmount <=
        0
      ) {
        return "₦0";
      }

      return `₦${numericAmount.toLocaleString(
        "en-NG",
      )}`;
    }, [
      numericAmount,
    ]);

  /* ============================================================
     VALIDATION
  ============================================================ */

  const cleanMessage =
    message.trim();

  const amountValid =
    numericAmount >
      0 &&
    numericAmount <=
      MAX_AMOUNT;

  const messageValid =
    cleanMessage.length >=
      MIN_MESSAGE_LENGTH &&
    cleanMessage.length <=
      MAX_MESSAGE_LENGTH;

  const orderValid =
    Boolean(
      booking,
    ) &&
    Boolean(
      workerId,
    ) &&
    booking?.workerId ===
      workerId &&
    booking?.status ===
      "pending" &&
    booking?.offerStatus ===
      "none" &&
    booking?.offerRound ===
      INITIAL_OFFER_ROUND;

  const canSubmit =
    authReady &&
    !loading &&
    !loadingError &&
    orderValid &&
    amountValid &&
    messageValid &&
    !submitting;

  /* ============================================================
     AMOUNT CHANGE
  ============================================================ */

  const handleAmountChange =
    useCallback(
      (
        text: string,
      ) => {
        const cleaned =
          text.replace(
            /[^0-9]/g,
            "",
          );

        if (
          cleaned.length >
          9
        ) {
          return;
        }

        setAmount(
          cleaned,
        );
      },
      [],
    );

  /* ============================================================
     MESSAGE CHANGE
  ============================================================ */

  const handleMessageChange =
    useCallback(
      (
        text: string,
      ) => {
        setMessage(
          text.slice(
            0,
            MAX_MESSAGE_LENGTH,
          ),
        );
      },
      [],
    );

  /* ============================================================
     SEND OFFER
  ============================================================ */

  const handleSendOffer =
    useCallback(
      async () => {
        if (
          submittingRef.current
        ) {
          return;
        }

        if (!workerId) {
          Toast.show({
            type: "error",

            text1:
              "Sign in required",

            text2:
              "Please sign in again before sending an offer.",
          });

          return;
        }

        if (
          !resolvedOrderId
        ) {
          Toast.show({
            type: "error",

            text1:
              "Invalid order",

            text2:
              "The order ID is missing.",
          });

          return;
        }

        if (!booking) {
          Toast.show({
            type: "error",

            text1:
              "Order unavailable",

            text2:
              "Unable to load this order.",
          });

          return;
        }

        if (
          booking.workerId !==
          workerId
        ) {
          Toast.show({
            type: "error",

            text1:
              "Access denied",

            text2:
              "You cannot send an offer for this order.",
          });

          return;
        }

        if (
          booking.status !==
          "pending"
        ) {
          Toast.show({
            type: "info",

            text1:
              "Order unavailable",

            text2:
              "This order is no longer pending.",
          });

          return;
        }

        if (
          booking.offerStatus !==
          "none"
        ) {
          Toast.show({
            type: "info",

            text1:
              "Offer unavailable",

            text2:
              "This order already has an offer or negotiation in progress.",
          });

          return;
        }

        if (
          booking.offerRound !==
          INITIAL_OFFER_ROUND
        ) {
          Toast.show({
            type: "info",

            text1:
              "Negotiation already started",

            text2:
              "This order is already in a negotiation round.",
          });

          return;
        }

        if (
          !amountValid
        ) {
          Toast.show({
            type: "error",

            text1:
              "Invalid offer amount",

            text2:
              `Enter an amount between ₦1 and ₦${MAX_AMOUNT.toLocaleString(
                "en-NG",
              )}.`,
          });

          return;
        }

        if (
          cleanMessage.length <
          MIN_MESSAGE_LENGTH
        ) {
          Toast.show({
            type: "error",

            text1:
              "Message required",

            text2:
              "Please explain what your offer includes.",
          });

          return;
        }

        if (
          cleanMessage.length >
          MAX_MESSAGE_LENGTH
        ) {
          Toast.show({
            type: "error",

            text1:
              "Message too long",

            text2:
              `Keep your message within ${MAX_MESSAGE_LENGTH} characters.`,
          });

          return;
        }

        submittingRef.current =
          true;

        setSubmitting(
          true,
        );

        try {
          const bookingRef =
            doc(
              db,
              "bookings",
              resolvedOrderId,
            );

          await runTransaction(
            db,
            async transaction => {
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

              const latestData =
                snapshot.data();

              /* ================================================
                 OWNERSHIP
              ================================================= */

              if (
                cleanString(
                  latestData.workerId,
                ) !== workerId
              ) {
                throw new Error(
                  "ACCESS_DENIED",
                );
              }

              /* ================================================
                 STATUS
              ================================================= */

              if (
                latestData.status !==
                "pending"
              ) {
                throw new Error(
                  "ORDER_NOT_PENDING",
                );
              }

              /* ================================================
                 OFFER STATUS
              ================================================= */

              if (
                latestData.offerStatus !==
                "none"
              ) {
                throw new Error(
                  "OFFER_NOT_AVAILABLE",
                );
              }

              /* ================================================
                 ROUND
              ================================================= */

              const currentOfferRound =
                normalizeRound(
                  latestData.offerRound,
                );

              if (
                currentOfferRound !==
                INITIAL_OFFER_ROUND
              ) {
                throw new Error(
                  "INVALID_OFFER_ROUND",
                );
              }

              /* ================================================
                 EXPIRY
              ================================================= */

              const offerExpiresAt =
                Timestamp.fromMillis(
                  Date.now() +
                    OFFER_EXPIRY_HOURS *
                      60 *
                      60 *
                      1000,
                );

              /* ================================================
                 UPDATE
              ================================================= */

              transaction.update(
                bookingRef,
                {
                  offerAmount:
                    numericAmount,

                  offerMessage:
                    cleanMessage,

                  offerStatus:
                    "sent",

                  offerRound:
                    FIRST_OFFER_ROUND,

                  offerWorkerId:
                    workerId,

                  offerSentAt:
                    serverTimestamp(),

                  offerRespondedAt:
                    null,

                  offerExpiresAt,

                  counterOfferAmount:
                    null,

                  counterOfferMessage:
                    null,

                  counterOfferSentAt:
                    null,

                  counterOfferRespondedAt:
                    null,

                  counterOfferBy:
                    null,

                  counterOfferStatus:
                    "none",

                  negotiationStatus:
                    "negotiating",

                  updatedAt:
                    serverTimestamp(),
                },
              );
            },
          );

          Toast.show({
            type: "success",

            text1:
              "Offer sent",

            text2:
              `Your offer of ${formattedAmount} was sent to ${booking.customerName}.`,
          });

          router.replace({
            pathname:
              "/(worker)/orders/offer-sent",

            params: {
              orderId:
                resolvedOrderId,

              serviceName:
                booking.serviceName,

              customerName:
                booking.customerName,

              amount:
                String(
                  numericAmount,
                ),

              message:
                cleanMessage,
            },
          } as never);
        } catch (sendError) {
          console.error(
            "SEND_WORKER_OFFER_ERROR:",
            sendError,
          );

          showOfferError(
            sendError,
          );
        } finally {
          submittingRef.current =
            false;

          setSubmitting(
            false,
          );
        }
      },
      [
        amountValid,
        booking,
        cleanMessage,
        formattedAmount,
        numericAmount,
        resolvedOrderId,
        workerId,
      ],
    );

  /* ============================================================
     CANCEL
  ============================================================ */

  const handleCancel =
    useCallback(() => {
      if (
        submittingRef.current
      ) {
        return;
      }

      router.back();
    }, []);

  /* ============================================================
     LOADING
  ============================================================ */

  if (
    !authReady ||
    loading
  ) {
    return (
      <AppScreen
        role="worker"
        contentContainerStyle={
          styles.screen
        }
      >
        <View
          style={
            styles.centerContainer
          }
        >
          <View
            style={
              styles.loadingIcon
            }
          >
            <ActivityIndicator
              size="small"
              color={
                WorkerColors.primary
              }
            />
          </View>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.loadingText
            }
          >
            Loading order...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (
    loadingError ||
    !booking
  ) {
    return (
      <CenteredState
        icon="error"
        iconColor={
          Colors.error
        }
        iconBackground={
          Colors.errorSoft
        }
        title="Unable to make offer"
        description={
          loadingError ??
          "Order information is unavailable."
        }
        buttonTitle="Go Back"
        onPress={
          handleCancel
        }
      />
    );
  }

  /* ============================================================
     ORDER NO LONGER PENDING
  ============================================================ */

  if (
    booking.status !==
    "pending"
  ) {
    return (
      <CenteredState
        icon="warning"
        iconColor={
          Colors.warning
        }
        iconBackground={
          Colors.warningSoft
        }
        title="Order unavailable"
        description="This order is no longer accepting offers."
        buttonTitle="Back to Order"
        onPress={
          handleCancel
        }
      />
    );
  }

  /* ============================================================
     OFFER ALREADY SENT
  ============================================================ */

  if (
    booking.offerStatus ===
    "sent"
  ) {
    return (
      <CenteredState
        icon="success"
        iconColor={
          Colors.success
        }
        iconBackground={
          Colors.successSoft
        }
        title="Offer already sent"
        description="You have already sent an offer for this order."
        buttonTitle="Back to Order"
        onPress={
          handleCancel
        }
      />
    );
  }

  /* ============================================================
     OTHER OFFER STATE
  ============================================================ */

  if (
    booking.offerStatus !==
    "none"
  ) {
    return (
      <CenteredState
        icon="info"
        iconColor={
          Colors.info
        }
        iconBackground={
          Colors.infoSoft
        }
        title="Offer unavailable"
        description="This order already has an offer response or negotiation state."
        buttonTitle="Back to Order"
        onPress={
          handleCancel
        }
      />
    );
  }

  /* ============================================================
     NEGOTIATION STARTED
  ============================================================ */

  if (
    booking.offerRound !==
    INITIAL_OFFER_ROUND
  ) {
    return (
      <CenteredState
        icon="messages"
        iconColor={
          Colors.warning
        }
        iconBackground={
          Colors.warningSoft
        }
        title="Negotiation already started"
        description="This order is already in a negotiation round."
        buttonTitle="Back to Order"
        onPress={
          handleCancel
        }
      />
    );
  }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <AppScreen
      role="worker"
      contentContainerStyle={
        styles.screen
      }
    >
      <KeyboardAvoidingView
        style={
          styles.keyboard
        }
        behavior={
          Platform.OS ===
          "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          style={
            styles.scrollView
          }
          contentContainerStyle={
            styles.content
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS ===
            "ios"
              ? "interactive"
              : "on-drag"
          }
        >
          {/* ==================================================
              HEADER
          ================================================== */}

          <MakeOfferHeader
            disabled={
              submitting
            }
            onBack={
              handleCancel
            }
          />

          {/* ==================================================
              ORDER
          ================================================== */}

          <MakeOfferOrderCard
            orderId={
              resolvedOrderId
            }
            serviceName={
              booking.serviceName
            }
            customerName={
              booking.customerName
            }
          />

          {/* ==================================================
              AMOUNT + MESSAGE
          ================================================== */}

          <MakeOfferFormSections
            amount={
              amount
            }
            message={
              message
            }
            amountValid={
              amountValid
            }
            messageValid={
              messageValid
            }
            submitting={
              submitting
            }
            cleanMessageLength={
              cleanMessage.length
            }
            maxAmount={
              MAX_AMOUNT
            }
            minMessageLength={
              MIN_MESSAGE_LENGTH
            }
            maxMessageLength={
              MAX_MESSAGE_LENGTH
            }
            onAmountChange={
              handleAmountChange
            }
            onMessageChange={
              handleMessageChange
            }
          />

          {/* ==================================================
              SUMMARY
          ================================================== */}

          <MakeOfferSummarySection
            serviceName={
              booking.serviceName
            }
            customerName={
              booking.customerName
            }
            formattedAmount={
              formattedAmount
            }
          />

          {/* ==================================================
              SEND
          ================================================== */}

          <View
            style={
              styles.sendAction
            }
          >
            <AppButton
              title={
                submitting
                  ? "Sending Offer..."
                  : "Send Offer"
              }
              role="worker"
              variant="primary"
              loading={
                submitting
              }
              disabled={
                !canSubmit
              }
              onPress={
                handleSendOffer
              }
            />
          </View>

          {/* ==================================================
              CANCEL
          ================================================== */}

          <View
            style={
              styles.cancelAction
            }
          >
            <AppButton
              title="Cancel"
              role="worker"
              variant="ghost"
              disabled={
                submitting
              }
              onPress={
                handleCancel
              }
            />
          </View>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <AppText
            variant="caption"
            tone="secondary"
            center
            style={
              styles.footer
            }
          >
            Order #{resolvedOrderId}
          </AppText>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

/* ==============================================================
   CENTERED STATE
============================================================== */

function CenteredState({
  icon,
  iconColor,
  iconBackground,
  title,
  description,
  buttonTitle,
  onPress,
}: {
  icon: AppIconName;

  iconColor: string;

  iconBackground: string;

  title: string;

  description: string;

  buttonTitle: string;

  onPress: () => void;
}) {
  return (
    <AppScreen
      role="worker"
      contentContainerStyle={
        styles.screen
      }
    >
      <View
        style={
          styles.centerContainer
        }
      >
        <View
          style={[
            styles.stateIcon,

            {
              backgroundColor:
                iconBackground,
            },
          ]}
        >
          <AppIcon
            name={
              icon
            }
            size="lg"
            color={
              iconColor
            }
          />
        </View>

        <AppText
          variant="heading3"
          weight="bold"
          center
          style={
            styles.errorTitle
          }
        >
          {title}
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.errorText
          }
        >
          {description}
        </AppText>

        <View
          style={
            styles.stateAction
          }
        >
          <AppButton
            title={
              buttonTitle
            }
            role="worker"
            variant="primary"
            leftIconName="back"
            onPress={
              onPress
            }
          />
        </View>
      </View>
    </AppScreen>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,

      width: "100%",

      backgroundColor:
        Colors.background,
    },

    keyboard: {
      flex: 1,

      width: "100%",
    },

    scrollView: {
      flex: 1,

      width: "100%",
    },

    content: {
      width: "100%",

      flexGrow: 1,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    /* ========================================================
       ACTIONS
    ======================================================== */

    sendAction: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xl,
    },

    cancelAction: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.sm,
    },

    footer: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.sm,

      color:
        Colors.textMuted,
    },

    /* ========================================================
       STATES
    ======================================================== */

    centerContainer: {
      flex: 1,

      width: "100%",

      minHeight: 560,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loadingIcon: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textSecondary,
    },

    stateIcon: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,
    },

    errorTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    errorText: {
      maxWidth: 300,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    stateAction: {
      width: "100%",

      maxWidth: 230,

      marginTop:
        FixxamTokens.spacing.xl,
    },
  });