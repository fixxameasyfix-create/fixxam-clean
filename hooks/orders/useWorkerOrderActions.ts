import {
  useCallback,
  useRef,
  useState,
} from "react";

import {
  Alert,
  Linking,
} from "react-native";

import {
  router,
} from "expo-router";

import Toast from "react-native-toast-message";

import {
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

import {
  acceptBooking,
  declineOffer,
} from "@/firebase/queries/bookings";


import {
  createWorkerContactCallSession,
} from "@/services/calls/callSession";

import {
  prefetchLiveKitCallCredentials,
} from "@/services/calls/liveKitCall";

import {
  cleanString,
  normalizeWorkerBookingStatus,
  type WorkerBooking,
} from "@/utils/worker/workerOrderDetails";

import type {
  WorkerDeclineReason,
} from "@/components/orders/WorkerDeclineRequestModal";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  booking: WorkerBooking | null;
  workerId: string | null;
};

type FirebaseLikeError = {
  code?: unknown;
  message?: unknown;
};

type WorkerAction =
  | "decline-request"
  | "accept-offer"
  | "decline-offer"
  | "start-service"
  | "complete-service";

/* ==============================================================
   ERROR HELPERS
============================================================== */

function getErrorCode(error: unknown): string {
  if (
    typeof error !== "object" ||
    error === null ||
    !("code" in error)
  ) {
    return "";
  }

  const code =
    (error as FirebaseLikeError).code;

  return typeof code === "string"
    ? code
    : "";
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message.trim();
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    const message =
      (error as FirebaseLikeError).message;

    return typeof message === "string"
      ? message.trim()
      : "";
  }

  return "";
}

function isPermissionDenied(error: unknown): boolean {
  const code = getErrorCode(error);

  return (
    code === "permission-denied" ||
    code === "firestore/permission-denied"
  );
}

function isNetworkError(error: unknown): boolean {
  const code = getErrorCode(error);

  return (
    code === "unavailable" ||
    code === "firestore/unavailable" ||
    code === "network-request-failed"
  );
}

/* ==============================================================
   ERROR UI
============================================================== */

function showWorkerActionError(
  action: WorkerAction,
  error: unknown,
): void {
  if (isNetworkError(error)) {
    Toast.show({
      type: "error",
      text1: "Connection problem",
      text2:
        "Check your internet connection and try again.",
    });

    return;
  }

  if (isPermissionDenied(error)) {
    switch (action) {
      case "start-service":
        Toast.show({
          type: "error",
          text1: "Service could not start",
          text2:
            "This job changed or is no longer ready to start. Refresh and try again.",
        });
        return;

      case "complete-service":
        Toast.show({
          type: "error",
          text1: "Service could not be completed",
          text2:
            "This job changed or is no longer ready to complete. Refresh and try again.",
        });
        return;

      case "accept-offer":
        Toast.show({
          type: "error",
          text1: "Offer changed",
          text2:
            "This counter offer is no longer available. Refresh the order.",
        });
        return;

      case "decline-offer":
        Toast.show({
          type: "error",
          text1: "Offer changed",
          text2:
            "This counter offer is no longer available. Refresh the order.",
        });
        return;

      case "decline-request":
        Toast.show({
          type: "error",
          text1: "Request changed",
          text2:
            "This request can no longer be declined. Refresh the order.",
        });
        return;
    }
  }

  const normalizedMessage =
    getErrorMessage(error).toLowerCase();

  if (
    normalizedMessage.includes("no longer exists") ||
    normalizedMessage.includes("not found")
  ) {
    Toast.show({
      type: "error",
      text1: "Order unavailable",
      text2: "This order could not be found.",
    });
    return;
  }

  if (
    normalizedMessage.includes("no longer ready to start")
  ) {
    Toast.show({
      type: "info",
      text1: "Service unavailable",
      text2: "This job is no longer ready to start.",
    });
    return;
  }

  if (
    normalizedMessage.includes("no longer in progress")
  ) {
    Toast.show({
      type: "info",
      text1: "Service unavailable",
      text2: "This service is no longer in progress.",
    });
    return;
  }

  if (
    normalizedMessage.includes("no longer have access")
  ) {
    Toast.show({
      type: "error",
      text1: "Order unavailable",
      text2: "You no longer have access to this order.",
    });
    return;
  }

  if (
    normalizedMessage.includes("agreed service amount")
  ) {
    Toast.show({
      type: "error",
      text1: "Amount unavailable",
      text2: "The agreed service amount is unavailable.",
    });
    return;
  }

  if (
    normalizedMessage.includes("your own offer")
  ) {
    Toast.show({
      type: "info",
      text1: "Offer unavailable",
      text2:
        "You cannot respond to your own active offer.",
    });
    return;
  }

  if (
    normalizedMessage.includes("no longer available") ||
    normalizedMessage.includes("no longer waiting")
  ) {
    Toast.show({
      type: "info",
      text1: "Order changed",
      text2:
        "This action is no longer available. Refresh the order.",
    });
    return;
  }

  switch (action) {
    case "decline-request":
      Toast.show({
        type: "error",
        text1: "Unable to decline request",
        text2:
          "Please refresh the order and try again.",
      });
      return;

    case "accept-offer":
      Toast.show({
        type: "error",
        text1: "Unable to accept offer",
        text2:
          "Please refresh the order and try again.",
      });
      return;

    case "decline-offer":
      Toast.show({
        type: "error",
        text1: "Unable to decline offer",
        text2:
          "Please refresh the order and try again.",
      });
      return;

    case "start-service":
      Toast.show({
        type: "error",
        text1: "Unable to start service",
        text2:
          "Please refresh the order and try again.",
      });
      return;

    case "complete-service":
      Toast.show({
        type: "error",
        text1: "Unable to complete service",
        text2:
          "Please refresh the order and try again.",
      });
      return;
  }
}

