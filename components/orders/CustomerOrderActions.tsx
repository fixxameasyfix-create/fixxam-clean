import React, { memo } from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type CustomerOrderActionsProps = {
  onCall: () => void;
  onCancel: () => void;
  callDisabled?: boolean;
  cancelDisabled?: boolean;
};

function CustomerOrderActions({
  onCall,
  onCancel,
  callDisabled = false,
  cancelDisabled = false,
}: CustomerOrderActionsProps) {
  return (
    <View style={styles.container}>
      {/* ======================================================
          CALL
      ====================================================== */}

      <Pressable
        onPress={onCall}
        disabled={callDisabled}
        accessibilityRole="button"
        accessibilityLabel="Call worker"
        accessibilityState={{
          disabled: callDisabled,
        }}
        style={({ pressed }) => [
          styles.callButton,

          /*
           * IMPORTANT:
           * Call remains disabled until the offer is accepted,
           * but its visual appearance stays full orange.
           */
          pressed &&
            !callDisabled &&
            styles.pressed,
        ]}
      >
        <View style={styles.callIcon}>
          <Ionicons
            name="call-outline"
            size={20}
            color="#FFFFFF"
          />
        </View>

        <AppText
          weight="bold"
          style={styles.callText}
        >
          CALL
        </AppText>
      </Pressable>

      {/* ======================================================
          CANCEL
      ====================================================== */}

      <Pressable
        onPress={onCancel}
        disabled={cancelDisabled}
        accessibilityRole="button"
        accessibilityLabel="Cancel order"
        accessibilityState={{
          disabled: cancelDisabled,
        }}
        style={({ pressed }) => [
          styles.cancelButton,

          cancelDisabled &&
            styles.cancelButtonDisabled,

          pressed &&
            !cancelDisabled &&
            styles.pressed,
        ]}
      >
        <View
          style={[
            styles.cancelIcon,
            cancelDisabled &&
              styles.disabledIcon,
          ]}
        >
          <Ionicons
            name="close-circle-outline"
            size={20}
            color={
              cancelDisabled
                ? "#94A3B8"
                : "#FFFFFF"
            }
          />
        </View>

        <AppText
          weight="bold"
          style={[
            styles.cancelText,
            cancelDisabled &&
              styles.disabledText,
          ]}
        >
          CANCEL ORDER
        </AppText>
      </Pressable>
    </View>
  );
}

export default memo(
  CustomerOrderActions,
);

const styles = StyleSheet.create({
  /* ==========================================================
     CONTAINER
  ========================================================== */

  container: {
    marginTop: 10,
    width: "100%",
    flexDirection: "row",
    gap: 10,
  },

  /* ==========================================================
     CALL
  ========================================================== */

  callButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: "#F97316",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    /*
     * Keep disabled Call visually strong.
     */
    opacity: 1,
  },

  callIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,

    backgroundColor: "#FB923C",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 8,
  },

  callText: {
    fontSize: 10.5,
    letterSpacing: 0.3,
    color: "#FFFFFF",
  },

  /* ==========================================================
     CANCEL
  ========================================================== */

  cancelButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: 16,

    backgroundColor: "#DC2626",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonDisabled: {
    backgroundColor: "#E2E8F0",
  },

  cancelIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,

    backgroundColor: "#EF4444",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 8,
  },

  cancelText: {
    fontSize: 10,
    letterSpacing: 0.2,
    color: "#FFFFFF",
  },

  /* ==========================================================
     DISABLED CANCEL
  ========================================================== */

  disabledIcon: {
    backgroundColor: "#CBD5E1",
  },

  disabledText: {
    color: "#94A3B8",
  },

  /* ==========================================================
     PRESS
  ========================================================== */

  pressed: {
    opacity: 0.82,

    transform: [
      {
        scale: 0.985,
      },
    ],
  },
});