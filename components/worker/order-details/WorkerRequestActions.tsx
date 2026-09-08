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
  Colors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  loading?: boolean;

  onAccept: () => void;

  onDecline: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

function WorkerRequestActions({
  loading = false,
  onAccept,
  onDecline,
}: Props) {
  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <AppText
        variant="heading3"
        weight="bold"
        style={
          styles.title
        }
      >
        New Service Request
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        style={
          styles.description
        }
      >
        Review the customer request before accepting the job.
      </AppText>

      {/* ======================================================
          ACTIONS
      ====================================================== */}

      <View
        style={
          styles.actions
        }
      >
        <View
          style={
            styles.action
          }
        >
          <AppButton
            title="Decline"
            role="worker"
            variant="danger"
            leftIconName="close"
            loading={
              loading
            }
            disabled={
              loading
            }
            onPress={
              onDecline
            }
          />
        </View>

        <View
          style={
            styles.action
          }
        >
          <AppButton
            title="Accept Request"
            role="worker"
            variant="primary"
            leftIconName="check"
            loading={
              loading
            }
            disabled={
              loading
            }
            onPress={
              onAccept
            }
          />
        </View>
      </View>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

WorkerRequestActions.displayName =
  "WorkerRequestActions";

export default memo(
  WorkerRequestActions,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.lg,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    description: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    actions: {
      marginTop:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      gap:
        FixxamTokens.spacing.sm,
    },

    action: {
      flex: 1,
    },
  });