import React, {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
  Typography,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type RequestDescriptionProps = {
  value: string;

  onChangeText: (
    value: string,
  ) => void;

  disabled?: boolean;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const MAX_LENGTH = 300;

const WARNING_THRESHOLD = 270;

/* ==============================================================
   COMPONENT
============================================================== */

function RequestDescription({
  value,
  onChangeText,
  disabled = false,
}: RequestDescriptionProps) {
  const [
    focused,
    setFocused,
  ] =
    useState(false);

  /* ============================================================
     CHARACTER STATE
  ============================================================ */

  const characterCount =
    value.length;

  const isNearLimit =
    characterCount >=
    WARNING_THRESHOLD;

  const isAtLimit =
    characterCount >=
    MAX_LENGTH;

  /* ============================================================
     CHANGE
  ============================================================ */

  const handleChangeText =
    useCallback(
      (
        text: string,
      ) => {
        onChangeText(
          text.slice(
            0,
            MAX_LENGTH,
          ),
        );
      },
      [
        onChangeText,
      ],
    );

  /* ============================================================
     COUNTER COLOR
  ============================================================ */

  const counterColor =
    useMemo(() => {
      if (isAtLimit) {
        return Colors.error;
      }

      if (isNearLimit) {
        return Colors.warning;
      }

      return Colors.textMuted;
    }, [
      isAtLimit,
      isNearLimit,
    ]);

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View
      style={[
        styles.card,

        focused &&
        !disabled
          ? styles.cardFocused
          : null,

        disabled
          ? styles.disabled
          : null,
      ]}
    >
      {/* ======================================================
          INPUT ROW
      ====================================================== */}

      <View
        style={
          styles.inputRow
        }
      >
        {/* ====================================================
            ICON
        ==================================================== */}

        <View
          style={[
            styles.iconBox,

            focused &&
            !disabled
              ? styles.iconBoxFocused
              : null,
          ]}
        >
          <AppIcon
            name="file"
            role="customer"
            size="sm"
            state={
              focused
                ? "active"
                : "muted"
            }
          />
        </View>

        {/* ====================================================
            INPUT
        ==================================================== */}

        <TextInput
          value={value}
          onChangeText={
            handleChangeText
          }
          onFocus={() =>
            setFocused(
              true,
            )
          }
          onBlur={() =>
            setFocused(
              false,
            )
          }
          editable={
            !disabled
          }
          multiline
          maxLength={
            MAX_LENGTH
          }
          textAlignVertical="top"
          placeholder="Describe the service you need..."
          placeholderTextColor={
            Colors.textMuted
          }
          selectionColor={
            CustomerColors.primary
          }
          accessibilityLabel="Service description"
          accessibilityHint="Briefly describe what you need the worker to do"
          style={
            styles.input
          }
        />
      </View>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <View
        style={
          styles.footer
        }
      >
        <AppText
          variant="caption"
          tone="muted"
          style={
            styles.hint
          }
        >
          Tell us briefly what you need
        </AppText>

        <AppText
          variant="caption"
          weight="semibold"
          style={[
            styles.counter,

            {
              color:
                counterColor,
            },
          ]}
        >
          {characterCount}/
          {MAX_LENGTH}
        </AppText>
      </View>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       CARD
    ======================================================== */

    card: {
      width: "100%",

      minHeight: 132,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    cardFocused: {
      borderColor:
        CustomerColors.primary,
    },

    disabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    /* ========================================================
       INPUT ROW
    ======================================================== */

    inputRow: {
      flex: 1,

      minHeight: 76,

      flexDirection:
        "row",

      alignItems:
        "flex-start",
    },

    /* ========================================================
       ICON
    ======================================================== */

    iconBox: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius
          .iconButton,

      backgroundColor:
        Colors.disabledBackground,
    },

    iconBoxFocused: {
      backgroundColor:
        CustomerColors.primarySoft,
    },

    /* ========================================================
       INPUT
    ======================================================== */

    input: {
      flex: 1,

      minHeight: 76,

      paddingTop:
        FixxamTokens.spacing.xs,

      paddingBottom:
        FixxamTokens.spacing.xs,

      paddingHorizontal: 0,

      fontSize:
        Typography.fontSize.md,

      color:
        Colors.textPrimary,

      textAlignVertical:
        "top",
    },

    /* ========================================================
       FOOTER
    ======================================================== */

    footer: {
      minHeight: 28,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.xs,
    },

    hint: {
      flex: 1,

      minWidth: 0,
    },

    counter: {
      flexShrink: 0,

      textAlign:
        "right",
    },
  });

export default memo(
  RequestDescription,
);