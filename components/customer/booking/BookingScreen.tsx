import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Alert,
  StyleSheet,
} from "react-native";

import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";

import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

import {
  KeyboardAwareScrollView,
} from "react-native-keyboard-controller";

import {
  AppScreen,
} from "@/components/ui";

import {
  FixxamTokens,
} from "@/theme";

import BookingMethodStep from "@/components/customer/request-service/BookingMethodStep";

import BookingPriorityStep from "@/components/customer/request-service/BookingPriorityStep";

import RequestServiceReviewCard from "@/components/customer/request-service/RequestServiceReviewCard";

import RequestServiceSignInModal from "@/components/customer/request-service/RequestServiceSignInModal";

import {
  type RequestTimingValue,
} from "@/components/customer/request-service/RequestTiming";

import {
  getBookingParamValue,
  useBookingServiceData,
} from "@/components/customer/request-service/BookingServiceData";

import {
  useBookingWorkerData,
} from "@/components/customer/request-service/BookingWorkerData";

import {
  useBookingProviderData,
} from "@/components/customer/request-service/BookingProviderData";

import {
  auth,
} from "@/firebase/config";

import {
  getUser,
} from "@/firebase/queries/users";

import {
  createBooking,
} from "@/firebase/queries/bookings/createBooking";

import {
  type BookingFulfillmentMode,
} from "@/types/bookingFulfillment";

import {
  type BookingPriority,
} from "@/types/bookingPriority";

import useCurrentLocation from "@/hooks/location/useCurrentLocation";

import {
  consumeCapturedPhoto,
} from "@/utils/capturedPhotoStore";

/* ==============================================================
   TYPES
============================================================== */

type SelectedLocation = {
  latitude: number;
  longitude: number;
};

type LocationSuggestion = {
  id: string;
  title: string;
  subtitle?: string;
  latitude: number;
  longitude: number;
};

type AiPrefilledBooking = {
  description?: string;
  photos?: string[];
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  bookingDate?: string | null;
  bookingTime?: string | null;
};

type BookingParams = {
  serviceId?: string | string[];
  serviceName?: string | string[];
  serviceIcon?: string | string[];
  serviceColor?: string | string[];
  serviceBackgroundColor?: string | string[];

  categoryId?: string | string[];
  fulfillmentMode?: string | string[];

  workerId?: string | string[];
  workerName?: string | string[];
  workerPhoto?: string | string[];
  workerCategory?: string | string[];
  workerOnline?: string | string[];
  workerDistance?: string | string[];

  reward?: string | string[];
  customerDescription?: string | string[];
  booking?: string | string[];
};

/* ==============================================================
   CONSTANTS
============================================================== */

const MAX_PHOTOS = 3;

const MIN_DESCRIPTION_LENGTH = 3;

const MAX_DESCRIPTION_LENGTH = 300;

const LOCATION_SEARCH_LIMIT = 5;

const LOCATION_SEARCH_DEBOUNCE = 450;

/* ==============================================================
   HELPERS
============================================================== */

function isValidCoordinates(
  latitude:
    | number
    | null
    | undefined,

  longitude:
    | number
    | null
    | undefined,
): boolean {
  return (
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&

    typeof longitude === "number" &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function getUserFacingErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error
  ) {
    const message =
      error.message.trim();

    if (message) {
      return message;
    }
  }

  return "We could not send your request. Please try again.";
}

/* ==============================================================
   SCREEN
============================================================== */

