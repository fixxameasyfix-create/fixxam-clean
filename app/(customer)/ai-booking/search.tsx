import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import { AppScreen } from "@/components/ui";

import useCurrentLocation from "@/hooks/location/useCurrentLocation";

import { imageToBase64 } from "@/utils/aiBooking/imageToBase64";

import {
  resolveAiBookingRequest,
} from "@/firebase/queries/aiBooking/resolveAiBooking";

/* ==============================================================
   TYPES
============================================================== */

type AiResponseReason =
  | "unclear_request"
  | "unsupported_service"
  | "unclear_image"
  | "no_worker"
  | null;

type AiResponseState = {
  message: string;
  reason: AiResponseReason;
};

type SearchParams = {
  description?: string | string[];
  imageUri?: string | string[];
};

/* ==============================================================
   HELPERS
============================================================== */

function getParamValue(
  value:
    | string
    | string[]
    | undefined,
): string {
  if (Array.isArray(value)) {
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
   SCREEN
============================================================== */

export default function AiBookingSearchScreen() {
  const {
    description,
    imageUri,
  } =
    useLocalSearchParams<SearchParams>();

  const {
    location,
    loading:
      locationLoading,
  } = useCurrentLocation();

  /* ============================================================
     STATE
  ============================================================ */

  const [
    status,
    setStatus,
  ] = useState(
    "Preparing your request...",
  );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    aiResponse,
    setAiResponse,
  ] =
    useState<AiResponseState | null>(
      null,
    );

  const [
    started,
    setStarted,
  ] = useState(false);

  /* ============================================================
     MOUNT STATE
  ============================================================ */

  const mountedRef =
    useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current =
        false;
    };
  }, []);

  /* ============================================================
     RUN SEARCH
  ============================================================ */

  const runSearch =
    useCallback(async () => {
      if (
        started ||
        locationLoading
      ) {
        return;
      }

      setStarted(true);
      setError(null);
      setAiResponse(null);

      try {
        /* ======================================================
           INPUT
        ====================================================== */

        const text =
          getParamValue(
            description,
          );

        const photoUri =
          getParamValue(
            imageUri,
          );

        if (
          !text &&
          !photoUri
        ) {
          if (
            !mountedRef.current
          ) {
            return;
          }

          setAiResponse({
            message:
              "Please describe the problem or provide a photo so Fixxam can understand what you need.",

            reason:
              "unclear_request",
          });

          return;
        }

        /* ======================================================
           PHOTO
        ====================================================== */

        let imageBase64 =
          "";

        let mimeType =
          "";

        if (photoUri) {
          if (
            mountedRef.current
          ) {
            setStatus(
              "Preparing your photo...",
            );
          }

          const image =
            await imageToBase64(
              photoUri,
            );

          imageBase64 =
            image.base64;

          mimeType =
            image.mimeType;
        }

        /* ======================================================
           AI STATUS
        ====================================================== */

        if (
          mountedRef.current
        ) {
          setStatus(
            "Understanding your request...",
          );
        }

        await new Promise<void>(
          (resolve) => {
            setTimeout(
              resolve,
              250,
            );
          },
        );

        if (
          !mountedRef.current
        ) {
          return;
        }

        setStatus(
          "Finding the right service...",
        );

        /* ======================================================
           CALL AI
        ====================================================== */

        const result =
          await resolveAiBookingRequest({
            description:
              text ||
              undefined,

            imageBase64:
              imageBase64 ||
              undefined,

            mimeType:
              mimeType ||
              undefined,

            latitude:
              location?.latitude,

            longitude:
              location?.longitude,

            address:
              location?.address,
          });

        /* ======================================================
           SCREEN SAFETY
        ====================================================== */

        if (
          !mountedRef.current
        ) {
          return;
        }

        /* ======================================================
           AI REJECTED
        ====================================================== */

        if (
          result.rejected ||
          !result.completed
        ) {
          setAiResponse({
            message:
              result.message ||
              "We couldn't understand your request. Please try again with a little more detail.",

            reason:
              result.reason ??
              null,
          });

          return;
        }

        /* ======================================================
           SERVICE
        ====================================================== */

        if (
          !result.service
        ) {
          setAiResponse({
            message:
              "We couldn't identify the service you need. Please describe the problem in a little more detail or choose a service manually.",

            reason:
              "unclear_request",
          });

          return;
        }

        /* ======================================================
           WORKER
        ====================================================== */

        if (
          !result.worker
        ) {
          setAiResponse({
            message:
              `We found the ${result.service.name} service, but no professional is available right now. Please try again later or choose another service manually.`,

            reason:
              "no_worker",
          });

          return;
        }

        /* ======================================================
           BOOKING
        ====================================================== */

        if (
          !result.booking
        ) {
          setAiResponse({
            message:
              "We understood your request, but we couldn't prepare the booking preview. Please try again.",

            reason:
              null,
          });

          return;
        }

        /* ======================================================
           DESCRIPTION
        ====================================================== */

        const customerDescription =
          String(
            result.customerDescription ??
              result.booking.description ??
              text ??
              "",
          ).trim();

        /* ======================================================
           LOCATION
        ====================================================== */

        const bookingLatitude =
          typeof location?.latitude ===
            "number" &&
          Number.isFinite(
            location.latitude,
          )
            ? location.latitude
            : result.booking
                .latitude ??
              null;

        const bookingLongitude =
          typeof location?.longitude ===
            "number" &&
          Number.isFinite(
            location.longitude,
          )
            ? location.longitude
            : result.booking
                .longitude ??
              null;

        const bookingAddress =
          location?.address?.trim() ||
          result.booking.address?.trim() ||
          "";

        /* ======================================================
           PHOTOS
        ====================================================== */

        const bookingPhotos =
          photoUri
            ? [photoUri]
            : Array.isArray(
                result.booking.photos,
              )
            ? result.booking.photos.filter(
                (
                  photo,
                ): photo is string =>
                  typeof photo ===
                    "string" &&
                  photo.trim()
                    .length > 0,
              )
            : [];

        /* ======================================================
           BOOKING PREVIEW
        ====================================================== */

        const bookingPreview = {
          ...result.booking,

          description:
            customerDescription,

          photos:
            bookingPhotos,

          latitude:
            bookingLatitude,

          longitude:
            bookingLongitude,

          address:
            bookingAddress,
        };

        /* ======================================================
           PREPARE NAVIGATION
        ====================================================== */

        if (
          mountedRef.current
        ) {
          setStatus(
            `We found ${result.worker.name}. Preparing your booking...`,
          );
        }

        await new Promise<void>(
          (resolve) => {
            setTimeout(
              resolve,
              300,
            );
          },
        );

        if (
          !mountedRef.current
        ) {
          return;
        }

        /* ======================================================
           GO TO BOOKING
        ====================================================== */

        router.replace({
          pathname:
            "/(customer)/booking",

          params: {
            /* ==================================================
               WORKER
            ================================================== */

            workerId:
              result.worker.id,

            workerName:
              result.worker.name,

            workerPhoto:
              result.worker.photoUrl ||
              "",

            workerRating:
              String(
                result.worker.rating ??
                  0,
              ),

            workerCompletedJobs:
              String(
                result.worker
                  .completedJobs ??
                  0,
              ),

            workerVerified:
              String(
                result.worker.verified ??
                  false,
              ),

            workerDistance:
              Number.isFinite(
                result.worker
                  .distanceKm,
              )
                ? String(
                    result.worker
                      .distanceKm,
                  )
                : "",

            /* ==================================================
               SERVICE
            ================================================== */

            serviceId:
              result.service.id,

            serviceName:
              result.service.name,

            /* ==================================================
               CUSTOMER DESCRIPTION
            ================================================== */

            customerDescription:
              customerDescription,

            /* ==================================================
               AI BOOKING
            ================================================== */

            booking:
              JSON.stringify(
                bookingPreview,
              ),
          },
        });
      } catch (err: unknown) {
        console.error(
          "AI BOOKING SEARCH ERROR",
          err,
        );

        if (
          !mountedRef.current
        ) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to complete automatic booking.",
        );
      }
    }, [
      description,
      imageUri,
      location,
      locationLoading,
      started,
    ]);

  /* ============================================================
     START
  ============================================================ */

  useEffect(() => {
    if (
      locationLoading
    ) {
      return;
    }

    void runSearch();
  }, [
    locationLoading,
    runSearch,
  ]);

  /* ============================================================
     ERROR SCREEN
  ============================================================ */

  if (error) {
    return (
      <AppScreen>
        <View
          style={
            styles.errorContainer
          }
        >
          <View
            style={
              styles.errorIcon
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={38}
              color="#DC2626"
            />
          </View>

          <Text
            style={
              styles.errorTitle
            }
          >
            Something went wrong
          </Text>

          <Text
            style={
              styles.errorMessage
            }
          >
            {error}
          </Text>

          <TouchableOpacity
            style={
              styles.retryButton
            }
            onPress={() =>
              router.back()
            }
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Try again"
          >
            <Text
              style={
                styles.retryText
              }
            >
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     AI RESPONSE
  ============================================================ */

  if (aiResponse) {
    const isUnsupportedService =
      aiResponse.reason ===
      "unsupported_service";

    const isNoWorker =
      aiResponse.reason ===
      "no_worker";

    const isUnclearImage =
      aiResponse.reason ===
      "unclear_image";

    return (
      <AppScreen>
        <View
          style={
            styles.responseContainer
          }
        >
          <View
            style={[
              styles.responseIcon,

              isUnsupportedService &&
                styles.responseIconBlue,

              isNoWorker &&
                styles.responseIconOrange,

              isUnclearImage &&
                styles.responseIconPurple,
            ]}
          >
            <Ionicons
              name={
                isUnsupportedService
                  ? "construct-outline"
                  : isNoWorker
                  ? "people-outline"
                  : isUnclearImage
                  ? "image-outline"
                  : "sparkles-outline"
              }
              size={40}
              color={
                isUnsupportedService
                  ? "#2563EB"
                  : isNoWorker
                  ? "#F97316"
                  : isUnclearImage
                  ? "#7C3AED"
                  : "#F97316"
              }
            />
          </View>

          <Text
            style={
              styles.responseTitle
            }
          >
            {isUnsupportedService
              ? "Service Not Available"
              : isNoWorker
              ? "No Worker Available"
              : isUnclearImage
              ? "We Need a Clearer Photo"
              : "Fixxam Needs More Details"}
          </Text>

          <Text
            style={
              styles.responseMessage
            }
          >
            {aiResponse.message}
          </Text>

          <View
            style={
              styles.responseInfoCard
            }
          >
            <Ionicons
              name="sparkles"
              size={20}
              color="#F97316"
            />

            <Text
              style={
                styles.responseInfoText
              }
            >
              You can try again with
              more details, or continue
              manually and choose the
              service yourself.
            </Text>
          </View>

          <TouchableOpacity
            style={
              styles.primaryResponseButton
            }
            onPress={() =>
              router.back()
            }
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Try again"
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.primaryResponseText
              }
            >
              Try Again
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              styles.secondaryResponseButton
            }
            onPress={() =>
              router.replace(
                "/(customer)/search",
              )
            }
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Book manually"
          >
            <Ionicons
              name="list-outline"
              size={20}
              color="#F97316"
            />

            <Text
              style={
                styles.secondaryResponseText
              }
            >
              Book Manually
            </Text>
          </TouchableOpacity>
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     LOADING
  ============================================================ */

  return (
    <AppScreen>
      <View
        style={
          styles.container
        }
      >
        <View
          style={styles.center}
        >
          <View
            style={
              styles.searchCircle
            }
          >
            <Ionicons
              name="search"
              size={42}
              color="#2563EB"
            />
          </View>

          <Text
            style={styles.title}
          >
            Fixxam is finding
            {"\n"}
            your worker
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            {locationLoading
              ? "Getting your location..."
              : status}
          </Text>

          <View
            style={styles.loader}
          >
            <ActivityIndicator
              size="small"
              color="#F97316"
            />
          </View>

          <View
            style={
              styles.infoCard
            }
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color="#16A34A"
            />

            <Text
              style={styles.infoText}
            >
              Fixxam will prepare a
              booking preview for you.
              Nothing will be booked
              until you confirm.
            </Text>
          </View>
        </View>
      </View>
    </AppScreen>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ==========================================================
       SEARCH
    ========================================================== */

    container: {
      flex: 1,
      backgroundColor:
        "#FFFFFF",
    },

    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 28,
      paddingBottom: 70,
    },

    searchCircle: {
      width: 92,
      height: 92,
      borderRadius: 46,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E8EEF7",
      alignItems: "center",
      justifyContent:
        "center",
      shadowColor:
        "#2563EB",
      shadowOpacity: 0.08,
      shadowRadius: 14,
      shadowOffset: {
        width: 0,
        height: 5,
      },
      elevation: 3,
    },

    title: {
      marginTop: 28,
      color: "#0F172A",
      fontSize: 25,
      lineHeight: 32,
      fontWeight: "800",
      textAlign: "center",
      letterSpacing: -0.3,
    },

    subtitle: {
      marginTop: 10,
      maxWidth: 310,
      color: "#94A3B8",
      fontSize: 14.5,
      lineHeight: 21,
      fontWeight: "500",
      textAlign: "center",
    },

    loader: {
      marginTop: 24,
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent:
        "center",
    },

    infoCard: {
      marginTop: 34,
      width: "100%",
      paddingHorizontal: 16,
      paddingVertical: 15,
      borderRadius: 17,
      backgroundColor:
        "#F0FDF4",
      borderWidth: 1,
      borderColor:
        "#DCFCE7",
      flexDirection: "row",
      alignItems: "center",
    },

    infoText: {
      flex: 1,
      marginLeft: 10,
      color: "#166534",
      fontSize: 12.5,
      lineHeight: 19,
      fontWeight: "600",
    },

    /* ==========================================================
       ERROR
    ========================================================== */

    errorContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 28,
    },

    errorIcon: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor:
        "#FEF2F2",
      alignItems: "center",
      justifyContent:
        "center",
    },

    errorTitle: {
      marginTop: 20,
      color: "#0F172A",
      fontSize: 22,
      fontWeight: "800",
      textAlign: "center",
    },

    errorMessage: {
      marginTop: 8,
      color: "#64748B",
      fontSize: 14,
      lineHeight: 21,
      textAlign: "center",
    },

    retryButton: {
      marginTop: 24,
      minWidth: 150,
      height: 48,
      borderRadius: 15,
      backgroundColor:
        "#2563EB",
      alignItems: "center",
      justifyContent:
        "center",
    },

    retryText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "800",
    },

    /* ==========================================================
       AI RESPONSE
    ========================================================== */

    responseContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 26,
    },

    responseIcon: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor:
        "#FFF7ED",
      borderWidth: 1,
      borderColor:
        "#FED7AA",
      alignItems: "center",
      justifyContent:
        "center",
    },

    responseIconBlue: {
      backgroundColor:
        "#EFF6FF",
      borderColor:
        "#BFDBFE",
    },

    responseIconOrange: {
      backgroundColor:
        "#FFF7ED",
      borderColor:
        "#FED7AA",
    },

    responseIconPurple: {
      backgroundColor:
        "#F5F3FF",
      borderColor:
        "#DDD6FE",
    },

    responseTitle: {
      marginTop: 22,
      color: "#0F172A",
      fontSize: 23,
      lineHeight: 30,
      fontWeight: "800",
      textAlign: "center",
    },

    responseMessage: {
      marginTop: 10,
      color: "#64748B",
      fontSize: 14,
      lineHeight: 22,
      fontWeight: "500",
      textAlign: "center",
    },

    responseInfoCard: {
      marginTop: 24,
      width: "100%",
      padding: 15,
      borderRadius: 17,
      backgroundColor:
        "#FFF7ED",
      borderWidth: 1,
      borderColor:
        "#FFEDD5",
      flexDirection: "row",
      alignItems:
        "flex-start",
    },

    responseInfoText: {
      flex: 1,
      marginLeft: 9,
      color: "#9A3412",
      fontSize: 12.5,
      lineHeight: 19,
      fontWeight: "600",
    },

    primaryResponseButton: {
      marginTop: 24,
      width: "100%",
      height: 52,
      borderRadius: 16,
      backgroundColor:
        "#2563EB",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 9,
    },

    primaryResponseText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "800",
    },

    secondaryResponseButton: {
      marginTop: 12,
      width: "100%",
      height: 52,
      borderRadius: 16,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 9,
    },

    secondaryResponseText: {
      color: "#0F172A",
      fontSize: 15,
      fontWeight: "800",
    },
  });