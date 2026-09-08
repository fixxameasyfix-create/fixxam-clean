import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

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

import useCurrentLocation from "@/hooks/location/useCurrentLocation";

import {
  imageToBase64,
} from "@/utils/aiBooking/imageToBase64";

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
  description?:
    | string
    | string[];

  imageUri?:
    | string
    | string[];
};

/* ==============================================================
   PARAM
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
   RESPONSE REASON
============================================================== */

function normalizeReason(
  value: unknown,
): AiResponseReason {
  switch (value) {
    case "unclear_request":
    case "unsupported_service":
    case "unclear_image":
    case "no_worker":
      return value;

    default:
      return null;
  }
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
  } =
    useCurrentLocation();

  /* ============================================================
     STATE
  ============================================================ */

  const [
    status,
    setStatus,
  ] =
    useState(
      "Preparing your request...",
    );

  const [
    error,
    setError,
  ] =
    useState(false);

  const [
    aiResponse,
    setAiResponse,
  ] =
    useState<AiResponseState | null>(
      null,
    );

  /* ============================================================
     REFS
  ============================================================ */

  const mountedRef =
    useRef(true);

  const startedRef =
    useRef(false);

  /* ============================================================
     MOUNT
  ============================================================ */

  useEffect(() => {
    mountedRef.current =
      true;

    return () => {
      mountedRef.current =
        false;
    };
  }, []);

  /* ============================================================
     SEARCH
  ============================================================ */

  const runSearch =
    useCallback(async () => {
      if (
        startedRef.current ||
        locationLoading
      ) {
        return;
      }

      startedRef.current =
        true;

      setError(false);

      setAiResponse(
        null,
      );

      setStatus(
        "Preparing your request...",
      );

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

        if (
          !mountedRef.current
        ) {
          return;
        }

        /* ======================================================
           AI REQUEST
        ====================================================== */

        setStatus(
          "Understanding your problem and finding the right service...",
        );

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
              normalizeReason(
                result.reason,
              ),
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
              result.booking
                .description ??
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
          result.booking.address
            ?.trim() ||
          "";

        /* ======================================================
           PHOTOS
        ====================================================== */

        const bookingPhotos =
          photoUri
            ? [
                photoUri,
              ]
            : Array.isArray(
                  result.booking
                    .photos,
                )
              ? result.booking.photos.filter(
                  (
                    photo,
                  ): photo is string =>
                    typeof photo ===
                      "string" &&
                    photo.trim()
                      .length >
                      0,
                )
              : [];

        /* ======================================================
           BOOKING PREVIEW
        ====================================================== */

        const bookingPreview =
          {
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

        if (
          !mountedRef.current
        ) {
          return;
        }

        setStatus(
          `We found ${result.worker.name}. Preparing your booking...`,
        );

        /* ======================================================
           NAVIGATION
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
                result.worker
                  .rating ??
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
                result.worker
                  .verified ??
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
               DESCRIPTION
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
      } catch (err) {
        console.error(
          "AI_BOOKING_SEARCH_ERROR:",
          err,
        );

        if (
          !mountedRef.current
        ) {
          return;
        }

        setError(true);
      }
    }, [
      description,
      imageUri,
      location,
      locationLoading,
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
     RETRY
  ============================================================ */

  const handleRetry =
    useCallback(() => {
      startedRef.current =
        false;

      setError(false);

      setAiResponse(
        null,
      );

      setStatus(
        "Preparing your request...",
      );

      void runSearch();
    }, [
      runSearch,
    ]);

  /* ============================================================
     BACK
  ============================================================ */

  const handleBack =
    useCallback(() => {
      if (
        router.canGoBack()
      ) {
        router.back();

        return;
      }

      router.replace(
        "/(customer)/ai-booking",
      );
    }, []);

  /* ============================================================
     MANUAL BOOKING
  ============================================================ */

  const handleManualBooking =
    useCallback(() => {
      router.replace(
        "/(customer)/search",
      );
    }, []);

  /* ============================================================
     ERROR
  ============================================================ */

  if (error) {
    return (
      <AppScreen
        role="customer"
        padded={false}
      >
        <View
          style={
            styles.stateContainer
          }
        >
          <View
            style={[
              styles.stateIcon,
              styles.errorIcon,
            ]}
          >
            <AppIcon
              name="error"
              role="customer"
              size="xl"
              state="error"
            />
          </View>

          <AppText
            variant="heading2"
            weight="bold"
            center
            style={
              styles.stateTitle
            }
          >
            Something went wrong
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.stateMessage
            }
          >
            We couldn't complete the
            automatic booking right now.
            Please check your connection
            and try again.
          </AppText>

          <AppButton
            title="Try Again"
            role="customer"
            leftIconName="refresh"
            onPress={
              handleRetry
            }
            style={
              styles.stateButton
            }
          />

          <AppButton
            title="Go Back"
            role="customer"
            variant="ghost"
            leftIconName="back"
            onPress={
              handleBack
            }
            style={
              styles.secondaryStateButton
            }
          />
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

    const responseTitle =
      isUnsupportedService
        ? "Service Not Available"
        : isNoWorker
          ? "No Worker Available"
          : isUnclearImage
            ? "We Need a Clearer Photo"
            : "Fixxam Needs More Details";

    const responseIcon =
      isUnsupportedService
        ? "service"
        : isNoWorker
          ? "users"
          : isUnclearImage
            ? "image"
            : "professional";

    return (
      <AppScreen
        role="customer"
        padded={false}
      >
        <View
          style={
            styles.stateContainer
          }
        >
          <View
            style={[
              styles.stateIcon,

              isNoWorker
                ? styles.warningIcon
                : styles.primaryIcon,
            ]}
          >
            <AppIcon
              name={
                responseIcon
              }
              role="customer"
              size="xl"
              state={
                isNoWorker
                  ? "warning"
                  : "active"
              }
            />
          </View>

          <AppText
            variant="heading2"
            weight="bold"
            center
            style={
              styles.stateTitle
            }
          >
            {responseTitle}
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.stateMessage
            }
          >
            {aiResponse.message}
          </AppText>

          <AppCard
            role="customer"
            variant="outlined"
            style={
              styles.responseInfoCard
            }
          >
            <View
              style={
                styles.responseInfoIcon
              }
            >
              <AppIcon
                name="professional"
                role="customer"
                size="sm"
                state="active"
              />
            </View>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.responseInfoText
              }
            >
              You can try again with
              more details, or continue
              manually and choose the
              service yourself.
            </AppText>
          </AppCard>

          <AppButton
            title="Try Again"
            role="customer"
            leftIconName="back"
            onPress={
              handleBack
            }
            style={
              styles.stateButton
            }
          />

          <AppButton
            title="Book Manually"
            role="customer"
            variant="outline"
            leftIconName="search"
            onPress={
              handleManualBooking
            }
            style={
              styles.secondaryStateButton
            }
          />
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     LOADING
  ============================================================ */

  return (
    <AppScreen
      role="customer"
      padded={false}
    >
      <View
        style={
          styles.loadingContainer
        }
      >
        <View
          style={
            styles.searchCircle
          }
        >
          <AppIcon
            name="search"
            role="customer"
            size="xl"
            state="active"
          />
        </View>

        <AppText
          variant="heading1"
          weight="bold"
          center
          style={
            styles.loadingTitle
          }
        >
          Fixxam is finding
          {"\n"}
          your worker
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.loadingSubtitle
          }
        >
          {locationLoading
            ? "Getting your location..."
            : status}
        </AppText>

        <View
          style={
            styles.loader
          }
        >
          <ActivityIndicator
            size="small"
            color={
              CustomerColors.primary
            }
          />
        </View>

        <AppCard
          role="customer"
          variant="outlined"
          style={
            styles.infoCard
          }
        >
          <View
            style={
              styles.infoIcon
            }
          >
            <AppIcon
              name="verified"
              role="customer"
              size="sm"
              state="success"
            />
          </View>

          <AppText
            variant="caption"
            style={
              styles.infoText
            }
          >
            Fixxam will prepare a
            booking preview for you.
            Nothing will be booked
            until you review and
            confirm it.
          </AppText>
        </AppCard>
      </View>
    </AppScreen>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       COMMON STATE
    ======================================================== */

    stateContainer: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xxl,

      backgroundColor:
        Colors.background,
    },

    stateIcon: {
      width:
        FixxamTokens.size
          .roleCardHeight,

      height:
        FixxamTokens.size
          .roleCardHeight,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      borderWidth: 1,
    },

    primaryIcon: {
      borderColor:
        CustomerColors.primaryLight,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    warningIcon: {
      borderColor:
        Colors.warning,

      backgroundColor:
        Colors.warningSoft,
    },

    errorIcon: {
      borderColor:
        Colors.error,

      backgroundColor:
        Colors.errorSoft,
    },

    stateTitle: {
      maxWidth: 340,

      marginTop:
        FixxamTokens.spacing.xl,
    },

    stateMessage: {
      maxWidth: 360,

      marginTop:
        FixxamTokens.spacing.sm,
    },

    stateButton: {
      width: "100%",

      maxWidth: 360,

      marginTop:
        FixxamTokens.spacing.xxl,
    },

    secondaryStateButton: {
      width: "100%",

      maxWidth: 360,

      marginTop:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       RESPONSE INFO
    ======================================================== */

    responseInfoCard: {
      width: "100%",

      maxWidth: 360,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      marginTop:
        FixxamTokens.spacing.xl,

      padding:
        FixxamTokens.spacing.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    responseInfoIcon: {
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

      borderRadius:
        FixxamTokens.radius
          .iconButton,

      backgroundColor:
        Colors.surface,
    },

    responseInfoText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       LOADING
    ======================================================== */

    loadingContainer: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xxl,

      paddingBottom:
        FixxamTokens.spacing.xxl,

      backgroundColor:
        Colors.background,
    },

    searchCircle: {
      width:
        FixxamTokens.size
          .roleCardHeight,

      height:
        FixxamTokens.size
          .roleCardHeight,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        CustomerColors.primaryLight,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,

      ...FixxamTokens.shadow.card,
    },

    loadingTitle: {
      maxWidth: 340,

      marginTop:
        FixxamTokens.spacing.xxl,
    },

    loadingSubtitle: {
      maxWidth: 340,

      marginTop:
        FixxamTokens.spacing.sm,
    },

    loader: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginTop:
        FixxamTokens.spacing.lg,
    },

    /* ========================================================
       SECURITY INFO
    ======================================================== */

    infoCard: {
      width: "100%",

      maxWidth: 360,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.xxl,

      padding:
        FixxamTokens.spacing.md,

      borderColor:
        Colors.success,

      backgroundColor:
        Colors.successSoft,
    },

    infoIcon: {
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

      borderRadius:
        FixxamTokens.radius
          .iconButton,

      backgroundColor:
        Colors.surface,
    },

    infoText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      color:
        Colors.success,
    },
  });