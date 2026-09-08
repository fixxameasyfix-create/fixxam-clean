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
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

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
  const [
    showDatePicker,
    setShowDatePicker,
  ] =
    useState(false);

  const [
    showTimePicker,
    setShowTimePicker,
  ] =
    useState(false);

  /* ============================================================
     DEFAULT FUTURE DATE
  ============================================================ */

  const defaultScheduleDate =
    useMemo(() => {
      if (
        scheduledDate
      ) {
        return scheduledDate;
      }

      const nextDate =
        new Date();

      nextDate.setDate(
        nextDate.getDate() +
          1,
      );

      nextDate.setHours(
        9,
        0,
        0,
        0,
      );

      return nextDate;
    }, [
      scheduledDate,
    ]);

  /* ============================================================
     DISPLAY DATE
  ============================================================ */

  const displayDate =
    scheduledDate ??
    defaultScheduleDate;

  const formattedDate =
    useMemo(
      () =>
        displayDate.toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
            year: "numeric",
          },
        ),
      [
        displayDate,
      ],
    );

  const formattedTime =
    useMemo(
      () =>
        displayDate.toLocaleTimeString(
          "en-US",
          {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          },
        ),
      [
        displayDate,
      ],
    );

  /* ============================================================
     ASAP
  ============================================================ */

  const handleAsapPress =
    useCallback(() => {
      if (
        disabled
      ) {
        return;
      }

      setShowDatePicker(
        false,
      );

      setShowTimePicker(
        false,
      );

      onChange(
        "asap",
      );
    }, [
      disabled,
      onChange,
    ]);

  /* ============================================================
     SCHEDULE
  ============================================================ */

  const handleSchedulePress =
    useCallback(() => {
      if (
        disabled
      ) {
        return;
      }

      onChange(
        "schedule",
      );

      if (
        !scheduledDate &&
        onScheduledDateChange
      ) {
        onScheduledDateChange(
          defaultScheduleDate,
        );
      }

      setShowTimePicker(
        false,
      );

      setShowDatePicker(
        true,
      );
    }, [
      defaultScheduleDate,
      disabled,
      onChange,
      onScheduledDateChange,
      scheduledDate,
    ]);

  /* ============================================================
     DATE CHANGE
  ============================================================ */

  const handleDateChange =
    useCallback(
      (
        event:
          DateTimePickerEvent,
        selectedDate?: Date,
      ) => {
        setShowDatePicker(
          false,
        );

        if (
          event.type ===
            "dismissed" ||
          !selectedDate
        ) {
          return;
        }

        const current =
          scheduledDate ??
          defaultScheduleDate;

        const nextDate =
          new Date(
            selectedDate,
          );

        nextDate.setHours(
          current.getHours(),
          current.getMinutes(),
          0,
          0,
        );

        onScheduledDateChange?.(
          nextDate,
        );

        setTimeout(
          () => {
            setShowTimePicker(
              true,
            );
          },
          FixxamTokens.motion.fast,
        );
      },
      [
        defaultScheduleDate,
        onScheduledDateChange,
        scheduledDate,
      ],
    );

  /* ============================================================
     TIME CHANGE
  ============================================================ */

  const handleTimeChange =
    useCallback(
      (
        event:
          DateTimePickerEvent,
        selectedTime?: Date,
      ) => {
        setShowTimePicker(
          false,
        );

        if (
          event.type ===
            "dismissed" ||
          !selectedTime
        ) {
          return;
        }

        const current =
          scheduledDate ??
          defaultScheduleDate;

        const nextDate =
          new Date(
            current,
          );

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
        defaultScheduleDate,
        onScheduledDateChange,
        scheduledDate,
      ],
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
        {/* ====================================================
            ASAP
        ==================================================== */}

        <TimingCard
          icon="clock"
          title="ASAP"
          subtitle="As soon as possible"
          selected={
            value === "asap"
          }
          disabled={
            disabled
          }
          onPress={
            handleAsapPress
          }
        />

        {/* ====================================================
            SCHEDULE
        ==================================================== */}

        <TimingCard
          icon="calendar"
          title="Schedule"
          subtitle="Choose date & time"
          selected={
            value ===
            "schedule"
          }
          disabled={
            disabled
          }
          scheduled={
            value ===
            "schedule"
          }
          date={
            formattedDate
          }
          time={
            formattedTime
          }
          onPress={
            handleSchedulePress
          }
        />
      </View>

      {/* ========================================================
          DATE PICKER
      ======================================================== */}

      {showDatePicker ? (
        <DateTimePicker
          value={
            displayDate
          }
          mode="date"
          minimumDate={
            new Date()
          }
          display="default"
          onChange={
            handleDateChange
          }
        />
      ) : null}

      {/* ========================================================
          TIME PICKER
      ======================================================== */}

      {showTimePicker ? (
        <DateTimePicker
          value={
            displayDate
          }
          mode="time"
          is24Hour={false}
          display="default"
          onChange={
            handleTimeChange
          }
        />
      ) : null}
    </>
  );
}

