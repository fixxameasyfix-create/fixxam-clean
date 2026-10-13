import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useShopRegistration } from '../../../../contexts/ShopRegistrationContext';

import type { WorkerShopBusinessHour } from '../../../../types/workerShop';

/* ============================================================
   TYPES
============================================================ */

type TimeField =
  | 'openTime'
  | 'closeTime';

type ActiveTimePicker = {
  dayId: string;
  field: TimeField;
} | null;

/* ============================================================
   CONSTANTS
============================================================ */

const BUSINESS_DAY_IDS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

const WEEKDAY_IDS = [
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
] as const;

const DEFAULT_BUSINESS_HOURS: WorkerShopBusinessHour[] =
  [
    {
      id: 'monday',
      day: 'Monday',
      isOpen: true,
      openTime: '08:00',
      closeTime: '18:00',
    },
    {
      id: 'tuesday',
      day: 'Tuesday',
      isOpen: true,
      openTime: '08:00',
      closeTime: '18:00',
    },
    {
      id: 'wednesday',
      day: 'Wednesday',
      isOpen: true,
      openTime: '08:00',
      closeTime: '18:00',
    },
    {
      id: 'thursday',
      day: 'Thursday',
      isOpen: true,
      openTime: '08:00',
      closeTime: '18:00',
    },
    {
      id: 'friday',
      day: 'Friday',
      isOpen: true,
      openTime: '08:00',
      closeTime: '18:00',
    },
    {
      id: 'saturday',
      day: 'Saturday',
      isOpen: true,
      openTime: '09:00',
      closeTime: '17:00',
    },
    {
      id: 'sunday',
      day: 'Sunday',
      isOpen: false,
      openTime: '09:00',
      closeTime: '16:00',
    },
  ];

/* ============================================================
   TIME OPTIONS
============================================================ */

function createTimeOptions(): string[] {
  const times: string[] = [];

  for (
    let hour = 0;
    hour < 24;
    hour += 1
  ) {
    times.push(
      `${String(hour).padStart(
        2,
        '0',
      )}:00`,
    );

    times.push(
      `${String(hour).padStart(
        2,
        '0',
      )}:30`,
    );
  }

  return times;
}

const TIME_OPTIONS =
  createTimeOptions();

/* ============================================================
   HELPERS
============================================================ */

function isValidTime(
  value: string,
): boolean {
  return /^(?:[01]\d|2[0-3]):(?:00|30)$/.test(
    value,
  );
}

function timeToMinutes(
  time: string,
): number | null {
  if (!isValidTime(time)) {
    return null;
  }

  const [
    hours,
    minutes,
  ] = time
    .split(':')
    .map(Number);

  return (
    hours * 60 +
    minutes
  );
}

function formatTime(
  time: string,
): string {
  if (!isValidTime(time)) {
    return time;
  }

  const [
    hoursString,
    minutes,
  ] = time.split(':');

  const hours =
    Number(hoursString);

  const period =
    hours >= 12
      ? 'PM'
      : 'AM';

  const hour12 =
    hours % 12 || 12;

  return `${hour12}:${minutes} ${period}`;
}

/* ============================================================
   NORMALIZATION
============================================================ */

function getInitialBusinessHours(
  hours: WorkerShopBusinessHour[],
): WorkerShopBusinessHour[] {
  if (
    !Array.isArray(hours) ||
    hours.length === 0
  ) {
    return DEFAULT_BUSINESS_HOURS.map(
      (item) => ({
        ...item,
      }),
    );
  }

  /*
   * Always produce exactly the seven supported days
   * in their canonical order.
   */
  return DEFAULT_BUSINESS_HOURS.map(
    (defaultDay) => {
      const existing =
        hours.find(
          (item) =>
            item.id ===
            defaultDay.id,
        );

      if (!existing) {
        return {
          ...defaultDay,
        };
      }

      return {
        id:
          defaultDay.id,

        day:
          defaultDay.day,

        isOpen:
          Boolean(
            existing.isOpen,
          ),

        openTime:
          isValidTime(
            existing.openTime,
          )
            ? existing.openTime
            : defaultDay.openTime,

        closeTime:
          isValidTime(
            existing.closeTime,
          )
            ? existing.closeTime
            : defaultDay.closeTime,
      };
    },
  );
}

