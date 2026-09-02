import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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

/* ==============================================================
   TYPES
============================================================== */

type CounterOfferParams = {
  bookingId?: string;
  amount?: string;
  workerName?: string;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const MIN_COUNTER_OFFER = 100;
const MAX_COUNTER_OFFER = 10_000_000;
const MAX_MESSAGE_LENGTH = 300;

/* ==============================================================
   SCREEN
============================================================== */

export default function CounterOfferScreen() {
  const {
    bookingId,
    amount,
    workerName,
  } =
    useLocalSearchParams<CounterOfferParams>();

  /* ============================================================
     RESOLVED DATA
  ============================================================ */

  const resolvedBookingId =
    useMemo(
      () =>
        bookingId?.trim() || "",
      [bookingId],
    );

  const currentOffer =
    useMemo(() => {
      const value =
        Number(amount);

      if (
        !Number.isFinite(value) ||
        value < 0
      ) {
        return 0;
      }

      return value;
    }, [amount]);

  const resolvedWorkerName =
    useMemo(
      () =>
        workerName?.trim() ||
        "Selected worker",
      [workerName],
    );

  /* ============================================================
     STATE
  ============================================================ */

  const [
    counterAmount,
    setCounterAmount,
  ] = useState("");

  const [
    counterMessage,
    setCounterMessage,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  /* ============================================================
     FORMAT MONEY
  ============================================================ */

  const formatAmount =
    useCallback(
      (value: number) =>
        value.toLocaleString(
          "en-NG",
          {
            maximumFractionDigits: 0,
          },
        ),
      [],
    );

  /* ============================================================
     AMOUNT INPUT
  ============================================================ */

  const handleAmountChange =
    useCallback(
      (text: string) => {
        const cleaned =
          text.replace(
            /[^\d]/g,
            "",
          );

        setCounterAmount(
          cleaned,
        );
      },
      [],
    );

  /* ============================================================
     MESSAGE INPUT
  ============================================================ */

  const handleMessageChange =
    useCallback(
      (text: string) => {
        setCounterMessage(
          text.slice(
            0,
            MAX_MESSAGE_LENGTH,
          ),
        );
      },
      [],
    );

  /* ============================================================
     DERIVED VALUES
  ============================================================ */

  const numericCounterAmount =
    useMemo(() => {
      const value =
        Number(
          counterAmount,
        );

      return Number.isFinite(
        value,
      )
        ? value
        : 0;
    }, [counterAmount]);

  const trimmedCounterMessage =
    useMemo(
      () =>
        counterMessage.trim(),
      [counterMessage],
    );

  const isValidAmount =
    numericCounterAmount >=
      MIN_COUNTER_OFFER &&
    numericCounterAmount <=
      MAX_COUNTER_OFFER;

  const isDifferent =
    numericCounterAmount !==
      currentOffer &&
    numericCounterAmount > 0;

  const hasMessage =
    trimmedCounterMessage.length >
    0;

  const canSubmit =
    Boolean(
      resolvedBookingId &&
        auth.currentUser &&
        isValidAmount &&
        isDifferent &&
        hasMessage &&
        !submitting,
    );

  /* ============================================================
     SEND COUNTER OFFER
  ============================================================ */

  const handleSendCounterOffer =
    useCallback(async () => {
      if (submitting) {
        return;
      }

      const customerId =
        auth.currentUser?.uid;

      if (!customerId) {
        Alert.alert(
          "Sign in required",
          "Please sign in before sending a counter offer.",
        );

        return;
      }

      if (!resolvedBookingId) {
        Alert.alert(
          "Order unavailable",
          "We could not identify this order.",
        );

        return;
      }

      if (!counterAmount) {
        Alert.alert(
          "Enter an amount",
          "Please enter your counter offer amount.",
        );

        return;
      }

      if (!isValidAmount) {
        if (
          numericCounterAmount <
          MIN_COUNTER_OFFER
        ) {
          Alert.alert(
            "Amount too low",
            `Your counter offer must be at least ₦${formatAmount(
              MIN_COUNTER_OFFER,
            )}.`,
          );
        } else {
          Alert.alert(
            "Amount too high",
            `Your counter offer cannot exceed ₦${formatAmount(
              MAX_COUNTER_OFFER,
            )}.`,
          );
        }

        return;
      }

      if (!isDifferent) {
        Alert.alert(
          "Same amount",
          "Please enter an amount different from the worker's offer.",
        );

        return;
      }

      if (!hasMessage) {
        Alert.alert(
          "Add a message",
          "Please add a short message for the worker.",
        );

        return;
      }

      setSubmitting(true);

      try {
        const bookingRef =
          doc(
            db,
            "bookings",
            resolvedBookingId,
          );

        /*
         * The customer is sending a new
         * counter-offer to the worker.
         *
         * We intentionally keep the
         * worker's original offer fields
         * untouched.
         */

        await updateDoc(
          bookingRef,
          {
            counterOfferAmount:
              numericCounterAmount,

            counterOfferMessage:
              trimmedCounterMessage,

            counterOfferStatus:
              "sent",

            counterOfferSentAt:
              serverTimestamp(),

            counterOfferCustomerId:
              customerId,
          },
        );

        Alert.alert(
          "Counter Offer Sent",
          `Your counter offer of ₦${formatAmount(
            numericCounterAmount,
          )} has been sent to ${resolvedWorkerName}.`,
          [
            {
              text: "VIEW ORDER",
              onPress: () => {
                router.replace({
                  pathname:
                    "/(customer)/orders/[orderId]",
                  params: {
                    orderId:
                      resolvedBookingId,
                  },
                });
              },
            },
          ],
        );
      } catch (error) {
        console.error(
          "SEND_COUNTER_OFFER_ERROR",
          error,
        );

        Alert.alert(
          "Unable to send",
          "We could not send your counter offer. Please try again.",
        );
      } finally {
        setSubmitting(false);
      }
    }, [
      submitting,
      resolvedBookingId,
      counterAmount,
      numericCounterAmount,
      trimmedCounterMessage,
      isValidAmount,
      isDifferent,
      hasMessage,
      formatAmount,
      resolvedWorkerName,
    ]);

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
     UI
  ============================================================ */

  return (
    <AppScreen>
      <KeyboardAvoidingView
        style={
          styles.keyboard
        }
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
      >
        <View
          style={
            styles.container
          }
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
              style={({
                pressed,
              }) => [
                styles.backButton,

                pressed &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color="#0F172A"
              />
            </Pressable>

            <View
              style={
                styles.headerContent
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.headerTitle
                }
              >
                Counter Offer
              </AppText>

              <AppText
                style={
                  styles.headerSubtitle
                }
              >
                Make a new offer to the
                worker
              </AppText>
            </View>
          </View>

          {/* ==================================================
              CONTENT
          ================================================== */}

          <View
            style={
              styles.content
            }
          >
            {/* ==================================================
                INTRO
            ================================================== */}

            <View
              style={
                styles.intro
              }
            >
              <View
                style={
                  styles.introIcon
                }
              >
                <Ionicons
                  name="swap-horizontal-outline"
                  size={27}
                  color="#2563EB"
                />
              </View>

              <AppText
                weight="bold"
                style={
                  styles.introTitle
                }
              >
                Negotiate the price
              </AppText>

              <AppText
                center
                style={
                  styles.introText
                }
              >
                Enter the amount you are
                willing to pay for this
                service.
              </AppText>
            </View>

            {/* ==================================================
                WORKER OFFER
            ================================================== */}

            <View
              style={
                styles.currentOfferCard
              }
            >
              <View
                style={
                  styles.currentOfferHeader
                }
              >
                <View
                  style={
                    styles.currentOfferIcon
                  }
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#2563EB"
                  />
                </View>

                <View
                  style={
                    styles.currentOfferInfo
                  }
                >
                  <AppText
                    style={
                      styles.currentOfferLabel
                    }
                  >
                    WORKER OFFER
                  </AppText>

                  <AppText
                    weight="bold"
                    numberOfLines={1}
                    style={
                      styles.workerName
                    }
                  >
                    {resolvedWorkerName}
                  </AppText>
                </View>
              </View>

              <View
                style={
                  styles.currentAmountRow
                }
              >
                <AppText
                  style={
                    styles.currentAmountLabel
                  }
                >
                  Current offer
                </AppText>

                <AppText
                  weight="bold"
                  style={
                    styles.currentAmount
                  }
                >
                  ₦
                  {formatAmount(
                    currentOffer,
                  )}
                </AppText>
              </View>
            </View>

            {/* ==================================================
                COUNTER AMOUNT
            ================================================== */}

            <View
              style={
                styles.sectionHeader
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
                  1
                </AppText>
              </View>

              <AppText
                weight="bold"
                style={
                  styles.sectionTitle
                }
              >
                Your Counter Offer
              </AppText>
            </View>

            <View
              style={[
                styles.inputCard,

                counterAmount.length >
                  0 &&
                  styles.inputCardActive,

                counterAmount.length >
                  0 &&
                  !isValidAmount &&
                  styles.inputCardError,
              ]}
            >
              <View
                style={
                  styles.currencyBox
                }
              >
                <AppText
                  weight="bold"
                  style={
                    styles.currencyText
                  }
                >
                  ₦
                </AppText>
              </View>

              <TextInput
                value={
                  counterAmount
                }
                onChangeText={
                  handleAmountChange
                }
                placeholder="Enter amount"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                editable={
                  !submitting
                }
                maxLength={8}
                style={
                  styles.amountInput
                }
                accessibilityLabel="Counter offer amount"
              />
            </View>

            {numericCounterAmount >
              0 && (
              <View
                style={
                  styles.previewCard
                }
              >
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color="#2563EB"
                />

                <AppText
                  style={
                    styles.previewText
                  }
                >
                  Your counter offer:{" "}
                  <AppText
                    weight="bold"
                    style={
                      styles.previewAmount
                    }
                  >
                    ₦
                    {formatAmount(
                      numericCounterAmount,
                    )}
                  </AppText>
                </AppText>
              </View>
            )}

            {/* ==================================================
                MESSAGE
            ================================================== */}

            <View
              style={
                styles.messageSection
              }
            >
              <View
                style={
                  styles.messageHeader
                }
              >
                <View
                  style={
                    styles.messageNumber
                  }
                >
                  <AppText
                    weight="bold"
                    style={
                      styles.messageNumberText
                    }
                  >
                    2
                  </AppText>
                </View>

                <AppText
                  weight="bold"
                  style={
                    styles.messageTitle
                  }
                >
                  Message to Worker
                </AppText>
              </View>

              <View
                style={[
                  styles.messageInputCard,

                  counterMessage.length >
                    0 &&
                    styles.messageInputCardActive,
                ]}
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={20}
                  color="#2563EB"
                  style={
                    styles.messageIcon
                  }
                />

                <TextInput
                  value={
                    counterMessage
                  }
                  onChangeText={
                    handleMessageChange
                  }
                  placeholder="Write a message to the worker..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  maxLength={
                    MAX_MESSAGE_LENGTH
                  }
                  editable={
                    !submitting
                  }
                  textAlignVertical="top"
                  style={
                    styles.messageInput
                  }
                  accessibilityLabel="Message to worker"
                />
              </View>

              <View
                style={
                  styles.messageFooter
                }
              >
                <AppText
                  style={
                    styles.messageHint
                  }
                >
                  Explain your counter
                  offer briefly.
                </AppText>

                <AppText
                  style={
                    styles.messageCount
                  }
                >
                  {counterMessage.length}/
                  {MAX_MESSAGE_LENGTH}
                </AppText>
              </View>
            </View>

            {/* ==================================================
                HELP
            ================================================== */}

            <AppText
              center
              style={
                styles.helpText
              }
            >
              The worker will receive your
              counter offer and can accept,
              decline, or respond with
              another offer.
            </AppText>
          </View>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <View
            style={
              styles.actions
            }
          >
            <Pressable
              onPress={
                handleSendCounterOffer
              }
              disabled={
                !canSubmit
              }
              accessibilityRole="button"
              accessibilityLabel="Send counter offer"
              style={({
                pressed,
              }) => [
                styles.sendButton,

                !canSubmit &&
                  styles.sendButtonDisabled,

                pressed &&
                  canSubmit &&
                  styles.pressed,
              ]}
            >
              {submitting ? (
                <View
                  style={
                    styles.sendingContent
                  }
                >
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />

                  <AppText
                    weight="bold"
                    style={
                      styles.sendButtonText
                    }
                  >
                    SENDING...
                  </AppText>
                </View>
              ) : (
                <>
                  <AppText
                    weight="bold"
                    style={
                      styles.sendButtonText
                    }
                  >
                    SEND COUNTER OFFER
                  </AppText>

                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="#FFFFFF"
                  />
                </>
              )}
            </Pressable>

            <Pressable
              onPress={
                handleCancel
              }
              disabled={
                submitting
              }
              accessibilityRole="button"
              accessibilityLabel="Cancel counter offer"
              style={({
                pressed,
              }) => [
                styles.cancelButton,

                pressed &&
                  styles.pressed,
              ]}
            >
              <AppText
                weight="bold"
                style={
                  styles.cancelButtonText
                }
              >
                CANCEL
              </AppText>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    keyboard: {
      flex: 1,
    },

    container: {
      flex: 1,
      paddingHorizontal: 20,
      paddingBottom: 20,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 6,
      paddingBottom: 20,
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E2E8F0",
      alignItems: "center",
      justifyContent: "center",
    },

    headerContent: {
      flex: 1,
      marginLeft: 12,
    },

    headerTitle: {
      fontSize: 22,
      lineHeight: 27,
      color: "#0F172A",
    },

    headerSubtitle: {
      marginTop: 2,
      fontSize: 12,
      lineHeight: 18,
      color: "#64748B",
    },

    content: {
      flex: 1,
    },

    intro: {
      alignItems: "center",
      paddingTop: 8,
      paddingBottom: 22,
    },

    introIcon: {
      width: 58,
      height: 58,
      borderRadius: 18,
      backgroundColor: "#EFF6FF",
      borderWidth: 1,
      borderColor: "#DBEAFE",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },

    introTitle: {
      fontSize: 20,
      lineHeight: 25,
      color: "#0F172A",
    },

    introText: {
      maxWidth: 310,
      marginTop: 6,
      fontSize: 12,
      lineHeight: 19,
      color: "#64748B",
    },

    currentOfferCard: {
      width: "100%",
      padding: 16,
      borderRadius: 20,
      backgroundColor: "#EFF6FF",
      borderWidth: 1,
      borderColor: "#BFDBFE",
    },

    currentOfferHeader: {
      flexDirection: "row",
      alignItems: "center",
    },

    currentOfferIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
    },

    currentOfferInfo: {
      flex: 1,
      marginLeft: 11,
    },

    currentOfferLabel: {
      fontSize: 9,
      lineHeight: 13,
      letterSpacing: 0.8,
      color: "#64748B",
    },

    workerName: {
      marginTop: 2,
      fontSize: 15,
      lineHeight: 20,
      color: "#0F172A",
    },

    currentAmountRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 15,
      paddingTop: 13,
      borderTopWidth: 1,
      borderTopColor: "#DBEAFE",
    },

    currentAmountLabel: {
      fontSize: 12,
      color: "#64748B",
    },

    currentAmount: {
      fontSize: 21,
      lineHeight: 27,
      color: "#2563EB",
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 25,
      marginBottom: 10,
    },

    sectionNumber: {
      width: 27,
      height: 27,
      borderRadius: 9,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },

    sectionNumberText: {
      fontSize: 13,
      color: "#2563EB",
    },

    sectionTitle: {
      fontSize: 16,
      lineHeight: 21,
      color: "#0F172A",
    },

    inputCard: {
      height: 68,
      width: "100%",
      borderRadius: 17,
      backgroundColor: "#FFFFFF",
      borderWidth: 1.5,
      borderColor: "#E2E8F0",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
    },

    inputCardActive: {
      borderColor: "#2563EB",
    },

    inputCardError: {
      borderColor: "#FCA5A5",
    },

    currencyBox: {
      width: 47,
      height: 47,
      borderRadius: 14,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    currencyText: {
      fontSize: 21,
      color: "#2563EB",
    },

    amountInput: {
      flex: 1,
      height: 64,
      paddingHorizontal: 12,
      fontSize: 20,
      fontWeight: "700",
      color: "#0F172A",
    },

    previewCard: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 13,
      backgroundColor: "#F8FAFC",
    },

    previewText: {
      flex: 1,
      marginLeft: 7,
      fontSize: 11,
      lineHeight: 17,
      color: "#64748B",
    },

    previewAmount: {
      color: "#2563EB",
    },

    messageSection: {
      marginTop: 22,
    },

    messageHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },

    messageNumber: {
      width: 27,
      height: 27,
      borderRadius: 9,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },

    messageNumberText: {
      fontSize: 13,
      color: "#2563EB",
    },

    messageTitle: {
      fontSize: 16,
      lineHeight: 21,
      color: "#0F172A",
    },

    messageInputCard: {
      minHeight: 110,
      borderRadius: 17,
      backgroundColor: "#FFFFFF",
      borderWidth: 1.5,
      borderColor: "#E2E8F0",
      flexDirection: "row",
      alignItems: "flex-start",
      paddingHorizontal: 12,
      paddingVertical: 12,
    },

    messageInputCardActive: {
      borderColor: "#2563EB",
    },

    messageIcon: {
      marginTop: 2,
    },

    messageInput: {
      flex: 1,
      minHeight: 82,
      marginLeft: 9,
      padding: 0,
      fontSize: 13,
      lineHeight: 20,
      color: "#0F172A",
    },

    messageFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 6,
    },

    messageHint: {
      fontSize: 9.5,
      color: "#94A3B8",
    },

    messageCount: {
      fontSize: 9,
      color: "#94A3B8",
    },

    helpText: {
      marginTop: 18,
      paddingHorizontal: 15,
      fontSize: 10.5,
      lineHeight: 16,
      color: "#94A3B8",
    },

    actions: {
      paddingTop: 15,
    },

    sendButton: {
      minHeight: 55,
      borderRadius: 17,
      backgroundColor: "#2563EB",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
    },

    sendButtonDisabled: {
      opacity: 0.45,
    },

    sendingContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
    },

    sendButtonText: {
      fontSize: 12.5,
      color: "#FFFFFF",
    },

    cancelButton: {
      minHeight: 43,
      marginTop: 7,
      alignItems: "center",
      justifyContent: "center",
    },

    cancelButtonText: {
      fontSize: 11,
      color: "#64748B",
    },

    pressed: {
      opacity: 0.82,
      transform: [
        {
          scale: 0.985,
        },
      ],
    },
  });