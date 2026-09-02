import React, {
  memo,
  useMemo,
  useState,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import BookingCard from "./BookingCard";
import BookingDateHeader from "./BookingDateHeader";
import BookingDateBadge from "./BookingDateBadge";
import BookingDatePicker from "./BookingDatePicker";

import useBookingDate from "@/hooks/booking/useBookingDate";

type Props = {
  value: Date;
  onChange: (date: Date) => void;
};

function BookingDateCard({
  value,
  onChange,
}: Props) {
  const [
    showPicker,
    setShowPicker,
  ] = useState(false);

  const maximumDate =
    useMemo(() => {
      const date = new Date();

      date.setMonth(
        date.getMonth() + 3,
      );

      return date;
    }, []);

  const bookingDate =
    useBookingDate({
      value,
    });

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Select booking date"
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
            <BookingDateHeader
              displayDate={
                bookingDate.displayDate
              }
              formattedDate={
                bookingDate.formattedDate
              }
            />

            <BookingDateBadge
              badgeText={
                bookingDate.badgeText
              }
              badgeColor={
                bookingDate.badgeColor
              }
              badgeBackground={
                bookingDate.badgeBackground
              }
              isToday={
                bookingDate.isToday
              }
            />
          </View>
        </BookingCard>
      </Pressable>

      <BookingDatePicker
        visible={showPicker}
        value={value}
        maximumDate={maximumDate}
        onClose={() =>
          setShowPicker(false)
        }
        onChange={onChange}
      />
    </>
  );
}

export default memo(
  BookingDateCard,
);

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 16,
  },

  pressed: {
    opacity: 0.82,
  },

  row: {
    flexDirection: "row",

    justifyContent:
      "space-between",

    alignItems: "center",
  },
});