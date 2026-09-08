import React, {
  memo,
  useCallback,
} from "react";

import {
  Platform,
} from "react-native";

import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  visible: boolean;

  value: Date;

  onClose: () => void;

  onChange: (
    date: Date,
  ) => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function BookingTimePicker({
  visible,
  value,
  onClose,
  onChange,
}: Props) {
  /* ============================================================
     CHANGE
  ============================================================ */

  const handleChange =
    useCallback(
      (
        event:
          DateTimePickerEvent,
        selectedTime?: Date,
      ) => {
        /*
         * Android native picker is a dialog.
         * It should close after either
         * selection or dismissal.
         *
         * iOS spinner stays mounted so the
         * customer can finish adjusting
         * the selected time.
         */
        if (
          Platform.OS ===
          "android"
        ) {
          onClose();
        }

        if (
          event.type !==
            "set" ||
          !selectedTime
        ) {
          return;
        }

        onChange(
          selectedTime,
        );
      },
      [
        onChange,
        onClose,
      ],
    );

  /* ============================================================
     HIDDEN
  ============================================================ */

  if (!visible) {
    return null;
  }

  /* ============================================================
     PICKER
  ============================================================ */

  return (
    <DateTimePicker
      value={value}
      mode="time"
      is24Hour={false}
      display={
        Platform.OS ===
        "ios"
          ? "spinner"
          : "default"
      }
      onChange={
        handleChange
      }
    />
  );
}

export default memo(
  BookingTimePicker,
);