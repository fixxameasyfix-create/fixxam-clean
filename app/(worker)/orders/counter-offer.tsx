import React, {
  useCallback,
  useEffect,
  useMemo,
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
  Stack,
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import Toast from "react-native-toast-message";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  counterOffer as sendBookingCounterOffer,
} from "@/firebase/queries/bookings";

import {
  Colors,
  FixxamTokens,
  Typography,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Params = {
  orderId?:
    | string
    | string[];

  bookingId?:
    | string
    | string[];
};

type BookingDocument = {
  workerId?: unknown;

  status?: unknown;

  offerStatus?: unknown;

  counterOfferStatus?: unknown;

  counterOfferBy?: unknown;

  counterOfferAmount?: unknown;
};

/* ============================================================
   CONSTANTS
============================================================ */

const MAX_MESSAGE_LENGTH =
  300;

const MIN_MESSAGE_LENGTH =
  3;

const MAX_AMOUNT =
  100_000_000;

const QUICK_RATIOS =
  [
    1.05,
    1.1,
    1.15,
  ] as const;

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
    Array.isArray(
      value,
    )
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

function normalizeAmount(
  value: unknown,
): number | null {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    ) ||
    value <= 0
  ) {
    return null;
  }

  return value;
}

function normalizeCounterBy(
  value: unknown,
):
  | "customer"
  | "worker"
  | null {
  if (
    value === "customer" ||
    value === "worker"
  ) {
    return value;
  }

  return null;
}

function normalizeStatus(
  value: unknown,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  if (
    value ===
    "in_progress"
  ) {
    return "in-progress";
  }

  if (
    value ===
    "canceled"
  ) {
    return "cancelled";
  }

  return value.trim();
}

function formatAmount(
  value: number,
): string {
  const safeValue =
    Number.isFinite(
      value,
    )
      ? Math.max(
          0,
          Math.round(
            value,
          ),
        )
      : 0;

  return `₦${safeValue.toLocaleString(
    "en-NG",
  )}`;
}

/* ============================================================
   QUICK PRICE
============================================================ */

function getQuickStep(
  amount: number,
): number {
  if (
    amount <
    50_000
  ) {
    return 500;
  }

  if (
    amount <
    200_000
  ) {
    return 1_000;
  }

  if (
    amount <
    1_000_000
  ) {
    return 5_000;
  }

  if (
    amount <
    5_000_000
  ) {
    return 10_000;
  }

  return 50_000;
}

function roundUpToStep(
  value: number,
  step: number,
): number {
  return (
    Math.ceil(
      value / step,
    ) * step
  );
}

function buildQuickAmounts(
  currentAmount: number,
): number[] {
  if (
    !Number.isFinite(
      currentAmount,
    ) ||
    currentAmount <= 0
  ) {
    return [];
  }

  const step =
    getQuickStep(
      currentAmount,
    );

  const suggestions =
    QUICK_RATIOS.map(
      ratio =>
        roundUpToStep(
          currentAmount *
            ratio,
          step,
        ),
    );

  const unique =
    [
      ...new Set(
        suggestions,
      ),
    ].filter(
      amount =>
        amount >
          currentAmount &&
        amount <=
          MAX_AMOUNT,
    );

  let next =
    roundUpToStep(
      currentAmount +
        step,
      step,
    );

  while (
    unique.length <
      3 &&
    next <=
      MAX_AMOUNT
  ) {
    if (
      next >
        currentAmount &&
      !unique.includes(
        next,
      )
    ) {
      unique.push(
        next,
      );
    }

    next +=
      step;
  }

  return unique.slice(
    0,
    3,
  );
}

/* ============================================================
   TOAST
============================================================ */

function showError(
  title: string,
  message: string,
) {
  Toast.show({
    type:
      "error",

    text1:
      title,

    text2:
      message,
  });
}

function showSuccess(
  title: string,
  message: string,
) {
  Toast.show({
    type:
      "success",

    text1:
      title,

    text2:
      message,
  });
}

