import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppButton,
} from "@/components/ui";

import {
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  loading?: boolean;

  onAccept: () => void;

  onReject: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

function WorkerOfferActions({
  loading = false,
  onAccept,
  onReject,
}: Props) {
  return (
    <View
      style={
        styles.container
      }
    >
      <AppButton
        title="Accept Customer Offer"
        role="worker"
        variant="primary"
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

      <AppButton
        title="Reject Offer"
        role="worker"
        variant="danger"
        disabled={
          loading
        }
        onPress={
          onReject
        }
      />
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

WorkerOfferActions.displayName =
  "WorkerOfferActions";

export default memo(
  WorkerOfferActions,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      marginTop:
        FixxamTokens.spacing.lg,

      gap:
        FixxamTokens.spacing.md,
    },
  });