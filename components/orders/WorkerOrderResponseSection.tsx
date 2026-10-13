import React, { memo, useMemo } from "react";

import {
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

import WorkerDeclineRequestModal, {
  type WorkerDeclineReason,
} from "@/components/orders/WorkerDeclineRequestModal";

import type { BookingStatus } from "@/types/booking";

/* ==============================================================
   TYPES
============================================================== */

export type OfferState = "none" | "sent" | "counter";

type Props = {
  sectionNumber?: string;
  status: BookingStatus;
  offerState: OfferState;
  offerAmount?: number | null;
  offerMessage?: string | null;
  counterOfferAmount?: number | null;
  counterOfferMessage?: string | null;
  hasCustomerCounter: boolean;
  canCallCustomer: boolean;
  canDeclineRequest: boolean;
  loading: boolean;

  declineModalVisible?: boolean;
  declineLoading?: boolean;
  onCloseDeclineModal?: () => void;
  onConfirmDecline?: (
    reason: WorkerDeclineReason,
    note: string,
  ) => void;

  onSendOffer: () => void;
  onAcceptCounter: () => void;
  onCounter: () => void;
  onDeclineCounter: () => void;
  onCall: () => void;
  onDecline: () => void;
  onStartService: () => void;
  onCompleteService: () => void;
};

type ResponseHeaderContent = {
  title: string;
  description: string;
};

/* ==============================================================
   RESPONSE COPY
============================================================== */

function getResponseHeaderContent(
  status: BookingStatus,
  offerState: OfferState,
  hasCustomerCounter: boolean,
): ResponseHeaderContent {
  if (status === "completed") {
    return {
      title: "Job completed",
      description: "This service has been completed.",
    };
  }

  if (status === "cancelled") {
    return {
      title: "Job cancelled",
      description: "No further action is required.",
    };
  }

  if (status === "expired") {
    return {
      title: "Request expired",
      description: "This request is no longer available.",
    };
  }

  if (status === "awaiting_start_confirmation") {
    return {
      title: "Wait for Customer Confirmation",
      description:
        "Your request to start the service has been sent. The customer must confirm before work continues.",
    };
  }

  if (status === "awaiting_completion_confirmation") {
    return {
      title: "Wait for Customer Confirmation",
      description:
        "You marked the job as finished. The customer must confirm before the order is completed.",
    };
  }

  if (status === "in-progress") {
    return {
      title: "Job in progress",
      description:
        "Complete the service when the work is finished.",
    };
  }

  if (status === "accepted") {
    return {
      title: "Job accepted",
      description:
        "Contact the customer or start the service when ready.",
    };
  }

  if (hasCustomerCounter) {
    return {
      title: "Customer sent an offer",
      description: "Accept, counter, or decline the offer.",
    };
  }

  if (offerState === "sent") {
    return {
      title: "Offer sent",
      description: "Waiting for the customer to respond.",
    };
  }

  return {
    title: "Respond to request",
    description: "Send your price or contact the customer.",
  };
}

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerOrderResponseSection({
  status,
  offerState,
  offerAmount,
  offerMessage,
  counterOfferAmount,
  counterOfferMessage,
  hasCustomerCounter,
  canCallCustomer,
  canDeclineRequest,
  loading,

  declineModalVisible = false,
  declineLoading = false,
  onCloseDeclineModal,
  onConfirmDecline,

  onSendOffer,
  onAcceptCounter,
  onCounter,
  onDeclineCounter,
  onCall,
  onDecline,
  onStartService,
  onCompleteService,
}: Props) {
 const actionStatus = useMemo<WorkerOrderStatus | null>(() => {
  switch (status) {
    case "accepted":
    case "in-progress":
    case "completed":
      return status;

    default:
      return null;
  }
}, [status]);

  const headerContent = useMemo(
    () =>
      getResponseHeaderContent(
        status,
        offerState,
        hasCustomerCounter,
      ),
    [status, offerState, hasCustomerCounter],
  );

  const isPending = status === "pending";

  const isClosed =
    status === "cancelled" || status === "expired";

  const isAwaitingCustomerConfirmation =
    status === "awaiting_start_confirmation" ||
    status === "awaiting_completion_confirmation";

  const isAwaitingStartConfirmation =
    status === "awaiting_start_confirmation";

  const callDisabled = !canCallCustomer || loading;

  return (
    <View style={styles.container}>
      {/* STATUS / RESPONSE HEADER */}

      <View style={styles.header}>
        <View
          style={[
            styles.headerIcon,
            isClosed && styles.headerIconClosed,
          ]}
        >
          <AppIcon
            name={
              isClosed
                ? "error"
                : isAwaitingCustomerConfirmation
                  ? "clock"
                  : actionStatus
                    ? "jobs"
                    : "payment"
            }
            role="worker"
            size="xs"
            color={
              isClosed
                ? Colors.textSecondary
                : WorkerColors.primary
            }
          />
        </View>

        <View style={styles.headerContent}>
          <AppText
            variant="bodyMedium"
            weight="bold"
            numberOfLines={2}
            style={styles.headerTitle}
          >
            {headerContent.title}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={3}
            style={styles.headerDescription}
          >
            {headerContent.description}
          </AppText>
        </View>
      </View>

      {/* OFFER / NEGOTIATION */}

      {isPending ? (
        <View style={styles.offerContainer}>
          <WorkerOfferSection
            state={offerState}
            offerAmount={offerAmount}
            offerMessage={offerMessage}
            counterOfferAmount={counterOfferAmount}
            counterOfferMessage={counterOfferMessage}
            onSendOffer={onSendOffer}
            onAcceptCounter={onAcceptCounter}
            onCounter={onCounter}
            onDeclineCounter={onDeclineCounter}
            loading={loading}
          />
        </View>
      ) : null}

      {/* ACCEPTED / ACTIVE / COMPLETED ACTIONS */}

      {actionStatus ? (
        <View style={styles.actionsContainer}>
          <WorkerOrderActions
            status={actionStatus}
            onCall={onCall}
            onStartService={onStartService}
            onCompleteService={onCompleteService}
            callDisabled={callDisabled}
            actionDisabled={loading}
            actionLoading={loading}
          />
        </View>
      ) : null}

      {/* WAITING FOR CUSTOMER CONFIRMATION */}

      {isAwaitingCustomerConfirmation ? (
        <View
          style={styles.waitingCard}
          accessibilityRole="summary"
          accessibilityLabel={
            isAwaitingStartConfirmation
              ? "Waiting for customer to confirm service start"
              : "Waiting for customer to confirm service completion"
          }
        >
          <AppIcon
            name="clock"
            role="worker"
            size="md"
            color={WorkerColors.primary}
          />

          <View style={styles.waitingContent}>
            <AppText
              variant="body"
              weight="bold"
              style={styles.waitingTitle}
            >
              {isAwaitingStartConfirmation
                ? "Wait for Customer to Confirm"
                : "Wait for Customer to Confirm Completion"}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={styles.waitingDescription}
            >
              {isAwaitingStartConfirmation
                ? "Your start request has been sent. The job will move to In Progress after the customer confirms."
                : "The customer must confirm the finished job before the order becomes Completed."}
            </AppText>
          </View>
        </View>
      ) : null}

      {/* PENDING SECONDARY ACTIONS */}

      {isPending && !hasCustomerCounter ? (
        <WorkerPendingActions
          onCall={onCall}
          onDecline={onDecline}
          callDisabled={callDisabled}
          declineDisabled={!canDeclineRequest}
          loading={loading || declineLoading}
        />
      ) : null}

      {/* WORKER DECLINE REQUEST MODAL */}

      <WorkerDeclineRequestModal
        visible={declineModalVisible}
        loading={declineLoading}
        onClose={() => {
          if (!declineLoading) {
            onCloseDeclineModal?.();
          }
        }}
        onConfirm={(reason, note) => {
          if (!declineLoading && onConfirmDecline) {
            onConfirmDecline(reason, note);
          }
        }}
      />
    </View>
  );
}

/* ==============================================================
   PENDING ACTIONS
============================================================== */

type WorkerPendingActionsProps = {
  onCall: () => void;
  onDecline: () => void;
  callDisabled?: boolean;
  declineDisabled?: boolean;
  loading?: boolean;
};

const WorkerPendingActions = memo(
  function WorkerPendingActions({
    onCall,
    onDecline,
    callDisabled = false,
    declineDisabled = false,
    loading = false,
  }: WorkerPendingActionsProps) {
    const callUnavailable = callDisabled || loading;
    const declineUnavailable = declineDisabled || loading;

    return (
      <View style={styles.pendingActions}>
        <Pressable
          onPress={onCall}
          disabled={callUnavailable}
          accessibilityRole="button"
          accessibilityLabel="Call customer"
          accessibilityHint="Start a Fixxam voice call with the customer"
          accessibilityState={{
            disabled: callUnavailable,
            busy: loading,
          }}
          style={({ pressed }) => [
            styles.callButton,
            callUnavailable && styles.actionDisabled,
            pressed &&
              !callUnavailable &&
              styles.buttonPressed,
          ]}
        >
          <AppIcon
            name="phone"
            size="xs"
            color={WorkerColors.primary}
          />

          <AppText
            variant="caption"
            weight="bold"
            numberOfLines={1}
            style={styles.callText}
          >
            Call
          </AppText>
        </Pressable>

        <Pressable
          onPress={onDecline}
          disabled={declineUnavailable}
          accessibilityRole="button"
          accessibilityLabel="Decline request"
          accessibilityHint="Choose a reason for declining this customer request"
          accessibilityState={{
            disabled: declineUnavailable,
            busy: loading,
          }}
          style={({ pressed }) => [
            styles.declineButton,
            declineUnavailable && styles.actionDisabled,
            pressed &&
              !declineUnavailable &&
              styles.buttonPressed,
          ]}
        >
          <AppIcon
            name="close"
            size="xs"
            color={Colors.error}
          />

          <AppText
            variant="caption"
            weight="bold"
            numberOfLines={1}
            style={styles.declineText}
          >
            Decline request
          </AppText>
        </Pressable>
      </View>
    );
  },
);

WorkerPendingActions.displayName = "WorkerPendingActions";
WorkerOrderResponseSection.displayName = "WorkerOrderResponseSection";

export default memo(WorkerOrderResponseSection);

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingTop: FixxamTokens.spacing.sm,
    paddingBottom: FixxamTokens.spacing.md,
  },

  header: {
    width: "100%",
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    width: 36,
    height: 36,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: FixxamTokens.radius.full,
    backgroundColor: WorkerColors.primarySoft,
  },

  headerIconClosed: {
    backgroundColor: Colors.disabledBackground,
  },

  headerContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: FixxamTokens.spacing.sm,
  },

  headerTitle: {
    color: Colors.textPrimary,
  },

  headerDescription: {
    marginTop: 2,
    lineHeight: 16,
    color: Colors.textSecondary,
  },

  offerContainer: {
    marginTop: FixxamTokens.spacing.sm,
  },

  actionsContainer: {
    marginTop: FixxamTokens.spacing.sm,
  },

  waitingCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: FixxamTokens.spacing.sm,
    padding: FixxamTokens.spacing.md,
    gap: FixxamTokens.spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WorkerColors.primary,
    borderRadius: FixxamTokens.radius.lg,
    backgroundColor: WorkerColors.primarySoft,
  },

  waitingContent: {
    flex: 1,
    minWidth: 0,
  },

  waitingTitle: {
    color: Colors.textPrimary,
  },

  waitingDescription: {
    marginTop: FixxamTokens.spacing.xs,
    lineHeight: 19,
    color: Colors.textSecondary,
  },

  pendingActions: {
    width: "100%",
    marginTop: FixxamTokens.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: FixxamTokens.spacing.sm,
  },

  callButton: {
    flex: 1,
    minWidth: 0,
    minHeight: FixxamTokens.size.minimumTouchTarget,
    paddingHorizontal: FixxamTokens.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: FixxamTokens.spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WorkerColors.primary,
    borderRadius: FixxamTokens.radius.button,
    backgroundColor: WorkerColors.primarySoft,
  },

  callText: {
    color: WorkerColors.primary,
  },

  declineButton: {
    flex: 1,
    minWidth: 0,
    minHeight: FixxamTokens.size.minimumTouchTarget,
    paddingHorizontal: FixxamTokens.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: FixxamTokens.spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.error,
    borderRadius: FixxamTokens.radius.button,
    backgroundColor: Colors.surface,
  },

  declineText: {
    color: Colors.error,
  },

  actionDisabled: {
    opacity: FixxamTokens.motion.disabledOpacity,
  },

  buttonPressed: {
    opacity: FixxamTokens.motion.pressedOpacity,
    transform: [
      {
        scale: FixxamTokens.motion.scalePressed,
      },
    ],
  },
});