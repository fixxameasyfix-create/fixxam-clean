import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import type {
  BookingStatus,
  OfferStatus,
  CounterOfferBy,
} from "../../../types/booking";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  auth,
  db,
} from "@/firebase/config";

import CustomerOrderHeader from "@/components/orders/CustomerOrderHeader";
import CustomerOrderRequest from "@/components/orders/CustomerOrderRequest";
import CustomerOrderOfferSection from "@/components/orders/CustomerOrderOfferSection";
import CustomerOrderActions from "@/components/orders/CustomerOrderActions";
import OrderExpiryTimer from "@/components/orders/OrderExpiryTimer";

/* ============================================================
   CONSTANTS
============================================================ */

const MAX_NEGOTIATION_ROUNDS = 3;

/* ============================================================
   TYPES
============================================================ */

type CounterOfferStatus =
  | "none"
  | "sent"
  | "accepted"
  | "declined"
  | null;

type BookingLocation = {
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
};

type LiveLocation = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  userId?: string;
  updatedAt?: unknown;
};

type Booking = {
  id: string;

  customerId: string;
  customerName: string;
  customerPhotoURL?: string | null;

  workerId: string;
  workerName: string;
  workerPhoto?: string | null;
  workerCategory?: string | null;
  workerPhone?: string | null;

  serviceId: string;
  serviceName: string;
  serviceIcon?: string | null;

  categoryId?: string | null;

  description: string;

  photos: string[];

  address: string;

  latitude?: number | null;
  longitude?: number | null;

  location?: BookingLocation;

  date?: string | null;
  time?: string | null;

  /*
   * Original/request amount.
   */
  amount?: number | null;

  /*
   * Final mutually agreed service price.
   *
   * This becomes the source of truth after
   * the customer accepts an offer.
   */
  agreedPrice?: number | null;

  urgent: boolean;
  urgentFee?: number | null;

  status: BookingStatus;

  paymentStatus?: string | null;

  /* ==========================================================
     WORKER OFFER
  ========================================================== */

  offerAmount?: number | null;
  offerMessage?: string | null;

  offerRound: number;
  offerStatus: OfferStatus;

  offerExpiresAt?: unknown;
  offerSentAt?: unknown;
  offerRespondedAt?: unknown;

  /* ==========================================================
     COUNTER OFFER
  ========================================================== */

  counterOfferAmount?: number | null;
  counterOfferMessage?: string | null;

  counterOfferBy: CounterOfferBy;
  counterOfferStatus: CounterOfferStatus;

  counterOfferSentAt?: unknown;
  counterOfferRespondedAt?: unknown;

  /* ==========================================================
     SERVICE CONFIRMATIONS
  ========================================================== */

  customerStartedConfirmedAt?: unknown;
  customerCompletedConfirmedAt?: unknown;

  /* ==========================================================
     LIVE LOCATION
  ========================================================== */

  workerLiveLocation?: LiveLocation | null;

  /* ==========================================================
     META
  ========================================================== */

  createdAt?: unknown;
  updatedAt?: unknown;
};

/* ============================================================
   HELPERS
============================================================ */

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
  if (value === "customer") {
    return "customer";
  }

  if (value === "worker") {
    return "worker";
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
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 1;
  }

  return Math.min(
    MAX_NEGOTIATION_ROUNDS,
    Math.max(
      1,
      Math.floor(value),
    ),
  );
}

/* ============================================================
   TIMESTAMP
============================================================ */

function resolveTimestampMillis(
  value: unknown,
): number | null {
  if (value == null) {
    return null;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toMillis" in value &&
    typeof (
      value as {
        toMillis?: unknown;
      }
    ).toMillis === "function"
  ) {
    const millis = (
      value as {
        toMillis: () => number;
      }
    ).toMillis();

    return Number.isFinite(millis)
      ? millis
      : null;
  }

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (value instanceof Date) {
    const millis = value.getTime();

    return Number.isFinite(millis)
      ? millis
      : null;
  }

  if (typeof value === "string") {
    const millis = Date.parse(value);

    return Number.isFinite(millis)
      ? millis
      : null;
  }

  return null;
}

/* ============================================================
   AMOUNT
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

  return `₦${value.toLocaleString(
    "en-NG",
  )}`;
}

/* ============================================================
   LIVE LOCATION MAPPER
============================================================ */

function mapLiveLocation(
  value: unknown,
): LiveLocation | null {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return null;
  }

  const location =
    value as Record<
      string,
      unknown
    >;

  const latitude =
    typeof location.latitude ===
    "number"
      ? location.latitude
      : null;

  const longitude =
    typeof location.longitude ===
    "number"
      ? location.longitude
      : null;

  if (
    latitude === null ||
    longitude === null ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  return {
    latitude,
    longitude,

    accuracy:
      typeof location.accuracy ===
      "number"
        ? location.accuracy
        : null,

    heading:
      typeof location.heading ===
      "number"
        ? location.heading
        : null,

    speed:
      typeof location.speed ===
      "number"
        ? location.speed
        : null,

    userId:
      typeof location.userId ===
      "string"
        ? location.userId
        : undefined,

    updatedAt:
      location.updatedAt,
  };
}

/* ============================================================
   BOOKING MAPPER
============================================================ */

