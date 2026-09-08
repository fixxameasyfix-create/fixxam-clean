import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Linking,
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
} from "firebase/firestore";

import {
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

import WorkerOrderHeader from "@/components/orders/WorkerOrderHeader";

import WorkerCounterOfferModal from "@/components/orders/WorkerCounterOfferModal";

import WorkerOrderInfoSections from "@/components/orders/WorkerOrderInfoSections";

import WorkerOrderResponseSection from "@/components/orders/WorkerOrderResponseSection";

import WorkerOrderFooterSection from "@/components/orders/WorkerOrderFooterSection";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  acceptBooking,
  counterOffer,
} from "@/firebase/queries/bookings";

import type {
  Booking,
  BookingStatus,
  CounterOfferBy,
  CounterOfferStatus,
  OfferStatus,
  PaymentStatus,
} from "@/types/booking";

/* ==============================================================
   TYPES
============================================================== */

type WorkerLiveLocation = {
  latitude: number;

  longitude: number;

  accuracy?: number | null;

  heading?: number | null;

  speed?: number | null;

  userId?: string;

  updatedAt?: unknown;
};

type WorkerBooking =
  Booking & {
    customerPhone?: string | null;

    estimatedArrival?: string | null;

    workerArrivedAt?: unknown;

    serviceStartedAt?: unknown;

    serviceCompletedAt?: unknown;

    cancelledReason?: string | null;

    cancelledBy?:
      | "customer"
      | "worker"
      | null;

    workerLiveLocation?:
      | WorkerLiveLocation
      | null;

    serviceIconColor?: string;

    serviceIconBackground?: string;
  };

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

function getSafeRemoteImage(
  value: unknown,
): string {
  const url =
    cleanString(
      value,
    );

  if (
    url.startsWith(
      "https://",
    ) ||
    url.startsWith(
      "http://",
    )
  ) {
    return url;
  }

  return "";
}

/* ==============================================================
   PAYMENT STATUS
============================================================== */

function normalizePaymentStatus(
  value: unknown,
): PaymentStatus | null {
  switch (value) {
    case "pending":
    case "paid":
    case "cash":
      return value;

    default:
      return null;
  }
}

/* ==============================================================
   LIVE LOCATION
============================================================== */

