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

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import {
  type BookingPriority,
} from "@/types/bookingPriority";

import BookingDatePickerModal from "./BookingDatePickerModal";
import BookingTimePickerModal from "./BookingTimePickerModal";

/* ==============================================================
   TYPES
============================================================== */

export type RequestTimingValue =
  | "asap"
  | "schedule";

type Props = {
  value: RequestTimingValue;

  bookingPriority:
    BookingPriority | null;

  onPriorityPress: () => void;

  onChange: (
    value: RequestTimingValue,
  ) => void;

  disabled?: boolean;

  scheduledDate?: Date | null;

  onScheduledDateChange?: (
    date: Date,
  ) => void;
};

type MaterialIconName =
  React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];

/* ==============================================================
   HELPERS
============================================================== */

function createDefaultScheduleDate(): Date {
  const date =
    new Date();

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
}

/* ==============================================================
   COMPONENT
============================================================== */

function RequestTiming({
  value,
  bookingPriority,
  onPriorityPress,
  onChange,
  disabled = false,
  scheduledDate,
  onScheduledDateChange,
}: Props) {
  const [
    dateModalVisible,
    setDateModalVisible,
  ] =
    useState(false);

  const [
    timeModalVisible,
    setTimeModalVisible,
  ] =
    useState(false);

  /* ============================================================
     DEFAULT SCHEDULE
  ============================================================ */

  const defaultScheduleDate =
    useMemo(
      () =>
        createDefaultScheduleDate(),
      [],
    );

  const displayDate =
    scheduledDate ??
    defaultScheduleDate;

  /* ============================================================
     FORMATTED DATE
  ============================================================ */

  const formattedDate =
    useMemo(
      () =>
        displayDate.toLocaleDateString(
          "en-US",
          {
            weekday:
              "short",

            month:
              "short",

            day:
              "numeric",

            year:
              "numeric",
          },
        ),
      [
        displayDate,
      ],
    );

  /* ============================================================
     FORMATTED TIME
  ============================================================ */

  const formattedTime =
    useMemo(
      () =>
        displayDate.toLocaleTimeString(
          "en-US",
          {
            hour:
              "numeric",

            minute:
              "2-digit",

            hour12:
              true,
          },
        ),
      [
        displayDate,
      ],
    );

  /* ============================================================
     PRIORITY DISPLAY
  ============================================================ */

  const priorityDisplay =
    useMemo(
      (): {
        icon: MaterialIconName;
        title: string;
        description: string;
      } => {
        switch (
          bookingPriority
        ) {
          case "immediate":
            return {
              icon:
                "lightning-bolt-outline",

              title:
                "Immediately",

              description:
                "I need the service as soon as possible.",
            };

          case "urgent":
            return {
              icon:
                "alert-circle-outline",

              title:
                "Urgently",

              description:
                "I need this service handled urgently.",
            };

          case "normal":
            return {
              icon:
                "clock-outline",

              title:
                "Normally",

              description:
                "Standard service priority.",
            };

          default:
            return {
              icon:
                "clock-outline",

              title:
                "Service priority",

              description:
                "Choose how quickly you need this service.",
            };
        }
      },
      [
        bookingPriority,
      ],
    );

  /* ============================================================
     OPEN PRIORITY MODAL
  ============================================================ */

  const handlePriorityPress =
    useCallback(
      () => {
        if (
          disabled
        ) {
          return;
        }

        setDateModalVisible(
          false,
        );

        setTimeModalVisible(
          false,
        );

        onPriorityPress();
      },
      [
        disabled,
        onPriorityPress,
      ],
    );

  /* ============================================================
     OPEN DATE MODAL
  ============================================================ */

  const handleOpenDate =
    useCallback(
      () => {
        if (
          disabled
        ) {
          return;
        }

        onChange(
          "schedule",
        );

        if (
          !scheduledDate
        ) {
          onScheduledDateChange?.(
            defaultScheduleDate,
          );
        }

        setTimeModalVisible(
          false,
        );

        setDateModalVisible(
          true,
        );
      },
      [
        defaultScheduleDate,
        disabled,
        onChange,
        onScheduledDateChange,
        scheduledDate,
      ],
    );

  /* ============================================================
     CLOSE DATE MODAL
  ============================================================ */

  const handleCloseDate =
    useCallback(
      () => {
        if (
          disabled
        ) {
          return;
        }

        setDateModalVisible(
          false,
        );
      },
      [
        disabled,
      ],
    );

  /* ============================================================
     DATE SELECTED
  ============================================================ */

  const handleDateSelected =
    useCallback(
      (
        selectedDate: Date,
      ) => {
        if (
          disabled
        ) {
          return;
        }

        onChange(
          "schedule",
        );

        onScheduledDateChange?.(
          selectedDate,
        );

        setDateModalVisible(
          false,
        );
      },
      [
        disabled,
        onChange,
        onScheduledDateChange,
      ],
    );

  /* ============================================================
     OPEN TIME MODAL
  ============================================================ */

  const handleOpenTime =
    useCallback(
      () => {
        if (
          disabled
        ) {
          return;
        }

        onChange(
          "schedule",
        );

        if (
          !scheduledDate
        ) {
          onScheduledDateChange?.(
            defaultScheduleDate,
          );
        }

        setDateModalVisible(
          false,
        );

        setTimeModalVisible(
          true,
        );
      },
      [
        defaultScheduleDate,
        disabled,
        onChange,
        onScheduledDateChange,
        scheduledDate,
      ],
    );

  /* ============================================================
     CLOSE TIME MODAL
  ============================================================ */

  const handleCloseTime =
    useCallback(
      () => {
        if (
          disabled
        ) {
          return;
        }

        setTimeModalVisible(
          false,
        );
      },
      [
        disabled,
      ],
    );

  /* ============================================================
     TIME SELECTED
  ============================================================ */

  const handleTimeSelected =
    useCallback(
      (
        selectedDate: Date,
      ) => {
        if (
          disabled
        ) {
          return;
        }

        onChange(
          "schedule",
        );

        onScheduledDateChange?.(
          selectedDate,
        );

        setTimeModalVisible(
          false,
        );
      },
      [
        disabled,
        onChange,
        onScheduledDateChange,
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
            PRIORITY DISPLAY

            For Immediately / Normally / Urgently only.
        ==================================================== */}

        {value ===
          "asap" &&
        bookingPriority ? (
          <PriorityDisplayCard
            icon={
              priorityDisplay.icon
            }
            title={
              priorityDisplay.title
            }
            description={
              priorityDisplay.description
            }
            disabled={
              disabled
            }
            onPress={
              handlePriorityPress
            }
          />
        ) : null}

        {/* ====================================================
            SCHEDULE DATE + TIME

            Schedule itself is selected in BookingPriorityStep.
            Only the actual date/time fields live here.
        ==================================================== */}

        {value ===
        "schedule" ? (
          <View
            style={
              styles.scheduleFields
            }
          >
            <ScheduleField
              label="Preferred Date"
              value={
                formattedDate
              }
              icon="calendar-blank-outline"
              disabled={
                disabled
              }
              onPress={
                handleOpenDate
              }
            />

            <ScheduleField
              label="Preferred Time"
              value={
                formattedTime
              }
              icon="clock-outline"
              disabled={
                disabled
              }
              onPress={
                handleOpenTime
              }
            />
          </View>
        ) : null}
      </View>

      {/* ========================================================
          DATE BOTTOM MODAL
      ======================================================== */}

      <BookingDatePickerModal
        visible={
          dateModalVisible
        }
        value={
          scheduledDate ??
          null
        }
        onChange={
          handleDateSelected
        }
        onClose={
          handleCloseDate
        }
        disabled={
          disabled
        }
      />

      {/* ========================================================
          TIME BOTTOM MODAL
      ======================================================== */}

      <BookingTimePickerModal
        visible={
          timeModalVisible
        }
        value={
          scheduledDate ??
          null
        }
        selectedDate={
          scheduledDate ??
          null
        }
        onChange={
          handleTimeSelected
        }
        onClose={
          handleCloseTime
        }
        disabled={
          disabled
        }
      />
    </>
  );
}

