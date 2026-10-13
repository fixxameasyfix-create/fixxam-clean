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
   TYPES
============================================================== */

type Props = {
  visible: boolean;

  value: Date | null;

  onChange: (
    date: Date,
  ) => void;

  onClose: () => void;

  disabled?: boolean;
};

type BookingDateOption = {
  key: string;

  date: Date;

  weekday: string;

  monthDay: string;

  fullDate: string;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const MAX_BOOKING_DAYS = 7;

/* ==============================================================
   HELPERS
============================================================== */

function startOfDay(
  value: Date,
): Date {
  const date =
    new Date(
      value,
    );

  date.setHours(
    0,
    0,
    0,
    0,
  );

  return date;
}

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

function createBookingDates(): BookingDateOption[] {
  const today =
    startOfDay(
      new Date(),
    );

  return Array.from(
    {
      length:
        MAX_BOOKING_DAYS,
    },
    (
      _,
      index,
    ) => {
      const date =
        new Date(
          today,
        );

      date.setDate(
        today.getDate() +
          index,
      );

      return {
        key:
          date.toISOString(),

        date,

        weekday:
          index === 0
            ? "Today"
            : index === 1
              ? "Tomorrow"
              : date.toLocaleDateString(
                  "en-US",
                  {
                    weekday:
                      "long",
                  },
                ),

        monthDay:
          date.toLocaleDateString(
            "en-US",
            {
              month:
                "short",

              day:
                "numeric",
            },
          ),

        fullDate:
          date.toLocaleDateString(
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
      };
    },
  );
}

/* ==============================================================
   COMPONENT
============================================================== */

function BookingDatePickerModal({
  visible,
  value,
  onChange,
  onClose,
  disabled = false,
}: Props) {
  const dates =
    useMemo(
      () =>
        createBookingDates(),
      [
        visible,
      ],
    );

  /* ============================================================
     SELECT DATE
  ============================================================ */

  const handleSelectDate =
    useCallback(
      (
        selectedDate: Date,
      ) => {
        if (
          disabled
        ) {
          return;
        }

        const nextDate =
          new Date(
            selectedDate,
          );

        /*
         * Preserve the already-selected time.
         * If there is no existing time, use 9:00 AM.
         */
        if (
          value &&
          Number.isFinite(
            value.getTime(),
          )
        ) {
          nextDate.setHours(
            value.getHours(),
            value.getMinutes(),
            0,
            0,
          );
        } else {
          nextDate.setHours(
            9,
            0,
            0,
            0,
          );
        }

        onChange(
          nextDate,
        );
      },
      [
        disabled,
        onChange,
        value,
      ],
    );

  /* ============================================================
     RENDER DATE
  ============================================================ */

  const renderDate =
    useCallback(
      ({
        item,
      }: {
        item: BookingDateOption;
      }) => {
        const selected =
          Boolean(
            value &&
            isSameDay(
              value,
              item.date,
            ),
          );

        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityLabel={
              item.fullDate
            }
            accessibilityState={{
              selected,
              disabled,
            }}
            disabled={
              disabled
            }
            onPress={() =>
              handleSelectDate(
                item.date,
              )
            }
            style={({
              pressed,
            }) => [
              styles.dateCard,

              selected &&
                styles.dateCardSelected,

              pressed &&
                !disabled &&
                styles.pressed,

              disabled &&
                styles.disabled,
            ]}
          >
            <View
              style={
                styles.dateIcon
              }
            >
              <MaterialCommunityIcons
                name="calendar-blank-outline"
                size={23}
                color={
                  CustomerColors.primary
                }
              />
            </View>

            <View
              style={
                styles.dateContent
              }
            >
              <AppText
                variant="bodyLarge"
                weight="bold"
                numberOfLines={1}
              >
                {item.weekday}
              </AppText>

              <AppText
                variant="bodyMedium"
                tone="secondary"
                numberOfLines={1}
                style={
                  styles.dateSubtitle
                }
              >
                {item.monthDay}
              </AppText>
            </View>

            <View
              style={[
                styles.radio,

                selected &&
                  styles.radioSelected,
              ]}
            >
              {selected ? (
                <View
                  style={
                    styles.radioDot
                  }
                />
              ) : null}
            </View>
          </Pressable>
        );
      },
      [
        disabled,
        handleSelectDate,
        value,
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
          styles.modalRoot
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close date picker"
          disabled={
            disabled
          }
          onPress={
            onClose
          }
          style={
            styles.backdrop
          }
        />

        <View
          style={
            styles.sheet
          }
        >
          {/* ====================================================
              HANDLE
          ==================================================== */}

          <View
            style={
              styles.handle
            }
          />

          {/* ====================================================
              HEADER
          ==================================================== */}

          <View
            style={
              styles.header
            }
          >
            <View
              style={
                styles.headerText
              }
            >
              <AppText
                variant="heading2"
                weight="bold"
              >
                Select Date
              </AppText>

              <AppText
                variant="bodyMedium"
                tone="secondary"
                style={
                  styles.subtitle
                }
              >
                Available booking days
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
                8
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
                size={24}
                color={
                  Colors.textPrimary
                }
              />
            </Pressable>
          </View>

          {/* ====================================================
              DATE LIST
          ==================================================== */}

          <FlatList
            data={
              dates
            }
            keyExtractor={
              item =>
                item.key
            }
            renderItem={
              renderDate
            }
            showsVerticalScrollIndicator={
              false
            }
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={
              styles.listContent
            }
          />
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
    modalRoot: {
      flex:
        1,

      justifyContent:
        "flex-end",
    },

    backdrop: {
      ...StyleSheet.absoluteFillObject,

      backgroundColor:
        "rgba(15, 23, 42, 0.42)",
    },

    sheet: {
      maxHeight:
        "78%",

      paddingHorizontal:
        20,

      paddingTop:
        10,

      paddingBottom:
        28,

      borderTopLeftRadius:
        28,

      borderTopRightRadius:
        28,

      backgroundColor:
        "#FFFFFF",
    },

    handle: {
      width:
        42,

      height:
        5,

      alignSelf:
        "center",

      marginBottom:
        18,

      borderRadius:
        999,

      backgroundColor:
        "#CBD5E1",
    },

    header: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      marginBottom:
        18,
    },

    headerText: {
      flex:
        1,

      minWidth:
        0,

      marginRight:
        16,
    },

    subtitle: {
      marginTop:
        4,

      color:
        "#64748B",
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

      borderRadius:
        21,

      backgroundColor:
        "#F1F5F9",
    },

    listContent: {
      gap:
        10,

      paddingBottom:
        8,
    },

    dateCard: {
      minHeight:
        72,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        14,

      paddingVertical:
        11,

      borderWidth:
        1,

      borderColor:
        "#DDE5EF",

      borderRadius:
        14,

      backgroundColor:
        "#FFFFFF",
    },

    dateCardSelected: {
      borderColor:
        "#93C5FD",

      backgroundColor:
        "#F8FBFF",
    },

    dateIcon: {
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

    dateContent: {
      flex:
        1,

      minWidth:
        0,

      marginRight:
        12,
    },

    dateSubtitle: {
      marginTop:
        3,

      color:
        "#64748B",
    },

    radio: {
      width:
        24,

      height:
        24,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        2,

      borderColor:
        "#CBD5E1",

      borderRadius:
        12,
    },

    radioSelected: {
      borderColor:
        CustomerColors.primary,
    },

    radioDot: {
      width:
        12,

      height:
        12,

      borderRadius:
        6,

      backgroundColor:
        CustomerColors.primary,
    },

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
  BookingDatePickerModal,
);