/* ============================================================
   SCREEN
============================================================ */

export default function BusinessHoursScreen() {
  const {
    draft,
    updateDraft,
  } = useShopRegistration();

  const initialHours =
    useMemo(
      () =>
        getInitialBusinessHours(
          draft.businessHours,
        ),
      [draft.businessHours],
    );

  const [
    businessHours,
    setBusinessHours,
  ] =
    useState<
      WorkerShopBusinessHour[]
    >(() => initialHours);

  const [
    activeTimePicker,
    setActiveTimePicker,
  ] =
    useState<ActiveTimePicker>(
      null,
    );

  const [
    error,
    setError,
  ] = useState('');

  /* ==========================================================
     LOCAL + DRAFT SYNC
  ========================================================== */

  const commitBusinessHours =
    useCallback(
      (
        updater: (
          current: WorkerShopBusinessHour[],
        ) => WorkerShopBusinessHour[],
      ) => {
        setBusinessHours(
          (current) => {
            const nextHours =
              updater(current);

            updateDraft({
              businessHours:
                nextHours,
            });

            return nextHours;
          },
        );
      },
      [updateDraft],
    );

  /* ==========================================================
     UPDATE DAY
  ========================================================== */

  const updateDay =
    useCallback(
      (
        dayId: string,
        values: Partial<WorkerShopBusinessHour>,
      ) => {
        commitBusinessHours(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                dayId
                  ? {
                      ...item,
                      ...values,

                      /*
                       * Never allow these canonical
                       * fields to be changed by values.
                       */
                      id:
                        item.id,
                      day:
                        item.day,
                    }
                  : item,
            ),
        );

        setError('');
      },
      [
        commitBusinessHours,
      ],
    );

  /* ==========================================================
     TOGGLE DAY
  ========================================================== */

  const toggleDay =
    useCallback(
      (
        dayId: string,
      ) => {
        commitBusinessHours(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                dayId
                  ? {
                      ...item,
                      isOpen:
                        !item.isOpen,
                    }
                  : item,
            ),
        );

        setError('');
      },
      [
        commitBusinessHours,
      ],
    );

  /* ==========================================================
     TIME PICKER
  ========================================================== */

  const openTimePicker =
    useCallback(
      (
        dayId: string,
        field: TimeField,
      ) => {
        const day =
          businessHours.find(
            (item) =>
              item.id ===
              dayId,
          );

        if (
          !day ||
          !day.isOpen
        ) {
          return;
        }

        setActiveTimePicker({
          dayId,
          field,
        });
      },
      [businessHours],
    );

  const closeTimePicker =
    useCallback(() => {
      setActiveTimePicker(
        null,
      );
    }, []);

  const handleSelectTime =
    useCallback(
      (
        time: string,
      ) => {
        if (
          !activeTimePicker ||
          !isValidTime(time)
        ) {
          return;
        }

        updateDay(
          activeTimePicker.dayId,
          {
            [activeTimePicker.field]:
              time,
          },
        );

        setActiveTimePicker(
          null,
        );
      },
      [
        activeTimePicker,
        updateDay,
      ],
    );

  /* ==========================================================
     COPY MONDAY
  ========================================================== */

  const handleCopyMonday =
    useCallback(() => {
      const monday =
        businessHours.find(
          (item) =>
            item.id ===
            'monday',
        );

      if (!monday) {
        setError(
          'Monday business hours are unavailable.',
        );

        return;
      }

      commitBusinessHours(
        (current) =>
          current.map(
            (item) => {
              if (
                !WEEKDAY_IDS.includes(
                  item.id as
                    (typeof WEEKDAY_IDS)[number],
                )
              ) {
                return item;
              }

              return {
                ...item,

                isOpen:
                  monday.isOpen,

                openTime:
                  monday.openTime,

                closeTime:
                  monday.closeTime,
              };
            },
          ),
      );

      setError('');
    }, [
      businessHours,
      commitBusinessHours,
    ]);

  /* ==========================================================
     VALIDATION
  ========================================================== */

  const validateHours =
    useCallback((): boolean => {
      if (
        businessHours.length !==
        BUSINESS_DAY_IDS.length
      ) {
        setError(
          'Business hours must include all seven days.',
        );

        return false;
      }

      const ids =
        new Set(
          businessHours.map(
            (item) =>
              item.id,
          ),
        );

      if (
        ids.size !==
        BUSINESS_DAY_IDS.length
      ) {
        setError(
          'Business hours contain duplicate days.',
        );

        return false;
      }

      for (
        const expectedId of
        BUSINESS_DAY_IDS
      ) {
        if (
          !ids.has(
            expectedId,
          )
        ) {
          setError(
            'Business hours are incomplete.',
          );

          return false;
        }
      }

      const openDays =
        businessHours.filter(
          (day) =>
            day.isOpen,
        );

      if (
        openDays.length === 0
      ) {
        setError(
          'Your shop must be open at least one day.',
        );

        return false;
      }

      for (
        const day of openDays
      ) {
        if (
          !isValidTime(
            day.openTime,
          ) ||
          !isValidTime(
            day.closeTime,
          )
        ) {
          setError(
            `${day.day}: select valid opening and closing times.`,
          );

          return false;
        }

        const openingMinutes =
          timeToMinutes(
            day.openTime,
          );

        const closingMinutes =
          timeToMinutes(
            day.closeTime,
          );

        if (
          openingMinutes ===
            null ||
          closingMinutes ===
            null
        ) {
          setError(
            `${day.day}: invalid business hours.`,
          );

          return false;
        }

        if (
          closingMinutes <=
          openingMinutes
        ) {
          setError(
            `${day.day}: closing time must be later than opening time.`,
          );

          return false;
        }
      }

      setError('');

      return true;
    }, [businessHours]);

  /* ==========================================================
     NEXT
  ========================================================== */

  const handleNext =
    useCallback(() => {
      if (
        !validateHours()
      ) {
        return;
      }

      /*
       * Changes are already synchronized immediately.
       * This final write guarantees the current state before
       * navigation.
       */
      updateDraft({
        businessHours,
      });

      setError('');

      router.push(
        '/my-shop/create/review',
      );
    }, [
      businessHours,
      updateDraft,
      validateHours,
    ]);

  /* ==========================================================
     SELECTED TIME
  ========================================================== */

  const selectedTime =
    activeTimePicker
      ? businessHours.find(
          (item) =>
            item.id ===
            activeTimePicker.dayId,
        )?.[
          activeTimePicker.field
        ]
      : undefined;

  const activeDay =
    activeTimePicker
      ? businessHours.find(
          (item) =>
            item.id ===
            activeTimePicker.dayId,
        )
      : undefined;

  const timePickerTitle =
    activeTimePicker
      ? `${
          activeTimePicker.field ===
          'openTime'
            ? 'Opening'
            : 'Closing'
        } Time`
      : 'Select Time';

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <SafeAreaView
      edges={[
        'top',
        'bottom',
      ]}
      style={
        styles.safeArea
      }
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={
          styles.header
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
          onPress={() =>
            router.back()
          }
          style={({
            pressed,
          }) => [
            styles.backButton,

            pressed &&
              styles.pressed,
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={25}
            color="#1677FF"
          />
        </Pressable>

        <Text
          style={
            styles.headerTitle
          }
        >
          Create My Shop
        </Text>

        <View
          style={
            styles.headerSpacer
          }
        />
      </View>

      <ProgressIndicator />

      {/* ======================================================
          HOURS
      ====================================================== */}

      <FlatList
        data={
          businessHours
        }
        keyExtractor={(
          item,
        ) => item.id}
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.listContent
        }
        ListHeaderComponent={
          <>
            <Text
              style={
                styles.title
              }
            >
              Business Hours
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Set when customers
              can visit and book
              services at your
              shop.
            </Text>

            <View
              style={
                styles.quickActionRow
              }
            >
              <View
                style={
                  styles.quickActionText
                }
              >
                <Text
                  style={
                    styles.quickActionTitle
                  }
                >
                  Same weekday
                  hours?
                </Text>

                <Text
                  style={
                    styles.quickActionSubtitle
                  }
                >
                  Copy Monday&apos;s
                  hours to
                  Tuesday–Friday.
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Copy Monday hours to Tuesday through Friday"
                onPress={
                  handleCopyMonday
                }
                style={({
                  pressed,
                }) => [
                  styles.copyButton,

                  pressed &&
                    styles.pressed,
                ]}
              >
                <Ionicons
                  name="copy-outline"
                  size={18}
                  color="#1677FF"
                />

                <Text
                  style={
                    styles.copyButtonText
                  }
                >
                  Copy
                </Text>
              </Pressable>
            </View>
          </>
        }
        renderItem={({
          item,
        }) => (
          <BusinessHourCard
            item={
              item
            }
            onToggle={() =>
              toggleDay(
                item.id,
              )
            }
            onOpenTimePress={() =>
              openTimePicker(
                item.id,
                'openTime',
              )
            }
            onCloseTimePress={() =>
              openTimePicker(
                item.id,
                'closeTime',
              )
            }
          />
        )}
        ListFooterComponent={
          error ? (
            <View
              accessibilityRole="alert"
              style={
                styles.errorBox
              }
            >
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color="#DC2626"
              />

              <Text
                style={
                  styles.errorText
                }
              >
                {error}
              </Text>
            </View>
          ) : (
            <View
              style={
                styles.infoContainer
              }
            >
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#1677FF"
              />

              <Text
                style={
                  styles.infoText
                }
              >
                Customers will use
                these hours when
                choosing a preferred
                booking time.
              </Text>
            </View>
          )
        }
      />

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <View
        style={
          styles.footer
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue to review shop"
          onPress={
            handleNext
          }
          style={({
            pressed,
          }) => [
            styles.nextButton,

            pressed &&
              styles.pressed,
          ]}
        >
          <Text
            style={
              styles.nextButtonText
            }
          >
            Review Shop
          </Text>

          <Ionicons
            name="arrow-forward"
            size={21}
            color="#FFFFFF"
          />
        </Pressable>
      </View>

      {/* ======================================================
          TIME PICKER
      ====================================================== */}

      <TimePickerModal
        visible={
          activeTimePicker !==
          null
        }
        selectedTime={
          selectedTime
        }
        title={
          timePickerTitle
        }
        dayLabel={
          activeDay?.day
        }
        onClose={
          closeTimePicker
        }
        onSelect={
          handleSelectTime
        }
      />
    </SafeAreaView>
  );
}

/* ============================================================
   BUSINESS HOUR CARD
============================================================ */

function BusinessHourCard({
  item,
  onToggle,
  onOpenTimePress,
  onCloseTimePress,
}: {
  item: WorkerShopBusinessHour;
  onToggle: () => void;
  onOpenTimePress: () => void;
  onCloseTimePress: () => void;
}) {
  return (
    <View
      style={[
        styles.dayCard,

        !item.isOpen &&
          styles.dayCardClosed,
      ]}
    >
      <View
        style={
          styles.dayHeader
        }
      >
        <View>
          <Text
            style={
              styles.dayName
            }
          >
            {item.day}
          </Text>

          <Text
            style={[
              styles.statusLabel,

              item.isOpen
                ? styles.openStatus
                : styles.closedStatus,
            ]}
          >
            {item.isOpen
              ? 'Open'
              : 'Closed'}
          </Text>
        </View>

        <Switch
          value={
            item.isOpen
          }
          onValueChange={
            onToggle
          }
          trackColor={{
            false:
              '#CBD5E1',
            true:
              '#93C5FD',
          }}
          thumbColor={
            item.isOpen
              ? '#1677FF'
              : '#F8FAFC'
          }
          accessibilityRole="switch"
          accessibilityLabel={`${item.day} business hours`}
          accessibilityState={{
            checked:
              item.isOpen,
          }}
        />
      </View>

      {item.isOpen ? (
        <View
          style={
            styles.timeRow
          }
        >
          <View
            style={
              styles.timeSection
            }
          >
            <Text
              style={
                styles.timeLabel
              }
            >
              Opens
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Set opening time for ${item.day}`}
              onPress={
                onOpenTimePress
              }
              style={({
                pressed,
              }) => [
                styles.timeButton,

                pressed &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name="time-outline"
                size={19}
                color="#1677FF"
              />

              <Text
                numberOfLines={1}
                style={
                  styles.timeButtonText
                }
              >
                {formatTime(
                  item.openTime,
                )}
              </Text>

              <Ionicons
                name="chevron-down"
                size={17}
                color="#64748B"
              />
            </Pressable>
          </View>

          <View
            style={
              styles.timeDivider
            }
          >
            <Text
              style={
                styles.timeDividerText
              }
            >
              to
            </Text>
          </View>

          <View
            style={
              styles.timeSection
            }
          >
            <Text
              style={
                styles.timeLabel
              }
            >
              Closes
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Set closing time for ${item.day}`}
              onPress={
                onCloseTimePress
              }
              style={({
                pressed,
              }) => [
                styles.timeButton,

                pressed &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name="time-outline"
                size={19}
                color="#1677FF"
              />

              <Text
                numberOfLines={1}
                style={
                  styles.timeButtonText
                }
              >
                {formatTime(
                  item.closeTime,
                )}
              </Text>

              <Ionicons
                name="chevron-down"
                size={17}
                color="#64748B"
              />
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

/* ============================================================
   TIME PICKER
============================================================ */

function TimePickerModal({
  visible,
  selectedTime,
  title,
  dayLabel,
  onClose,
  onSelect,
}: {
  visible: boolean;
  selectedTime?: string;
  title: string;
  dayLabel?: string;
  onClose: () => void;
  onSelect: (
    time: string,
  ) => void;
}) {
  const listRef =
    useRef<
      FlatList<string>
    >(null);

  const selectedIndex =
    selectedTime
      ? TIME_OPTIONS.indexOf(
          selectedTime,
        )
      : -1;

  const handleLayout =
    useCallback(() => {
      if (
        selectedIndex < 0
      ) {
        return;
      }

      requestAnimationFrame(
        () => {
          listRef.current?.scrollToIndex(
            {
              index:
                selectedIndex,
              animated:
                false,
              viewPosition:
                0.35,
            },
          );
        },
      );
    }, [selectedIndex]);

  return (
    <Modal
      visible={
        visible
      }
      transparent
      statusBarTranslucent
      animationType="slide"
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
          accessibilityLabel="Close time picker"
          onPress={
            onClose
          }
          style={
            styles.modalBackdrop
          }
        />

        <View
          style={
            styles.modalSheet
          }
        >
          <View
            style={
              styles.modalHandle
            }
          />

          <View
            style={
              styles.modalHeader
            }
          >
            <View
              style={
                styles.modalHeaderText
              }
            >
              <Text
                style={
                  styles.modalTitle
                }
              >
                {title}
              </Text>

              <Text
                style={
                  styles.modalSubtitle
                }
              >
                {dayLabel
                  ? `Select a time for ${dayLabel}.`
                  : 'Select a time.'}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close time picker"
              hitSlop={8}
              onPress={
                onClose
              }
              style={({
                pressed,
              }) => [
                styles.closeButton,

                pressed &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name="close"
                size={22}
                color="#334155"
              />
            </Pressable>
          </View>

          <FlatList
            ref={listRef}
            data={
              TIME_OPTIONS
            }
            keyExtractor={(
              item,
            ) => item}
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.timeOptions
            }
            initialNumToRender={
              16
            }
            maxToRenderPerBatch={
              16
            }
            windowSize={7}
            onLayout={
              handleLayout
            }
            onScrollToIndexFailed={(
              info,
            ) => {
              listRef.current?.scrollToOffset(
                {
                  offset:
                    Math.max(
                      0,
                      info.index *
                        64,
                    ),
                  animated:
                    false,
                },
              );
            }}
            getItemLayout={(
              _,
              index,
            ) => ({
              length: 64,
              offset:
                64 *
                index,
              index,
            })}
            renderItem={({
              item,
            }) => {
              const selected =
                item ===
                selectedTime;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${formatTime(
                    item,
                  )}`}
                  accessibilityState={{
                    selected,
                  }}
                  onPress={() =>
                    onSelect(
                      item,
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
                  <View
                    style={[
                      styles.timeOptionIcon,

                      selected &&
                        styles.timeOptionIconSelected,
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
                  </View>

                  <Text
                    style={[
                      styles.timeOptionText,

                      selected &&
                        styles.timeOptionTextSelected,
                    ]}
                  >
                    {formatTime(
                      item,
                    )}
                  </Text>

                  {selected ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={23}
                      color="#1677FF"
                    />
                  ) : null}
                </Pressable>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

/* ============================================================
   PROGRESS INDICATOR
============================================================ */

function ProgressIndicator() {
  return (
    <View
      style={
        styles.progressContainer
      }
    >
      {[1, 2, 3, 4, 5, 6].map(
        (
          step,
          index,
        ) => {
          const completed =
            step < 5;

          const active =
            step === 5;

          return (
            <React.Fragment
              key={step}
            >
              <View
                style={[
                  styles.progressDot,

                  completed &&
                    styles.progressDotCompleted,

                  active &&
                    styles.progressDotActive,
                ]}
              >
                {completed ? (
                  <Ionicons
                    name="checkmark"
                    size={10}
                    color="#FFFFFF"
                  />
                ) : null}
              </View>

              {index < 5 ? (
                <View
                  style={[
                    styles.progressLine,

                    completed &&
                      styles.progressLineCompleted,
                  ]}
                />
              ) : null}
            </React.Fragment>
          );
        },
      )}
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        '#F8FAFC',
    },

    header: {
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
    },

    backButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 17,
      backgroundColor:
        '#EFF6FF',
    },

    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '800',
      color: '#0F172A',
    },

    headerSpacer: {
      width: 44,
    },

    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 34,
      paddingVertical: 12,
    },

    progressDot: {
      width: 11,
      height: 11,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 7,
      backgroundColor:
        '#DCE5EF',
    },

    progressDotCompleted: {
      width: 14,
      height: 14,
      backgroundColor:
        '#1677FF',
    },

    progressDotActive: {
      width: 14,
      height: 14,
      backgroundColor:
        '#1677FF',
    },

    progressLine: {
      flex: 1,
      height: 2,
      backgroundColor:
        '#DCE5EF',
    },

    progressLineCompleted: {
      backgroundColor:
        '#1677FF',
    },

    listContent: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 28,
    },

    title: {
      fontSize: 25,
      fontWeight: '800',
      color: '#0F172A',
    },

    subtitle: {
      marginTop: 5,
      fontSize: 15,
      lineHeight: 22,
      color: '#64748B',
    },

    quickActionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginTop: 22,
      marginBottom: 15,
      padding: 14,
      borderRadius: 17,
      backgroundColor:
        '#EFF6FF',
    },

    quickActionText: {
      flex: 1,
      minWidth: 0,
    },

    quickActionTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: '#0F172A',
    },

    quickActionSubtitle: {
      marginTop: 3,
      fontSize: 12,
      lineHeight: 18,
      color: '#64748B',
    },

    copyButton: {
      minHeight: 42,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 13,
      borderRadius: 13,
      backgroundColor:
        '#FFFFFF',
    },

    copyButtonText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#1677FF',
    },

    dayCard: {
      marginBottom: 12,
      padding: 15,
      borderWidth: 1,
      borderColor:
        '#E2E8F0',
      borderRadius: 18,
      backgroundColor:
        '#FFFFFF',
    },

    dayCardClosed: {
      backgroundColor:
        '#F8FAFC',
    },

    dayHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    dayName: {
      fontSize: 16,
      fontWeight: '800',
      color: '#0F172A',
    },

    statusLabel: {
      marginTop: 3,
      fontSize: 12,
      fontWeight: '700',
    },

    openStatus: {
      color: '#16A34A',
    },

    closedStatus: {
      color: '#64748B',
    },

    timeRow: {
      flexDirection: 'row',
      alignItems:
        'flex-end',
      gap: 8,
      marginTop: 15,
    },

    timeSection: {
      flex: 1,
      minWidth: 0,
    },

    timeLabel: {
      marginBottom: 6,
      fontSize: 12,
      fontWeight: '600',
      color: '#64748B',
    },

    timeButton: {
      minHeight: 50,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor:
        '#D7E0EB',
      borderRadius: 14,
      backgroundColor:
        '#FFFFFF',
    },

    timeButtonText: {
      flex: 1,
      minWidth: 0,
      fontSize: 13,
      fontWeight: '700',
      color: '#0F172A',
    },

    timeDivider: {
      height: 50,
      justifyContent:
        'center',
    },

    timeDividerText: {
      fontSize: 12,
      color: '#94A3B8',
    },

    infoContainer: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 6,
      padding: 12,
      borderRadius: 14,
      backgroundColor:
        '#EFF6FF',
    },

    infoText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 18,
      color: '#475569',
    },

    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      marginTop: 8,
      padding: 12,
      borderRadius: 14,
      backgroundColor:
        '#FEF2F2',
    },

    errorText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 19,
      color: '#DC2626',
    },

    footer: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 14,
      borderTopWidth: 1,
      borderTopColor:
        '#E2E8F0',
      backgroundColor:
        '#FFFFFF',
    },

    nextButton: {
      minHeight: 58,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 9,
      borderRadius: 18,
      backgroundColor:
        '#1677FF',
    },

    nextButtonText: {
      fontSize: 17,
      fontWeight: '800',
      color: '#FFFFFF',
    },

    pressed: {
      opacity: 0.72,
    },

    modalRoot: {
      flex: 1,
      justifyContent:
        'flex-end',
    },

    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,

      backgroundColor:
        'rgba(15, 23, 42, 0.45)',
    },

    modalSheet: {
      height: '72%',
      paddingTop: 10,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      backgroundColor:
        '#FFFFFF',
    },

    modalHandle: {
      width: 44,
      height: 5,
      alignSelf: 'center',
      borderRadius: 999,
      backgroundColor:
        '#CBD5E1',
    },

    modalHeader: {
      flexDirection: 'row',
      alignItems:
        'flex-start',
      justifyContent:
        'space-between',
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 14,
    },

    modalHeaderText: {
      flex: 1,
      minWidth: 0,
      paddingRight: 12,
    },

    modalTitle: {
      fontSize: 21,
      fontWeight: '800',
      color: '#0F172A',
    },

    modalSubtitle: {
      marginTop: 4,
      fontSize: 13,
      color: '#64748B',
    },

    closeButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 20,
      backgroundColor:
        '#F1F5F9',
    },

    timeOptions: {
      paddingHorizontal: 20,
      paddingBottom: 30,
    },

    timeOption: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
      marginBottom: 8,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor:
        '#E2E8F0',
      borderRadius: 15,
      backgroundColor:
        '#FFFFFF',
    },

    timeOptionSelected: {
      borderColor:
        '#93C5FD',
      backgroundColor:
        '#EFF6FF',
    },

    timeOptionIcon: {
      width: 38,
      height: 38,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 12,
      backgroundColor:
        '#EFF6FF',
    },

    timeOptionIconSelected: {
      backgroundColor:
        '#1677FF',
    },

    timeOptionText: {
      flex: 1,
      fontSize: 15,
      fontWeight: '700',
      color: '#0F172A',
    },

    timeOptionTextSelected: {
      color: '#1677FF',
    },
  });