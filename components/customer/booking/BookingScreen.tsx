import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

import {
  KeyboardAwareScrollView,
} from "react-native-keyboard-controller";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import RequestWorkerCard from "@/components/customer/request-service/RequestWorkerCard";
import RequestDescription from "@/components/customer/request-service/RequestDescription";
import RequestPhotos from "@/components/customer/request-service/RequestPhotos";
import RequestLocation from "@/components/customer/request-service/RequestLocation";
import RequestTiming, {
  RequestTimingValue,
} from "@/components/customer/request-service/RequestTiming";

import { auth } from "@/firebase/config";

import { getUser } from "@/firebase/queries/users";

import {
  createBooking,
} from "@/firebase/queries/bookings/createBooking";

import {
  uploadBookingPhotos,
} from "@/firebase/storage/uploadBookingPhotos";

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

/**
 * AI-prepared booking data.
 *
 * This data is only used to prefill
 * the request form.
 */
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

  serviceBackgroundColor?:
    | string
    | string[];

  categoryId?: string | string[];

  workerId?: string | string[];

  workerName?: string | string[];

  workerPhoto?: string | string[];

  workerCategory?: string | string[];

  workerOnline?: string | string[];

  workerDistance?: string | string[];

  reward?: string | string[];

  customerDescription?:
    | string
    | string[];

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
   PARAM HELPER
============================================================== */

