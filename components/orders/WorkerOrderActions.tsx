import React, {
  memo,
  useCallback,
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

/* ============================================================
   TYPES
============================================================ */

export type WorkerOrderStatus =
  | "accepted"
  | "in-progress"
  | "completed";

type Props = {
  status: WorkerOrderStatus;

  onCall: () => void;

  onStartService: () => void;

  onCompleteService: () => void;

  callDisabled?: boolean;

  actionDisabled?: boolean;

  actionLoading?: boolean;
};

/* ============================================================
   COMPONENT
============================================================ */

function WorkerOrderActions({
  status,
  onCall,
  onStartService,
  onCompleteService,
  callDisabled = false,
  actionDisabled = false,
  actionLoading = false,
}: Props) {
  const isAccepted =
    status === "accepted";

  const isInProgress =
    status === "in-progress";

  const isCompleted =
    status === "completed";

  const serviceDisabled =
    actionDisabled ||
    actionLoading ||
    isCompleted;

  /* ==========================================================
     SERVICE ACTION
  ========================================================== */

  const handleServiceAction =
    useCallback(() => {
      if (serviceDisabled) {
        return;
      }

      if (isAccepted) {
        onStartService();
        return;
      }

      if (isInProgress) {
        onCompleteService();
      }
    }, [
      isAccepted,
      isInProgress,
      onCompleteService,
      onStartService,
      serviceDisabled,
    ]);

  const actionLabel =
    isAccepted
      ? "Start Service"
      : "Complete Service";

  const actionIcon =
    isAccepted
      ? "service"
      : "success";

  /* ==========================================================
     COMPLETED

     Completion is already represented by the status section.
     Do not render a disabled "COMPLETED" action button.
  ========================================================== */

  if (isCompleted) {
    return (
      <View
        style={
          styles.completedContainer
        }
      >
        <Pressable
          onPress={
            onCall
          }
          disabled={
            callDisabled
          }
          accessibilityRole="button"
          accessibilityLabel="Call customer"
          accessibilityHint="Start a Fixxam voice call with the customer"
          accessibilityState={{
            disabled:
              callDisabled,
          }}
          style={({
            pressed,
          }) => [
            styles.completedCallButton,

            callDisabled
              ? styles.callDisabled
              : null,

            pressed &&
            !callDisabled
              ? styles.pressed
              : null,
          ]}
        >
          <AppIcon
            name="phone"
            role="worker"
            size="xs"
            color={
              callDisabled
                ? Colors.textMuted
                : WorkerColors.primary
            }
          />

          <AppText
            variant="caption"
            weight="bold"
            numberOfLines={1}
            style={[
              styles.callText,

              callDisabled
                ? styles.callTextDisabled
                : null,
            ]}
          >
            Call Customer
          </AppText>
        </Pressable>
      </View>
    );
  }

  /* ==========================================================
     ACCEPTED / IN PROGRESS
  ========================================================== */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ====================================================
          CALL CUSTOMER
      ==================================================== */}

      <Pressable
        onPress={
          onCall
        }
        disabled={
          callDisabled
        }
        accessibilityRole="button"
        accessibilityLabel="Call customer"
        accessibilityHint="Start a Fixxam voice call with the customer"
        accessibilityState={{
          disabled:
            callDisabled,
        }}
        style={({
          pressed,
        }) => [
          styles.callButton,

          callDisabled
            ? styles.callDisabled
            : null,

          pressed &&
          !callDisabled
            ? styles.pressed
            : null,
        ]}
      >
        <AppIcon
          name="phone"
          role="worker"
          size="xs"
          color={
            callDisabled
              ? Colors.textMuted
              : WorkerColors.primary
          }
        />

        <AppText
          variant="caption"
          weight="bold"
          numberOfLines={1}
          style={[
            styles.callText,

            callDisabled
              ? styles.callTextDisabled
              : null,
          ]}
        >
          Call
        </AppText>
      </Pressable>

      {/* ====================================================
          START / COMPLETE SERVICE
      ==================================================== */}

      <Pressable
        onPress={
          handleServiceAction
        }
        disabled={
          serviceDisabled
        }
        accessibilityRole="button"
        accessibilityLabel={
          actionLabel
        }
        accessibilityState={{
          disabled:
            serviceDisabled,

          busy:
            actionLoading,
        }}
        style={({
          pressed,
        }) => [
          styles.actionButton,

          serviceDisabled
            ? styles.actionDisabled
            : null,

          pressed &&
          !serviceDisabled
            ? styles.pressed
            : null,
        ]}
      >
        {actionLoading ? (
          <ActivityIndicator
            size="small"
            color={
              Colors.textInverse
            }
          />
        ) : (
          <>
            <AppIcon
              name={
                actionIcon
              }
              role="worker"
              size="xs"
              color={
                Colors.textInverse
              }
            />

            <AppText
              variant="caption"
              weight="bold"
              numberOfLines={1}
              style={
                styles.actionText
              }
            >
              {actionLabel}
            </AppText>
          </>
        )}
      </Pressable>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

WorkerOrderActions.displayName =
  "WorkerOrderActions";

export default memo(
  WorkerOrderActions,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       ACTIVE CONTAINER
    ======================================================== */

    container: {
      width:
        "100%",

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       CALL
    ======================================================== */

    callButton: {
      flex:
        1,

      minWidth:
        0,

      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    callText: {
      color:
        WorkerColors.primary,
    },

    callDisabled: {
      borderColor:
        Colors.border,

      backgroundColor:
        Colors.disabledBackground,

      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    callTextDisabled: {
      color:
        Colors.textMuted,
    },

    /* ========================================================
       SERVICE ACTION
    ======================================================== */

    actionButton: {
      flex:
        1.35,

      minWidth:
        0,

      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        WorkerColors.primary,
    },

    actionText: {
      flexShrink:
        1,

      color:
        Colors.textInverse,
    },

    actionDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    /* ========================================================
       COMPLETED
    ======================================================== */

    completedContainer: {
      width:
        "100%",

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    completedCallButton: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    /* ========================================================
       PRESS
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
  });