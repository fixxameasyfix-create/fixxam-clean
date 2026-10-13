import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

/* ============================================================
   TYPES
============================================================ */

type BookingDateOption = {
  key: string;
  label: string;
  dayName: string;
  date: Date;
};

type DateModalProps = {
  type: 'date';
  visible: boolean;

  dates: BookingDateOption[];
  selectedDateKey: string;

  onClose: () => void;

  onSelectDate: (
    option: BookingDateOption,
  ) => void;
};

type TimeModalProps = {
  type: 'time';
  visible: boolean;

  times: string[];
  selectedTime: string;

  dateLabel?: string;

  onClose: () => void;

  onSelectTime: (
    time: string,
  ) => void;
};

type BookingSelectionModalProps =
  | DateModalProps
  | TimeModalProps;

/* ============================================================
   COMPONENT
============================================================ */

function BookingSelectionModal(
  props: BookingSelectionModalProps,
) {
  const isDate =
    props.type === 'date';

  const title =
    isDate
      ? 'Select Date'
      : 'Select Time';

  const subtitle =
    isDate
      ? 'Available booking days'
      : props.dateLabel ??
        'Available times';

  return (
    <Modal
      visible={props.visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={
        props.onClose
      }
    >
      <View style={styles.modalRoot}>
        {/* ====================================================
            BACKDROP
        ==================================================== */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            isDate
              ? 'Close date selector'
              : 'Close time selector'
          }
          onPress={props.onClose}
          style={
            styles.modalBackdrop
          }
        />

        {/* ====================================================
            SHEET
        ==================================================== */}

        <View
          style={styles.modalSheet}
        >
          <View
            style={styles.modalHandle}
          />

          {/* ==================================================
              HEADER
          ================================================== */}

          <View
            style={styles.modalHeader}
          >
            <View
              style={
                styles.modalHeaderContent
              }
            >
              <Text
                accessibilityRole="header"
                style={
                  styles.modalTitle
                }
              >
                {title}
              </Text>

              <Text
                numberOfLines={1}
                style={
                  styles.modalSubtitle
                }
              >
                {subtitle}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                isDate
                  ? 'Close date selector'
                  : 'Close time selector'
              }
              hitSlop={8}
              onPress={props.onClose}
              style={({ pressed }) => [
                styles.modalCloseButton,

                pressed &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name="close"
                size={23}
                color="#334155"
              />
            </Pressable>
          </View>

          {/* ==================================================
              DATE OPTIONS
          ================================================== */}

          {props.type === 'date' ? (
            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={
                styles.modalList
              }
            >
              {props.dates.map(
                (option) => {
                  const selected =
                    props.selectedDateKey ===
                    option.key;

                  return (
                    <Pressable
                      key={option.key}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${option.label}`}
                      accessibilityState={{
                        selected,
                      }}
                      onPress={() =>
                        props.onSelectDate(
                          option,
                        )
                      }
                      style={({
                        pressed,
                      }) => [
                        styles.dateOption,

                        selected &&
                          styles.dateOptionSelected,

                        pressed &&
                          styles.pressed,
                      ]}
                    >
                      <View
                        style={
                          styles.optionContent
                        }
                      >
                        <Text
                          style={
                            styles.optionTitle
                          }
                        >
                          {option.dayName}
                        </Text>

                        <Text
                          style={
                            styles.optionSubtitle
                          }
                        >
                          {option.label}
                        </Text>
                      </View>

                      {selected ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={25}
                          color="#1677FF"
                        />
                      ) : (
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color="#CBD5E1"
                        />
                      )}
                    </Pressable>
                  );
                },
              )}

              {props.dates.length ===
              0 ? (
                <View
                  style={
                    styles.emptyContainer
                  }
                >
                  <Ionicons
                    name="calendar-outline"
                    size={34}
                    color="#94A3B8"
                  />

                  <Text
                    style={
                      styles.emptyTitle
                    }
                  >
                    No Available Dates
                  </Text>

                  <Text
                    style={
                      styles.emptyText
                    }
                  >
                    There are currently
                    no available booking
                    dates.
                  </Text>
                </View>
              ) : null}
            </ScrollView>
          ) : (
            /* ================================================
               TIME OPTIONS
            ================================================ */

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={
                styles.timeGrid
              }
            >
              {props.times.map(
                (time) => {
                  const selected =
                    props.selectedTime ===
                    time;

                  return (
                    <Pressable
                      key={time}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${time}`}
                      accessibilityState={{
                        selected,
                      }}
                      onPress={() =>
                        props.onSelectTime(
                          time,
                        )
                      }
                      style={({
                        pressed,
                      }) => [
                        styles.timeOption,

                        selected &&
                          styles.timeOptionSelected,

                        pressed &&
                          styles.pressed,
                      ]}
                    >
                      <Ionicons
                        name="time-outline"
                        size={20}
                        color={
                          selected
                            ? '#FFFFFF'
                            : '#1677FF'
                        }
                      />

                      <Text
                        style={[
                          styles.timeOptionText,

                          selected &&
                            styles.timeOptionTextSelected,
                        ]}
                      >
                        {time}
                      </Text>
                    </Pressable>
                  );
                },
              )}

              {props.times.length ===
              0 ? (
                <View
                  style={
                    styles.emptyTimeContainer
                  }
                >
                  <Ionicons
                    name="time-outline"
                    size={34}
                    color="#94A3B8"
                  />

                  <Text
                    style={
                      styles.emptyTitle
                    }
                  >
                    No Available Times
                  </Text>

                  <Text
                    style={
                      styles.emptyText
                    }
                  >
                    Choose another
                    booking date.
                  </Text>
                </View>
              ) : null}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default memo(
  BookingSelectionModal,
);

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor:
      'rgba(15,23,42,0.48)',
  },

  modalSheet: {
    maxHeight: '78%',

    paddingTop: 10,

    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,

    backgroundColor: '#FFFFFF',
  },

  modalHandle: {
    width: 44,
    height: 5,

    alignSelf: 'center',

    borderRadius: 999,

    backgroundColor: '#CBD5E1',
  },

  /* ==========================================================
     HEADER
  ========================================================== */

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',

    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
  },

  modalHeaderContent: {
    flex: 1,
    minWidth: 0,

    paddingRight: 16,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: '800',

    color: '#0F172A',
  },

  modalSubtitle: {
    marginTop: 2,

    fontSize: 13,

    color: '#64748B',
  },

  modalCloseButton: {
    width: 42,
    height: 42,

    flexShrink: 0,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 21,

    backgroundColor: '#F1F5F9',
  },

  /* ==========================================================
     DATE
  ========================================================== */

  modalList: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },

  dateOption: {
    minHeight: 68,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 12,

    marginBottom: 9,
    padding: 13,

    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 17,

    backgroundColor: '#FFFFFF',
  },

  dateOptionSelected: {
    borderColor: '#93C5FD',

    backgroundColor: '#EFF6FF',
  },

  optionContent: {
    flex: 1,
    minWidth: 0,
  },

  optionTitle: {
    fontSize: 15,
    fontWeight: '800',

    color: '#0F172A',
  },

  optionSubtitle: {
    marginTop: 3,

    fontSize: 12,

    color: '#64748B',
  },

  /* ==========================================================
     TIME
  ========================================================== */

  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    gap: 10,

    paddingHorizontal: 20,
    paddingBottom: 36,
  },

  timeOption: {
    width: '47.5%',
    minHeight: 52,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 7,

    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 15,

    backgroundColor: '#EFF6FF',
  },

  timeOptionSelected: {
    borderColor: '#1677FF',

    backgroundColor: '#1677FF',
  },

  timeOptionText: {
    fontSize: 14,
    fontWeight: '700',

    color: '#1677FF',
  },

  timeOptionTextSelected: {
    color: '#FFFFFF',
  },

  /* ==========================================================
     EMPTY STATE
  ========================================================== */

  emptyContainer: {
    alignItems: 'center',

    paddingVertical: 34,
    paddingHorizontal: 20,
  },

  emptyTimeContainer: {
    width: '100%',

    alignItems: 'center',

    paddingVertical: 34,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    marginTop: 10,

    fontSize: 16,
    fontWeight: '800',

    color: '#334155',
  },

  emptyText: {
    marginTop: 5,

    textAlign: 'center',

    fontSize: 13,
    lineHeight: 19,

    color: '#64748B',
  },

  pressed: {
    opacity: 0.72,
  },
});