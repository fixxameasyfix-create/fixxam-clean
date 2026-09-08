import React, {
  memo,
  useState,
} from "react";

import {
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  Typography,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  description: string;

  onChangeDescription: (
    value: string,
  ) => void;
};

/* ============================================================
   COMPONENT
============================================================ */

function ProductDescription({
  description,
  onChangeDescription,
}: Props) {
  const [
    focused,
    setFocused,
  ] =
    useState(false);

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          LABEL
      ====================================================== */}

      <AppText
        variant="caption"
        weight="bold"
        style={
          styles.label
        }
      >
        Description
      </AppText>

      {/* ======================================================
          INPUT
      ====================================================== */}

      <TextInput
        value={
          description
        }
        onChangeText={
          onChangeDescription
        }
        onFocus={() => {
          setFocused(
            true,
          );
        }}
        onBlur={() => {
          setFocused(
            false,
          );
        }}
        placeholder="Describe your product..."
        placeholderTextColor={
          Colors.textMuted
        }
        selectionColor={
          WorkerColors.primary
        }
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        autoCapitalize="sentences"
        autoCorrect
        accessibilityLabel="Product description"
        style={[
          styles.input,

          focused
            ? styles.inputFocused
            : null,
        ]}
      />
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

const MemoizedProductDescription =
  memo(
    ProductDescription,
  );

MemoizedProductDescription.displayName =
  "ProductDescription";

export default MemoizedProductDescription;

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.xl,
    },

    label: {
      marginBottom:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    input: {
      minHeight: 140,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.input,

      backgroundColor:
        Colors.surface,

      fontSize:
        Typography.fontSize.md,

      color:
        Colors.textPrimary,
    },

    inputFocused: {
      borderColor:
        WorkerColors.primary,
    },
  });