import React, {
  memo,
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

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  type Region,
  type WorkerMapHandle,
} from "@/components/maps/WorkerMapView.web";

import {
  onAuthStateChanged,
} from "firebase/auth";

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
  AppLoader,
} from "@/components/common";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import type {
  BookingFulfillmentMode,
} from "@/types/bookingFulfillment";

/* ==============================================================
   TYPES
============================================================== */

type Coordinate = {
  latitude: number;
  longitude: number;
};

type LiveLocation = Coordinate & {
  updatedAt?: unknown;
};

type FirestoreCoordinate = {
  latitude?: number | null;
  longitude?: number | null;
  updatedAt?: unknown;
};

type BookingLocation = {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
};

type BookingData = {
  customerId?: string;
  workerId?: string;

  customerName?: string | null;

  fulfillmentMode?:
    | BookingFulfillmentMode
    | null;

  address?: string | null;

  latitude?: number | null;
  longitude?: number | null;

  location?:
    | BookingLocation
    | null;

  workerLiveLocation?:
    | FirestoreCoordinate
    | null;

  liveLocation?:
    | FirestoreCoordinate
    | null;

  status?: string | null;
};

type RouteParams = {
  orderId?:
    | string
    | string[];

  fulfillmentMode?:
    | string
    | string[];

  latitude?:
    | string
    | string[];

  longitude?:
    | string
    | string[];

  address?:
    | string
    | string[];

  customerName?:
    | string
    | string[];
};

type MapStateProps = {
  icon:
    | "lock"
    | "location"
    | "error";

  title: string;
  description: string;

  onBack: () => void;
};

/* ==============================================================
   HELPERS
============================================================== */

function resolveParam(
  value:
    | string
    | string[]
    | undefined,
): string {
  if (
    typeof value ===
    "string"
  ) {
    return value.trim();
  }

  if (
    Array.isArray(
      value,
    )
  ) {
    return (
      value[0]?.trim() ??
      ""
    );
  }

  return "";
}

function safeString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function parseCoordinateParam(
  value:
    | string
    | string[]
    | undefined,
): number | null {
  const raw =
    resolveParam(
      value,
    );

  if (!raw) {
    return null;
  }

  const parsed =
    Number(
      raw,
    );

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : null;
}

