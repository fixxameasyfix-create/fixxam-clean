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

import {
  acceptBooking,
  cancelBooking,
  declineOffer,
} from "@/firebase/queries/bookings";

import type {
  CustomerBooking,
  LiveLocation,
} from "./customerOrder.types";

import {
  formatAmount,
  mapBooking,
  normalizeStatus,
  resolveTimestampMillis,
} from "./customerOrder.utils";

import type {
  CustomerCancellationReason,
} from "@/firebase/queries/bookings";

/* ============================================================
   TYPES
============================================================ */

type WorkerReviewPrompt = {
  bookingId: string;
  workerId: string;
  workerName: string;
};

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

  reviewPrompt:
    | WorkerReviewPrompt
    | null;

  dismissReviewPrompt:
    () => void;

  handleOrderExpired:
    () => Promise<void>;

  handleAcceptOffer:
    () => void;

  handleDeclineOffer:
    () => void;

  handleCall:
    () => Promise<void>;

  handleCancel: (
  reason: CustomerCancellationReason,
  note?: string,
) => Promise<boolean>;

  handleConfirmServiceStarted:
    () => void;

  handleConfirmServiceCompleted:
    () => void;
};

/* ============================================================
   HELPERS
============================================================ */

function isValidAmount(
  value: unknown,
): value is number {
  return (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    ) &&
    value > 0
  );
}

function hasActiveCounter(
  booking:
    | CustomerBooking
    | null,
): boolean {
  if (!booking) {
    return false;
  }

  return (
    booking.counterOfferStatus ===
      "sent" &&
    (
      booking.counterOfferBy ===
        "customer" ||
      booking.counterOfferBy ===
        "worker"
    ) &&
    isValidAmount(
      booking.counterOfferAmount,
    )
  );
}

