import React, {
  memo,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import WorkerOfferSection from "@/components/orders/WorkerOfferSection";

import WorkerOrderActions, {
  type WorkerOrderStatus,
} from "@/components/orders/WorkerOrderActions";

import {
  WorkerOrderSectionTitle,
} from "@/components/orders/WorkerOrderInfoSections";

import type {
  BookingStatus,
} from "@/types/booking";

type OfferState =
  | "none"
  | "sent"
  | "counter";

type Props = {
  sectionNumber: string;

  status: BookingStatus;

  offerState: OfferState;

  offerAmount?:
    | number
    | null;

  offerMessage?:
    | string
    | null;

  counterOfferAmount?:
    | number
    | null;

  counterOfferMessage?:
    | string
    | null;

  hasCustomerCounter: boolean;

  hasCustomerPhone: boolean;

  canDeclineRequest: boolean;

  loading: boolean;

  onSendOffer: () => void;

  onAcceptCounter: () => void;

  onCounter: () => void;

  onDeclineCounter: () => void;

  onCall: () => void;

  onDecline: () => void;

  onStartService: () => void;

  onCompleteService: () => void;
};

function WorkerOrderResponseSection({
  sectionNumber,
  status,
  offerState,
  offerAmount,
  offerMessage,
  counterOfferAmount,
  counterOfferMessage,
  hasCustomerCounter,
  hasCustomerPhone,
  canDeclineRequest,
  loading,
  onSendOffer,
  onAcceptCounter,
  onCounter,
  onDeclineCounter,
  onCall,
  onDecline,
  onStartService,
  onCompleteService,
}: Props) {
  const actionStatus:
    | WorkerOrderStatus
    | null =
    status ===
      "accepted" ||
    status ===
      "in-progress" ||
    status ===
      "completed"
      ? status
      : null;

  return (
    <>
      <WorkerOrderSectionTitle
        number={
          sectionNumber
        }
        title="Your Response"
      />

      <WorkerOfferSection
        state={
          offerState
        }
        offerAmount={
          offerAmount
        }
        offerMessage={
          offerMessage
        }
        counterOfferAmount={
          counterOfferAmount
        }
        counterOfferMessage={
          counterOfferMessage
        }
        onSendOffer={
          onSendOffer
        }
        onAcceptCounter={
          onAcceptCounter
        }
        onCounter={
          onCounter
        }
        onDeclineCounter={
          onDeclineCounter
        }
        loading={
          loading
        }
      />

      {actionStatus ? (
        <WorkerOrderActions
          status={
            actionStatus
          }
          onCall={
            onCall
          }
          onStartService={
            onStartService
          }
          onCompleteService={
            onCompleteService
          }
          callDisabled={
            !hasCustomerPhone
          }
          actionDisabled={
            loading
          }
          actionLoading={
            loading
          }
        />
      ) : !hasCustomerCounter ? (
        <WorkerPendingActions
          onCall={
            onCall
          }
          onDecline={
            onDecline
          }
          callDisabled={
            !hasCustomerPhone
          }
          declineDisabled={
            !canDeclineRequest ||
            loading
          }
          loading={
            loading
          }
        />
      ) : null}
    </>
  );
}

export default memo(
  WorkerOrderResponseSection,
);

/* ==============================================================
   PENDING ACTIONS
============================================================== */

const WorkerPendingActions =
  memo(
    function WorkerPendingActions({
      onCall,
      onDecline,
      callDisabled = false,
      declineDisabled = false,
      loading = false,
    }: {
      onCall: () => void;

      onDecline: () => void;

      callDisabled?: boolean;

      declineDisabled?: boolean;

      loading?: boolean;
    }) {
      return (
        <View
          style={
            styles.pendingActions
          }
        >
          <Pressable
            onPress={
              onCall
            }
            disabled={
              callDisabled ||
              loading
            }
            accessibilityRole="button"
            accessibilityLabel="Call customer"
            accessibilityState={{
              disabled:
                callDisabled ||
                loading,
            }}
            style={({
              pressed,
            }) => [
              styles.pendingCallButton,

              (callDisabled ||
                loading) &&
                styles.actionDisabled,

              pressed &&
              !callDisabled &&
              !loading
                ? styles.buttonPressed
                : null,
            ]}
          >
            <AppIcon
              name="phone"
              size="sm"
              color={
                Colors.textInverse
              }
            />

            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.pendingCallText
              }
            >
              CALL
            </AppText>
          </Pressable>

          <Pressable
            onPress={
              onDecline
            }
            disabled={
              declineDisabled
            }
            accessibilityRole="button"
            accessibilityLabel="Decline request"
            accessibilityState={{
              disabled:
                declineDisabled,

              busy:
                loading,
            }}
            style={({
              pressed,
            }) => [
              styles.pendingDeclineButton,

              declineDisabled
                ? styles.actionDisabled
                : null,

              pressed &&
              !declineDisabled
                ? styles.buttonPressed
                : null,
            ]}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color={
                  Colors.textInverse
                }
              />
            ) : (
              <>
                <AppIcon
                  name="close"
                  size="sm"
                  color={
                    Colors.textInverse
                  }
                />

                <AppText
                  variant="caption"
                  weight="bold"
                  style={
                    styles.pendingDeclineText
                  }
                >
                  DECLINE REQUEST
                </AppText>
              </>
            )}
          </Pressable>
        </View>
      );
    },
  );

WorkerPendingActions.displayName =
  "WorkerPendingActions";

const styles =
  StyleSheet.create({
    pendingActions: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xl,

      flexDirection:
        "row",

      alignItems:
        "stretch",

      gap:
        FixxamTokens.spacing.sm,
    },

    pendingCallButton: {
      flex: 0.9,

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

    pendingCallText: {
      color:
        Colors.textInverse,
    },

    pendingDeclineButton: {
      flex: 1.45,

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
        Colors.error,
    },

    pendingDeclineText: {
      color:
        Colors.textInverse,
    },

    actionDisabled: {
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