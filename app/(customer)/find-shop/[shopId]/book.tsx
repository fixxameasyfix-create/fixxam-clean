import * as ImagePicker from 'expo-image-picker';
import {
  router,
  useLocalSearchParams,
  type Href,
} from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { auth } from '../../../../firebase/config';

import {
  getShopById,
  getShopServiceById,
} from '../../../../services/shopService';

import {
  createShopRequest,
  createShopRequestId,
} from '../../../../services/shopRequestService';

import type {
  FirebaseShop,
  FirebaseShopService,
} from '../../../../types/firebaseShop';

import BookShopHeader from '../../../../components/find-shop/book/BookShopHeader';
import ShopBookingSummary from '../../../../components/find-shop/book/ShopBookingSummary';
import BookingScheduleFields from '../../../../components/find-shop/book/BookingScheduleFields';
import BookingDetailsFields from '../../../../components/find-shop/book/BookingDetailsFields';
import BookingSelectionModal from '../../../../components/find-shop/book/BookingSelectionModal';
import BookingSuccessModal from '../../../../components/find-shop/book/BookingSuccessModal';

import SignInRequiredModal from '../../../../components/auth/SignInRequiredModal';

/* ============================================================
   LIMITS
============================================================ */

const MAX_DESCRIPTION_LENGTH = 500;
const MAX_REQUEST_PHOTOS = 4;

const MAX_PHOTO_SIZE_BYTES =
  5 * 1024 * 1024;

const BOOKING_DAYS_AHEAD = 14;

const TIME_SLOT_INTERVAL_MINUTES = 30;

const MIN_BOOKING_LEAD_MINUTES = 30;

const MINUTES_PER_DAY = 24 * 60;

/* ============================================================
   ROUTES
============================================================ */

const LOGIN_ROUTE =
  '/login' as Href;

/**
 * Request details screen:
 *
 * app/(customer)/orders/shop-request/[requestId].tsx
 *
 * Expo Router route groups such as "(customer)" are
 * internal navigation groups and are not part of the
 * public URL.
 */
const REQUEST_DETAILS_ROUTE =
  '/(customer)/orders/shop-request/[requestId]';

/**
 * Expo Router's generated typed routes can temporarily
 * become stale while a new route file is being created
 * or before the router type generation catches up.
 *
 * We keep the route strongly named here and cast the
 * complete navigation object to Href instead of using
 * `any`.
 */
function createRequestDetailsHref(
  requestId: string,
): Href {
  return {
    pathname:
      REQUEST_DETAILS_ROUTE as Href,
    params: {
      requestId,
    },
  } as Href;
}

/* ============================================================
   DATE DATA
============================================================ */

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/* ============================================================
   TYPES
============================================================ */

export type BookingDateOption = {
  key: string;
  label: string;
  dayName: string;
  date: Date;
};

type TimeSlotOption = {
  value: string;
  minutesFromDayStart: number;
  dayOffset: number;
};

/* ============================================================
   HELPERS
============================================================ */

function normalizeRouteParam(
  value:
    | string
    | string[]
    | undefined,
): string {
  const resolved = Array.isArray(
    value,
  )
    ? value[0]
    : value;

  return resolved?.trim() ?? '';
}

