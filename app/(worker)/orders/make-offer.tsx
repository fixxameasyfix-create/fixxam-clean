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

  serviceIcon:
    | string
    | null;

  serviceIconColor:
    | string
    | null;

  serviceIconBackground:
    | string
    | null;

  customerName: string;

  workerId: string;

  status: BookingStatus;

  offerStatus: OfferStatus;

  offerRound: number;

  offerAmount?:
    | number
    | null;

  offerMessage?:
    | string
    | null;

  counterOfferAmount?:
    | number
    | null;

  counterOfferMessage?:
    | string
    | null;

  counterOfferBy:
    CounterOfferBy;

  counterOfferStatus:
    CounterOfferStatus;

  negotiationStatus?:
    | string
    | null;
};

type UnavailableState = {
  icon: AppIconName;

  iconColor: string;

  iconBackground: string;

  title: string;

  description: string;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const MIN_AMOUNT =
  1;

const MAX_AMOUNT =
  100_000_000;

const MAX_MESSAGE_LENGTH =
  300;

const MIN_MESSAGE_LENGTH =
  3;

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

function formatCurrency(
  value: number,
): string {
  return `₦${value.toLocaleString(
    "en-NG",
  )}`;
}

/* ==============================================================
   STATUS
============================================================== */

function normalizeStatus(
  value: unknown,
): BookingStatus {
  switch (value) {
    case "accepted":
      return "accepted";

    case "in-progress":
    case "in_progress":
      return "in-progress";

    case "completed":
      return "completed";

    case "cancelled":
    case "canceled":
      return "cancelled";

    case "expired":
      return "expired";

    case "pending":
    default:
      return "pending";
  }
}

/* ==============================================================
   OFFER STATUS
============================================================== */

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

/* ==============================================================
   COUNTER OFFER
============================================================== */

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

/* ==============================================================
   OFFER ROUND
============================================================== */

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

/* ==============================================================
   AMOUNT
============================================================== */

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

function getAmountError(
  value: number,
): string | null {
  if (
    !Number.isFinite(
      value,
    ) ||
    value < MIN_AMOUNT
  ) {
    return "Enter a valid offer amount.";
  }

  if (
    !Number.isInteger(
      value,
    )
  ) {
    return "Offer amount must be a whole number.";
  }

  if (
    value > MAX_AMOUNT
  ) {
    return `Maximum offer is ${formatCurrency(
      MAX_AMOUNT,
    )}.`;
  }

  return null;
}

/* ==============================================================
   BOOKING MAPPER
============================================================== */

function mapBooking(
  data: Record<
    string,
    unknown
  >,
  workerId: string,
): BookingData {
  const serviceIcon =
    cleanString(
      data.serviceIcon,
    ) ||
    cleanString(
      data.icon,
    ) ||
    cleanString(
      data.categoryIcon,
    ) ||
    null;

  const serviceIconColor =
    cleanString(
      data.serviceIconColor,
    ) ||
    cleanString(
      data.iconColor,
    ) ||
    cleanString(
      data.categoryIconColor,
    ) ||
    null;

  const serviceIconBackground =
    cleanString(
      data.serviceIconBackground,
    ) ||
    cleanString(
      data.backgroundColor,
    ) ||
    cleanString(
      data.categoryBackgroundColor,
    ) ||
    null;

  return {
    serviceName:
      cleanString(
        data.serviceName,
      ) ||
      "Service request",

    serviceIcon,

    serviceIconColor,

    serviceIconBackground,

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
   FRIENDLY APP ERROR
============================================================== */

function showOfferError(
  error: unknown,
) {
  const firebaseError =
    error as {
      code?: string;
    };

  if (
    error instanceof
    Error
  ) {
    switch (
      error.message
    ) {
      case "ORDER_NOT_FOUND":
        Toast.show({
          type:
            "error",

          text1:
            "Order not found",

          text2:
            "This order no longer exists.",
        });

        return;

      case "ACCESS_DENIED":
        Toast.show({
          type:
            "error",

          text1:
            "Offer not available",

          text2:
            "You cannot send an offer for this order.",
        });

        return;

      case "ORDER_NOT_PENDING":
        Toast.show({
          type:
            "info",

          text1:
            "Order unavailable",

          text2:
            "This order is no longer pending.",
        });

        return;

      case "OFFER_NOT_AVAILABLE":
        Toast.show({
          type:
            "info",

          text1:
            "Offer already updated",

          text2:
            "This order already has an offer or negotiation in progress.",
        });

        return;

      case "INVALID_OFFER_ROUND":
        Toast.show({
          type:
            "info",

          text1:
            "Negotiation already started",

          text2:
            "Open the order to continue the negotiation.",
        });

        return;

      case "INVALID_AMOUNT":
        Toast.show({
          type:
            "error",

          text1:
            "Invalid price",

          text2:
            `Offer must be between ${formatCurrency(
              MIN_AMOUNT,
            )} and ${formatCurrency(
              MAX_AMOUNT,
            )}.`,
        });

        return;

      default:
        break;
    }
  }

  if (
    firebaseError?.code ===
      "permission-denied" ||
    firebaseError?.code ===
      "firestore/permission-denied"
  ) {
    Toast.show({
      type:
        "error",

      text1:
        "Offer not sent",

      text2:
        "The order changed or this offer is no longer available. Refresh and try again.",
    });

    return;
  }

  if (
    firebaseError?.code ===
      "unavailable" ||
    firebaseError?.code ===
      "firestore/unavailable"
  ) {
    Toast.show({
      type:
        "error",

      text1:
        "Connection problem",

      text2:
        "Check your internet connection and try again.",
    });

    return;
  }

  Toast.show({
    type:
      "error",

    text1:
      "Offer not sent",

    text2:
      "Something went wrong. Please try again.",
  });
}

/* ==============================================================
   UNAVAILABLE STATE
============================================================== */

function getUnavailableState(
  booking: BookingData,
): UnavailableState | null {
  if (
    booking.status !==
    "pending"
  ) {
    return {
      icon:
        "warning",

      iconColor:
        Colors.warning,

      iconBackground:
        Colors.warningSoft,

      title:
        "Order unavailable",

      description:
        "This order is no longer accepting offers.",
    };
  }

  if (
    booking.offerStatus ===
    "sent"
  ) {
    return {
      icon:
        "success",

      iconColor:
        Colors.success,

      iconBackground:
        Colors.successSoft,

      title:
        "Offer already sent",

      description:
        "Your offer is already waiting for the customer.",
    };
  }

  if (
    booking.offerStatus !==
    "none"
  ) {
    return {
      icon:
        "info",

      iconColor:
        Colors.info,

      iconBackground:
        Colors.infoSoft,

      title:
        "Offer unavailable",

      description:
        "This order already has an active offer or negotiation.",
    };
  }

  if (
    booking.offerRound !==
    INITIAL_OFFER_ROUND
  ) {
    return {
      icon:
        "messages",

      iconColor:
        Colors.warning,

      iconBackground:
        Colors.warningSoft,

      title:
        "Negotiation started",

      description:
        "Open the order to continue the negotiation.",
    };
  }

  return null;
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
    >(null);

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
    >(null);

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
     BOOKING LISTENER
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

          const bookingWorkerId =
            cleanString(
              data.workerId,
            );

          if (
            bookingWorkerId !==
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
          if (__DEV__) {
            console.error(
              "MAKE_OFFER_BOOKING_LISTENER_ERROR:",
              snapshotError,
            );
          }

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

      return Number.isSafeInteger(
        value,
      )
        ? value
        : 0;
    }, [
      amount,
    ]);

  const formattedAmount =
    useMemo(
      () =>
        numericAmount >
        0
          ? formatCurrency(
              numericAmount,
            )
          : "₦0",
      [
        numericAmount,
      ],
    );

  /* ============================================================
     VALIDATION
  ============================================================ */

  const cleanMessage =
    message.trim();

  const amountError =
    useMemo(
      () => {
        if (!amount) {
          return null;
        }

        return getAmountError(
          numericAmount,
        );
      },
      [
        amount,
        numericAmount,
      ],
    );

  const amountValid =
    numericAmount >=
      MIN_AMOUNT &&
    numericAmount <=
      MAX_AMOUNT &&
    amountError ===
      null;

  const messageValid =
    cleanMessage.length >=
      MIN_MESSAGE_LENGTH &&
    cleanMessage.length <=
      MAX_MESSAGE_LENGTH;

  const orderValid =
    Boolean(
      booking &&
      workerId &&
      booking.workerId ===
        workerId &&
      booking.status ===
        "pending" &&
      booking.offerStatus ===
        "none" &&
      booking.offerRound ===
        INITIAL_OFFER_ROUND,
    );

  const canSubmit =
    authReady &&
    !loading &&
    !loadingError &&
    orderValid &&
    amountValid &&
    messageValid &&
    !submitting;

  /* ============================================================
     SUBMIT HINT
  ============================================================ */

  const submitHint =
    useMemo(() => {
      if (
        !amount
      ) {
        return "Enter your price to continue";
      }

      if (
        amountError
      ) {
        return amountError;
      }

      if (
        cleanMessage.length <
        MIN_MESSAGE_LENGTH
      ) {
        return "Add a short note about what your price includes";
      }

      if (
        cleanMessage.length >
        MAX_MESSAGE_LENGTH
      ) {
        return `Keep your note within ${MAX_MESSAGE_LENGTH} characters`;
      }

      return `Ready to send ${formattedAmount}`;
    }, [
      amount,
      amountError,
      cleanMessage.length,
      formattedAmount,
    ]);

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
          12
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
            type:
              "error",

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
            type:
              "error",

            text1:
              "Invalid order",

            text2:
              "The order ID is missing.",
          });

          return;
        }

        if (!booking) {
          Toast.show({
            type:
              "error",

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
            type:
              "error",

            text1:
              "Offer unavailable",

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
            type:
              "info",

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
            type:
              "info",

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
            type:
              "info",

            text1:
              "Negotiation already started",

            text2:
              "Open the order to continue the negotiation.",
          });

          return;
        }

        const currentAmountError =
          getAmountError(
            numericAmount,
          );

        if (
          currentAmountError
        ) {
          Toast.show({
            type:
              "error",

            text1:
              "Invalid price",

            text2:
              currentAmountError,
          });

          return;
        }

        if (
          cleanMessage.length <
          MIN_MESSAGE_LENGTH
        ) {
          Toast.show({
            type:
              "error",

            text1:
              "Short note required",

            text2:
              `Write at least ${MIN_MESSAGE_LENGTH} characters about what your price includes.`,
          });

          return;
        }

        if (
          cleanMessage.length >
          MAX_MESSAGE_LENGTH
        ) {
          Toast.show({
            type:
              "error",

            text1:
              "Note too long",

            text2:
              `Keep your note within ${MAX_MESSAGE_LENGTH} characters.`,
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
                ) !==
                workerId
              ) {
                throw new Error(
                  "ACCESS_DENIED",
                );
              }

              /* ================================================
                 STATUS
              ================================================= */

              if (
                normalizeStatus(
                  latestData.status,
                ) !==
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
                normalizeOfferStatus(
                  latestData.offerStatus,
                ) !==
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
                 AMOUNT
              ================================================= */

              const latestAmountError =
                getAmountError(
                  numericAmount,
                );

              if (
                latestAmountError
              ) {
                throw new Error(
                  "INVALID_AMOUNT",
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
                 FIRESTORE UPDATE
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
            type:
              "success",

            text1:
              "Offer sent",

            text2:
              `${formattedAmount} sent to ${booking.customerName}.`,
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
        } catch (
          sendError
        ) {
          if (__DEV__) {
            console.error(
              "SEND_WORKER_OFFER_ERROR:",
              sendError,
            );
          }

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
            variant="caption"
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
     LOAD ERROR
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
     AVAILABILITY
  ============================================================ */

  const unavailableState =
    getUnavailableState(
      booking,
    );

  if (
    unavailableState
  ) {
    return (
      <CenteredState
        {...unavailableState}
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
            icon={
              booking.serviceIcon
            }
            iconColor={
              booking.serviceIconColor
            }
            backgroundColor={
              booking.serviceIconBackground
            }
          />

          {/* ==================================================
              INTRO
          ================================================== */}

          <View
            style={
              styles.intro
            }
          >
            <AppText
              variant="heading3"
              weight="bold"
              style={
                styles.introTitle
              }
            >
              Set your price
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.introText
              }
            >
              Enter your price and a short note for the customer.
            </AppText>
          </View>

          {/* ==================================================
              FORM
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
              INLINE VALIDATION
          ================================================== */}

          {amountError ? (
            <View
              style={
                styles.validationError
              }
            >
              <AppIcon
                name="warning"
                size="xs"
                color={
                  Colors.error
                }
              />

              <AppText
                variant="caption"
                style={
                  styles.validationErrorText
                }
              >
                {amountError}
              </AppText>
            </View>
          ) : null}

          {/* ==================================================
              SUMMARY
          ================================================== */}

          {amountValid &&
          messageValid ? (
            <View
              style={
                styles.summary
              }
            >
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
            </View>
          ) : null}

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <View
            style={
              styles.actions
            }
          >
            <AppText
              variant="caption"
              tone="secondary"
              center
              style={[
                styles.submitHint,

                canSubmit
                  ? styles.submitHintReady
                  : null,

                amountError
                  ? styles.submitHintError
                  : null,
              ]}
            >
              {submitHint}
            </AppText>

            <AppButton
              title={
                submitting
                  ? "Sending..."
                  : amountValid
                    ? `Send ${formattedAmount} Offer`
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
          </View>
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
            styles.stateTitle
          }
        >
          {title}
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.stateText
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
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.xs,

      paddingBottom:
        FixxamTokens.spacing.xl,
    },

    /* ========================================================
       INTRO
    ======================================================== */

    intro: {
      marginTop:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.sm,
    },

    introTitle: {
      color:
        Colors.textPrimary,
    },

    introText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 17,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       VALIDATION
    ======================================================== */

    validationError: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.errorSoft,
    },

    validationErrorText: {
      flex: 1,

      lineHeight: 17,

      color:
        Colors.error,
    },

    /* ========================================================
       SUMMARY
    ======================================================== */

    summary: {
      marginTop:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       ACTIONS
    ======================================================== */

    actions: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.md,
    },

    submitHint: {
      marginBottom:
        FixxamTokens.spacing.xs,

      color:
        Colors.textMuted,
    },

    submitHintReady: {
      color:
        WorkerColors.primary,
    },

    submitHintError: {
      color:
        Colors.error,
    },

    cancelAction: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       STATES
    ======================================================== */

    centerContainer: {
      flex: 1,

      width: "100%",

      minHeight: 420,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loadingIcon: {
      width: 48,

      height: 48,

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
        FixxamTokens.spacing.sm,

      color:
        Colors.textSecondary,
    },

    stateIcon: {
      width: 52,

      height: 52,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,
    },

    stateTitle: {
      marginTop:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    stateText: {
      maxWidth: 290,

      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 19,

      color:
        Colors.textSecondary,
    },

    stateAction: {
      width: "100%",

      maxWidth: 220,

      marginTop:
        FixxamTokens.spacing.lg,
    },
  });