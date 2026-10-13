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
    useMemo(
      () => {
        if (
          isAtLimit
        ) {
          return Colors.error;
        }

        if (
          isNearLimit
        ) {
          return Colors.warning;
        }

        return Colors.textMuted;
      },
      [
        isAtLimit,
        isNearLimit,
      ],
    );

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View
      style={[
        styles.container,

        focused &&
          !disabled &&
          styles.focused,

        disabled &&
          styles.disabled,
      ]}
    >
      <TextInput
        value={
          value
        }
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
        scrollEnabled
        maxLength={
          MAX_LENGTH
        }
        textAlignVertical="top"
        placeholder="Describe the problem, what needs to be done, or any important details..."
        placeholderTextColor={
          Colors.textMuted
        }
        selectionColor={
          CustomerColors.primary
        }
        accessibilityLabel="Service description"
        accessibilityHint="Describe what you need the provider to do"
        style={
          styles.input
        }
      />

      <View
        style={
          styles.footer
        }
      >
        <AppText
          variant="caption"
          style={{
            color:
              counterColor,
          }}
        >
          {characterCount}/{MAX_LENGTH}
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
    container: {
      width:
        "100%",

      minHeight:
        148,

      paddingHorizontal:
        16,

      paddingTop:
        15,

      paddingBottom:
        10,

      borderWidth:
        1,

      borderColor:
        "#DDE5EF",

      borderRadius:
        14,

      backgroundColor:
        "#FFFFFF",
    },

    focused: {
      borderColor:
        "#3B82F6",

      borderWidth:
        1.5,
    },

    disabled: {
      opacity:
        FixxamTokens.motion.disabledOpacity,

      backgroundColor:
        "#F8FAFC",
    },

    input: {
      minHeight:
        100,

      maxHeight:
        180,

      padding:
        0,

      fontSize:
        Typography.fontSize.md,

      lineHeight:
        22,

      color:
        "#0F172A",

      textAlignVertical:
        "top",
    },

    footer: {
      minHeight:
        22,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "flex-end",

      marginTop:
        6,
    },
  });
export default memo(
  RequestDescription,
);