function toDateKey(
  date: Date,
): string {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0');

  const day = String(
    date.getDate(),
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatBookingDate(
  date: Date,
): string {
  return `${DAY_NAMES[
    date.getDay()
  ].slice(0, 3)}, ${date.getDate()} ${
    MONTH_NAMES[
      date.getMonth()
    ]
  } ${date.getFullYear()}`;
}

function parse24HourTime(
  value: string,
): number | null {
  const match = value
    .trim()
    .match(
      /^(\d{1,2}):(\d{2})$/,
    );

  if (!match) {
    return null;
  }

  const hour = Number(
    match[1],
  );

  const minute = Number(
    match[2],
  );

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return (
    hour * 60 +
    minute
  );
}

function formatMinutesToTime(
  totalMinutes: number,
): string {
  const normalizedMinutes =
    ((totalMinutes %
      MINUTES_PER_DAY) +
      MINUTES_PER_DAY) %
    MINUTES_PER_DAY;

  const hour24 = Math.floor(
    normalizedMinutes / 60,
  );

  const minute =
    normalizedMinutes % 60;

  const period =
    hour24 >= 12
      ? 'PM'
      : 'AM';

  const hour12 =
    hour24 % 12 || 12;

  return `${hour12}:${String(
    minute,
  ).padStart(2, '0')} ${period}`;
}

function getTimeSlots(
  openTime: string,
  closeTime: string,
): TimeSlotOption[] {
  const opening =
    parse24HourTime(
      openTime,
    );

  const rawClosing =
    parse24HourTime(
      closeTime,
    );

  if (
    opening === null ||
    rawClosing === null ||
    opening === rawClosing
  ) {
    return [];
  }

  const closing =
    rawClosing > opening
      ? rawClosing
      : rawClosing +
        MINUTES_PER_DAY;

  const slots: TimeSlotOption[] =
    [];

  for (
    let current = opening;
    current < closing;
    current +=
      TIME_SLOT_INTERVAL_MINUTES
  ) {
    const dayOffset =
      Math.floor(
        current /
          MINUTES_PER_DAY,
      );

    const minutesFromDayStart =
      current %
      MINUTES_PER_DAY;

    slots.push({
      value:
        formatMinutesToTime(
          minutesFromDayStart,
        ),
      minutesFromDayStart,
      dayOffset,
    });
  }

  return slots;
}

function createSlotDate(
  bookingDate: Date,
  slot: TimeSlotOption,
): Date {
  const result =
    new Date(bookingDate);

  result.setHours(
    0,
    0,
    0,
    0,
  );

  result.setDate(
    result.getDate() +
      slot.dayOffset,
  );

  result.setMinutes(
    slot.minutesFromDayStart,
  );

  return result;
}

function isSlotBookable(
  bookingDate: Date,
  slot: TimeSlotOption,
  now = new Date(),
): boolean {
  const slotDate =
    createSlotDate(
      bookingDate,
      slot,
    );

  const minimumAllowedTime =
    now.getTime() +
    MIN_BOOKING_LEAD_MINUTES *
      60 *
      1000;

  return (
    slotDate.getTime() >=
    minimumAllowedTime
  );
}

function getAvailableTimeSlots(
  bookingDate: Date,
  openTime: string,
  closeTime: string,
  now = new Date(),
): TimeSlotOption[] {
  return getTimeSlots(
    openTime,
    closeTime,
  ).filter((slot) =>
    isSlotBookable(
      bookingDate,
      slot,
      now,
    ),
  );
}

function getErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  return 'Something went wrong. Please try again.';
}

/* ============================================================
   SCREEN
============================================================ */

export default function BookShopScreen() {
  const params =
    useLocalSearchParams<{
      shopId?:
        | string
        | string[];
      serviceId?:
        | string
        | string[];
    }>();

  const shopId =
    normalizeRouteParam(
      params.shopId,
    );

  const serviceId =
    normalizeRouteParam(
      params.serviceId,
    );

  /**
   * Generate the request ID only once for this
   * booking screen instance.
   */
  const requestIdRef =
    useRef<string | null>(
      null,
    );

  if (!requestIdRef.current) {
    requestIdRef.current =
      createShopRequestId();
  }

  const [
    shop,
    setShop,
  ] =
    useState<FirebaseShop | null>(
      null,
    );

  const [
    selectedService,
    setSelectedService,
  ] =
    useState<FirebaseShopService | null>(
      null,
    );

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const [
    loadError,
    setLoadError,
  ] =
    useState('');

  const [
    retryKey,
    setRetryKey,
  ] =
    useState(0);

  const [
    description,
    setDescription,
  ] =
    useState('');

  const [
    selectedDateKey,
    setSelectedDateKey,
  ] =
    useState('');

  const [
    selectedTime,
    setSelectedTime,
  ] =
    useState('');

  const [
    photoUris,
    setPhotoUris,
  ] =
    useState<string[]>([]);

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

  const [
    successModalVisible,
    setSuccessModalVisible,
  ] =
    useState(false);

  const [
    signInModalVisible,
    setSignInModalVisible,
  ] =
    useState(false);

  const [
    isPickingPhotos,
    setIsPickingPhotos,
  ] =
    useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false);

  const [
    clockTick,
    setClockTick,
  ] =
    useState(0);

  /* ==========================================================
     CLOCK
  ========================================================== */

  useEffect(() => {
    const timer =
      setInterval(() => {
        setClockTick(
          (current) =>
            current + 1,
        );
      }, 60_000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  /* ==========================================================
     LOAD SHOP + SERVICE
  ========================================================== */

  useEffect(() => {
    let active = true;

    async function load() {
      if (
        !shopId ||
        !serviceId
      ) {
        setShop(null);
        setSelectedService(null);
        setLoadError(
          'Shop or service information is missing.',
        );
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError('');

        const [
          nextShop,
          nextService,
        ] =
          await Promise.all([
            getShopById(shopId),
            getShopServiceById(
              shopId,
              serviceId,
            ),
          ]);

        if (!active) {
          return;
        }

        if (
          !nextShop ||
          !nextShop.isActive
        ) {
          setShop(null);
          setSelectedService(null);
          setLoadError(
            'This shop is currently unavailable.',
          );
          return;
        }

        if (
          !nextService ||
          !nextService.isActive
        ) {
          setShop(null);
          setSelectedService(null);
          setLoadError(
            'This service is currently unavailable.',
          );
          return;
        }

        setShop(nextShop);
        setSelectedService(
          nextService,
        );
      } catch (error) {
        console.error(
          'Book shop load failed:',
          error,
        );

        if (!active) {
          return;
        }

        setShop(null);
        setSelectedService(null);
        setLoadError(
          'Unable to load this shop. Check your connection and try again.',
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [
    retryKey,
    serviceId,
    shopId,
  ]);

  /* ==========================================================
     AVAILABLE DATES
  ========================================================== */

  const availableDates =
    useMemo<BookingDateOption[]>(
      () => {
        if (!shop) {
          return [];
        }

        void clockTick;

        const now = new Date();

        const today =
          new Date(now);

        today.setHours(
          0,
          0,
          0,
          0,
        );

        const options: BookingDateOption[] =
          [];

        for (
          let offset = 0;
          offset <
          BOOKING_DAYS_AHEAD;
          offset += 1
        ) {
          const date =
            new Date(today);

          date.setDate(
            today.getDate() +
              offset,
          );

          const dayName =
            DAY_NAMES[
              date.getDay()
            ];

          const businessDay =
            shop.businessHours.find(
              (item) =>
                item.day ===
                dayName,
            );

          if (
            !businessDay ||
            !businessDay.isOpen
          ) {
            continue;
          }

          const slots =
            getAvailableTimeSlots(
              date,
              businessDay.openTime,
              businessDay.closeTime,
              now,
            );

          if (
            slots.length === 0
          ) {
            continue;
          }

          options.push({
            key: toDateKey(date),
            label:
              formatBookingDate(
                date,
              ),
            dayName,
            date,
          });
        }

        return options;
      },
      [
        clockTick,
        shop,
      ],
    );

  const selectedDate =
    useMemo<BookingDateOption | null>(
      () =>
        availableDates.find(
          (item) =>
            item.key ===
            selectedDateKey,
        ) ?? null,
      [
        availableDates,
        selectedDateKey,
      ],
    );

  /* ==========================================================
     AVAILABLE TIMES
  ========================================================== */

  const availableTimeSlots =
    useMemo<TimeSlotOption[]>(
      () => {
        if (
          !shop ||
          !selectedDate
        ) {
          return [];
        }

        void clockTick;

        const businessDay =
          shop.businessHours.find(
            (item) =>
              item.day ===
              selectedDate.dayName,
          );

        if (
          !businessDay ||
          !businessDay.isOpen
        ) {
          return [];
        }

        return getAvailableTimeSlots(
          selectedDate.date,
          businessDay.openTime,
          businessDay.closeTime,
          new Date(),
        );
      },
      [
        clockTick,
        selectedDate,
        shop,
      ],
    );

  const availableTimes =
    useMemo<string[]>(
      () =>
        availableTimeSlots.map(
          (slot) =>
            slot.value,
        ),
      [
        availableTimeSlots,
      ],
    );

  /* ==========================================================
     KEEP SELECTION VALID
  ========================================================== */

  useEffect(() => {
    if (!selectedTime) {
      return;
    }

    if (
      !availableTimes.includes(
        selectedTime,
      )
    ) {
      setSelectedTime('');
    }
  }, [
    availableTimes,
    selectedTime,
  ]);

  useEffect(() => {
    if (!selectedDateKey) {
      return;
    }

    const stillAvailable =
      availableDates.some(
        (item) =>
          item.key ===
          selectedDateKey,
      );

    if (!stillAvailable) {
      setSelectedDateKey('');
      setSelectedTime('');
    }
  }, [
    availableDates,
    selectedDateKey,
  ]);

  /* ==========================================================
     PHOTOS
  ========================================================== */

  const handleAddPhoto =
    useCallback(async () => {
      if (
        isPickingPhotos ||
        isSubmitting
      ) {
        return;
      }

      if (
        photoUris.length >=
        MAX_REQUEST_PHOTOS
      ) {
        Alert.alert(
          'Photo Limit Reached',
          `You can add up to ${MAX_REQUEST_PHOTOS} photos.`,
        );

        return;
      }

      try {
        setIsPickingPhotos(true);

        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            'Photo Permission Required',
            'Allow Fixxam to access your photos so you can attach photos to this request.',
          );

          return;
        }

        const remaining =
          MAX_REQUEST_PHOTOS -
          photoUris.length;

        const result =
          await ImagePicker.launchImageLibraryAsync(
            {
              mediaTypes: ['images'],
              allowsMultipleSelection:
                true,
              selectionLimit:
                remaining,
              quality: 0.8,
            },
          );

        if (result.canceled) {
          return;
        }

        const accepted: string[] =
          [];

        let oversized = 0;

        for (
          const asset of
          result.assets ?? []
        ) {
          const uri =
            asset.uri?.trim();

          if (!uri) {
            continue;
          }

          if (
            typeof asset.fileSize ===
              'number' &&
            asset.fileSize >
              MAX_PHOTO_SIZE_BYTES
          ) {
            oversized += 1;
            continue;
          }

          accepted.push(uri);
        }

        if (accepted.length > 0) {
          setPhotoUris(
            (current) =>
              Array.from(
                new Set([
                  ...current,
                  ...accepted,
                ]),
              ).slice(
                0,
                MAX_REQUEST_PHOTOS,
              ),
          );
        }

        if (oversized > 0) {
          Alert.alert(
            'Some Photos Were Skipped',
            'Each photo must be 5 MB or smaller.',
          );
        }
      } catch (error) {
        console.error(
          'Booking photo picker failed:',
          error,
        );

        Alert.alert(
          'Unable to Add Photos',
          'Please try again.',
        );
      } finally {
        setIsPickingPhotos(false);
      }
    }, [
      isPickingPhotos,
      isSubmitting,
      photoUris.length,
    ]);

  const handleRemovePhoto =
    useCallback(
      (uri: string) => {
        if (
          isSubmitting ||
          isPickingPhotos
        ) {
          return;
        }

        setPhotoUris(
          (current) =>
            current.filter(
              (item) =>
                item !== uri,
            ),
        );
      },
      [
        isPickingPhotos,
        isSubmitting,
      ],
    );

  /* ==========================================================
     FORM STATE
  ========================================================== */

  const normalizedDescription =
    description.trim();

  const hasValidDate =
    selectedDate !== null;

  const hasValidTime =
    selectedTime.length > 0 &&
    availableTimes.includes(
      selectedTime,
    );

  const canSendRequest =
    Boolean(
      shop &&
        selectedService &&
        hasValidDate &&
        hasValidTime &&
        !isSubmitting &&
        !isPickingPhotos,
    );

  /* ==========================================================
     AUTH
  ========================================================== */

  const requireAuthenticationForRequest =
    useCallback((): boolean => {
      if (auth.currentUser) {
        return true;
      }

      setSignInModalVisible(true);

      return false;
    }, []);

  const handleCloseSignInModal =
    useCallback(() => {
      setSignInModalVisible(false);
    }, []);

  const handleSignIn =
    useCallback(() => {
      setSignInModalVisible(false);
      router.push(LOGIN_ROUTE);
    }, []);

  /* ==========================================================
     SEND REQUEST
  ========================================================== */

  const handleSendRequest =
    useCallback(async () => {
      if (
        isSubmitting ||
        isPickingPhotos ||
        !shop ||
        !selectedService
      ) {
        return;
      }

      if (
        !requireAuthenticationForRequest()
      ) {
        return;
      }

      if (!selectedDate) {
        Alert.alert(
          'Select Date',
          'Choose your preferred service date.',
        );

        return;
      }

      if (!selectedTime) {
        Alert.alert(
          'Select Time',
          'Choose your preferred service time.',
        );

        return;
      }

      const businessDay =
        shop.businessHours.find(
          (item) =>
            item.day ===
            selectedDate.dayName,
        );

      if (
        !businessDay ||
        !businessDay.isOpen
      ) {
        setSelectedDateKey('');
        setSelectedTime('');

        Alert.alert(
          'Schedule Changed',
          'This date is no longer available. Please choose another date.',
        );

        return;
      }

      const freshSlots =
        getAvailableTimeSlots(
          selectedDate.date,
          businessDay.openTime,
          businessDay.closeTime,
          new Date(),
        );

      const selectedSlot =
        freshSlots.find(
          (slot) =>
            slot.value ===
            selectedTime,
        );

      if (!selectedSlot) {
        setSelectedTime('');

        Alert.alert(
          'Time No Longer Available',
          'Please choose another available time.',
        );

        return;
      }

      if (
        normalizedDescription.length >
        MAX_DESCRIPTION_LENGTH
      ) {
        Alert.alert(
          'Description Too Long',
          `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`,
        );

        return;
      }

      const cleanPhotoUris =
        Array.from(
          new Set(
            photoUris
              .map((uri) =>
                uri.trim(),
              )
              .filter(Boolean),
          ),
        ).slice(
          0,
          MAX_REQUEST_PHOTOS,
        );

      /*
       * Re-check Firebase auth immediately
       * before upload / Firestore write.
       */
      if (!auth.currentUser) {
        setSignInModalVisible(true);
        return;
      }

      const requestId =
        requestIdRef.current?.trim();

      if (!requestId) {
        Alert.alert(
          'Unable to Send Request',
          'A request ID could not be created. Please try again.',
        );

        return;
      }

      try {
        setIsSubmitting(true);

        await createShopRequest({
          requestId,

          shopId: shop.id,

          serviceId:
            selectedService.id,

          requestedDateKey:
            selectedDate.key,

          requestedDateLabel:
            selectedDate.label,

          requestedTime:
            selectedTime,

          description:
            normalizedDescription,

          photoUris:
            cleanPhotoUris,
        });

        setSuccessModalVisible(true);
      } catch (error) {
        console.error(
          'Shop request creation failed:',
          error,
        );

        if (!auth.currentUser) {
          setSignInModalVisible(true);
          return;
        }

        Alert.alert(
          'Unable to Send Request',
          getErrorMessage(error),
        );
      } finally {
        setIsSubmitting(false);
      }
    }, [
      isPickingPhotos,
      isSubmitting,
      normalizedDescription,
      photoUris,
      requireAuthenticationForRequest,
      selectedDate,
      selectedService,
      selectedTime,
      shop,
    ]);

  /* ==========================================================
     SUCCESS ACTIONS
  ========================================================== */

  const handleSuccessDone =
    useCallback(() => {
      if (!successModalVisible) {
        return;
      }

      setSuccessModalVisible(false);

      router.back();
    }, [
      successModalVisible,
    ]);

  /**
   * Opens:
   *
   * app/(customer)/orders/shop-request/[requestId].tsx
   *
   * with the actual Firestore request ID.
   */
  const handleViewVisits =
    useCallback(() => {
      if (
        !successModalVisible
      ) {
        return;
      }

      const requestId =
        requestIdRef.current?.trim();

      if (!requestId) {
        Alert.alert(
          'Unable to Open Request',
          'The request ID is missing. Please try again.',
        );

        return;
      }

      setSuccessModalVisible(false);

      router.push(
        createRequestDetailsHref(
          requestId,
        ),
      );
    }, [
      successModalVisible,
    ]);

  /* ==========================================================
     RETRY
  ========================================================== */

  const handleRetry =
    useCallback(() => {
      if (
        !shopId ||
        !serviceId
      ) {
        return;
      }

      setLoadError('');
      setIsLoading(true);

      setRetryKey(
        (current) =>
          current + 1,
      );
    }, [
      serviceId,
      shopId,
    ]);

  /* ==========================================================
     LOADING
  ========================================================== */

  if (isLoading) {
    return (
      <SafeAreaView
        edges={[
          'top',
          'bottom',
        ]}
        style={styles.safeArea}
      >
        <View
          style={
            styles.stateContainer
          }
        >
          <View
            style={
              styles.loadingIcon
            }
          >
            <ActivityIndicator
              size="large"
              color="#1677FF"
            />
          </View>

          <Text
            style={
              styles.stateTitle
            }
          >
            Loading Booking
          </Text>

          <Text
            style={
              styles.stateText
            }
          >
            Loading shop and service
            information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (
    loadError ||
    !shop ||
    !selectedService
  ) {
    return (
      <SafeAreaView
        edges={[
          'top',
          'bottom',
        ]}
        style={styles.safeArea}
      >
        <View
          style={
            styles.stateContainer
          }
        >
          <Text
            style={
              styles.stateTitle
            }
          >
            Booking Unavailable
          </Text>

          <Text
            style={
              styles.stateText
            }
          >
            {loadError ||
              'We could not find this shop or service.'}
          </Text>

          {shopId &&
          serviceId ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Try loading booking again"
              onPress={handleRetry}
              style={({
                pressed,
              }) => [
                styles.retryButton,
                pressed &&
                  styles.pressed,
              ]}
            >
              <Text
                style={
                  styles.retryButtonText
                }
              >
                Try Again
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
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
            <Text
              style={
                styles.backButtonText
              }
            >
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <SafeAreaView
      edges={['top']}
      style={styles.safeArea}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.scrollContent
          }
        >
          <BookShopHeader
            disabled={
              isSubmitting ||
              successModalVisible ||
              signInModalVisible
            }
            onBack={() =>
              router.back()
            }
          />

          <ShopBookingSummary
            service={
              selectedService
            }
            disabled={
              isSubmitting ||
              successModalVisible ||
              signInModalVisible
            }
            onChangeService={() =>
              router.back()
            }
          />

          <BookingScheduleFields
            selectedDate={
              selectedDate
            }
            selectedTime={
              selectedTime
            }
            hasAvailableDates={
              availableDates.length >
              0
            }
            hasAvailableTimes={
              availableTimes.length >
              0
            }
            disabled={
              isSubmitting ||
              successModalVisible ||
              signInModalVisible
            }
            onOpenDate={() =>
              setDateModalVisible(true)
            }
            onOpenTime={() =>
              setTimeModalVisible(true)
            }
          />

          <BookingDetailsFields
            description={
              description
            }
            maxDescriptionLength={
              MAX_DESCRIPTION_LENGTH
            }
            photoUris={
              photoUris
            }
            maxPhotos={
              MAX_REQUEST_PHOTOS
            }
            isPickingPhotos={
              isPickingPhotos
            }
            isSubmitting={
              isSubmitting
            }
            canSendRequest={
              canSendRequest &&
              !successModalVisible &&
              !signInModalVisible
            }
            hasValidDate={
              hasValidDate
            }
            hasValidTime={
              hasValidTime
            }
            onDescriptionChange={
              setDescription
            }
            onAddPhoto={
              handleAddPhoto
            }
            onRemovePhoto={
              handleRemovePhoto
            }
            onSendRequest={
              handleSendRequest
            }
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ======================================================
          DATE MODAL
      ====================================================== */}

      <BookingSelectionModal
        type="date"
        visible={
          dateModalVisible
        }
        dates={
          availableDates
        }
        selectedDateKey={
          selectedDateKey
        }
        onClose={() =>
          setDateModalVisible(false)
        }
        onSelectDate={(
          option: BookingDateOption,
        ) => {
          setSelectedDateKey(
            option.key,
          );

          setSelectedTime('');

          setDateModalVisible(
            false,
          );
        }}
      />

      {/* ======================================================
          TIME MODAL
      ====================================================== */}

      <BookingSelectionModal
        type="time"
        visible={
          timeModalVisible
        }
        times={
          availableTimes
        }
        selectedTime={
          selectedTime
        }
        dateLabel={
          selectedDate?.label
        }
        onClose={() =>
          setTimeModalVisible(false)
        }
        onSelectTime={(
          time: string,
        ) => {
          setSelectedTime(time);

          setTimeModalVisible(
            false,
          );
        }}
      />

      {/* ======================================================
          SIGN IN REQUIRED MODAL
      ====================================================== */}

      <SignInRequiredModal
        visible={
          signInModalVisible
        }
        title="Sign in required"
        message="Please sign in before sending your service request."
        onClose={
          handleCloseSignInModal
        }
        onSignIn={
          handleSignIn
        }
      />

      {/* ======================================================
          SUCCESS MODAL
      ====================================================== */}

      <BookingSuccessModal
        visible={
          successModalVisible
        }
        serviceName={
          selectedService.name
        }
        shopName={
          shop.name
        }
        closing={false}
        onDone={
          handleSuccessDone
        }
        onViewVisits={
          handleViewVisits
        }
      />
    </SafeAreaView>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    flex: {
      flex: 1,
    },

    safeArea: {
      flex: 1,
      backgroundColor:
        '#F8FAFC',
    },

    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },

    stateContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent:
        'center',
      paddingHorizontal: 30,
    },

    loadingIcon: {
      width: 88,
      height: 88,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 28,
      backgroundColor:
        '#EFF6FF',
    },

    stateTitle: {
      marginTop: 15,
      textAlign: 'center',
      fontSize: 21,
      fontWeight: '800',
      color: '#0F172A',
    },

    stateText: {
      maxWidth: 330,
      marginTop: 7,
      textAlign: 'center',
      fontSize: 15,
      lineHeight: 22,
      color: '#64748B',
    },

    retryButton: {
      minHeight: 48,
      marginTop: 22,
      alignItems: 'center',
      justifyContent:
        'center',
      paddingHorizontal: 24,
      borderRadius: 16,
      backgroundColor:
        '#1677FF',
    },

    retryButtonText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
    },

    backButton: {
      minHeight: 48,
      marginTop: 8,
      alignItems: 'center',
      justifyContent:
        'center',
      paddingHorizontal: 24,
      borderRadius: 16,
    },

    backButtonText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#334155',
    },

    pressed: {
      opacity: 0.72,
    },
  });