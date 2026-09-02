import React, {
  memo,
  useState,
} from "react";

import {
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

import BookingCard from "./BookingCard";

type Props = {
  value: string;

  onChange: (
    text: string
  ) => void;

  onFocus?: () => void;
};

function BookingNoteCard({
  value,
  onChange,
  onFocus,
}: Props) {
  const [
    focused,
    setFocused,
  ] = useState(false);

  return (
    <BookingCard>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <View
        style={styles.header}
      >
        <View
          style={styles.iconBox}
        >
          <Ionicons
            name="document-text-outline"
            size={16}
            color="#F97316"
          />
        </View>

        <AppText
          weight="bold"
          style={styles.title}
        >
          Additional Details
        </AppText>
      </View>

      {/* =====================================================
          INPUT
      ===================================================== */}

      <TextInput
        accessibilityRole="text"
        accessibilityLabel="Additional booking details"
        value={value}
        onChangeText={onChange}
        placeholder="Describe the problem..."
        placeholderTextColor="#94A3B8"
        multiline
        maxLength={500}
        textAlignVertical="top"
        returnKeyType="default"
        blurOnSubmit={false}
        scrollEnabled
        onFocus={() => {
          setFocused(true);

          /*
           * Tell BookingScreen that this
           * input is now focused.
           *
           * BookingScreen will handle the
           * actual auto-scroll.
           */
          onFocus?.();
        }}
        onBlur={() => {
          setFocused(false);
        }}
        style={[
          styles.input,
          focused &&
            styles.inputFocused,
        ]}
      />

      {/* =====================================================
          COUNTER
      ===================================================== */}

      <AppText
        style={styles.counter}
      >
        {value.length}/500
      </AppText>
    </BookingCard>
  );
}

export default memo(
  BookingNoteCard,
);

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  header: {
    flexDirection:
      "row",

    alignItems:
      "center",

    marginBottom: 8,
  },

  iconBox: {
    width: 30,

    height: 30,

    borderRadius: 9,

    backgroundColor:
      "#FFF7ED",

    alignItems:
      "center",

    justifyContent:
      "center",

    marginRight: 8,
  },

  title: {
    fontSize: 14,

    lineHeight: 19,

    color: "#0F172A",
  },

  input: {
    height: 82,

    backgroundColor:
      "#F8FAFC",

    borderRadius: 12,

    borderWidth: 1,

    borderColor:
      "#E2E8F0",

    paddingHorizontal: 11,

    paddingTop: 10,

    paddingBottom: 8,

    fontSize: 13,

    lineHeight: 18,

    color: "#0F172A",
  },

  inputFocused: {
    borderColor:
      "#F97316",
  },

  counter: {
    marginTop: 4,

    alignSelf:
      "flex-end",

    fontSize: 10,

    lineHeight: 14,

    color: "#94A3B8",
  },
});