import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  doc,
  onSnapshot,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

import WorkerLiveLocationTracker from "@/components/orders/WorkerLiveLocationTracker";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import type {
  Booking,
  BookingStatus,
  CounterOfferBy,
  CounterOfferStatus,
  OfferStatus,
  PaymentStatus,
} from "@/types/booking";


import {
  serverTimestamp,
} from "firebase/firestore";

import WorkerOrderHeader from "@/components/orders/WorkerOrderHeader";
import WorkerCustomerCard from "@/components/orders/WorkerCustomerCard";
import WorkerOrderRequest from "@/components/orders/WorkerOrderRequest";
import WorkerOrderLocation from "@/components/orders/WorkerOrderLocation";
import WorkerOrderTiming from "@/components/orders/WorkerOrderTiming";
import WorkerOfferSection from "@/components/orders/WorkerOfferSection";
import WorkerCounterOfferModal from "@/components/orders/WorkerCounterOfferModal";

import WorkerOrderActions, {
  WorkerOrderStatus,
} from "@/components/orders/WorkerOrderActions";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  acceptBooking,
  counterOffer,
} from "@/firebase/queries/bookings";

/* ==============================================================
   CONSTANTS
============================================================== */

const MAX_NEGOTIATION_ROUNDS = 3;

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

type WorkerBooking = Booking & {
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
    typeof value !== "object" ||
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
   COUNTER OFFER STATUS
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

/* ==============================================================
   COUNTER OFFER BY
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

/* ==============================================================
   DATE
============================================================== */

function getDateValue(
  value: unknown,
): Date | null {
  if (!value) {
    return null;
  }

  try {
    if (value instanceof Date) {
      return value;
    }

    if (value instanceof Timestamp) {
      return value.toDate();
    }

    if (
      typeof value === "object" &&
      value !== null &&
      "toDate" in value &&
      typeof (
        value as {
          toDate?: unknown;
        }
      ).toDate === "function"
    ) {
      return (
        value as {
          toDate: () => Date;
        }
      ).toDate();
    }

    if (
      typeof value === "string" ||
      typeof value === "number"
    ) {
      const date =
        new Date(value);

      if (
        !Number.isNaN(
          date.getTime(),
        )
      ) {
        return date;
      }
    }
  } catch {
    return null;
  }

  return null;
}

/* ==============================================================
   FORMAT DATE
============================================================== */

function formatCreatedDate(
  value: unknown,
): string {
  const date =
    getDateValue(value);

  if (!date) {
    return "Date unavailable";
  }

  return date.toLocaleDateString(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}

/* ==============================================================
   FORMAT TIME
============================================================== */

function formatCreatedTime(
  value: unknown,
): string {
  const date =
    getDateValue(value);

  if (!date) {
    return "";
  }

  return date.toLocaleTimeString(
    "en-NG",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  );
}

/* ==============================================================
   SERVICE ICON
============================================================== */

type ServiceIcon =
  keyof typeof MaterialCommunityIcons.glyphMap;

function resolveServiceIcon(
  value: unknown,
): ServiceIcon {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return "tools";
  }

  const icon =
    value.trim() as ServiceIcon;

  return icon in MaterialCommunityIcons.glyphMap
    ? icon
    : "tools";
}

/* ==============================================================
   BOOKING MAPPER
============================================================== */

function mapBooking(
  id: string,
  data: Record<string, unknown>,
): WorkerBooking {
  const location =
    typeof data.location ===
      "object" &&
    data.location !== null
      ? (data.location as Booking["location"])
      : undefined;

  const photos =
    Array.isArray(data.photos)
      ? data.photos.filter(
          (
            photo,
          ): photo is string =>
            typeof photo ===
              "string" &&
            photo.trim()
              .length > 0,
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

  const workerLiveLocation =
    normalizeWorkerLiveLocation(
      data.workerLiveLocation,
    );

  return {
    id,

    customerId:
      typeof data.customerId ===
      "string"
        ? data.customerId
        : "",

    customerName:
      typeof data.customerName ===
      "string"
        ? data.customerName
        : "Customer",

    customerPhotoURL:
      typeof data.customerPhotoURL ===
      "string"
        ? data.customerPhotoURL
        : null,

    customerPhone:
      typeof data.customerPhone ===
      "string"
        ? data.customerPhone
        : null,

    workerId:
      typeof data.workerId ===
      "string"
        ? data.workerId
        : "",

    workerName:
      typeof data.workerName ===
      "string"
        ? data.workerName
        : "Worker",

    workerPhoto:
      typeof data.workerPhoto ===
      "string"
        ? data.workerPhoto
        : null,

    serviceId:
      typeof data.serviceId ===
      "string"
        ? data.serviceId
        : "",

    serviceName:
      typeof data.serviceName ===
      "string"
        ? data.serviceName
        : "Service request",

    serviceIcon:
      resolveServiceIcon(
        data.serviceIcon,
      ),

    categoryId:
      typeof data.categoryId ===
      "string"
        ? data.categoryId
        : null,

    description:
      typeof data.description ===
      "string"
        ? data.description
        : "",

    photos,

    address:
      typeof data.address ===
      "string"
        ? data.address
        : location?.address ||
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
      typeof data.date ===
      "string"
        ? data.date
        : null,

    time:
      typeof data.time ===
      "string"
        ? data.time
        : null,

    amount,

    agreedPrice,

    urgent:
      data.urgent === true,

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
      typeof data.offerMessage ===
      "string"
        ? data.offerMessage
        : null,

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
      typeof data.offerWorkerId ===
      "string"
        ? data.offerWorkerId
        : null,

    counterOfferAmount,

    counterOfferMessage:
      typeof data.counterOfferMessage ===
      "string"
        ? data.counterOfferMessage
        : null,

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

    workerLiveLocation,

    createdAt:
      data.createdAt,

    updatedAt:
      data.updatedAt,

    estimatedArrival:
      typeof data.estimatedArrival ===
      "string"
        ? data.estimatedArrival
        : null,

    workerArrivedAt:
      data.workerArrivedAt,

    serviceStartedAt:
      data.serviceStartedAt,

    serviceCompletedAt:
      data.serviceCompletedAt,

    cancelledReason:
      typeof data.cancelledReason ===
      "string"
        ? data.cancelledReason
        : null,

    cancelledBy:
      data.cancelledBy ===
          "customer" ||
      data.cancelledBy ===
          "worker"
        ? data.cancelledBy
        : null,

    serviceIconColor:
      typeof data.serviceIconColor ===
      "string" &&
      data.serviceIconColor.trim()
        ? data.serviceIconColor.trim()
        : "#2563EB",

    serviceIconBackground:
      typeof data.serviceIconBackground ===
      "string" &&
      data.serviceIconBackground.trim()
        ? data.serviceIconBackground.trim()
        : "#EFF6FF",
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
        Array.isArray(orderId)
      ) {
        return (
          orderId[0]?.trim() ||
          ""
        );
      }

      return "";
    }, [orderId]);

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
  ] = useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    offerActionLoading,
    setOfferActionLoading,
  ] =
    useState(false);

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

  /* ============================================================
     LOAD ORDER
  ============================================================ */

  useEffect(() => {
    const workerId =
      auth.currentUser?.uid;

    if (!workerId) {
      setLoading(false);
      setError(
        "Please sign in to view this order.",
      );
      return;
    }

    if (!resolvedOrderId) {
      setLoading(false);
      setError(
        "This order could not be found.",
      );
      return;
    }

    setLoading(true);
    setError(null);

    const bookingRef =
      doc(
        db,
        "bookings",
        resolvedOrderId,
      );

    const unsubscribe =
      onSnapshot(
        bookingRef,
        (snapshot) => {
          if (
            !snapshot.exists()
          ) {
            setBooking(null);
            setLoading(false);
            setError(
              "This order no longer exists.",
            );
            return;
          }

          const data =
            snapshot.data();

          if (
            data.workerId !==
            workerId
          ) {
            setBooking(null);
            setLoading(false);
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

          setLoading(false);
          setError(null);
        },
        (snapshotError) => {
          console.error(
            "WORKER_ORDER_DETAILS_LISTENER_ERROR",
            snapshotError,
          );

          setBooking(null);
          setLoading(false);

          setError(
            "Unable to load this order. Please try again.",
          );
        },
      );

    return unsubscribe;
  }, [resolvedOrderId]);

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
        Alert.alert(
          "Unavailable",
          "Customer profile is not available.",
        );
        return;
      }

      Alert.alert(
        "Customer profile",
        "Customer profile will be connected here.",
      );
    }, [booking]);

  /* ============================================================
     LOCATION
  ============================================================ */

  const handleViewLocation =
    useCallback(() => {
      if (!booking?.id) {
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
    }, [booking?.id]);

  /* ============================================================
     CALL CUSTOMER
  ============================================================ */

  const handleCallCustomer =
    useCallback(async () => {
      const phone =
        booking?.customerPhone?.trim();

      if (!phone) {
        Alert.alert(
          "Call unavailable",
          "Customer phone number is not available.",
        );
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
          Alert.alert(
            "Call unavailable",
            "Your device cannot make phone calls.",
          );
          return;
        }

        await Linking.openURL(
          url,
        );
      } catch (error) {
        console.error(
          "CALL_CUSTOMER_ERROR",
          error,
        );

        Alert.alert(
          "Unable to call",
          "We could not open the phone app. Please try again.",
        );
      }
    }, [booking]);

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
        Alert.alert(
          "Request unavailable",
          "This request is no longer waiting for an offer.",
        );
        return;
      }

      if (
        booking.counterOfferStatus ===
          "sent" &&
        booking.counterOfferBy ===
          "customer"
      ) {
        Alert.alert(
          "Counter offer pending",
          "The customer has sent a counter offer. Accept, decline, or counter it.",
        );
        return;
      }

      if (
        booking.offerStatus ===
        "sent"
      ) {
        Alert.alert(
          "Offer already sent",
          "Your offer is waiting for the customer's response.",
        );
        return;
      }

      if (
        booking.offerStatus ===
        "accepted"
      ) {
        Alert.alert(
          "Offer already accepted",
          "This order already has an accepted offer.",
        );
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
    }, [booking]);

  /* ============================================================
     DECLINE REQUEST
  ============================================================ */

  const handleDecline =
    useCallback(() => {
      if (!booking) {
        return;
      }

      if (
        booking.status !==
        "pending"
      ) {
        Alert.alert(
          "Request unavailable",
          "This request can no longer be declined.",
        );
        return;
      }

      Alert.alert(
        "Decline Request",
        "Are you sure you want to decline this request?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Decline",
            style: "destructive",
            onPress:
              async () => {
                try {
                  setOfferActionLoading(
                    true,
                  );

                  await updateDoc(
                    doc(
                      db,
                      "bookings",
                      booking.id,
                    ),
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
                        new Date(),
                    },
                  );
                } catch (error) {
                  console.error(
                    "DECLINE_REQUEST_ERROR",
                    error,
                  );

                  Alert.alert(
                    "Unable to decline",
                    "We could not decline this request. Please try again.",
                  );
                } finally {
                  setOfferActionLoading(
                    false,
                  );
                }
              },
          },
        ],
      );
    }, [booking]);

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
        Alert.alert(
          "Offer unavailable",
          "There is no customer counter offer to accept.",
        );
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
        Alert.alert(
          "Invalid offer",
          "The customer counter offer is no longer valid.",
        );
        return;
      }

      Alert.alert(
        "Accept Counter Offer",
        `Accept ₦${amount.toLocaleString(
          "en-NG",
        )} from ${booking.customerName}?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Accept",
            onPress:
              async () => {
                try {
                  setOfferActionLoading(
                    true,
                  );

                  await acceptBooking(
                    booking.id,
                    "worker",
                  );

                  Alert.alert(
                    "Offer Accepted",
                    `The order has been accepted at ₦${amount.toLocaleString(
                      "en-NG",
                    )}.`,
                  );
                } catch (error) {
                  console.error(
                    "ACCEPT_COUNTER_OFFER_ERROR",
                    error,
                  );

                  Alert.alert(
                    "Unable to accept",
                    error instanceof
                      Error
                      ? error.message
                      : "We could not accept this counter offer. Please try again.",
                  );
                } finally {
                  setOfferActionLoading(
                    false,
                  );
                }
              },
          },
        ],
      );
    }, [booking]);

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
        Alert.alert(
          "Request unavailable",
          "This order is no longer available for negotiation.",
        );
        return;
      }

      if (
        booking.counterOfferStatus !==
          "sent" ||
        booking.counterOfferBy !==
          "customer"
      ) {
        Alert.alert(
          "Counter offer unavailable",
          "There is no active customer counter offer.",
        );
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

      setCounterMessage("");

      setCounterModalVisible(
        true,
      );
    }, [booking]);

  /* ============================================================
     CLOSE COUNTER MODAL
  ============================================================ */

  const handleCloseCounterModal =
    useCallback(() => {
      if (
        counterSubmitting
      ) {
        return;
      }

      setCounterModalVisible(
        false,
      );

      setCounterAmount("");
      setCounterMessage("");
    }, [counterSubmitting]);

  /* ============================================================
     SUBMIT WORKER COUNTER
  ============================================================ */

  const handleSubmitCounterOffer =
    useCallback(async () => {
      if (!booking) {
        return;
      }

      if (counterSubmitting) {
        return;
      }

      if (
        booking.status !==
        "pending"
      ) {
        Alert.alert(
          "Request unavailable",
          "This order is no longer available for negotiation.",
        );
        return;
      }

      if (
        booking.counterOfferStatus !==
          "sent" ||
        booking.counterOfferBy !==
          "customer"
      ) {
        Alert.alert(
          "Counter offer unavailable",
          "The customer counter offer is no longer active.",
        );
        return;
      }

      const cleanedAmount =
        counterAmount
          .replace(/,/g, "")
          .replace(/[^\d.]/g, "")
          .trim();

      const amount =
        Number(cleanedAmount);

      if (
        !cleanedAmount ||
        !Number.isFinite(
          amount,
        ) ||
        amount <= 0
      ) {
        Alert.alert(
          "Invalid amount",
          "Please enter a valid offer amount.",
        );
        return;
      }

      if (
        amount >
        100_000_000
      ) {
        Alert.alert(
          "Amount too high",
          "Please enter a valid service amount.",
        );
        return;
      }

      const message =
        counterMessage.trim();

      if (
        message.length >
        300
      ) {
        Alert.alert(
          "Message too long",
          "Please keep your message within 300 characters.",
        );
        return;
      }

      try {
        setCounterSubmitting(
          true,
        );

        await counterOffer(
          booking.id,
          amount,
          message,
          "worker",
        );

        setCounterModalVisible(
          false,
        );

        setCounterAmount("");
        setCounterMessage("");

        Alert.alert(
          "Counter Offer Sent",
          `Your new offer of ₦${amount.toLocaleString(
            "en-NG",
          )} has been sent to ${booking.customerName}.`,
        );
      } catch (error) {
        console.error(
          "WORKER_COUNTER_OFFER_ERROR",
          error,
        );

        Alert.alert(
          "Unable to send offer",
          error instanceof
            Error
            ? error.message
            : "We could not send your counter offer. Please try again.",
        );
      } finally {
        setCounterSubmitting(
          false,
        );
      }
    }, [
      booking,
      counterAmount,
      counterMessage,
      counterSubmitting,
    ]);

  /* ============================================================
     DECLINE CUSTOMER COUNTER
  ============================================================ */

  const handleDeclineCounterOffer =
    useCallback(() => {
      if (!booking) {
        return;
      }

      if (
        booking.counterOfferStatus !==
          "sent" ||
        booking.counterOfferBy !==
          "customer"
      ) {
        Alert.alert(
          "Offer unavailable",
          "This customer counter offer is no longer active.",
        );
        return;
      }

      Alert.alert(
        "Decline Counter Offer",
        "Are you sure you want to decline this counter offer?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Decline",
            style: "destructive",
            onPress:
              async () => {
                try {
                  setOfferActionLoading(
                    true,
                  );

                  await updateDoc(
                    doc(
                      db,
                      "bookings",
                      booking.id,
                    ),
                    {
                      counterOfferStatus:
                        "declined",

                      counterOfferRespondedAt:
                        new Date(),

                      updatedAt:
                        new Date(),
                    },
                  );

                  Alert.alert(
                    "Counter Offer Declined",
                    "The customer's counter offer has been declined.",
                  );
                } catch (error) {
                  console.error(
                    "DECLINE_COUNTER_OFFER_ERROR",
                    error,
                  );

                  Alert.alert(
                    "Unable to decline",
                    "We could not decline the counter offer. Please try again.",
                  );
                } finally {
                  setOfferActionLoading(
                    false,
                  );
                }
              },
          },
        ],
      );
    }, [booking]);

  /* ============================================================
     START SERVICE
  ============================================================ */

  const handleStartService =
    useCallback(() => {
      if (!booking) {
        return;
      }

      if (
        booking.status !==
        "accepted"
      ) {
        Alert.alert(
          "Service unavailable",
          "This order is not ready to be started.",
        );
        return;
      }

      Alert.alert(
        "Start Service",
        "Are you ready to start this service?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Start",
            onPress:
              async () => {
                try {
                  setOfferActionLoading(
                    true,
                  );

                  await updateDoc(
                    doc(
                      db,
                      "bookings",
                      booking.id,
                    ),
                    {
                      status:
                        "in-progress",

                      customerStartedConfirmedAt:
                        null,

                      serviceStartedAt:
                        new Date(),

                      updatedAt:
                        new Date(),
                    },
                  );

                  Alert.alert(
                    "Service Started",
                    "The order is now in progress.",
                  );
                } catch (error) {
                  console.error(
                    "START_SERVICE_ERROR",
                    error,
                  );

                  Alert.alert(
                    "Unable to start service",
                    "We could not start this service. Please try again.",
                  );
                } finally {
                  setOfferActionLoading(
                    false,
                  );
                }
              },
          },
        ],
      );
    }, [booking]);

  /* ============================================================
     COMPLETE SERVICE
  ============================================================ */

  const handleCompleteService =
    useCallback(() => {
      if (!booking) {
        return;
      }

      if (
        booking.status !==
        "in-progress"
      ) {
        Alert.alert(
          "Service unavailable",
          "This service is not currently in progress.",
        );
        return;
      }

      /*
       * IMPORTANT:
       * Final service amount must always come
       * from agreedPrice.
       */
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
        Alert.alert(
          "Amount unavailable",
          "The agreed service amount is not available. The service cannot be completed yet.",
        );
        return;
      }

      Alert.alert(
        "Complete Service",
        `Complete this service at ₦${agreedAmount.toLocaleString(
          "en-NG",
        )}?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Complete",
            onPress:
              async () => {
                try {
                  setOfferActionLoading(
                    true,
                  );

                 await updateDoc(
  doc(
    db,
    "bookings",
    booking.id,
  ),
  {
    amount: agreedAmount,

    agreedPrice: agreedAmount,

    status: "completed",

    completedAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  },
);

                  Alert.alert(
                    "Service Completed",
                    `Service completed at ₦${agreedAmount.toLocaleString(
                      "en-NG",
                    )}.`,
                  );
                } catch (error) {
                  console.error(
                    "COMPLETE_SERVICE_ERROR",
                    error,
                  );

                  Alert.alert(
                    "Unable to complete service",
                    "We could not complete this service. Please try again.",
                  );
                } finally {
                  setOfferActionLoading(
                    false,
                  );
                }
              },
          },
        ],
      );
    }, [booking]);

  /* ============================================================
     AUTH
  ============================================================ */

  if (!auth.currentUser) {
    return (
      <AppScreen
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
            icon="person-outline"
            title="Sign in required"
            description="Please sign in to view this order."
          />
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <AppScreen
        contentContainerStyle={
          styles.screen
        }
      >
        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="small"
            color="#2563EB"
          />

          <AppText
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
    error ||
    !booking
  ) {
    return (
      <AppScreen
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
            icon="receipt-outline"
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
     DERIVED OFFER STATE
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

  const canSendOffer =
    booking.status ===
      "pending" &&
    booking.offerStatus !==
      "sent" &&
    booking.offerStatus !==
      "accepted" &&
    !hasCustomerCounter;

  const workerActionStatus =
    booking.status ===
        "accepted" ||
      booking.status ===
        "in-progress" ||
      booking.status ===
        "completed"
      ? (booking.status as WorkerOrderStatus)
      : null;

  const createdDate =
    formatCreatedDate(
      booking.createdAt,
    );

  const createdTime =
    formatCreatedTime(
      booking.createdAt,
    );

  const hasPhotos =
    booking.photos.length >
    0;

  return (
    <>
      <AppScreen
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
          {/* HEADER */}

          <WorkerOrderHeader
            orderId={booking.id}
            status={booking.status}
            onBack={handleBack}
          />

          {/* NEW REQUEST */}

          {booking.status ===
              "pending" &&
            !hasCustomerCounter && (
              <NewRequestStatusCard />
            )}

          {/* CUSTOMER */}

          <SectionTitle
            number="1"
            title="Request from customer"
          />

          <WorkerCustomerCard
            name={
              booking.customerName
            }
            photoURL={
              booking.customerPhotoURL
            }
            onProfile={
              handleCustomerProfile
            }
          />

          {/* SERVICE */}

          <SectionTitle
            number="2"
            title="Service"
          />

          <View
            style={
              styles.serviceCard
            }
          >
            <View
              style={[
                styles.serviceIcon,
                {
                  backgroundColor:
                    booking.serviceIconBackground ??
                    "#EFF6FF",
                },
              ]}
            >
              <MaterialCommunityIcons
                name={resolveServiceIcon(
                  booking.serviceIcon,
                )}
                size={25}
                color={
                  booking.serviceIconColor ??
                  "#2563EB"
                }
              />
            </View>

            <View
              style={
                styles.serviceInfo
              }
            >
              <AppText
                style={
                  styles.smallLabel
                }
              >
                SERVICE
              </AppText>

              <AppText
                weight="bold"
                numberOfLines={2}
                style={
                  styles.serviceName
                }
              >
                {
                  booking.serviceName
                }
              </AppText>
            </View>
          </View>

          {/* REQUEST */}

          <SectionTitle
            number="3"
            title="Customer Request"
          />

          <WorkerOrderRequest
            description={
              booking.description
            }
          />

          {/* LIVE LOCATION */}

          <WorkerLiveLocationTracker
            orderId={booking.id}
            enabled={
              booking.status ===
              "in-progress"
            }
          />

          {/* PHOTOS */}

          {hasPhotos && (
            <>
              <SectionTitle
                number="4"
                title="Photos"
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.photos
                }
              >
                {booking.photos.map(
                  (
                    photo,
                    index,
                  ) => (
                    <Image
                      key={`${photo}-${index}`}
                      source={{
                        uri: photo,
                      }}
                      style={
                        styles.photo
                      }
                      resizeMode="cover"
                      accessibilityLabel={`Request photo ${
                        index + 1
                      }`}
                    />
                  ),
                )}
              </ScrollView>
            </>
          )}

          {/* LOCATION */}

          <SectionTitle
            number={
              hasPhotos
                ? "5"
                : "4"
            }
            title="Service Location"
          />

          <WorkerOrderLocation
            address={
              booking.address
            }
            latitude={
              booking.latitude
            }
            longitude={
              booking.longitude
            }
            onViewLocation={
              handleViewLocation
            }
          />

          {/* WHEN */}

          <SectionTitle
            number={
              hasPhotos
                ? "6"
                : "5"
            }
            title="When"
          />

          <WorkerOrderTiming
            urgent={
              booking.urgent
            }
            date={
              booking.date
            }
            time={
              booking.time
            }
          />

          {/* RESPONSE */}

          <SectionTitle
            number={
              hasPhotos
                ? "7"
                : "6"
            }
            title="Your Response"
          />

          <WorkerOfferSection
            state={
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
            loading={
              offerActionLoading
            }
          />

          {/* ACTIONS */}

          {workerActionStatus ? (
            <WorkerOrderActions
              status={
                workerActionStatus
              }
              onCall={
                handleCallCustomer
              }
              onStartService={
                handleStartService
              }
              onCompleteService={
                handleCompleteService
              }
              callDisabled={
                !booking.customerPhone
              }
              actionDisabled={
                false
              }
              actionLoading={
                offerActionLoading
              }
            />
          ) : (
            !hasCustomerCounter && (
              <WorkerPendingActions
                onCall={
                  handleCallCustomer
                }
                onDecline={
                  handleDecline
                }
                declineDisabled={
                  !canSendOffer ||
                  offerActionLoading
                }
                loading={
                  offerActionLoading
                }
              />
            )
          )}

          {/* CREATED */}

          <View
            style={
              styles.createdInfo
            }
          >
            <Ionicons
              name="time-outline"
              size={14}
              color="#94A3B8"
            />

            <AppText
              style={
                styles.createdText
              }
            >
              Received{" "}
              {createdDate}
              {createdTime
                ? ` • ${createdTime}`
                : ""}
            </AppText>
          </View>
        </ScrollView>
      </AppScreen>

      {/* COUNTER OFFER MODAL */}

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
   PENDING ACTIONS
============================================================== */

const WorkerPendingActions =
  React.memo(
    function WorkerPendingActions({
      onCall,
      onDecline,
      declineDisabled = false,
      loading = false,
    }: {
      onCall: () => void;
      onDecline: () => void;
      declineDisabled?: boolean;
      loading?: boolean;
    }) {
      return (
        <View
          style={
            styles.pendingActions
          }
        >
          <Pressable
            onPress={onCall}
            accessibilityRole="button"
            accessibilityLabel="Call customer"
            style={({ pressed }) => [
              styles.pendingCallButton,
              pressed &&
                styles.buttonPressed,
            ]}
          >
            <View
              style={
                styles.pendingCallIcon
              }
            >
              <Ionicons
                name="call-outline"
                size={21}
                color="#FFFFFF"
              />
            </View>

            <AppText
              weight="bold"
              style={
                styles.pendingCallText
              }
            >
              CALL
            </AppText>
          </Pressable>

          <Pressable
            onPress={onDecline}
            disabled={
              declineDisabled
            }
            accessibilityRole="button"
            accessibilityLabel="Decline request"
            accessibilityState={{
              disabled:
                declineDisabled,
              busy: loading,
            }}
            style={({ pressed }) => [
              styles.pendingDeclineButton,

              declineDisabled &&
                styles.pendingDeclineDisabled,

              pressed &&
                !declineDisabled &&
                styles.buttonPressed,
            ]}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <>
                <View
                  style={
                    styles.pendingDeclineIcon
                  }
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={21}
                    color="#FFFFFF"
                  />
                </View>

                <AppText
                  weight="bold"
                  style={
                    styles.pendingDeclineText
                  }
                >
                  DECLINE REQUEST
                </AppText>
              </>
            )}
          </Pressable>
        </View>
      );
    },
  );

/* ==============================================================
   NEW REQUEST CARD
============================================================== */

const NewRequestStatusCard =
  React.memo(
    function NewRequestStatusCard() {
      return (
        <View
          style={
            styles.statusCard
          }
        >
          <View
            style={
              styles.statusIcon
            }
          >
            <Ionicons
              name="notifications-outline"
              size={26}
              color="#2563EB"
            />
          </View>

          <View
            style={
              styles.statusContent
            }
          >
            <AppText
              weight="bold"
              style={
                styles.statusTitle
              }
            >
              NEW REQUEST
            </AppText>

            <AppText
              style={
                styles.statusText
              }
            >
              A customer has sent you
              a service request. Review
              the details and send your
              offer.
            </AppText>
          </View>

          <View
            style={
              styles.newBadge
            }
          >
            <AppText
              weight="bold"
              style={
                styles.newBadgeText
              }
            >
              NEW
            </AppText>
          </View>
        </View>
      );
    },
  );

/* ==============================================================
   SECTION TITLE
============================================================== */

const SectionTitle =
  React.memo(
    function SectionTitle({
      number,
      title,
    }: {
      number: string;
      title: string;
    }) {
      return (
        <View
          style={
            styles.sectionTitle
          }
        >
          <View
            style={
              styles.sectionNumber
            }
          >
            <AppText
              weight="bold"
              style={
                styles.sectionNumberText
              }
            >
              {number}
            </AppText>
          </View>

          <AppText
            weight="bold"
            style={
              styles.sectionText
            }
          >
            {title}
          </AppText>
        </View>
      );
    },
  );

/* ==============================================================
   EMPTY STATE
============================================================== */

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
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
        <Ionicons
          name={icon}
          size={29}
          color="#2563EB"
        />
      </View>

      <AppText
        weight="bold"
        style={
          styles.emptyTitle
        }
      >
        {title}
      </AppText>

      <AppText
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
        "#F8FAFC",
    },

    content: {
      paddingHorizontal: 16,
      paddingBottom: 40,
    },

    statusCard: {
      minHeight: 106,
      marginTop: 8,
      padding: 14,
      borderRadius: 18,
      backgroundColor:
        "#EFF6FF",
      borderWidth: 1,
      borderColor:
        "#BFDBFE",
      flexDirection: "row",
      alignItems: "center",
    },

    statusIcon: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor:
        "#FFFFFF",
      alignItems: "center",
      justifyContent:
        "center",
    },

    statusContent: {
      flex: 1,
      marginHorizontal: 12,
    },

    statusTitle: {
      fontSize: 12,
      color: "#2563EB",
    },

    statusText: {
      marginTop: 4,
      fontSize: 10.5,
      lineHeight: 16,
      color: "#64748B",
    },

    newBadge: {
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor:
        "#DBEAFE",
    },

    newBadgeText: {
      fontSize: 8,
      color: "#1D4ED8",
    },

    sectionTitle: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 20,
      marginBottom: 9,
    },

    sectionNumber: {
      width: 27,
      height: 27,
      borderRadius: 9,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 8,
    },

    sectionNumberText: {
      fontSize: 12,
      color: "#2563EB",
    },

    sectionText: {
      fontSize: 15,
      color: "#0F172A",
    },

    serviceCard: {
      minHeight: 70,
      padding: 11,
      borderRadius: 17,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      flexDirection: "row",
      alignItems: "center",
    },

    serviceIcon: {
      width: 48,
      height: 48,
      borderRadius: 15,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent:
        "center",
    },

    serviceInfo: {
      flex: 1,
      marginLeft: 11,
    },

    smallLabel: {
      fontSize: 8,
      letterSpacing: 1,
      color: "#94A3B8",
    },

    serviceName: {
      marginTop: 3,
      fontSize: 14,
      color: "#0F172A",
    },

    photos: {
      gap: 8,
    },

    photo: {
      width: 110,
      height: 110,
      borderRadius: 15,
      backgroundColor:
        "#E2E8F0",
    },

    pendingActions: {
      width: "100%",
      marginTop: 20,
      flexDirection: "row",
      alignItems: "stretch",
      gap: 10,
    },

    pendingCallButton: {
      flex: 0.9,
      minHeight: 58,
      borderRadius: 16,
      backgroundColor:
        "#F97316",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
    },

    pendingCallIcon: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor:
        "#FB923C",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },

    pendingCallText: {
      fontSize: 10.5,
      letterSpacing: 0.3,
      color: "#FFFFFF",
    },

    pendingDeclineButton: {
      flex: 1.45,
      minHeight: 58,
      borderRadius: 16,
      backgroundColor:
        "#DC2626",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
    },

    pendingDeclineIcon: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor:
        "#EF4444",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },

    pendingDeclineText: {
      fontSize: 9.5,
      letterSpacing: 0.15,
      color: "#FFFFFF",
    },

    pendingDeclineDisabled: {
      backgroundColor:
        "#CBD5E1",
    },

    createdInfo: {
      marginTop: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
    },

    createdText: {
      fontSize: 9,
      color: "#94A3B8",
    },

    loadingContainer: {
      flex: 1,
      minHeight: 500,
      alignItems: "center",
      justifyContent: "center",
    },

    loadingText: {
      marginTop: 10,
      fontSize: 11,
      color: "#64748B",
    },

    errorPage: {
      flex: 1,
    },

    emptyContainer: {
      flex: 1,
      minHeight: 500,
      paddingHorizontal: 30,
      alignItems: "center",
      justifyContent: "center",
    },

    emptyIcon: {
      width: 66,
      height: 66,
      borderRadius: 21,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    emptyTitle: {
      marginTop: 15,
      fontSize: 17,
      color: "#0F172A",
    },

    emptyText: {
      marginTop: 6,
      fontSize: 11.5,
      lineHeight: 18,
      color: "#64748B",
    },

    buttonPressed: {
      opacity: 0.82,
      transform: [
        {
          scale: 0.985,
        },
      ],
    },
  });