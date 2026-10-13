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
  Linking,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  type Region,
} from "react-native-maps";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import {
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import {
  auth,
  db,
} from "@/firebase/config";

import type {
  BookingFulfillmentMode,
} from "@/types/bookingFulfillment";

/* ============================================================
   TYPES
============================================================ */

type Coordinate = {
  latitude: number;
  longitude: number;
};

type LiveLocation = Coordinate & {
  updatedAt?: unknown;
};

type BookingLocationData = {
  customerId?: string;

  fulfillmentMode?:
    | BookingFulfillmentMode
    | null;

  latitude?: number | null;
  longitude?: number | null;

  address?: string | null;

  liveLocation?: {
    latitude?: number | null;
    longitude?: number | null;
    accuracy?: number | null;
    updatedAt?: unknown;
  } | null;
};

type MapParams = {
  mode?: string | string[];

  fulfillmentMode?:
    | string
    | string[];

  orderId?: string | string[];

  latitude?: string | string[];
  longitude?: string | string[];

  address?: string | string[];

  workerId?: string | string[];
  workerName?: string | string[];
};

/* ============================================================
   HELPERS
============================================================ */

function getParamString(
  value:
    | string
    | string[]
    | undefined,
): string {
  if (Array.isArray(value)) {
    return (
      value[0] ??
      ""
    ).trim();
  }

  return (
    value ??
    ""
  ).trim();
}

function normalizeString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function parseCoordinate(
  value:
    | string
    | string[]
    | undefined,
): number | null {
  const raw =
    getParamString(value);

  if (!raw) {
    return null;
  }

  const parsed =
    Number(raw);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function isValidCoordinate(
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
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function createCoordinate(
  latitude:
    | number
    | null
    | undefined,
  longitude:
    | number
    | null
    | undefined,
): Coordinate | null {
  if (
    !isValidCoordinate(
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
}

function createRegion(
  coordinate: Coordinate,
): Region {
  return {
    latitude:
      coordinate.latitude,
    longitude:
      coordinate.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };
}

function resolveFulfillmentMode(
  value: string,
): BookingFulfillmentMode | null {
  if (
    value ===
      "customer_visits_worker" ||
    value ===
      "worker_visits_customer" ||
    value === "remote"
  ) {
    return value;
  }

  return null;
}

/* ============================================================
   SCREEN
============================================================ */

export default function CustomerMapScreen() {
  const insets =
    useSafeAreaInsets();

  const params =
    useLocalSearchParams<MapParams>();

  const mapRef =
    useRef<MapView | null>(
      null,
    );

  const hasAutoFramedRef =
    useRef(false);

  /* ==========================================================
     ROUTE DATA
  ========================================================== */

  const routeMode =
    useMemo(
      () =>
        getParamString(
          params.mode,
        ),
      [params.mode],
    );

  const isLiveMode =
    routeMode === "live";

  const isViewMode =
    !isLiveMode;

  const routeFulfillmentMode =
    useMemo(
      () =>
        resolveFulfillmentMode(
          getParamString(
            params.fulfillmentMode,
          ),
        ),
      [
        params.fulfillmentMode,
      ],
    );

  const orderId =
    useMemo(
      () =>
        getParamString(
          params.orderId,
        ),
      [params.orderId],
    );

  const workerName =
    useMemo(
      () =>
        getParamString(
          params.workerName,
        ) || "Worker",
      [params.workerName],
    );

  const routeLatitude =
    useMemo(
      () =>
        parseCoordinate(
          params.latitude,
        ),
      [params.latitude],
    );

  const routeLongitude =
    useMemo(
      () =>
        parseCoordinate(
          params.longitude,
        ),
      [params.longitude],
    );

  const routeLocation =
    useMemo(
      () =>
        createCoordinate(
          routeLatitude,
          routeLongitude,
        ),
      [
        routeLatitude,
        routeLongitude,
      ],
    );

  const routeAddress =
    useMemo(
      () =>
        getParamString(
          params.address,
        ),
      [params.address],
    );

  const initialFulfillmentMode =
    routeFulfillmentMode ??
    (isLiveMode
      ? "worker_visits_customer"
      : null);

  /* ==========================================================
     STATE
  ========================================================== */

  const [
    fulfillmentMode,
    setFulfillmentMode,
  ] =
    useState<
      BookingFulfillmentMode | null
    >(
      initialFulfillmentMode,
    );

  const [
    serviceLocation,
    setServiceLocation,
  ] =
    useState<Coordinate | null>(
      null,
    );

  const [
    serviceAddress,
    setServiceAddress,
  ] =
    useState("");

  const [
    liveLocation,
    setLiveLocation,
  ] =
    useState<LiveLocation | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    fatalError,
    setFatalError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    mapReady,
    setMapReady,
  ] =
    useState(false);

  const [
    openingDirections,
    setOpeningDirections,
  ] =
    useState(false);

  /* ==========================================================
     TRAVEL DIRECTION
  ========================================================== */

  const customerTravels =
    fulfillmentMode ===
    "customer_visits_worker";

  const workerTravels =
    fulfillmentMode ===
    "worker_visits_customer";

  const isRemote =
    fulfillmentMode ===
    "remote";

  const showDirections =
    isViewMode &&
    customerTravels;

  const showWorkerTracking =
    isLiveMode &&
    workerTravels;

  const needsLiveBooking =
    showWorkerTracking &&
    Boolean(orderId);

  /* ==========================================================
     LOCATION DATA
  ========================================================== */

  useEffect(() => {
    hasAutoFramedRef.current =
      false;

    setMapReady(false);
    setFatalError(null);
    setLiveLocation(null);
    setServiceLocation(null);
    setServiceAddress("");

    setFulfillmentMode(
      initialFulfillmentMode,
    );

    /* ========================================================
       REMOTE
    ======================================================== */

    if (
      initialFulfillmentMode ===
      "remote"
    ) {
      setLoading(false);

      setFatalError(
        "Remote services do not require a physical location.",
      );

      return;
    }

    /* ========================================================
       CUSTOMER -> WORKER
    ======================================================== */

    if (
      initialFulfillmentMode ===
      "customer_visits_worker"
    ) {
      if (!routeLocation) {
        setLoading(false);

        setFatalError(
          "The worker's service location is unavailable.",
        );

        return;
      }

      setServiceLocation(
        routeLocation,
      );

      setServiceAddress(
        routeAddress ||
          "Worker service location",
      );

      setLoading(false);

      return;
    }

    /* ========================================================
       WORKER -> CUSTOMER
       VIEW LOCATION ONLY
    ======================================================== */

    if (
      initialFulfillmentMode ===
        "worker_visits_customer" &&
      isViewMode
    ) {
      if (!routeLocation) {
        setLoading(false);

        setFatalError(
          "Your service location is unavailable.",
        );

        return;
      }

      setServiceLocation(
        routeLocation,
      );

      setServiceAddress(
        routeAddress ||
          "Your service location",
      );

      setLoading(false);

      return;
    }

    /* ========================================================
       WORKER -> CUSTOMER
       LIVE TRACKING ONLY
    ======================================================== */

    if (
      initialFulfillmentMode ===
        "worker_visits_customer" &&
      isLiveMode
    ) {
      if (!orderId) {
        setLoading(false);

        setFatalError(
          "This order could not be identified for live tracking.",
        );

        return;
      }

      const customerId =
        normalizeString(
          auth.currentUser?.uid,
        );

      if (!customerId) {
        setLoading(false);

        setFatalError(
          "Please sign in to track the worker.",
        );

        return;
      }

      setLoading(true);

      const bookingRef =
        doc(
          db,
          "bookings",
          orderId,
        );

      const unsubscribe =
        onSnapshot(
          bookingRef,

          snapshot => {
            if (
              !snapshot.exists()
            ) {
              setLoading(false);

              setFatalError(
                "This order no longer exists.",
              );

              setServiceLocation(
                null,
              );

              setLiveLocation(
                null,
              );

              return;
            }

            const data =
              snapshot.data() as
                BookingLocationData;

            /* ==============================================
               CUSTOMER OWNERSHIP
            ============================================== */

            const bookingCustomerId =
              normalizeString(
                data.customerId,
              );

            if (
              !bookingCustomerId ||
              bookingCustomerId !==
                customerId
            ) {
              setLoading(false);

              setFatalError(
                "You do not have access to this order.",
              );

              setServiceLocation(
                null,
              );

              setLiveLocation(
                null,
              );

              return;
            }

            /* ==============================================
               VERIFY MODE
            ============================================== */

            const bookingMode =
              resolveFulfillmentMode(
                normalizeString(
                  data.fulfillmentMode,
                ),
              );

            const resolvedMode =
              bookingMode ??
              initialFulfillmentMode;

            if (
              resolvedMode !==
              "worker_visits_customer"
            ) {
              setFulfillmentMode(
                resolvedMode,
              );

              setLoading(false);

              setServiceLocation(
                null,
              );

              setLiveLocation(
                null,
              );

              setFatalError(
                resolvedMode ===
                  "remote"
                  ? "Remote services do not require live location tracking."
                  : "Worker live tracking is not required for this service.",
              );

              return;
            }

            setFulfillmentMode(
              resolvedMode,
            );

            /* ==============================================
               CUSTOMER DESTINATION
            ============================================== */

            const bookingLocation =
              createCoordinate(
                data.latitude,
                data.longitude,
              );

            const destination =
              bookingLocation ??
              routeLocation;

            if (!destination) {
              setLoading(false);

              setFatalError(
                "Your service location is unavailable.",
              );

              setServiceLocation(
                null,
              );

              setLiveLocation(
                null,
              );

              return;
            }

            setServiceLocation(
              destination,
            );

            setServiceAddress(
              normalizeString(
                data.address,
              ) ||
                routeAddress ||
                "Your service location",
            );

            /* ==============================================
               WORKER LIVE LOCATION
            ============================================== */

            const workerLocation =
              createCoordinate(
                data.liveLocation
                  ?.latitude,
                data.liveLocation
                  ?.longitude,
              );

            if (workerLocation) {
              setLiveLocation({
                ...workerLocation,
                updatedAt:
                  data.liveLocation
                    ?.updatedAt,
              });
            } else {
              setLiveLocation(
                null,
              );
            }

            setFatalError(null);
            setLoading(false);
          },

          snapshotError => {
            console.error(
              "CUSTOMER_MAP_LISTENER_ERROR:",
              snapshotError,
            );

            setLoading(false);

            setFatalError(
              "Unable to load worker tracking.",
            );

            setLiveLocation(
              null,
            );
          },
        );

      return unsubscribe;
    }

    /* ========================================================
       SAFE STATIC FALLBACK
    ======================================================== */

    if (routeLocation) {
      setServiceLocation(
        routeLocation,
      );

      setServiceAddress(
        routeAddress ||
          "Service location",
      );

      setLoading(false);

      return;
    }

    setLoading(false);

    setFatalError(
      "This order does not have a valid service location.",
    );
  }, [
    initialFulfillmentMode,
    isLiveMode,
    isViewMode,
    orderId,
    routeAddress,
    routeLocation,
  ]);

  /* ==========================================================
     INITIAL REGION
  ========================================================== */

  const initialRegion =
    useMemo<
      Region | undefined
    >(
      () =>
        serviceLocation
          ? createRegion(
              serviceLocation,
            )
          : undefined,
      [serviceLocation],
    );

  /* ==========================================================
     AUTO FRAME LIVE WORKER + DESTINATION
  ========================================================== */

  useEffect(() => {
    if (
      !showWorkerTracking ||
      !mapReady ||
      !serviceLocation ||
      !liveLocation ||
      hasAutoFramedRef.current
    ) {
      return;
    }

    hasAutoFramedRef.current =
      true;

    mapRef.current
      ?.fitToCoordinates(
        [
          serviceLocation,
          {
            latitude:
              liveLocation.latitude,
            longitude:
              liveLocation.longitude,
          },
        ],
        {
          edgePadding: {
            top: 190,
            right: 70,
            bottom: 210,
            left: 70,
          },
          animated: true,
        },
      );
  }, [
    liveLocation,
    mapReady,
    serviceLocation,
    showWorkerTracking,
  ]);

  /* ==========================================================
     BACK
  ========================================================== */

  const handleBack =
    useCallback(() => {
      router.back();
    }, []);

  /* ==========================================================
     CENTER DESTINATION
  ========================================================== */

  const handleServiceLocation =
    useCallback(() => {
      if (!serviceLocation) {
        return;
      }

      mapRef.current
        ?.animateToRegion(
          createRegion(
            serviceLocation,
          ),
          500,
        );
    }, [serviceLocation]);

  /* ==========================================================
     CENTER WORKER
  ========================================================== */

  const handleWorkerLocation =
    useCallback(() => {
      if (
        !showWorkerTracking ||
        !liveLocation
      ) {
        return;
      }

      mapRef.current
        ?.animateToRegion(
          createRegion({
            latitude:
              liveLocation.latitude,
            longitude:
              liveLocation.longitude,
          }),
          500,
        );
    }, [
      liveLocation,
      showWorkerTracking,
    ]);

  /* ==========================================================
     SHOW BOTH
  ========================================================== */

  const handleShowBoth =
    useCallback(() => {
      if (
        !showWorkerTracking ||
        !serviceLocation ||
        !liveLocation
      ) {
        return;
      }

      mapRef.current
        ?.fitToCoordinates(
          [
            serviceLocation,
            {
              latitude:
                liveLocation.latitude,
              longitude:
                liveLocation.longitude,
            },
          ],
          {
            edgePadding: {
              top: 190,
              right: 70,
              bottom: 210,
              left: 70,
            },
            animated: true,
          },
        );
    }, [
      liveLocation,
      serviceLocation,
      showWorkerTracking,
    ]);

  /* ==========================================================
     GET DIRECTIONS
  ========================================================== */

  const handleGetDirections =
    useCallback(async () => {
      if (
        !showDirections ||
        !serviceLocation ||
        openingDirections
      ) {
        return;
      }

      const destination =
        `${serviceLocation.latitude},${serviceLocation.longitude}`;

      const url =
        `https://www.google.com/maps/dir/?api=1` +
        `&destination=${encodeURIComponent(
          destination,
        )}` +
        `&travelmode=driving`;

      setOpeningDirections(true);

      try {
        await Linking.openURL(url);
      } catch (error) {
        console.error(
          "CUSTOMER_DIRECTIONS_ERROR:",
          error,
        );

        Alert.alert(
          "Directions unavailable",
          "We could not open directions. Please try again.",
        );
      } finally {
        setOpeningDirections(false);
      }
    }, [
      openingDirections,
      serviceLocation,
      showDirections,
    ]);

  /* ==========================================================
     DISPLAY COPY
  ========================================================== */

  const headerTitle =
    customerTravels
      ? "You’re Going to the Worker"
      : showWorkerTracking
        ? `Tracking ${workerName}`
        : workerTravels
          ? "Worker Is Coming to You"
          : "Service Location";

  const headerSubtitle =
    customerTravels
      ? `Your service is at ${workerName}'s location`
      : showWorkerTracking
        ? liveLocation
          ? `${workerName}'s live location`
          : "Waiting for live location"
        : workerTravels
          ? `${workerName} will come to this location`
          : "View service location";

  const destinationLabel =
    customerTravels
      ? "Worker service location"
      : workerTravels
        ? "Your service location"
        : "Service location";

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <AppScreen
        role="customer"
        contentContainerStyle={
          styles.stateScreen
        }
      >
        <ActivityIndicator
          size="large"
          color={
            CustomerColors.primary
          }
        />

        <AppText
          variant="body"
          tone="secondary"
          style={
            styles.loadingText
          }
        >
          {needsLiveBooking
            ? "Loading worker location..."
            : "Loading map..."}
        </AppText>
      </AppScreen>
    );
  }

  /* ==========================================================
     REMOTE
  ========================================================== */

  if (isRemote) {
    return (
      <AppScreen
        role="customer"
        contentContainerStyle={
          styles.stateScreen
        }
      >
        <View
          style={
            styles.errorIcon
          }
        >
          <AppIcon
            name="location"
            role="customer"
            size="lg"
            color={
              CustomerColors.primary
            }
          />
        </View>

        <AppText
          variant="heading3"
          weight="bold"
          center
          style={
            styles.errorTitle
          }
        >
          Remote service
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.errorText
          }
        >
          This service does not require a physical location.
        </AppText>

        <Pressable
          onPress={
            handleBack
          }
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.errorBackButton,
            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppIcon
            name="back"
            size="sm"
            color={
              Colors.textInverse
            }
          />

          <AppText
            variant="body"
            weight="bold"
            style={
              styles.errorBackText
            }
          >
            Go Back
          </AppText>
        </Pressable>
      </AppScreen>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (
    fatalError ||
    !serviceLocation ||
    !initialRegion
  ) {
    return (
      <AppScreen
        role="customer"
        contentContainerStyle={
          styles.stateScreen
        }
      >
        <View
          style={
            styles.errorIcon
          }
        >
          <AppIcon
            name="location"
            role="customer"
            size="lg"
            color={
              CustomerColors.primary
            }
          />
        </View>

        <AppText
          variant="heading3"
          weight="bold"
          center
          style={
            styles.errorTitle
          }
        >
          Location unavailable
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.errorText
          }
        >
          {fatalError ??
            "This service location is unavailable."}
        </AppText>

        <Pressable
          onPress={
            handleBack
          }
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [
            styles.errorBackButton,
            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppIcon
            name="back"
            size="sm"
            color={
              Colors.textInverse
            }
          />

          <AppText
            variant="body"
            weight="bold"
            style={
              styles.errorBackText
            }
          >
            Go Back
          </AppText>
        </Pressable>
      </AppScreen>
    );
  }

  /* ==========================================================
     MAP
  ========================================================== */

  return (
    <View
      style={
        styles.mapContainer
      }
    >
      <MapView
        ref={
          mapRef
        }
        provider={
          PROVIDER_GOOGLE
        }
        style={
          styles.map
        }
        initialRegion={
          initialRegion
        }
        showsUserLocation={
          customerTravels
        }
        showsMyLocationButton={
          customerTravels
        }
        followsUserLocation={
          false
        }
        showsCompass
        toolbarEnabled={
          false
        }
        onMapReady={() => {
          setMapReady(true);
        }}
      >
        {/* ====================================================
            SERVICE DESTINATION

            Native marker is intentionally used here.
            This is more reliable on Android than a custom
            View marker with tracksViewChanges={false}.
        ==================================================== */}

        <Marker
          coordinate={
            serviceLocation
          }
          title={
            destinationLabel
          }
          description={
            serviceAddress ||
            destinationLabel
          }
          pinColor={
            CustomerColors.primary
          }
        />

        {/* ====================================================
            WORKER REALTIME MARKER
            ONLY IN TRACK WORKER MODE
        ==================================================== */}

        {showWorkerTracking &&
        liveLocation ? (
          <Marker
            coordinate={{
              latitude:
                liveLocation.latitude,
              longitude:
                liveLocation.longitude,
            }}
            title={
              workerName
            }
            description="Worker live location"
          >
            <View
              style={
                styles.workerMarker
              }
            >
              <View
                style={
                  styles.workerPulse
                }
              />

              <AppIcon
                name="profile"
                size="sm"
                color={
                  Colors.textInverse
                }
              />
            </View>
          </Marker>
        ) : null}
      </MapView>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        pointerEvents="box-none"
        style={[
          styles.topOverlay,
          {
            top:
              insets.top +
              FixxamTokens.spacing.sm,
          },
        ]}
      >
        <Pressable
          onPress={
            handleBack
          }
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [
            styles.iconButton,
            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppIcon
            name="back"
            size="md"
            color={
              Colors.textPrimary
            }
          />
        </Pressable>

        <View
          style={
            styles.titleCard
          }
        >
          <AppText
            variant="body"
            weight="bold"
            style={
              styles.title
            }
          >
            {headerTitle}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={2}
            style={
              styles.subtitle
            }
          >
            {headerSubtitle}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          LIVE TRACKING STATUS
      ====================================================== */}

      {showWorkerTracking ? (
        <View
          style={[
            styles.statusCard,
            {
              top:
                insets.top +
                FixxamTokens.size
                  .minimumTouchTarget +
                FixxamTokens.spacing.xl,
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              liveLocation
                ? styles.statusDotLive
                : styles.statusDotWaiting,
            ]}
          />

          <View
            style={
              styles.statusContent
            }
          >
            <AppText
              variant="caption"
              weight="bold"
              style={
                liveLocation
                  ? styles.statusTitleLive
                  : styles.statusTitleWaiting
              }
            >
              {liveLocation
                ? "WORKER IS ON THE WAY"
                : "WAITING FOR LIVE LOCATION"}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.statusText
              }
            >
              {liveLocation
                ? `${workerName}'s position updates automatically.`
                : `${workerName} will appear here when location sharing starts.`}
            </AppText>
          </View>
        </View>
      ) : null}

      {/* ======================================================
          MAP CONTROLS
      ====================================================== */}

      <View
        style={[
          styles.locationButtons,
          {
            bottom:
              insets.bottom +
              (showDirections
                ? 190
                : 150),
          },
        ]}
      >
        <MapControlButton
          icon="location"
          color={
            CustomerColors.primary
          }
          label={
            customerTravels
              ? "Center on worker service location"
              : "Center on your service location"
          }
          onPress={
            handleServiceLocation
          }
        />

        {showWorkerTracking &&
        liveLocation ? (
          <>
            <MapControlButton
              icon="profile"
              color={
                Colors.success
              }
              label="Center on worker"
              onPress={
                handleWorkerLocation
              }
            />

            <MapControlButton
              icon="locate"
              color={
                Colors.textPrimary
              }
              label="Show worker and destination"
              onPress={
                handleShowBoth
              }
            />
          </>
        ) : null}
      </View>

      {/* ======================================================
          BOTTOM INFORMATION CARD
      ====================================================== */}

      <View
        style={[
          styles.bottomCard,
          {
            bottom:
              insets.bottom +
              FixxamTokens.spacing.lg,
          },
        ]}
      >
        <View
          style={
            styles.bottomLocationRow
          }
        >
          <View
            style={
              styles.bottomIcon
            }
          >
            <AppIcon
              name="location"
              role="customer"
              size="sm"
              color={
                CustomerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.bottomContent
            }
          >
            <AppText
              variant="caption"
              tone="secondary"
            >
              {destinationLabel}
            </AppText>

            <AppText
              variant="bodyMedium"
              weight="semibold"
              numberOfLines={3}
              ellipsizeMode="tail"
              style={
                styles.bottomAddress
              }
            >
              {serviceAddress ||
                destinationLabel}
            </AppText>
          </View>

          {!mapReady ? (
            <ActivityIndicator
              size="small"
              color={
                CustomerColors.primary
              }
            />
          ) : null}
        </View>

        {/* ====================================================
            CUSTOMER -> WORKER
        ==================================================== */}

        {showDirections ? (
          <>
            <View
              style={
                styles.travelExplanation
              }
            >
              <View
                style={
                  styles.travelIcon
                }
              >
                <AppIcon
                  name="profile"
                  size="xs"
                  color={
                    CustomerColors.primary
                  }
                />
              </View>

              <View
                style={
                  styles.travelContent
                }
              >
                <AppText
                  variant="bodyMedium"
                  weight="semibold"
                  style={
                    styles.travelTitle
                  }
                >
                  You are going to {workerName}
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.travelText
                  }
                >
                  This pin is the worker&apos;s service location.
                </AppText>
              </View>
            </View>

            <Pressable
              onPress={
                handleGetDirections
              }
              disabled={
                openingDirections
              }
              accessibilityRole="button"
              accessibilityLabel="Get directions to worker service location"
              accessibilityState={{
                disabled:
                  openingDirections,
              }}
              style={({ pressed }) => [
                styles.primaryAction,

                openingDirections
                  ? styles.primaryActionDisabled
                  : null,

                pressed &&
                !openingDirections
                  ? styles.pressed
                  : null,
              ]}
            >
              {openingDirections ? (
                <ActivityIndicator
                  size="small"
                  color={
                    Colors.textInverse
                  }
                />
              ) : (
                <AppIcon
                  name="navigation"
                  role="customer"
                  size="sm"
                  color={
                    Colors.textInverse
                  }
                />
              )}

              <AppText
                variant="bodyMedium"
                weight="bold"
                style={
                  styles.primaryActionText
                }
              >
                {openingDirections
                  ? "Opening Directions..."
                  : "Get Directions"}
              </AppText>
            </Pressable>
          </>
        ) : null}

        {/* ====================================================
            WORKER -> CUSTOMER
            VIEW LOCATION
        ==================================================== */}

        {workerTravels &&
        isViewMode ? (
          <View
            style={
              styles.travelExplanation
            }
          >
            <View
              style={[
                styles.travelIcon,
                styles.workerTravelIcon,
              ]}
            >
              <AppIcon
                name="profile"
                size="xs"
                color={
                  Colors.success
                }
              />
            </View>

            <View
              style={
                styles.travelContent
              }
            >
              <AppText
                variant="bodyMedium"
                weight="semibold"
                style={
                  styles.travelTitle
                }
              >
                {workerName} will come to you
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.travelText
                }
              >
                This pin is your service location. The worker will travel to this address.
              </AppText>
            </View>
          </View>
        ) : null}

        {/* ====================================================
            LIVE TRACKING
        ==================================================== */}

        {showWorkerTracking ? (
          <View
            style={
              styles.workerComingRow
            }
          >
            <View
              style={[
                styles.workerComingDot,
                liveLocation
                  ? styles.workerComingDotLive
                  : styles.workerComingDotWaiting,
              ]}
            />

            <View
              style={
                styles.workerComingContent
              }
            >
              <AppText
                variant="bodyMedium"
                weight="semibold"
                style={
                  styles.workerComingTitle
                }
              >
                {liveLocation
                  ? `${workerName} is on the way`
                  : `Waiting for ${workerName}'s live location`}
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.workerComingText
                }
              >
                {liveLocation
                  ? "Follow the worker's live position on the map."
                  : "The worker will appear on the map when location sharing starts."}
              </AppText>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

/* ============================================================
   MAP CONTROL BUTTON
============================================================ */

function MapControlButton({
  icon,
  color,
  label,
  onPress,
}: {
  icon:
    | "location"
    | "profile"
    | "locate";

  color: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={
        onPress
      }
      accessibilityRole="button"
      accessibilityLabel={
        label
      }
      style={({ pressed }) => [
        styles.locationButton,
        pressed
          ? styles.pressed
          : null,
      ]}
    >
      <AppIcon
        name={icon}
        size="sm"
        color={color}
      />
    </Pressable>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    stateScreen: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        Colors.background,
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textSecondary,
    },

    mapContainer: {
      flex: 1,

      backgroundColor:
        Colors.disabledBackground,
    },

    map: {
      ...StyleSheet.absoluteFillObject,
    },

    /* ========================================================
       TOP
    ======================================================== */

    topOverlay: {
      position: "absolute",

      left:
        FixxamTokens.spacing.lg,

      right:
        FixxamTokens.spacing.lg,

      flexDirection: "row",
      alignItems: "center",
    },

    iconButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems: "center",
      justifyContent: "center",

      borderWidth: 1,
      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    titleCard: {
      flex: 1,
      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderWidth: 1,
      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       LIVE STATUS
    ======================================================== */

    statusCard: {
      position: "absolute",

      left:
        FixxamTokens.spacing.lg,

      right:
        FixxamTokens.spacing.lg,

      minHeight: 62,

      padding:
        FixxamTokens.spacing.md,

      flexDirection: "row",
      alignItems: "center",

      borderWidth: 1,
      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    statusDot: {
      width: 10,
      height: 10,

      flexShrink: 0,

      borderRadius:
        FixxamTokens.radius.full,
    },

    statusDotLive: {
      backgroundColor:
        Colors.success,
    },

    statusDotWaiting: {
      backgroundColor:
        Colors.warning,
    },

    statusContent: {
      flex: 1,
      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    statusTitleLive: {
      color:
        Colors.success,
    },

    statusTitleWaiting: {
      color:
        Colors.warning,
    },

    statusText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 15,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       LIVE WORKER MARKER
    ======================================================== */

    workerMarker: {
      width: 44,
      height: 44,

      position: "relative",

      alignItems: "center",
      justifyContent: "center",

      borderWidth: 3,

      borderColor:
        Colors.surface,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.success,
    },

    workerPulse: {
      position: "absolute",

      width: 54,
      height: 54,

      borderWidth: 2,

      borderColor:
        Colors.success,

      borderRadius:
        FixxamTokens.radius.full,

      opacity: 0.25,
    },

    /* ========================================================
       MAP CONTROLS
    ======================================================== */

    locationButtons: {
      position: "absolute",

      right:
        FixxamTokens.spacing.lg,

      gap:
        FixxamTokens.spacing.sm,
    },

    locationButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      alignItems: "center",
      justifyContent: "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       BOTTOM CARD
    ======================================================== */

    bottomCard: {
      position: "absolute",

      left:
        FixxamTokens.spacing.lg,

      right:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    bottomLocationRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    bottomIcon: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems: "center",
      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    bottomContent: {
      flex: 1,
      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    bottomAddress: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 20,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       TRAVEL EXPLANATION
    ======================================================== */

    travelExplanation: {
      marginTop:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.md,

      flexDirection: "row",
      alignItems: "center",

      borderTopWidth:
        StyleSheet.hairlineWidth,

      borderTopColor:
        Colors.border,
    },

    travelIcon: {
      width: 38,
      height: 38,

      flexShrink: 0,

      alignItems: "center",
      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    workerTravelIcon: {
      backgroundColor:
        Colors.disabledBackground,
    },

    travelContent: {
      flex: 1,
      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    travelTitle: {
      color:
        Colors.textPrimary,
    },

    travelText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 16,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       PRIMARY ACTION
    ======================================================== */

    primaryAction: {
      width: "100%",

      minHeight:
        FixxamTokens.size
          .buttonHeight,

      marginTop:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    primaryActionDisabled: {
      opacity: 0.65,
    },

    primaryActionText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       LIVE WORKER BOTTOM STATUS
    ======================================================== */

    workerComingRow: {
      marginTop:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.md,

      flexDirection: "row",
      alignItems: "center",

      borderTopWidth:
        StyleSheet.hairlineWidth,

      borderTopColor:
        Colors.border,
    },

    workerComingDot: {
      width: 10,
      height: 10,

      flexShrink: 0,

      borderRadius:
        FixxamTokens.radius.full,
    },

    workerComingDotLive: {
      backgroundColor:
        Colors.success,
    },

    workerComingDotWaiting: {
      backgroundColor:
        Colors.warning,
    },

    workerComingContent: {
      flex: 1,
      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    workerComingTitle: {
      color:
        Colors.textPrimary,
    },

    workerComingText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 16,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       ERROR
    ======================================================== */

    errorIcon: {
      width:
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

      alignItems: "center",
      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    errorTitle: {
      marginTop:
        FixxamTokens.spacing.lg,

      color:
        Colors.textPrimary,
    },

    errorText: {
      maxWidth: 320,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    errorBackButton: {
      minHeight:
        FixxamTokens.size
          .buttonHeight,

      marginTop:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    errorBackText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       INTERACTION
    ======================================================== */

    pressed: {
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
  });