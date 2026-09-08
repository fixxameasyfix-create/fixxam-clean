import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
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

import Toast from "react-native-toast-message";

import {
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import {
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
  Typography,
} from "@/theme";

import {
  auth,
  db,
} from "@/firebase/config";

/* ============================================================
   TYPES
============================================================ */

type CounterOfferParams = {
  bookingId?:
    | string
    | string[];

  amount?:
    | string
    | string[];

  workerName?:
    | string
    | string[];
};

/* ============================================================
   CONSTANTS
============================================================ */

const MIN_COUNTER_OFFER =
  100;

const MAX_COUNTER_OFFER =
  10_000_000;

const MAX_MESSAGE_LENGTH =
  300;

/* ============================================================
   HELPERS
============================================================ */

function getParamString(
  value:
    | string
    | string[]
    | undefined,
): string {
  if (
    Array.isArray(value)
  ) {
    return (
      value[0] ??
      ""
    ).trim();
  }

  return (
    value ??
    ""
  ).trim();
}

function formatAmount(
  value: number,
): string {
  const safeValue =
    Number.isFinite(value)
      ? Math.max(
          0,
          value,
        )
      : 0;

  return safeValue.toLocaleString(
    "en-NG",
    {
      maximumFractionDigits:
        0,
    },
  );
}

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

function showSuccessToast(
  title: string,
  message: string,
) {
  Toast.show({
    type: "success",
    text1: title,
    text2: message,
  });
}

/* ============================================================
   SCREEN
============================================================ */

export default function CounterOfferScreen() {
  const params =
    useLocalSearchParams<CounterOfferParams>();

  /* ==========================================================
     RESOLVED PARAMS
  ========================================================== */

  const resolvedBookingId =
    useMemo(
      () =>
        getParamString(
          params.bookingId,
        ),
      [
        params.bookingId,
      ],
    );

  const currentOffer =
    useMemo(() => {
      const rawAmount =
        getParamString(
          params.amount,
        );

      const value =
        Number(
          rawAmount,
        );

      if (
        !Number.isFinite(
          value,
        ) ||
        value < 0
      ) {
        return 0;
      }

      return value;
    }, [
      params.amount,
    ]);

  const resolvedWorkerName =
    useMemo(
      () =>
        getParamString(
          params.workerName,
        ) ||
        "Selected worker",
      [
        params.workerName,
      ],
    );

  /* ==========================================================
     STATE
  ========================================================== */

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
    amountFocused,
    setAmountFocused,
  ] =
    useState(false);

  const [
    messageFocused,
    setMessageFocused,
  ] =
    useState(false);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const submitInFlight =
    useRef(false);

  /* ==========================================================
     AMOUNT INPUT
  ========================================================== */

  const handleAmountChange =
    useCallback(
      (
        text: string,
      ) => {
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

  /* ==========================================================
     MESSAGE
  ========================================================== */

  const handleMessageChange =
    useCallback(
      (
        text: string,
      ) => {
        setCounterMessage(
          text.slice(
            0,
            MAX_MESSAGE_LENGTH,
          ),
        );
      },
      [],
    );

  /* ==========================================================
     DERIVED
  ========================================================== */

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
    }, [
      counterAmount,
    ]);

  const trimmedCounterMessage =
    useMemo(
      () =>
        counterMessage.trim(),
      [
        counterMessage,
      ],
    );

  const isValidAmount =
    numericCounterAmount >=
      MIN_COUNTER_OFFER &&
    numericCounterAmount <=
      MAX_COUNTER_OFFER;

  const isDifferent =
    numericCounterAmount > 0 &&
    numericCounterAmount !==
      currentOffer;

  const hasMessage =
    trimmedCounterMessage.length >
    0;

  const canSubmit =
    Boolean(
      resolvedBookingId &&
      auth.currentUser &&
      counterAmount &&
      isValidAmount &&
      isDifferent &&
      hasMessage &&
      !submitting,
    );

  const amountHasError =
    counterAmount.length > 0 &&
    !isValidAmount;

  /* ==========================================================
     VALIDATE
  ========================================================== */

  const validate =
    useCallback((): boolean => {
      if (
        !auth.currentUser
      ) {
        showErrorToast(
          "Sign in required",
          "Please sign in before sending a counter offer.",
        );

        return false;
      }

      if (
        !resolvedBookingId
      ) {
        showErrorToast(
          "Order unavailable",
          "We could not identify this order.",
        );

        return false;
      }

      if (
        !counterAmount
      ) {
        showErrorToast(
          "Enter an amount",
          "Please enter your counter offer amount.",
        );

        return false;
      }

      if (
        numericCounterAmount <
        MIN_COUNTER_OFFER
      ) {
        showErrorToast(
          "Amount too low",
          `Your counter offer must be at least ₦${formatAmount(
            MIN_COUNTER_OFFER,
          )}.`,
        );

        return false;
      }

      if (
        numericCounterAmount >
        MAX_COUNTER_OFFER
      ) {
        showErrorToast(
          "Amount too high",
          `Your counter offer cannot exceed ₦${formatAmount(
            MAX_COUNTER_OFFER,
          )}.`,
        );

        return false;
      }

      if (
        !isDifferent
      ) {
        showErrorToast(
          "Same amount",
          "Please enter an amount different from the worker's offer.",
        );

        return false;
      }

      if (
        !hasMessage
      ) {
        showErrorToast(
          "Add a message",
          "Please add a short message for the worker.",
        );

        return false;
      }

      return true;
    }, [
      counterAmount,
      hasMessage,
      isDifferent,
      numericCounterAmount,
      resolvedBookingId,
    ]);

  /* ==========================================================
     SEND COUNTER OFFER
  ========================================================== */

  const handleSendCounterOffer =
    useCallback(async () => {
      if (
        submitInFlight.current ||
        submitting
      ) {
        return;
      }

      if (
        !validate()
      ) {
        return;
      }

      const customerId =
        auth.currentUser?.uid;

      if (!customerId) {
        return;
      }

      submitInFlight.current =
        true;

      setSubmitting(
        true,
      );

      try {
        const bookingRef =
          doc(
            db,
            "bookings",
            resolvedBookingId,
          );

        /*
         * Transaction prevents writing to a booking
         * that disappeared between screen load
         * and submission.
         *
         * Firestore Security Rules remain responsible
         * for customer ownership and allowed fields.
         */
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
                "BOOKING_NOT_FOUND",
              );
            }

            transaction.update(
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
          },
        );

        showSuccessToast(
          "Counter Offer Sent",
          `Your counter offer of ₦${formatAmount(
            numericCounterAmount,
          )} has been sent to ${resolvedWorkerName}.`,
        );

        router.replace({
          pathname:
            "/(customer)/orders/[orderId]",

          params: {
            orderId:
              resolvedBookingId,
          },
        });
      } catch (
        error
      ) {
        console.error(
          "SEND_COUNTER_OFFER_ERROR:",
          error,
        );

        if (
          error instanceof Error &&
          error.message ===
            "BOOKING_NOT_FOUND"
        ) {
          showErrorToast(
            "Order unavailable",
            "This order could not be found.",
          );

          return;
        }

        showErrorToast(
          "Unable to send",
          "We could not send your counter offer. Please try again.",
        );
      } finally {
        submitInFlight.current =
          false;

        setSubmitting(
          false,
        );
      }
    }, [
      numericCounterAmount,
      resolvedBookingId,
      resolvedWorkerName,
      submitting,
      trimmedCounterMessage,
      validate,
    ]);

  /* ==========================================================
     CANCEL
  ========================================================== */

  const handleCancel =
    useCallback(() => {
      if (
        submitInFlight.current ||
        submitting
      ) {
        return;
      }

      router.back();
    }, [
      submitting,
    ]);

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <AppScreen
      role="customer"
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
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              accessibilityState={{
                disabled:
                  submitting,
              }}
              style={({
                pressed,
              }) => [
                styles.backButton,

                submitting
                  ? styles.disabled
                  : null,

                pressed &&
                !submitting
                  ? styles.pressed
                  : null,
              ]}
            >
              <AppIcon
                name="back"
                size="md"
                color={
                  Colors.textPrimary
                }
              />
            </Pressable>

            <View
              style={
                styles.headerContent
              }
            >
              <AppText
                variant="heading2"
                weight="bold"
                style={
                  styles.headerTitle
                }
              >
                Counter Offer
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.headerSubtitle
                }
              >
                Make a new offer to the worker
              </AppText>
            </View>
          </View>

          {/* ==================================================
              SCROLL CONTENT
          ================================================== */}

          <ScrollView
            style={
              styles.scroll
            }
            showsVerticalScrollIndicator={
              false
            }
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={
              styles.scrollContent
            }
          >
            {/* ================================================
                INTRO
            ================================================ */}

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
                <AppIcon
                  name="refresh"
                  role="customer"
                  size="md"
                  color={
                    CustomerColors.primary
                  }
                />
              </View>

              <AppText
                variant="heading3"
                weight="bold"
                center
                style={
                  styles.introTitle
                }
              >
                Negotiate the price
              </AppText>

              <AppText
                variant="body"
                tone="secondary"
                center
                style={
                  styles.introText
                }
              >
                Enter the amount you are willing to pay for this service.
              </AppText>
            </View>

            {/* ================================================
                WORKER OFFER
            ================================================ */}

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
                  <AppIcon
                    name="profile"
                    role="customer"
                    size="sm"
                    color={
                      CustomerColors.primary
                    }
                  />
                </View>

                <View
                  style={
                    styles.currentOfferInfo
                  }
                >
                  <AppText
                    variant="caption"
                    style={
                      styles.currentOfferLabel
                    }
                  >
                    WORKER OFFER
                  </AppText>

                  <AppText
                    variant="body"
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
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.currentAmountLabel
                  }
                >
                  Current offer
                </AppText>

                <AppText
                  variant="heading3"
                  weight="bold"
                  numberOfLines={1}
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

            {/* ================================================
                AMOUNT HEADER
            ================================================ */}

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
                  variant="caption"
                  weight="bold"
                  style={
                    styles.sectionNumberText
                  }
                >
                  1
                </AppText>
              </View>

              <AppText
                variant="body"
                weight="bold"
                style={
                  styles.sectionTitle
                }
              >
                Your Counter Offer
              </AppText>
            </View>

            {/* ================================================
                AMOUNT INPUT
            ================================================ */}

            <View
              style={[
                styles.inputCard,

                amountFocused
                  ? styles.inputCardActive
                  : null,

                amountHasError
                  ? styles.inputCardError
                  : null,
              ]}
            >
              <View
                style={
                  styles.currencyBox
                }
              >
                <AppText
                  variant="heading3"
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
                onFocus={() => {
                  setAmountFocused(
                    true,
                  );
                }}
                onBlur={() => {
                  setAmountFocused(
                    false,
                  );
                }}
                placeholder="Enter amount"
                placeholderTextColor={
                  Colors.textMuted
                }
                selectionColor={
                  CustomerColors.primary
                }
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

            {/* ================================================
                AMOUNT PREVIEW
            ================================================ */}

            {numericCounterAmount >
            0 ? (
              <View
                style={
                  styles.previewCard
                }
              >
                <AppIcon
                  name="info"
                  size="sm"
                  color={
                    amountHasError
                      ? Colors.error
                      : Colors.info
                  }
                />

                <View
                  style={
                    styles.previewContent
                  }
                >
                  <AppText
                    variant="caption"
                    tone="secondary"
                  >
                    Your counter offer
                  </AppText>

                  <AppText
                    variant="body"
                    weight="bold"
                    style={[
                      styles.previewAmount,

                      amountHasError
                        ? styles.previewAmountError
                        : null,
                    ]}
                  >
                    ₦
                    {formatAmount(
                      numericCounterAmount,
                    )}
                  </AppText>
                </View>
              </View>
            ) : null}

            {/* ================================================
                MESSAGE HEADER
            ================================================ */}

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
                    styles.sectionNumber
                  }
                >
                  <AppText
                    variant="caption"
                    weight="bold"
                    style={
                      styles.sectionNumberText
                    }
                  >
                    2
                  </AppText>
                </View>

                <AppText
                  variant="body"
                  weight="bold"
                  style={
                    styles.sectionTitle
                  }
                >
                  Message to Worker
                </AppText>
              </View>

              {/* ==============================================
                  MESSAGE INPUT
              ============================================== */}

              <View
                style={[
                  styles.messageInputCard,

                  messageFocused
                    ? styles.inputCardActive
                    : null,
                ]}
              >
                <AppIcon
                  name="messages"
                  role="customer"
                  size="sm"
                  color={
                    messageFocused
                      ? CustomerColors.primary
                      : Colors.textSecondary
                  }
                />

                <TextInput
                  value={
                    counterMessage
                  }
                  onChangeText={
                    handleMessageChange
                  }
                  onFocus={() => {
                    setMessageFocused(
                      true,
                    );
                  }}
                  onBlur={() => {
                    setMessageFocused(
                      false,
                    );
                  }}
                  placeholder="Write a message to the worker..."
                  placeholderTextColor={
                    Colors.textMuted
                  }
                  selectionColor={
                    CustomerColors.primary
                  }
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
                  variant="caption"
                  style={
                    styles.messageHint
                  }
                >
                  Explain your counter offer briefly.
                </AppText>

                <AppText
                  variant="caption"
                  style={
                    styles.messageCount
                  }
                >
                  {counterMessage.length}/
                  {MAX_MESSAGE_LENGTH}
                </AppText>
              </View>
            </View>

            {/* ================================================
                HELP
            ================================================ */}

            <View
              style={
                styles.helpBox
              }
            >
              <AppIcon
                name="info"
                size="sm"
                color={
                  Colors.info
                }
              />

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.helpText
                }
              >
                The worker will receive your counter offer and can accept, decline, or respond with another offer.
              </AppText>
            </View>
          </ScrollView>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <View
            style={
              styles.actions
            }
          >
            <Pressable
              onPress={() => {
                void handleSendCounterOffer();
              }}
              disabled={
                !canSubmit
              }
              accessibilityRole="button"
              accessibilityLabel="Send counter offer"
              accessibilityState={{
                disabled:
                  !canSubmit,

                busy:
                  submitting,
              }}
              style={({
                pressed,
              }) => [
                styles.sendButton,

                !canSubmit
                  ? styles.sendButtonDisabled
                  : null,

                pressed &&
                canSubmit
                  ? styles.pressed
                  : null,
              ]}
            >
              {submitting ? (
                <ActivityIndicator
                  size="small"
                  color={
                    Colors.textInverse
                  }
                />
              ) : (
                <AppIcon
                  name="next"
                  size="sm"
                  color={
                    Colors.textInverse
                  }
                />
              )}

              <AppText
                variant="body"
                weight="bold"
                style={
                  styles.sendButtonText
                }
              >
                {submitting
                  ? "SENDING..."
                  : "SEND COUNTER OFFER"}
              </AppText>
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
              accessibilityState={{
                disabled:
                  submitting,
              }}
              style={({
                pressed,
              }) => [
                styles.cancelButton,

                submitting
                  ? styles.disabled
                  : null,

                pressed &&
                !submitting
                  ? styles.pressed
                  : null,
              ]}
            >
              <AppText
                variant="caption"
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

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       SCREEN
    ======================================================== */

    screen: {
      flex: 1,

      paddingHorizontal: 0,

      paddingTop: 0,

      paddingBottom: 0,

      backgroundColor:
        Colors.background,
    },

    keyboard: {
      flex: 1,
    },

    container: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.sm,
    },

    scroll: {
      flex: 1,
    },

    scrollContent: {
      paddingBottom:
        FixxamTokens.spacing.xl,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    backButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    headerContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    headerTitle: {
      color:
        Colors.textPrimary,
    },

    headerSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       INTRO
    ======================================================== */

    intro: {
      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",
    },

    introIcon: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      marginBottom:
        FixxamTokens.spacing.md,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        CustomerColors.primary,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    introTitle: {
      color:
        Colors.textPrimary,
    },

    introText: {
      maxWidth: 310,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 19,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       CURRENT OFFER
    ======================================================== */

    currentOfferCard: {
      width: "100%",

      padding:
        FixxamTokens.spacing.lg,

      borderWidth: 1,

      borderColor:
        CustomerColors.primary,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    currentOfferHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    currentOfferIcon: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    currentOfferInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    currentOfferLabel: {
      letterSpacing:
        0.8,

      color:
        Colors.textSecondary,
    },

    workerName: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textPrimary,
    },

    currentAmountRow: {
      marginTop:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,

      borderTopWidth: 1,

      borderTopColor:
        Colors.border,
    },

    currentAmountLabel: {
      flex: 1,

      color:
        Colors.textSecondary,
    },

    currentAmount: {
      flexShrink: 0,

      color:
        CustomerColors.primary,
    },

    /* ========================================================
       SECTION HEADER
    ======================================================== */

    sectionHeader: {
      marginTop:
        FixxamTokens.spacing.xl,

      marginBottom:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    sectionNumber: {
      width: 28,

      height: 28,

      marginRight:
        FixxamTokens.spacing.sm,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.sm,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    sectionNumberText: {
      color:
        CustomerColors.primary,
    },

    sectionTitle: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       AMOUNT INPUT
    ======================================================== */

    inputCard: {
      minHeight: 68,

      width: "100%",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    inputCardActive: {
      borderColor:
        CustomerColors.primary,
    },

    inputCardError: {
      borderColor:
        Colors.error,
    },

    currencyBox: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    currencyText: {
      color:
        CustomerColors.primary,
    },

    amountInput: {
      flex: 1,

      minHeight: 64,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical: 0,

      fontSize:
        Typography.fontSize.xl,

      fontWeight:
        "700",

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       AMOUNT PREVIEW
    ======================================================== */

    previewCard: {
      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.infoSoft,
    },

    previewContent: {
      flex: 1,

      minWidth: 0,
    },

    previewAmount: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        CustomerColors.primary,
    },

    previewAmountError: {
      color:
        Colors.error,
    },

    /* ========================================================
       MESSAGE
    ======================================================== */

    messageSection: {
      marginTop:
        FixxamTokens.spacing.xl,
    },

    messageHeader: {
      marginBottom:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    messageInputCard: {
      minHeight: 120,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    messageInput: {
      flex: 1,

      minHeight: 92,

      padding: 0,

      fontSize:
        Typography.fontSize.md,

      lineHeight: 20,

      color:
        Colors.textPrimary,
    },

    messageFooter: {
      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,
    },

    messageHint: {
      flex: 1,

      color:
        Colors.textMuted,
    },

    messageCount: {
      flexShrink: 0,

      color:
        Colors.textMuted,
    },

    /* ========================================================
       HELP
    ======================================================== */

    helpBox: {
      marginTop:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.infoSoft,
    },

    helpText: {
      flex: 1,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       ACTIONS
    ======================================================== */

    actions: {
      paddingTop:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.background,
    },

    sendButton: {
      minHeight:
        FixxamTokens.size.buttonHeight,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    sendButtonDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    sendButtonText: {
      color:
        Colors.textInverse,
    },

    cancelButton: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.xs,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    cancelButtonText: {
      color:
        Colors.textSecondary,
    },

    /* ========================================================
       STATES
    ======================================================== */

    pressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },

    disabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },
  });