/* ==============================================================
   PRIORITY DISPLAY CARD
============================================================== */

function PriorityDisplayCard({
  icon,
  title,
  description,
  disabled,
  onPress,
}: {
  icon: MaterialIconName;

  title: string;

  description: string;

  disabled: boolean;

  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        title
      }
      accessibilityHint="Change service timing"
      accessibilityState={{
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
        styles.priorityCard,

        pressed &&
          !disabled &&
          styles.pressed,

        disabled &&
          styles.disabled,
      ]}
    >
      <View
        style={
          styles.priorityIcon
        }
      >
        <MaterialCommunityIcons
          name={
            icon
          }
          size={23}
          color={
            CustomerColors.primary
          }
        />
      </View>

      <View
        style={
          styles.priorityContent
        }
      >
        <AppText
          variant="bodyMedium"
          weight="bold"
          numberOfLines={1}
        >
          {title}
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={2}
          style={
            styles.priorityDescription
          }
        >
          {description}
        </AppText>
      </View>

      <MaterialCommunityIcons
        name="chevron-right"
        size={24}
        color={
          Colors.textSecondary
        }
      />
    </Pressable>
  );
}

/* ==============================================================
   SCHEDULE FIELD
============================================================== */

function ScheduleField({
  label,
  value,
  icon,
  disabled,
  onPress,
}: {
  label: string;

  value: string;

  icon: MaterialIconName;

  disabled: boolean;

  onPress: () => void;
}) {
  return (
    <View
      style={
        styles.fieldGroup
      }
    >
      <AppText
        variant="bodyLarge"
        weight="bold"
        style={
          styles.fieldLabel
        }
      >
        {label}
      </AppText>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value}`}
        accessibilityHint={`Change ${label.toLowerCase()}`}
        accessibilityState={{
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
          styles.scheduleField,

          pressed &&
            !disabled &&
            styles.pressed,

          disabled &&
            styles.disabled,
        ]}
      >
        <View
          style={
            styles.scheduleIcon
          }
        >
          <MaterialCommunityIcons
            name={
              icon
            }
            size={23}
            color={
              CustomerColors.primary
            }
          />
        </View>

        <AppText
          variant="bodyMedium"
          numberOfLines={1}
          style={
            styles.scheduleValue
          }
        >
          {value}
        </AppText>

        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={
            Colors.textSecondary
          }
        />
      </Pressable>
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
    },

    /* ========================================================
       PRIORITY
    ======================================================== */

    priorityCard: {
      width:
        "100%",

      minHeight:
        72,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        14,

      paddingVertical:
        12,

      borderWidth:
        1,

      borderColor:
        "#DDE5EF",

      borderRadius:
        14,

      backgroundColor:
        "#FFFFFF",
    },

    priorityIcon: {
      width:
        46,

      height:
        46,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        12,

      borderRadius:
        10,

      backgroundColor:
        "#EAF3FF",
    },

    priorityContent: {
      flex:
        1,

      minWidth:
        0,

      marginRight:
        10,
    },

    priorityDescription: {
      marginTop:
        3,

      lineHeight:
        18,

      color:
        "#64748B",
    },

    /* ========================================================
       DATE + TIME
    ======================================================== */

    scheduleFields: {
      width:
        "100%",

      gap:
        20,
    },

    fieldGroup: {
      width:
        "100%",
    },

    fieldLabel: {
      marginBottom:
        10,

      color:
        "#0F172A",
    },

    scheduleField: {
      width:
        "100%",

      minHeight:
        62,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingRight:
        14,

      borderWidth:
        1,

      borderColor:
        "#D7E4F2",

      borderRadius:
        14,

      overflow:
        "hidden",

      backgroundColor:
        "#FFFFFF",
    },

    scheduleIcon: {
      width:
        58,

      alignSelf:
        "stretch",

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        14,

      backgroundColor:
        "#EAF3FF",
    },

    scheduleValue: {
      flex:
        1,

      minWidth:
        0,

      marginRight:
        10,

      color:
        "#0F172A",
    },

    /* ========================================================
       STATES
    ======================================================== */

    pressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },

    disabled: {
      opacity:
        FixxamTokens.motion.disabledOpacity,
    },
  });

export default memo(
  RequestTiming,
);