function getParamValue(
  value:
    | string
    | string[]
    | undefined,
): string {
  if (Array.isArray(value)) {
    return (
      value[0]?.trim() ?? ""
    );
  }

  return value?.trim() ?? "";
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

  const { location } =
    useCurrentLocation();

  /* ============================================================
     AI PREFILLED BOOKING
  ============================================================ */

  const aiPrefilledBooking =
    useMemo<AiPrefilledBooking | null>(
      () => {
        const rawBooking =
          getParamValue(booking);

        if (!rawBooking) {
          return null;
        }

        try {
          const parsed: unknown =
            JSON.parse(rawBooking);

          if (
            !parsed ||
            typeof parsed !==
              "object" ||
            Array.isArray(parsed)
          ) {
            return null;
          }

          return parsed as AiPrefilledBooking;
        } catch (error) {
          console.error(
            "INVALID_AI_BOOKING_JSON",
            error,
          );

          return null;
        }
      },
      [booking],
    );

  /* ============================================================
     AI INITIAL SCHEDULE
  ============================================================ */

  const initialScheduledDate =
    useMemo(() => {
      const value =
        aiPrefilledBooking?.bookingDate;

      if (
        typeof value !==
          "string" ||
        !value.trim()
      ) {
        return null;
      }

      const date =
        new Date(value);

      if (
        !Number.isFinite(
          date.getTime(),
        )
      ) {
        return null;
      }

      if (
        date.getTime() <=
        Date.now()
      ) {
        return null;
      }

      return date;
    }, [aiPrefilledBooking]);

  /* ============================================================
     RESOLVED SERVICE
  ============================================================ */

  const resolvedServiceId =
    useMemo(
      () =>
        getParamValue(
          serviceId,
        ),
      [serviceId],
    );

  const resolvedServiceName =
    useMemo(
      () =>
        getParamValue(
          serviceName,
        ),
      [serviceName],
    );

  /* ============================================================
     SERVICE ICON
  ============================================================ */

  /**
   * IMPORTANT:
   *
   * This must contain the SAME icon name
   * used by CategoryCard:
   *
   * <MaterialCommunityIcons
   *   name={icon}
   * />
   *
   * Example:
   *
   * "car-wrench"
   * "tools"
   * "hammer-wrench"
   *
   * We do NOT convert it to Ionicons.
   */

  const resolvedServiceIcon =
    useMemo(
      () =>
        getParamValue(
          serviceIcon,
        ) || "tools",
      [serviceIcon],
    );

  /* ============================================================
     SERVICE COLOR
  ============================================================ */

  const resolvedServiceColor =
    useMemo(
      () =>
        getParamValue(
          serviceColor,
        ) || "#EA580C",
      [serviceColor],
    );

  /* ============================================================
     SERVICE BACKGROUND
  ============================================================ */

  const resolvedServiceBackgroundColor =
    useMemo(
      () =>
        getParamValue(
          serviceBackgroundColor,
        ) || "#FFF7E8",
      [serviceBackgroundColor],
    );

  /* ============================================================
     RESOLVED WORKER
  ============================================================ */

  const resolvedWorkerId =
    useMemo(
      () =>
        getParamValue(
          workerId,
        ),
      [workerId],
    );

  const resolvedWorkerName =
    useMemo(
      () =>
        getParamValue(
          workerName,
        ) ||
        "Selected Worker",
      [workerName],
    );

  const resolvedWorkerPhoto =
    useMemo(
      () =>
        getParamValue(
          workerPhoto,
        ),
      [workerPhoto],
    );

  const resolvedWorkerCategory =
    useMemo(
      () =>
        getParamValue(
          workerCategory,
        ) ||
        "Service Provider",
      [workerCategory],
    );

  /* ============================================================
     WORKER STATUS
  ============================================================ */

  const isWorkerOnline =
    getParamValue(
      workerOnline,
    ) === "true";

  /* ============================================================
     DISTANCE
  ============================================================ */

  const parsedDistance =
    useMemo(() => {
      const raw =
        getParamValue(
          workerDistance,
        );

      if (!raw) {
        return undefined;
      }

      const value =
        Number(raw);

      if (
        !Number.isFinite(value)
      ) {
        return undefined;
      }

      return Math.max(
        0,
        value,
      );
    }, [workerDistance]);

  /* ============================================================
     DESCRIPTION
  ============================================================ */

  const [
    description,
    setDescription,
  ] = useState(() => {
    const aiDescription =
      aiPrefilledBooking?.description?.trim();

    const fallbackDescription =
      getParamValue(
        customerDescription,
      );

    return (
      aiDescription ||
      fallbackDescription ||
      ""
    );
  });

  /* ============================================================
     PHOTOS
  ============================================================ */

  const [
    photos,
    setPhotos,
  ] = useState<string[]>(() => {
    if (
      !Array.isArray(
        aiPrefilledBooking?.photos,
      )
    ) {
      return [];
    }

    return aiPrefilledBooking.photos
      .filter(
        (
          photo,
        ): photo is string =>
          typeof photo ===
            "string" &&
          photo.trim().length >
            0,
      )
      .slice(
        0,
        MAX_PHOTOS,
      );
  });

  /* ============================================================
     LOCATION
  ============================================================ */

  const [
    selectedLocation,
    setSelectedLocation,
  ] =
    useState<SelectedLocation | null>(
      () => {
        const latitude =
          aiPrefilledBooking?.latitude;

        const longitude =
          aiPrefilledBooking?.longitude;

        if (
          typeof latitude !==
            "number" ||
          typeof longitude !==
            "number" ||
          !Number.isFinite(
            latitude,
          ) ||
          !Number.isFinite(
            longitude,
          )
        ) {
          return null;
        }

        return {
          latitude,
          longitude,
        };
      },
    );

  const [
    selectedAddress,
    setSelectedAddress,
  ] = useState(
    () =>
      aiPrefilledBooking?.address?.trim() ||
      "",
  );

  /* ============================================================
     TIMING
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
  ] = useState<Date | null>(
    initialScheduledDate,
  );

  /* ============================================================
     SUBMITTING
  ============================================================ */

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  /* ============================================================
     SIGN IN MODAL
  ============================================================ */

  const [
    signInModalVisible,
    setSignInModalVisible,
  ] = useState(false);

  /* ============================================================
     LOCATION SEARCH
  ============================================================ */

  const [
    locationSuggestions,
    setLocationSuggestions,
  ] =
    useState<LocationSuggestion[]>(
      [],
    );

  const [
    locationSearchLoading,
    setLocationSearchLoading,
  ] = useState(false);

  const locationSearchTimer =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const locationSearchRequestId =
    useRef(0);

  /* ============================================================
     CLEANUP LOCATION SEARCH
  ============================================================ */

  useEffect(() => {
    return () => {
      if (
        locationSearchTimer.current
      ) {
        clearTimeout(
          locationSearchTimer.current,
        );

        locationSearchTimer.current =
          null;
      }
    };
  }, []);

  /* ============================================================
     CLEAN DESCRIPTION
  ============================================================ */

  const cleanDescription =
    description.trim();

  /* ============================================================
     CURRENT LOCATION
  ============================================================ */

  const currentCoordinates =
    useMemo(() => {
      if (!location) {
        return null;
      }

      if (
        !Number.isFinite(
          location.latitude,
        ) ||
        !Number.isFinite(
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
    }, [location]);

  /* ============================================================
     TIMING CHANGE
  ============================================================ */

  const handleTimingChange =
    useCallback(
      (
        value: RequestTimingValue,
      ) => {
        setTiming(value);

        if (
          value === "asap"
        ) {
          setScheduledDate(
            null,
          );
        }
      },
      [],
    );

  /* ============================================================
     CAN SUBMIT
  ============================================================ */

  const canSubmit =
    Boolean(
      resolvedServiceId &&
        resolvedServiceName &&
        resolvedWorkerId &&
        cleanDescription.length >=
          MIN_DESCRIPTION_LENGTH &&
        cleanDescription.length <=
          MAX_DESCRIPTION_LENGTH &&
        selectedLocation &&
        selectedAddress.trim() &&
        (
          timing === "asap" ||
          scheduledDate
        ),
    );

  /* ============================================================
     RECEIVE CAMERA PHOTO
  ============================================================ */

  useFocusEffect(
    useCallback(() => {
      const capturedPhoto =
        consumeCapturedPhoto();

      if (!capturedPhoto) {
        return;
      }

      setPhotos((current) => {
        if (
          current.length >=
          MAX_PHOTOS
        ) {
          return current;
        }

        if (
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
      });
    }, []),
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
          !Number.isFinite(
            latitude,
          ) ||
          !Number.isFinite(
            longitude,
          )
        ) {
          Alert.alert(
            "Invalid location",
            "Please select a valid service location.",
          );

          return;
        }

        const cleanAddress =
          address?.trim() ||
          "Selected service location";

        setSelectedLocation({
          latitude,
          longitude,
        });

        setSelectedAddress(
          cleanAddress,
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

          const limitedResults =
            results.slice(
              0,
              LOCATION_SEARCH_LIMIT,
            );

          const nextSuggestions: LocationSuggestion[] =
            [];

          for (
            let index = 0;
            index <
            limitedResults.length;
            index += 1
          ) {
            const item =
              limitedResults[index];

            if (
              !Number.isFinite(
                item.latitude,
              ) ||
              !Number.isFinite(
                item.longitude,
              )
            ) {
              continue;
            }

            let subtitle =
              "";

            try {
              const addresses =
                await Location.reverseGeocodeAsync(
                  {
                    latitude:
                      item.latitude,

                    longitude:
                      item.longitude,
                  },
                );

              const address =
                addresses[0];

              if (address) {
                subtitle =
                  [
                    address.city,
                    address.region,
                    address.country,
                  ]
                    .filter(
                      (
                        value,
                      ): value is string =>
                        Boolean(
                          value,
                        ),
                    )
                    .join(", ");
              }
            } catch (
              error
            ) {
              console.error(
                "REVERSE_GEOCODE_SUGGESTION_ERROR",
                error,
              );
            }

            if (
              requestId !==
              locationSearchRequestId.current
            ) {
              return;
            }

            nextSuggestions.push({
              id: `${item.latitude}-${item.longitude}-${index}`,

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

          console.error(
            "SEARCH_BOOKING_LOCATION_ERROR",
            error,
          );

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
     LOCATION SEARCH INPUT
  ============================================================ */

  const handleSearchLocationInput =
    useCallback(
      (text: string) => {
        const query =
          text.trim();

        if (
          locationSearchTimer.current
        ) {
          clearTimeout(
            locationSearchTimer.current,
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
          setTimeout(() => {
            void handleSearchLocation(
              query,
            );
          }, LOCATION_SEARCH_DEBOUNCE);
      },
      [handleSearchLocation],
    );

  /* ============================================================
     GALLERY
  ============================================================ */

  const handleAddPhoto =
    useCallback(async () => {
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
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            "Permission required",
            "Please allow photo access to select a photo.",
          );

          return;
        }

        const result =
          await ImagePicker.launchImageLibraryAsync(
            {
              mediaTypes: [
                "images",
              ],

              allowsEditing:
                true,

              quality: 0.8,

              selectionLimit: 1,
            },
          );

        if (
          result.canceled ||
          !result.assets?.length
        ) {
          return;
        }

        const uri =
          result.assets[0]?.uri;

        if (!uri) {
          return;
        }

        setPhotos((current) => {
          if (
            current.length >=
            MAX_PHOTOS
          ) {
            return current;
          }

          if (
            current.includes(uri)
          ) {
            return current;
          }

          return [
            ...current,
            uri,
          ];
        });
      } catch (error) {
        console.error(
          "ADD_BOOKING_PHOTO_ERROR",
          error,
        );

        Alert.alert(
          "Photo error",
          "Unable to select this photo. Please try again.",
        );
      }
    }, [photos.length]);

  /* ============================================================
     OPEN FIXXAM CAMERA
  ============================================================ */

  const handleTakePhoto =
    useCallback(() => {
      if (submitting) {
        return;
      }

      router.push(
        "/(customer)/requesting/camera",
      );
    }, [submitting]);

  /* ============================================================
     REMOVE PHOTO
  ============================================================ */

  const handleRemovePhoto =
    useCallback(
      (uri: string) => {
        setPhotos((current) =>
          current.filter(
            (photo) =>
              photo !== uri,
          ),
        );
      },
      [],
    );

  /* ============================================================
     SUBMIT BOOKING
  ============================================================ */

  const handleSubmit =
    useCallback(async () => {
      if (submitting) {
        return;
      }

      const customerId =
        auth.currentUser?.uid;

      /* ========================================================
         AUTHENTICATION
      ======================================================== */

      if (!customerId) {
        setSignInModalVisible(
          true,
        );

        return;
      }

      /* ========================================================
         SERVICE VALIDATION
      ======================================================== */

      if (!resolvedServiceId) {
        Alert.alert(
          "Service unavailable",
          "The selected service ID is missing.",
        );

        return;
      }

      if (!resolvedServiceName) {
        Alert.alert(
          "Service unavailable",
          "The selected service name is missing.",
        );

        return;
      }

      /* ========================================================
         WORKER VALIDATION
      ======================================================== */

      if (!resolvedWorkerId) {
        Alert.alert(
          "Worker unavailable",
          "Please go back and select a worker.",
        );

        return;
      }

      /* ========================================================
         DESCRIPTION VALIDATION
      ======================================================== */

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

      /* ========================================================
         LOCATION VALIDATION
      ======================================================== */

      if (!selectedLocation) {
        Alert.alert(
          "Location required",
          "Please select your service location.",
        );

        return;
      }

      if (
        !selectedAddress.trim()
      ) {
        Alert.alert(
          "Location required",
          "Please select or enter your service location.",
        );

        return;
      }

      /* ========================================================
         SCHEDULE VALIDATION
      ======================================================== */

      if (
        timing ===
          "schedule" &&
        !scheduledDate
      ) {
        Alert.alert(
          "Schedule required",
          "Please choose the date and time for your service.",
        );

        return;
      }

      if (
        timing ===
          "schedule" &&
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

      setSubmitting(true);

      try {
        /* ======================================================
           GET CUSTOMER
        ====================================================== */

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

        /* ======================================================
           UPLOAD PHOTOS
        ====================================================== */

        let uploadedPhotos: string[] =
          [];

        if (
          photos.length > 0
        ) {
          uploadedPhotos =
            await uploadBookingPhotos(
              photos,
            );
        }

        /* ======================================================
           DATE / TIME
        ====================================================== */

        const bookingDate =
          timing ===
            "schedule" &&
          scheduledDate
            ? scheduledDate.toISOString()
            : null;

        const bookingTime =
          timing ===
            "schedule" &&
          scheduledDate
            ? scheduledDate.toLocaleTimeString(
                "en-US",
                {
                  hour: "2-digit",
                  minute:
                    "2-digit",
                  hour12: true,
                },
              )
            : null;

        /* ======================================================
           CREATE BOOKING
        ====================================================== */

        const bookingId =
          await createBooking({
            customerId,

            customerName,

            customerPhotoURL,

            workerId:
              resolvedWorkerId,

            workerName:
              resolvedWorkerName,

            workerPhoto:
              resolvedWorkerPhoto ||
              null,

            serviceId:
              resolvedServiceId,

            serviceName:
              resolvedServiceName,

            /*
             * IMPORTANT:
             *
             * This is the exact MaterialCommunityIcons
             * icon from CategoryCard.
             */
            serviceIcon:
              resolvedServiceIcon,

            serviceColor:
              resolvedServiceColor,

            serviceBackgroundColor:
              resolvedServiceBackgroundColor,

            categoryId:
              getParamValue(
                categoryId,
              ) || null,

            description:
              cleanDescription,

            photos:
              uploadedPhotos,

            address:
              selectedAddress.trim(),

            latitude:
              selectedLocation
                .latitude,

            longitude:
              selectedLocation
                .longitude,

            bookingDate,

            bookingTime,

            amount: 0,

            urgent:
              timing === "asap",

            urgentFee: 0,
          });

        if (!bookingId) {
          throw new Error(
            "Booking ID was not returned.",
          );
        }

        /* ======================================================
           GO TO PENDING
        ====================================================== */

        router.replace({
          pathname:
            "/(customer)/requesting/pending",

          params: {
            bookingId,

            serviceId:
              resolvedServiceId,

            serviceName:
              resolvedServiceName,

            /*
             * Keep the icon available
             * for the pending screen too.
             */
            serviceIcon:
              resolvedServiceIcon,

            serviceColor:
              resolvedServiceColor,

            serviceBackgroundColor:
              resolvedServiceBackgroundColor,

            workerId:
              resolvedWorkerId,

            workerName:
              resolvedWorkerName,

            ...(getParamValue(
              reward,
            )
              ? {
                  reward:
                    getParamValue(
                      reward,
                    ),
                }
              : {}),
          },
        });
      } catch (error) {
        console.error(
          "CREATE_BOOKING_ERROR",
          error,
        );

        Alert.alert(
          "Request failed",
          error instanceof Error
            ? error.message
            : "We could not send your request. Please try again.",
        );
      } finally {
        setSubmitting(false);
      }
    }, [
      submitting,

      resolvedServiceId,
      resolvedServiceName,
      resolvedServiceIcon,
      resolvedServiceColor,
      resolvedServiceBackgroundColor,

      resolvedWorkerId,
      resolvedWorkerName,
      resolvedWorkerPhoto,

      categoryId,
      reward,

      cleanDescription,

      photos,

      selectedLocation,
      selectedAddress,

      timing,
      scheduledDate,
    ]);

  /* ============================================================
     UI
  ============================================================ */

  return (
    <>
      <AppScreen>
        <KeyboardAwareScrollView
          style={
            styles.screenBackground
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          bottomOffset={48}
          contentContainerStyle={
            styles.content
          }
        >
          {/* ==================================================
              HEADER
          ================================================== */}

          <View
            style={
              styles.header
            }
          >
            <Pressable
              onPress={() =>
                router.back()
              }
              disabled={
                submitting
              }
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={({
                pressed,
              }) => [
                styles.backButton,

                pressed &&
                  styles.backButtonPressed,
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={21}
                color="#0F172A"
              />
            </Pressable>

            <View
              style={
                styles.headerText
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.title
                }
              >
                Request Service
              </AppText>

              <AppText
                style={
                  styles.subtitle
                }
              >
                Review your request
                and make any changes
                before sending it.
              </AppText>
            </View>
          </View>

          {/* ==================================================
              WORKER
          ================================================== */}

          <SectionTitle
            number="1"
            title="Choose a worker"
          />

          <RequestWorkerCard
            name={
              resolvedWorkerName
            }
            photoUrl={
              resolvedWorkerPhoto
            }
            category={
              resolvedWorkerCategory
            }
            online={
              isWorkerOnline
            }
            distance={
              parsedDistance
            }
          />

          {/* ==================================================
              SERVICE
          ================================================== */}

          <View
            style={
              styles.serviceCard
            }
          >
            {/* =================================================
                EXACT CATEGORYCARD ICON
            ================================================= */}

            <View
              style={[
                styles.serviceIconBox,
                {
                  backgroundColor:
                    resolvedServiceBackgroundColor,

                  borderColor:
                    resolvedServiceBackgroundColor,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={
                  resolvedServiceIcon as React.ComponentProps<
                    typeof MaterialCommunityIcons
                  >["name"]
                }
                size={25}
                color={
                  resolvedServiceColor
                }
              />
            </View>

            <View
              style={
                styles.serviceInfo
              }
            >
              <AppText
                style={
                  styles.serviceLabel
                }
              >
                SERVICE
              </AppText>

              <AppText
                weight="bold"
                numberOfLines={1}
                style={
                  styles.serviceName
                }
              >
                {resolvedServiceName ||
                  "Selected service"}
              </AppText>
            </View>

            <View
              style={
                styles.serviceCheck
              }
            >
              <Ionicons
                name="checkmark"
                size={16}
                color="#FFFFFF"
              />
            </View>
          </View>

          {/* ==================================================
              DESCRIPTION
          ================================================== */}

          <SectionTitle
            number="2"
            title="Describe your request"
          />

          <RequestDescription
            value={
              description
            }
            onChangeText={
              setDescription
            }
            disabled={
              submitting
            }
          />

          {/* ==================================================
              PHOTOS
          ================================================== */}

          <View
            style={
              styles.photoSection
            }
          >
            <View
              style={
                styles.photoHeader
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.photoTitle
                }
              >
                Photos
              </AppText>

              <AppText
                style={
                  styles.optional
                }
              >
                Optional
              </AppText>
            </View>

            <RequestPhotos
              photos={
                photos
              }
              onAdd={
                handleAddPhoto
              }
              onTakePhoto={
                handleTakePhoto
              }
              onRemove={
                handleRemovePhoto
              }
              disabled={
                submitting
              }
            />
          </View>

          {/* ==================================================
              LOCATION
          ================================================== */}

          <SectionTitle
            number="3"
            title="Service location"
          />

          <RequestLocation
            selected={
              Boolean(
                selectedLocation,
              )
            }
            address={
              selectedAddress
            }
            onPress={() => {}}
            onLocationSelected={
              handleLocationSelected
            }
            currentLocation={
              currentCoordinates
            }
            suggestions={
              locationSuggestions
            }
            suggestionsLoading={
              locationSearchLoading
            }
            onSearchLocation={
              handleSearchLocationInput
            }
          />

          {/* ==================================================
              TIMING
          ================================================== */}

          <View
            style={
              styles.timingSection
            }
          >
            <SectionTitle
              number="4"
              title="When do you need it?"
            />

            <RequestTiming
              value={
                timing
              }
              onChange={
                handleTimingChange
              }
              disabled={
                submitting
              }
              scheduledDate={
                scheduledDate
              }
              onScheduledDateChange={
                setScheduledDate
              }
            />
          </View>

          {/* ==================================================
              SUBMIT
          ================================================== */}

          <Pressable
            onPress={
              handleSubmit
            }
            disabled={
              submitting ||
              !canSubmit
            }
            accessibilityRole="button"
            accessibilityLabel="Request service"
            accessibilityState={{
              disabled:
                submitting ||
                !canSubmit,
            }}
            style={({
              pressed,
            }) => [
              styles.submitButton,

              !canSubmit &&
                styles.submitInactive,

              submitting &&
                styles.submitDisabled,

              pressed &&
                canSubmit &&
                !submitting &&
                styles.submitPressed,
            ]}
          >
            {submitting ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <AppText
                  weight="bold"
                  style={
                    styles.submitText
                  }
                >
                  SENDING REQUEST...
                </AppText>
              </>
            ) : (
              <>
                <AppText
                  weight="bold"
                  style={
                    styles.submitText
                  }
                >
                  REQUEST SERVICE
                </AppText>

                <Ionicons
                  name="arrow-forward"
                  size={21}
                  color="#FFFFFF"
                />
              </>
            )}
          </Pressable>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <AppText
            center
            style={
              styles.footer
            }
          >
            Your request will be sent
            directly to{" "}
            {resolvedWorkerName}.
          </AppText>
        </KeyboardAwareScrollView>
      </AppScreen>

      {/* ========================================================
          SIGN-IN MODAL
      ======================================================== */}

      <Modal
        visible={
          signInModalVisible
        }
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() =>
          setSignInModalVisible(
            false,
          )
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.modalCard
            }
          >
            <View
              style={
                styles.modalIcon
              }
            >
              <Ionicons
                name="person-outline"
                size={25}
                color="#2563EB"
              />
            </View>

            <AppText
              weight="bold"
              style={
                styles.modalTitle
              }
            >
              Sign in required
            </AppText>

            <AppText
              style={
                styles.modalMessage
              }
            >
              Please sign in before
              sending your request.
            </AppText>

            <Pressable
              onPress={() =>
                setSignInModalVisible(
                  false,
                )
              }
              accessibilityRole="button"
              accessibilityLabel="Close sign in required message"
              style={({
                pressed,
              }) => [
                styles.modalButton,

                pressed &&
                  styles.modalButtonPressed,
              ]}
            >
              <AppText
                weight="bold"
                style={
                  styles.modalButtonText
                }
              >
                OK
              </AppText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ==============================================================
   SECTION TITLE
============================================================== */

function SectionTitle({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <View
      style={
        styles.sectionTitle
      }
    >
      <View
        style={
          styles.sectionNumber
        }
      >
        <AppText
          weight="bold"
          style={
            styles.sectionNumberText
          }
        >
          {number}
        </AppText>
      </View>

      <AppText
        weight="bold"
        style={
          styles.sectionText
        }
      >
        {title}
      </AppText>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ==========================================================
       SCREEN
    ========================================================== */

    screenBackground: {
      backgroundColor:
        "#F8FAFC",
    },

    content: {
      paddingHorizontal: 16,
      paddingBottom: 36,
    },

    /* ==========================================================
       HEADER
    ========================================================== */

    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 6,
      paddingBottom: 18,
    },

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 14,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      alignItems: "center",
      justifyContent:
        "center",
    },

    backButtonPressed: {
      opacity: 0.7,
      transform: [
        {
          scale: 0.96,
        },
      ],
    },

    headerText: {
      flex: 1,
      marginLeft: 11,
    },

    title: {
      fontSize: 23,
      lineHeight: 28,
      color: "#0F172A",
    },

    subtitle: {
      marginTop: 2,
      fontSize: 12,
      lineHeight: 18,
      color: "#64748B",
    },

    /* ==========================================================
       SECTION
    ========================================================== */

    sectionTitle: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 7,
      marginBottom: 9,
    },

    sectionNumber: {
      width: 27,
      height: 27,
      borderRadius: 9,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 8,
    },

    sectionNumberText: {
      fontSize: 13,
      color: "#2563EB",
    },

    sectionText: {
      flex: 1,
      fontSize: 16,
      lineHeight: 21,
      color: "#0F172A",
    },

    /* ==========================================================
       SERVICE
    ========================================================== */

    serviceCard: {
      minHeight: 78,
      marginTop: 11,
      marginBottom: 21,
      paddingHorizontal: 12,
      paddingVertical: 11,
      borderRadius: 20,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      flexDirection: "row",
      alignItems: "center",

      shadowColor:
        "#0F172A",

      shadowOpacity: 0.045,

      shadowRadius: 12,

      shadowOffset: {
        width: 0,
        height: 5,
      },

      elevation: 3,
    },

    serviceIconBox: {
      width: 52,
      height: 52,
      borderRadius: 17,
      alignItems: "center",
      justifyContent:
        "center",
      borderWidth: 1,
    },

    serviceInfo: {
      flex: 1,
      minWidth: 0,
      marginLeft: 12,
      marginRight: 10,
    },

    serviceLabel: {
      fontSize: 9.5,
      lineHeight: 13,
      letterSpacing: 1.1,
      color: "#94A3B8",
    },

    serviceName: {
      marginTop: 3,
      fontSize: 16.5,
      lineHeight: 22,
      color: "#0F172A",
    },

    serviceCheck: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor:
        "#2563EB",
      alignItems: "center",
      justifyContent:
        "center",
    },

    /* ==========================================================
       PHOTOS
    ========================================================== */

    photoSection: {
      marginTop: 20,
      marginBottom: 22,
    },

    photoHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 9,
    },

    photoTitle: {
      fontSize: 14,
      color: "#0F172A",
    },

    optional: {
      marginLeft: 7,
      fontSize: 11,
      color: "#94A3B8",
    },

    /* ==========================================================
       TIMING
    ========================================================== */

    timingSection: {
      marginTop: 22,
    },

    /* ==========================================================
       SUBMIT
    ========================================================== */

    submitButton: {
      minHeight: 56,
      marginTop: 27,
      borderRadius: 17,
      backgroundColor:
        "#2563EB",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 9,
    },

    submitInactive: {
      opacity: 0.5,
    },

    submitDisabled: {
      opacity: 0.65,
    },

    submitPressed: {
      opacity: 0.9,
      transform: [
        {
          scale: 0.985,
        },
      ],
    },

    submitText: {
      fontSize: 14,
      lineHeight: 19,
      color: "#FFFFFF",
    },

    /* ==========================================================
       FOOTER
    ========================================================== */

    footer: {
      marginTop: 10,
      paddingHorizontal: 24,
      fontSize: 10,
      lineHeight: 15,
      color: "#94A3B8",
    },

    /* ==========================================================
       MODAL
    ========================================================== */

    modalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(15, 23, 42, 0.58)",
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal: 46,
    },

    modalCard: {
      width: "100%",
      backgroundColor:
        "#FFFFFF",
      borderRadius: 18,
      paddingHorizontal: 24,
      paddingTop: 22,
      paddingBottom: 14,

      shadowColor: "#000",
      shadowOpacity: 0.18,
      shadowRadius: 24,
      shadowOffset: {
        width: 0,
        height: 10,
      },

      elevation: 10,
    },

    modalIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent:
        "center",
      marginBottom: 14,
    },

    modalTitle: {
      fontSize: 21,
      lineHeight: 27,
      color: "#0F172A",
    },

    modalMessage: {
      marginTop: 8,
      fontSize: 14,
      lineHeight: 21,
      color: "#475569",
    },

    modalButton: {
      alignSelf: "flex-end",
      minWidth: 64,
      height: 44,
      paddingHorizontal: 14,
      marginTop: 14,
      alignItems: "center",
      justifyContent:
        "center",
      borderRadius: 12,
    },

    modalButtonPressed: {
      backgroundColor:
        "#EFF6FF",
    },

    modalButtonText: {
      fontSize: 14,
      letterSpacing: 0.5,
      color: "#2563EB",
    },
  });