import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
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

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

import {
  KeyboardAwareScrollView,
} from "react-native-keyboard-controller";

import {
  AppButton,
  AppCard,
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import RequestWorkerCard from "@/components/customer/request-service/RequestWorkerCard";
import RequestDescription from "@/components/customer/request-service/RequestDescription";
import RequestPhotos from "@/components/customer/request-service/RequestPhotos";
import RequestLocation from "@/components/customer/request-service/RequestLocation";

import RequestTiming, {
  type RequestTimingValue,
} from "@/components/customer/request-service/RequestTiming";

import {
  auth,
} from "@/firebase/config";

import {
  getUser,
} from "@/firebase/queries/users";

import {
  getFreshWorkerProfilePhotoUrl,
} from "@/firebase/queries/workerPublicProfiles";

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

type AiPrefilledBooking = {
  description?: string;

  photos?: string[];

  address?: string;

  latitude?:
    | number
    | null;

  longitude?:
    | number
    | null;

  bookingDate?:
    | string
    | null;

  bookingTime?:
    | string
    | null;
};

type BookingParams = {
  serviceId?:
    | string
    | string[];

  serviceName?:
    | string
    | string[];

  serviceIcon?:
    | string
    | string[];

  serviceColor?:
    | string
    | string[];

  serviceBackgroundColor?:
    | string
    | string[];

  categoryId?:
    | string
    | string[];

  workerId?:
    | string
    | string[];

  workerName?:
    | string
    | string[];

  workerPhoto?:
    | string
    | string[];

  workerCategory?:
    | string
    | string[];

  workerOnline?:
    | string
    | string[];

  workerDistance?:
    | string
    | string[];

  reward?:
    | string
    | string[];

  customerDescription?:
    | string
    | string[];

  booking?:
    | string
    | string[];
};

type MaterialIconName =
  React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];

/* ==============================================================
   CONSTANTS
============================================================== */

const MAX_PHOTOS = 3;

const MIN_DESCRIPTION_LENGTH =
  3;

const MAX_DESCRIPTION_LENGTH =
  300;

const LOCATION_SEARCH_LIMIT =
  5;

const LOCATION_SEARCH_DEBOUNCE =
  450;

/* ==============================================================
   PARAM HELPER
============================================================== */

function getParamValue(
  value:
    | string
    | string[]
    | undefined,
): string {
  if (
    Array.isArray(value)
  ) {
    return (
      value[0]?.trim() ??
      ""
    );
  }

  return (
    value?.trim() ??
    ""
  );
}

/* ==============================================================
   WORKER PHOTO
============================================================== */

