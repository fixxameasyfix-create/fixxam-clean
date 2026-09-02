import React, { memo } from "react";

import {
  Platform,
} from "react-native";

import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

type Props = {
  visible: boolean;

  value: Date;

  onClose: () => void;

  onChange: (date: Date) => void;
};

function BookingTimePicker({
  visible,
  value,
  onClose,
  onChange,
}: Props) {
  if (!visible) {
    return null;
  }

  const handleChange = (
    event: DateTimePickerEvent,
    selectedTime?: Date,
  ) => {
    /*
     * Android picker closes automatically
     * after selection/dismissal.
     */
    onClose();

    if (event.type !== "set") {
      return;
    }

    if (!selectedTime) {
      return;
    }

    onChange(selectedTime);
  };

  return (
    <DateTimePicker
      value={value}
      mode="time"
      is24Hour={false}
      display={
        Platform.OS === "ios"
          ? "spinner"
          : "default"
      }
      onChange={handleChange}
    />
  );
}

export default memo(
  BookingTimePicker,
);