/* ==============================================================
   DECLINE REASON VALIDATION
============================================================== */

const VALID_DECLINE_REASONS: readonly WorkerDeclineReason[] = [
  "no_longer_available",
  "outside_service_area",
  "too_busy",
  "scheduling_conflict",
  "other",
];

function isValidDeclineReason(
  value: unknown,
): value is WorkerDeclineReason {
  return (
    typeof value === "string" &&
    VALID_DECLINE_REASONS.includes(
      value as WorkerDeclineReason,
    )
  );
}

/* ==============================================================
   HOOK
============================================================== */

export function useWorkerOrderActions({
  booking,
  workerId,
}: Props) {
  /* ============================================================
     GLOBAL ACTION LOCK
  ============================================================ */

  const [
    offerActionLoading,
    setOfferActionLoading,
  ] = useState(false);

  const actionInFlightRef =
    useRef(false);

  /* ============================================================
     DECLINE MODAL STATE
  ============================================================ */

  const [
    cancellationModalVisible,
    setCancellationModalVisible,
  ] = useState(false);

  const [
    cancellationLoading,
    setCancellationLoading,
  ] = useState(false);

  const cancellationInFlightRef =
    useRef(false);

  /* ============================================================
     LOCKED ACTION
  ============================================================ */

const runLockedAction = useCallback(
  async (
    task: () => Promise<void>,
  ): Promise<boolean> => {
    if (actionInFlightRef.current) {
      return false;
    }

    actionInFlightRef.current = true;
    setOfferActionLoading(true);

    try {
      await task();
      return true;
    } finally {
      actionInFlightRef.current = false;
      setOfferActionLoading(false);
    }
  },
  [],
);

  /* ============================================================
     CLOSE DECLINE MODAL
  ============================================================ */

  const closeCancellationModal =
    useCallback(() => {
      if (
        cancellationInFlightRef.current ||
        actionInFlightRef.current
      ) {
        return;
      }

      setCancellationModalVisible(false);
    }, []);

  /* ============================================================
     BACK
  ============================================================ */

  const handleBack =
    useCallback(() => {
      if (
        actionInFlightRef.current ||
        cancellationInFlightRef.current
      ) {
        return;
      }

      router.back();
    }, []);

  /* ============================================================
     CUSTOMER PROFILE
  ============================================================ */

  const handleCustomerProfile =
    useCallback(() => {
      if (!booking?.customerId) {
        Toast.show({
          type: "info",
          text1: "Profile unavailable",
          text2:
            "Customer profile information is not available.",
        });
        return;
      }

      Toast.show({
        type: "info",
        text1: "Customer profile",
        text2:
          "Customer profile navigation is not connected yet.",
      });
    }, [booking?.customerId]);

  /* ============================================================
     MAP
  ============================================================ */

  const handleViewLocation =
    useCallback(() => {
      if (!booking) {
        return;
      }

      const orderId =
        cleanString(booking.id);

      if (!orderId) {
        Toast.show({
          type: "error",
          text1: "Order unavailable",
          text2:
            "This order could not be identified.",
        });
        return;
      }

      if (booking.fulfillmentMode === "remote") {
        Toast.show({
          type: "info",
          text1: "Remote service",
          text2:
            "This service does not require a physical location.",
        });
        return;
      }

      if (
        booking.fulfillmentMode !==
          "worker_visits_customer" &&
        booking.fulfillmentMode !==
          "customer_visits_worker"
      ) {
        Toast.show({
          type: "error",
          text1: "Location unavailable",
          text2:
            "The travel direction for this service is unavailable.",
        });
        return;
      }

      const latitude = booking.latitude;
      const longitude = booking.longitude;

      const hasCoordinates =
        typeof latitude === "number" &&
        typeof longitude === "number" &&
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180;

      if (!hasCoordinates) {
        Toast.show({
          type: "error",
          text1: "Location unavailable",
          text2:
            booking.fulfillmentMode ===
            "worker_visits_customer"
              ? "The customer's service location does not have valid map coordinates."
              : "Your service location does not have valid map coordinates.",
        });
        return;
      }

      router.push({
        pathname: "/(worker)/map",
        params: {
          mode: "view",
          fulfillmentMode: booking.fulfillmentMode,
          orderId,
          latitude: String(latitude),
          longitude: String(longitude),
          address: cleanString(booking.address),
          customerId: cleanString(booking.customerId),
          customerName:
            cleanString(booking.customerName) || "Customer",
        },
      } as never);
    }, [booking]);



    /* ============================================================
   FIXXAM VOICE CALL — WORKER TO CUSTOMER
============================================================ */

const handleCallCustomer = useCallback(async () => {
  if (actionInFlightRef.current) {
    return;
  }

  const currentWorkerId = cleanString(workerId);
  const customerId = cleanString(booking?.customerId);

  if (!currentWorkerId || !customerId) {
    Toast.show({
      type: "error",
      text1: "Call unavailable",
      text2: "Worker or customer information is missing.",
    });
    return;
  }

  if (currentWorkerId === customerId) {
    Toast.show({
      type: "error",
      text1: "Call unavailable",
      text2: "You cannot call your own account.",
    });
    return;
  }

  actionInFlightRef.current = true;
  setOfferActionLoading(true);

  try {
    const callId = await createWorkerContactCallSession({
      workerId: currentWorkerId,
      customerId,
      workerSnapshot: {
        name: "",
        image: "",
        service: cleanString(booking?.serviceName),
      },
    });

    if (!callId) {
      throw new Error("Unable to create Fixxam Voice call.");
    }

    prefetchLiveKitCallCredentials(callId);

    router.push({
      pathname: "/(worker)/call/[customer]",
      params: {
        callId,
        customerName:
          cleanString(booking?.customerName) || "Customer",
      },
    } as never);
  } catch (error) {
    if (__DEV__) {
      console.error("FIXXAM_WORKER_CALL_START_ERROR:", error);
    }

    Toast.show({
      type: "error",
      text1: "Unable to start Fixxam Voice",
      text2:
        error instanceof Error
          ? error.message
          : "Please try again.",
    });
  } finally {
    actionInFlightRef.current = false;
    setOfferActionLoading(false);
  }
}, [
  workerId,
  booking?.customerId,
  booking?.customerName,
  booking?.serviceName,
]);
 
  /* ============================================================
     SEND FIRST OFFER
  ============================================================ */

  const handleSendOffer =
    useCallback(() => {
      if (!booking) {
        return;
      }

      if (booking.status !== "pending") {
        Toast.show({
          type: "info",
          text1: "Request unavailable",
          text2:
            "This request is no longer waiting for an offer.",
        });
        return;
      }

      if (
        booking.counterOfferStatus === "sent" &&
        booking.counterOfferBy === "customer"
      ) {
        Toast.show({
          type: "info",
          text1: "Counter offer pending",
          text2:
            "Respond to the customer's counter offer first.",
        });
        return;
      }

      if (
        booking.counterOfferStatus === "sent" &&
        booking.counterOfferBy === "worker"
      ) {
        Toast.show({
          type: "info",
          text1: "Offer already sent",
          text2:
            "Your counter offer is waiting for the customer.",
        });
        return;
      }

      if (booking.offerStatus === "sent") {
        Toast.show({
          type: "info",
          text1: "Offer already sent",
          text2:
            "Your offer is waiting for the customer's response.",
        });
        return;
      }

      if (booking.offerStatus === "accepted") {
        Toast.show({
          type: "info",
          text1: "Offer already accepted",
          text2:
            "This order already has an accepted offer.",
        });
        return;
      }

      router.push({
        pathname: "/(worker)/orders/make-offer",
        params: {
          orderId: booking.id,
          serviceName: booking.serviceName,
          customerName: booking.customerName,
        },
      } as never);
    }, [booking]);

  /* ============================================================
     OPEN DECLINE REQUEST MODAL
  ============================================================ */

  const handleDecline =
    useCallback(() => {
      if (!booking || !workerId) {
        return;
      }

      const currentWorkerId =
        cleanString(workerId);

      if (
        !currentWorkerId ||
        cleanString(booking.workerId) !== currentWorkerId
      ) {
        Toast.show({
          type: "error",
          text1: "Access denied",
          text2:
            "You do not have permission to decline this request.",
        });
        return;
      }

      if (booking.status !== "pending") {
        Toast.show({
          type: "info",
          text1: "Request unavailable",
          text2:
            "This request can no longer be declined.",
        });
        return;
      }

      if (
        booking.offerStatus === "sent" ||
        booking.offerStatus === "accepted" ||
        booking.counterOfferStatus === "sent"
      ) {
        Toast.show({
          type: "info",
          text1: "Offer in progress",
          text2:
            "Use the offer actions to respond to this negotiation.",
        });
        return;
      }

      if (
        actionInFlightRef.current ||
        cancellationInFlightRef.current
      ) {
        return;
      }

      setCancellationModalVisible(true);
    }, [booking, workerId]);

  /* ============================================================
     CONFIRM DECLINE REQUEST
  ============================================================ */

  const handleConfirmDecline =
    useCallback(
      async (
        reason: WorkerDeclineReason,
        note: string,
      ): Promise<void> => {
        if (
          !booking ||
          !workerId ||
          !isValidDeclineReason(reason)
        ) {
          Toast.show({
            type: "error",
            text1: "Unable to decline request",
            text2:
              "The request or selected reason is invalid.",
          });
          return;
        }

        const currentWorkerId =
          cleanString(workerId);

        const bookingId =
          cleanString(booking.id);

        const normalizedNote =
          typeof note === "string"
            ? note.trim()
            : "";

        if (!currentWorkerId || !bookingId) {
          Toast.show({
            type: "error",
            text1: "Request unavailable",
            text2:
              "The worker or request could not be identified.",
          });
          return;
        }

        if (
          reason === "other" &&
          !normalizedNote
        ) {
          Toast.show({
            type: "info",
            text1: "Reason required",
            text2:
              "Please explain why you cannot accept this request.",
          });
          return;
        }

        if (normalizedNote.length > 500) {
          Toast.show({
            type: "error",
            text1: "Reason too long",
            text2:
              "Your explanation must not exceed 500 characters.",
          });
          return;
        }

        if (
          actionInFlightRef.current ||
          cancellationInFlightRef.current
        ) {
          return;
        }

        cancellationInFlightRef.current = true;
        setCancellationLoading(true);



          try {
          const didDecline = await runLockedAction(async () => {
            const bookingRef = doc(db, "bookings", bookingId);

            await runTransaction(db, async transaction => {
              const snapshot = await transaction.get(bookingRef);

              if (!snapshot.exists()) {
                throw new Error("This request no longer exists.");
              }

              const data = snapshot.data();

              if (cleanString(data.workerId) !== currentWorkerId) {
                throw new Error("You no longer have access to this request.");
              }

              if (normalizeWorkerBookingStatus(data.status) !== "pending") {
                throw new Error("This request can no longer be declined.");
              }

              if (
                data.offerStatus === "sent" ||
                data.offerStatus === "accepted" ||
                data.counterOfferStatus === "sent"
              ) {
                throw new Error("This request already has negotiation activity.");
              }

              transaction.update(bookingRef, {
                status: "cancelled",
                offerStatus: "declined",
                counterOfferStatus: "none",
                counterOfferRespondedAt: null,
                cancellationReason: "worker_cancelled",
                cancelledBy: "worker",
                workerDeclineReason: reason,
                cancellationNote: reason === "other" ? normalizedNote : null,
                cancelledAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            });
          });

          if (!didDecline) {
            return;
          }

          setCancellationModalVisible(false);

          Toast.show({
            type: "success",
            text1: "Request declined",
            text2: "The request has been declined successfully.",
          });
        } catch (error) {
          if (__DEV__) {
            console.warn("DECLINE_REQUEST_ERROR", {
              code: getErrorCode(error),
              message: getErrorMessage(error),
              error,
            });
          }

          showWorkerActionError("decline-request", error);
        } finally {
          cancellationInFlightRef.current = false;
          setCancellationLoading(false);
        }
      },
      [booking, workerId, runLockedAction],
    );

  /* ============================================================
     ACCEPT CUSTOMER COUNTER
  ============================================================ */

  const handleAcceptCounterOffer =
    useCallback(() => {
      if (!booking) {
        return;
      }

      if (booking.status !== "pending") {
        Toast.show({
          type: "info",
          text1: "Order unavailable",
          text2:
            "This order is no longer available for negotiation.",
        });
        return;
      }

      const amount = booking.counterOfferAmount;

      if (booking.counterOfferBy !== "customer") {
        Toast.show({
          type: "info",
          text1: "Offer unavailable",
          text2:
            "There is no customer counter offer to accept.",
        });
        return;
      }

      if (
        booking.counterOfferStatus !== "sent" ||
        typeof amount !== "number" ||
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        Toast.show({
          type: "error",
          text1: "Invalid offer",
          text2:
            "The customer counter offer is no longer valid.",
        });
        return;
      }

      Alert.alert(
        "Accept Offer",
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
            onPress: () => {
              void runLockedAction(async () => {
                try {
                  await acceptBooking(
                    booking.id,
                    "worker",
                  );

                  Toast.show({
                    type: "success",
                    text1: "Offer accepted",
                    text2:
                      `Order accepted at ₦${amount.toLocaleString(
                        "en-NG",
                      )}.`,
                  });
                } catch (error) {
                  if (__DEV__) {
                    console.warn(
                      "ACCEPT_COUNTER_OFFER_ERROR",
                      error,
                    );
                  }

                  showWorkerActionError(
                    "accept-offer",
                    error,
                  );
                }
              });
            },
          },
        ],
      );
    }, [booking, runLockedAction]);

  /* ============================================================
     COUNTER CUSTOMER OFFER
  ============================================================ */

  const handleCounterCounterOffer =
    useCallback(() => {
      if (!booking) {
        return;
      }

      if (booking.status !== "pending") {
        Toast.show({
          type: "info",
          text1: "Request unavailable",
          text2:
            "This order is no longer available for negotiation.",
        });
        return;
      }

      if (
        booking.counterOfferStatus !== "sent" ||
        booking.counterOfferBy !== "customer"
      ) {
        Toast.show({
          type: "info",
          text1: "Counter offer unavailable",
          text2:
            booking.counterOfferBy === "worker"
              ? "Your counter offer is waiting for the customer."
              : "There is no active customer counter offer.",
        });
        return;
      }

      const amount = booking.counterOfferAmount;

      if (
        typeof amount !== "number" ||
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        Toast.show({
          type: "error",
          text1: "Invalid offer",
          text2:
            "The customer's offer amount is unavailable.",
        });
        return;
      }

      router.push({
        pathname: "/(worker)/orders/counter-offer",
        params: {
          orderId: booking.id,
        },
      } as never);
    }, [booking]);

  /* ============================================================
     DECLINE CUSTOMER COUNTER
  ============================================================ */

  const handleDeclineCounterOffer =
    useCallback(() => {
      if (!booking || !workerId) {
        return;
      }

      if (booking.status !== "pending") {
        Toast.show({
          type: "info",
          text1: "Order unavailable",
          text2:
            "This order is no longer available for negotiation.",
        });
        return;
      }

      if (
        booking.counterOfferStatus !== "sent" ||
        booking.counterOfferBy !== "customer"
      ) {
        Toast.show({
          type: "info",
          text1: "Offer unavailable",
          text2:
            "This customer counter offer is no longer active.",
        });
        return;
      }

      Alert.alert(
        "Decline Offer",
        "Declining this offer will end the negotiation and cancel this order.",
        [
          {
            text: "Keep Negotiating",
            style: "cancel",
          },
          {
            text: "Decline",
            style: "destructive",
            onPress: () => {
              void runLockedAction(async () => {
                try {
                  await declineOffer(
                    booking.id,
                    "worker",
                  );

                  Toast.show({
                    type: "success",
                    text1: "Offer declined",
                    text2:
                      "The negotiation has ended.",
                  });
                } catch (error) {
                  if (__DEV__) {
                    console.warn(
                      "WORKER_DECLINE_COUNTER_OFFER_FAILED",
                      error,
                    );
                  }

                  showWorkerActionError(
                    "decline-offer",
                    error,
                  );
                }
              });
            },
          },
        ],
      );
    }, [booking, runLockedAction, workerId]);

  /* ============================================================
     START SERVICE
  ============================================================ */

  const handleStartService =
    useCallback(() => {
      if (!booking || !workerId) {
        return;
      }

      if (booking.status !== "accepted") {
        Toast.show({
          type: "info",
          text1: "Service unavailable",
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
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Start",
            onPress: () => {
              void runLockedAction(async () => {
                try {
                  const bookingRef = doc(
                    db,
                    "bookings",
                    booking.id,
                  );

                  await runTransaction(
                    db,
                    async transaction => {
                      const snapshot =
                        await transaction.get(bookingRef);

                      if (!snapshot.exists()) {
                        throw new Error(
                          "This service no longer exists.",
                        );
                      }

                      const data = snapshot.data();


                      if (__DEV__) {
  console.log("[START_SERVICE_DIAGNOSTIC]", {
    bookingId: snapshot.id,
    authWorkerId: workerId,
    bookingWorkerId: data.workerId,
    status: data.status,
    startConfirmationRequestedAt:
      data.startConfirmationRequestedAt ?? null,
    customerStartedConfirmedAt:
      data.customerStartedConfirmedAt ?? null,
  });
}



                      if (
                        cleanString(data.workerId) !==
                        cleanString(workerId)
                      ) {
                        throw new Error(
                          "You no longer have access to this service.",
                        );
                      }

                      if (data.status !== "accepted") {
  throw new Error(
    `INVALID_START_STATUS: ${String(data.status)}`,
  );
}

if (data.startConfirmationRequestedAt != null) {
  throw new Error(
    "START_CONFIRMATION_ALREADY_REQUESTED",
  );
}


transaction.update(bookingRef, {
  status: "accepted",
  startConfirmationRequestedAt: serverTimestamp(),
  customerStartedConfirmedAt: null,
  updatedAt: serverTimestamp(),
});

                    
                    },
                  );
Toast.show({
  type: "success",
  text1: "Confirmation requested",
  text2:
    "The customer must confirm before the service moves to In Progress.",
});

                } catch (error) {
                  if (__DEV__) {
                    console.warn(
                      "START_SERVICE_ERROR",
                      error,
                    );
                  }

                  showWorkerActionError(
                    "start-service",
                    error,
                  );
                }
              });
            },
          },
        ],
      );
    }, [booking, runLockedAction, workerId]);


    /* ============================================================
   COMPLETE SERVICE — WAIT FOR CUSTOMER CONFIRMATION
============================================================ */

const handleCompleteService = useCallback(() => {
  if (!booking || !workerId) {
    return;
  }

  if (booking.status !== "in-progress") {
    Toast.show({
      type: "info",
      text1: "Service unavailable",
      text2: "This service is not currently in progress.",
    });
    return;
  }

  const agreedAmount = booking.agreedPrice;

  if (
    typeof agreedAmount !== "number" ||
    !Number.isFinite(agreedAmount) ||
    agreedAmount <= 0
  ) {
    Toast.show({
      type: "error",
      text1: "Amount unavailable",
      text2: "The agreed service amount is not available.",
    });
    return;
  }

  Alert.alert(
    "Complete Service",
    `Mark this service as finished at ₦${agreedAmount.toLocaleString(
      "en-NG",
    )}? The customer must confirm before the order is completed.`,
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Mark as Finished",
        onPress: () => {
          void runLockedAction(async () => {
            try {
              const bookingRef = doc(
                db,
                "bookings",
                booking.id,
              );

              await runTransaction(db, async transaction => {
                const snapshot = await transaction.get(bookingRef);

                if (!snapshot.exists()) {
                  throw new Error("This service no longer exists.");
                }

                const data = snapshot.data();

                if (
                  cleanString(data.workerId) !==
                  cleanString(workerId)
                ) {
                  throw new Error(
                    "You no longer have access to this service.",
                  );
                }

                if (
                  normalizeWorkerBookingStatus(data.status) !==
                  "in-progress"
                ) {
                  throw new Error(
                    "This service is no longer in progress.",
                  );
                }

                if (data.workerMarkedCompletedAt) {
                  throw new Error(
                    "This service is already awaiting customer confirmation.",
                  );
                }

                const freshAmount = data.agreedPrice;

                if (
                  typeof freshAmount !== "number" ||
                  !Number.isFinite(freshAmount) ||
                  freshAmount <= 0
                ) {
                  throw new Error(
                    "The agreed service amount is unavailable.",
                  );
                }

                transaction.update(bookingRef, {
                  status: "awaiting_completion_confirmation",
                  workerMarkedCompletedAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                });
              });

              Toast.show({
                type: "success",
                text1: "Service completion requested",
                text2:
                  "Waiting for the customer to confirm that the service is finished.",
              });
            } catch (error) {
              if (__DEV__) {
                console.warn("COMPLETE_SERVICE_ERROR", {
                  code: getErrorCode(error),
                  message: getErrorMessage(error),
                  error,
                });
              }

              showWorkerActionError("complete-service", error);
            }
          });
        },
      },
    ],
  );
}, [booking, runLockedAction, workerId]);

  /* ============================================================
     RETURN
  ============================================================ */

  return {
    offerActionLoading,

    cancellationModalVisible,
    cancellationLoading,
    closeCancellationModal,
    handleConfirmDecline,

    handleBack,
    handleCustomerProfile,
    handleViewLocation,
    handleCallCustomer,
    handleSendOffer,
    handleDecline,
    handleAcceptCounterOffer,
    handleCounterCounterOffer,
    handleDeclineCounterOffer,
    handleStartService,
    handleCompleteService,
  };
}