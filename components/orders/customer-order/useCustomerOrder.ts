import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Alert,
  Linking,
} from "react-native";

import {
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import Toast from "react-native-toast-message";

import {
  auth,
  db,
} from "@/firebase/config";

import type {
  CustomerBooking,
  LiveLocation,
} from "./customerOrder.types";

import {
  formatAmount,
  mapBooking,
  normalizeCounterOfferBy,
  normalizeCounterOfferStatus,
  normalizeOfferStatus,
  normalizeStatus,
  resolveTimestampMillis,
} from "./customerOrder.utils";

/* ============================================================
   TYPES
============================================================ */

type UseCustomerOrderResult = {
  booking:
    | CustomerBooking
    | null;

  loading: boolean;

  error:
    | string
    | null;

  workerLiveLocation:
    | LiveLocation
    | null;

  offerExpiresAt:
    | number
    | null;

  orderExpired: boolean;

  callLoading: boolean;

  callAvailable: boolean;

  handleOrderExpired:
    () => Promise<void>;

  handleAcceptOffer:
    () => void;

  handleDeclineOffer:
    () => void;

  handleCall:
    () => Promise<void>;

  handleCancel:
    () => void;

  handleConfirmServiceStarted:
    () => void;

  handleConfirmServiceCompleted:
    () => void;
};

/* ============================================================
   TOAST
============================================================ */

function showErrorToast(
  title: string,
  message: string,
) {
  Toast.show({
    type: "error",

    text1: title,

    text2: message,
  });
}

function showInfoToast(
  title: string,
  message: string,
) {
  Toast.show({
    type: "info",

    text1: title,

    text2: message,
  });
}

function showSuccessToast(
  title: string,
  message?: string,
) {
  Toast.show({
    type: "success",

    text1: title,

    ...(message
      ? {
          text2:
            message,
        }
      : {}),
  });
}

/* ============================================================
   HOOK
============================================================ */

export function useCustomerOrder(
  orderId: string,
): UseCustomerOrderResult {
  const [
    booking,
    setBooking,
  ] =
    useState<CustomerBooking | null>(
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
    callLoading,
    setCallLoading,
  ] =
    useState(false);

  const [
    workerLiveLocation,
    setWorkerLiveLocation,
  ] =
    useState<LiveLocation | null>(
      null,
    );

  /*
   * Protect state-changing actions from
   * repeated taps while a write is running.
   */
  const mutationInFlight =
    useRef(false);

  /* ==========================================================
     BOOKING LISTENER
  ========================================================== */

  useEffect(() => {
    const customerId =
      auth.currentUser?.uid;

    const resolvedOrderId =
      orderId.trim();

    if (!customerId) {
      setBooking(null);

      setWorkerLiveLocation(
        null,
      );

      setLoading(false);

      setError(
        "Please sign in to view this order.",
      );

      return;
    }

    if (!resolvedOrderId) {
      setBooking(null);

      setWorkerLiveLocation(
        null,
      );

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

            setWorkerLiveLocation(
              null,
            );

            setLoading(false);

            setError(
              "This order no longer exists.",
            );

            return;
          }

          const data =
            snapshot.data();

          /*
           * Client-side protection for UX.
           *
           * Firestore Security Rules must
           * independently enforce ownership.
           */
          if (
            data.customerId !==
            customerId
          ) {
            setBooking(null);

            setWorkerLiveLocation(
              null,
            );

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

          setBooking(
            mapped,
          );

          /*
           * workerLiveLocation already arrives
           * through the booking snapshot.
           *
           * A second Firestore listener is
           * unnecessary.
           */
          if (
            mapped.status !==
            "in-progress"
          ) {
            setWorkerLiveLocation(
              null,
            );
          } else {
            const location =
              mapped.workerLiveLocation ??
              null;

            if (
              location?.userId &&
              mapped.workerId &&
              location.userId !==
                mapped.workerId
            ) {
              console.warn(
                "CUSTOMER_LIVE_LOCATION_WORKER_MISMATCH",
              );

              setWorkerLiveLocation(
                null,
              );
            } else {
              setWorkerLiveLocation(
                location,
              );
            }
          }

          setLoading(false);

          setError(null);
        },

        (
          snapshotError,
        ) => {
          console.error(
            "CUSTOMER_ORDER_LISTENER_ERROR",
            snapshotError,
          );

          setBooking(null);

          setWorkerLiveLocation(
            null,
          );

          setLoading(false);

          setError(
            "Unable to load this order. Please try again.",
          );
        },
      );

    return unsubscribe;
  }, [
    orderId,
  ]);

  /* ==========================================================
     OFFER EXPIRY
  ========================================================== */

  const offerExpiresAt =
    useMemo(
      () =>
        resolveTimestampMillis(
          booking?.offerExpiresAt,
        ),
      [
        booking?.offerExpiresAt,
      ],
    );

  const orderExpired =
    booking?.status ===
      "expired" ||
    (offerExpiresAt !==
      null &&
      offerExpiresAt <=
        Date.now());

  /* ==========================================================
     MARK EXPIRED
  ========================================================== */

  const handleOrderExpired =
    useCallback(async () => {
      if (
        !booking ||
        booking.status !==
          "pending"
      ) {
        return;
      }

      const customerId =
        auth.currentUser?.uid;

      if (!customerId) {
        return;
      }

      try {
        await runTransaction(
          db,

          async (
            transaction,
          ) => {
            const bookingRef =
              doc(
                db,
                "bookings",
                booking.id,
              );

            const snapshot =
              await transaction.get(
                bookingRef,
              );

            if (
              !snapshot.exists()
            ) {
              return;
            }

            const data =
              snapshot.data();

            if (
              data.customerId !==
              customerId
            ) {
              return;
            }

            if (
              normalizeStatus(
                data.status,
              ) !== "pending"
            ) {
              return;
            }

            const expiresAt =
              resolveTimestampMillis(
                data.offerExpiresAt,
              );

            if (
              expiresAt ===
                null ||
              expiresAt >
                Date.now()
            ) {
              return;
            }

            transaction.update(
              bookingRef,
              {
                status:
                  "expired",

                updatedAt:
                  serverTimestamp(),
              },
            );
          },
        );
      } catch (
        expiryError
      ) {
        console.error(
          "CUSTOMER_ORDER_EXPIRY_ERROR",
          expiryError,
        );
      }
    }, [
      booking,
    ]);

  /* ==========================================================
     EXPIRY WATCHER
  ========================================================== */

  useEffect(() => {
    if (
      !booking ||
      booking.status !==
        "pending" ||
      offerExpiresAt ===
        null
    ) {
      return;
    }

    const remaining =
      offerExpiresAt -
      Date.now();

    if (
      remaining <= 0
    ) {
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
      clearTimeout(
        timer,
      );
    };
  }, [
    booking,
    offerExpiresAt,
    handleOrderExpired,
  ]);

  /* ==========================================================
     ACCEPT OFFER
  ========================================================== */

  const handleAcceptOffer =
    useCallback(() => {
      if (
        !booking ||
        mutationInFlight.current
      ) {
        return;
      }

      if (
        orderExpired ||
        booking.status !==
          "pending"
      ) {
        showErrorToast(
          "Offer unavailable",

          orderExpired
            ? "This offer has expired."
            : "This order is no longer available.",
        );

        return;
      }

      const isWorkerCounter =
        booking.counterOfferStatus ===
          "sent" &&
        booking.counterOfferBy ===
          "worker";

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
        showErrorToast(
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
                if (
                  mutationInFlight.current
                ) {
                  return;
                }

                mutationInFlight.current =
                  true;

                try {
                  const customerId =
                    auth.currentUser?.uid;

                  if (!customerId) {
                    throw new Error(
                      "AUTH_REQUIRED",
                    );
                  }

                  await runTransaction(
                    db,

                    async (
                      transaction,
                    ) => {
                      const bookingRef =
                        doc(
                          db,
                          "bookings",
                          booking.id,
                        );

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

                      if (
                        data.customerId !==
                        customerId
                      ) {
                        throw new Error(
                          "ORDER_ACCESS_DENIED",
                        );
                      }

                      if (
                        normalizeStatus(
                          data.status,
                        ) !==
                        "pending"
                      ) {
                        throw new Error(
                          "ORDER_NOT_PENDING",
                        );
                      }

                      const expiresAt =
                        resolveTimestampMillis(
                          data.offerExpiresAt,
                        );

                      if (
                        expiresAt !==
                          null &&
                        expiresAt <=
                          Date.now()
                      ) {
                        throw new Error(
                          "OFFER_EXPIRED",
                        );
                      }

                      const currentWorkerCounter =
                        normalizeCounterOfferStatus(
                          data.counterOfferStatus,
                        ) ===
                          "sent" &&
                        normalizeCounterOfferBy(
                          data.counterOfferBy,
                        ) ===
                          "worker";

                      const currentOfferAmount =
                        currentWorkerCounter
                          ? data.counterOfferAmount
                          : data.offerAmount;

                      if (
                        typeof currentOfferAmount !==
                          "number" ||
                        !Number.isFinite(
                          currentOfferAmount,
                        ) ||
                        currentOfferAmount <=
                          0
                      ) {
                        throw new Error(
                          "INVALID_OFFER",
                        );
                      }

                      /*
                       * Ensure the user is accepting
                       * the same offer displayed in UI.
                       */
                      if (
                        currentOfferAmount !==
                          amount ||
                        currentWorkerCounter !==
                          isWorkerCounter
                      ) {
                        throw new Error(
                          "OFFER_CHANGED",
                        );
                      }

                      transaction.update(
                        bookingRef,
                        {
                          /*
                           * Preserve compatibility with
                           * existing payment/order logic.
                           */
                          amount,

                          /*
                           * Final mutually agreed price.
                           */
                          agreedPrice:
                            amount,

                          offerStatus:
                            "accepted",

                          status:
                            "accepted",

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
                    },
                  );

                  showSuccessToast(
                    "Offer accepted",

                    `${formatAmount(
                      amount,
                    )} is now the agreed service amount.`,
                  );
                } catch (
                  acceptError
                ) {
                  console.error(
                    "CUSTOMER_ACCEPT_OFFER_ERROR",
                    acceptError,
                  );

                  showErrorToast(
                    "Unable to accept",

                    "The offer may have changed or expired. Please try again.",
                  );
                } finally {
                  mutationInFlight.current =
                    false;
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
      if (
        !booking ||
        mutationInFlight.current
      ) {
        return;
      }

      if (
        orderExpired ||
        booking.status !==
          "pending"
      ) {
        showErrorToast(
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
        booking.offerAmount >
          0;

      if (
        !hasWorkerCounter &&
        !hasWorkerOffer
      ) {
        showErrorToast(
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

            style:
              "destructive",

            onPress:
              async () => {
                if (
                  mutationInFlight.current
                ) {
                  return;
                }

                mutationInFlight.current =
                  true;

                try {
                  const customerId =
                    auth.currentUser?.uid;

                  if (!customerId) {
                    throw new Error(
                      "AUTH_REQUIRED",
                    );
                  }

                  await runTransaction(
                    db,

                    async (
                      transaction,
                    ) => {
                      const bookingRef =
                        doc(
                          db,
                          "bookings",
                          booking.id,
                        );

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

                      if (
                        data.customerId !==
                        customerId
                      ) {
                        throw new Error(
                          "ORDER_ACCESS_DENIED",
                        );
                      }

                      if (
                        normalizeStatus(
                          data.status,
                        ) !==
                        "pending"
                      ) {
                        throw new Error(
                          "ORDER_NOT_PENDING",
                        );
                      }

                      const currentWorkerCounter =
                        normalizeCounterOfferStatus(
                          data.counterOfferStatus,
                        ) ===
                          "sent" &&
                        normalizeCounterOfferBy(
                          data.counterOfferBy,
                        ) ===
                          "worker";

                      const currentWorkerOffer =
                        normalizeOfferStatus(
                          data.offerStatus,
                        ) ===
                          "sent" &&
                        typeof data.offerAmount ===
                          "number" &&
                        Number.isFinite(
                          data.offerAmount,
                        ) &&
                        data.offerAmount >
                          0;

                      if (
                        !currentWorkerCounter &&
                        !currentWorkerOffer
                      ) {
                        throw new Error(
                          "NO_ACTIVE_OFFER",
                        );
                      }

                      transaction.update(
                        bookingRef,
                        {
                          offerStatus:
                            "declined",

                          offerRespondedAt:
                            serverTimestamp(),

                          ...(currentWorkerCounter
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
                    },
                  );

                  showSuccessToast(
                    "Offer declined",
                  );
                } catch (
                  declineError
                ) {
                  console.error(
                    "CUSTOMER_DECLINE_OFFER_ERROR",
                    declineError,
                  );

                  showErrorToast(
                    "Unable to decline",

                    "The offer may have changed. Please try again.",
                  );
                } finally {
                  mutationInFlight.current =
                    false;
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
     CALL AVAILABILITY
  ========================================================== */

  const callAvailable =
    Boolean(
      booking &&
        booking.status ===
          "accepted" &&
        booking.offerStatus ===
          "accepted",
    );

  /* ==========================================================
     CALL WORKER
  ========================================================== */

  const handleCall =
    useCallback(async () => {
      if (
        !booking ||
        callLoading
      ) {
        return;
      }

      if (
        !callAvailable
      ) {
        showInfoToast(
          "Call unavailable",

          "Calling will become available after the offer is accepted.",
        );

        return;
      }

      const phone =
        booking.workerPhone?.trim();

      if (!phone) {
        showErrorToast(
          "Phone unavailable",

          "The worker's phone number is not available.",
        );

        return;
      }

      const safePhone =
        phone.replace(
          /[^+\d]/g,
          "",
        );

      if (!safePhone) {
        showErrorToast(
          "Phone unavailable",

          "The worker's phone number is not valid.",
        );

        return;
      }

      try {
        setCallLoading(
          true,
        );

        const url =
          `tel:${safePhone}`;

        const supported =
          await Linking.canOpenURL(
            url,
          );

        if (!supported) {
          showErrorToast(
            "Call unavailable",

            "Your device cannot start a phone call.",
          );

          return;
        }

        await Linking.openURL(
          url,
        );
      } catch (
        callError
      ) {
        console.error(
          "CUSTOMER_CALL_WORKER_ERROR",
          callError,
        );

        showErrorToast(
          "Unable to call",

          "We could not start the call. Please try again.",
        );
      } finally {
        setCallLoading(
          false,
        );
      }
    }, [
      booking,
      callAvailable,
      callLoading,
    ]);

  /* ==========================================================
     CANCEL ORDER
  ========================================================== */

  const handleCancel =
    useCallback(() => {
      if (
        !booking ||
        mutationInFlight.current
      ) {
        return;
      }

      if (
        booking.status !==
        "pending"
      ) {
        showErrorToast(
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
            text:
              "Keep order",

            style:
              "cancel",
          },

          {
            text:
              "Cancel order",

            style:
              "destructive",

            onPress:
              async () => {
                if (
                  mutationInFlight.current
                ) {
                  return;
                }

                mutationInFlight.current =
                  true;

                try {
                  const customerId =
                    auth.currentUser?.uid;

                  if (!customerId) {
                    throw new Error(
                      "AUTH_REQUIRED",
                    );
                  }

                  await runTransaction(
                    db,

                    async (
                      transaction,
                    ) => {
                      const bookingRef =
                        doc(
                          db,
                          "bookings",
                          booking.id,
                        );

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

                      if (
                        data.customerId !==
                        customerId
                      ) {
                        throw new Error(
                          "ORDER_ACCESS_DENIED",
                        );
                      }

                      if (
                        normalizeStatus(
                          data.status,
                        ) !==
                        "pending"
                      ) {
                        throw new Error(
                          "ORDER_NOT_PENDING",
                        );
                      }

                      transaction.update(
                        bookingRef,
                        {
                          status:
                            "cancelled",

                          updatedAt:
                            serverTimestamp(),
                        },
                      );
                    },
                  );

                  showSuccessToast(
                    "Order cancelled",
                  );
                } catch (
                  cancelError
                ) {
                  console.error(
                    "CUSTOMER_CANCEL_ORDER_ERROR",
                    cancelError,
                  );

                  showErrorToast(
                    "Unable to cancel",

                    "This order may have changed. Please try again.",
                  );
                } finally {
                  mutationInFlight.current =
                    false;
                }
              },
          },
        ],
      );
    }, [
      booking,
    ]);

  /* ==========================================================
     CONFIRM SERVICE STARTED
  ========================================================== */

  const handleConfirmServiceStarted =
    useCallback(() => {
      if (
        !booking ||
        mutationInFlight.current
      ) {
        return;
      }

      if (
        booking.status !==
        "in-progress"
      ) {
        showInfoToast(
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
            text:
              "Not yet",

            style:
              "cancel",
          },

          {
            text:
              "Confirm",

            onPress:
              async () => {
                if (
                  mutationInFlight.current
                ) {
                  return;
                }

                mutationInFlight.current =
                  true;

                try {
                  const customerId =
                    auth.currentUser?.uid;

                  if (!customerId) {
                    throw new Error(
                      "AUTH_REQUIRED",
                    );
                  }

                  await runTransaction(
                    db,

                    async (
                      transaction,
                    ) => {
                      const bookingRef =
                        doc(
                          db,
                          "bookings",
                          booking.id,
                        );

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

                      if (
                        data.customerId !==
                        customerId
                      ) {
                        throw new Error(
                          "ORDER_ACCESS_DENIED",
                        );
                      }

                      if (
                        normalizeStatus(
                          data.status,
                        ) !==
                        "in-progress"
                      ) {
                        throw new Error(
                          "SERVICE_NOT_IN_PROGRESS",
                        );
                      }

                      /*
                       * Idempotent:
                       * already confirmed means
                       * no additional write.
                       */
                      if (
                        data.customerStartedConfirmedAt
                      ) {
                        return;
                      }

                      transaction.update(
                        bookingRef,
                        {
                          customerStartedConfirmedAt:
                            serverTimestamp(),

                          updatedAt:
                            serverTimestamp(),
                        },
                      );
                    },
                  );

                  showSuccessToast(
                    "Service start confirmed",
                  );
                } catch (
                  confirmError
                ) {
                  console.error(
                    "CUSTOMER_CONFIRM_SERVICE_STARTED_ERROR",
                    confirmError,
                  );

                  showErrorToast(
                    "Unable to confirm",

                    "We could not save your confirmation. Please try again.",
                  );
                } finally {
                  mutationInFlight.current =
                    false;
                }
              },
          },
        ],
      );
    }, [
      booking,
    ]);

  /* ==========================================================
     CONFIRM SERVICE COMPLETED
  ========================================================== */

  const handleConfirmServiceCompleted =
    useCallback(() => {
      if (
        !booking ||
        mutationInFlight.current
      ) {
        return;
      }

      if (
        booking.status !==
        "completed"
      ) {
        showInfoToast(
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
            text:
              "Not yet",

            style:
              "cancel",
          },

          {
            text:
              "Confirm",

            onPress:
              async () => {
                if (
                  mutationInFlight.current
                ) {
                  return;
                }

                mutationInFlight.current =
                  true;

                try {
                  const customerId =
                    auth.currentUser?.uid;

                  if (!customerId) {
                    throw new Error(
                      "AUTH_REQUIRED",
                    );
                  }

                  await runTransaction(
                    db,

                    async (
                      transaction,
                    ) => {
                      const bookingRef =
                        doc(
                          db,
                          "bookings",
                          booking.id,
                        );

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

                      if (
                        data.customerId !==
                        customerId
                      ) {
                        throw new Error(
                          "ORDER_ACCESS_DENIED",
                        );
                      }

                      if (
                        normalizeStatus(
                          data.status,
                        ) !==
                        "completed"
                      ) {
                        throw new Error(
                          "SERVICE_NOT_COMPLETED",
                        );
                      }

                      if (
                        data.customerCompletedConfirmedAt
                      ) {
                        return;
                      }

                      transaction.update(
                        bookingRef,
                        {
                          customerCompletedConfirmedAt:
                            serverTimestamp(),

                          updatedAt:
                            serverTimestamp(),
                        },
                      );
                    },
                  );

                  showSuccessToast(
                    "Service completion confirmed",
                  );
                } catch (
                  confirmError
                ) {
                  console.error(
                    "CUSTOMER_CONFIRM_SERVICE_COMPLETED_ERROR",
                    confirmError,
                  );

                  showErrorToast(
                    "Unable to confirm",

                    "We could not save your confirmation. Please try again.",
                  );
                } finally {
                  mutationInFlight.current =
                    false;
                }
              },
          },
        ],
      );
    }, [
      booking,
    ]);

  /* ==========================================================
     RESULT
  ========================================================== */

  return {
    booking,

    loading,

    error,

    workerLiveLocation,

    offerExpiresAt,

    orderExpired,

    callLoading,

    callAvailable,

    handleOrderExpired,

    handleAcceptOffer,

    handleDeclineOffer,

    handleCall,

    handleCancel,

    handleConfirmServiceStarted,

    handleConfirmServiceCompleted,
  };
}