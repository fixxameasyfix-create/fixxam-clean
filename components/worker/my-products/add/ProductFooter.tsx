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

  onSave: () => void;

  buttonText?: string;
};

/* ============================================================
   COMPONENT
============================================================ */

function ProductFooter({
  loading,
  onSave,
  buttonText = "Publish Product",
}: Props) {
  return (
    <View
      style={
        styles.container
      }
    >
      <AppButton
        title={
          buttonText
        }
        role="worker"
        variant="primary"
        leftIconName="upload"
        loading={
          loading
        }
        disabled={
          loading
        }
        onPress={
          onSave
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

const MemoizedProductFooter =
  memo(
    ProductFooter,
  );

MemoizedProductFooter.displayName =
  "ProductFooter";

export default MemoizedProductFooter;

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.xxl,
    },

    button: {
      width: "100%",
    },
  });