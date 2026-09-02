import React, {
  memo,
  useState,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import BookingCard from "./BookingCard";

import BookingTimeHeader from "./BookingTimeHeader";
import BookingTimeBadge from "./BookingTimeBadge";
import BookingTimePicker from "../request-service/BookingTimePicker";

import useBookingTime from "@/hooks/booking/useBookingTime";

type Props = {
  value: Date;
  onChange: (date: Date) => void;
};

function BookingTimeCard({
  value,
  onChange,
}: Props) {
  const [
    showPicker,
    setShowPicker,
  ] = useState(false);

  const bookingTime =
    useBookingTime({
      value,
    });

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Select booking time"
        style={({ pressed }) => [
          styles.pressable,
          pressed && styles.pressed,
        ]}
        onPress={() =>
          setShowPicker(true)
        }
      >
        <BookingCard>
          <View style={styles.row}>
            <BookingTimeHeader
              displayTime={
                bookingTime.displayTime
              }
              period={
                bookingTime.period
              }
            />

            <BookingTimeBadge
              badgeText={
                bookingTime.badgeText
              }
              badgeColor={
                bookingTime.badgeColor
              }
              badgeBackground={
                bookingTime.badgeBackground
              }
              period={
                bookingTime.period
              }
            />
          </View>
        </BookingCard>
      </Pressable>

      <BookingTimePicker
        visible={showPicker}
        value={value}
        onClose={() =>
          setShowPicker(false)
        }
        onChange={onChange}
      />
    </>
  );
}

export default memo(
  BookingTimeCard,
);

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 24,
  },

  pressed: {
    opacity: 0.96,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});