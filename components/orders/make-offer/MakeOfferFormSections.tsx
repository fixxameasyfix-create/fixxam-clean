import React, {
  memo,
  useState,
} from "react";

import {
  StyleSheet,
  TextInput,
  View,
} from "react-native";

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

import MakeOfferSectionTitle from "@/components/orders/make-offer/MakeOfferSectionTitle";

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

  return (
    <>
      <MakeOfferSectionTitle
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
              variant="bodyMedium"
              weight="bold"
              style={
                styles.inputTitle
              }
            >
              Offer amount
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.inputHint
              }
            >
              Enter the total price for this service.
            </AppText>
          </View>

          <View
            style={
              styles.nairaCircle
            }
          >
            <AppText
              variant="heading3"
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

            focusedField ===
              "amount"
              ? styles.inputFocused
              : null,

            amount.length >
              0 &&
            !amountValid
              ? styles.inputError
              : null,
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
            value={
              amount
            }
            onChangeText={
              onAmountChange
            }
            onFocus={() => {
              setFocusedField(
                "amount",
              );
            }}
            onBlur={() => {
              setFocusedField(
                null,
              );
            }}
            placeholder="0"
            placeholderTextColor={
              Colors.disabled
            }
            selectionColor={
              WorkerColors.primary
            }
            cursorColor={
              WorkerColors.primary
            }
            keyboardType="number-pad"
            editable={
              !submitting
            }
            maxLength={9}
            accessibilityLabel="Offer amount"
            style={
              styles.amountInput
            }
          />
        </View>

        {amount.length >
          0 &&
        !amountValid ? (
          <AppText
            variant="caption"
            style={
              styles.validationText
            }
          >
            Enter an amount between ₦1 and ₦
            {maxAmount.toLocaleString(
              "en-NG",
            )}
            .
          </AppText>
        ) : null}
      </View>

      <MakeOfferSectionTitle
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
            <AppIcon
              name="messages"
              role="worker"
              size="sm"
              color={
                WorkerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.messageContent
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.inputTitle
              }
            >
              Explain your offer
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.inputHint
              }
            >
              Tell the customer what your price includes.
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
          onFocus={() => {
            setFocusedField(
              "message",
            );
          }}
          onBlur={() => {
            setFocusedField(
              null,
            );
          }}
          placeholder="Example: This includes site visit, consultation and detailed planning..."
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
          accessibilityLabel="Offer message"
          style={[
            styles.messageInput,

            focusedField ===
              "message"
              ? styles.inputFocused
              : null,

            message.length >
              0 &&
            !messageValid
              ? styles.messageInputError
              : null,
          ]}
        />

        <View
          style={
            styles.messageFooter
          }
        >
          <AppText
            variant="caption"
            style={
              styles.messageValidation
            }
          >
            {message.length >
              0 &&
            cleanMessageLength <
              minMessageLength
              ? `Minimum ${minMessageLength} characters`
              : ""}
          </AppText>

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
    </>
  );
}

export default memo(
  MakeOfferFormSections,
);

const styles =
  StyleSheet.create({
    inputCard: {
      width: "100%",

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    inputHeader: {
      width: "100%",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    inputHeaderText: {
      flex: 1,

      minWidth: 0,

      paddingRight:
        FixxamTokens.spacing.sm,
    },

    inputTitle: {
      color:
        Colors.textPrimary,
    },

    inputHint: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 17,

      color:
        Colors.textSecondary,
    },

    nairaCircle: {
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
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    nairaText: {
      color:
        WorkerColors.primary,
    },

    amountInputWrapper: {
      width: "100%",

      height: 68,

      marginTop:
        FixxamTokens.spacing.md,

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
        Colors.background,
    },

    inputFocused: {
      borderColor:
        WorkerColors.primary,
    },

    inputError: {
      borderColor:
        Colors.error,

      backgroundColor:
        Colors.errorSoft,
    },

    amountPrefix: {
      fontSize: 26,

      color:
        WorkerColors.primary,
    },

    amountInput: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      paddingVertical: 0,

      fontSize: 28,

      fontWeight: "700",

      color:
        Colors.textPrimary,

      includeFontPadding:
        false,
    },

    validationText: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.error,
    },

    messageCard: {
      width: "100%",

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    messageTop: {
      width: "100%",

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    messageIcon: {
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
        WorkerColors.primarySoft,
    },

    messageContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    messageInput: {
      width: "100%",

      minHeight: 120,

      marginTop:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.md,

      borderWidth: 1,

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

      lineHeight: 20,
    },

    messageInputError: {
      borderColor:
        Colors.error,

      backgroundColor:
        Colors.errorSoft,
    },

    messageFooter: {
      minHeight: 20,

      marginTop:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    messageValidation: {
      flex: 1,

      color:
        Colors.error,
    },

    characterCount: {
      color:
        Colors.textMuted,
    },
  });