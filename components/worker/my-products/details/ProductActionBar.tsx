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
  loading: boolean;

  onEdit: () => void;

  onDelete: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

function ProductActionBar({
  loading,
  onEdit,
  onDelete,
}: Props) {
  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          EDIT
      ====================================================== */}

      <AppButton
        title="Edit Product"
        role="worker"
        variant="primary"
        disabled={
          loading
        }
        onPress={
          onEdit
        }
        style={
          styles.button
        }
      />

      {/* ======================================================
          DELETE
      ====================================================== */}

      <AppButton
        title="Delete Product"
        role="worker"
        variant="danger"
        leftIconName="delete"
        loading={
          loading
        }
        disabled={
          loading
        }
        onPress={
          onDelete
        }
        style={
          styles.button
        }
      />
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

const MemoizedProductActionBar =
  memo(
    ProductActionBar,
  );

MemoizedProductActionBar.displayName =
  "ProductActionBar";

export default MemoizedProductActionBar;

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xl,

      marginBottom:
        FixxamTokens.spacing.xxl,

      gap:
        FixxamTokens.spacing.md,
    },

    button: {
      width: "100%",
    },
  });