function isOfferExpiredBooking(
  booking:
    | CustomerBooking
    | null,
): boolean {
  if (!booking) {
    return false;
  }

  /*
   * Backward compatibility for older
   * bookings that may still contain:
   *
   * status = expired
   */
  if (
    booking.status ===
    "expired"
  ) {
    return true;
  }

  /*
   * New authoritative backend state:
   *
   * status = cancelled
   * cancellationReason = offer_expired
   */
  return (
    booking.status ===
      "cancelled" &&
    booking.cancellationReason ===
      "offer_expired"
  );
}

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
          text2: message,
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
  ] =
    useState(true);

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

  const [
    reviewPrompt,
    setReviewPrompt,
  ] =
    useState<WorkerReviewPrompt | null>(
      null,
    );

  /*
   * Local UX-only expiry state.
   *
   * IMPORTANT:
   *
   * This does NOT change Firestore.
   *
   * Backend scheduled expiry remains the
   * authoritative source of cancellation.
   */
  const [
    localOfferExpired,
    setLocalOfferExpired,
  ] =
    useState(false);

  /*
   * Prevent repeated state-changing writes
   * from fast/repeated button taps.
   */
  const mutationInFlight =
    useRef(false);

  /* ==========================================================
     REVIEW PROMPT
  ========================================================== */

  const dismissReviewPrompt =
    useCallback(() => {
      setReviewPrompt(
        null,
      );
    }, []);

  /* ==========================================================
     RESET LOCAL EXPIRY
  ========================================================== */

  useEffect(() => {
    setLocalOfferExpired(
      false,
    );
  }, [
    orderId,
  ]);

  /* ==========================================================
     BOOKING LISTENER
  ========================================================== */

  useEffect(() => {
    const customerId =
      auth.currentUser
        ?.uid
        ?.trim();

    const resolvedOrderId =
      orderId.trim();

    if (!customerId) {
      setBooking(
        null,
      );

      setWorkerLiveLocation(
        null,
      );

      setReviewPrompt(
        null,
      );

      setLocalOfferExpired(
        false,
      );

      setLoading(
        false,
      );

      setError(
        "Please sign in to view this order.",
      );

      return;
    }

    if (!resolvedOrderId) {
      setBooking(
        null,
      );

      setWorkerLiveLocation(
        null,
      );

      setReviewPrompt(
        null,
      );

      setLocalOfferExpired(
        false,
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

            setWorkerLiveLocation(
              null,
            );

            setReviewPrompt(
              null,
            );

            setLocalOfferExpired(
              false,
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

          /*
           * Client-side UX validation.
           *
           * Firestore Rules remain the actual
           * authorization/security boundary.
           */
          if (
            data.customerId !==
            customerId
          ) {
            setBooking(
              null,
            );

            setWorkerLiveLocation(
              null,
            );

            setReviewPrompt(
              null,
            );

            setLocalOfferExpired(
              false,
            );

            setLoading(
              false,
            );

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
           * Once backend cancellation arrives,
           * local expiry state is no longer needed.
           */
          if (
            isOfferExpiredBooking(
              mapped,
            )
          ) {
            setLocalOfferExpired(
              true,
            );
          }

          /* ================================================
             WORKER LIVE LOCATION

             Tracking lifecycle:

             pending
               -> unavailable

             accepted
               -> available

             in-progress
               -> continues

             completed / cancelled / expired
               -> unavailable
          ================================================= */

          const trackingActive =
            mapped.status ===
              "accepted" ||
            mapped.status ===
              "in-progress";

          if (
            mapped.fulfillmentMode !==
              "worker_visits_customer" ||
            !trackingActive
          ) {
            setWorkerLiveLocation(
              null,
            );
          } else {
            const location =
              mapped.workerLiveLocation ??
              null;

            /*
             * Verify live location belongs
             * to the assigned worker.
             */
            if (
              location?.userId &&
              mapped.workerId &&
              location.userId !==
                mapped.workerId
            ) {
              if (__DEV__) {
                console.warn(
                  "CUSTOMER_LIVE_LOCATION_WORKER_MISMATCH",
                  {
                    bookingId:
                      mapped.id,

                    expectedWorkerId:
                      mapped.workerId,

                    liveLocationUserId:
                      location.userId,
                  },
                );
              }

              setWorkerLiveLocation(
                null,
              );
            } else {
              setWorkerLiveLocation(
                location,
              );
            }
          }

          setLoading(
            false,
          );

          setError(
            null,
          );
        },

        snapshotError => {
          if (__DEV__) {
            console.warn(
              "CUSTOMER_ORDER_LISTENER_ERROR",
              snapshotError,
            );
          }

          setBooking(
            null,
          );

          setWorkerLiveLocation(
            null,
          );

          setReviewPrompt(
            null,
          );

          setLocalOfferExpired(
            false,
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
    orderId,
  ]);

  /* ==========================================================
     NEGOTIATION STATE
  ========================================================== */

  const activeCounter =
    useMemo(
      () =>
        hasActiveCounter(
          booking,
        ),
      [
        booking,
      ],
    );

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

  /*
   * Backend expiry OR local UX expiry.
   *
   * Local expiry is not a Firestore state.
   */
  const orderExpired =
    isOfferExpiredBooking(
      booking,
    ) ||
    localOfferExpired ||
    (
      booking?.status ===
        "pending" &&
      !activeCounter &&
      offerExpiresAt !==
        null &&
      offerExpiresAt <=
        Date.now()
    );

  /* ==========================================================
     MARK INITIAL OFFER EXPIRED — CLIENT UX ONLY
  ========================================================== */

  const handleOrderExpired =
    useCallback(
      async () => {
        if (
          !booking ||
          booking.status !==
            "pending"
        ) {
          return;
        }

        /*
         * Counter negotiation has started.
         *
         * The original 24-hour timer no longer
         * controls the negotiation.
         */
        if (
          hasActiveCounter(
            booking,
          )
        ) {
          return;
        }

        /*
         * Check the current expiry timestamp.
         */
        const expiresAt =
          resolveTimestampMillis(
            booking.offerExpiresAt,
          );

        if (
          expiresAt ===
            null ||
          expiresAt >
            Date.now()
        ) {
          return;
        }

        /*
         * IMPORTANT:
         *
         * Do NOT update Firestore here.
         *
         * The backend scheduled function is
         * responsible for authoritative cancellation.
         *
         * Client only updates local UI so the
         * customer immediately sees the offer
         * as expired.
         */
        setLocalOfferExpired(
          true,
        );

        showInfoToast(
          "Offer expired",
          "The 24-hour response window has ended. This order is being cancelled.",
        );
      },
      [
        booking,
      ],
    );

  /* ==========================================================
     EXPIRY WATCHER
  ========================================================== */

  useEffect(() => {
    if (
      !booking ||
      booking.status !==
        "pending" ||
      activeCounter ||
      offerExpiresAt ===
        null
    ) {
      return;
    }

    /*
     * Counter negotiation has started.
     *
     * offerRound is an audit sequence only.
     */
    if (
      typeof booking.offerRound ===
        "number" &&
      Number.isFinite(
        booking.offerRound,
      ) &&
      booking.offerRound >=
        2
    ) {
      return;
    }

    /*
     * Already expired locally.
     */
    if (
      localOfferExpired
    ) {
      return;
    }

    const remaining =
      offerExpiresAt -
      Date.now();

    if (
      remaining <=
      0
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
    activeCounter,
    booking,
    offerExpiresAt,
    localOfferExpired,
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
        booking.status !==
        "pending"
      ) {
        showErrorToast(
          "Offer unavailable",
          "This order is no longer available.",
        );

        return;
      }

      /*
       * Never allow accepting an expired offer
       * from the customer UI.
       */
      if (
        orderExpired
      ) {
        showErrorToast(
          "Offer expired",
          "The 24-hour response window has ended. This offer can no longer be accepted.",
        );

        return;
      }

      /* ======================================================
         ACTIVE COUNTER
      ====================================================== */

      const currentCounterActive =
        booking.counterOfferStatus ===
        "sent";

      const workerCounterActive =
        currentCounterActive &&
        booking.counterOfferBy ===
          "worker" &&
        isValidAmount(
          booking.counterOfferAmount,
        );

      const customerCounterActive =
        currentCounterActive &&
        booking.counterOfferBy ===
          "customer";

      /*
       * Customer cannot accept their own
       * counter offer.
       */
      if (
        customerCounterActive
      ) {
        showInfoToast(
          "Waiting for worker",
          "Your counter offer is waiting for the worker.",
        );

        return;
      }

      /* ======================================================
         INITIAL WORKER OFFER
      ====================================================== */

      const initialWorkerOfferActive =
        !currentCounterActive &&
        booking.offerStatus ===
          "sent" &&
        isValidAmount(
          booking.offerAmount,
        );

      if (
        !workerCounterActive &&
        !initialWorkerOfferActive
      ) {
        showErrorToast(
          "Offer unavailable",
          "There is no active worker offer to accept.",
        );

        return;
      }

      /*
       * Extra timestamp protection.
       */
      if (
        initialWorkerOfferActive &&
        offerExpiresAt !==
          null &&
        offerExpiresAt <=
          Date.now()
      ) {
        void handleOrderExpired();

        showErrorToast(
          "Offer expired",
          "This worker offer has expired.",
        );

        return;
      }

      const amount =
        workerCounterActive
          ? booking.counterOfferAmount
          : booking.offerAmount;

      if (
        !isValidAmount(
          amount,
        )
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
            text:
              "Cancel",

            style:
              "cancel",
          },

          {
            text:
              "Accept",

            onPress: () => {
              void (async () => {
                if (
                  mutationInFlight.current
                ) {
                  return;
                }

                mutationInFlight.current =
                  true;

                try {
                  await acceptBooking(
                    booking.id,
                    "customer",
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
                  if (__DEV__) {
                    console.warn(
                      "CUSTOMER_ACCEPT_OFFER_ERROR",
                      acceptError,
                    );
                  }

                  const message =
                    acceptError instanceof
                    Error
                      ? acceptError.message
                      : "";

                  const firebaseCode =
                    (
                      acceptError as {
                        code?: string;
                      }
                    )?.code;

                  if (
                    firebaseCode ===
                      "permission-denied" ||
                    firebaseCode ===
                      "firestore/permission-denied"
                  ) {
                    showErrorToast(
                      "Permission denied",
                      "You are not allowed to accept this offer.",
                    );

                    return;
                  }

                  const normalizedMessage =
                    message.toLowerCase();

                  if (
                    normalizedMessage.includes(
                      "expired",
                    )
                  ) {
                    setLocalOfferExpired(
                      true,
                    );

                    showErrorToast(
                      "Offer expired",
                      "This offer has expired and can no longer be accepted.",
                    );

                    return;
                  }

                  if (
                    normalizedMessage.includes(
                      "own offer",
                    )
                  ) {
                    showInfoToast(
                      "Waiting for worker",
                      "You cannot accept your own counter offer.",
                    );

                    return;
                  }

                  if (
                    normalizedMessage.includes(
                      "not found",
                    )
                  ) {
                    showErrorToast(
                      "Order unavailable",
                      "This order no longer exists.",
                    );

                    return;
                  }

                  if (
                    normalizedMessage.includes(
                      "no longer",
                    )
                  ) {
                    showInfoToast(
                      "Offer changed",
                      "This offer is no longer active.",
                    );

                    return;
                  }

                  showErrorToast(
                    "Unable to accept",
                    message ||
                      "The offer may have changed. Please try again.",
                  );
                } finally {
                  mutationInFlight.current =
                    false;
                }
              })();
            },
          },
        ],
      );
    }, [
      booking,
      handleOrderExpired,
      offerExpiresAt,
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
        booking.status !==
        "pending"
      ) {
        showErrorToast(
          "Offer unavailable",
          "This order is no longer available.",
        );

        return;
      }

      /*
       * Do not allow customer to decline
       * after the initial offer has expired.
       */
      if (
        orderExpired
      ) {
        showErrorToast(
          "Offer expired",
          "The 24-hour response window has ended. This offer can no longer be declined manually.",
        );

        return;
      }

      /* ======================================================
         ACTIVE COUNTER
      ====================================================== */

      const currentCounterActive =
        booking.counterOfferStatus ===
        "sent";

      const workerCounterActive =
        currentCounterActive &&
        booking.counterOfferBy ===
          "worker" &&
        isValidAmount(
          booking.counterOfferAmount,
        );

      const customerCounterActive =
        currentCounterActive &&
        booking.counterOfferBy ===
          "customer";

      if (
        customerCounterActive
      ) {
        showInfoToast(
          "Waiting for worker",
          "Your counter offer is waiting for the worker.",
        );

        return;
      }

      /* ======================================================
         INITIAL WORKER OFFER
      ====================================================== */

      const initialWorkerOfferActive =
        !currentCounterActive &&
        booking.offerStatus ===
          "sent" &&
        isValidAmount(
          booking.offerAmount,
        );

      if (
        !workerCounterActive &&
        !initialWorkerOfferActive
      ) {
        showErrorToast(
          "Offer unavailable",
          "There is no active worker offer to decline.",
        );

        return;
      }

      if (
        initialWorkerOfferActive &&
        offerExpiresAt !==
          null &&
        offerExpiresAt <=
          Date.now()
      ) {
        void handleOrderExpired();

        showErrorToast(
          "Offer expired",
          "This worker offer has expired.",
        );

        return;
      }

      Alert.alert(
        "Decline offer?",

        "Declining this offer will end the negotiation and cancel this order.",

        [
          {
            text:
              "Keep negotiating",

            style:
              "cancel",
          },

          {
            text:
              "Decline",

            style:
              "destructive",

            onPress: () => {
              void (async () => {
                if (
                  mutationInFlight.current
                ) {
                  return;
                }

                mutationInFlight.current =
                  true;

                try {
                  await declineOffer(
                    booking.id,
                    "customer",
                  );

                  showSuccessToast(
                    "Offer declined",
                    "The negotiation has ended.",
                  );
                } catch (
                  declineError
                ) {
                  if (__DEV__) {
                    console.warn(
                      "CUSTOMER_DECLINE_OFFER_ERROR",
                      declineError,
                    );
                  }

                  const message =
                    declineError instanceof
                    Error
                      ? declineError.message
                      : "";

                  const firebaseCode =
                    (
                      declineError as {
                        code?: string;
                      }
                    )?.code;

                  if (
                    firebaseCode ===
                      "permission-denied" ||
                    firebaseCode ===
                      "firestore/permission-denied"
                  ) {
                    showErrorToast(
                      "Permission denied",
                      "You are not allowed to decline this offer.",
                    );

                    return;
                  }

                  const normalizedMessage =
                    message.toLowerCase();

                  if (
                    normalizedMessage.includes(
                      "expired",
                    )
                  ) {
                    setLocalOfferExpired(
                      true,
                    );

                    showErrorToast(
                      "Offer expired",
                      "This offer has expired and is being cancelled automatically.",
                    );

                    return;
                  }

                  if (
                    normalizedMessage.includes(
                      "own offer",
                    )
                  ) {
                    showInfoToast(
                      "Waiting for worker",
                      "You cannot decline your own counter offer.",
                    );

                    return;
                  }

                  if (
                    normalizedMessage.includes(
                      "not found",
                    )
                  ) {
                    showErrorToast(
                      "Order unavailable",
                      "This order no longer exists.",
                    );

                    return;
                  }

                  if (
                    normalizedMessage.includes(
                      "no longer",
                    )
                  ) {
                    showInfoToast(
                      "Offer changed",
                      "This offer is no longer active.",
                    );

                    return;
                  }

                  showErrorToast(
                    "Unable to decline",
                    message ||
                      "The offer may have changed. Please try again.",
                  );
                } finally {
                  mutationInFlight.current =
                    false;
                }
              })();
            },
          },
        ],
      );
    }, [
      booking,
      handleOrderExpired,
      offerExpiresAt,
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
    useCallback(
      async () => {
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
          booking.workerPhone
            ?.trim();

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

          if (
            !supported
          ) {
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
          if (__DEV__) {
            console.warn(
              "CUSTOMER_CALL_WORKER_ERROR",
              callError,
            );
          }

          showErrorToast(
            "Unable to call",
            "We could not start the call. Please try again.",
          );
        } finally {
          setCallLoading(
            false,
          );
        }
      },
      [
        booking,
        callAvailable,
        callLoading,
      ],
    );

  /* ==========================================================
     CANCEL ORDER
  ========================================================== */

  /* ==========================================================
CANCEL ORDER
========================================================== */

const handleCancel = useCallback(
  async (
    reason: CustomerCancellationReason,
    note = "",
  ): Promise<boolean> => {
    if (!booking || mutationInFlight.current) {
      return false;
    }

    if (booking.status !== "pending") {
      showErrorToast(
        "Cannot cancel",
        "This order can no longer be cancelled.",
      );
      return false;
    }

    if (orderExpired) {
      showInfoToast(
        "Offer expired",
        "This order is being cancelled automatically because the offer expired.",
      );
      return false;
    }

    if (
      booking.offerStatus === "sent" ||
      booking.counterOfferStatus === "sent"
    ) {
      showInfoToast(
        "Offer in progress",
        "Use Decline if you want to end the current negotiation.",
      );
      return false;
    }

    if (reason === "other" && !note.trim()) {
      showErrorToast(
        "Reason required",
        "Please explain why you want to cancel this order.",
      );
      return false;
    }

    mutationInFlight.current = true;

    try {
      await cancelBooking(
        booking.id,
        reason,
        note.trim(),
      );

      showSuccessToast("Order cancelled");

      return true;
    } catch (cancelError) {
      if (__DEV__) {
        console.warn(
          "CUSTOMER_CANCEL_ORDER_ERROR",
          cancelError,
        );
      }

      const message =
        cancelError instanceof Error
          ? cancelError.message
          : "";

      showErrorToast(
        "Unable to cancel",
        message ||
          "This order may have changed. Please try again.",
      );

      return false;
    } finally {
      mutationInFlight.current = false;
    }
  },
  [booking, orderExpired],
);

  


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

  const canConfirmStart =
  booking.status === "awaiting_start_confirmation" ||
  (
    booking.status === "accepted" &&
    booking.startConfirmationRequestedAt != null
  );

if (!canConfirmStart) {
  showInfoToast(
    "Confirmation unavailable",
    "The worker has not requested service-start confirmation yet.",
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
          onPress: () => {
            void (async () => {
              if (
                mutationInFlight.current
              ) {
                return;
              }

              mutationInFlight.current = true;

              try {
                const customerId =
                  auth.currentUser?.uid?.trim();

                if (!customerId) {
                  throw new Error(
                    "AUTH_REQUIRED",
                  );
                }

                await runTransaction(
                  db,
                  async transaction => {
                    const bookingRef = doc(
                      db,
                      "bookings",
                      booking.id,
                    );

                    const snapshot =
                      await transaction.get(
                        bookingRef,
                      );

                    if (!snapshot.exists()) {
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
  normalizeStatus(data.status) !== "accepted" ||
  !data.startConfirmationRequestedAt
) {
  throw new Error(
    "SERVICE_START_CONFIRMATION_UNAVAILABLE",
  );
}


                    if (
                      data.customerStartedConfirmedAt
                    ) {
                      return;
                    }

                    transaction.update(bookingRef, {
  status: "in-progress",
  customerStartedConfirmedAt: serverTimestamp(),
  startedAt: serverTimestamp(),
  serviceStartedAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});
                  },
                );

                showSuccessToast(
                  "Service start confirmed",
                );
              } catch (confirmError) {
                if (__DEV__) {
                  console.warn(
                    "CUSTOMER_CONFIRM_SERVICE_STARTED_ERROR",
                    confirmError,
                  );
                }

                const errorCode =
  typeof confirmError === "object" &&
  confirmError !== null &&
  "code" in confirmError
    ? String(confirmError.code)
    : "unknown";

const errorMessage =
  confirmError instanceof Error
    ? confirmError.message
    : String(confirmError);

if (__DEV__) {
  console.error(
    "CUSTOMER_CONFIRM_SERVICE_STARTED_FAILURE",
    {
      code: errorCode,
      message: errorMessage,
      bookingId: booking.id,
      expectedStatus: "awaiting_start_confirmation",
    },
  );
}

showErrorToast(
  "Unable to confirm",
  __DEV__
    ? `${errorCode}: ${errorMessage}`
    : "We could not save your confirmation. Please try again.",
);
              } finally {
                mutationInFlight.current = false;
              }
            })();
          },
        },
      ],
    );
  }, [booking]);

 

/* ==========================================================
   CONFIRM SERVICE COMPLETED
   Customer confirms completion and finalizes the booking.
========================================================== */

const handleConfirmServiceCompleted = useCallback(() => {
  if (!booking || mutationInFlight.current) {
    return;
  }


  if (
  booking.status !== "awaiting_completion_confirmation" ||
  !booking.workerMarkedCompletedAt
) {
  showInfoToast(
    "Confirmation unavailable",
    "The worker must mark this service as finished before you can confirm it.",
  );
  return;
}

  if (booking.customerCompletedConfirmedAt) {
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
        text: "Confirm Completion",
        onPress: () => {
          void (async () => {
            if (mutationInFlight.current) {
              return;
            }

            mutationInFlight.current = true;

            try {
              const customerId = auth.currentUser?.uid?.trim();

              if (!customerId) {
                throw new Error("AUTH_REQUIRED");
              }

              const confirmed = await runTransaction(
                db,
                async transaction => {
                  const bookingRef = doc(
                    db,
                    "bookings",
                    booking.id,
                  );

                  const snapshot = await transaction.get(
                    bookingRef,
                  );

                  if (!snapshot.exists()) {
                    throw new Error("ORDER_NOT_FOUND");
                  }

                  const data = snapshot.data();

                  if (data.customerId !== customerId) {
                    throw new Error("ORDER_ACCESS_DENIED");
                  }

                  if (
                    normalizeStatus(data.status) !==
                    "awaiting_completion_confirmation"
                  ) {
                    throw new Error(
                      "SERVICE_COMPLETION_CONFIRMATION_UNAVAILABLE",
                    );
                  }

                  if (
                    !data.workerMarkedCompletedAt ||
                    typeof data.workerMarkedCompletedAt.toDate !==
                      "function"
                  ) {
                    throw new Error(
                      "WORKER_COMPLETION_NOT_MARKED",
                    );
                  }

                  if (data.customerCompletedConfirmedAt) {
                    return false;
                  }

                  const agreedPrice = data.agreedPrice;

                  if (
                    typeof agreedPrice !== "number" ||
                    !Number.isFinite(agreedPrice) ||
                    agreedPrice <= 0
                  ) {
                    throw new Error(
                      "INVALID_AGREED_SERVICE_AMOUNT",
                    );
                  }

                  transaction.update(bookingRef, {
                    status: "completed",
                    amount: agreedPrice,
                    serviceCompletedAt: serverTimestamp(),
                    completedAt: serverTimestamp(),
                    customerCompletedConfirmedAt:
                      serverTimestamp(),
                    updatedAt: serverTimestamp(),
                  });

                  return true;
                },
              );

              if (!confirmed) {
                showInfoToast(
                  "Already confirmed",
                  "This service completion has already been confirmed.",
                );
                return;
              }

              showSuccessToast(
                "Service completion confirmed",
                "The order has now been marked as completed.",
              );

              const workerId =
                typeof booking.workerId === "string"
                  ? booking.workerId.trim()
                  : "";

              const workerName =
                typeof booking.workerName === "string" &&
                booking.workerName.trim()
                  ? booking.workerName.trim()
                  : "this worker";

              if (workerId) {
                setReviewPrompt({
                  bookingId: booking.id,
                  workerId,
                  workerName,
                });
              }
            } catch (confirmError) {
              const errorCode =
                typeof confirmError === "object" &&
                confirmError !== null &&
                "code" in confirmError
                  ? String(confirmError.code)
                  : "unknown";

              const errorMessage =
                confirmError instanceof Error
                  ? confirmError.message
                  : String(confirmError);

              if (__DEV__) {
                console.error(
                  "CUSTOMER_CONFIRM_SERVICE_COMPLETED_FAILURE",
                  {
                    code: errorCode,
                    message: errorMessage,
                    bookingId: booking.id,
                    expectedStatus:
                      "awaiting_completion_confirmation",
                  },
                );
              }

              if (
                errorCode === "permission-denied" ||
                errorCode === "firestore/permission-denied"
              ) {
                showErrorToast(
                  "Permission denied",
                  "Firestore rejected this confirmation. Check the booking security rules.",
                );
              } else if (
                errorMessage === "ORDER_NOT_FOUND"
              ) {
                showErrorToast(
                  "Order unavailable",
                  "This order no longer exists.",
                );
              } else if (
                errorMessage === "ORDER_ACCESS_DENIED"
              ) {
                showErrorToast(
                  "Access denied",
                  "You cannot confirm this order.",
                );
              } else if (
                errorMessage ===
                "SERVICE_COMPLETION_CONFIRMATION_UNAVAILABLE"
              ) {
                showInfoToast(
                  "Order changed",
                  "The order is no longer awaiting completion confirmation. Refresh and try again.",
                );
              } else if (
                errorMessage === "WORKER_COMPLETION_NOT_MARKED"
              ) {
                showInfoToast(
                  "Completion unavailable",
                  "The worker must mark the service as finished first.",
                );
              } else if (
                errorMessage === "INVALID_AGREED_SERVICE_AMOUNT"
              ) {
                showErrorToast(
                  "Amount unavailable",
                  "The agreed service amount is invalid.",
                );
              } else {
                showErrorToast(
                  "Unable to confirm",
                  __DEV__
                    ? `${errorCode}: ${errorMessage}`
                    : "We could not save your confirmation. Please refresh the order and try again.",
                );
              }
            } finally {
              mutationInFlight.current = false;
            }
          })();
        },
      },
    ],
  );
}, [booking]);

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

    reviewPrompt,

    dismissReviewPrompt,

    handleOrderExpired,

    handleAcceptOffer,

    handleDeclineOffer,

    handleCall,

    handleCancel,

    handleConfirmServiceStarted,

    handleConfirmServiceCompleted,
  };
}