/* ============================================================
   SCREEN
============================================================ */

export default function WorkerCounterOfferScreen() {
  const params =
    useLocalSearchParams<Params>();

  const insets =
    useSafeAreaInsets();

  /* ==========================================================
     ORDER ID
  ========================================================== */

  const orderId =
    useMemo(() => {
      const directOrderId =
        getParamString(
          params.orderId,
        );

      if (
        directOrderId
      ) {
        return directOrderId;
      }

      return getParamString(
        params.bookingId,
      );
    }, [
      params.bookingId,
      params.orderId,
    ]);

  /* ==========================================================
     STATE
  ========================================================== */

  const [
    currentAmount,
    setCurrentAmount,
  ] =
    useState<number | null>(
      null,
    );

  const [
    amountText,
    setAmountText,
  ] =
    useState("");

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  /* ==========================================================
     SELECTED AMOUNT
  ========================================================== */

  const selectedAmount =
    useMemo(() => {
      const cleanAmount =
        amountText.replace(
          /[^\d]/g,
          "",
        );

      if (!cleanAmount) {
        return null;
      }

      const amount =
        Number(
          cleanAmount,
        );

      if (
        !Number.isFinite(
          amount,
        )
      ) {
        return null;
      }

      return amount;
    }, [
      amountText,
    ]);

  /* ==========================================================
     QUICK AMOUNTS
  ========================================================== */

  const quickAmounts =
    useMemo(
      () =>
        currentAmount
          ? buildQuickAmounts(
              currentAmount,
            )
          : [],
      [
        currentAmount,
      ],
    );

  /* ==========================================================
     VALIDATION
  ========================================================== */

  const sameAsCustomerOffer =
    selectedAmount !==
      null &&
    currentAmount !==
      null &&
    Math.round(
      selectedAmount,
    ) ===
      Math.round(
        currentAmount,
      );

  const amountValid =
    selectedAmount !==
      null &&
    Number.isInteger(
      selectedAmount,
    ) &&
    selectedAmount >
      0 &&
    selectedAmount <=
      MAX_AMOUNT &&
    !sameAsCustomerOffer;

  const cleanMessage =
    message.trim();

  const messageValid =
    cleanMessage.length ===
      0 ||
    (
      cleanMessage.length >=
        MIN_MESSAGE_LENGTH &&
      cleanMessage.length <=
        MAX_MESSAGE_LENGTH
    );

  const canSubmit =
    amountValid &&
    messageValid &&
    !submitting;

  /* ==========================================================
     LIVE ACTIVE CUSTOMER OFFER
  ========================================================== */

  useEffect(() => {
    const workerId =
      auth.currentUser
        ?.uid
        ?.trim();

    if (
      !workerId
    ) {
      setCurrentAmount(
        null,
      );

      setLoading(
        false,
      );

      setError(
        "Please sign in again to continue.",
      );

      return;
    }

    if (
      !orderId
    ) {
      setCurrentAmount(
        null,
      );

      setLoading(
        false,
      );

      setError(
        "Order information is missing.",
      );

      return;
    }

    setLoading(
      true,
    );

    setError(
      "",
    );

    const bookingRef =
      doc(
        db,
        "bookings",
        orderId,
      );

    const unsubscribe =
      onSnapshot(
        bookingRef,

        snapshot => {
          if (
            !snapshot.exists()
          ) {
            setCurrentAmount(
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

          const data =
            snapshot.data() as BookingDocument;

          /* ================================================
             ACCESS
          ================================================= */

          const bookingWorkerId =
            typeof data.workerId ===
              "string"
              ? data.workerId.trim()
              : "";

          if (
            !bookingWorkerId ||
            bookingWorkerId !==
              workerId
          ) {
            setCurrentAmount(
              null,
            );

            setLoading(
              false,
            );

            setError(
              "You do not have permission to negotiate this order.",
            );

            return;
          }

          /* ================================================
             BOOKING STATUS
          ================================================= */

          if (
            normalizeStatus(
              data.status,
            ) !==
            "pending"
          ) {
            setCurrentAmount(
              null,
            );

            setLoading(
              false,
            );

            setError(
              "This order is no longer open for negotiation.",
            );

            return;
          }

          /* ================================================
             ORIGINAL OFFER MUST REMAIN ACTIVE
          ================================================= */

          if (
            data.offerStatus !==
            "sent"
          ) {
            setCurrentAmount(
              null,
            );

            setLoading(
              false,
            );

            setError(
              "This negotiation is no longer available.",
            );

            return;
          }

          /* ================================================
             COUNTER STATE
          ================================================= */

          const counterStatus =
            typeof data.counterOfferStatus ===
              "string"
              ? data.counterOfferStatus
              : "none";

          const counterBy =
            normalizeCounterBy(
              data.counterOfferBy,
            );

          /* ================================================
             ACTIVE COUNTER REQUIRED

             Worker can only counter an
             active CUSTOMER offer.
          ================================================= */

          if (
            counterStatus !==
              "sent"
          ) {
            setCurrentAmount(
              null,
            );

            setLoading(
              false,
            );

            setError(
              "There is no active customer counter offer.",
            );

            return;
          }

          /* ================================================
             WORKER'S OWN COUNTER IS WAITING
          ================================================= */

          if (
            counterBy ===
            "worker"
          ) {
            setCurrentAmount(
              null,
            );

            setLoading(
              false,
            );

            setError(
              "Your counter offer is waiting for the customer.",
            );

            return;
          }

          /* ================================================
             MUST BE CUSTOMER'S COUNTER
          ================================================= */

          if (
            counterBy !==
            "customer"
          ) {
            setCurrentAmount(
              null,
            );

            setLoading(
              false,
            );

            setError(
              "This negotiation has an invalid offer state.",
            );

            return;
          }

          /* ================================================
             CUSTOMER PRICE
          ================================================= */

          const customerOffer =
            normalizeAmount(
              data.counterOfferAmount,
            );

          if (
            customerOffer ===
            null
          ) {
            setCurrentAmount(
              null,
            );

            setLoading(
              false,
            );

            setError(
              "The customer offer amount is unavailable.",
            );

            return;
          }

          setCurrentAmount(
            customerOffer,
          );

          setLoading(
            false,
          );

          setError(
            "",
          );
        },

        listenerError => {
          if (
            __DEV__
          ) {
            console.warn(
              "WORKER_COUNTER_OFFER_LISTENER_ERROR",
              listenerError,
            );
          }

          setCurrentAmount(
            null,
          );

          setLoading(
            false,
          );

          setError(
            "Unable to load the customer offer.",
          );
        },
      );

    return unsubscribe;
  }, [
    orderId,
  ]);

  /* ==========================================================
     AMOUNT
  ========================================================== */

  const handleAmountChange =
    useCallback(
      (
        value: string,
      ) => {
        const digits =
          value.replace(
            /[^\d]/g,
            "",
          );

        setAmountText(
          digits.slice(
            0,
            String(
              MAX_AMOUNT,
            ).length,
          ),
        );
      },
      [],
    );

  const handleQuickAmount =
    useCallback(
      (
        amount: number,
      ) => {
        if (
          submitting
        ) {
          return;
        }

        setAmountText(
          String(
            amount,
          ),
        );
      },
      [
        submitting,
      ],
    );

  const handleMessageChange =
    useCallback(
      (
        value: string,
      ) => {
        setMessage(
          value.slice(
            0,
            MAX_MESSAGE_LENGTH,
          ),
        );
      },
      [],
    );

  /* ==========================================================
     BACK
  ========================================================== */

  const handleBack =
    useCallback(() => {
      if (
        submitting
      ) {
        return;
      }

      router.back();
    }, [
      submitting,
    ]);

  /* ==========================================================
     SUBMIT
  ========================================================== */

  const handleSubmit =
    useCallback(
      async () => {
        if (
          submitting
        ) {
          return;
        }

        const workerId =
          auth.currentUser
            ?.uid
            ?.trim();

        if (
          !workerId
        ) {
          showError(
            "Sign in required",
            "Please sign in before sending a counter offer.",
          );

          return;
        }

        if (
          !orderId
        ) {
          showError(
            "Order unavailable",
            "This order could not be identified.",
          );

          return;
        }

        const amount =
          selectedAmount;

        if (
          amount === null ||
          !Number.isInteger(
            amount,
          ) ||
          amount <= 0
        ) {
          showError(
            "Choose an amount",
            "Select a quick price or enter your own price.",
          );

          return;
        }

        if (
          amount >
          MAX_AMOUNT
        ) {
          showError(
            "Invalid amount",
            `Please enter an amount no higher than ${formatAmount(
              MAX_AMOUNT,
            )}.`,
          );

          return;
        }

        if (
          currentAmount !==
            null &&
          Math.round(
            amount,
          ) ===
            Math.round(
              currentAmount,
            )
        ) {
          showError(
            "Same amount",
            "Your counter offer must be different from the customer's offer.",
          );

          return;
        }

        const cleanCounterMessage =
          message.trim();

        if (
          cleanCounterMessage.length >
          MAX_MESSAGE_LENGTH
        ) {
          showError(
            "Message too long",
            `Your message cannot be more than ${MAX_MESSAGE_LENGTH} characters.`,
          );

          return;
        }

        if (
          cleanCounterMessage.length >
            0 &&
          cleanCounterMessage.length <
            MIN_MESSAGE_LENGTH
        ) {
          showError(
            "Message too short",
            `Enter at least ${MIN_MESSAGE_LENGTH} characters or leave the message empty.`,
          );

          return;
        }

        setSubmitting(
          true,
        );

        try {
          await sendBookingCounterOffer(
            orderId,
            amount,
            cleanCounterMessage,
            "worker",
          );

          showSuccess(
            "Counter offer sent",
            `${formatAmount(
              amount,
            )} has been sent to the customer.`,
          );

          router.replace({
            pathname:
              "/(worker)/orders/[orderId]",

            params: {
              orderId,
            },
          } as never);
        } catch (
          submitError
        ) {
          if (
            __DEV__
          ) {
            console.warn(
              "WORKER_SEND_COUNTER_OFFER_FAILED",
              submitError,
            );
          }

          const errorMessage =
            submitError instanceof
            Error
              ? submitError.message
              : "";

          const firebaseCode =
            (
              submitError as {
                code?: string;
              }
            )?.code;

          if (
            firebaseCode ===
              "permission-denied" ||
            firebaseCode ===
              "firestore/permission-denied"
          ) {
            showError(
              "Permission denied",
              "You are not allowed to send this counter offer.",
            );

            return;
          }

          const normalizedError =
            errorMessage.toLowerCase();

          if (
            normalizedError.includes(
              "must be different",
            )
          ) {
            showError(
              "Same amount",
              "Your counter offer must be different from the customer's offer.",
            );

            return;
          }

          if (
            normalizedError.includes(
              "still waiting for the customer",
            )
          ) {
            showError(
              "Waiting for customer",
              "Your current counter offer is already waiting for the customer.",
            );

            return;
          }

          if (
            normalizedError.includes(
              "not found",
            )
          ) {
            showError(
              "Order not found",
              "This order no longer exists.",
            );

            return;
          }

          if (
            normalizedError.includes(
              "no longer available",
            ) ||
            normalizedError.includes(
              "no longer open",
            )
          ) {
            showError(
              "Offer unavailable",
              "This order is no longer available for negotiation.",
            );

            return;
          }

          if (
            normalizedError.includes(
              "active customer counter",
            )
          ) {
            showError(
              "Offer changed",
              "The customer's counter offer is no longer available.",
            );

            return;
          }

          showError(
            "Unable to send",
            errorMessage ||
              "We could not send your counter offer. Please try again.",
          );
        } finally {
          setSubmitting(
            false,
          );
        }
      },
      [
        currentAmount,
        message,
        orderId,
        selectedAmount,
        submitting,
      ],
    );

  /* ==========================================================
     LOADING
  ========================================================== */

  if (
    loading
  ) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown:
              false,
          }}
        />

        <View
          style={
            styles.screen
          }
        >
          <View
            style={
              styles.centerState
            }
          >
            <ActivityIndicator
              size="small"
              color={
                WorkerColors.primary
              }
            />

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.stateText
              }
            >
              Loading offer...
            </AppText>
          </View>
        </View>
      </>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (
    error ||
    !currentAmount
  ) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown:
              false,
          }}
        />

        <View
          style={[
            styles.screen,

            {
              paddingTop:
                insets.top,
            },
          ]}
        >
          <View
            style={
              styles.simpleHeader
            }
          >
            <Pressable
              onPress={
                handleBack
              }
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={
                styles.headerButton
              }
            >
              <AppIcon
                name="back"
                size="md"
                color={
                  Colors.textPrimary
                }
              />
            </Pressable>
          </View>

          <View
            style={
              styles.centerState
            }
          >
            <View
              style={
                styles.errorIcon
              }
            >
              <AppIcon
                name="error"
                size="lg"
                color={
                  Colors.error
                }
              />
            </View>

            <AppText
              variant="heading3"
              weight="bold"
              center
              style={
                styles.stateTitle
              }
            >
              Counter unavailable
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              center
              style={
                styles.stateText
              }
            >
              {error ||
                "This offer is no longer available."}
            </AppText>
          </View>
        </View>
      </>
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      <Stack.Screen
        options={{
          headerShown:
            false,
        }}
      />

      <KeyboardAvoidingView
        behavior={
          Platform.OS ===
          "ios"
            ? "padding"
            : "height"
        }
        style={
          styles.screen
        }
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <View
          style={[
            styles.header,

            {
              paddingTop:
                Math.max(
                  insets.top,
                  FixxamTokens.spacing.sm,
                ),
            },
          ]}
        >
          <Pressable
            onPress={
              handleBack
            }
            disabled={
              submitting
            }
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({
              pressed,
            }) => [
              styles.headerButton,

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
              styles.headerText
            }
          >
            <AppText
              variant="heading3"
              weight="bold"
              style={
                styles.headerTitle
              }
            >
              Counter offer
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.headerSubtitle
              }
            >
              Choose a new price for this job
            </AppText>
          </View>
        </View>

        {/* ====================================================
            CONTENT
        ==================================================== */}

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS ===
            "ios"
              ? "interactive"
              : "on-drag"
          }
          contentContainerStyle={
            styles.content
          }
        >
          {/* ==================================================
              CUSTOMER OFFER
          ================================================== */}

          <View
            style={
              styles.currentOffer
            }
          >
            <View
              style={
                styles.currentOfferContent
              }
            >
              <AppText
                variant="caption"
                tone="secondary"
              >
                Customer offer
              </AppText>

              <AppText
                variant="heading2"
                weight="bold"
                style={
                  styles.currentOfferAmount
                }
              >
                {formatAmount(
                  currentAmount,
                )}
              </AppText>
            </View>

            <View
              style={
                styles.offerIcon
              }
            >
              <AppIcon
                name="wallet"
                role="worker"
                size="md"
                color={
                  WorkerColors.primary
                }
              />
            </View>
          </View>

          {/* ==================================================
              QUICK PRICE
          ================================================== */}

          <AppText
            variant="bodyMedium"
            weight="semibold"
            style={
              styles.sectionTitle
            }
          >
            Quick price
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.sectionSubtitle
            }
          >
            Tap one or enter your own price.
          </AppText>

          <View
            style={
              styles.quickAmounts
            }
          >
            {quickAmounts.map(
              amount => {
                const selected =
                  selectedAmount ===
                  amount;

                return (
                  <Pressable
                    key={
                      amount
                    }
                    onPress={() =>
                      handleQuickAmount(
                        amount,
                      )
                    }
                    disabled={
                      submitting
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Choose ${formatAmount(
                      amount,
                    )}`}
                    accessibilityState={{
                      selected,

                      disabled:
                        submitting,
                    }}
                    style={({
                      pressed,
                    }) => [
                      styles.quickAmount,

                      selected
                        ? styles.quickAmountSelected
                        : null,

                      pressed &&
                      !submitting
                        ? styles.pressed
                        : null,
                    ]}
                  >
                    {selected ? (
                      <AppIcon
                        name="check"
                        size="xs"
                        color={
                          Colors.textInverse
                        }
                      />
                    ) : null}

                    <AppText
                      variant="bodyMedium"
                      weight="semibold"
                      numberOfLines={1}
                      style={
                        selected
                          ? styles.quickAmountTextSelected
                          : styles.quickAmountText
                      }
                    >
                      {formatAmount(
                        amount,
                      )}
                    </AppText>
                  </Pressable>
                );
              },
            )}
          </View>

          {/* ==================================================
              CUSTOM AMOUNT
          ================================================== */}

          <AppText
            variant="bodyMedium"
            weight="semibold"
            style={
              styles.customTitle
            }
          >
            Or enter your price
          </AppText>

          <View
            style={[
              styles.amountInputContainer,

              sameAsCustomerOffer
                ? styles.amountInputError
                : null,
            ]}
          >
            <AppText
              variant="bodyLarge"
              weight="bold"
              style={
                styles.currency
              }
            >
              ₦
            </AppText>

            <TextInput
              value={
                amountText
              }
              onChangeText={
                handleAmountChange
              }
              keyboardType="number-pad"
              inputMode="numeric"
              placeholder="Enter amount"
              placeholderTextColor={
                Colors.textMuted
              }
              selectionColor={
                WorkerColors.primary
              }
              cursorColor={
                WorkerColors.primary
              }
              editable={
                !submitting
              }
              maxLength={
                String(
                  MAX_AMOUNT,
                ).length
              }
              accessibilityLabel="Counter offer amount"
              style={
                styles.amountInput
              }
            />
          </View>

          {sameAsCustomerOffer ? (
            <AppText
              variant="caption"
              style={
                styles.validationError
              }
            >
              Choose a price different from{" "}
              {formatAmount(
                currentAmount,
              )}.
            </AppText>
          ) : (
            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.amountHint
              }
            >
              Customer offered{" "}
              {formatAmount(
                currentAmount,
              )}.
            </AppText>
          )}

          {/* ==================================================
              MESSAGE
          ================================================== */}

          <View
            style={
              styles.messageHeader
            }
          >
            <View>
              <AppText
                variant="bodyMedium"
                weight="semibold"
              >
                Short note
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.optionalText
                }
              >
                Optional
              </AppText>
            </View>

            <AppText
              variant="caption"
              tone="muted"
            >
              {message.length}/
              {MAX_MESSAGE_LENGTH}
            </AppText>
          </View>

          <TextInput
            value={
              message
            }
            onChangeText={
              handleMessageChange
            }
            multiline
            maxLength={
              MAX_MESSAGE_LENGTH
            }
            editable={
              !submitting
            }
            textAlignVertical="top"
            selectionColor={
              WorkerColors.primary
            }
            cursorColor={
              WorkerColors.primary
            }
            placeholder="Example: This includes labour and installation."
            placeholderTextColor={
              Colors.textMuted
            }
            accessibilityLabel="Counter offer note"
            style={
              styles.messageInput
            }
          />

          {/* ==================================================
              INFO
          ================================================== */}

          <View
            style={
              styles.infoRow
            }
          >
            <View
              style={
                styles.infoIcon
              }
            >
              <AppIcon
                name="info"
                role="worker"
                size="xs"
                color={
                  WorkerColors.primary
                }
              />
            </View>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.infoText
              }
            >
              The customer can accept, decline, or send another counter offer.
            </AppText>
          </View>
        </ScrollView>

        {/* ====================================================
            SUBMIT
        ==================================================== */}

        <View
          style={[
            styles.footer,

            {
              paddingBottom:
                Math.max(
                  insets.bottom,
                  FixxamTokens.spacing.md,
                ),
            },
          ]}
        >
          <Pressable
            onPress={() => {
              void handleSubmit();
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
              styles.submitButton,

              !canSubmit
                ? styles.disabled
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
              <>
                <AppIcon
                  name="refresh"
                  role="worker"
                  size="sm"
                  color={
                    Colors.textInverse
                  }
                />

                <AppText
                  variant="bodyMedium"
                  weight="semibold"
                  numberOfLines={1}
                  style={
                    styles.submitText
                  }
                >
                  {selectedAmount &&
                  amountValid
                    ? `Send ${formatAmount(
                        selectedAmount,
                      )}`
                    : "Send counter offer"}
                </AppText>
              </>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,

      backgroundColor:
        Colors.background,
    },

    header: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,

      backgroundColor:
        Colors.surface,
    },

    simpleHeader: {
      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.sm,
    },

    headerButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,
    },

    headerText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    headerTitle: {
      color:
        Colors.textPrimary,
    },

    headerSubtitle: {
      marginTop: 2,
    },

    content: {
      padding:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.xxl,
    },

    currentOffer: {
      minHeight: 92,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    currentOfferContent: {
      flex: 1,

      minWidth: 0,
    },

    currentOfferAmount: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        WorkerColors.primary,
    },

    offerIcon: {
      width: 48,

      height: 48,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    sectionTitle: {
      marginTop:
        FixxamTokens.spacing.xl,

      color:
        Colors.textPrimary,
    },

    sectionSubtitle: {
      marginTop: 2,
    },

    quickAmounts: {
      marginTop:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      gap:
        FixxamTokens.spacing.sm,
    },

    quickAmount: {
      flex: 1,

      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 4,

      borderWidth: 1,

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    quickAmountSelected: {
      backgroundColor:
        WorkerColors.primary,
    },

    quickAmountText: {
      color:
        WorkerColors.primary,
    },

    quickAmountTextSelected: {
      color:
        Colors.textInverse,
    },

    customTitle: {
      marginTop:
        FixxamTokens.spacing.xl,

      marginBottom:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    amountInputContainer: {
      minHeight:
        FixxamTokens.size.inputHeight,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.input,

      backgroundColor:
        Colors.surface,
    },

    amountInputError: {
      borderColor:
        Colors.error,
    },

    currency: {
      marginRight:
        FixxamTokens.spacing.xs,

      color:
        WorkerColors.primary,
    },

    amountInput: {
      flex: 1,

      minHeight:
        FixxamTokens.size.inputHeight,

      paddingVertical: 0,

      fontSize:
        Typography.fontSize.md,

      fontWeight:
        "700",

      color:
        Colors.textPrimary,
    },

    amountHint: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textMuted,
    },

    validationError: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.error,
    },

    messageHeader: {
      marginTop:
        FixxamTokens.spacing.xl,

      marginBottom:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    optionalText: {
      marginTop: 2,
    },

    messageInput: {
      minHeight: 100,

      maxHeight: 140,

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.input,

      backgroundColor:
        Colors.surface,

      fontSize:
        Typography.fontSize.md,

      lineHeight: 21,

      color:
        Colors.textPrimary,
    },

    infoRow: {
      marginTop:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "flex-start",
    },

    infoIcon: {
      width: 26,

      height: 26,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    infoText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      lineHeight: 18,
    },

    footer: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      borderTopWidth:
        StyleSheet.hairlineWidth,

      borderTopColor:
        Colors.divider,

      backgroundColor:
        Colors.surface,
    },

    submitButton: {
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
        WorkerColors.primary,
    },

    submitText: {
      color:
        Colors.textInverse,
    },

    centerState: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    errorIcon: {
      width: 64,

      height: 64,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.errorSoft,
    },

    stateTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    stateText: {
      maxWidth: 320,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    disabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

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
  });