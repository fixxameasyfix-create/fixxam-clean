import React, {
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppCard,
  AppText,
} from "@/components/ui";

import type {
  BookingOffer,
} from "@/firebase/queries/bookings/listenOffers";

import {
  addOffer,
} from "@/firebase/queries/bookings/addOffer";

/* ==============================================================
   TYPES
============================================================== */

export type BookingStatus =
  | "pending"
  | "pending_estimate"
  | "negotiating"
  | "booked"
  | "accepted"
  | "on_the_way"
  | "arrived"
  | "in_progress"
  | "awaiting_cash"
  | "payment_pending_confirmation"
  | "completed"
  | "cancelled"
  | "declined";

type BookingData = {
  id?: string;

  status: string;

  offerPrice?: number | null;
  offerMessage?: string | null;

  estimatePrice?: number | null;
  estimateMessage?: string | null;

  lastOfferBy?:
    | "worker"
    | "customer"
    | null;
};

type Props = {
  booking: BookingData;

  offers: BookingOffer[];

  onAccept: () =>
    Promise<void> | void;

  onCounterOffer?: () => void;
};

/* ==============================================================
   STATUS CONFIG
============================================================== */

const STATUS = {
  pending: {
    icon: "time-outline",
    color: "#F59E0B",
    title: "Request Pending",
    description:
      "Your service request has been sent.",
  },

  pending_estimate: {
    icon: "time-outline",
    color: "#F59E0B",
    title: "Waiting for Estimate",
    description:
      "Worker is reviewing your request.",
  },

  negotiating: {
    icon: "swap-horizontal-outline",
    color: "#2563EB",
    title: "Price Negotiation",
    description:
      "Review the latest offer from the worker.",
  },

  booked: {
    icon: "checkmark-circle-outline",
    color: "#22C55E",
    title: "Booking Confirmed",
    description:
      "The price has been agreed and your booking is confirmed.",
  },

  accepted: {
    icon: "checkmark-circle-outline",
    color: "#22C55E",
    title: "Booking Confirmed",
    description:
      "The price has been agreed.",
  },

  on_the_way: {
    icon: "car-outline",
    color: "#2563EB",
    title: "On The Way",
    description:
      "Worker is heading to your location.",
  },

  arrived: {
    icon: "location",
    color: "#16A34A",
    title: "Worker Has Arrived",
    description:
      "The worker has arrived and is ready to begin the job.",
  },

  in_progress: {
    icon: "construct-outline",
    color: "#FF6B00",
    title: "In Progress",
    description:
      "Service is currently in progress.",
  },

  awaiting_cash: {
    icon: "cash-outline",
    color: "#16A34A",
    title: "Awaiting Cash",
    description:
      "Pay the agreed amount directly to the worker.",
  },

  payment_pending_confirmation: {
    icon: "wallet-outline",
    color: "#F59E0B",
    title: "Payment Confirmation",
    description:
      "Waiting for payment confirmation.",
  },

  completed: {
    icon: "checkmark-done-circle-outline",
    color: "#22C55E",
    title: "Completed",
    description:
      "Booking completed successfully.",
  },

  cancelled: {
    icon: "close-circle-outline",
    color: "#EF4444",
    title: "Cancelled",
    description:
      "This booking has been cancelled.",
  },

  declined: {
    icon: "close-circle-outline",
    color: "#EF4444",
    title: "Request Declined",
    description:
      "The worker declined this service request.",
  },
} as const;

/* ==============================================================
   COMPONENT
============================================================== */

