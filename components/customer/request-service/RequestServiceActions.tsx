import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppButton,
  AppText,
} from "@/components/ui";

import {
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  workerName: string;

  submitting: boolean;

  canSubmit: boolean;

  onCancel: () => void;

  onSubmit: () => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function RequestServiceActions({
  workerName,
  submitting,
  canSubmit,
  onCancel,
  onSubmit,
}: Props) {
  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          INFO
      ====================================================== */}

      <AppText
        variant="caption"
        tone="muted"
        center
        style={
          styles.hint
        }
      >
        Your request will be sent directly to{" "}
        {workerName}.
      </AppText>

      {/* ======================================================
          ACTIONS
      ====================================================== */}

      <View
        style={
          styles.actions
        }
      >
        <AppButton
          title="Cancel"
          role="customer"
          variant="outline"
          disabled={
            submitting
          }
          onPress={
            onCancel
          }
          style={
            styles.button
          }
        />

        <AppButton
          title={
            submitting
              ? "Sending..."
              : "Request"
          }
          role="customer"
          loading={
            submitting
          }
          disabled={
            submitting ||
            !canSubmit
          }
          rightIconName={
            submitting
              ? undefined
              : "next"
          }
          onPress={
            onSubmit
          }
          style={
            styles.button
          }
        />
      </View>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width:
        "100%",

      marginTop:
        FixxamTokens.spacing.lg,
    },

    hint: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      lineHeight:
        18,
    },

    actions: {
      width:
        "100%",

      flexDirection:
        "row",

      gap:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.md,
    },

    button: {
      flex:
        1,
    },
  });

export default memo(
  RequestServiceActions,
);