/* ==============================================================
   TIMING CARD
============================================================== */

function TimingCard({
  icon,
  title,
  subtitle,
  selected,
  disabled,
  scheduled = false,
  date,
  time,
  onPress,
}: {
  icon:
    | "clock"
    | "calendar";

  title: string;

  subtitle: string;

  selected: boolean;

  disabled: boolean;

  scheduled?: boolean;

  date?: string;

  time?: string;

  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        title
      }
      accessibilityState={{
        selected,
        disabled,
      }}
      disabled={
        disabled
      }
      onPress={
        onPress
      }
      style={({
        pressed,
      }) => [
        styles.card,

        selected
          ? styles.cardSelected
          : null,

        pressed &&
        !disabled
          ? styles.cardPressed
          : null,

        disabled
          ? styles.cardDisabled
          : null,
      ]}
    >
      {/* ======================================================
          ICON
      ====================================================== */}

      <View
        style={[
          styles.iconBox,

          selected
            ? styles.iconBoxSelected
            : null,
        ]}
      >
        <AppIcon
          name={icon}
          role="customer"
          size="md"
          state={
            selected
              ? "active"
              : "muted"
          }
        />
      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <View
        style={
          styles.cardContent
        }
      >
        <AppText
          variant="bodyLarge"
          weight="bold"
          numberOfLines={1}
          style={
            selected
              ? styles.titleSelected
              : undefined
          }
        >
          {title}
        </AppText>

        {scheduled ? (
          <>
            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={
                styles.scheduleDate
              }
            >
              {date}
            </AppText>

            <AppText
              variant="bodyMedium"
              weight="semibold"
              numberOfLines={1}
              style={
                styles.scheduleTime
              }
            >
              {time}
            </AppText>
          </>
        ) : (
          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={2}
            style={
              styles.subtitle
            }
          >
            {subtitle}
          </AppText>
        )}
      </View>

      {/* ======================================================
          SELECTED INDICATOR
      ====================================================== */}

      {selected ? (
        <View
          style={
            styles.selectedIndicator
          }
        >
          <AppIcon
            name="check"
            role="customer"
            size="xs"
            state="inverse"
            strokeWidth="strong"
          />
        </View>
      ) : null}
    </Pressable>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      flexDirection:
        "row",

      gap:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      flex: 1,

      minWidth: 0,

      minHeight:
        FixxamTokens.size
          .roleCardHeight +
        FixxamTokens.spacing.xxxl,

      position:
        "relative",

      padding:
        FixxamTokens.spacing.lg,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    cardSelected: {
      borderWidth: 2,

      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    cardPressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },

    cardDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    /* ========================================================
       ICON
    ======================================================== */

    iconBox: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginBottom:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.disabledBackground,
    },

    iconBoxSelected: {
      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    cardContent: {
      width: "100%",

      minWidth: 0,
    },

    titleSelected: {
      color:
        CustomerColors.primary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       SCHEDULE
    ======================================================== */

    scheduleDate: {
      marginTop:
        FixxamTokens.spacing.xs,
    },

    scheduleTime: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        CustomerColors.primary,
    },

    /* ========================================================
       SELECTED
    ======================================================== */

    selectedIndicator: {
      position:
        "absolute",

      top:
        FixxamTokens.spacing.sm,

      right:
        FixxamTokens.spacing.sm,

      width: 24,

      height: 24,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primary,
    },
  });

export default memo(
  RequestTiming,
);