function mapBooking(
  id: string,
  data: Record<string, unknown>,
): Booking {
  const location =
    typeof data.location ===
      "object" &&
    data.location !== null
      ? (data.location as BookingLocation)
      : undefined;

  const photos =
    Array.isArray(data.photos)
      ? data.photos.filter(
          (photo): photo is string =>
            typeof photo ===
              "string" &&
            photo.trim().length > 0,
        )
      : [];

  const workerLiveLocation =
    mapLiveLocation(
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

    workerCategory:
      typeof data.workerCategory ===
      "string"
        ? data.workerCategory
        : null,

    workerPhone:
      typeof data.workerPhone ===
      "string"
        ? data.workerPhone
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
      typeof data.serviceIcon ===
      "string"
        ? data.serviceIcon
        : null,

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

    amount:
      typeof data.amount ===
      "number"
        ? data.amount
        : null,

    agreedPrice:
      typeof data.agreedPrice ===
      "number"
        ? data.agreedPrice
        : null,

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
      typeof data.paymentStatus ===
      "string"
        ? data.paymentStatus
        : null,

    /* OFFER */

    offerAmount:
      typeof data.offerAmount ===
      "number"
        ? data.offerAmount
        : null,

    offerMessage:
      typeof data.offerMessage ===
      "string"
        ? data.offerMessage
        : null,

    offerRound:
      normalizeRound(
        data.offerRound,
      ),

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

    /* COUNTER */

    counterOfferAmount:
      typeof data.counterOfferAmount ===
      "number"
        ? data.counterOfferAmount
        : null,

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

    /* CONFIRMATIONS */

    customerStartedConfirmedAt:
      data.customerStartedConfirmedAt,

    customerCompletedConfirmedAt:
      data.customerCompletedConfirmedAt,

    /* LIVE LOCATION */

    workerLiveLocation,

    /* META */

    createdAt:
      data.createdAt,

    updatedAt:
      data.updatedAt,
  };
}

/* ============================================================
   SCREEN
============================================================ */

