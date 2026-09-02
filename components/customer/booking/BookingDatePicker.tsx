import React, {
  memo,
} from "react";

import {
  Platform,
} from "react-native";

import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

type Props = {
  visible: boolean;

  value: Date;

  maximumDate: Date;

  onClose: () => void;

  onChange: (
    date: Date
  ) => void;
};

function BookingDatePicker({

  visible,

  value,

  maximumDate,

  onClose,

  onChange,

}: Props) {

  if (!visible) {
    return null;
  }

  function handleChange(
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) {

    onClose();

    if (
      event.type === "dismissed"
    ) {
      return;
    }

    if (selectedDate) {

      onChange(
        selectedDate
      );

    }

  }

  return (

    <DateTimePicker
      value={value}
      mode="date"
      display={
        Platform.OS === "ios"
          ? "spinner"
          : "default"
      }
      minimumDate={
        new Date()
      }
      maximumDate={
        maximumDate
      }
      onChange={
        handleChange
      }
    />

  );

}

export default memo(
  BookingDatePicker
);