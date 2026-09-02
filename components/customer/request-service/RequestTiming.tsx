import React, {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { AppText } from "@/components/ui";

/* ==============================================================
   TYPES
============================================================== */

export type RequestTimingValue =
  | "asap"
  | "schedule";

type Props = {
  value: RequestTimingValue;

  onChange: (
    value: RequestTimingValue,
  ) => void;

  disabled?: boolean;

  scheduledDate?: Date | null;

  onScheduledDateChange?: (
    date: Date,
  ) => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function RequestTiming({
  value,
  onChange,
  disabled = false,
  scheduledDate,
  onScheduledDateChange,
}: Props) {
  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [showTimePicker, setShowTimePicker] =
    useState(false);

  /* ============================================================
     DEFAULT DATE
  ============================================================ */

  const defaultScheduleDate = useMemo(() => {
    if (scheduledDate) {
      return scheduledDate;
    }

    const date = new Date();

    date.setDate(
      date.getDate() + 1,
    );

    date.setHours(
      9,
      0,
      0,
      0,
    );

    return date;
  }, [scheduledDate]);

  /* ============================================================
     SELECT ASAP
  ============================================================ */

  const handleAsapPress =
    useCallback(() => {
      if (disabled) {
        return;
      }

      onChange("asap");
    }, [
      disabled,
      onChange,
    ]);

  /* ============================================================
     SELECT SCHEDULE
  ============================================================ */

  const handleSchedulePress =
    useCallback(() => {
      if (disabled) {
        return;
      }

      onChange("schedule");

      /*
       * If there is no date yet, create
       * a sensible default future date.
       */
      if (
        !scheduledDate &&
        onScheduledDateChange
      ) {
        onScheduledDateChange(
          defaultScheduleDate,
        );
      }

      /*
       * Open date picker first.
       */
      setShowDatePicker(true);
    }, [
      disabled,
      onChange,
      scheduledDate,
      onScheduledDateChange,
      defaultScheduleDate,
    ]);

  /* ============================================================
     DATE CHANGE
  ============================================================ */

  const handleDateChange =
    useCallback(
      (
        event: DateTimePickerEvent,
        selectedDate?: Date,
      ) => {
        setShowDatePicker(false);

        if (
          event.type ===
          "dismissed"
        ) {
          return;
        }

        if (!selectedDate) {
          return;
        }

        /*
         * Preserve the currently selected
         * time when changing only the date.
         */
        const current =
          scheduledDate ??
          defaultScheduleDate;

        const nextDate =
          new Date(selectedDate);

        nextDate.setHours(
          current.getHours(),
          current.getMinutes(),
          0,
          0,
        );

        onScheduledDateChange?.(
          nextDate,
        );

        /*
         * After selecting date,
         * open time picker.
         */
        setTimeout(() => {
          setShowTimePicker(true);
        }, 120);
      },
      [
        scheduledDate,
        defaultScheduleDate,
        onScheduledDateChange,
      ],
    );

  /* ============================================================
     TIME CHANGE
  ============================================================ */

  const handleTimeChange =
    useCallback(
      (
        event: DateTimePickerEvent,
        selectedTime?: Date,
      ) => {
        setShowTimePicker(false);

        if (
          event.type ===
          "dismissed"
        ) {
          return;
        }

        if (!selectedTime) {
          return;
        }

        const current =
          scheduledDate ??
          defaultScheduleDate;

        const nextDate =
          new Date(current);

        nextDate.setHours(
          selectedTime.getHours(),
          selectedTime.getMinutes(),
          0,
          0,
        );

        onScheduledDateChange?.(
          nextDate,
        );
      },
      [
        scheduledDate,
        defaultScheduleDate,
        onScheduledDateChange,
      ],
    );

  /* ============================================================
     DISPLAY DATE
  ============================================================ */

  const displayDate =
    scheduledDate ??
    defaultScheduleDate;

  const formattedDate =
    displayDate.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      },
    );

  const formattedTime =
    displayDate.toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      },
    );

  /* ============================================================
     UI
  ============================================================ */

  return (
    <>
      <View
        style={
          styles.container
        }
      >
        {/* ======================================================
            ASAP
        ====================================================== */}

        <Pressable
          disabled={disabled}
          onPress={
            handleAsapPress
          }
          accessibilityRole="button"
          accessibilityLabel="ASAP"
          accessibilityState={{
            selected:
              value === "asap",
            disabled,
          }}
          style={({ pressed }) => [
            styles.card,

            value === "asap" &&
              styles.cardSelected,

            pressed &&
              !disabled &&
              styles.cardPressed,

            disabled &&
              styles.cardDisabled,
          ]}
        >
          {/* ICON */}

          <View
            style={
              styles.iconBox
            }
          >
            <AppText
              style={
                styles.asapIcon
              }
            >
              ⚡
            </AppText>
          </View>

          {/* CONTENT */}

          <View
            style={
              styles.cardContent
            }
          >
            <AppText
              weight="bold"
              numberOfLines={1}
              style={[
                styles.cardTitle,

                value ===
                  "asap" &&
                  styles.cardTitleSelected,
              ]}
            >
              ASAP
            </AppText>

            <AppText
              numberOfLines={2}
              style={
                styles.cardSubtitle
              }
            >
              As soon as possible
            </AppText>
          </View>
        </Pressable>

        {/* ======================================================
            SCHEDULE
        ====================================================== */}

        <Pressable
          disabled={disabled}
          onPress={
            handleSchedulePress
          }
          accessibilityRole="button"
          accessibilityLabel="Schedule service"
          accessibilityState={{
            selected:
              value ===
              "schedule",
            disabled,
          }}
          style={({ pressed }) => [
            styles.card,

            value ===
              "schedule" &&
              styles.cardSelected,

            pressed &&
              !disabled &&
              styles.cardPressed,

            disabled &&
              styles.cardDisabled,
          ]}
        >
          {/* ICON */}

          <View
            style={[
              styles.iconBox,

              value ===
                "schedule" &&
                styles.iconBoxSelected,
            ]}
          >
            <AppText
              style={
                styles.calendarIcon
              }
            >
              📅
            </AppText>
          </View>

          {/* CONTENT */}

          <View
            style={
              styles.cardContent
            }
          >
            <AppText
              weight="bold"
              numberOfLines={1}
              style={[
                styles.cardTitle,

                value ===
                  "schedule" &&
                  styles.cardTitleSelected,
              ]}
            >
              Schedule
            </AppText>

            {value ===
            "schedule" ? (
              <>
                <AppText
                  numberOfLines={1}
                  style={
                    styles.scheduleDate
                  }
                >
                  {formattedDate}
                </AppText>

                <AppText
                  numberOfLines={1}
                  style={
                    styles.scheduleTime
                  }
                >
                  {formattedTime}
                </AppText>
              </>
            ) : (
              <AppText
                numberOfLines={2}
                style={
                  styles.cardSubtitle
                }
              >
                Choose date & time
              </AppText>
            )}
          </View>
        </Pressable>
      </View>

      {/* ========================================================
          DATE PICKER
      ======================================================== */}

      {showDatePicker && (
        <DateTimePicker
          value={displayDate}
          mode="date"
          minimumDate={
            new Date()
          }
          display="default"
          onChange={
            handleDateChange
          }
        />
      )}

      {/* ========================================================
          TIME PICKER
      ======================================================== */}

      {showTimePicker && (
        <DateTimePicker
          value={displayDate}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={
            handleTimeChange
          }
        />
      )}
    </>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      flexDirection: "row",

      gap: 12,

      width: "100%",
    },

    /* ==========================================================
       CARD
    ========================================================== */

    card: {
      flex: 1,

      minWidth: 0,

      minHeight: 154,

      borderRadius: 22,

      paddingHorizontal: 16,

      paddingVertical: 16,

      backgroundColor:
        "#FFFFFF",

      borderWidth: 1.5,

      borderColor:
        "#E2E8F0",

      alignItems: "flex-start",

      justifyContent:
        "flex-start",
    },

    cardSelected: {
      borderColor:
        "#2563EB",

      borderWidth: 2,
    },

    cardPressed: {
      opacity: 0.85,

      transform: [
        {
          scale: 0.985,
        },
      ],
    },

    cardDisabled: {
      opacity: 0.55,
    },

    /* ==========================================================
       ICON
    ========================================================== */

    iconBox: {
      width: 70,

      height: 70,

      borderRadius: 18,

      backgroundColor:
        "#EFF6FF",

      borderWidth: 1,

      borderColor:
        "#DBEAFE",

      alignItems: "center",

      justifyContent:
        "center",

      marginBottom: 12,
    },

    iconBoxSelected: {
      backgroundColor:
        "#EFF6FF",

      borderColor:
        "#DBEAFE",
    },

    asapIcon: {
      fontSize: 42,

      lineHeight: 50,

      textAlign: "center",
    },

    calendarIcon: {
      fontSize: 38,

      lineHeight: 46,

      textAlign: "center",
    },

    /* ==========================================================
       CONTENT
    ========================================================== */

    cardContent: {
      width: "100%",

      minWidth: 0,
    },

    cardTitle: {
      fontSize: 18,

      lineHeight: 23,

      color: "#0F172A",

      textTransform:
        "none",
    },

    cardTitleSelected: {
      color: "#2563EB",
    },

    cardSubtitle: {
      marginTop: 4,

      fontSize: 14,

      lineHeight: 20,

      color: "#64748B",
    },

    /* ==========================================================
       SCHEDULE DATA
    ========================================================== */

    scheduleDate: {
      marginTop: 5,

      fontSize: 14,

      lineHeight: 19,

      color: "#64748B",
    },

    scheduleTime: {
      marginTop: 1,

      fontSize: 15,

      lineHeight: 20,

      fontWeight:
        "700",

      color: "#2563EB",
    },
  });

export default memo(
  RequestTiming,
);