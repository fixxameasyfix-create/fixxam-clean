import React, { memo, useCallback } from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

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

  /* ==========================================================
     SERVICE ACTION
  ========================================================== */

  const handleServiceAction =
    useCallback(() => {
      if (
        actionDisabled ||
        actionLoading ||
        isCompleted
      ) {
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
      actionDisabled,
      actionLoading,
      isCompleted,
      isAccepted,
      isInProgress,
      onStartService,
      onCompleteService,
    ]);

  /* ==========================================================
     LABEL
  ========================================================== */

  const actionLabel =
    isCompleted
      ? "COMPLETED"
      : isAccepted
        ? "START SERVICE"
        : "COMPLETE SERVICE";

  /* ==========================================================
     ICON
  ========================================================== */

  const actionIcon: keyof typeof Ionicons.glyphMap =
    isCompleted
      ? "checkmark-circle-outline"
      : isAccepted
        ? "play-outline"
        : "checkmark-outline";

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ====================================================
          CALL BUTTON
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

          callDisabled &&
            styles.callDisabled,

          pressed &&
            !callDisabled &&
            styles.pressed,
        ]}
      >
        <View
          style={
            styles.callIcon
          }
        >
          <Ionicons
            name="call-outline"
            size={20}
            color="#FFFFFF"
          />
        </View>

        <AppText
          weight="bold"
          style={
            styles.callText
          }
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
          isCompleted ||
          actionDisabled ||
          actionLoading
        }
        accessibilityRole="button"
        accessibilityLabel={
          actionLabel
        }
        accessibilityState={{
          disabled:
            isCompleted ||
            actionDisabled ||
            actionLoading,
          busy: actionLoading,
        }}
        style={({ pressed }) => [
          styles.actionButton,

          isCompleted &&
            styles.completedButton,

          !isCompleted &&
            (actionDisabled ||
              actionLoading) &&
            styles.actionDisabled,

          pressed &&
            !isCompleted &&
            !actionDisabled &&
            !actionLoading &&
            styles.pressed,
        ]}
      >
        {actionLoading ? (
          <ActivityIndicator
            size="small"
            color="#FFFFFF"
          />
        ) : (
          <>
            <View
              style={[
                styles.actionIcon,
                isCompleted &&
                  styles.completedIcon,
              ]}
            >
              <Ionicons
                name={actionIcon}
                size={20}
                color="#FFFFFF"
              />
            </View>

            <AppText
              weight="bold"
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
      marginTop: 20,

      flexDirection: "row",

      alignItems: "stretch",

      gap: 12,
    },

    /* ========================================================
       CALL BUTTON
    ======================================================== */

    callButton: {
      flex: 1,

      minHeight: 58,

      borderRadius: 16,

      backgroundColor:
        "#F97316",

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      paddingHorizontal: 10,
    },

    callIcon: {
      width: 40,
      height: 40,

      borderRadius: 13,

      backgroundColor:
        "#FB923C",

      alignItems: "center",

      justifyContent:
        "center",

      marginRight: 8,
    },

    callText: {
      fontSize: 10.5,

      letterSpacing: 0.3,

      color: "#FFFFFF",
    },

    /* ========================================================
       SERVICE BUTTON
    ======================================================== */

    actionButton: {
      flex: 1.35,

      minHeight: 58,

      borderRadius: 16,

      backgroundColor:
        "#2563EB",

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      paddingHorizontal: 10,
    },

    actionIcon: {
      width: 40,
      height: 40,

      borderRadius: 13,

      backgroundColor:
        "#3B82F6",

      alignItems: "center",

      justifyContent:
        "center",

      marginRight: 8,
    },

    actionText: {
      fontSize: 10,

      letterSpacing: 0.2,

      color: "#FFFFFF",
    },

    /* ========================================================
       COMPLETED
    ======================================================== */

    completedButton: {
      backgroundColor:
        "#16A34A",
    },

    completedIcon: {
      backgroundColor:
        "#22C55E",
    },

    /* ========================================================
       DISABLED
    ======================================================== */

    callDisabled: {
      backgroundColor:
        "#CBD5E1",
    },

    actionDisabled: {
      backgroundColor:
        "#94A3B8",
    },

    /* ========================================================
       PRESS
    ======================================================== */

    pressed: {
      opacity: 0.82,

      transform: [
        {
          scale: 0.985,
        },
      ],
    },
  });