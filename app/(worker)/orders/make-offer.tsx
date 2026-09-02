import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  auth,
  db,
} from "@/firebase/config";

/* ==============================================================
   TYPES
============================================================== */

type MakeOfferParams = {
  orderId?: string | string[];
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
};

/* ==============================================================
   CONSTANTS
============================================================== */

const MAX_MESSAGE_LENGTH = 300;

const MAX_AMOUNT = 999_999_999;

const MIN_MESSAGE_LENGTH = 3;

const INITIAL_OFFER_ROUND = 1;

/*
 * This is only used as a client-side expiry fallback.
 * Final expiry enforcement should also exist in Firestore
 * security rules / backend logic.
 */
const OFFER_EXPIRY_HOURS = 24;

/* ==============================================================
   HELPERS
============================================================== */

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
    return INITIAL_OFFER_ROUND;
  }

  return Math.max(
    INITIAL_OFFER_ROUND,
    Math.floor(value),
  );
}

function normalizeString(
  value: unknown,
  fallback: string,
): string {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return fallback;
  }

  return value.trim();
}

function normalizeOptionalAmount(
  value: unknown,
): number | null {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return null;
  }

  return value;
}

/* ==============================================================
   SCREEN
============================================================== */

export default function MakeOfferScreen() {
  const params =
    useLocalSearchParams<MakeOfferParams>();

  /* ============================================================
     RESOLVED ORDER ID
  ============================================================ */

  const resolvedOrderId = useMemo(() => {
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

  /* ============================================================
     STATE
  ============================================================ */

  const [booking, setBooking] =
    useState<BookingData | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [loadingError, setLoadingError] =
    useState<string | null>(null);

  const [amount, setAmount] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  /* ============================================================
     LOAD BOOKING
  ============================================================ */

  useEffect(() => {
    let mounted = true;

    const loadBooking =
      async () => {
        const workerId =
          auth.currentUser?.uid;

        if (!workerId) {
          if (!mounted) {
            return;
          }

          setLoading(false);

          setLoadingError(
            "Please sign in to send an offer.",
          );

          return;
        }

        if (!resolvedOrderId) {
          if (!mounted) {
            return;
          }

          setLoading(false);

          setLoadingError(
            "Order ID is missing.",
          );

          return;
        }

        try {
          setLoading(true);
          setLoadingError(null);

          const bookingRef =
            doc(
              db,
              "bookings",
              resolvedOrderId,
            );

          const snapshot =
            await getDoc(
              bookingRef,
            );

          if (!mounted) {
            return;
          }

          if (!snapshot.exists()) {
            setLoading(false);

            setLoadingError(
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
            setLoading(false);

            setLoadingError(
              "You do not have access to this order.",
            );

            return;
          }

          const nextBooking: BookingData =
            {
              serviceName:
                normalizeString(
                  data.serviceName,
                  "Service request",
                ),

              customerName:
                normalizeString(
                  data.customerName,
                  "Customer",
                ),

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
                typeof data.offerMessage ===
                "string"
                  ? data.offerMessage
                  : null,

              counterOfferAmount:
                normalizeOptionalAmount(
                  data.counterOfferAmount,
                ),

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
            };

          setBooking(
            nextBooking,
          );

          setLoading(false);
        } catch (error) {
          console.error(
            "LOAD_MAKE_OFFER_BOOKING_ERROR",
            error,
          );

          if (!mounted) {
            return;
          }

          setLoading(false);

          setLoadingError(
            "Unable to load this order. Please try again.",
          );
        }
      };

    void loadBooking();

    return () => {
      mounted = false;
    };
  }, [resolvedOrderId]);

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
        Number(cleaned);

      if (
        !Number.isFinite(value)
      ) {
        return 0;
      }

      return value;
    }, [amount]);

  const formattedAmount =
    useMemo(() => {
      if (numericAmount <= 0) {
        return "₦0";
      }

      return `₦${numericAmount.toLocaleString(
        "en-NG",
      )}`;
    }, [numericAmount]);

  /* ============================================================
     MESSAGE
  ============================================================ */

  const cleanMessage =
    message.trim();

  /* ============================================================
     VALIDATION
  ============================================================ */

  const amountValid =
    numericAmount > 0 &&
    numericAmount <=
      MAX_AMOUNT;

  const messageValid =
    cleanMessage.length >=
      MIN_MESSAGE_LENGTH &&
    cleanMessage.length <=
      MAX_MESSAGE_LENGTH;

  const orderValid =
    Boolean(booking) &&
    booking?.workerId ===
      auth.currentUser?.uid &&
    booking?.status ===
      "pending";

  const offerAvailable =
    booking?.offerStatus !==
      "sent" &&
    booking?.offerStatus !==
      "accepted";

  const canSubmit =
    !loading &&
    !loadingError &&
    orderValid &&
    offerAvailable &&
    amountValid &&
    messageValid &&
    !submitting;

  /* ============================================================
     AMOUNT INPUT
  ============================================================ */

  const handleAmountChange =
    useCallback(
      (text: string) => {
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

        setAmount(cleaned);
      },
      [],
    );

  /* ============================================================
     MESSAGE INPUT
  ============================================================ */

  const handleMessageChange =
    useCallback(
      (text: string) => {
        if (
          text.length >
          MAX_MESSAGE_LENGTH
        ) {
          return;
        }

        setMessage(text);
      },
      [],
    );

  /* ============================================================
     SEND OFFER
  ============================================================ */

  const handleSendOffer =
    useCallback(
      async () => {
        if (submitting) {
          return;
        }

        const workerId =
          auth.currentUser?.uid;

        if (!workerId) {
          Alert.alert(
            "Sign in required",
            "Please sign in again before sending an offer.",
          );

          return;
        }

        if (!resolvedOrderId) {
          Alert.alert(
            "Invalid order",
            "The order ID is missing.",
          );

          return;
        }

        if (!booking) {
          Alert.alert(
            "Order unavailable",
            "Unable to load this order.",
          );

          return;
        }

        if (
          booking.workerId !==
          workerId
        ) {
          Alert.alert(
            "Access denied",
            "You cannot send an offer for this order.",
          );

          return;
        }

        if (
          booking.status !==
          "pending"
        ) {
          Alert.alert(
            "Order unavailable",
            "This order is no longer pending.",
          );

          return;
        }

        if (
          booking.offerStatus ===
          "sent"
        ) {
          Alert.alert(
            "Offer already sent",
            "You have already sent an offer for this order.",
          );

          return;
        }

        if (
          numericAmount <= 0
        ) {
          Alert.alert(
            "Offer amount required",
            "Please enter the amount you want to charge.",
          );

          return;
        }

        if (
          numericAmount >
          MAX_AMOUNT
        ) {
          Alert.alert(
            "Invalid amount",
            "Please enter a valid offer amount.",
          );

          return;
        }

        if (
          cleanMessage.length <
          MIN_MESSAGE_LENGTH
        ) {
          Alert.alert(
            "Message required",
            "Please explain what your offer includes.",
          );

          return;
        }

        if (
          cleanMessage.length >
          MAX_MESSAGE_LENGTH
        ) {
          Alert.alert(
            "Message too long",
            `Please keep your message within ${MAX_MESSAGE_LENGTH} characters.`,
          );

          return;
        }

        try {
          setSubmitting(true);

          const bookingRef =
            doc(
              db,
              "bookings",
              resolvedOrderId,
            );

          /*
           * Transaction prevents two workers / two devices
           * from successfully changing the same pending order
           * at the same time.
           */
          await runTransaction(
            db,
            async (transaction) => {
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

              /*
               * Worker ownership.
               */
              if (
                latestData.workerId !==
                workerId
              ) {
                throw new Error(
                  "ACCESS_DENIED",
                );
              }

              /*
               * Order must still be pending.
               */
              const latestStatus =
                normalizeStatus(
                  latestData.status,
                );

              if (
                latestStatus !==
                "pending"
              ) {
                throw new Error(
                  "ORDER_NOT_PENDING",
                );
              }

              /*
               * Do not overwrite an existing active offer.
               */
              const latestOfferStatus =
                normalizeOfferStatus(
                  latestData.offerStatus,
                );

              if (
                latestOfferStatus ===
                "sent"
              ) {
                throw new Error(
                  "OFFER_ALREADY_SENT",
                );
              }

              /*
               * If another offer was accepted,
               * the order cannot receive a new offer.
               */
              if (
                latestOfferStatus ===
                "accepted"
              ) {
                throw new Error(
                  "OFFER_ALREADY_ACCEPTED",
                );
              }

              /*
               * First worker offer starts negotiation at round 1.
               */
              const offerRound =
                normalizeRound(
                  latestData.offerRound,
                );

              /*
               * Keep an expiry timestamp for the customer
               * order screen.
               *
               * Backend / security rules should also enforce
               * expiry for full protection.
               */
              const offerExpiresAt =
                new Date(
                  Date.now() +
                    OFFER_EXPIRY_HOURS *
                      60 *
                      60 *
                      1000,
                );

              transaction.update(
                bookingRef,
                {
                  /*
                   * Worker offer
                   */
                  offerAmount:
                    numericAmount,

                  offerMessage:
                    cleanMessage,

                  offerStatus:
                    "sent",

                  offerRound:

                    offerRound ||
                    INITIAL_OFFER_ROUND,

                  offerWorkerId:
                    workerId,

                  offerSentAt:
                    serverTimestamp(),

                  offerRespondedAt:
                    null,

                  offerExpiresAt,

                  /*
                   * Clear old counter state.
                   *
                   * This is important if the same order
                   * previously had a declined/cancelled
                   * negotiation state.
                   */
                  counterOfferAmount:
                    null,

                  counterOfferMessage:
                    null,

                  counterOfferBy:
                    null,

                  counterOfferStatus:
                    "none",

                  counterOfferSentAt:
                    null,

                  counterOfferRespondedAt:
                    null,

                  updatedAt:
                    serverTimestamp(),
                },
              );
            },
          );

          /*
           * Update local state before navigation
           * so the screen remains internally consistent.
           */
          setBooking(
            (current) => {
              if (!current) {
                return current;
              }

              return {
                ...current,

                offerStatus:
                  "sent",

                offerAmount:
                  numericAmount,

                offerMessage:
                  cleanMessage,

                offerRound:
                  current.offerRound ||
                  INITIAL_OFFER_ROUND,

                counterOfferAmount:
                  null,

                counterOfferMessage:
                  null,

                counterOfferBy:
                  null,

                counterOfferStatus:
                  "none",
              };
            },
          );

          /*
           * Navigate to confirmation screen.
           */
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
        } catch (error) {
          console.error(
            "SEND_WORKER_OFFER_ERROR",
            error,
          );

          if (
            error instanceof
            Error
          ) {
            switch (
              error.message
            ) {
              case "ORDER_NOT_FOUND":
                Alert.alert(
                  "Order not found",
                  "This order no longer exists.",
                );
                break;

              case "ACCESS_DENIED":
                Alert.alert(
                  "Access denied",
                  "You cannot send an offer for this order.",
                );
                break;

              case "ORDER_NOT_PENDING":
                Alert.alert(
                  "Order unavailable",
                  "This order is no longer pending.",
                );
                break;

              case "OFFER_ALREADY_SENT":
                Alert.alert(
                  "Offer already sent",
                  "An active offer already exists for this order.",
                );
                break;

              case "OFFER_ALREADY_ACCEPTED":
                Alert.alert(
                  "Order already accepted",
                  "This order has already accepted an offer.",
                );
                break;

              default:
                Alert.alert(
                  "Unable to send offer",
                  "Something went wrong. Please try again.",
                );
            }
          } else {
            Alert.alert(
              "Unable to send offer",
              "Something went wrong. Please try again.",
            );
          }
        } finally {
          setSubmitting(false);
        }
      },
      [
        submitting,
        resolvedOrderId,
        booking,
        numericAmount,
        cleanMessage,
      ],
    );

  /* ============================================================
     CANCEL
  ============================================================ */

  const handleCancel =
    useCallback(() => {
      if (submitting) {
        return;
      }

      router.back();
    }, [submitting]);

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
            styles.centerContainer
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
    loadingError ||
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
            styles.centerContainer
          }
        >
          <View
            style={
              styles.errorIcon
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={29}
              color="#DC2626"
            />
          </View>

          <AppText
            weight="bold"
            style={
              styles.errorTitle
            }
          >
            Unable to make offer
          </AppText>

          <AppText
            center
            style={
              styles.errorText
            }
          >
            {loadingError ??
              "Order information is unavailable."}
          </AppText>

          <Pressable
            onPress={
              handleCancel
            }
            style={({ pressed }) => [
              styles.errorBackButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <AppText
              weight="bold"
              style={
                styles.errorBackText
              }
            >
              GO BACK
            </AppText>
          </Pressable>
        </View>
      </AppScreen>
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
      <AppScreen
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
              styles.warningIcon
            }
          >
            <Ionicons
              name="information-circle-outline"
              size={32}
              color="#2563EB"
            />
          </View>

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
            This order is no longer
            accepting offers.
          </AppText>

          <Pressable
            onPress={
              handleCancel
            }
            style={({ pressed }) => [
              styles.errorBackButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <AppText
              weight="bold"
              style={
                styles.errorBackText
              }
            >
              BACK TO ORDER
            </AppText>
          </Pressable>
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     ALREADY SENT
  ============================================================ */

  if (
    booking.offerStatus ===
    "sent"
  ) {
    return (
      <AppScreen
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
              styles.successIcon
            }
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={32}
              color="#16A34A"
            />
          </View>

          <AppText
            weight="bold"
            style={
              styles.errorTitle
            }
          >
            Offer already sent
          </AppText>

          <AppText
            center
            style={
              styles.errorText
            }
          >
            You have already sent an
            offer for this order.
          </AppText>

          <Pressable
            onPress={
              handleCancel
            }
            style={({ pressed }) => [
              styles.errorBackButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <AppText
              weight="bold"
              style={
                styles.errorBackText
              }
            >
              BACK TO ORDER
            </AppText>
          </Pressable>
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <AppScreen
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
        >
          {/* ==================================================
              HEADER
          ================================================== */}

          <View
            style={
              styles.header
            }
          >
            <Pressable
              onPress={
                handleCancel
              }
              disabled={
                submitting
              }
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={({ pressed }) => [
                styles.backButton,
                pressed &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={21}
                color="#0F172A"
              />
            </Pressable>

            <View
              style={
                styles.headerText
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.headerTitle
                }
              >
                Make Offer
              </AppText>

              <AppText
                style={
                  styles.headerSubtitle
                }
              >
                Send your price to the
                customer.
              </AppText>
            </View>
          </View>

          {/* ==================================================
              ORDER CONTEXT
          ================================================== */}

          <View
            style={
              styles.orderCard
            }
          >
            <View
              style={
                styles.serviceIcon
              }
            >
              <Ionicons
                name="construct-outline"
                size={24}
                color="#2563EB"
              />
            </View>

            <View
              style={
                styles.orderInfo
              }
            >
              <AppText
                style={
                  styles.orderLabel
                }
              >
                SERVICE
              </AppText>

              <AppText
                weight="bold"
                numberOfLines={1}
                style={
                  styles.serviceName
                }
              >
                {
                  booking.serviceName
                }
              </AppText>

              <AppText
                style={
                  styles.customerText
                }
              >
                Customer:{" "}
                {
                  booking.customerName
                }
              </AppText>
            </View>

            <View
              style={
                styles.orderBadge
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.orderBadgeText
                }
              >
                #
                {
                  resolvedOrderId
                }
              </AppText>
            </View>
          </View>

          {/* ==================================================
              1. OFFER
          ================================================== */}

          <SectionTitle
            number="1"
            title="Your offer"
          />

          <View
            style={
              styles.inputCard
            }
          >
            <View
              style={
                styles.inputHeader
              }
            >
              <View
                style={
                  styles.inputHeaderText
                }
              >
                <AppText
                  weight="bold"
                  style={
                    styles.inputTitle
                  }
                >
                  Offer amount
                </AppText>

                <AppText
                  style={
                    styles.inputHint
                  }
                >
                  Enter the total price
                  for this service.
                </AppText>
              </View>

              <View
                style={
                  styles.nairaCircle
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
            </View>

            <View
              style={[
                styles.amountInputWrapper,
                amount.length > 0 &&
                  !amountValid &&
                  styles.inputError,
              ]}
            >
              <AppText
                weight="bold"
                style={
                  styles.amountPrefix
                }
              >
                ₦
              </AppText>

              <TextInput
                value={amount}
                onChangeText={
                  handleAmountChange
                }
                placeholder="0"
                placeholderTextColor="#CBD5E1"
                keyboardType="number-pad"
                editable={
                  !submitting
                }
                style={
                  styles.amountInput
                }
                maxLength={9}
                accessibilityLabel="Offer amount"
              />
            </View>

            {amount.length > 0 &&
              !amountValid && (
                <AppText
                  style={
                    styles.validationText
                  }
                >
                  Enter an amount between
                  ₦1 and ₦
                  {MAX_AMOUNT.toLocaleString(
                    "en-NG",
                  )}
                  .
                </AppText>
              )}
          </View>

          {/* ==================================================
              2. MESSAGE
          ================================================== */}

          <SectionTitle
            number="2"
            title="Message to customer"
          />

          <View
            style={
              styles.messageCard
            }
          >
            <View
              style={
                styles.messageTop
              }
            >
              <View
                style={
                  styles.messageIcon
                }
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={22}
                  color="#2563EB"
                />
              </View>

              <View
                style={
                  styles.messageContent
                }
              >
                <AppText
                  weight="bold"
                  style={
                    styles.inputTitle
                  }
                >
                  Explain your offer
                </AppText>

                <AppText
                  style={
                    styles.inputHint
                  }
                >
                  Tell the customer what
                  your price includes.
                </AppText>
              </View>
            </View>

            <TextInput
              value={message}
              onChangeText={
                handleMessageChange
              }
              placeholder="Example: This includes site visit, consultation and detailed planning..."
              placeholderTextColor="#94A3B8"
              multiline
              textAlignVertical="top"
              editable={
                !submitting
              }
              maxLength={
                MAX_MESSAGE_LENGTH
              }
              style={[
                styles.messageInput,
                message.length > 0 &&
                  !messageValid &&
                  styles.messageInputError,
              ]}
              accessibilityLabel="Offer message"
            />

            <View
              style={
                styles.messageFooter
              }
            >
              <AppText
                style={
                  styles.messageValidation
                }
              >
                {message.length > 0 &&
                message.length <
                  MIN_MESSAGE_LENGTH
                  ? `Minimum ${MIN_MESSAGE_LENGTH} characters`
                  : ""}
              </AppText>

              <AppText
                style={
                  styles.characterCount
                }
              >
                {message.length}/
                {MAX_MESSAGE_LENGTH}
              </AppText>
            </View>
          </View>

          {/* ==================================================
              3. SUMMARY
          ================================================== */}

          <SectionTitle
            number="3"
            title="Offer summary"
          />

          <View
            style={
              styles.summaryCard
            }
          >
            <View
              style={
                styles.summaryHeader
              }
            >
              <View
                style={
                  styles.summaryIcon
                }
              >
                <Ionicons
                  name="receipt-outline"
                  size={21}
                  color="#2563EB"
                />
              </View>

              <View
                style={
                  styles.summaryHeaderText
                }
              >
                <AppText
                  weight="bold"
                  style={
                    styles.summaryTitle
                  }
                >
                  Ready to send
                </AppText>

                <AppText
                  style={
                    styles.summarySubtitle
                  }
                >
                  Customer will review
                  your offer.
                </AppText>
              </View>
            </View>

            <View
              style={
                styles.divider
              }
            />

            <SummaryRow
              label="Service"
              value={
                booking.serviceName
              }
            />

            <SummaryRow
              label="Customer"
              value={
                booking.customerName
              }
            />

            <SummaryRow
              label="Your offer"
              value={
                formattedAmount
              }
              strong
            />
          </View>

          {/* ==================================================
              INFO
          ================================================== */}

          <View
            style={
              styles.infoCard
            }
          >
            <Ionicons
              name="information-circle-outline"
              size={19}
              color="#2563EB"
            />

            <AppText
              style={
                styles.infoText
              }
            >
              The customer will receive
              this offer inside the order
              and can accept or decline
              it.
            </AppText>
          </View>

          {/* ==================================================
              SEND
          ================================================== */}

          <Pressable
            onPress={
              handleSendOffer
            }
            disabled={
              !canSubmit
            }
            accessibilityRole="button"
            accessibilityLabel="Send offer"
            accessibilityState={{
              disabled:
                !canSubmit,
            }}
            style={({ pressed }) => [
              styles.sendButton,

              !canSubmit &&
                styles.sendButtonDisabled,

              pressed &&
                canSubmit &&
                styles.sendButtonPressed,
            ]}
          >
            {submitting ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <Ionicons
                name="paper-plane-outline"
                size={19}
                color="#FFFFFF"
              />
            )}

            <AppText
              weight="bold"
              style={
                styles.sendButtonText
              }
            >
              {submitting
                ? "SENDING OFFER..."
                : "SEND OFFER"}
            </AppText>

            {!submitting && (
              <Ionicons
                name="arrow-forward"
                size={19}
                color="#FFFFFF"
              />
            )}
          </Pressable>

          {/* ==================================================
              CANCEL
          ================================================== */}

          <Pressable
            onPress={
              handleCancel
            }
            disabled={
              submitting
            }
            style={({ pressed }) => [
              styles.cancelButton,
              pressed &&
                styles.cancelPressed,
            ]}
          >
            <AppText
              weight="bold"
              style={
                styles.cancelText
              }
            >
              CANCEL
            </AppText>
          </Pressable>

          <AppText
            center
            style={
              styles.footer
            }
          >
            Order #
            {resolvedOrderId}
          </AppText>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

/* ==============================================================
   SECTION TITLE
============================================================== */

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
}

/* ==============================================================
   SUMMARY ROW
============================================================== */

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <View
      style={
        styles.summaryRow
      }
    >
      <AppText
        style={
          styles.summaryLabel
        }
      >
        {label}
      </AppText>

      <AppText
        weight={
          strong
            ? "bold"
            : undefined
        }
        numberOfLines={1}
        style={[
          styles.summaryValue,
          strong &&
            styles.summaryValueStrong,
        ]}
      >
        {value}
      </AppText>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    keyboard: {
      flex: 1,
      width: "100%",
    },

    screen: {
      flex: 1,
      width: "100%",
      backgroundColor:
        "#F8FAFC",
    },

    scrollView: {
      flex: 1,
      width: "100%",
    },

    content: {
      width: "100%",
      flexGrow: 1,
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 40,
    },

    /* ==========================================================
       HEADER
    ========================================================== */

    header: {
      width: "100%",
      minHeight: 58,
      flexDirection: "row",
      alignItems: "center",
      paddingBottom: 8,
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      alignItems: "center",
      justifyContent:
        "center",
    },

    headerText: {
      flex: 1,
      minWidth: 0,
      marginLeft: 11,
    },

    headerTitle: {
      fontSize: 21,
      lineHeight: 26,
      color: "#0F172A",
    },

    headerSubtitle: {
      marginTop: 2,
      fontSize: 11,
      lineHeight: 16,
      color: "#64748B",
    },

    /* ==========================================================
       ORDER
    ========================================================== */

    orderCard: {
      width: "100%",
      minHeight: 78,
      marginTop: 10,
      padding: 11,
      borderRadius: 19,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      flexDirection: "row",
      alignItems: "center",
      shadowColor:
        "#0F172A",
      shadowOpacity: 0.035,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 2,
    },

    serviceIcon: {
      width: 51,
      height: 51,
      borderRadius: 16,
      backgroundColor:
        "#EFF6FF",
      borderWidth: 1,
      borderColor:
        "#DBEAFE",
      alignItems: "center",
      justifyContent:
        "center",
    },

    orderInfo: {
      flex: 1,
      minWidth: 0,
      marginLeft: 11,
      marginRight: 8,
    },

    orderLabel: {
      fontSize: 8.5,
      letterSpacing: 1,
      color: "#94A3B8",
    },

    serviceName: {
      marginTop: 3,
      fontSize: 14.5,
      color: "#0F172A",
    },

    customerText: {
      marginTop: 3,
      fontSize: 10,
      color: "#64748B",
    },

    orderBadge: {
      maxWidth: 85,
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor:
        "#F8FAFC",
    },

    orderBadgeText: {
      fontSize: 8,
      color: "#64748B",
    },

    /* ==========================================================
       SECTION
    ========================================================== */

    sectionTitle: {
      width: "100%",
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

    /* ==========================================================
       INPUT CARD
    ========================================================== */

    inputCard: {
      width: "100%",
      padding: 14,
      borderRadius: 19,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      shadowColor:
        "#0F172A",
      shadowOpacity: 0.03,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 2,
    },

    inputHeader: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    inputHeaderText: {
      flex: 1,
      minWidth: 0,
      paddingRight: 10,
    },

    inputTitle: {
      fontSize: 13,
      color: "#0F172A",
    },

    inputHint: {
      marginTop: 3,
      maxWidth: 260,
      fontSize: 10,
      lineHeight: 15,
      color: "#64748B",
    },

    nairaCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent:
        "center",
    },

    nairaText: {
      fontSize: 20,
      color: "#2563EB",
    },

    amountInputWrapper: {
      width: "100%",
      height: 68,
      marginTop: 14,
      borderRadius: 15,
      backgroundColor:
        "#F8FAFC",
      borderWidth: 1,
      borderColor:
        "#DBEAFE",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
    },

    inputError: {
      borderColor:
        "#FCA5A5",
      backgroundColor:
        "#FEF2F2",
    },

    amountPrefix: {
      fontSize: 26,
      color: "#2563EB",
    },

    amountInput: {
      flex: 1,
      minWidth: 0,
      marginLeft: 8,
      paddingVertical: 0,
      fontSize: 29,
      fontWeight: "700",
      color: "#0F172A",
    },

    validationText: {
      marginTop: 6,
      fontSize: 9,
      color: "#DC2626",
    },

    /* ==========================================================
       MESSAGE
    ========================================================== */

    messageCard: {
      width: "100%",
      padding: 14,
      borderRadius: 19,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      shadowColor:
        "#0F172A",
      shadowOpacity: 0.03,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 2,
    },

    messageTop: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
    },

    messageIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent:
        "center",
    },

    messageContent: {
      flex: 1,
      minWidth: 0,
      marginLeft: 10,
    },

    messageInput: {
      width: "100%",
      minHeight: 120,
      marginTop: 13,
      paddingHorizontal: 13,
      paddingVertical: 12,
      borderRadius: 14,
      backgroundColor:
        "#F8FAFC",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      fontSize: 12,
      lineHeight: 18,
      color: "#0F172A",
    },

    messageInputError: {
      borderColor:
        "#FCA5A5",
      backgroundColor:
        "#FEF2F2",
    },

    messageFooter: {
      minHeight: 17,
      marginTop: 5,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    messageValidation: {
      flex: 1,
      fontSize: 9,
      color: "#DC2626",
    },

    characterCount: {
      fontSize: 9,
      color: "#94A3B8",
    },

    /* ==========================================================
       SUMMARY
    ========================================================== */

    summaryCard: {
      width: "100%",
      padding: 14,
      borderRadius: 19,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      shadowColor:
        "#0F172A",
      shadowOpacity: 0.03,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 2,
    },

    summaryHeader: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
    },

    summaryIcon: {
      width: 43,
      height: 43,
      borderRadius: 13,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 10,
    },

    summaryHeaderText: {
      flex: 1,
      minWidth: 0,
    },

    summaryTitle: {
      fontSize: 13,
      color: "#0F172A",
    },

    summarySubtitle: {
      marginTop: 2,
      fontSize: 10,
      color: "#64748B",
    },

    divider: {
      height: 1,
      backgroundColor:
        "#F1F5F9",
      marginVertical: 13,
    },

    summaryRow: {
      width: "100%",
      minHeight: 30,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    summaryLabel: {
      fontSize: 10.5,
      color: "#64748B",
    },

    summaryValue: {
      flex: 1,
      maxWidth: "62%",
      marginLeft: 12,
      fontSize: 10.5,
      textAlign: "right",
      color: "#334155",
    },

    summaryValueStrong: {
      fontSize: 16,
      color: "#2563EB",
    },

    /* ==========================================================
       INFO
    ========================================================== */

    infoCard: {
      width: "100%",
      marginTop: 12,
      paddingHorizontal: 13,
      paddingVertical: 11,
      borderRadius: 15,
      backgroundColor:
        "#EFF6FF",
      flexDirection: "row",
      alignItems: "center",
    },

    infoText: {
      flex: 1,
      minWidth: 0,
      marginLeft: 8,
      fontSize: 10,
      lineHeight: 16,
      color: "#475569",
    },

    /* ==========================================================
       SEND
    ========================================================== */

    sendButton: {
      width: "100%",
      minHeight: 56,
      marginTop: 20,
      borderRadius: 17,
      backgroundColor:
        "#2563EB",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 8,
      shadowColor:
        "#2563EB",
      shadowOpacity: 0.16,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 5,
      },
      elevation: 4,
    },

    sendButtonDisabled: {
      opacity: 0.45,
    },

    sendButtonPressed: {
      opacity: 0.9,
      transform: [
        {
          scale: 0.985,
        },
      ],
    },

    sendButtonText: {
      fontSize: 13,
      color: "#FFFFFF",
    },

    /* ==========================================================
       CANCEL
    ========================================================== */

    cancelButton: {
      width: "100%",
      minHeight: 44,
      marginTop: 8,
      borderRadius: 14,
      alignItems: "center",
      justifyContent:
        "center",
    },

    cancelPressed: {
      opacity: 0.6,
    },

    cancelText: {
      fontSize: 11,
      color: "#64748B",
    },

    /* ==========================================================
       CENTER
    ========================================================== */

    centerContainer: {
      flex: 1,
      width: "100%",
      minHeight: 600,
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal: 30,
    },

    loadingText: {
      marginTop: 10,
      fontSize: 11,
      color: "#64748B",
    },

    errorIcon: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor:
        "#FEF2F2",
      alignItems: "center",
      justifyContent:
        "center",
    },

    warningIcon: {
      width: 68,
      height: 68,
      borderRadius: 22,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent:
        "center",
    },

    successIcon: {
      width: 68,
      height: 68,
      borderRadius: 22,
      backgroundColor:
        "#ECFDF5",
      alignItems: "center",
      justifyContent:
        "center",
    },

    errorTitle: {
      marginTop: 15,
      fontSize: 17,
      color: "#0F172A",
    },

    errorText: {
      marginTop: 5,
      fontSize: 12,
      lineHeight: 18,
      color: "#64748B",
    },

    errorBackButton: {
      marginTop: 18,
      minHeight: 44,
      paddingHorizontal: 20,
      borderRadius: 12,
      backgroundColor:
        "#2563EB",
      alignItems: "center",
      justifyContent:
        "center",
    },

    errorBackText: {
      fontSize: 10,
      color: "#FFFFFF",
    },

    /* ==========================================================
       PRESS
    ========================================================== */

    pressed: {
      opacity: 0.7,
      transform: [
        {
          scale: 0.97,
        },
      ],
    },

    /* ==========================================================
       FOOTER
    ========================================================== */

    footer: {
      width: "100%",
      marginTop: 18,
      marginBottom: 10,
      fontSize: 9,
      lineHeight: 15,
      color: "#94A3B8",
    },
  });