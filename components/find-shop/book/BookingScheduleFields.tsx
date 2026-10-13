import { Ionicons } from '@expo/vector-icons';
import React, {
  memo,
  useCallback,
} from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

/* ============================================================
   TYPES
============================================================ */

type SelectedBookingDate = {
  key: string;
  label: string;
  dayName: string;
  date: Date;
};

type BookingScheduleFieldsProps = {
  selectedDate: SelectedBookingDate | null;
  selectedTime: string;

  hasAvailableDates: boolean;
  hasAvailableTimes: boolean;

  disabled?: boolean;

  onOpenDate: () => void;
  onOpenTime: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

function BookingScheduleFields({
  selectedDate,
  selectedTime,
  hasAvailableDates,
  hasAvailableTimes,
  disabled = false,
  onOpenDate,
  onOpenTime,
}: BookingScheduleFieldsProps) {
  /* ==========================================================
     DATE
  ========================================================== */

  const handleOpenDate =
    useCallback(() => {
      if (disabled) {
        return;
      }

      if (!hasAvailableDates) {
        Alert.alert(
          'No Available Dates',
          'This shop currently has no available booking times during the next 14 days.',
        );

        return;
      }

      onOpenDate();
    }, [
      disabled,
      hasAvailableDates,
      onOpenDate,
    ]);

  /* ==========================================================
     TIME
  ========================================================== */

  const handleOpenTime =
    useCallback(() => {
      if (disabled) {
        return;
      }

      if (!selectedDate) {
        Alert.alert(
          'Select Date',
          'Choose your preferred date first.',
        );

        return;
      }

      if (!hasAvailableTimes) {
        Alert.alert(
          'No Available Times',
          'There are no remaining booking times for this date. Please choose another date.',
        );

        return;
      }

      onOpenTime();
    }, [
      disabled,
      hasAvailableTimes,
      onOpenTime,
      selectedDate,
    ]);

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <>
      {/* ======================================================
          DATE
      ====================================================== */}

      <View
        style={
          styles.formSection
        }
      >
        <Text
          style={styles.label}
        >
          Preferred Date
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Select preferred booking date"
          accessibilityHint="Opens the available booking dates"
          accessibilityState={{
            disabled,
          }}
          disabled={disabled}
          onPress={
            handleOpenDate
          }
          style={({
            pressed,
          }) => [
            styles.selector,

            selectedDate &&
              styles.selectorSelected,

            disabled &&
              styles.controlDisabled,

            pressed &&
              !disabled &&
              styles.pressed,
          ]}
        >
          <View
            style={
              styles.selectorIcon
            }
          >
            <Ionicons
              name="calendar-outline"
              size={19}
              color="#1677FF"
            />
          </View>

          <Text
            numberOfLines={1}
            style={[
              styles.placeholder,

              selectedDate &&
                styles.selectedValue,
            ]}
          >
            {selectedDate
              ? selectedDate.label
              : 'Select date'}
          </Text>

          <Ionicons
            name="chevron-down"
            size={18}
            color="#64748B"
          />
        </Pressable>
      </View>

      {/* ======================================================
          TIME
      ====================================================== */}

      <View
        style={
          styles.formSection
        }
      >
        <Text
          style={styles.label}
        >
          Preferred Time
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Select preferred booking time"
          accessibilityHint="Opens the available booking times"
          accessibilityState={{
            disabled,
          }}
          disabled={disabled}
          onPress={
            handleOpenTime
          }
          style={({
            pressed,
          }) => [
            styles.selector,

            Boolean(
              selectedTime,
            ) &&
              styles.selectorSelected,

            disabled &&
              styles.controlDisabled,

            pressed &&
              !disabled &&
              styles.pressed,
          ]}
        >
          <View
            style={
              styles.selectorIcon
            }
          >
            <Ionicons
              name="time-outline"
              size={19}
              color="#1677FF"
            />
          </View>

          <Text
            numberOfLines={1}
            style={[
              styles.placeholder,

              Boolean(
                selectedTime,
              ) &&
                styles.selectedValue,
            ]}
          >
            {selectedTime ||
              'Select time'}
          </Text>

          <Ionicons
            name="chevron-down"
            size={18}
            color="#64748B"
          />
        </Pressable>

        {selectedDate ? (
          <View
            style={
              styles.bookingHintRow
            }
          >
            <Ionicons
              name="information-circle-outline"
              size={14}
              color="#94A3B8"
            />

            <Text
              style={
                styles.bookingHint
              }
            >
              Times follow the
              shop&apos;s opening
              hours.
            </Text>
          </View>
        ) : null}
      </View>
    </>
  );
}

export default memo(
  BookingScheduleFields,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    formSection: {
      marginTop: 16,
    },

    label: {
      fontSize: 15,
      fontWeight: '800',
      color: '#0F172A',
    },

    /* ========================================================
       COMPACT SELECTOR
    ======================================================== */

    selector: {
      height: 48,

      flexDirection: 'row',
      alignItems: 'center',

      marginTop: 7,

      paddingRight: 13,

      overflow: 'hidden',

      borderWidth: 1,
      borderColor: '#D7E0EB',
      borderRadius: 13,

      backgroundColor:
        '#FFFFFF',
    },

    selectorSelected: {
      borderColor:
        '#93C5FD',

      backgroundColor:
        '#FFFFFF',
    },

    selectorIcon: {
      width: 46,
      height: '100%',

      alignItems: 'center',
      justifyContent:
        'center',

      backgroundColor:
        '#EFF6FF',
    },

    placeholder: {
      flex: 1,

      marginLeft: 11,
      marginRight: 8,

      fontSize: 14,

      color:
        '#94A3B8',
    },

    selectedValue: {
      fontWeight: '700',

      color:
        '#0F172A',
    },

    /* ========================================================
       HINT
    ======================================================== */

    bookingHintRow: {
      flexDirection: 'row',

      alignItems: 'center',

      gap: 4,

      marginTop: 5,

      paddingHorizontal: 2,
    },

    bookingHint: {
      flex: 1,

      fontSize: 11,

      lineHeight: 16,

      color:
        '#94A3B8',
    },

    /* ========================================================
       STATES
    ======================================================== */

    controlDisabled: {
      opacity: 0.5,
    },

    pressed: {
      opacity: 0.72,
    },
  });