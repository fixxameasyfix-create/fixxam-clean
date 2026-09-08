import React, {
  memo,
} from "react";

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  Typography,
  WorkerColors,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  visible: boolean;

  customerOfferAmount?: number | null;

  amount: string;

  message: string;

  submitting?: boolean;

  onAmountChange: (
    value: string,
  ) => void;

  onMessageChange: (
    value: string,
  ) => void;

  onClose: () => void;

  onSubmit: () => void;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const MAX_MESSAGE_LENGTH = 300;

/* ==============================================================
   HELPERS
============================================================== */

function formatAmount(
  value?: number | null,
): string {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return "—";
  }

  return `₦${value.toLocaleString(
    "en-NG",
  )}`;
}

/* ==============================================================
   COMPONENT
============================================================== */

const WorkerCounterOfferModal =
  memo(
    function WorkerCounterOfferModal({
      visible,
      customerOfferAmount,
      amount,
      message,
      submitting = false,
      onAmountChange,
      onMessageChange,
      onClose,
      onSubmit,
    }: Props) {
      const insets =
        useSafeAreaInsets();

      const formattedCustomerOffer =
        formatAmount(
          customerOfferAmount,
        );

      const characterCount =
        Math.min(
          message.length,
          MAX_MESSAGE_LENGTH,
        );

      return (
        <Modal
          visible={visible}
          transparent
          animationType="slide"
          statusBarTranslucent
          onRequestClose={
            submitting
              ? undefined
              : onClose
          }
        >
          <KeyboardAvoidingView
            style={
              styles.modalOverlay
            }
            behavior={
              Platform.OS === "ios"
                ? "padding"
                : undefined
            }
          >
            <View
              accessibilityViewIsModal
              style={[
                styles.counterModal,
                {
                  paddingBottom:
                    Math.max(
                      insets.bottom,
                      FixxamTokens
                        .spacing.lg,
                    ),
                },
              ]}
            >
              {/* ==================================================
                  HANDLE
              ================================================== */}

              <View
                style={
                  styles.modalHandle
                }
              />

              {/* ==================================================
                  HEADER
              ================================================== */}

              <View
                style={
                  styles.modalHeader
                }
              >
                <View
                  style={
                    styles.modalHeaderIcon
                  }
                >
                  <AppIcon
                    name="refresh"
                    role="worker"
                    size="md"
                    color={
                      WorkerColors.primary
                    }
                  />
                </View>

                <View
                  style={
                    styles.modalHeaderContent
                  }
                >
                  <AppText
                    variant="bodyLarge"
                    weight="bold"
                    style={
                      styles.modalTitle
                    }
                  >
                    Send Counter Offer
                  </AppText>

                  <AppText
                    variant="caption"
                    tone="secondary"
                    style={
                      styles.modalSubtitle
                    }
                  >
                    Send a new price to the customer.
                  </AppText>
                </View>
              </View>

              {/* ==================================================
                  CUSTOMER OFFER
              ================================================== */}

              <View
                style={
                  styles.customerOfferReference
                }
              >
                <AppText
                  variant="caption"
                  tone="muted"
                  weight="semibold"
                  style={
                    styles.referenceLabel
                  }
                >
                  CUSTOMER OFFER
                </AppText>

                <AppText
                  variant="heading2"
                  weight="bold"
                  style={
                    styles.referenceAmount
                  }
                >
                  {formattedCustomerOffer}
                </AppText>
              </View>

              {/* ==================================================
                  AMOUNT LABEL
              ================================================== */}

              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.inputLabel
                }
              >
                YOUR NEW OFFER
              </AppText>

              {/* ==================================================
                  AMOUNT INPUT
              ================================================== */}

              <View
                style={
                  styles.amountInputContainer
                }
              >
                <AppText
                  variant="bodyLarge"
                  weight="bold"
                  style={
                    styles.currencySymbol
                  }
                >
                  ₦
                </AppText>

                <TextInput
                  value={amount}
                  onChangeText={
                    onAmountChange
                  }
                  placeholder="Enter amount"
                  placeholderTextColor={
                    Colors.textMuted
                  }
                  keyboardType="decimal-pad"
                  editable={
                    !submitting
                  }
                  maxLength={12}
                  autoCorrect={false}
                  returnKeyType="done"
                  accessibilityLabel="New counter offer amount"
                  style={
                    styles.amountInput
                  }
                />
              </View>

              {/* ==================================================
                  MESSAGE LABEL
              ================================================== */}

              <View
                style={
                  styles.messageLabelRow
                }
              >
                <AppText
                  variant="caption"
                  weight="bold"
                  style={
                    styles.messageLabel
                  }
                >
                  MESSAGE
                </AppText>

                <AppText
                  variant="caption"
                  tone="muted"
                >
                  {characterCount}/
                  {MAX_MESSAGE_LENGTH}
                </AppText>
              </View>

              {/* ==================================================
                  MESSAGE INPUT
              ================================================== */}

              <TextInput
                value={message}
                onChangeText={
                  onMessageChange
                }
                placeholder="Explain your new offer..."
                placeholderTextColor={
                  Colors.textMuted
                }
                multiline
                textAlignVertical="top"
                editable={
                  !submitting
                }
                maxLength={
                  MAX_MESSAGE_LENGTH
                }
                autoCorrect
                accessibilityLabel="Counter offer message"
                style={
                  styles.messageInput
                }
              />

              {/* ==================================================
                  ACTIONS
              ================================================== */}

              <View
                style={
                  styles.modalActions
                }
              >
                <Pressable
                  onPress={onClose}
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
                    styles.modalCancelButton,

                    submitting
                      ? styles.disabledButton
                      : null,

                    pressed &&
                    !submitting
                      ? styles.buttonPressed
                      : null,
                  ]}
                >
                  <AppText
                    variant="caption"
                    weight="bold"
                    style={
                      styles.modalCancelText
                    }
                  >
                    CANCEL
                  </AppText>
                </Pressable>

                <Pressable
                  onPress={onSubmit}
                  disabled={
                    submitting
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Send counter offer"
                  accessibilityState={{
                    disabled:
                      submitting,
                    busy:
                      submitting,
                  }}
                  style={({
                    pressed,
                  }) => [
                    styles.modalSendButton,

                    submitting
                      ? styles.disabledButton
                      : null,

                    pressed &&
                    !submitting
                      ? styles.buttonPressed
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
                        name="next"
                        size="xs"
                        color={
                          Colors.textInverse
                        }
                      />

                      <AppText
                        variant="caption"
                        weight="bold"
                        style={
                          styles.modalSendText
                        }
                      >
                        SEND OFFER
                      </AppText>
                    </>
                  )}
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      );
    },
  );