export default function BookingScreen() {
  const params =
    useLocalSearchParams<BookingParams>();

  const {
    serviceId,
    serviceName,
    serviceIcon,
    serviceColor,
    serviceBackgroundColor,

    categoryId,
    fulfillmentMode,

    workerId,
    workerName,
    workerPhoto,
    workerCategory,
    workerOnline,
    workerDistance,

    reward,
    customerDescription,
    booking,
  } = params;

  const {
    location,
  } =
    useCurrentLocation();

  /* ============================================================
     SERVICE DATA
  ============================================================ */

  const service =
    useBookingServiceData({
      serviceId,
      serviceName,
      serviceIcon,
      serviceColor,
      serviceBackgroundColor,
      categoryId,
      fulfillmentMode,
    });

  /* ============================================================
     WORKER DATA
  ============================================================ */

  const worker =
    useBookingWorkerData({
      workerId,
      workerName,
      workerPhoto,
      workerCategory,
      workerOnline,
      workerDistance,
    });

  /* ============================================================
     PROVIDER DATA
  ============================================================ */

  const provider =
    useBookingProviderData({
      workerId:
        worker.id,

      fulfillmentMode:
        service.fulfillmentMode,
    });

  /* ============================================================
     METHOD MODAL
  ============================================================ */

  const [
    methodModalVisible,
    setMethodModalVisible,
  ] =
    useState(true);

  /* ============================================================
     PRIORITY MODAL
  ============================================================ */

  const [
    priorityModalVisible,
    setPriorityModalVisible,
  ] =
    useState(false);

  const [
    bookingPriority,
    setBookingPriority,
  ] =
    useState<BookingPriority | null>(
      null,
    );

  /* ============================================================
     AI PREFILLED BOOKING
  ============================================================ */

  const aiPrefilledBooking =
    useMemo<AiPrefilledBooking | null>(
      () => {
        const rawBooking =
          getBookingParamValue(
            booking,
          );

        if (!rawBooking) {
          return null;
        }

        try {
          const parsed: unknown =
            JSON.parse(
              rawBooking,
            );

          if (
            !parsed ||
            typeof parsed !== "object" ||
            Array.isArray(parsed)
          ) {
            return null;
          }

          return parsed as AiPrefilledBooking;
        } catch (error) {
          if (__DEV__) {
            console.warn(
              "INVALID_AI_BOOKING_JSON",
              error,
            );
          }

          return null;
        }
      },
      [
        booking,
      ],
    );

  /* ============================================================
     INITIAL SCHEDULE
  ============================================================ */

  const initialScheduledDate =
    useMemo(
      () => {
        const value =
          aiPrefilledBooking
            ?.bookingDate;

        if (
          typeof value !== "string" ||
          !value.trim()
        ) {
          return null;
        }

        const date =
          new Date(value);

        if (
          !Number.isFinite(
            date.getTime(),
          ) ||
          date.getTime() <=
            Date.now()
        ) {
          return null;
        }

        return date;
      },
      [
        aiPrefilledBooking,
      ],
    );

  /* ============================================================
     FULFILLMENT
  ============================================================ */

  const [
    selectedFulfillmentMode,
    setSelectedFulfillmentMode,
  ] =
    useState<
      BookingFulfillmentMode | null
    >(null);

  useEffect(() => {
    if (
      service.fulfillmentMode !==
      "flexible"
    ) {
      setSelectedFulfillmentMode(
        null,
      );
    }
  }, [
    service.fulfillmentMode,
  ]);

  const concreteFulfillmentMode =
    useMemo<
      BookingFulfillmentMode | null
    >(() => {
      if (
        service.fulfillmentMode ===
          "worker_visits_customer" ||
        service.fulfillmentMode ===
          "customer_visits_worker" ||
        service.fulfillmentMode ===
          "remote"
      ) {
        return service.fulfillmentMode;
      }

      if (
        service.fulfillmentMode ===
        "flexible"
      ) {
        return selectedFulfillmentMode;
      }

      return null;
    }, [
      selectedFulfillmentMode,
      service.fulfillmentMode,
    ]);

  /* ============================================================
     DESCRIPTION
  ============================================================ */

  const [
    description,
    setDescription,
  ] =
    useState(
      () => {
        const aiDescription =
          aiPrefilledBooking
            ?.description
            ?.trim();

        const fallbackDescription =
          getBookingParamValue(
            customerDescription,
          );

        return (
          aiDescription ||
          fallbackDescription ||
          ""
        );
      },
    );

  /* ============================================================
     PHOTOS
  ============================================================ */

  const [
    photos,
    setPhotos,
  ] =
    useState<string[]>(
      () => {
        if (
          !Array.isArray(
            aiPrefilledBooking
              ?.photos,
          )
        ) {
          return [];
        }

        return aiPrefilledBooking
          .photos
          .filter(
            (
              photo,
            ): photo is string =>
              typeof photo === "string" &&
              photo.trim().length > 0,
          )
          .map(
            photo =>
              photo.trim(),
          )
          .slice(
            0,
            MAX_PHOTOS,
          );
      },
    );

  /* ============================================================
     CUSTOMER LOCATION
  ============================================================ */

  const [
    selectedLocation,
    setSelectedLocation,
  ] =
    useState<SelectedLocation | null>(
      () => {
        const latitude =
          aiPrefilledBooking
            ?.latitude;

        const longitude =
          aiPrefilledBooking
            ?.longitude;

        if (
          !isValidCoordinates(
            latitude,
            longitude,
          )
        ) {
          return null;
        }

        return {
          latitude:
            latitude as number,

          longitude:
            longitude as number,
        };
      },
    );

  const [
    selectedAddress,
    setSelectedAddress,
  ] =
    useState(
      () =>
        aiPrefilledBooking
          ?.address
          ?.trim() ||
        "",
    );

  /* ============================================================
     TIMING

     bookingPriority:
     - immediate
     - normal
     - urgent

     timing:
     - asap
     - schedule

     Schedule is kept separate from priority so we preserve the
     current UI architecture while storing the user's exact choice.
  ============================================================ */

  const [
    timing,
    setTiming,
  ] =
    useState<RequestTimingValue>(
      initialScheduledDate
        ? "schedule"
        : "asap",
    );

  const [
    scheduledDate,
    setScheduledDate,
  ] =
    useState<Date | null>(
      initialScheduledDate,
    );

  /* ============================================================
     SUBMIT STATE
  ============================================================ */

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const submitInFlightRef =
    useRef(false);

  /* ============================================================
     SIGN IN
  ============================================================ */

  const [
    signInModalVisible,
    setSignInModalVisible,
  ] =
    useState(false);

  /* ============================================================
     LOCATION SEARCH
  ============================================================ */

  const [
    locationSuggestions,
    setLocationSuggestions,
  ] =
    useState<
      LocationSuggestion[]
    >([]);

  const [
    locationSearchLoading,
    setLocationSearchLoading,
  ] =
    useState(false);

  const locationSearchTimer =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(null);

  const locationSearchRequestId =
    useRef(0);

  useEffect(() => {
    return () => {
      if (
        locationSearchTimer
          .current
      ) {
        clearTimeout(
          locationSearchTimer
            .current,
        );

        locationSearchTimer.current =
          null;
      }
    };
  }, []);

  /* ============================================================
     FULFILLMENT CHANGE
  ============================================================ */

  const handleFulfillmentModeChange =
    useCallback(
      (
        value:
          BookingFulfillmentMode,
      ) => {
        setSelectedFulfillmentMode(
          value,
        );

        if (
          value ===
          "worker_visits_customer"
        ) {
          return;
        }

        locationSearchRequestId.current +=
          1;

        if (
          locationSearchTimer
            .current
        ) {
          clearTimeout(
            locationSearchTimer
              .current,
          );

          locationSearchTimer.current =
            null;
        }

        setLocationSuggestions(
          [],
        );

        setLocationSearchLoading(
          false,
        );
      },
      [],
    );

  /* ============================================================
     METHOD MODAL CONTINUE
  ============================================================ */

  const handleContinueFromMethod =
    useCallback(
      () => {
        if (
          service.fulfillmentMode ===
          "needs_review"
        ) {
          return;
        }

        if (
          service.fulfillmentMode ===
            "flexible" &&
          (
            selectedFulfillmentMode !==
              "worker_visits_customer" &&
            selectedFulfillmentMode !==
              "customer_visits_worker"
          )
        ) {
          Alert.alert(
            "Choose service method",
            "Please choose how you want to receive this service.",
          );

          return;
        }

        setMethodModalVisible(
          false,
        );

        setPriorityModalVisible(
          true,
        );
      },
      [
        selectedFulfillmentMode,
        service.fulfillmentMode,
      ],
    );

  /* ============================================================
     PRIORITY CHANGE

     Choosing a priority means this is NOT a scheduled request.
  ============================================================ */

  const handlePriorityChange =
    useCallback(
      (
        value:
          BookingPriority,
      ) => {
        setBookingPriority(
          value,
        );

        setTiming(
          "asap",
        );

        setScheduledDate(
          null,
        );
      },
      [],
    );

  /* ============================================================
     SCHEDULE SELECT

     Choosing Schedule for later clears immediate/normal/urgent.
  ============================================================ */

  const handleScheduleSelect =
    useCallback(
      () => {
        setBookingPriority(
          null,
        );

        setTiming(
          "schedule",
        );

        if (
          !scheduledDate
        ) {
          const defaultDate =
            new Date();

          defaultDate.setDate(
            defaultDate.getDate() +
              1,
          );

          defaultDate.setHours(
            9,
            0,
            0,
            0,
          );

          setScheduledDate(
            defaultDate,
          );
        }
      },
      [
        scheduledDate,
      ],
    );

  const handleOpenPriority =
    useCallback(
      () => {
        if (
          submitting ||
          methodModalVisible
        ) {
          return;
        }

        setPriorityModalVisible(
          true,
        );
      },
      [
        methodModalVisible,
        submitting,
      ],
    );

  const handleContinueFromPriority =
    useCallback(
      () => {
        const scheduleSelected =
          timing ===
          "schedule";

        if (
          !bookingPriority &&
          !scheduleSelected
        ) {
          Alert.alert(
            "Choose service timing",
            "Please choose how quickly you need this service or schedule it for later.",
          );

          return;
        }

        setPriorityModalVisible(
          false,
        );
      },
      [
        bookingPriority,
        timing,
      ],
    );

  const handleBackFromPriority =
    useCallback(
      () => {
        if (submitting) {
          return;
        }

        setPriorityModalVisible(
          false,
        );

        setMethodModalVisible(
          true,
        );
      },
      [
        submitting,
      ],
    );

  /* ============================================================
     CURRENT LOCATION
  ============================================================ */

  const currentCoordinates =
    useMemo(
      () => {
        if (
          !location ||
          !isValidCoordinates(
            location.latitude,
            location.longitude,
          )
        ) {
          return null;
        }

        return {
          latitude:
            location.latitude,

          longitude:
            location.longitude,
        };
      },
      [
        location,
      ],
    );

  /* ============================================================
     VALIDATION
  ============================================================ */

  const cleanDescription =
    description.trim();

  const customerLocationValid =
    useMemo(
      () =>
        Boolean(
          selectedLocation &&
          selectedAddress.trim() &&
          isValidCoordinates(
            selectedLocation
              .latitude,
            selectedLocation
              .longitude,
          ),
        ),
      [
        selectedAddress,
        selectedLocation,
      ],
    );

  const bookingLocationValid =
    useMemo(
      () => {
        if (
          concreteFulfillmentMode ===
          "remote"
        ) {
          return true;
        }

        if (
          concreteFulfillmentMode ===
          "worker_visits_customer"
        ) {
          return customerLocationValid;
        }

        if (
          concreteFulfillmentMode ===
          "customer_visits_worker"
        ) {
          return (
            provider.valid &&
            !provider.loading
          );
        }

        return false;
      },
      [
        concreteFulfillmentMode,
        customerLocationValid,
        provider.loading,
        provider.valid,
      ],
    );

  const scheduleValid =
    useMemo(
      () => {
        if (
          timing !==
          "schedule"
        ) {
          return true;
        }

        return Boolean(
          scheduledDate &&
          Number.isFinite(
            scheduledDate.getTime(),
          ) &&
          scheduledDate.getTime() >
            Date.now(),
        );
      },
      [
        scheduledDate,
        timing,
      ],
    );

  const serviceTimingValid =
    Boolean(
      bookingPriority ||
      timing === "schedule"
    );

  const canSubmit =
    Boolean(
      !methodModalVisible &&
      !priorityModalVisible &&
      serviceTimingValid &&
      scheduleValid &&
      service.id &&
      service.name &&
      worker.id &&
      concreteFulfillmentMode &&
      cleanDescription.length >=
        MIN_DESCRIPTION_LENGTH &&
      cleanDescription.length <=
        MAX_DESCRIPTION_LENGTH &&
      bookingLocationValid
    );

  /* ============================================================
     BACK
  ============================================================ */

  const handleBack =
    useCallback(
      () => {
        if (submitting) {
          return;
        }

        if (
          router.canGoBack()
        ) {
          router.back();

          return;
        }

        router.replace(
          "/(customer)/(tabs)/home",
        );
      },
      [
        submitting,
      ],
    );

  /* ============================================================
     TIMING CHANGE
  ============================================================ */

  const handleTimingChange =
    useCallback(
      (
        value:
          RequestTimingValue,
      ) => {
        setTiming(
          value,
        );

        if (
          value === "asap"
        ) {
          setScheduledDate(
            null,
          );

          return;
        }

        /*
         * If schedule is selected from the review form,
         * clear priority so the booking cannot contain conflicting
         * immediate/normal/urgent + scheduled states.
         */
        setBookingPriority(
          null,
        );
      },
      [],
    );

  /* ============================================================
     CAMERA PHOTO RESULT
  ============================================================ */

  useFocusEffect(
    useCallback(
      () => {
        const capturedPhoto =
          consumeCapturedPhoto();

        if (
          !capturedPhoto
        ) {
          return;
        }

        setPhotos(
          current => {
            if (
              current.length >=
                MAX_PHOTOS ||
              current.includes(
                capturedPhoto,
              )
            ) {
              return current;
            }

            return [
              ...current,
              capturedPhoto,
            ];
          },
        );
      },
      [],
    ),
  );

  /* ============================================================
     LOCATION SELECTED
  ============================================================ */

  const handleLocationSelected =
    useCallback(
      ({
        address,
        latitude,
        longitude,
      }: {
        address?: string;
        latitude: number;
        longitude: number;
      }) => {
        if (
          !isValidCoordinates(
            latitude,
            longitude,
          )
        ) {
          Alert.alert(
            "Invalid location",
            "Please select a valid service location.",
          );

          return;
        }

        setSelectedLocation({
          latitude,
          longitude,
        });

        setSelectedAddress(
          address?.trim() ||
          "Selected service location",
        );

        setLocationSuggestions(
          [],
        );
      },
      [],
    );

  /* ============================================================
     LOCATION SEARCH
  ============================================================ */

  const handleSearchLocation =
    useCallback(
      async (
        query: string,
      ) => {
        const requestId =
          ++locationSearchRequestId.current;

        try {
          const results =
            await Location.geocodeAsync(
              query,
            );

          if (
            requestId !==
            locationSearchRequestId.current
          ) {
            return;
          }

          const nextSuggestions:
            LocationSuggestion[] =
            [];

          const limitedResults =
            results.slice(
              0,
              LOCATION_SEARCH_LIMIT,
            );

          for (
            let index = 0;
            index <
            limitedResults.length;
            index += 1
          ) {
            const item =
              limitedResults[index];

            if (
              !isValidCoordinates(
                item.latitude,
                item.longitude,
              )
            ) {
              continue;
            }

            let subtitle =
              "";

            try {
              const addresses =
                await Location.reverseGeocodeAsync({
                  latitude:
                    item.latitude,

                  longitude:
                    item.longitude,
                });

              const address =
                addresses[0];

              if (address) {
                subtitle =
                  [
                    address.name,
                    address.city,
                    address.region,
                    address.country,
                  ]
                    .filter(
                      (
                        value,
                      ): value is string =>
                        typeof value ===
                          "string" &&
                        value.trim().length >
                          0,
                    )
                    .join(", ");
              }
            } catch (error) {
              if (__DEV__) {
                console.warn(
                  "REVERSE_GEOCODE_SUGGESTION_ERROR",
                  error,
                );
              }
            }

            if (
              requestId !==
              locationSearchRequestId.current
            ) {
              return;
            }

            nextSuggestions.push({
              id:
                `${item.latitude}-${item.longitude}-${index}`,

              title:
                query,

              subtitle:
                subtitle ||
                undefined,

              latitude:
                item.latitude,

              longitude:
                item.longitude,
            });
          }

          if (
            requestId !==
            locationSearchRequestId.current
          ) {
            return;
          }

          setLocationSuggestions(
            nextSuggestions,
          );
        } catch (error) {
          if (
            requestId !==
            locationSearchRequestId.current
          ) {
            return;
          }

          if (__DEV__) {
            console.warn(
              "SEARCH_BOOKING_LOCATION_ERROR",
              error,
            );
          }

          setLocationSuggestions(
            [],
          );
        } finally {
          if (
            requestId ===
            locationSearchRequestId.current
          ) {
            setLocationSearchLoading(
              false,
            );
          }
        }
      },
      [],
    );

  /* ============================================================
     LOCATION INPUT
  ============================================================ */

  const handleSearchLocationInput =
    useCallback(
      (
        text: string,
      ) => {
        const query =
          text.trim();

        if (
          locationSearchTimer
            .current
        ) {
          clearTimeout(
            locationSearchTimer
              .current,
          );

          locationSearchTimer.current =
            null;
        }

        locationSearchRequestId.current +=
          1;

        if (!query) {
          setLocationSuggestions(
            [],
          );

          setLocationSearchLoading(
            false,
          );

          return;
        }

        setLocationSearchLoading(
          true,
        );

        locationSearchTimer.current =
          setTimeout(
            () => {
              void handleSearchLocation(
                query,
              );
            },
            LOCATION_SEARCH_DEBOUNCE,
          );
      },
      [
        handleSearchLocation,
      ],
    );

  /* ============================================================
     GALLERY
  ============================================================ */

  const handleAddPhoto =
    useCallback(
      async () => {
        if (submitting) {
          return;
        }

        if (
          photos.length >=
          MAX_PHOTOS
        ) {
          Alert.alert(
            "Photo limit",
            `You can add up to ${MAX_PHOTOS} photos.`,
          );

          return;
        }

        try {
          const permission =
            await ImagePicker
              .requestMediaLibraryPermissionsAsync();

          if (
            !permission.granted
          ) {
            Alert.alert(
              "Permission required",
              "Please allow photo access to select a photo.",
            );

            return;
          }

          const result =
            await ImagePicker
              .launchImageLibraryAsync({
                mediaTypes: [
                  "images",
                ],

                allowsEditing:
                  true,

                quality:
                  0.8,

                selectionLimit:
                  1,
              });

          if (
            result.canceled ||
            !result.assets?.length
          ) {
            return;
          }

          const uri =
            result.assets[0]
              ?.uri
              ?.trim();

          if (!uri) {
            return;
          }

          setPhotos(
            current => {
              if (
                current.length >=
                  MAX_PHOTOS ||
                current.includes(
                  uri,
                )
              ) {
                return current;
              }

              return [
                ...current,
                uri,
              ];
            },
          );
        } catch (error) {
          if (__DEV__) {
            console.warn(
              "ADD_BOOKING_PHOTO_ERROR",
              error,
            );
          }

          Alert.alert(
            "Photo error",
            "Unable to select this photo. Please try again.",
          );
        }
      },
      [
        photos.length,
        submitting,
      ],
    );

  /* ============================================================
     CAMERA
  ============================================================ */

  const handleTakePhoto =
    useCallback(
      () => {
        if (
          submitting ||
          photos.length >=
            MAX_PHOTOS
        ) {
          if (
            photos.length >=
            MAX_PHOTOS
          ) {
            Alert.alert(
              "Photo limit",
              `You can add up to ${MAX_PHOTOS} photos.`,
            );
          }

          return;
        }

        router.push(
          "/(customer)/requesting/camera",
        );
      },
      [
        photos.length,
        submitting,
      ],
    );

  /* ============================================================
     REMOVE PHOTO
  ============================================================ */

  const handleRemovePhoto =
    useCallback(
      (
        uri: string,
      ) => {
        if (submitting) {
          return;
        }

        setPhotos(
          current =>
            current.filter(
              photo =>
                photo !== uri,
            ),
        );
      },
      [
        submitting,
      ],
    );

  /* ============================================================
     SIGN IN
  ============================================================ */

  const handleCloseSignIn =
    useCallback(
      () => {
        setSignInModalVisible(
          false,
        );
      },
      [],
    );

  const handleSignIn =
    useCallback(
      () => {
        setSignInModalVisible(
          false,
        );

        router.push(
          "/(auth)/login",
        );
      },
      [],
    );

  /* ============================================================
     SUBMIT
  ============================================================ */

  const handleSubmit =
    useCallback(
      async () => {
        if (
          submitting ||
          submitInFlightRef.current
        ) {
          return;
        }

        const currentUser =
          auth.currentUser;

        const customerId =
          currentUser?.uid
            ?.trim();

        /* ======================================================
           AUTH
        ====================================================== */

        if (!customerId) {
          setSignInModalVisible(
            true,
          );

          return;
        }

        /* ======================================================
           SERVICE
        ====================================================== */

        if (
          !service.id ||
          !service.name
        ) {
          Alert.alert(
            "Service unavailable",
            "The selected service is no longer available. Please choose the service again.",
          );

          return;
        }

        /* ======================================================
           WORKER
        ====================================================== */

        if (!worker.id) {
          Alert.alert(
            "Worker unavailable",
            "Please go back and select a worker.",
          );

          return;
        }

        if (
          worker.id ===
          customerId
        ) {
          Alert.alert(
            "Invalid worker",
            "You cannot send a service request to yourself.",
          );

          return;
        }

        /* ======================================================
           FULFILLMENT
        ====================================================== */

        if (
          !concreteFulfillmentMode
        ) {
          Alert.alert(
            service.fulfillmentMode ===
              "flexible"
              ? "Choose service method"
              : "Service setup required",

            service.fulfillmentMode ===
              "flexible"
              ? "Please choose whether the provider should come to you or you will visit the provider."
              : "This service has not been configured for booking yet. Please choose another service or try again later.",
          );

          return;
        }

        /* ======================================================
           PRIORITY / SCHEDULE
        ====================================================== */

        if (
          !bookingPriority &&
          timing !== "schedule"
        ) {
          setPriorityModalVisible(
            true,
          );

          return;
        }

        /* ======================================================
           DESCRIPTION
        ====================================================== */

        if (
          cleanDescription.length <
          MIN_DESCRIPTION_LENGTH
        ) {
          Alert.alert(
            "Describe your request",
            "Please tell the worker what you need help with.",
          );

          return;
        }

        if (
          cleanDescription.length >
          MAX_DESCRIPTION_LENGTH
        ) {
          Alert.alert(
            "Description too long",
            `Please keep your description within ${MAX_DESCRIPTION_LENGTH} characters.`,
          );

          return;
        }

        /* ======================================================
           DESTINATION
        ====================================================== */

        let bookingAddress =
          "";

        let bookingLatitude:
          number | null =
          null;

        let bookingLongitude:
          number | null =
          null;

        if (
          concreteFulfillmentMode ===
          "worker_visits_customer"
        ) {
          if (
            !selectedLocation ||
            !selectedAddress.trim()
          ) {
            Alert.alert(
              "Location required",
              "Please select where the provider should come.",
            );

            return;
          }

          if (
            !isValidCoordinates(
              selectedLocation
                .latitude,
              selectedLocation
                .longitude,
            )
          ) {
            Alert.alert(
              "Invalid location",
              "Please select a valid service location.",
            );

            return;
          }

          bookingAddress =
            selectedAddress.trim();

          bookingLatitude =
            selectedLocation.latitude;

          bookingLongitude =
            selectedLocation.longitude;
        } else if (
          concreteFulfillmentMode ===
          "customer_visits_worker"
        ) {
          if (
            provider.loading
          ) {
            Alert.alert(
              "Provider location loading",
              "Please wait while we load the provider location.",
            );

            return;
          }

          if (
            !provider.location ||
            !provider.valid ||
            !provider.address
          ) {
            Alert.alert(
              "Provider location unavailable",
              "This provider has not added a complete service location yet. Please choose another provider.",
            );

            return;
          }

          bookingAddress =
            provider.address;

          bookingLatitude =
            provider.location.latitude;

          bookingLongitude =
            provider.location.longitude;
        }

        if (
          concreteFulfillmentMode !==
            "remote" &&
          !isValidCoordinates(
            bookingLatitude,
            bookingLongitude,
          )
        ) {
          Alert.alert(
            "Invalid location",
            "A valid booking destination is required.",
          );

          return;
        }

        /* ======================================================
           SCHEDULE VALIDATION
        ====================================================== */

        if (
          timing === "schedule" &&
          !scheduledDate
        ) {
          Alert.alert(
            "Schedule required",
            "Please choose the date and time for your service.",
          );

          return;
        }

        if (
          timing === "schedule" &&
          scheduledDate &&
          scheduledDate.getTime() <=
            Date.now()
        ) {
          Alert.alert(
            "Invalid schedule",
            "Please choose a future date and time.",
          );

          return;
        }

        /* ======================================================
           RESOLVE TIMING

           These values are intentionally resolved before the
           Firestore write so impossible combinations cannot be
           stored.

           Priority booking:
             bookingPriority = immediate | normal | urgent
             timing = asap
             bookingDate = null
             bookingTime = null

           Scheduled booking:
             bookingPriority = null
             timing = schedule
             bookingDate = ISO timestamp
             bookingTime = formatted display time
        ====================================================== */

        const isScheduled =
          timing === "schedule";

        const resolvedPriority:
          BookingPriority | null =
          isScheduled
            ? null
            : bookingPriority;

        if (
          !isScheduled &&
          !resolvedPriority
        ) {
          setPriorityModalVisible(
            true,
          );

          return;
        }

        const bookingDate =
          isScheduled &&
          scheduledDate
            ? scheduledDate.toISOString()
            : null;

        const bookingTime =
          isScheduled &&
          scheduledDate
            ? scheduledDate.toLocaleTimeString(
                "en-US",
                {
                  hour:
                    "numeric",

                  minute:
                    "2-digit",

                  hour12:
                    true,
                },
              )
            : null;

        submitInFlightRef.current =
          true;

        setSubmitting(
          true,
        );

        try {
          /* ====================================================
             CUSTOMER PROFILE
          ==================================================== */

          const userSnapshot =
            await getUser(
              customerId,
            );

          const user =
            userSnapshot.exists()
              ? userSnapshot.data()
              : null;

          const customerName =
            typeof user?.fullName ===
              "string"
              ? user.fullName.trim()
              : "";

          const customerPhotoURL =
            typeof user?.photoUrl ===
              "string"
              ? user.photoUrl.trim()
              : "";

          if (!customerName) {
            throw new Error(
              "Your profile name is missing. Please update your profile and try again.",
            );
          }

          /* ====================================================
             CREATE BOOKING
          ==================================================== */

          const bookingId =
            await createBooking({
              customerId,

              customerName,

              customerPhotoURL,

              workerId:
                worker.id,

              workerName:
                worker.name,

              workerPhoto:
                worker.photoUrl ||
                null,

              serviceId:
                service.id,

              serviceName:
                service.name,

              serviceIcon:
                service.icon,

              serviceColor:
                service.color,

              serviceBackgroundColor:
                service.backgroundColor,

              categoryId:
                service.categoryId ||
                null,

              fulfillmentMode:
                concreteFulfillmentMode,

              description:
                cleanDescription,

              photos,

              address:
                bookingAddress,

              latitude:
                bookingLatitude,

              longitude:
                bookingLongitude,

              /*
               * Schedule values exist only for
               * "Schedule for later".
               */
              bookingDate,

              bookingTime,

              /*
               * Preserve the customer's exact choice.
               *
               * immediate
               * normal
               * urgent
               * null when scheduled
               */
              bookingPriority:
                resolvedPriority,

              /*
               * Existing timing architecture:
               *
               * asap     = immediate/normal/urgent
               * schedule = scheduled date/time
               */
              timing:
                isScheduled
                  ? "schedule"
                  : "asap",

              amount:
                null,

              /*
               * Keep the legacy urgent field temporarily.
               * Existing screens/rules may still depend on it.
               */
              urgent:
                resolvedPriority ===
                "urgent",

              urgentFee:
                0,
            });

          if (!bookingId) {
            throw new Error(
              "Booking ID was not returned.",
            );
          }

          /* ====================================================
             PENDING SCREEN
          ==================================================== */

          const rewardValue =
            getBookingParamValue(
              reward,
            );

          router.push({
            pathname:
              "/(customer)/requesting/pending",

            params: {
              bookingId,

              serviceId:
                service.id,

              serviceName:
                service.name,

              serviceIcon:
                service.icon,

              serviceColor:
                service.color,

              serviceBackgroundColor:
                service.backgroundColor,

              fulfillmentMode:
                concreteFulfillmentMode,

              workerId:
                worker.id,

              workerName:
                worker.name,

              workerPhoto:
                worker.photoUrl,

              ...(rewardValue
                ? {
                    reward:
                      rewardValue,
                  }
                : {}),
            },
          });
        } catch (error) {
          if (__DEV__) {
            console.warn(
              "CREATE_BOOKING_FAILED",
              {
                message:
                  getUserFacingErrorMessage(
                    error,
                  ),

                error,
              },
            );
          }

          Alert.alert(
            "Request failed",
            getUserFacingErrorMessage(
              error,
            ),
          );
        } finally {
          submitInFlightRef.current =
            false;

          setSubmitting(
            false,
          );
        }
      },
      [
        bookingPriority,
        cleanDescription,
        concreteFulfillmentMode,
        photos,
        provider.address,
        provider.loading,
        provider.location,
        provider.valid,
        reward,
        scheduledDate,
        selectedAddress,
        selectedLocation,
        service.backgroundColor,
        service.categoryId,
        service.color,
        service.fulfillmentMode,
        service.icon,
        service.id,
        service.name,
        submitting,
        timing,
        worker.id,
        worker.name,
        worker.photoUrl,
      ],
    );

  /* ============================================================
     UI
  ============================================================ */

  return (
    <>
      <AppScreen
        role="customer"
        padded={false}
      >
        <KeyboardAwareScrollView
          style={
            styles.screen
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          bottomOffset={
            FixxamTokens
              .size
              .buttonHeight +
            FixxamTokens
              .spacing
              .lg
          }
          contentContainerStyle={
            styles.content
          }
        >
          <RequestServiceReviewCard
            worker={{
              name:
                worker.name,

              photoUrl:
                worker.photoUrl,

              category:
                worker.category,

              online:
                worker.online,

              distance:
                worker.distance,
            }}
            service={{
              name:
                service.name,

              icon:
                service.icon,

              color:
                service.color,

              backgroundColor:
                service.backgroundColor,
            }}
            fulfillmentMode={
              service.fulfillmentMode
            }
            selectedFulfillmentMode={
              selectedFulfillmentMode
            }
            bookingPriority={
              bookingPriority
            }
            onPriorityPress={
              handleOpenPriority
            }
            providerLocation={
              provider.location
            }
            providerLocationLoading={
              provider.loading
            }
            description={
              description
            }
            onDescriptionChange={
              setDescription
            }
            photos={
              photos
            }
            onAddPhoto={
              handleAddPhoto
            }
            onTakePhoto={
              handleTakePhoto
            }
            onRemovePhoto={
              handleRemovePhoto
            }
            locationSelected={
              Boolean(
                selectedLocation,
              )
            }
            address={
              selectedAddress
            }
            currentLocation={
              currentCoordinates
            }
            locationSuggestions={
              locationSuggestions
            }
            locationSuggestionsLoading={
              locationSearchLoading
            }
            onLocationSelected={
              handleLocationSelected
            }
            onSearchLocation={
              handleSearchLocationInput
            }
            timing={
              timing
            }
            scheduledDate={
              scheduledDate
            }
            onTimingChange={
              handleTimingChange
            }
            onScheduledDateChange={
              setScheduledDate
            }
            submitting={
              submitting
            }
            canSubmit={
              canSubmit
            }
            onCancel={
              handleBack
            }
            onSubmit={
              handleSubmit
            }
            disabled={
              submitting ||
              methodModalVisible ||
              priorityModalVisible
            }
          />
        </KeyboardAwareScrollView>
      </AppScreen>

      {/* ========================================================
          SERVICE METHOD
      ======================================================== */}

      <BookingMethodStep
        visible={
          methodModalVisible
        }
        workerName={
          worker.name
        }
        fulfillmentMode={
          service.fulfillmentMode
        }
        selectedFulfillmentMode={
          selectedFulfillmentMode
        }
        onFulfillmentModeChange={
          handleFulfillmentModeChange
        }
        onContinue={
          handleContinueFromMethod
        }
        onGoBack={
          handleBack
        }
        disabled={
          submitting
        }
      />

      {/* ========================================================
          PRIORITY / SCHEDULE
      ======================================================== */}

      <BookingPriorityStep
        visible={
          priorityModalVisible
        }
        value={
          bookingPriority
        }
        scheduleSelected={
          timing ===
          "schedule"
        }
        onChange={
          handlePriorityChange
        }
        onScheduleSelect={
          handleScheduleSelect
        }
        onContinue={
          handleContinueFromPriority
        }
        onGoBack={
          handleBackFromPriority
        }
        disabled={
          submitting
        }
      />

      {/* ========================================================
          SIGN IN
      ======================================================== */}

      <RequestServiceSignInModal
        visible={
          signInModalVisible
        }
        onClose={
          handleCloseSignIn
        }
        onSignIn={
          handleSignIn
        }
      />
    </>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    screen: {
      flex:
        1,

      backgroundColor:
        "#F8FAFC",
    },

    content: {
      flexGrow:
        1,

      width:
        "100%",

      paddingHorizontal:
        20,

      paddingTop:
        18,

      paddingBottom:
        40,

      backgroundColor:
        "#F8FAFC",
    },
  });