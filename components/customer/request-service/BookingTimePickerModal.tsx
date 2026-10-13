import React, {
  memo,
  useCallback,
  useMemo,
} from "react";

import {
  FlatList,
  Modal,
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

/* ==============================================================
   CONSTANTS
============================================================== */

const TIME_SLOT_INTERVAL_MINUTES = 30;

const MINIMUM_BOOKING_LEAD_MINUTES = 30;

const MINUTES_PER_DAY =
  24 * 60;

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  visible: boolean;

  value:
    | Date
    | null;

  selectedDate:
    | Date
    | null;

  onChange: (
    date: Date,
  ) => void;

  onClose: () => void;

  disabled?: boolean;
};

type TimeSlot = {
  key: string;

  hours: number;

  minutes: number;

  label: string;
};

/* ==============================================================
   HELPERS
============================================================== */

function isSameDay(
  first: Date,
  second: Date,
): boolean {
  return (
    first.getFullYear() ===
      second.getFullYear() &&
    first.getMonth() ===
      second.getMonth() &&
    first.getDate() ===
      second.getDate()
  );
}

function formatTime(
  hours: number,
  minutes: number,
): string {
  const date =
    new Date();

  date.setHours(
    hours,
    minutes,
    0,
    0,
  );

  return date.toLocaleTimeString(
    "en-US",
    {
      hour:
        "numeric",

      minute:
        "2-digit",

      hour12:
        true,
    },
  );
}

function formatSelectedDate(
  date: Date,
): string {
  return date.toLocaleDateString(
    "en-US",
    {
      weekday:
        "short",

      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
    },
  );
}

function createTimeSlots(): TimeSlot[] {
  const slots:
    TimeSlot[] =
    [];

  /*
   * Start from 12:30 AM to match the
   * booking UI shown in the reference.
   */
  for (
    let totalMinutes =
      TIME_SLOT_INTERVAL_MINUTES;

    totalMinutes <
    MINUTES_PER_DAY;

    totalMinutes +=
      TIME_SLOT_INTERVAL_MINUTES
  ) {
    const hours =
      Math.floor(
        totalMinutes /
          60,
      );

    const minutes =
      totalMinutes %
      60;

    slots.push({
      key:
        `${hours}-${minutes}`,

      hours,

      minutes,

      label:
        formatTime(
          hours,
          minutes,
        ),
    });
  }

  return slots;
}

function createDateWithTime(
  selectedDate: Date,
  slot: TimeSlot,
): Date {
  const nextDate =
    new Date(
      selectedDate,
    );

  nextDate.setHours(
    slot.hours,
    slot.minutes,
    0,
    0,
  );

  return nextDate;
}

function isSelectedTime(
  value: Date | null,
  selectedDate: Date,
  slot: TimeSlot,
): boolean {
  if (
    !value ||
    !isSameDay(
      value,
      selectedDate,
    )
  ) {
    return false;
  }

  return (
    value.getHours() ===
      slot.hours &&
    value.getMinutes() ===
      slot.minutes
  );
}

function isTimeSlotUnavailable(
  selectedDate: Date,
  slot: TimeSlot,
  now: Date,
): boolean {
  if (
    !isSameDay(
      selectedDate,
      now,
    )
  ) {
    return false;
  }

  const slotDate =
    createDateWithTime(
      selectedDate,
      slot,
    );

  const minimumAllowedTime =
    new Date(
      now.getTime() +
        MINIMUM_BOOKING_LEAD_MINUTES *
          60 *
          1000,
    );

  return (
    slotDate.getTime() <
    minimumAllowedTime.getTime()
  );
}

/* ==============================================================
   COMPONENT
============================================================== */