WorkerCounterOfferModal.displayName =
  "WorkerCounterOfferModal";

export default WorkerCounterOfferModal;

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       OVERLAY
    ======================================================== */

    modalOverlay: {
      flex: 1,

      justifyContent:
        "flex-end",

      backgroundColor:
        Colors.overlayMedium,
    },

    /* ========================================================
       MODAL
    ======================================================== */

    counterModal: {
      width: "100%",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      borderTopLeftRadius:
        FixxamTokens.radius.xl,

      borderTopRightRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    modalHandle: {
      width: 42,

      height: 4,

      alignSelf: "center",

      marginBottom:
        FixxamTokens.spacing.lg,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabled,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    modalHeader: {
      flexDirection: "row",

      alignItems: "center",
    },

    modalHeaderIcon: {
      width:
        FixxamTokens.size
          .iconBox,

      height:
        FixxamTokens.size
          .iconBox,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    modalHeaderContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    modalTitle: {
      color:
        Colors.textPrimary,
    },

    modalSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 16,
    },

    /* ========================================================
       CUSTOMER OFFER
    ======================================================== */

    customerOfferReference: {
      marginTop:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.md,

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.background,
    },

    referenceLabel: {
      letterSpacing: 1,
    },

    referenceAmount: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        WorkerColors.primary,
    },

    /* ========================================================
       INPUTS
    ======================================================== */

    inputLabel: {
      marginTop:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.xs,

      letterSpacing: 0.8,

      color:
        Colors.textSecondary,
    },

    amountInputContainer: {
      height:
        FixxamTokens.size
          .inputHeight,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.input,

      backgroundColor:
        Colors.background,
    },

    currencySymbol: {
      marginRight:
        FixxamTokens.spacing.xs,

      color:
        WorkerColors.primary,
    },

    amountInput: {
      flex: 1,

      height: "100%",

      paddingVertical: 0,

      fontSize:
        Typography.fontSize.md,

      fontWeight: "700",

      color:
        Colors.textPrimary,
    },

    messageLabelRow: {
      marginTop:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.xs,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",
    },

    messageLabel: {
      letterSpacing: 0.8,

      color:
        Colors.textSecondary,
    },

    messageInput: {
      minHeight: 96,

      maxHeight: 150,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.input,

      backgroundColor:
        Colors.background,

      fontSize:
        Typography.fontSize.md,

      lineHeight: 20,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       ACTIONS
    ======================================================== */

    modalActions: {
      marginTop:
        FixxamTokens.spacing.lg,

      flexDirection: "row",

      gap:
        FixxamTokens.spacing.sm,
    },

    modalCancelButton: {
      flex: 1,

      minHeight:
        FixxamTokens.size
          .buttonHeight,

      alignItems: "center",

      justifyContent: "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        Colors.surface,
    },

    modalCancelText: {
      color:
        Colors.textSecondary,
    },

    modalSendButton: {
      flex: 1.4,

      minHeight:
        FixxamTokens.size
          .buttonHeight,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        WorkerColors.primary,
    },

    modalSendText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       STATES
    ======================================================== */

    disabledButton: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    buttonPressed: {
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