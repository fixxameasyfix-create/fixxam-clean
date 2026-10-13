import React, {
  memo,
  useCallback,
  useState,
} from "react";

import {
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
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

type FocusedField =
  | "amount"
  | "message"
  | null;

type Props = {
  amount: string;

  message: string;

  amountValid: boolean;

  messageValid: boolean;

  submitting: boolean;

  cleanMessageLength: number;

  maxAmount: number;

  minMessageLength: number;

  maxMessageLength: number;

  onAmountChange: (
    value: string,
  ) => void;

  onMessageChange: (
    value: string,
  ) => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function MakeOfferFormSections({
  amount,
  message,
  amountValid,
  messageValid,
  submitting,
  cleanMessageLength,
  maxAmount,
  minMessageLength,
  maxMessageLength,
  onAmountChange,
  onMessageChange,
}: Props) {
  const [
    focusedField,
    setFocusedField,
  ] =
    useState<FocusedField>(
      null,
    );

  /* ============================================================
     STATE
  ============================================================ */

  const hasAmount =
    amount.length > 0;

  const hasMessage =
    message.length > 0;

  const amountHasError =
    hasAmount &&
    !amountValid;

  const messageHasError =
    hasMessage &&
    !messageValid;

  /* ============================================================
     FOCUS
  ============================================================ */

  const handleAmountFocus =
    useCallback(() => {
      setFocusedField(
        "amount",
      );
    }, []);

  const handleAmountBlur =
    useCallback(() => {
      setFocusedField(
        current =>
          current === "amount"
            ? null
            : current,
      );
    }, []);

  const handleMessageFocus =
    useCallback(() => {
      setFocusedField(
        "message",
      );
    }, []);

  const handleMessageBlur =
    useCallback(() => {
      setFocusedField(
        current =>
          current === "message"
            ? null
            : current,
      );
    }, []);

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ========================================================
          PRICE
      ======================================================== */}

      <View
        style={
          styles.section
        }
      >
        <View
          style={
            styles.labelRow
          }
        >
          <View
            style={
              styles.labelContent
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.label
              }
            >
              Your price
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.helper
              }
            >
              Total amount for this job
            </AppText>
          </View>

          <View
            style={
              styles.requiredBadge
            }
          >
            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.required
              }
            >
              Required
            </AppText>
          </View>
        </View>

        <View
          style={[
            styles.amountField,

            focusedField ===
              "amount"
              ? styles.fieldFocused
              : null,

            amountHasError
              ? styles.fieldError
              : null,

            submitting
              ? styles.fieldDisabled
              : null,
          ]}
        >
          <AppText
            weight="bold"
            style={
              styles.currency
            }
          >
            ₦
          </AppText>

          <TextInput
            value={
              amount
            }
            onChangeText={
              onAmountChange
            }
            onFocus={
              handleAmountFocus
            }
            onBlur={
              handleAmountBlur
            }
            placeholder="0"
            placeholderTextColor={
              Colors.textMuted
            }
            selectionColor={
              WorkerColors.primary
            }
            cursorColor={
              WorkerColors.primary
            }
            keyboardType="number-pad"
            inputMode="numeric"
            returnKeyType="done"
            editable={
              !submitting
            }
            maxLength={9}
            accessibilityLabel="Your offer price"
            accessibilityHint="Enter the total amount you want to charge for this job"
            style={
              styles.amountInput
            }
          />
        </View>

        {amountHasError ? (
          <AppText
            variant="caption"
            style={
              styles.errorText
            }
          >
            Enter an amount from ₦1 to ₦
            {maxAmount.toLocaleString(
              "en-NG",
            )}
          </AppText>
        ) : (
          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.fieldHint
            }
          >
            Customer sees this price before accepting.
          </AppText>
        )}
      </View>

      {/* ========================================================
          DIVIDER
      ======================================================== */}

      <View
        style={
          styles.divider
        }
      />

      {/* ========================================================
          MESSAGE
      ======================================================== */}

      <View
        style={
          styles.section
        }
      >
        <View
          style={
            styles.labelRow
          }
        >
          <View
            style={
              styles.labelContent
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.label
              }
            >
              Short note
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.helper
              }
            >
              Tell the customer what your price includes
            </AppText>
          </View>

          <View
            style={
              styles.requiredBadge
            }
          >
            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.required
              }
            >
              Required
            </AppText>
          </View>
        </View>

        <TextInput
          value={
            message
          }
          onChangeText={
            onMessageChange
          }
          onFocus={
            handleMessageFocus
          }
          onBlur={
            handleMessageBlur
          }
          placeholder="e.g. Labour, inspection and installation"
          placeholderTextColor={
            Colors.textMuted
          }
          selectionColor={
            WorkerColors.primary
          }
          cursorColor={
            WorkerColors.primary
          }
          multiline
          textAlignVertical="top"
          editable={
            !submitting
          }
          maxLength={
            maxMessageLength
          }
          accessibilityLabel="Message to customer"
          accessibilityHint="Briefly explain what your offer includes"
          style={[
            styles.messageInput,

            focusedField ===
              "message"
              ? styles.fieldFocused
              : null,

            messageHasError
              ? styles.fieldError
              : null,

            submitting
              ? styles.fieldDisabled
              : null,
          ]}
        />

        <View
          style={
            styles.messageFooter
          }
        >
          <View
            style={
              styles.messageFooterText
            }
          >
            {messageHasError &&
            cleanMessageLength <
              minMessageLength ? (
              <AppText
                variant="caption"
                style={
                  styles.errorTextInline
                }
              >
                Add at least{" "}
                {minMessageLength} characters
              </AppText>
            ) : (
              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.fieldHintInline
                }
              >
                Keep it simple and clear.
              </AppText>
            )}
          </View>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.characterCount
            }
          >
            {message.length}/
            {maxMessageLength}
          </AppText>
        </View>
      </View>
    </View>
  );
}