function BookingTimePickerModal({
  visible,
  value,
  selectedDate,
  onChange,
  onClose,
  disabled = false,
}: Props) {
  const timeSlots =
    useMemo(
      () =>
        createTimeSlots(),
      [],
    );

  /*
   * Refresh current time whenever the
   * modal is opened.
   */
  const now =
    useMemo(
      () =>
        new Date(),
      [
        visible,
      ],
    );

  const formattedDate =
    useMemo(
      () => {
        if (
          !selectedDate
        ) {
          return (
            "Choose a date first"
          );
        }

        return formatSelectedDate(
          selectedDate,
        );
      },
      [
        selectedDate,
      ],
    );

  /* ============================================================
     SELECT TIME
  ============================================================ */

  const handleSelectTime =
    useCallback(
      (
        slot: TimeSlot,
      ) => {
        if (
          disabled ||
          !selectedDate
        ) {
          return;
        }

        if (
          isTimeSlotUnavailable(
            selectedDate,
            slot,
            new Date(),
          )
        ) {
          return;
        }

        const nextDate =
          createDateWithTime(
            selectedDate,
            slot,
          );

        onChange(
          nextDate,
        );

        onClose();
      },
      [
        disabled,
        onChange,
        onClose,
        selectedDate,
      ],
    );

  /* ============================================================
     UI
  ============================================================ */

  return (
    <Modal
      visible={
        visible
      }
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={
        onClose
      }
    >
      <View
        style={
          styles.overlay
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close time picker"
          disabled={
            disabled
          }
          onPress={
            onClose
          }
          style={
            StyleSheet.absoluteFill
          }
        />

        <View
          style={
            styles.sheet
          }
        >
          {/* ==================================================
              HANDLE
          ================================================== */}

          <View
            style={
              styles.handle
            }
          />

          {/* ==================================================
              HEADER
          ================================================== */}

          <View
            style={
              styles.header
            }
          >
            <View
              style={
                styles.headerContent
              }
            >
              <AppText
                variant="heading2"
                weight="bold"
              >
                Select Time
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                numberOfLines={1}
                style={
                  styles.subtitle
                }
              >
                {formattedDate}
              </AppText>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              disabled={
                disabled
              }
              onPress={
                onClose
              }
              hitSlop={
                10
              }
              style={({
                pressed,
              }) => [
                styles.closeButton,

                pressed &&
                  !disabled &&
                  styles.pressed,

                disabled &&
                  styles.disabled,
              ]}
            >
              <MaterialCommunityIcons
                name="close"
                size={26}
                color={
                  Colors.textPrimary
                }
              />
            </Pressable>
          </View>

          {/* ==================================================
              TIME GRID
          ================================================== */}

          {selectedDate ? (
            <FlatList
              data={
                timeSlots
              }
              keyExtractor={
                item =>
                  item.key
              }
              numColumns={
                2
              }
              showsVerticalScrollIndicator={
                false
              }
              columnWrapperStyle={
                styles.timeRow
              }
              contentContainerStyle={
                styles.timeList
              }
              renderItem={({
                item,
              }) => {
                const selected =
                  isSelectedTime(
                    value,
                    selectedDate,
                    item,
                  );

                const unavailable =
                  isTimeSlotUnavailable(
                    selectedDate,
                    item,
                    now,
                  );

                const itemDisabled =
                  disabled ||
                  unavailable;

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      item.label
                    }
                    accessibilityState={{
                      selected,
                      disabled:
                        itemDisabled,
                    }}
                    disabled={
                      itemDisabled
                    }
                    onPress={() =>
                      handleSelectTime(
                        item,
                      )
                    }
                    style={({
                      pressed,
                    }) => [
                      styles.timeCard,

                      selected &&
                        styles.timeCardSelected,

                      unavailable &&
                        styles.timeCardUnavailable,

                      pressed &&
                        !itemDisabled &&
                        styles.pressed,

                      disabled &&
                        styles.disabled,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={22}
                      color={
                        unavailable
                          ? Colors.textSecondary
                          : CustomerColors.primary
                      }
                    />

                    <AppText
                      variant="bodyMedium"
                      weight="bold"
                      numberOfLines={1}
                      tone={
                        unavailable
                          ? "muted"
                          : undefined
                      }
                      style={
                        styles.timeLabel
                      }
                    >
                      {
                        item.label
                      }
                    </AppText>

                    {selected ? (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={20}
                        color={
                          CustomerColors.primary
                        }
                      />
                    ) : null}
                  </Pressable>
                );
              }}
            />
          ) : (
            <View
              style={
                styles.emptyState
              }
            >
              <View
                style={
                  styles.emptyIcon
                }
              >
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={28}
                  color={
                    CustomerColors.primary
                  }
                />
              </View>

              <AppText
                variant="bodyLarge"
                weight="bold"
              >
                Select a date first
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.emptyText
                }
              >
                Choose your preferred booking date before selecting a time.
              </AppText>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    overlay: {
      flex:
        1,

      justifyContent:
        "flex-end",

      backgroundColor:
        "rgba(0, 0, 0, 0.35)",
    },

    sheet: {
      width:
        "100%",

      height:
        "82%",

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.xxl,

      borderTopLeftRadius:
        FixxamTokens.radius.xl,

      borderTopRightRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.background,
    },

    handle: {
      width:
        44,

      height:
        4,

      alignSelf:
        "center",

      marginBottom:
        FixxamTokens.spacing.lg,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.border,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      marginBottom:
        FixxamTokens.spacing.lg,
    },

    headerContent: {
      flex:
        1,

      minWidth:
        0,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    closeButton: {
      width:
        42,

      height:
        42,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginLeft:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.full,
    },

    /* ========================================================
       TIME GRID
    ======================================================== */

    timeList: {
      gap:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.xl,
    },

    timeRow: {
      gap:
        FixxamTokens.spacing.sm,
    },

    timeCard: {
      flex:
        1,

      minWidth:
        0,

      minHeight:
        62,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,
    },

    timeCardSelected: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    timeCardUnavailable: {
      opacity:
        0.45,

      backgroundColor:
        Colors.background,
    },

    timeLabel: {
      flexShrink:
        1,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyState: {
      flex:
        1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,
    },

    emptyIcon: {
      width:
        56,

      height:
        56,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginBottom:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    emptyText: {
      marginTop:
        FixxamTokens.spacing.xs,

      textAlign:
        "center",

      lineHeight:
        18,
    },

    /* ========================================================
       STATES
    ======================================================== */

    pressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,
    },

    disabled: {
      opacity:
        FixxamTokens.motion.disabledOpacity,
    },
  });

export default memo(
  BookingTimePickerModal,
);