function normalizeWorkerLiveLocation(
  value: unknown,
): WorkerLiveLocation | null {
  if (
    typeof value !==
      "object" ||
    value === null
  ) {
    return null;
  }

  const data =
    value as Record<
      string,
      unknown
    >;

  const latitude =
    typeof data.latitude ===
    "number"
      ? data.latitude
      : null;

  const longitude =
    typeof data.longitude ===
    "number"
      ? data.longitude
      : null;

  if (
    latitude === null ||
    longitude === null ||
    !Number.isFinite(
      latitude,
    ) ||
    !Number.isFinite(
      longitude,
    )
  ) {
    return null;
  }

  return {
    latitude,

    longitude,

    accuracy:
      typeof data.accuracy ===
      "number"
        ? data.accuracy
        : null,

    heading:
      typeof data.heading ===
      "number"
        ? data.heading
        : null,

    speed:
      typeof data.speed ===
      "number"
        ? data.speed
        : null,

    userId:
      typeof data.userId ===
      "string"
        ? data.userId
        : undefined,

    updatedAt:
      data.updatedAt,
  };
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
      return "cancelled";

    case "expired":
      return "expired";

    case "pending":
    case "pending_estimate":
    case "negotiating":
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

function normalizeCounterOfferStatus(
  value: unknown,
): CounterOfferStatus {
  switch (value) {
    case "sent":
      return "sent";

    case "accepted":
      return "accepted";

    case "declined":
      return "declined";

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

/* ==============================================================
   BOOKING MAPPER
============================================================== */

function mapBooking(
  id: string,
  data: Record<
    string,
    unknown
  >,
): WorkerBooking {
  const location =
    typeof data.location ===
      "object" &&
    data.location !== null
      ? (data.location as Booking["location"])
      : undefined;

  const photos =
    Array.isArray(
      data.photos,
    )
      ? data.photos
          .map(
            getSafeRemoteImage,
          )
          .filter(
            Boolean,
          )
      : [];

  const amount =
    typeof data.amount ===
    "number"
      ? data.amount
      : null;

  const agreedPrice =
    typeof data.agreedPrice ===
    "number"
      ? data.agreedPrice
      : null;

  const offerAmount =
    typeof data.offerAmount ===
    "number"
      ? data.offerAmount
      : null;

  const counterOfferAmount =
    typeof data.counterOfferAmount ===
    "number"
      ? data.counterOfferAmount
      : null;

  const serviceIcon =
    cleanString(
      data.serviceIcon,
    ) ||
    "tools";

  return {
    id,

    customerId:
      cleanString(
        data.customerId,
      ),

    customerName:
      cleanString(
        data.customerName,
      ) ||
      "Customer",

    customerPhotoURL:
      getSafeRemoteImage(
        data.customerPhotoURL,
      ) ||
      null,

    customerPhone:
      cleanString(
        data.customerPhone,
      ) ||
      null,

    workerId:
      cleanString(
        data.workerId,
      ),

    workerName:
      cleanString(
        data.workerName,
      ) ||
      "Worker",

    workerPhoto:
      getSafeRemoteImage(
        data.workerPhoto,
      ) ||
      null,

    serviceId:
      cleanString(
        data.serviceId,
      ),

    serviceName:
      cleanString(
        data.serviceName,
      ) ||
      "Service request",

    serviceIcon:
      serviceIcon as Booking["serviceIcon"],

    categoryId:
      cleanString(
        data.categoryId,
      ) ||
      null,

    description:
      cleanString(
        data.description,
      ),

    photos,

    address:
      cleanString(
        data.address,
      ) ||
      cleanString(
        location?.address,
      ) ||
      "Location unavailable",

    latitude:
      typeof data.latitude ===
      "number"
        ? data.latitude
        : location?.latitude ??
          null,

    longitude:
      typeof data.longitude ===
      "number"
        ? data.longitude
        : location?.longitude ??
          null,

    location,

    date:
      cleanString(
        data.date,
      ) ||
      null,

    time:
      cleanString(
        data.time,
      ) ||
      null,

    amount,

    agreedPrice,

    urgent:
      data.urgent ===
      true,

    urgentFee:
      typeof data.urgentFee ===
      "number"
        ? data.urgentFee
        : null,

    status:
      normalizeStatus(
        data.status,
      ),

    paymentStatus:
      normalizePaymentStatus(
        data.paymentStatus,
      ),

    offerAmount,

    offerMessage:
      cleanString(
        data.offerMessage,
      ) ||
      null,

    offerRound:
      typeof data.offerRound ===
      "number"
        ? data.offerRound
        : 1,

    offerStatus:
      normalizeOfferStatus(
        data.offerStatus,
      ),

    offerExpiresAt:
      data.offerExpiresAt,

    offerSentAt:
      data.offerSentAt,

    offerRespondedAt:
      data.offerRespondedAt,

    offerWorkerId:
      cleanString(
        data.offerWorkerId,
      ) ||
      null,

    counterOfferAmount,

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

    counterOfferSentAt:
      data.counterOfferSentAt,

    counterOfferRespondedAt:
      data.counterOfferRespondedAt,

    negotiationStatus:
      data.negotiationStatus ===
        "negotiating" ||
      data.negotiationStatus ===
        "completed"
        ? data.negotiationStatus
        : "none",

    customerStartedConfirmedAt:
      data.customerStartedConfirmedAt,

    customerCompletedConfirmedAt:
      data.customerCompletedConfirmedAt,

    workerLiveLocation:
      normalizeWorkerLiveLocation(
        data.workerLiveLocation,
      ),

    createdAt:
      data.createdAt,

    updatedAt:
      data.updatedAt,

    estimatedArrival:
      cleanString(
        data.estimatedArrival,
      ) ||
      null,

    workerArrivedAt:
      data.workerArrivedAt,

    serviceStartedAt:
      data.serviceStartedAt,

    serviceCompletedAt:
      data.serviceCompletedAt,

    cancelledReason:
      cleanString(
        data.cancelledReason,
      ) ||
      null,

    cancelledBy:
      data.cancelledBy ===
        "customer" ||
      data.cancelledBy ===
        "worker"
        ? data.cancelledBy
        : null,

    serviceIconColor:
      cleanString(
        data.serviceIconColor,
      ) ||
      WorkerColors.primary,

    serviceIconBackground:
      cleanString(
        data.serviceIconBackground,
      ) ||
      WorkerColors.primarySoft,
  };
}

/* ==============================================================
   SCREEN
============================================================== */

export default function WorkerOrderDetailsScreen() {
  const {
    orderId,
  } =
    useLocalSearchParams<{
      orderId?:
        | string
        | string[];
    }>();

  const resolvedOrderId =
    useMemo(() => {
      if (
        typeof orderId ===
        "string"
      ) {
        return orderId.trim();
      }

      if (
        Array.isArray(
          orderId,
        )
      ) {
        return (
          orderId[0]?.trim() ||
          ""
        );
      }

      return "";
    }, [
      orderId,
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
     ORDER
  ============================================================ */

  const [
    booking,
    setBooking,
  ] =
    useState<WorkerBooking | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    offerActionLoading,
    setOfferActionLoading,
  ] =
    useState(false);

  const actionInFlightRef =
    useRef(false);

  /* ============================================================
     COUNTER MODAL
  ============================================================ */

  const [
    counterModalVisible,
    setCounterModalVisible,
  ] =
    useState(false);

  const [
    counterAmount,
    setCounterAmount,
  ] =
    useState("");

  const [
    counterMessage,
    setCounterMessage,
  ] =
    useState("");

  const [
    counterSubmitting,
    setCounterSubmitting,
  ] =
    useState(false);

  const counterSubmittingRef =
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
     ORDER LISTENER
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

      setError(
        "Please sign in to view this order.",
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

      setError(
        "This order could not be found.",
      );

      return;
    }

    setLoading(
      true,
    );

    setError(
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

            setError(
              "This order no longer exists.",
            );

            return;
          }

          const data =
            snapshot.data();

          if (
            cleanString(
              data.workerId,
            ) !== workerId
          ) {
            setBooking(
              null,
            );

            setLoading(
              false,
            );

            setError(
              "You do not have access to this order.",
            );

            return;
          }

          setBooking(
            mapBooking(
              snapshot.id,
              data,
            ),
          );

          setLoading(
            false,
          );

          setError(
            null,
          );
        },

        snapshotError => {
          console.error(
            "WORKER_ORDER_DETAILS_LISTENER_ERROR",
            snapshotError,
          );

          setBooking(
            null,
          );

          setLoading(
            false,
          );

          setError(
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
     ACTION LOCK
  ============================================================ */

  const runLockedAction =
    useCallback(
      async (
        task: () =>
          Promise<void>,
      ) => {
        if (
          actionInFlightRef.current
        ) {
          return;
        }

        actionInFlightRef.current =
          true;

        setOfferActionLoading(
          true,
        );

        try {
          await task();
        } finally {
          actionInFlightRef.current =
            false;

          setOfferActionLoading(
            false,
          );
        }
      },
      [],
    );

  /* ============================================================
     BACK
  ============================================================ */

  const handleBack =
    useCallback(() => {
      router.back();
    }, []);

  /* ============================================================
     CUSTOMER PROFILE
  ============================================================ */

  const handleCustomerProfile =
    useCallback(() => {
      if (
        !booking?.customerId
      ) {
        Toast.show({
          type: "info",

          text1:
            "Profile unavailable",

          text2:
            "Customer profile information is not available.",
        });

        return;
      }

      Toast.show({
        type: "info",

        text1:
          "Customer profile",

        text2:
          "Customer profile navigation is not connected yet.",
      });
    }, [
      booking?.customerId,
    ]);

  /* ============================================================
     LOCATION
  ============================================================ */

  const handleViewLocation =
    useCallback(() => {
      if (
        !booking?.id
      ) {
        return;
      }

      router.push({
        pathname:
          "/(worker)/map",

        params: {
          orderId:
            booking.id,
        },
      } as never);
    }, [
      booking?.id,
    ]);

  /* ============================================================
     CALL CUSTOMER
  ============================================================ */

  const handleCallCustomer =
    useCallback(async () => {
      const phone =
        cleanString(
          booking?.customerPhone,
        ).replace(
          /[^0-9+*#,;]/g,
          "",
        );

      if (!phone) {
        Toast.show({
          type: "error",

          text1:
            "Call unavailable",

          text2:
            "Customer phone number is not available.",
        });

        return;
      }

      const url =
        `tel:${phone}`;

      try {
        const supported =
          await Linking.canOpenURL(
            url,
          );

        if (!supported) {
          Toast.show({
            type: "error",

            text1:
              "Call unavailable",

            text2:
              "Your device cannot open the phone dialer.",
          });

          return;
        }

        await Linking.openURL(
          url,
        );
      } catch (callError) {
        console.error(
          "CALL_CUSTOMER_ERROR",
          callError,
        );

        Toast.show({
          type: "error",

          text1:
            "Unable to call",

          text2:
            "We could not open the phone app.",
        });
      }
    }, [
      booking?.customerPhone,
    ]);

  /* ============================================================
     SEND INITIAL OFFER
  ============================================================ */

  const handleSendOffer =
    useCallback(() => {
      if (!booking) {
        return;
      }

      if (
        booking.status !==
        "pending"
      ) {
        Toast.show({
          type: "info",

          text1:
            "Request unavailable",

          text2:
            "This request is no longer waiting for an offer.",
        });

        return;
      }

      if (
        booking.counterOfferStatus ===
          "sent" &&
        booking.counterOfferBy ===
          "customer"
      ) {
        Toast.show({
          type: "info",

          text1:
            "Counter offer pending",

          text2:
            "Respond to the customer's counter offer first.",
        });

        return;
      }

      if (
        booking.offerStatus ===
        "sent"
      ) {
        Toast.show({
          type: "info",

          text1:
            "Offer already sent",

          text2:
            "Your offer is waiting for the customer's response.",
        });

        return;
      }

      if (
        booking.offerStatus ===
        "accepted"
      ) {
        Toast.show({
          type: "info",

          text1:
            "Offer already accepted",

          text2:
            "This order already has an accepted offer.",
        });

        return;
      }

      router.push({
        pathname:
          "/(worker)/orders/make-offer",

        params: {
          orderId:
            booking.id,

          serviceName:
            booking.serviceName,

          customerName:
            booking.customerName,
        },
      } as never);
    }, [
      booking,
    ]);

  /* ============================================================
     DECLINE REQUEST
  ============================================================ */

  const handleDecline =
    useCallback(() => {
      if (
        !booking ||
        !workerId
      ) {
        return;
      }

      if (
        booking.status !==
        "pending"
      ) {
        Toast.show({
          type: "info",

          text1:
            "Request unavailable",

          text2:
            "This request can no longer be declined.",
        });

        return;
      }

      Alert.alert(
        "Decline Request",
        "Are you sure you want to decline this request?",
        [
          {
            text:
              "Cancel",

            style:
              "cancel",
          },

          {
            text:
              "Decline",

            style:
              "destructive",

            onPress: () => {
              void runLockedAction(
                async () => {
                  try {
                    const bookingRef =
                      doc(
                        db,
                        "bookings",
                        booking.id,
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
                            "This request no longer exists.",
                          );
                        }

                        const data =
                          snapshot.data();

                        if (
                          cleanString(
                            data.workerId,
                          ) !==
                          workerId
                        ) {
                          throw new Error(
                            "You no longer have access to this request.",
                          );
                        }

                        if (
                          normalizeStatus(
                            data.status,
                          ) !==
                          "pending"
                        ) {
                          throw new Error(
                            "This request can no longer be declined.",
                          );
                        }

                        transaction.update(
                          bookingRef,
                          {
                            status:
                              "cancelled",

                            offerStatus:
                              "declined",

                            counterOfferStatus:
                              "none",

                            counterOfferRespondedAt:
                              null,

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
                        "Request declined",
                    });
                  } catch (declineError) {
                    console.error(
                      "DECLINE_REQUEST_ERROR",
                      declineError,
                    );

                    Toast.show({
                      type:
                        "error",

                      text1:
                        "Unable to decline",

                      text2:
                        declineError instanceof
                        Error
                          ? declineError.message
                          : "Please try again.",
                    });
                  }
                },
              );
            },
          },
        ],
      );
    }, [
      booking,
      runLockedAction,
      workerId,
    ]);

  /* ============================================================
     ACCEPT CUSTOMER COUNTER
  ============================================================ */

  const handleAcceptCounterOffer =
    useCallback(() => {
      if (!booking) {
        return;
      }

      const amount =
        booking.counterOfferAmount;

      if (
        booking.counterOfferBy !==
        "customer"
      ) {
        Toast.show({
          type: "info",

          text1:
            "Offer unavailable",

          text2:
            "There is no customer counter offer to accept.",
        });

        return;
      }

      if (
        booking.counterOfferStatus !==
          "sent" ||
        typeof amount !==
          "number" ||
        !Number.isFinite(
          amount,
        ) ||
        amount <= 0
      ) {
        Toast.show({
          type: "error",

          text1:
            "Invalid offer",

          text2:
            "The customer counter offer is no longer valid.",
        });

        return;
      }

      Alert.alert(
        "Accept Counter Offer",
        `Accept ₦${amount.toLocaleString(
          "en-NG",
        )} from ${booking.customerName}?`,
        [
          {
            text:
              "Cancel",

            style:
              "cancel",
          },

          {
            text:
              "Accept",

            onPress: () => {
              void runLockedAction(
                async () => {
                  try {
                    await acceptBooking(
                      booking.id,
                      "worker",
                    );

                    Toast.show({
                      type:
                        "success",

                      text1:
                        "Offer accepted",

                      text2:
                        `Order accepted at ₦${amount.toLocaleString(
                          "en-NG",
                        )}.`,
                    });
                  } catch (acceptError) {
                    console.error(
                      "ACCEPT_COUNTER_OFFER_ERROR",
                      acceptError,
                    );

                    Toast.show({
                      type:
                        "error",

                      text1:
                        "Unable to accept",

                      text2:
                        acceptError instanceof
                        Error
                          ? acceptError.message
                          : "Please try again.",
                    });
                  }
                },
              );
            },
          },
        ],
      );
    }, [
      booking,
      runLockedAction,
    ]);

  /* ============================================================
     OPEN COUNTER OFFER
  ============================================================ */

  const handleCounterCounterOffer =
    useCallback(() => {
      if (!booking) {
        return;
      }

      if (
        booking.status !==
        "pending"
      ) {
        Toast.show({
          type: "info",

          text1:
            "Request unavailable",

          text2:
            "This order is no longer available for negotiation.",
        });

        return;
      }

      if (
        booking.counterOfferStatus !==
          "sent" ||
        booking.counterOfferBy !==
          "customer"
      ) {
        Toast.show({
          type: "info",

          text1:
            "Counter offer unavailable",

          text2:
            "There is no active customer counter offer.",
        });

        return;
      }

      const customerAmount =
        booking.counterOfferAmount;

      setCounterAmount(
        typeof customerAmount ===
          "number" &&
        Number.isFinite(
          customerAmount,
        )
          ? String(
              customerAmount,
            )
          : "",
      );

      setCounterMessage(
        "",
      );

      setCounterModalVisible(
        true,
      );
    }, [
      booking,
    ]);

  /* ============================================================
     CLOSE COUNTER MODAL
  ============================================================ */

  const handleCloseCounterModal =
    useCallback(() => {
      if (
        counterSubmittingRef.current
      ) {
        return;
      }

      setCounterModalVisible(
        false,
      );

      setCounterAmount(
        "",
      );

      setCounterMessage(
        "",
      );
    }, []);

  /* ============================================================
     SUBMIT COUNTER
  ============================================================ */

  const handleSubmitCounterOffer =
    useCallback(async () => {
      if (
        !booking ||
        counterSubmittingRef.current
      ) {
        return;
      }

      if (
        booking.status !==
        "pending"
      ) {
        Toast.show({
          type: "info",

          text1:
            "Request unavailable",

          text2:
            "This order is no longer available for negotiation.",
        });

        return;
      }

      if (
        booking.counterOfferStatus !==
          "sent" ||
        booking.counterOfferBy !==
          "customer"
      ) {
        Toast.show({
          type: "info",

          text1:
            "Counter offer unavailable",

          text2:
            "The customer counter offer is no longer active.",
        });

        return;
      }

      const cleanedAmount =
        counterAmount
          .replace(
            /,/g,
            "",
          )
          .replace(
            /[^\d.]/g,
            "",
          )
          .trim();

      const amount =
        Number(
          cleanedAmount,
        );

      if (
        !cleanedAmount ||
        !Number.isFinite(
          amount,
        ) ||
        amount <= 0
      ) {
        Toast.show({
          type: "error",

          text1:
            "Invalid amount",

          text2:
            "Please enter a valid offer amount.",
        });

        return;
      }

      if (
        amount >
        100_000_000
      ) {
        Toast.show({
          type: "error",

          text1:
            "Amount too high",

          text2:
            "Please enter a valid service amount.",
        });

        return;
      }

      const message =
        counterMessage.trim();

      if (
        message.length >
        300
      ) {
        Toast.show({
          type: "error",

          text1:
            "Message too long",

          text2:
            "Please keep your message within 300 characters.",
        });

        return;
      }

      counterSubmittingRef.current =
        true;

      setCounterSubmitting(
        true,
      );

      try {
        await counterOffer(
          booking.id,
          amount,
          message,
          "worker",
        );

        setCounterModalVisible(
          false,
        );

        setCounterAmount(
          "",
        );

        setCounterMessage(
          "",
        );

        Toast.show({
          type: "success",

          text1:
            "Counter offer sent",

          text2:
            `₦${amount.toLocaleString(
              "en-NG",
            )} sent to ${booking.customerName}.`,
        });
      } catch (counterError) {
        console.error(
          "WORKER_COUNTER_OFFER_ERROR",
          counterError,
        );

        Toast.show({
          type: "error",

          text1:
            "Unable to send offer",

          text2:
            counterError instanceof
            Error
              ? counterError.message
              : "Please try again.",
        });
      } finally {
        counterSubmittingRef.current =
          false;

        setCounterSubmitting(
          false,
        );
      }
    }, [
      booking,
      counterAmount,
      counterMessage,
    ]);

  /* ============================================================
     DECLINE CUSTOMER COUNTER
  ============================================================ */

  const handleDeclineCounterOffer =
    useCallback(() => {
      if (
        !booking ||
        !workerId
      ) {
        return;
      }

      if (
        booking.counterOfferStatus !==
          "sent" ||
        booking.counterOfferBy !==
          "customer"
      ) {
        Toast.show({
          type: "info",

          text1:
            "Offer unavailable",

          text2:
            "This customer counter offer is no longer active.",
        });

        return;
      }

      Alert.alert(
        "Decline Counter Offer",
        "Are you sure you want to decline this counter offer?",
        [
          {
            text:
              "Cancel",

            style:
              "cancel",
          },

          {
            text:
              "Decline",

            style:
              "destructive",

            onPress: () => {
              void runLockedAction(
                async () => {
                  try {
                    const bookingRef =
                      doc(
                        db,
                        "bookings",
                        booking.id,
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
                            "This order no longer exists.",
                          );
                        }

                        const data =
                          snapshot.data();

                        if (
                          cleanString(
                            data.workerId,
                          ) !==
                          workerId
                        ) {
                          throw new Error(
                            "You no longer have access to this order.",
                          );
                        }

                        if (
                          normalizeCounterOfferStatus(
                            data.counterOfferStatus,
                          ) !==
                            "sent" ||
                          normalizeCounterOfferBy(
                            data.counterOfferBy,
                          ) !==
                            "customer"
                        ) {
                          throw new Error(
                            "This counter offer is no longer active.",
                          );
                        }

                        transaction.update(
                          bookingRef,
                          {
                            counterOfferStatus:
                              "declined",

                            counterOfferRespondedAt:
                              serverTimestamp(),

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
                        "Counter offer declined",
                    });
                  } catch (declineError) {
                    console.error(
                      "DECLINE_COUNTER_OFFER_ERROR",
                      declineError,
                    );

                    Toast.show({
                      type:
                        "error",

                      text1:
                        "Unable to decline",

                      text2:
                        declineError instanceof
                        Error
                          ? declineError.message
                          : "Please try again.",
                    });
                  }
                },
              );
            },
          },
        ],
      );
    }, [
      booking,
      runLockedAction,
      workerId,
    ]);

  /* ============================================================
     START SERVICE
  ============================================================ */

  const handleStartService =
    useCallback(() => {
      if (
        !booking ||
        !workerId
      ) {
        return;
      }

      if (
        booking.status !==
        "accepted"
      ) {
        Toast.show({
          type: "info",

          text1:
            "Service unavailable",

          text2:
            "This order is not ready to be started.",
        });

        return;
      }

      Alert.alert(
        "Start Service",
        "Are you ready to start this service?",
        [
          {
            text:
              "Cancel",

            style:
              "cancel",
          },

          {
            text:
              "Start",

            onPress: () => {
              void runLockedAction(
                async () => {
                  try {
                    const bookingRef =
                      doc(
                        db,
                        "bookings",
                        booking.id,
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
                            "This service no longer exists.",
                          );
                        }

                        const data =
                          snapshot.data();

                        if (
                          cleanString(
                            data.workerId,
                          ) !==
                          workerId
                        ) {
                          throw new Error(
                            "You no longer have access to this service.",
                          );
                        }

                        if (
                          normalizeStatus(
                            data.status,
                          ) !==
                          "accepted"
                        ) {
                          throw new Error(
                            "This service is no longer ready to start.",
                          );
                        }

                        transaction.update(
                          bookingRef,
                          {
                            status:
                              "in-progress",

                            customerStartedConfirmedAt:
                              null,

                            serviceStartedAt:
                              serverTimestamp(),

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
                        "Service started",

                      text2:
                        "The order is now in progress.",
                    });
                  } catch (startError) {
                    console.error(
                      "START_SERVICE_ERROR",
                      startError,
                    );

                    Toast.show({
                      type:
                        "error",

                      text1:
                        "Unable to start service",

                      text2:
                        startError instanceof
                        Error
                          ? startError.message
                          : "Please try again.",
                    });
                  }
                },
              );
            },
          },
        ],
      );
    }, [
      booking,
      runLockedAction,
      workerId,
    ]);

  /* ============================================================
     COMPLETE SERVICE
  ============================================================ */

  const handleCompleteService =
    useCallback(() => {
      if (
        !booking ||
        !workerId
      ) {
        return;
      }

      if (
        booking.status !==
        "in-progress"
      ) {
        Toast.show({
          type: "info",

          text1:
            "Service unavailable",

          text2:
            "This service is not currently in progress.",
        });

        return;
      }

      const agreedAmount =
        booking.agreedPrice;

      if (
        typeof agreedAmount !==
          "number" ||
        !Number.isFinite(
          agreedAmount,
        ) ||
        agreedAmount <= 0
      ) {
        Toast.show({
          type: "error",

          text1:
            "Amount unavailable",

          text2:
            "The agreed service amount is not available.",
        });

        return;
      }

      Alert.alert(
        "Complete Service",
        `Complete this service at ₦${agreedAmount.toLocaleString(
          "en-NG",
        )}?`,
        [
          {
            text:
              "Cancel",

            style:
              "cancel",
          },

          {
            text:
              "Complete",

            onPress: () => {
              void runLockedAction(
                async () => {
                  try {
                    const bookingRef =
                      doc(
                        db,
                        "bookings",
                        booking.id,
                      );

                    let finalAmount =
                      agreedAmount;

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
                            "This service no longer exists.",
                          );
                        }

                        const data =
                          snapshot.data();

                        if (
                          cleanString(
                            data.workerId,
                          ) !==
                          workerId
                        ) {
                          throw new Error(
                            "You no longer have access to this service.",
                          );
                        }

                        if (
                          normalizeStatus(
                            data.status,
                          ) !==
                          "in-progress"
                        ) {
                          throw new Error(
                            "This service is no longer in progress.",
                          );
                        }

                        const freshAmount =
                          data.agreedPrice;

                        if (
                          typeof freshAmount !==
                            "number" ||
                          !Number.isFinite(
                            freshAmount,
                          ) ||
                          freshAmount <= 0
                        ) {
                          throw new Error(
                            "The agreed service amount is unavailable.",
                          );
                        }

                        finalAmount =
                          freshAmount;

                        transaction.update(
                          bookingRef,
                          {
                            amount:
                              freshAmount,

                            agreedPrice:
                              freshAmount,

                            status:
                              "completed",

                            serviceCompletedAt:
                              serverTimestamp(),

                            completedAt:
                              serverTimestamp(),

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
                        "Service completed",

                      text2:
                        `Completed at ₦${finalAmount.toLocaleString(
                          "en-NG",
                        )}.`,
                    });
                  } catch (completeError) {
                    console.error(
                      "COMPLETE_SERVICE_ERROR",
                      completeError,
                    );

                    Toast.show({
                      type:
                        "error",

                      text1:
                        "Unable to complete service",

                      text2:
                        completeError instanceof
                        Error
                          ? completeError.message
                          : "Please try again.",
                    });
                  }
                },
              );
            },
          },
        ],
      );
    }, [
      booking,
      runLockedAction,
      workerId,
    ]);

  /* ============================================================
     AUTH / LOADING
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
            styles.loadingContainer
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
     SIGNED OUT
  ============================================================ */

  if (!workerId) {
    return (
      <AppScreen
        role="worker"
        contentContainerStyle={
          styles.screen
        }
      >
        <View
          style={
            styles.errorPage
          }
        >
          <EmptyState
            icon="profile"
            title="Sign in required"
            description="Please sign in to view this order."
          />
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (
    error ||
    !booking
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
            styles.errorPage
          }
        >
          <WorkerOrderHeader
            orderId={
              resolvedOrderId
            }
            status="pending"
            onBack={
              handleBack
            }
          />

          <EmptyState
            icon="file"
            title="Order unavailable"
            description={
              error ||
              "We could not find this order."
            }
          />
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     DERIVED STATE
  ============================================================ */

  const hasCustomerCounter =
    booking.counterOfferStatus ===
      "sent" &&
    booking.counterOfferBy ===
      "customer" &&
    typeof booking.counterOfferAmount ===
      "number" &&
    Number.isFinite(
      booking.counterOfferAmount,
    ) &&
    booking.counterOfferAmount >
      0;

  const hasWorkerCounter =
    booking.counterOfferStatus ===
      "sent" &&
    booking.counterOfferBy ===
      "worker" &&
    typeof booking.counterOfferAmount ===
      "number" &&
    Number.isFinite(
      booking.counterOfferAmount,
    ) &&
    booking.counterOfferAmount >
      0;

  const offerState =
    hasCustomerCounter
      ? "counter"
      : booking.offerStatus ===
            "sent" ||
          hasWorkerCounter
        ? "sent"
        : "none";

  const canDeclineRequest =
    booking.status ===
      "pending" &&
    booking.offerStatus !==
      "sent" &&
    booking.offerStatus !==
      "accepted" &&
    !hasCustomerCounter;

  const hasPhotos =
    booking.photos.length >
    0;

  /* ============================================================
     UI
  ============================================================ */

  return (
    <>
      <AppScreen
        role="worker"
        contentContainerStyle={
          styles.screen
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.content
          }
        >
          <WorkerOrderHeader
            orderId={
              booking.id
            }
            status={
              booking.status
            }
            onBack={
              handleBack
            }
          />

          <WorkerOrderInfoSections
            orderId={
              booking.id
            }
            status={
              booking.status
            }
            offerState={
              offerState
            }
            customerName={
              booking.customerName
            }
            customerPhotoURL={
              booking.customerPhotoURL
            }
            serviceName={
              booking.serviceName
            }
            serviceIcon={
              booking.serviceIcon
            }
            serviceIconColor={
              booking.serviceIconColor
            }
            serviceIconBackground={
              booking.serviceIconBackground
            }
            description={
              booking.description
            }
            photos={
              booking.photos
            }
            address={
              booking.address
            }
            latitude={
              booking.latitude
            }
            longitude={
              booking.longitude
            }
            urgent={
              booking.urgent
            }
            date={
              booking.date
            }
            time={
              booking.time
            }
            onCustomerProfile={
              handleCustomerProfile
            }
            onViewLocation={
              handleViewLocation
            }
          />

          <WorkerOrderResponseSection
            sectionNumber={
              hasPhotos
                ? "7"
                : "6"
            }
            status={
              booking.status
            }
            offerState={
              offerState
            }
            offerAmount={
              booking.offerAmount
            }
            offerMessage={
              booking.offerMessage
            }
            counterOfferAmount={
              hasCustomerCounter
                ? booking.counterOfferAmount
                : null
            }
            counterOfferMessage={
              hasCustomerCounter
                ? booking.counterOfferMessage
                : null
            }
            hasCustomerCounter={
              hasCustomerCounter
            }
            hasCustomerPhone={
              Boolean(
                booking.customerPhone,
              )
            }
            canDeclineRequest={
              canDeclineRequest
            }
            loading={
              offerActionLoading
            }
            onSendOffer={
              handleSendOffer
            }
            onAcceptCounter={
              handleAcceptCounterOffer
            }
            onCounter={
              handleCounterCounterOffer
            }
            onDeclineCounter={
              handleDeclineCounterOffer
            }
            onCall={
              handleCallCustomer
            }
            onDecline={
              handleDecline
            }
            onStartService={
              handleStartService
            }
            onCompleteService={
              handleCompleteService
            }
          />

          <WorkerOrderFooterSection
            createdAt={
              booking.createdAt
            }
          />
        </ScrollView>
      </AppScreen>

      <WorkerCounterOfferModal
        visible={
          counterModalVisible
        }
        customerOfferAmount={
          booking.counterOfferAmount
        }
        amount={
          counterAmount
        }
        message={
          counterMessage
        }
        submitting={
          counterSubmitting
        }
        onAmountChange={
          setCounterAmount
        }
        onMessageChange={
          setCounterMessage
        }
        onClose={
          handleCloseCounterModal
        }
        onSubmit={
          handleSubmitCounterOffer
        }
      />
    </>
  );
}

/* ==============================================================
   EMPTY STATE
============================================================== */

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: AppIconName;

  title: string;

  description: string;
}) {
  return (
    <View
      style={
        styles.emptyContainer
      }
    >
      <View
        style={
          styles.emptyIcon
        }
      >
        <AppIcon
          name={
            icon
          }
          role="worker"
          size="lg"
          color={
            WorkerColors.primary
          }
        />
      </View>

      <AppText
        variant="heading3"
        weight="bold"
        center
        style={
          styles.emptyTitle
        }
      >
        {title}
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        center
        style={
          styles.emptyText
        }
      >
        {description}
      </AppText>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,

      backgroundColor:
        Colors.background,
    },

    content: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    loadingContainer: {
      flex: 1,

      minHeight: 500,

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

    errorPage: {
      flex: 1,
    },

    emptyContainer: {
      flex: 1,

      minHeight: 500,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    emptyIcon: {
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

      backgroundColor:
        WorkerColors.primarySoft,
    },

    emptyTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    emptyText: {
      maxWidth: 300,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },
  });