export default function NegotiationStatusCard({
  booking,
  offers,
  onAccept,
  onCounterOffer,
}: Props) {
  const [counterPrice, setCounterPrice] =
    useState("");

  const [counterMessage, setCounterMessage] =
    useState("");

  const [showCounterForm, setShowCounterForm] =
    useState(false);

  const [sendingCounter, setSendingCounter] =
    useState(false);

  const status =
    booking.status as BookingStatus;

  const current =
    STATUS[status] ??
    STATUS.pending;

  /*
   * ============================================================
   * LATEST OFFER
   * ============================================================
   */

  const latestOffer =
    offers.length > 0
      ? offers[offers.length - 1]
      : undefined;

  /*
   * ============================================================
   * LATEST WORKER OFFER
   * ============================================================
   */

  const latestWorkerOffer =
    [...offers]
      .reverse()
      .find(
        (offer) =>
          offer.sender ===
          "worker",
      );

  /*
   * ============================================================
   * CURRENT WORKER PRICE
   * ============================================================
   */

  const offerPrice =
    booking.lastOfferBy === "worker"
      ? booking.offerPrice ??
        booking.estimatePrice ??
        latestWorkerOffer?.amount ??
        null
      : latestWorkerOffer?.amount ??
        null;

  const offerMessage =
    booking.lastOfferBy === "worker"
      ? booking.offerMessage ??
        booking.estimateMessage ??
        latestWorkerOffer?.message ??
        ""
      : latestWorkerOffer?.message ??
        "";

  /*
   * ============================================================
   * CUSTOMER CAN RESPOND
   * ============================================================
   */

  const canRespond =
    status === "negotiating" &&
    booking.lastOfferBy ===
      "worker" &&
    offerPrice !== null;

  /*
   * ============================================================
   * SEND COUNTER OFFER
   * ============================================================
   */

  async function handleCounterOffer() {
    if (
      sendingCounter ||
      !booking.id
    ) {
      return;
    }

    const cleanPrice =
      counterPrice.trim();

    if (!cleanPrice) {
      return;
    }

    const amount =
      Number(cleanPrice);

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return;
    }

    const cleanMessage =
      counterMessage.trim();

    if (
      cleanMessage.length > 500
    ) {
      return;
    }

    setSendingCounter(true);

    try {
      await addOffer({
        bookingId:
          booking.id,

        sender:
          "customer",

        amount,

        message:
          cleanMessage,
      });

      setCounterPrice("");
      setCounterMessage("");

      setShowCounterForm(false);

      onCounterOffer?.();
    } catch (error) {
      console.error(
        "CUSTOMER_COUNTER_OFFER_ERROR",
        error,
      );
    } finally {
      setSendingCounter(false);
    }
  }

  return (
    <AppCard
      style={styles.card}
    >
      {/* ========================================================
          STATUS
      ======================================================== */}

      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor:
                `${current.color}15`,
            },
          ]}
        >
          <Ionicons
            name={
              current.icon as keyof typeof Ionicons.glyphMap
            }
            size={22}
            color={
              current.color
            }
          />
        </View>

        <View
          style={styles.content}
        >
          <AppText
            weight="bold"
            style={styles.title}
          >
            {current.title}
          </AppText>

          <AppText
            style={
              styles.description
            }
          >
            {
              current.description
            }
          </AppText>
        </View>
      </View>

      {/* ========================================================
          WORKER OFFER
      ======================================================== */}

      {canRespond && (
        <View
          style={
            styles.offerSection
          }
        >
          <View
            style={
              styles.offerHeader
            }
          >
            <View>
              <AppText
                style={
                  styles.offerLabel
                }
              >
                WORKER'S OFFER
              </AppText>

              <AppText
                weight="bold"
                style={
                  styles.offerPrice
                }
              >
                ₦
                {Number(
                  offerPrice,
                ).toLocaleString()}
              </AppText>
            </View>

            <View
              style={
                styles.offerBadge
              }
            >
              <Ionicons
                name="pricetag-outline"
                size={14}
                color="#2563EB"
              />

              <AppText
                weight="bold"
                style={
                  styles.offerBadgeText
                }
              >
                OFFER
              </AppText>
            </View>
          </View>

          {!!offerMessage && (
            <View
              style={
                styles.messageBox
              }
            >
              <AppText
                style={
                  styles.messageText
                }
              >
                {offerMessage}
              </AppText>
            </View>
          )}

          {/* ====================================================
              ACCEPT / COUNTER
          ==================================================== */}

          {!showCounterForm && (
            <View
              style={
                styles.actions
              }
            >
              <Pressable
                onPress={() =>
                  setShowCounterForm(
                    true,
                  )
                }
                style={
                  styles.counterButton
                }
              >
                <Ionicons
                  name="swap-horizontal-outline"
                  size={19}
                  color="#2563EB"
                />

                <AppText
                  weight="bold"
                  style={
                    styles.counterText
                  }
                >
                  Counter Offer
                </AppText>
              </Pressable>

              <Pressable
                onPress={
                  onAccept
                }
                style={
                  styles.acceptButton
                }
              >
                <Ionicons
                  name="checkmark-outline"
                  size={19}
                  color="#FFFFFF"
                />

                <AppText
                  weight="bold"
                  style={
                    styles.acceptText
                  }
                >
                  Accept
                </AppText>
              </Pressable>
            </View>
          )}

          {/* ====================================================
              COUNTER OFFER FORM
          ==================================================== */}

          {showCounterForm && (
            <View
              style={
                styles.counterForm
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.counterTitle
                }
              >
                Your Counter Offer
              </AppText>

              <TextInput
                value={
                  counterPrice
                }
                onChangeText={
                  setCounterPrice
                }
                placeholder="Enter your price"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                editable={
                  !sendingCounter
                }
                style={
                  styles.input
                }
              />

              <TextInput
                value={
                  counterMessage
                }
                onChangeText={
                  setCounterMessage
                }
                placeholder="Message to worker (optional)"
                placeholderTextColor="#94A3B8"
                multiline
                maxLength={500}
                editable={
                  !sendingCounter
                }
                textAlignVertical="top"
                style={[
                  styles.input,
                  styles.messageInput,
                ]}
              />

              <AppText
                style={
                  styles.counterCount
                }
              >
                {
                  counterMessage.length
                }
                /500
              </AppText>

              <View
                style={
                  styles.counterActions
                }
              >
                <Pressable
                  disabled={
                    sendingCounter
                  }
                  onPress={() =>
                    setShowCounterForm(
                      false,
                    )
                  }
                  style={
                    styles.cancelCounter
                  }
                >
                  <AppText
                    weight="bold"
                    style={
                      styles.cancelCounterText
                    }
                  >
                    Cancel
                  </AppText>
                </Pressable>

                <Pressable
                  disabled={
                    sendingCounter
                  }
                  onPress={
                    handleCounterOffer
                  }
                  style={[
                    styles.sendCounter,
                    sendingCounter &&
                      styles.disabled,
                  ]}
                >
                  {sendingCounter ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <AppText
                      weight="bold"
                      style={
                        styles.sendCounterText
                      }
                    >
                      Send Counter
                    </AppText>
                  )}
                </Pressable>
              </View>
            </View>
          )}
        </View>
      )}

      {/* ========================================================
          WAITING FOR WORKER
      ======================================================== */}

      {status ===
        "negotiating" &&
        booking.lastOfferBy ===
          "customer" && (
          <View
            style={
              styles.waitingBox
            }
          >
            <Ionicons
              name="hourglass-outline"
              size={18}
              color="#64748B"
            />

            <AppText
              style={
                styles.waitingText
              }
            >
              Your counter offer has
              been sent. Waiting for the
              worker's response.
            </AppText>
          </View>
        )}

      {/* ========================================================
          BOOKED PRICE
      ======================================================== */}

      {(status === "booked" ||
        status === "accepted") &&
        booking.offerPrice !==
          null &&
        booking.offerPrice !==
          undefined && (
          <View
            style={
              styles.agreedPrice
            }
          >
            <View>
              <AppText
                style={
                  styles.agreedLabel
                }
              >
                AGREED PRICE
              </AppText>

              <AppText
                weight="bold"
                style={
                  styles.agreedValue
                }
              >
                ₦
                {Number(
                  booking.offerPrice,
                ).toLocaleString()}
              </AppText>
            </View>

            <View
              style={
                styles.confirmedBadge
              }
            >
              <Ionicons
                name="checkmark-circle"
                size={17}
                color="#15803D"
              />

              <AppText
                weight="bold"
                style={
                  styles.confirmedText
                }
              >
                Confirmed
              </AppText>
            </View>
          </View>
        )}

      {/* Keep reference so TypeScript does not
          complain if latestOffer is used by future
          extensions. */}
      {latestOffer &&
        false && (
          <View />
        )}
    </AppCard>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 16,
    color: "#0F172A",
    marginBottom: 2,
  },

  description: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },

  offerSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },

  offerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  offerLabel: {
    fontSize: 10,
    letterSpacing: 0.8,
    color: "#64748B",
  },

  offerPrice: {
    marginTop: 3,
    fontSize: 27,
    color: "#0F172A",
  },

  offerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
  },

  offerBadgeText: {
    fontSize: 10,
    color: "#2563EB",
  },

  messageBox: {
    marginTop: 12,
    padding: 11,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
  },

  messageText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#475569",
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  counterButton: {
    flex: 1.15,
    minHeight: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  counterText: {
    fontSize: 12,
    color: "#2563EB",
  },

  acceptButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 13,
    backgroundColor: "#16A34A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  acceptText: {
    fontSize: 13,
    color: "#FFFFFF",
  },

  counterForm: {
    marginTop: 14,
    padding: 14,
    borderRadius: 15,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  counterTitle: {
    fontSize: 15,
    color: "#0F172A",
  },

  input: {
    marginTop: 12,
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
  },

  messageInput: {
    height: 80,
    textAlignVertical: "top",
  },

  counterCount: {
    marginTop: 4,
    textAlign: "right",
    fontSize: 10,
    color: "#94A3B8",
  },

  counterActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },

  cancelCounter: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E2E8F0",
  },

  cancelCounterText: {
    fontSize: 12,
    color: "#475569",
  },

  sendCounter: {
    flex: 1.3,
    minHeight: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
  },

  sendCounterText: {
    fontSize: 12,
    color: "#FFFFFF",
  },

  disabled: {
    opacity: 0.65,
  },

  waitingBox: {
    marginTop: 14,
    padding: 11,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  waitingText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },

  agreedPrice: {
    marginTop: 16,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  agreedLabel: {
    fontSize: 10,
    letterSpacing: 0.7,
    color: "#64748B",
  },

  agreedValue: {
    marginTop: 2,
    fontSize: 23,
    color: "#15803D",
  },

  confirmedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#DCFCE7",
  },

  confirmedText: {
    fontSize: 10,
    color: "#15803D",
  },
});