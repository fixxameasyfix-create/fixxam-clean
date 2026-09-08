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
    isCompleted ||
    actionDisabled ||
    actionLoading;

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

  /* ==========================================================
     STATE CONTENT
  ========================================================== */

  const actionLabel =
    isCompleted
      ? "COMPLETED"
      : isAccepted
        ? "START SERVICE"
        : "COMPLETE SERVICE";

  const actionIcon =
    isCompleted
      ? "success"
      : isAccepted
        ? "service"
        : "success";

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View
      style={styles.container}
    >
      {/* ====================================================
          CALL CUSTOMER
      ==================================================== */}

      <Pressable
        onPress={onCall}
        disabled={callDisabled}
        accessibilityRole="button"
        accessibilityLabel="Call customer"
        accessibilityState={{
          disabled: callDisabled,
        }}
        style={({ pressed }) => [
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
        <View
          style={[
            styles.callIcon,

            callDisabled
              ? styles.callIconDisabled
              : null,
          ]}
        >
          <AppIcon
            name="phone"
            role="worker"
            size="sm"
            color={
              callDisabled
                ? Colors.textMuted
                : WorkerColors.primary
            }
          />
        </View>

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
          CALL
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
        style={({ pressed }) => [
          styles.actionButton,

          isCompleted
            ? styles.completedButton
            : null,

          !isCompleted &&
          (actionDisabled ||
            actionLoading)
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
            <View
              style={[
                styles.actionIcon,

                isCompleted
                  ? styles.completedIcon
                  : null,

                !isCompleted &&
                actionDisabled
                  ? styles.actionIconDisabled
                  : null,
              ]}
            >
              <AppIcon
                name={actionIcon}
                role="worker"
                size="sm"
                color={
                  Colors.textInverse
                }
              />
            </View>

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

export default memo(
  WorkerOrderActions,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CONTAINER
    ======================================================== */

    container: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.lg,

      flexDirection: "row",

      alignItems: "stretch",

      gap:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       CALL BUTTON
    ======================================================== */

    callButton: {
      flex: 1,

      minHeight:
        FixxamTokens.size
          .buttonHeight,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    callIcon: {
      width: 38,

      height: 38,

      marginRight:
        FixxamTokens.spacing.xs,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    callText: {
      letterSpacing: 0.3,

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

    callIconDisabled: {
      backgroundColor:
        Colors.disabledBackground,
    },

    callTextDisabled: {
      color:
        Colors.textMuted,
    },

    /* ========================================================
       SERVICE BUTTON
    ======================================================== */

    actionButton: {
      flex: 1.35,

      minHeight:
        FixxamTokens.size
          .buttonHeight,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        WorkerColors.primary,
    },

    actionIcon: {
      width: 38,

      height: 38,

      marginRight:
        FixxamTokens.spacing.xs,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        "rgba(255,255,255,0.18)",
    },

    actionText: {
      flexShrink: 1,

      letterSpacing: 0.2,

      color:
        Colors.textInverse,
    },

    /* ========================================================
       COMPLETED
    ======================================================== */

    completedButton: {
      backgroundColor:
        Colors.success,
    },

    completedIcon: {
      backgroundColor:
        "rgba(255,255,255,0.18)",
    },

    /* ========================================================
       DISABLED
    ======================================================== */

    actionDisabled: {
      backgroundColor:
        Colors.textMuted,

      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    actionIconDisabled: {
      backgroundColor:
        "rgba(255,255,255,0.14)",
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