function normalizeWorkerPhotoUrl(
  value: string,
): string {
  const url =
    value.trim();

  if (!url) {
    return "";
  }

  /*
   * Production worker profile
   * images must use HTTPS.
   */
  if (
    !url.startsWith(
      "https://",
    )
  ) {
    return "";
  }

  return url;
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

  const {
    location,
  } =
    useCurrentLocation();

  /* ============================================================
     AI PREFILLED BOOKING
  ============================================================ */

  const aiPrefilledBooking =
    useMemo<AiPrefilledBooking | null>(
      () => {
        const rawBooking =
          getParamValue(
            booking,
          );

        if (
          !rawBooking
        ) {
          return null;
        }

        try {
          const parsed: unknown =
            JSON.parse(
              rawBooking,
            );

          if (
            !parsed ||
            typeof parsed !==
              "object" ||
            Array.isArray(
              parsed,
            )
          ) {
            return null;
          }

          return parsed as
            AiPrefilledBooking;
        } catch (error) {
          console.error(
            "INVALID_AI_BOOKING_JSON:",
            error,
          );

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
    useMemo(() => {
      const value =
        aiPrefilledBooking
          ?.bookingDate;

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
    }, [
      aiPrefilledBooking,
    ]);

  /* ============================================================
     SERVICE
  ============================================================ */

  const resolvedServiceId =
    useMemo(
      () =>
        getParamValue(
          serviceId,
        ),
      [
        serviceId,
      ],
    );

  const resolvedServiceName =
    useMemo(
      () =>
        getParamValue(
          serviceName,
        ),
      [
        serviceName,
      ],
    );

  const resolvedServiceIcon =
    useMemo(
      () =>
        getParamValue(
          serviceIcon,
        ) ||
        "tools",
      [
        serviceIcon,
      ],
    );

  const resolvedServiceColor =
    useMemo(
      () =>
        getParamValue(
          serviceColor,
        ) ||
        CustomerColors.primary,
      [
        serviceColor,
      ],
    );

  const resolvedServiceBackgroundColor =
    useMemo(
      () =>
        getParamValue(
          serviceBackgroundColor,
        ) ||
        CustomerColors.primarySoft,
      [
        serviceBackgroundColor,
      ],
    );

  /* ============================================================
     WORKER
  ============================================================ */

  const resolvedWorkerId =
    useMemo(
      () =>
        getParamValue(
          workerId,
        ),
      [
        workerId,
      ],
    );

  const resolvedWorkerName =
    useMemo(
      () =>
        getParamValue(
          workerName,
        ) ||
        "Selected Worker",
      [
        workerName,
      ],
    );

  const resolvedWorkerPhoto =
    useMemo(
      () =>
        normalizeWorkerPhotoUrl(
          getParamValue(
            workerPhoto,
          ),
        ),
      [
        workerPhoto,
      ],
    );

  const resolvedWorkerCategory =
    useMemo(
      () =>
        getParamValue(
          workerCategory,
        ) ||
        "Service Provider",
      [
        workerCategory,
      ],
    );

  /* ============================================================
     FRESH WORKER PHOTO
  ============================================================ */

  const [
    freshWorkerPhoto,
    setFreshWorkerPhoto,
  ] =
    useState("");

  const [
    workerPhotoLoading,
    setWorkerPhotoLoading,
  ] =
    useState(false);

  useEffect(() => {
    let cancelled =
      false;

    const loadFreshWorkerPhoto =
      async () => {
        if (
          !resolvedWorkerId
        ) {
          if (
            !cancelled
          ) {
            setFreshWorkerPhoto(
              "",
            );

            setWorkerPhotoLoading(
              false,
            );
          }

          return;
        }

        setWorkerPhotoLoading(
          true,
        );

        try {
          const freshUrl =
            await getFreshWorkerProfilePhotoUrl(
              resolvedWorkerId,
            );

          if (
            cancelled
          ) {
            return;
          }

          const normalizedFreshUrl =
            normalizeWorkerPhotoUrl(
              freshUrl,
            );

          setFreshWorkerPhoto(
            normalizedFreshUrl,
          );

          if (__DEV__) {
            console.log(
              "BOOKING_FRESH_WORKER_PHOTO",
              {
                workerId:
                  resolvedWorkerId,

                hasFreshPhoto:
                  Boolean(
                    normalizedFreshUrl,
                  ),
              },
            );
          }
        } catch (error) {
          if (
            cancelled
          ) {
            return;
          }

          console.warn(
            "BOOKING_FRESH_WORKER_PHOTO_ERROR",
            {
              workerId:
                resolvedWorkerId,

              error,
            },
          );

          setFreshWorkerPhoto(
            "",
          );
        } finally {
          if (
            !cancelled
          ) {
            setWorkerPhotoLoading(
              false,
            );
          }
        }
      };

    void loadFreshWorkerPhoto();

    return () => {
      cancelled =
        true;
    };
  }, [
    resolvedWorkerId,
  ]);

  const finalWorkerPhoto =
    useMemo(
      () =>
        freshWorkerPhoto ||
        resolvedWorkerPhoto,
      [
        freshWorkerPhoto,
        resolvedWorkerPhoto,
      ],
    );

  /* ============================================================
     DEBUG WORKER PHOTO
  ============================================================ */

  useEffect(() => {
    if (
      !__DEV__
    ) {
      return;
    }

    console.log(
      "BOOKING_WORKER_IMAGE",
      {
        workerId:
          resolvedWorkerId,

        workerName:
          resolvedWorkerName,

        hasPhoto:
          Boolean(
            finalWorkerPhoto,
          ),

        loading:
          workerPhotoLoading,
      },
    );
  }, [
    finalWorkerPhoto,
    resolvedWorkerId,
    resolvedWorkerName,
    workerPhotoLoading,
  ]);

  /* ============================================================
     STATUS
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
        !Number.isFinite(
          value,
        )
      ) {
        return undefined;
      }

      return Math.max(
        0,
        value,
      );
    }, [
      workerDistance,
    ]);

  /* ============================================================
     DESCRIPTION
  ============================================================ */

  const [
    description,
    setDescription,
  ] =
    useState(() => {
      const aiDescription =
        aiPrefilledBooking
          ?.description
          ?.trim();

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

        return aiPrefilledBooking.photos
          .filter(
            (
              photo,
            ): photo is string =>
              typeof photo ===
                "string" &&
              photo.trim()
                .length > 0,
          )
          .slice(
            0,
            MAX_PHOTOS,
          );
      },
    );

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
          aiPrefilledBooking
            ?.latitude;

        const longitude =
          aiPrefilledBooking
            ?.longitude;

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
     SUBMIT
  ============================================================ */

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

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
     DERIVED STATE
  ============================================================ */

  const cleanDescription =
    description.trim();

  const currentCoordinates =
    useMemo(() => {
      if (
        !location
      ) {
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
    }, [
      location,
    ]);

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
          timing ===
            "asap" ||
          scheduledDate
        ),
    );

  /* ============================================================
     BACK
  ============================================================ */

  const handleBack =
    useCallback(() => {
      if (
        submitting
      ) {
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
    }, [
      submitting,
    ]);

  /* ============================================================
     TIMING
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
          value ===
          "asap"
        ) {
          setScheduledDate(
            null,
          );
        }
      },
      [],
    );

  /* ============================================================
     RECEIVE CAMERA PHOTO
  ============================================================ */

  useFocusEffect(
    useCallback(() => {
      const capturedPhoto =
        consumeCapturedPhoto();

      if (
        !capturedPhoto
      ) {
        return;
      }

      setPhotos(
        (current) => {
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
            let index =
              0;
            index <
            limitedResults.length;
            index += 1
          ) {
            const item =
              limitedResults[
                index
              ];

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

              if (
                address
              ) {
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
                    .join(
                      ", ",
                    );
              }
            } catch (error) {
              console.error(
                "REVERSE_GEOCODE_SUGGESTION_ERROR:",
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

          console.error(
            "SEARCH_BOOKING_LOCATION_ERROR:",
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

        if (
          !query
        ) {
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
          !result.assets
            ?.length
        ) {
          return;
        }

        const uri =
          result.assets[0]
            ?.uri;

        if (!uri) {
          return;
        }

        setPhotos(
          (current) => {
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
        console.error(
          "ADD_BOOKING_PHOTO_ERROR:",
          error,
        );

        Alert.alert(
          "Photo error",
          "Unable to select this photo. Please try again.",
        );
      }
    }, [
      photos.length,
    ]);

  /* ============================================================
     CAMERA
  ============================================================ */

  const handleTakePhoto =
    useCallback(() => {
      if (
        submitting
      ) {
        return;
      }

      router.push(
        "/(customer)/requesting/camera",
      );
    }, [
      submitting,
    ]);

  /* ============================================================
     REMOVE PHOTO
  ============================================================ */

  const handleRemovePhoto =
    useCallback(
      (
        uri: string,
      ) => {
        setPhotos(
          (current) =>
            current.filter(
              (
                photo,
              ) =>
                photo !==
                uri,
            ),
        );
      },
      [],
    );

  /* ============================================================
     SIGN IN
  ============================================================ */

  const handleCloseSignIn =
    useCallback(() => {
      setSignInModalVisible(
        false,
      );
    }, []);

  const handleSignIn =
    useCallback(() => {
      setSignInModalVisible(
        false,
      );

      router.push(
        "/(auth)/login",
      );
    }, []);

  /* ============================================================
     SUBMIT
  ============================================================ */

  const handleSubmit =
    useCallback(async () => {
      if (
        submitting
      ) {
        return;
      }

      const customerId =
        auth.currentUser
          ?.uid;

      /* ========================================================
         AUTH
      ======================================================== */

      if (
        !customerId
      ) {
        setSignInModalVisible(
          true,
        );

        return;
      }

      /* ========================================================
         SERVICE
      ======================================================== */

      if (
        !resolvedServiceId ||
        !resolvedServiceName
      ) {
        Alert.alert(
          "Service unavailable",
          "The selected service is no longer available. Please choose the service again.",
        );

        return;
      }

      /* ========================================================
         WORKER
      ======================================================== */

      if (
        !resolvedWorkerId
      ) {
        Alert.alert(
          "Worker unavailable",
          "Please go back and select a worker.",
        );

        return;
      }

      /* ========================================================
         DESCRIPTION
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
         LOCATION
      ======================================================== */

      if (
        !selectedLocation ||
        !selectedAddress.trim()
      ) {
        Alert.alert(
          "Location required",
          "Please select your service location.",
        );

        return;
      }

      /* ========================================================
         SCHEDULE
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

      setSubmitting(
        true,
      );

      try {
        /* ======================================================
           CUSTOMER
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
           PHOTOS
        ====================================================== */

        let uploadedPhotos: string[] =
          [];

        if (
          photos.length >
          0
        ) {
          uploadedPhotos =
            await uploadBookingPhotos(
              photos,
              customerId,
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
                  hour:
                    "2-digit",

                  minute:
                    "2-digit",

                  hour12:
                    true,
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
              finalWorkerPhoto ||
              null,

            serviceId:
              resolvedServiceId,

            serviceName:
              resolvedServiceName,

            serviceIcon:
              resolvedServiceIcon,

            serviceColor:
              resolvedServiceColor,

            serviceBackgroundColor:
              resolvedServiceBackgroundColor,

            categoryId:
              getParamValue(
                categoryId,
              ) ||
              null,

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
              timing ===
              "asap",

            urgentFee:
              0,
          });

        if (
          !bookingId
        ) {
          throw new Error(
            "Booking ID was not returned.",
          );
        }

        /* ======================================================
           PENDING
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

            workerPhoto:
              finalWorkerPhoto,

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
          "CREATE_BOOKING_ERROR:",
          error,
        );

        Alert.alert(
          "Request failed",
          "We could not send your request. Please try again.",
        );
      } finally {
        setSubmitting(
          false,
        );
      }
    }, [
      categoryId,
      cleanDescription,
      finalWorkerPhoto,
      photos,
      resolvedServiceBackgroundColor,
      resolvedServiceColor,
      resolvedServiceIcon,
      resolvedServiceId,
      resolvedServiceName,
      resolvedWorkerId,
      resolvedWorkerName,
      reward,
      scheduledDate,
      selectedAddress,
      selectedLocation,
      submitting,
      timing,
    ]);

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
            FixxamTokens.size
              .buttonHeight
          }
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
              accessibilityRole="button"
              accessibilityLabel="Go back"
              accessibilityState={{
                disabled:
                  submitting,
              }}
              disabled={
                submitting
              }
              hitSlop={8}
              onPress={
                handleBack
              }
              style={({
                pressed,
              }) => [
                styles.backButton,

                pressed &&
                !submitting
                  ? styles.backButtonPressed
                  : null,

                submitting
                  ? styles.controlDisabled
                  : null,
              ]}
            >
              <AppIcon
                name="back"
                role="customer"
                size="sm"
                state="default"
              />
            </Pressable>

            <View
              style={
                styles.headerText
              }
            >
              <AppText
                variant="heading1"
                weight="bold"
              >
                Request Service
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
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
              finalWorkerPhoto
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

          <AppCard
            role="customer"
            variant="outlined"
            style={
              styles.serviceCard
            }
          >
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
                  resolvedServiceIcon as
                    MaterialIconName
                }
                size={
                  FixxamTokens.size
                    .iconMd
                }
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
                variant="caption"
                tone="muted"
                weight="semibold"
                style={
                  styles.serviceLabel
                }
              >
                SERVICE
              </AppText>

              <AppText
                variant="bodyLarge"
                weight="bold"
                numberOfLines={1}
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
              <AppIcon
                name="check"
                role="customer"
                size="xs"
                state="inverse"
                strokeWidth="strong"
              />
            </View>
          </AppCard>

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
                variant="bodyMedium"
                weight="bold"
              >
                Photos
              </AppText>

              <AppText
                variant="caption"
                tone="muted"
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

          <AppButton
            title={
              submitting
                ? "Sending Request..."
                : "Request Service"
            }
            role="customer"
            loading={
              submitting
            }
            disabled={
              submitting ||
              !canSubmit
            }
            rightIconName={
              submitting
                ? undefined
                : "next"
            }
            onPress={
              handleSubmit
            }
            style={
              styles.submitButton
            }
          />

          {/* ==================================================
              FOOTER
          ================================================== */}

          <AppText
            variant="caption"
            tone="muted"
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
        onRequestClose={
          handleCloseSignIn
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <AppCard
            role="customer"
            variant="elevated"
            style={
              styles.modalCard
            }
          >
            <View
              style={
                styles.modalIcon
              }
            >
              <AppIcon
                name="profile"
                role="customer"
                size="lg"
                state="active"
              />
            </View>

            <AppText
              variant="heading2"
              weight="bold"
            >
              Sign in required
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.modalMessage
              }
            >
              Please sign in before
              sending your service
              request.
            </AppText>

            <View
              style={
                styles.modalActions
              }
            >
              <AppButton
                title="Cancel"
                role="customer"
                variant="ghost"
                onPress={
                  handleCloseSignIn
                }
                style={
                  styles.modalAction
                }
              />

              <AppButton
                title="Sign In"
                role="customer"
                onPress={
                  handleSignIn
                }
                style={
                  styles.modalAction
                }
              />
            </View>
          </AppCard>
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
          variant="caption"
          weight="bold"
          style={
            styles.sectionNumberText
          }
        >
          {number}
        </AppText>
      </View>

      <AppText
        variant="bodyMedium"
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
    screen: {
      flex: 1,

      backgroundColor:
        Colors.background,
    },

    content: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      paddingBottom:
        FixxamTokens.spacing.xl,
    },

    backButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius
          .iconButton,

      backgroundColor:
        Colors.surface,
    },

    backButtonPressed: {
      borderColor:
        CustomerColors.primaryLight,

      backgroundColor:
        CustomerColors.primarySoft,

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

    controlDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    headerText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       SECTION
    ======================================================== */

    sectionTitle: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.sm,
    },

    sectionNumber: {
      width: 28,

      height: 28,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    sectionNumberText: {
      color:
        CustomerColors.primary,
    },

    sectionText: {
      flex: 1,

      minWidth: 0,
    },

    /* ========================================================
       SERVICE
    ======================================================== */

    serviceCard: {
      minHeight:
        FixxamTokens.size
          .roleCardHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.xl,

      padding:
        FixxamTokens.spacing.md,
    },

    serviceIconBox: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderRadius:
        FixxamTokens.radius.lg,
    },

    serviceInfo: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.md,
    },

    serviceLabel: {
      marginBottom:
        FixxamTokens.spacing.xxs,

      letterSpacing: 1,
    },

    serviceCheck: {
      width: 30,

      height: 30,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primary,
    },

    /* ========================================================
       PHOTOS
    ======================================================== */

    photoSection: {
      marginTop:
        FixxamTokens.spacing.xl,

      marginBottom:
        FixxamTokens.spacing.xl,
    },

    photoHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        FixxamTokens.spacing.sm,
    },

    optional: {
      marginLeft:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       TIMING
    ======================================================== */

    timingSection: {
      marginTop:
        FixxamTokens.spacing.xl,
    },

    /* ========================================================
       SUBMIT
    ======================================================== */

    submitButton: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xxl,
    },

    footer: {
      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.xxl,
    },

    /* ========================================================
       SIGN-IN MODAL
    ======================================================== */

    modalOverlay: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xxl,

      backgroundColor:
        Colors.overlayStrong,
    },

    modalCard: {
      width: "100%",

      maxWidth: 390,

      padding:
        FixxamTokens.spacing.xxl,
    },

    modalIcon: {
      width:
        FixxamTokens.size.fabLarge,

      height:
        FixxamTokens.size.fabLarge,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginBottom:
        FixxamTokens.spacing.lg,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    modalMessage: {
      marginTop:
        FixxamTokens.spacing.sm,
    },

    modalActions: {
      flexDirection:
        "row",

      gap:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.xl,
    },

    modalAction: {
      flex: 1,
    },
  });