export default function CustomerOrderScreen() {
  const params =
    useLocalSearchParams<{
      orderId?: string | string[];
    }>();

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
    }, [params.orderId]);

  const [
    booking,
    setBooking,
  ] = useState<Booking | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    callLoading,
    setCallLoading,
  ] = useState(false);

  const [
    workerLiveLocation,
    setWorkerLiveLocation,
  ] =
    useState<LiveLocation | null>(
      null,
    );

  /* ==========================================================
     LOAD BOOKING
  ========================================================== */

  useEffect(() => {
    const customerId =
      auth.currentUser?.uid;

    if (!customerId) {
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

    const bookingRef = doc(
      db,
      "bookings",
      resolvedOrderId,
    );

    const unsubscribe =
      onSnapshot(
        bookingRef,

        (snapshot) => {
          if (!snapshot.exists()) {
            setBooking(null);
            setWorkerLiveLocation(null);
            setLoading(false);
            setError(
              "This order no longer exists.",
            );

            return;
          }

          const data =
            snapshot.data();

          if (
            data.customerId !==
            customerId
          ) {
            setBooking(null);
            setWorkerLiveLocation(null);
            setLoading(false);
            setError(
              "You do not have access to this order.",
            );

            return;
          }

          const mapped =
            mapBooking(
              snapshot.id,
              data,
            );

          setBooking(mapped);

          setWorkerLiveLocation(
            mapped.workerLiveLocation ??
              null,
          );

          setLoading(false);
          setError(null);
        },

        (snapshotError) => {
          console.error(
            "CUSTOMER_ORDER_LISTENER_ERROR",
            snapshotError,
          );

          setBooking(null);
          setWorkerLiveLocation(null);
          setLoading(false);

          setError(
            "Unable to load this order. Please try again.",
          );
        },
      );

    return unsubscribe;
  }, [resolvedOrderId]);

  /* ==========================================================
     WORKER LIVE LOCATION
  ========================================================== */

  useEffect(() => {
    if (
      !resolvedOrderId ||
      !booking ||
      booking.status !==
        "in-progress"
    ) {
      setWorkerLiveLocation(null);

      return;
    }

    const bookingRef = doc(
      db,
      "bookings",
      resolvedOrderId,
    );

    const unsubscribe =
      onSnapshot(
        bookingRef,

        (snapshot) => {
          if (!snapshot.exists()) {
            setWorkerLiveLocation(null);
            return;
          }

          const data =
            snapshot.data();

          if (
            data.customerId !==
            auth.currentUser?.uid
          ) {
            setWorkerLiveLocation(null);
            return;
          }

          const location =
            mapLiveLocation(
              data.workerLiveLocation,
            );

          if (!location) {
            setWorkerLiveLocation(null);
            return;
          }

          if (
            location.userId &&
            booking.workerId &&
            location.userId !==
              booking.workerId
          ) {
            console.warn(
              "CUSTOMER_LIVE_LOCATION_WORKER_MISMATCH",
            );

            setWorkerLiveLocation(null);
            return;
          }

          setWorkerLiveLocation(
            location,
          );
        },

        (snapshotError) => {
          console.error(
            "CUSTOMER_WORKER_LIVE_LOCATION_ERROR",
            snapshotError,
          );

          setWorkerLiveLocation(null);
        },
      );

    return unsubscribe;
  }, [
    resolvedOrderId,
    booking?.status,
    booking?.workerId,
  ]);

  /* ==========================================================
     EXPIRY
  ========================================================== */

  const offerExpiresAt =
    resolveTimestampMillis(
      booking?.offerExpiresAt,
    );

  const offerExpired =
    offerExpiresAt !== null &&
    offerExpiresAt <= Date.now();

  const orderExpired =
    booking?.status ===
      "expired" ||
    offerExpired;

  /* ==========================================================
     HANDLE EXPIRY
  ========================================================== */

  const handleOrderExpired =
    useCallback(async () => {
      if (!booking) {
        return;
      }

      if (
        booking.status !==
        "pending"
      ) {
        return;
      }

      try {
        await updateDoc(
          doc(
            db,
            "bookings",
            booking.id,
          ),
          {
            status: "expired",

            updatedAt:
              serverTimestamp(),
          },
        );
      } catch (error) {
        console.error(
          "CUSTOMER_ORDER_EXPIRY_ERROR",
          error,
        );
      }
    }, [booking]);

  /* ==========================================================
     EXPIRY WATCHER
  ========================================================== */

  useEffect(() => {
    if (
      !booking ||
      booking.status !==
        "pending" ||
      offerExpiresAt === null
    ) {
      return;
    }

    const remaining =
      offerExpiresAt -
      Date.now();

    if (remaining <= 0) {
      void handleOrderExpired();
      return;
    }

    const timer =
      setTimeout(
        () => {
          void handleOrderExpired();
        },
        remaining + 100,
      );

    return () => {
      clearTimeout(timer);
    };
  }, [
    booking,
    offerExpiresAt,
    handleOrderExpired,
  ]);

  /* ==========================================================
     BACK
  ========================================================== */

  const handleBack =
    useCallback(() => {
      router.back();
    }, []);

  /* ==========================================================
     WORKER PROFILE
  ========================================================== */

  const handleWorkerProfile =
    useCallback(() => {
      if (!booking?.workerId) {
        Alert.alert(
          "Worker unavailable",
          "Worker profile is not available.",
        );

        return;
      }

      router.push({
        pathname:
          "/(customer)/details/worker-profile/[id]",
        params: {
          id: booking.workerId,
        },
      } as never);
    }, [booking]);

  /* ==========================================================
     MAP
  ========================================================== */

  const handleMap =
    useCallback(() => {
      if (!booking) {
        return;
      }

      const latitude =
        booking.latitude;

      const longitude =
        booking.longitude;

      if (
        typeof latitude !==
          "number" ||
        !Number.isFinite(
          latitude,
        ) ||
        typeof longitude !==
          "number" ||
        !Number.isFinite(
          longitude,
        )
      ) {
        Alert.alert(
          "Location unavailable",
          "This order does not have valid map coordinates.",
        );

        return;
      }

      router.push({
        pathname:
          "/(customer)/map",
        params: {
          latitude:
            String(latitude),
          longitude:
            String(longitude),
          address:
            booking.address,
        },
      } as never);
    }, [booking]);

  /* ==========================================================
     LIVE MAP
  ========================================================== */

  const handleLiveMap =
    useCallback(() => {
      if (!booking) {
        return;
      }

      if (
        booking.status !==
        "in-progress"
      ) {
        Alert.alert(
          "Live tracking unavailable",
          "Live tracking becomes available when the service is in progress.",
        );

        return;
      }

      if (
        !workerLiveLocation
      ) {
        Alert.alert(
          "Worker location unavailable",
          "The worker has not shared a live location yet.",
        );

        return;
      }

      router.push({
        pathname:
          "/(customer)/map",
        params: {
          latitude:
            String(
              workerLiveLocation.latitude,
            ),

          longitude:
            String(
              workerLiveLocation.longitude,
            ),

          address:
            booking.address,

          liveTracking:
            "true",

          workerId:
            booking.workerId,

          workerName:
            booking.workerName,

          orderId:
            booking.id,
        },
      } as never);
    }, [
      booking,
      workerLiveLocation,
    ]);

  /* ==========================================================
     ACCEPT OFFER
  ========================================================== */

  const handleAcceptOffer =
    useCallback(() => {
      if (!booking) {
        return;
      }

      if (
        orderExpired ||
        booking.status !==
          "pending"
      ) {
        Alert.alert(
          "Offer unavailable",
          orderExpired
            ? "This offer has expired."
            : "This order is no longer available.",
        );

        return;
      }

      /*
       * A worker counter offer is represented by:
       *
       * counterOfferStatus = sent
       * counterOfferBy = worker
       *
       * Do not rely only on offerStatus === countered.
       */
      const isWorkerCounter =
        booking.counterOfferStatus ===
          "sent" &&
        booking.counterOfferBy ===
          "worker";

      /*
       * The amount accepted by the customer
       * becomes the final agreed price.
       */
      const amount =
        isWorkerCounter
          ? booking.counterOfferAmount
          : booking.offerAmount;

      if (
        typeof amount !==
          "number" ||
        !Number.isFinite(
          amount,
        ) ||
        amount <= 0
      ) {
        Alert.alert(
          "Invalid offer",
          "The offer amount is not valid.",
        );

        return;
      }

      Alert.alert(
        "Accept offer?",
        `Accept ${formatAmount(
          amount,
        )} from ${booking.workerName}?`,
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
                  const bookingRef =
                    doc(
                      db,
                      "bookings",
                      booking.id,
                    );

                  await updateDoc(
                    bookingRef,
                    {
                      /*
                       * Keep amount synchronized
                       * for existing payment/order logic.
                       */
                      amount,

                      /*
                       * IMPORTANT:
                       * This is the final agreed
                       * service amount.
                       */
                      agreedPrice:
                        amount,

                      offerStatus:
                        "accepted" as OfferStatus,

                      status:
                        "accepted" as BookingStatus,

                      offerRespondedAt:
                        serverTimestamp(),

                      ...(isWorkerCounter
                        ? {
                            counterOfferStatus:
                              "accepted",

                            counterOfferRespondedAt:
                              serverTimestamp(),
                          }
                        : {}),

                      updatedAt:
                        serverTimestamp(),
                    },
                  );
                } catch (error) {
                  console.error(
                    "CUSTOMER_ACCEPT_OFFER_ERROR",
                    error,
                  );

                  Alert.alert(
                    "Unable to accept",
                    "We could not accept this offer. Please try again.",
                  );
                }
              },
          },
        ],
      );
    }, [
      booking,
      orderExpired,
    ]);

  /* ==========================================================
     DECLINE OFFER
  ========================================================== */

  const handleDeclineOffer =
    useCallback(() => {
      if (!booking) {
        return;
      }

      if (
        orderExpired ||
        booking.status !==
          "pending"
      ) {
        Alert.alert(
          "Offer unavailable",
          orderExpired
            ? "This offer has expired."
            : "This order is no longer available.",
        );

        return;
      }

      const hasWorkerCounter =
        booking.counterOfferStatus ===
          "sent" &&
        booking.counterOfferBy ===
          "worker";

      const hasWorkerOffer =
        booking.offerStatus ===
          "sent" &&
        typeof booking.offerAmount ===
          "number" &&
        Number.isFinite(
          booking.offerAmount,
        ) &&
        booking.offerAmount > 0;

      if (
        !hasWorkerCounter &&
        !hasWorkerOffer
      ) {
        Alert.alert(
          "Offer unavailable",
          "There is no active worker offer to decline.",
        );

        return;
      }

      Alert.alert(
        "Decline offer?",
        `Are you sure you want to decline ${booking.workerName}'s offer?`,
        [
          {
            text: "Keep offer",
            style: "cancel",
          },

          {
            text: "Decline",
            style: "destructive",

            onPress:
              async () => {
                try {
                  const bookingRef =
                    doc(
                      db,
                      "bookings",
                      booking.id,
                    );

                  await updateDoc(
                    bookingRef,
                    {
                      offerStatus:
                        "declined" as OfferStatus,

                      offerRespondedAt:
                        serverTimestamp(),

                      ...(hasWorkerCounter
                        ? {
                            counterOfferStatus:
                              "declined",

                            counterOfferRespondedAt:
                              serverTimestamp(),
                          }
                        : {}),

                      updatedAt:
                        serverTimestamp(),
                    },
                  );
                } catch (error) {
                  console.error(
                    "CUSTOMER_DECLINE_OFFER_ERROR",
                    error,
                  );

                  Alert.alert(
                    "Unable to decline",
                    "We could not decline this offer. Please try again.",
                  );
                }
              },
          },
        ],
      );
    }, [
      booking,
      orderExpired,
    ]);

  /* ==========================================================
     CALL WORKER
  ========================================================== */

  const callAvailable =
    Boolean(
      booking &&
        booking.status ===
          "accepted" &&
        booking.offerStatus ===
          "accepted",
    );

  const handleCall =
    useCallback(async () => {
      if (!booking) {
        return;
      }

      if (!callAvailable) {
        Alert.alert(
          "Call unavailable",
          "Calling will become available after the offer is accepted.",
        );

        return;
      }

      const phone =
        booking.workerPhone?.trim();

      if (!phone) {
        Alert.alert(
          "Phone unavailable",
          "The worker's phone number is not available.",
        );

        return;
      }

      try {
        setCallLoading(true);

        const url =
          `tel:${phone}`;

        const supported =
          await Linking.canOpenURL(
            url,
          );

        if (!supported) {
          Alert.alert(
            "Call unavailable",
            "Your device cannot start a phone call.",
          );

          return;
        }

        await Linking.openURL(
          url,
        );
      } catch (error) {
        console.error(
          "CUSTOMER_CALL_WORKER_ERROR",
          error,
        );

        Alert.alert(
          "Unable to call",
          "We could not start the call. Please try again.",
        );
      } finally {
        setCallLoading(false);
      }
    }, [
      booking,
      callAvailable,
    ]);

  /* ==========================================================
     CANCEL ORDER
  ========================================================== */

  const handleCancel =
    useCallback(() => {
      if (!booking) {
        return;
      }

      if (
        booking.status !==
        "pending"
      ) {
        Alert.alert(
          "Cannot cancel",
          "This order can no longer be cancelled.",
        );

        return;
      }

      Alert.alert(
        "Cancel order?",
        "Are you sure you want to cancel this order?",
        [
          {
            text: "Keep order",
            style: "cancel",
          },

          {
            text: "Cancel order",
            style: "destructive",

            onPress:
              async () => {
                try {
                  await updateDoc(
                    doc(
                      db,
                      "bookings",
                      booking.id,
                    ),
                    {
                      status:
                        "cancelled" as BookingStatus,

                      updatedAt:
                        serverTimestamp(),
                    },
                  );
                } catch (error) {
                  console.error(
                    "CUSTOMER_CANCEL_ORDER_ERROR",
                    error,
                  );

                  Alert.alert(
                    "Unable to cancel",
                    "We could not cancel this order. Please try again.",
                  );
                }
              },
          },
        ],
      );
    }, [booking]);

  /* ==========================================================
     CONFIRM SERVICE STARTED
  ========================================================== */

  const handleConfirmServiceStarted =
    useCallback(() => {
      if (!booking) {
        return;
      }

      if (
        booking.status !==
        "in-progress"
      ) {
        Alert.alert(
          "Confirmation unavailable",
          "The worker has not started this service yet.",
        );

        return;
      }

      if (
        booking.customerStartedConfirmedAt
      ) {
        return;
      }

      Alert.alert(
        "Confirm service started?",
        `Please confirm that ${booking.workerName} has started working on your service.`,
        [
          {
            text: "Not yet",
            style: "cancel",
          },

          {
            text: "Confirm",

            onPress:
              async () => {
                try {
                  await updateDoc(
                    doc(
                      db,
                      "bookings",
                      booking.id,
                    ),
                    {
                      customerStartedConfirmedAt:
                        serverTimestamp(),

                      updatedAt:
                        serverTimestamp(),
                    },
                  );
                } catch (error) {
                  console.error(
                    "CUSTOMER_CONFIRM_SERVICE_STARTED_ERROR",
                    error,
                  );

                  Alert.alert(
                    "Unable to confirm",
                    "We could not save your confirmation. Please try again.",
                  );
                }
              },
          },
        ],
      );
    }, [booking]);

  /* ==========================================================
     CONFIRM SERVICE COMPLETED
  ========================================================== */

  const handleConfirmServiceCompleted =
    useCallback(() => {
      if (!booking) {
        return;
      }

      if (
        booking.status !==
        "completed"
      ) {
        Alert.alert(
          "Confirmation unavailable",
          "The worker has not marked this service as completed yet.",
        );

        return;
      }

      if (
        booking.customerCompletedConfirmedAt
      ) {
        return;
      }

      Alert.alert(
        "Confirm service completed?",
        `Please confirm that ${booking.workerName} has finished the service.`,
        [
          {
            text: "Not yet",
            style: "cancel",
          },

          {
            text: "Confirm",

            onPress:
              async () => {
                try {
                  await updateDoc(
                    doc(
                      db,
                      "bookings",
                      booking.id,
                    ),
                    {
                      customerCompletedConfirmedAt:
                        serverTimestamp(),

                      updatedAt:
                        serverTimestamp(),
                    },
                  );
                } catch (error) {
                  console.error(
                    "CUSTOMER_CONFIRM_SERVICE_COMPLETED_ERROR",
                    error,
                  );

                  Alert.alert(
                    "Unable to confirm",
                    "We could not save your confirmation. Please try again.",
                  );
                }
              },
          },
        ],
      );
    }, [booking]);

  /* ==========================================================
     HELP
  ========================================================== */

  const handleServiceHelp =
    useCallback(() => {
      Alert.alert(
        "Need help?",
        "If there is a problem with the service, please contact Fixxam support before confirming.",
        [
          {
            text: "OK",
          },
        ],
      );
    }, []);

  /* ==========================================================
     AUTH ERROR
  ========================================================== */

  if (!auth.currentUser) {
    return (
      <AppScreen
        contentContainerStyle={
          styles.screen
        }
      >
        <View
          style={
            styles.errorContainer
          }
        >
          <AppText
            weight="bold"
            style={
              styles.errorTitle
            }
          >
            Sign in required
          </AppText>

          <AppText
            center
            style={
              styles.errorText
            }
          >
            Please sign in to view this
            order.
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <AppScreen
        contentContainerStyle={
          styles.screen
        }
      >
        <View
          style={
            styles.center
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

  /* ==========================================================
     ERROR
  ========================================================== */

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
            styles.errorContainer
          }
        >
          <AppText
            weight="bold"
            style={
              styles.errorTitle
            }
          >
            Order unavailable
          </AppText>

          <AppText
            center
            style={
              styles.errorText
            }
          >
            {error ||
              "We could not find this order."}
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen
      contentContainerStyle={
        styles.screen
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* HEADER */}

        <CustomerOrderHeader
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

        {/* REQUEST */}

        <CustomerOrderRequest
          workerName={
            booking.workerName
          }
          workerPhoto={
            booking.workerPhoto
          }
          workerCategory={
            booking.workerCategory
          }
          serviceName={
            booking.serviceName
          }
          serviceIcon={
            booking.serviceIcon
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
          hasCoordinates={
            typeof booking.latitude ===
              "number" &&
            typeof booking.longitude ===
              "number"
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
          onProfile={
            handleWorkerProfile
          }
          onMap={
            handleMap
          }
        />

        {/* AGREED PRICE */}

        {booking.status !==
          "pending" &&
          typeof booking.agreedPrice ===
            "number" &&
          Number.isFinite(
            booking.agreedPrice,
          ) &&
          booking.agreedPrice > 0 && (
            <AgreedPriceCard
              amount={
                booking.agreedPrice
              }
            />
          )}

        {/* OFFER */}

        <CustomerOrderOfferSection
          bookingId={
            booking.id
          }
          offerStatus={
            booking.offerStatus
          }
          offerAmount={
            booking.offerAmount
          }
          offerMessage={
            booking.offerMessage
          }
          counterOfferAmount={
            booking.counterOfferAmount
          }
          counterOfferMessage={
            booking.counterOfferMessage
          }
          counterOfferBy={
            booking.counterOfferBy
          }
          counterOfferStatus={
            booking.counterOfferStatus
          }
          offerRound={
            booking.offerRound
          }
          maxNegotiationRounds={
            MAX_NEGOTIATION_ROUNDS
          }
          workerName={
            booking.workerName
          }
          onAcceptOffer={
            handleAcceptOffer
          }
          onDeclineOffer={
            handleDeclineOffer
          }
        />

        {/* EXPIRY */}

        {offerExpiresAt !==
          null &&
        !orderExpired ? (
          <OrderExpiryTimer
            expiresAt={
              offerExpiresAt
            }
            onExpired={
              handleOrderExpired
            }
          />
        ) : null}

        {/* LIVE TRACKING */}

        {booking.status ===
          "in-progress" && (
          <CustomerLiveTrackingCard
            workerName={
              booking.workerName
            }
            location={
              workerLiveLocation
            }
            onOpenMap={
              handleLiveMap
            }
          />
        )}

        {/* SERVICE STARTED */}

        {booking.status ===
          "in-progress" && (
          <ServiceConfirmationCard
            type="started"
            workerName={
              booking.workerName
            }
            confirmed={Boolean(
              booking.customerStartedConfirmedAt,
            )}
            onConfirm={
              handleConfirmServiceStarted
            }
            onHelp={
              handleServiceHelp
            }
          />
        )}

        {/* SERVICE COMPLETED */}

        {booking.status ===
          "completed" && (
          <ServiceConfirmationCard
            type="completed"
            workerName={
              booking.workerName
            }
            confirmed={Boolean(
              booking.customerCompletedConfirmedAt,
            )}
            onConfirm={
              handleConfirmServiceCompleted
            }
            onHelp={
              handleServiceHelp
            }
          />
        )}

        {/* ACTIONS */}

        <CustomerOrderActions
          onCall={
            handleCall
          }
          onCancel={
            handleCancel
          }
          callDisabled={
            !callAvailable ||
            callLoading
          }
          cancelDisabled={
            booking.status !==
            "pending"
          }
        />

        <View
          style={
            styles.bottomSpace
          }
        />
      </ScrollView>
    </AppScreen>
  );
}

/* ============================================================
   AGREED PRICE CARD
============================================================ */

const AgreedPriceCard =
  memo(
    function AgreedPriceCard({
      amount,
    }: {
      amount: number;
    }) {
      return (
        <View
          style={
            styles.agreedPriceCard
          }
        >
          <View
            style={
              styles.agreedPriceIcon
            }
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={23}
              color="#16A34A"
            />
          </View>

          <View
            style={
              styles.agreedPriceContent
            }
          >
            <AppText
              weight="bold"
              style={
                styles.agreedPriceLabel
              }
            >
              AGREED SERVICE AMOUNT
            </AppText>

            <AppText
              weight="bold"
              style={
                styles.agreedPriceAmount
              }
            >
              {formatAmount(
                amount,
              )}
            </AppText>

            <AppText
              style={
                styles.agreedPriceText
              }
            >
              This is the final amount agreed
              between you and the worker.
            </AppText>
          </View>
        </View>
      );
    },
  );

/* ============================================================
   LIVE TRACKING CARD
============================================================ */

const CustomerLiveTrackingCard =
  memo(
    function CustomerLiveTrackingCard({
      workerName,
      location,
      onOpenMap,
    }: {
      workerName: string;
      location:
        | LiveLocation
        | null;
      onOpenMap: () => void;
    }) {
      const updatedAt =
        resolveTimestampMillis(
          location?.updatedAt,
        );

      const secondsAgo =
        updatedAt !== null
          ? Math.max(
              0,
              Math.floor(
                (Date.now() -
                  updatedAt) /
                  1000,
              ),
            )
          : null;

      const isRecent =
        secondsAgo !== null &&
        secondsAgo <= 30;

      return (
        <View
          style={
            styles.liveCard
          }
        >
          <View
            style={
              styles.liveTopRow
            }
          >
            <View
              style={
                styles.liveIcon
              }
            >
              <Ionicons
                name="navigate"
                size={22}
                color="#16A34A"
              />
            </View>

            <View
              style={
                styles.liveContent
              }
            >
              <View
                style={
                  styles.liveTitleRow
                }
              >
                <AppText
                  weight="bold"
                  style={
                    styles.liveTitle
                  }
                >
                  LIVE LOCATION
                </AppText>

                <View
                  style={
                    styles.liveBadge
                  }
                >
                  <View
                    style={
                      styles.liveDot
                    }
                  />

                  <AppText
                    weight="bold"
                    style={
                      styles.liveBadgeText
                    }
                  >
                    {location &&
                    isRecent
                      ? "LIVE"
                      : "WAITING"}
                  </AppText>
                </View>
              </View>

              <AppText
                style={
                  styles.liveDescription
                }
              >
                {location
                  ? `${workerName} is sharing their current location with you.`
                  : `${workerName} has not shared a live location yet.`}
              </AppText>
            </View>
          </View>

          {location ? (
            <>
              <View
                style={
                  styles.locationInfo
                }
              >
                <View
                  style={
                    styles.coordinateItem
                  }
                >
                  <AppText
                    style={
                      styles.coordinateLabel
                    }
                  >
                    LATITUDE
                  </AppText>

                  <AppText
                    weight="bold"
                    style={
                      styles.coordinateValue
                    }
                  >
                    {location.latitude.toFixed(
                      6,
                    )}
                  </AppText>
                </View>

                <View
                  style={
                    styles.coordinateItem
                  }
                >
                  <AppText
                    style={
                      styles.coordinateLabel
                    }
                  >
                    LONGITUDE
                  </AppText>

                  <AppText
                    weight="bold"
                    style={
                      styles.coordinateValue
                    }
                  >
                    {location.longitude.toFixed(
                      6,
                    )}
                  </AppText>
                </View>

                {location.accuracy !==
                  null &&
                  location.accuracy !==
                    undefined && (
                    <View
                      style={
                        styles.coordinateItem
                      }
                    >
                      <AppText
                        style={
                          styles.coordinateLabel
                        }
                      >
                        ACCURACY
                      </AppText>

                      <AppText
                        weight="bold"
                        style={
                          styles.coordinateValue
                        }
                      >
                        ±
                        {Math.round(
                          location.accuracy,
                        )}
                        m
                      </AppText>
                    </View>
                  )}
              </View>

              <Pressable
                onPress={
                  onOpenMap
                }
                accessibilityRole="button"
                accessibilityLabel="View worker live location"
                style={({ pressed }) => [
                  styles.liveMapButton,
                  pressed &&
                    styles.buttonPressed,
                ]}
              >
                <Ionicons
                  name="map-outline"
                  size={18}
                  color="#FFFFFF"
                />

                <AppText
                  weight="bold"
                  style={
                    styles.liveMapButtonText
                  }
                >
                  VIEW LIVE LOCATION
                </AppText>

                <Ionicons
                  name="chevron-forward"
                  size={17}
                  color="#FFFFFF"
                />
              </Pressable>

              {secondsAgo !==
                null && (
                <View
                  style={
                    styles.updatedRow
                  }
                >
                  <Ionicons
                    name="time-outline"
                    size={13}
                    color="#94A3B8"
                  />

                  <AppText
                    style={
                      styles.updatedText
                    }
                  >
                    Updated{" "}
                    {secondsAgo ===
                    0
                      ? "just now"
                      : `${secondsAgo}s ago`}
                  </AppText>
                </View>
              )}
            </>
          ) : (
            <View
              style={
                styles.waitingLocation
              }
            >
              <ActivityIndicator
                size="small"
                color="#16A34A"
              />

              <AppText
                style={
                  styles.waitingText
                }
              >
                Waiting for worker location...
              </AppText>
            </View>
          )}
        </View>
      );
    },
  );

/* ============================================================
   SERVICE CONFIRMATION CARD
============================================================ */

const ServiceConfirmationCard =
  memo(
    function ServiceConfirmationCard({
      type,
      workerName,
      confirmed,
      onConfirm,
      onHelp,
    }: {
      type:
        | "started"
        | "completed";

      workerName: string;

      confirmed: boolean;

      onConfirm: () => void;

      onHelp: () => void;
    }) {
      const isStarted =
        type === "started";

      return (
        <View
          style={
            styles.confirmationCard
          }
        >
          <View
            style={
              styles.confirmationIcon
            }
          >
            <Ionicons
              name={
                isStarted
                  ? "play-circle"
                  : "checkmark-circle"
              }
              size={28}
              color="#16A34A"
            />
          </View>

          <View
            style={
              styles.confirmationContent
            }
          >
            <AppText
              weight="bold"
              style={
                styles.confirmationTitle
              }
            >
              {isStarted
                ? "SERVICE STARTED"
                : "SERVICE COMPLETED"}
            </AppText>

            <AppText
              style={
                styles.confirmationText
              }
            >
              {confirmed
                ? isStarted
                  ? "You confirmed that the worker has started the service."
                  : "You confirmed that the worker has completed the service."
                : isStarted
                  ? `${workerName} has started working. Please confirm that the service has started.`
                  : `${workerName} has marked the service as completed. Please confirm that the work is finished.`}
            </AppText>

            {!confirmed ? (
              <View
                style={
                  styles.confirmationActions
                }
              >
                <Pressable
                  onPress={
                    onConfirm
                  }
                  accessibilityRole="button"
                  accessibilityLabel={
                    isStarted
                      ? "Confirm service started"
                      : "Confirm service completed"
                  }
                  style={({ pressed }) => [
                    styles.confirmButton,
                    pressed &&
                      styles.buttonPressed,
                  ]}
                >
                  <Ionicons
                    name="checkmark"
                    size={17}
                    color="#FFFFFF"
                  />

                  <AppText
                    weight="bold"
                    style={
                      styles.confirmButtonText
                    }
                  >
                    {isStarted
                      ? "CONFIRM START"
                      : "CONFIRM COMPLETION"}
                  </AppText>
                </Pressable>

                <Pressable
                  onPress={
                    onHelp
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Get help"
                  style={({ pressed }) => [
                    styles.helpButton,
                    pressed &&
                      styles.buttonPressed,
                  ]}
                >
                  <Ionicons
                    name="help-circle-outline"
                    size={17}
                    color="#2563EB"
                  />

                  <AppText
                    weight="bold"
                    style={
                      styles.helpButtonText
                    }
                  >
                    HELP
                  </AppText>
                </Pressable>
              </View>
            ) : (
              <View
                style={
                  styles.confirmedRow
                }
              >
                <Ionicons
                  name="checkmark-circle"
                  size={17}
                  color="#16A34A"
                />

                <AppText
                  weight="bold"
                  style={
                    styles.confirmedText
                  }
                >
                  CONFIRMED
                </AppText>
              </View>
            )}

            {confirmed && (
              <Pressable
                onPress={
                  onHelp
                }
                accessibilityRole="button"
                accessibilityLabel="Get help"
                style={({ pressed }) => [
                  styles.confirmedHelpButton,
                  pressed &&
                    styles.buttonPressed,
                ]}
              >
                <Ionicons
                  name="help-circle-outline"
                  size={15}
                  color="#2563EB"
                />

                <AppText
                  weight="bold"
                  style={
                    styles.helpButtonText
                  }
                >
                  HELP
                </AppText>
              </Pressable>
            )}
          </View>
        </View>
      );
    },
  );

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor:
        "#F8FAFC",
    },

    scrollContent: {
      paddingBottom: 30,
    },

    bottomSpace: {
      height: 20,
    },

    /* ========================================================
       AGREED PRICE
    ======================================================== */

    agreedPriceCard: {
      marginTop: 18,
      marginHorizontal: 16,
      padding: 14,
      borderRadius: 18,
      backgroundColor:
        "#F0FDF4",
      borderWidth: 1,
      borderColor:
        "#BBF7D0",
      flexDirection: "row",
      alignItems:
        "flex-start",
    },

    agreedPriceIcon: {
      width: 46,
      height: 46,
      borderRadius: 15,
      backgroundColor:
        "#DCFCE7",
      alignItems: "center",
      justifyContent:
        "center",
    },

    agreedPriceContent: {
      flex: 1,
      marginLeft: 11,
    },

    agreedPriceLabel: {
      fontSize: 9,
      letterSpacing: 0.5,
      color: "#15803D",
    },

    agreedPriceAmount: {
      marginTop: 3,
      fontSize: 21,
      color: "#166534",
    },

    agreedPriceText: {
      marginTop: 3,
      fontSize: 9.5,
      lineHeight: 15,
      color: "#64748B",
    },

    /* ========================================================
       LIVE TRACKING
    ======================================================== */

    liveCard: {
      marginTop: 18,
      marginHorizontal: 16,
      padding: 14,
      borderRadius: 18,
      backgroundColor:
        "#F0FDF4",
      borderWidth: 1,
      borderColor:
        "#BBF7D0",
    },

    liveTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },

    liveIcon: {
      width: 46,
      height: 46,
      borderRadius: 15,
      backgroundColor:
        "#DCFCE7",
      alignItems: "center",
      justifyContent: "center",
    },

    liveContent: {
      flex: 1,
      marginLeft: 11,
    },

    liveTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    liveTitle: {
      fontSize: 11,
      color: "#15803D",
    },

    liveBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 7,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor:
        "#DCFCE7",
    },

    liveDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 4,
      backgroundColor:
        "#16A34A",
    },

    liveBadgeText: {
      fontSize: 7.5,
      color: "#15803D",
    },

    liveDescription: {
      marginTop: 5,
      fontSize: 10,
      lineHeight: 15,
      color: "#64748B",
    },

    locationInfo: {
      marginTop: 13,
      padding: 10,
      borderRadius: 12,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#DCFCE7",
      flexDirection: "row",
      gap: 8,
    },

    coordinateItem: {
      flex: 1,
    },

    coordinateLabel: {
      fontSize: 7,
      letterSpacing: 0.6,
      color: "#94A3B8",
    },

    coordinateValue: {
      marginTop: 3,
      fontSize: 9,
      color: "#0F172A",
    },

    liveMapButton: {
      marginTop: 10,
      minHeight: 43,
      paddingHorizontal: 12,
      borderRadius: 11,
      backgroundColor:
        "#16A34A",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },

    liveMapButtonText: {
      flex: 1,
      fontSize: 8.5,
      color: "#FFFFFF",
    },

    updatedRow: {
      marginTop: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },

    updatedText: {
      fontSize: 8,
      color: "#94A3B8",
    },

    waitingLocation: {
      marginTop: 12,
      minHeight: 42,
      borderRadius: 11,
      backgroundColor:
        "#FFFFFF",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
    },

    waitingText: {
      fontSize: 9,
      color: "#64748B",
    },

    /* ========================================================
       SERVICE CONFIRMATION
    ======================================================== */

    confirmationCard: {
      marginTop: 18,
      marginHorizontal: 16,
      padding: 14,
      borderRadius: 18,
      backgroundColor:
        "#F0FDF4",
      borderWidth: 1,
      borderColor:
        "#BBF7D0",
      flexDirection: "row",
      alignItems:
        "flex-start",
    },

    confirmationIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor:
        "#DCFCE7",
      alignItems: "center",
      justifyContent: "center",
    },

    confirmationContent: {
      flex: 1,
      marginLeft: 11,
    },

    confirmationTitle: {
      fontSize: 11,
      color: "#15803D",
    },

    confirmationText: {
      marginTop: 5,
      fontSize: 10.5,
      lineHeight: 16,
      color: "#64748B",
    },

    confirmationActions: {
      marginTop: 12,
      flexDirection: "row",
      gap: 8,
    },

    confirmButton: {
      flex: 1,
      minHeight: 42,
      paddingHorizontal: 10,
      borderRadius: 11,
      backgroundColor:
        "#16A34A",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
    },

    confirmButtonText: {
      fontSize: 8.5,
      color: "#FFFFFF",
    },

    helpButton: {
      minWidth: 82,
      minHeight: 42,
      paddingHorizontal: 12,
      borderRadius: 11,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#93C5FD",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },

    helpButtonText: {
      fontSize: 8.5,
      color: "#2563EB",
    },

    confirmedRow: {
      marginTop: 11,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    confirmedText: {
      fontSize: 8.5,
      color: "#15803D",
    },

    confirmedHelpButton: {
      alignSelf:
        "flex-start",
      marginTop: 9,
      minHeight: 34,
      paddingHorizontal: 11,
      borderRadius: 9,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#93C5FD",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },

    /* ========================================================
       LOADING
    ======================================================== */

    center: {
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

    /* ========================================================
       ERROR
    ======================================================== */

    errorContainer: {
      flex: 1,
      minHeight: 500,
      paddingHorizontal: 30,
      alignItems: "center",
      justifyContent: "center",
    },

    errorTitle: {
      fontSize: 18,
      color: "#0F172A",
    },

    errorText: {
      marginTop: 7,
      fontSize: 11.5,
      lineHeight: 18,
      color: "#64748B",
    },

    /* ========================================================
       PRESS
    ======================================================== */

    buttonPressed: {
      opacity: 0.82,
      transform: [
        {
          scale: 0.985,
        },
      ],
    },
  });