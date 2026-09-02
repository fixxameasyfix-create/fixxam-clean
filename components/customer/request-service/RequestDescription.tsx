import React, {
  useCallback,
  useMemo,
} from "react";

import {
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

/* ==============================================================
   TYPES
============================================================== */

type RequestDescriptionProps = {
  value: string;
  onChangeText: (value: string) => void;
  disabled?: boolean;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const MAX_LENGTH = 300;

/* ==============================================================
   COMPONENT
============================================================== */

export default function RequestDescription({
  value,
  onChangeText,
  disabled = false,
}: RequestDescriptionProps) {
  const characterCount = value.length;

  const isNearLimit =
    characterCount >= 270;

  const isAtLimit =
    characterCount >= MAX_LENGTH;

  /* ============================================================
     CHANGE
  ============================================================ */

  const handleChangeText =
    useCallback(
      (text: string) => {
        onChangeText(
          text.slice(0, MAX_LENGTH),
        );
      },
      [onChangeText],
    );

  /* ============================================================
     COUNTER STYLE
  ============================================================ */

  const counterStyle = useMemo(() => {
    if (isAtLimit) {
      return styles.counterLimit;
    }

    if (isNearLimit) {
      return styles.counterWarning;
    }

    return styles.counterNormal;
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
        disabled && styles.disabled,
      ]}
    >
      {/* ======================================================
          INPUT
      ====================================================== */}

      <View style={styles.inputRow}>
        {/* ----------------------------------------------------
            ICON
        ---------------------------------------------------- */}

        <View style={styles.iconBox}>
          <Ionicons
            name="create-outline"
            size={19}
            color="#2563EB"
          />
        </View>

        {/* ----------------------------------------------------
            INPUT
        ---------------------------------------------------- */}

        <TextInput
          value={value}
          onChangeText={
            handleChangeText
          }
          editable={!disabled}
          multiline
          maxLength={MAX_LENGTH}
          textAlignVertical="top"
          placeholder="Describe the service you need..."
          placeholderTextColor="#A0AEC0"
          selectionColor="#2563EB"
          style={styles.input}
          accessibilityRole="text"
          accessibilityLabel="Service description"
        />
      </View>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <View style={styles.footer}>
        <AppText
          style={styles.hint}
        >
          Tell us briefly what you need
        </AppText>

        <AppText
          style={[
            styles.counter,
            counterStyle,
          ]}
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
    /* ==========================================================
       CARD
    ========================================================== */

    card: {
      height: 125,

      borderRadius: 18,

      backgroundColor:
        "#FFFFFF",

      borderWidth: 1,

      borderColor:
        "#E2E8F0",

      paddingHorizontal: 13,

      paddingTop: 11,

      paddingBottom: 9,

      shadowColor:
        "#0F172A",

      shadowOpacity: 0.04,

      shadowRadius: 8,

      shadowOffset: {
        width: 0,
        height: 3,
      },

      elevation: 2,
    },

    disabled: {
      opacity: 0.6,
    },

    /* ==========================================================
       INPUT ROW
    ========================================================== */

    inputRow: {
      flex: 1,

      flexDirection:
        "row",

      alignItems:
        "flex-start",
    },

    /* ==========================================================
       ICON
    ========================================================== */

    iconBox: {
      width: 34,

      height: 34,

      borderRadius: 11,

      backgroundColor:
        "#EFF6FF",

      borderWidth: 1,

      borderColor:
        "#DBEAFE",

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight: 9,

      flexShrink: 0,
    },

    /* ==========================================================
       INPUT
    ========================================================== */

    input: {
      flex: 1,

      minHeight: 68,

      paddingTop: 4,

      paddingBottom: 4,

      paddingHorizontal: 0,

      fontSize: 14,

      lineHeight: 20,

      color: "#0F172A",

      textAlignVertical:
        "top",
    },

    /* ==========================================================
       FOOTER
    ========================================================== */

    footer: {
      height: 23,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginTop: 3,
    },

    /* ==========================================================
       HINT
    ========================================================== */

    hint: {
      flex: 1,

      fontSize: 10.5,

      lineHeight: 15,

      color: "#94A3B8",
    },

    /* ==========================================================
       COUNTER
    ========================================================== */

    counter: {
      marginLeft: 8,

      fontSize: 10.5,

      lineHeight: 15,

      color: "#94A3B8",

      textAlign:
        "right",
    },

    counterNormal: {
      color: "#94A3B8",
    },

    counterWarning: {
      color: "#F59E0B",
    },

    counterLimit: {
      color: "#EF4444",
    },
  });