function createCoordinate(
  latitude: unknown,
  longitude: unknown,
): Coordinate | null {
  if (
    typeof latitude !==
      "number" ||
    !Number.isFinite(
      latitude,
    ) ||
    latitude < -90 ||
    latitude > 90 ||
    typeof longitude !==
      "number" ||
    !Number.isFinite(
      longitude,
    ) ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return {
    latitude,
    longitude,
  };
}

function resolveFulfillmentMode(
  value: unknown,
): BookingFulfillmentMode | null {
  if (
    value ===
      "worker_visits_customer" ||
    value ===
      "customer_visits_worker" ||
    value ===
      "remote"
  ) {
    return value;
  }

  return null;
}

function getBookingCoordinate(
  data: BookingData,
): Coordinate | null {
  const direct =
    createCoordinate(
      data.latitude,
      data.longitude,
    );

  if (direct) {
    return direct;
  }

  return createCoordinate(
    data.location?.latitude,
    data.location?.longitude,
  );
}

function getWorkerLiveLocation(
  data: BookingData,
): LiveLocation | null {
  const source =
    data.workerLiveLocation ??
    data.liveLocation;

  if (!source) {
    return null;
  }

  const coordinate =
    createCoordinate(
      source.latitude,
      source.longitude,
    );

  if (!coordinate) {
    return null;
  }

  return {
    ...coordinate,

    updatedAt:
      source.updatedAt,
  };
}

function getBookingAddress(
  data: BookingData,
): string {
  return (
    safeString(
      data.address,
    ) ||
    safeString(
      data.location?.address,
    )
  );
}

function createRegion(
  coordinate: Coordinate,
): Region {
  return {
    latitude:
      coordinate.latitude,

    longitude:
      coordinate.longitude,

    latitudeDelta:
      0.012,

    longitudeDelta:
      0.012,
  };
}

/* ==============================================================
   SCREEN
============================================================== */

export default function WorkerMapScreen() {
  const insets =
    useSafeAreaInsets();

  const params =
    useLocalSearchParams<RouteParams>();

  const mapRef = useRef<WorkerMapHandle | null>(null);

  const hasAutoFramedRef =
    useRef(false);

  /* ============================================================
     ROUTE DATA
  ============================================================ */

  const orderId =
    useMemo(
      () =>
        resolveParam(
          params.orderId,
        ),
      [
        params.orderId,
      ],
    );

  const routeFulfillmentMode =
    useMemo(
      () =>
        resolveFulfillmentMode(
          resolveParam(
            params.fulfillmentMode,
          ),
        ),
      [
        params.fulfillmentMode,
      ],
    );

  const routeLatitude =
    useMemo(
      () =>
        parseCoordinateParam(
          params.latitude,
        ),
      [
        params.latitude,
      ],
    );

  const routeLongitude =
    useMemo(
      () =>
        parseCoordinateParam(
          params.longitude,
        ),
      [
        params.longitude,
      ],
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
        resolveParam(
          params.address,
        ),
      [
        params.address,
      ],
    );

  const routeCustomerName =
    useMemo(
      () =>
        resolveParam(
          params.customerName,
        ),
      [
        params.customerName,
      ],
    );

  /* ============================================================
     AUTH
  ============================================================ */

  const [
    authReady,
    setAuthReady,
  ] =
    useState(false);

  const [
    userId,
    setUserId,
  ] =
    useState<
      string | null
    >(null);

  /* ============================================================
     BOOKING STATE
  ============================================================ */

  const [
    fulfillmentMode,
    setFulfillmentMode,
  ] =
    useState<
      BookingFulfillmentMode | null
    >(
      routeFulfillmentMode,
    );

  const [
    bookingStatus,
    setBookingStatus,
  ] =
    useState("");

  const [
    customerName,
    setCustomerName,
  ] =
    useState(
      routeCustomerName ||
        "Customer",
    );

  const [
    serviceLocation,
    setServiceLocation,
  ] =
    useState<
      Coordinate | null
    >(
      routeLocation,
    );

  const [
    workerLocation,
    setWorkerLocation,
  ] =
    useState<
      LiveLocation | null
    >(null);

  const [
    address,
    setAddress,
  ] =
    useState(
      routeAddress,
    );

  /* ============================================================
     UI STATE
  ============================================================ */

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

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

  /* ============================================================
     AUTH LISTENER
  ============================================================ */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        user => {
          const uid =
            user?.uid?.trim() ??
            "";

          setUserId(
            uid || null,
          );

          setAuthReady(
            true,
          );
        },
      );

    return unsubscribe;
  }, []);

  /* ============================================================
     BOOKING LISTENER
  ============================================================ */

  useEffect(() => {
    if (!authReady) {
      return;
    }

    hasAutoFramedRef.current =
      false;

    setMapReady(
      false,
    );

    setError(
      null,
    );

    setWorkerLocation(
      null,
    );

    if (
      routeLocation
    ) {
      setServiceLocation(
        routeLocation,
      );
    }

    if (
      routeAddress
    ) {
      setAddress(
        routeAddress,
      );
    }

    if (
      routeFulfillmentMode
    ) {
      setFulfillmentMode(
        routeFulfillmentMode,
      );
    }

    if (
      routeCustomerName
    ) {
      setCustomerName(
        routeCustomerName,
      );
    }

    if (!userId) {
      setLoading(
        false,
      );

      setError(
        "Please sign in to view this location.",
      );

      return;
    }

    if (!orderId) {
      setLoading(
        false,
      );

      setError(
        "This order could not be found.",
      );

      return;
    }

    setLoading(
      true,
    );

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
            setLoading(
              false,
            );

            setError(
              "This order no longer exists.",
            );

            setServiceLocation(
              null,
            );

            setWorkerLocation(
              null,
            );

            return;
          }

          const data =
            snapshot.data() as
              BookingData;

          /* ================================================
             WORKER ACCESS
          ================================================ */

          const bookingWorkerId =
            safeString(
              data.workerId,
            );

          if (
            !bookingWorkerId ||
            bookingWorkerId !==
              userId
          ) {
            setLoading(
              false,
            );

            setError(
              "You do not have access to this order location.",
            );

            setServiceLocation(
              null,
            );

            setWorkerLocation(
              null,
            );

            return;
          }

          /* ================================================
             FULFILLMENT MODE
          ================================================ */

          const firestoreMode =
            resolveFulfillmentMode(
              data.fulfillmentMode,
            );

          const resolvedMode =
            firestoreMode ??
            routeFulfillmentMode;

          if (
            !resolvedMode
          ) {
            setLoading(
              false,
            );

            setError(
              "This order does not have a valid service type.",
            );

            return;
          }

          setFulfillmentMode(
            resolvedMode,
          );

          /* ================================================
             REMOTE
          ================================================ */

          if (
            resolvedMode ===
            "remote"
          ) {
            setBookingStatus(
              safeString(
                data.status,
              ),
            );

            setServiceLocation(
              null,
            );

            setWorkerLocation(
              null,
            );

            setAddress(
              "",
            );

            setError(
              null,
            );

            setLoading(
              false,
            );

            return;
          }

          /* ================================================
             DESTINATION

             Booking coordinates mean:

             worker_visits_customer
             -> customer's service location

             customer_visits_worker
             -> worker's fixed service location
          ================================================ */

          const firestoreLocation =
            getBookingCoordinate(
              data,
            );

          const destination =
            firestoreLocation ??
            routeLocation;

          if (
            !destination
          ) {
            setLoading(
              false,
            );

            setError(
              resolvedMode ===
                "worker_visits_customer"
                ? "The customer's service location is unavailable."
                : "Your service location is unavailable.",
            );

            setServiceLocation(
              null,
            );

            setWorkerLocation(
              null,
            );

            return;
          }

          setServiceLocation(
            destination,
          );

          setAddress(
            getBookingAddress(
              data,
            ) ||
              routeAddress ||
              (
                resolvedMode ===
                "worker_visits_customer"
                  ? "Customer service location"
                  : "Your service location"
              ),
          );

          /* ================================================
             CUSTOMER
          ================================================ */

          setCustomerName(
            safeString(
              data.customerName,
            ) ||
              routeCustomerName ||
              "Customer",
          );

          /* ================================================
             STATUS
          ================================================ */

          const status =
            safeString(
              data.status,
            );

          setBookingStatus(
            status,
          );

          /* ================================================
             WORKER LIVE LOCATION

             Only meaningful when:
             - worker travels to customer
             - service is in progress
          ================================================ */

          if (
            resolvedMode ===
              "worker_visits_customer" &&
            status ===
              "in-progress"
          ) {
            setWorkerLocation(
              getWorkerLiveLocation(
                data,
              ),
            );
          } else {
            setWorkerLocation(
              null,
            );
          }

          setError(
            null,
          );

          setLoading(
            false,
          );
        },

        snapshotError => {
          console.error(
            "FIXXAM_WORKER_MAP_LISTENER_ERROR:",
            snapshotError,
          );

          setLoading(
            false,
          );

          setError(
            "Unable to load this order location.",
          );
        },
      );

    return unsubscribe;
  }, [
    authReady,
    orderId,
    routeAddress,
    routeCustomerName,
    routeFulfillmentMode,
    routeLocation,
    userId,
  ]);

  /* ============================================================
     TRAVEL DIRECTION
  ============================================================ */

  const workerTravels =
    fulfillmentMode ===
    "worker_visits_customer";

  const customerTravels =
    fulfillmentMode ===
    "customer_visits_worker";

  const isRemote =
    fulfillmentMode ===
    "remote";

  const serviceInProgress =
    bookingStatus ===
    "in-progress";

  const showWorkerLivePosition =
    workerTravels &&
    serviceInProgress &&
    Boolean(
      workerLocation,
    );

  /* ============================================================
     INITIAL REGION
  ============================================================ */

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
      [
        serviceLocation,
      ],
    );

  /* ============================================================
     FIT LOCATIONS
  ============================================================ */

  const fitLocations =
    useCallback(() => {
      const map =
        mapRef.current;

      if (
        !map ||
        !serviceLocation
      ) {
        return;
      }

      if (
        showWorkerLivePosition &&
        workerLocation
      ) {
        map.fitToCoordinates(
          [
            serviceLocation,

            {
              latitude:
                workerLocation.latitude,

              longitude:
                workerLocation.longitude,
            },
          ],
          {
            edgePadding: {
              top: 190,
              right: 70,
              bottom: 260,
              left: 70,
            },

            animated:
              true,
          },
        );

        return;
      }

      map.animateToRegion(
        createRegion(
          serviceLocation,
        ),
        500,
      );
    }, [
      serviceLocation,
      showWorkerLivePosition,
      workerLocation,
    ]);

  /* ============================================================
     AUTO FRAME
  ============================================================ */

  useEffect(() => {
    if (
      !mapReady ||
      !serviceLocation ||
      hasAutoFramedRef.current
    ) {
      return;
    }

    hasAutoFramedRef.current =
      true;

    const timer =
      setTimeout(
        () => {
          fitLocations();
        },
        250,
      );

    return () => {
      clearTimeout(
        timer,
      );
    };
  }, [
    fitLocations,
    mapReady,
    serviceLocation,
  ]);

  /* ============================================================
     ACTIONS
  ============================================================ */

  const handleBack =
    useCallback(() => {
      router.back();
    }, []);

  const handleServiceLocation =
    useCallback(() => {
      if (
        !serviceLocation
      ) {
        return;
      }

      mapRef.current
        ?.animateToRegion(
          createRegion(
            serviceLocation,
          ),
          500,
        );
    }, [
      serviceLocation,
    ]);

  const handleWorkerLocation =
    useCallback(() => {
      if (
        !workerLocation
      ) {
        return;
      }

      mapRef.current
        ?.animateToRegion(
          createRegion({
            latitude:
              workerLocation.latitude,

            longitude:
              workerLocation.longitude,
          }),
          500,
        );
    }, [
      workerLocation,
    ]);

  const handleShowBoth =
    useCallback(() => {
      fitLocations();
    }, [
      fitLocations,
    ]);

  /* ============================================================
     GET DIRECTIONS

     Only worker -> customer.
  ============================================================ */

  const handleGetDirections =
    useCallback(async () => {
      if (
        !workerTravels ||
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

      setOpeningDirections(
        true,
      );

      try {
        await Linking.openURL(
          url,
        );
      } catch (directionError) {
        console.error(
          "WORKER_GET_DIRECTIONS_ERROR:",
          directionError,
        );

        Alert.alert(
          "Directions unavailable",
          "We could not open directions. Please try again.",
        );
      } finally {
        setOpeningDirections(
          false,
        );
      }
    }, [
      openingDirections,
      serviceLocation,
      workerTravels,
    ]);

  /* ============================================================
     DISPLAY COPY
  ============================================================ */

  const headerTitle =
    workerTravels
      ? "You’re Going to the Customer"
      : customerTravels
        ? "Customer Is Coming to You"
        : "Service Location";

  const headerSubtitle =
    workerTravels
      ? `Travel to ${customerName}'s service location`
      : customerTravels
        ? `${customerName} will come to your service location`
        : "Service location";

  const destinationLabel =
    workerTravels
      ? "Customer service location"
      : customerTravels
        ? "Your service location"
        : "Service location";

  /* ============================================================
     LOADING
  ============================================================ */

  if (
    !authReady ||
    loading
  ) {
    return (
      <AppScreen
        role="worker"
        contentContainerStyle={
          styles.stateScreen
        }
      >
        <View
          style={
            styles.center
          }
        >
          <AppLoader
            role="worker"
            size="sm"
          />

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.loadingText
            }
          >
            Loading map...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     SIGNED OUT / ERROR
  ============================================================ */

  if (
    error ||
    !userId
  ) {
    const signInRequired =
      !userId;

    return (
      <MapState
        icon={
          signInRequired
            ? "lock"
            : "location"
        }
        title={
          signInRequired
            ? "Sign in required"
            : "Location unavailable"
        }
        description={
          error ??
          "Please sign in to view this location."
        }
        onBack={
          handleBack
        }
      />
    );
  }

  /* ============================================================
     REMOTE
  ============================================================ */

  if (
    isRemote
  ) {
    return (
      <MapState
        icon="location"
        title="Remote service"
        description="This service does not require a physical location."
        onBack={
          handleBack
        }
      />
    );
  }

  /* ============================================================
     NO DESTINATION
  ============================================================ */

  if (
    !serviceLocation ||
    !initialRegion
  ) {
    return (
      <MapState
        icon="location"
        title="No service location"
        description={
          workerTravels
            ? "This order does not have a valid customer service location."
            : "This order does not have a valid service location."
        }
        onBack={
          handleBack
        }
      />
    );
  }

  /* ============================================================
     MAP
  ============================================================ */

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
          false
        }
        showsMyLocationButton={
          false
        }
        showsCompass
        toolbarEnabled={
          false
        }
        rotateEnabled
        pitchEnabled
        onMapReady={() => {
          setMapReady(
            true,
          );
        }}
      >
        {/* ======================================================
            SERVICE DESTINATION PIN
        ====================================================== */}

        <Marker
          coordinate={
            serviceLocation
          }
          title={
            destinationLabel
          }
          description={
            address ||
            destinationLabel
          }
        >
          <View
            style={
              styles.destinationMarkerContainer
            }
          >
            <View
              style={
                styles.destinationMarkerLabel
              }
            >
              <AppText
                variant="caption"
                weight="bold"
                numberOfLines={1}
                style={
                  styles.destinationMarkerLabelText
                }
              >
                {workerTravels
                  ? "CUSTOMER"
                  : "SERVICE LOCATION"}
              </AppText>
            </View>

            <View
              style={[
                styles.destinationMarker,

                customerTravels
                  ? styles.workerServiceMarker
                  : styles.customerServiceMarker,
              ]}
            >
              <AppIcon
                name="location"
                size="sm"
                color={
                  Colors.textInverse
                }
              />
            </View>

            <View
              style={[
                styles.markerTip,

                customerTravels
                  ? styles.workerServiceMarkerTip
                  : styles.customerServiceMarkerTip,
              ]}
            />
          </View>
        </Marker>

        {/* ======================================================
            WORKER LIVE POSITION

            Only worker_visits_customer + in-progress.
        ====================================================== */}

        {showWorkerLivePosition &&
        workerLocation ? (
          <Marker
            coordinate={{
              latitude:
                workerLocation.latitude,

              longitude:
                workerLocation.longitude,
            }}
            title="Your live location"
            description="Your current position"
          >
            <View
              style={
                styles.workerLiveMarkerContainer
              }
            >
              <View
                style={
                  styles.workerLiveLabel
                }
              >
                <AppText
                  variant="caption"
                  weight="bold"
                  style={
                    styles.workerLiveLabelText
                  }
                >
                  YOU
                </AppText>
              </View>

              <View
                style={
                  styles.workerPulse
                }
              />

              <View
                style={
                  styles.workerMarker
                }
              >
                <AppIcon
                  name="profile"
                  role="worker"
                  size="sm"
                  color={
                    Colors.textInverse
                  }
                />
              </View>
            </View>
          </Marker>
        ) : null}
      </MapView>

      {/* ========================================================
          HEADER
      ======================================================== */}

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
          style={({
            pressed,
          }) => [
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
            variant="bodyMedium"
            weight="bold"
            numberOfLines={1}
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

      {/* ========================================================
          IN-PROGRESS LIVE STATUS

          Only relevant when worker travels.
      ======================================================== */}

      {workerTravels &&
      serviceInProgress ? (
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
              styles.statusIndicator,

              workerLocation
                ? styles.statusIndicatorLive
                : styles.statusIndicatorWaiting,
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
                workerLocation
                  ? styles.statusTitleLive
                  : styles.statusTitleWaiting
              }
            >
              {workerLocation
                ? "LIVE LOCATION ON"
                : "STARTING LIVE LOCATION"}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.statusText
              }
            >
              {workerLocation
                ? `Your location is being shared while you travel to ${customerName}.`
                : "Your live position will appear here when location sharing starts."}
            </AppText>
          </View>
        </View>
      ) : null}

      {/* ========================================================
          MAP CONTROLS
      ======================================================== */}

      <View
        style={[
          styles.locationButtons,

          {
            bottom:
              insets.bottom +
              (workerTravels
                ? 250
                : 175),
          },
        ]}
      >
        <MapControlButton
          icon="location"
          color={
            workerTravels
              ? Colors.info
              : WorkerColors.primary
          }
          accessibilityLabel={
            workerTravels
              ? "Show customer service location"
              : "Show your service location"
          }
          onPress={
            handleServiceLocation
          }
        />

        {showWorkerLivePosition &&
        workerLocation ? (
          <>
            <MapControlButton
              icon="profile"
              color={
                WorkerColors.primary
              }
              accessibilityLabel="Show your live location"
              onPress={
                handleWorkerLocation
              }
            />

            <MapControlButton
              icon="locate"
              color={
                Colors.textPrimary
              }
              accessibilityLabel="Show your location and customer destination"
              onPress={
                handleShowBoth
              }
            />
          </>
        ) : null}
      </View>

      {/* ========================================================
          BOTTOM CARD
      ======================================================== */}

      <View
        style={[
          styles.bottomCard,

          {
            bottom:
              insets.bottom +
              FixxamTokens.spacing.md,
          },
        ]}
      >
        {/* ======================================================
            LOCATION
        ====================================================== */}

        <View
          style={
            styles.locationRow
          }
        >
          <View
            style={[
              styles.bottomIcon,

              customerTravels
                ? styles.bottomIconWorker
                : styles.bottomIconCustomer,
            ]}
          >
            <AppIcon
              name="location"
              size="sm"
              color={
                customerTravels
                  ? WorkerColors.primary
                  : Colors.info
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
              {address ||
                destinationLabel}
            </AppText>
          </View>

          {!mapReady ? (
            <AppLoader
              role="worker"
              size="sm"
            />
          ) : null}
        </View>

        {/* ======================================================
            WORKER -> CUSTOMER
        ====================================================== */}

        {workerTravels ? (
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
                  role="worker"
                  size="xs"
                  color={
                    WorkerColors.primary
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
                  You are going to {customerName}
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.travelText
                  }
                >
                  This pin is the customer&apos;s service location.
                  Travel to this address to provide the service.
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
              accessibilityLabel="Get directions to customer service location"
              accessibilityState={{
                disabled:
                  openingDirections,
              }}
              style={({
                pressed,
              }) => [
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
                  name="location"
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

        {/* ======================================================
            CUSTOMER -> WORKER
        ====================================================== */}

        {customerTravels ? (
          <View
            style={
              styles.travelExplanation
            }
          >
            <View
              style={[
                styles.travelIcon,
                styles.customerComingIcon,
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
                {customerName} will come to you
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.travelText
                }
              >
                This pin is your service location. The customer
                will travel to this address.
              </AppText>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

/* ==============================================================
   MAP CONTROL
============================================================== */

const MapControlButton =
  memo(
    function MapControlButton({
      icon,
      color,
      accessibilityLabel,
      onPress,
    }: {
      icon:
        | "location"
        | "profile"
        | "locate";

      color: string;

      accessibilityLabel: string;

      onPress: () => void;
    }) {
      return (
        <Pressable
          onPress={
            onPress
          }
          accessibilityRole="button"
          accessibilityLabel={
            accessibilityLabel
          }
          style={({
            pressed,
          }) => [
            styles.mapControlButton,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppIcon
            name={
              icon
            }
            size="sm"
            color={
              color
            }
          />
        </Pressable>
      );
    },
  );

MapControlButton.displayName =
  "WorkerMapControlButton";

/* ==============================================================
   STATE
============================================================== */

function MapState({
  icon,
  title,
  description,
  onBack,
}: MapStateProps) {
  return (
    <AppScreen
      role="worker"
      contentContainerStyle={
        styles.stateScreen
      }
    >
      <View
        style={
          styles.center
        }
      >
        <View
          style={
            styles.stateIcon
          }
        >
          <AppIcon
            name={
              icon
            }
            role="worker"
            size="lg"
            color={
              WorkerColors.primary
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
          {title}
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.stateText
          }
        >
          {description}
        </AppText>

        <Pressable
          onPress={
            onBack
          }
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({
            pressed,
          }) => [
            styles.stateButton,

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
            variant="bodyMedium"
            weight="bold"
            style={
              styles.stateButtonText
            }
          >
            Go Back
          </AppText>
        </Pressable>
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
       SCREEN
    ========================================================== */

    stateScreen: {
      flex: 1,

      backgroundColor:
        Colors.background,
    },

    mapContainer: {
      flex: 1,

      backgroundColor:
        Colors.disabledBackground,
    },

    map: {
      ...StyleSheet.absoluteFillObject,
    },

    /* ==========================================================
       HEADER
    ========================================================== */

    topOverlay: {
      position:
        "absolute",

      left:
        FixxamTokens.spacing.lg,

      right:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    iconButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

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
      marginTop: 4,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       STATUS
    ========================================================== */

    statusCard: {
      position:
        "absolute",

      left:
        FixxamTokens.spacing.lg,

      right:
        FixxamTokens.spacing.lg,

      minHeight: 62,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    statusIndicator: {
      width: 10,

      height: 10,

      flexShrink: 0,

      borderRadius:
        FixxamTokens.radius.full,
    },

    statusIndicatorLive: {
      backgroundColor:
        Colors.success,
    },

    statusIndicatorWaiting: {
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
      marginTop: 4,

      lineHeight: 16,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       DESTINATION MARKER
    ========================================================== */

    destinationMarkerContainer: {
      minWidth: 90,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    destinationMarkerLabel: {
      marginBottom: 5,

      paddingHorizontal: 9,

      paddingVertical: 4,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    destinationMarkerLabelText: {
      fontSize: 10,

      color:
        Colors.textPrimary,
    },

    destinationMarker: {
      width: 46,

      height: 46,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 3,

      borderColor:
        Colors.surface,

      borderRadius:
        FixxamTokens.radius.full,

      ...FixxamTokens.shadow.card,
    },

    customerServiceMarker: {
      backgroundColor:
        Colors.info,
    },

    workerServiceMarker: {
      backgroundColor:
        WorkerColors.primary,
    },

    markerTip: {
      width: 12,

      height: 12,

      marginTop: -7,

      transform: [
        {
          rotate: "45deg",
        },
      ],
    },

    customerServiceMarkerTip: {
      backgroundColor:
        Colors.info,
    },

    workerServiceMarkerTip: {
      backgroundColor:
        WorkerColors.primary,
    },

    /* ==========================================================
       WORKER LIVE MARKER
    ========================================================== */

    workerLiveMarkerContainer: {
      minWidth: 72,

      minHeight: 80,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    workerLiveLabel: {
      marginBottom: 5,

      paddingHorizontal: 9,

      paddingVertical: 4,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    workerLiveLabelText: {
      fontSize: 10,

      color:
        WorkerColors.primary,
    },

    workerPulse: {
      position:
        "absolute",

      bottom: 0,

      width: 58,

      height: 58,

      borderWidth: 2,

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.full,

      opacity: 0.2,
    },

    workerMarker: {
      width: 44,

      height: 44,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 3,

      borderColor:
        Colors.surface,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primary,

      ...FixxamTokens.shadow.card,
    },

    /* ==========================================================
       MAP CONTROLS
    ========================================================== */

    locationButtons: {
      position:
        "absolute",

      right:
        FixxamTokens.spacing.lg,

      gap:
        FixxamTokens.spacing.sm,
    },

    mapControlButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ==========================================================
       BOTTOM CARD
    ========================================================== */

    bottomCard: {
      position:
        "absolute",

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

    locationRow: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    bottomIcon: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,
    },

    bottomIconCustomer: {
      backgroundColor:
        Colors.infoSoft,
    },

    bottomIconWorker: {
      backgroundColor:
        WorkerColors.primarySoft,
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

    /* ==========================================================
       EXPLANATION
    ========================================================== */

    travelExplanation: {
      marginTop:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderTopWidth:
        StyleSheet.hairlineWidth,

      borderTopColor:
        Colors.border,
    },

    travelIcon: {
      width: 38,

      height: 38,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    customerComingIcon: {
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
      marginTop: 4,

      lineHeight: 16,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       GET DIRECTIONS
    ========================================================== */

    primaryAction: {
      width: "100%",

      minHeight: 48,

      marginTop:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primary,
    },

    primaryActionDisabled: {
      opacity: 0.65,
    },

    primaryActionText: {
      color:
        Colors.textInverse,
    },

    /* ==========================================================
       STATES
    ========================================================== */

    center: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.xxl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textSecondary,
    },

    stateIcon: {
      width: 60,

      height: 60,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    stateTitle: {
      marginTop:
        FixxamTokens.spacing.lg,

      color:
        Colors.textPrimary,
    },

    stateText: {
      maxWidth: 340,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    stateButton: {
      minHeight: 48,

      marginTop:
        FixxamTokens.spacing.xl,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primary,
    },

    stateButtonText: {
      color:
        Colors.textInverse,
    },

    /* ==========================================================
       INTERACTION
    ========================================================== */

    pressed: {
      opacity: 0.72,
    },
  });