/* ==============================================================
   MEMO
============================================================== */

MakeOfferFormSections.displayName =
  "MakeOfferFormSections";

export default memo(
  MakeOfferFormSections,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ==========================================================
       CONTAINER
    ========================================================== */

    container: {
      width:
        "100%",

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,

      overflow:
        "hidden",
    },

    section: {
      width:
        "100%",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.sm,
    },

    divider: {
      height:
        StyleSheet.hairlineWidth,

      marginHorizontal:
        FixxamTokens.spacing.sm,

      backgroundColor:
        Colors.divider,
    },

    /* ==========================================================
       LABEL
    ========================================================== */

    labelRow: {
      width:
        "100%",

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,
    },

    labelContent: {
      flex:
        1,

      minWidth:
        0,
    },

    label: {
      color:
        Colors.textPrimary,
    },

    helper: {
      marginTop:
        1,

      lineHeight:
        16,

      color:
        Colors.textSecondary,
    },

    requiredBadge: {
      flexShrink:
        0,

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      paddingVertical:
        2,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    required: {
      fontSize:
        10,

      color:
        WorkerColors.primary,
    },

    /* ==========================================================
       AMOUNT
    ========================================================== */

    amountField: {
      width:
        "100%",

      minHeight:
        54,

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.input,

      backgroundColor:
        Colors.background,
    },

    currency: {
      flexShrink:
        0,

      fontSize:
        24,

      lineHeight:
        28,

      color:
        WorkerColors.primary,
    },

    amountInput: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.xs,

      paddingVertical:
        0,

      fontSize:
        26,

      lineHeight:
        32,

      fontWeight:
        "700",

      color:
        Colors.textPrimary,

      includeFontPadding:
        false,
    },

    /* ==========================================================
       MESSAGE
    ========================================================== */

    messageInput: {
      width:
        "100%",

      minHeight:
        84,

      maxHeight:
        132,

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.input,

      backgroundColor:
        Colors.background,

      color:
        Colors.textPrimary,

      fontSize:
        Typography.fontSize.md,

      lineHeight:
        20,
    },

    messageFooter: {
      minHeight:
        20,

      marginTop:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,
    },

    messageFooterText: {
      flex:
        1,

      minWidth:
        0,
    },

    characterCount: {
      flexShrink:
        0,

      color:
        Colors.textMuted,
    },

    /* ==========================================================
       HINT / ERROR
    ========================================================== */

    fieldHint: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight:
        16,

      color:
        Colors.textMuted,
    },

    fieldHintInline: {
      lineHeight:
        16,

      color:
        Colors.textMuted,
    },

    errorText: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight:
        16,

      color:
        Colors.error,
    },

    errorTextInline: {
      lineHeight:
        16,

      color:
        Colors.error,
    },

    /* ==========================================================
       STATES
    ========================================================== */

    fieldFocused: {
      borderColor:
        WorkerColors.primary,

      borderWidth:
        1,
    },

    fieldError: {
      borderColor:
        Colors.error,

      borderWidth:
        1,
    },

    fieldDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },
  });