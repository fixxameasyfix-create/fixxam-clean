import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
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
  Region,
} from "react-native-maps";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import {
  AppButton,
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

  address?: string | null;

  latitude?: number | null;

  longitude?: number | null;

  location?:
    | BookingLocation
    | null;

  /*
   * Current booking schema.
   */
  workerLiveLocation?:
    | FirestoreCoordinate
    | null;

  /*
   * Legacy compatibility.
   */
  liveLocation?:
    | FirestoreCoordinate
    | null;

  status?: string;
};

type RouteParams = {
  orderId?:
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
    Array.isArray(value)
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

function getCustomerCoordinate(
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

/* ==============================================================
   SCREEN
============================================================== */

export default function WorkerMapScreen() {
  const insets =
    useSafeAreaInsets();

  const params =
    useLocalSearchParams<RouteParams>();

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
     LOCATION STATE
  ============================================================ */

  const [
    customerLocation,
    setCustomerLocation,
  ] =
    useState<
      Coordinate | null
    >(null);

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
    useState("");

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

  /* ============================================================
     MAP REF
  ============================================================ */

  const mapRef =
    useRef<MapView | null>(
      null,
    );

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
     FIRESTORE BOOKING LISTENER
  ============================================================ */

  useEffect(() => {
    if (!authReady) {
      return;
    }

    setCustomerLocation(
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
            setCustomerLocation(
              null,
            );

            setWorkerLocation(
              null,
            );

            setAddress(
              "",
            );

            setError(
              "This order no longer exists.",
            );

            setLoading(
              false,
            );

            return;
          }

          const data =
            snapshot.data() as BookingData;

          /* ================================================
             ACCESS
          ================================================ */

          const isCustomer =
            safeString(
              data.customerId,
            ) ===
            userId;

          const isWorker =
            safeString(
              data.workerId,
            ) ===
            userId;

          if (
            !isCustomer &&
            !isWorker
          ) {
            setCustomerLocation(
              null,
            );

            setWorkerLocation(
              null,
            );

            setAddress(
              "",
            );

            setError(
              "You do not have access to this order location.",
            );

            setLoading(
              false,
            );

            return;
          }

          /* ================================================
             CUSTOMER
          ================================================ */

          const customer =
            getCustomerCoordinate(
              data,
            );

          setCustomerLocation(
            customer,
          );

          /* ================================================
             WORKER
          ================================================ */

          const worker =
            getWorkerLiveLocation(
              data,
            );

          setWorkerLocation(
            worker,
          );

          /* ================================================
             ADDRESS
          ================================================ */

          setAddress(
            getBookingAddress(
              data,
            ),
          );

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
    userId,
  ]);

  /* ============================================================
     INITIAL REGION
  ============================================================ */

  const initialRegion =
    useMemo<
      Region | undefined
    >(
      () => {
        if (
          !customerLocation
        ) {
          return undefined;
        }

        return {
          latitude:
            customerLocation.latitude,

          longitude:
            customerLocation.longitude,

          latitudeDelta:
            0.025,

          longitudeDelta:
            0.025,
        };
      },
      [
        customerLocation,
      ],
    );

  /* ============================================================
     FIT LOCATIONS
  ============================================================ */

  const fitLocations =
    useCallback(() => {
      const map =
        mapRef.current;

      if (!map) {
        return;
      }

      const coordinates: Coordinate[] =
        [];

      if (
        customerLocation
      ) {
        coordinates.push(
          customerLocation,
        );
      }

      if (
        workerLocation
      ) {
        coordinates.push({
          latitude:
            workerLocation.latitude,

          longitude:
            workerLocation.longitude,
        });
      }

      if (
        coordinates.length ===
        0
      ) {
        return;
      }

      if (
        coordinates.length ===
        1
      ) {
        map.animateToRegion(
          {
            latitude:
              coordinates[0]
                .latitude,

            longitude:
              coordinates[0]
                .longitude,

            latitudeDelta:
              0.015,

            longitudeDelta:
              0.015,
          },
          500,
        );

        return;
      }

      map.fitToCoordinates(
        coordinates,
        {
          edgePadding: {
            top: 190,

            right: 72,

            bottom: 210,

            left: 72,
          },

          animated:
            true,
        },
      );
    }, [
      customerLocation,
      workerLocation,
    ]);

  /* ============================================================
     AUTO FIT
  ============================================================ */

  useEffect(() => {
    if (
      !mapReady ||
      (
        !customerLocation &&
        !workerLocation
      )
    ) {
      return;
    }

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
    customerLocation,
    fitLocations,
    mapReady,
    workerLocation,
  ]);

  /* ============================================================
     ACTIONS
  ============================================================ */

  const handleBack =
    useCallback(() => {
      router.back();
    }, []);

  const handleCustomerLocation =
    useCallback(() => {
      const map =
        mapRef.current;

      if (
        !map ||
        !customerLocation
      ) {
        return;
      }

      map.animateToRegion(
        {
          latitude:
            customerLocation.latitude,

          longitude:
            customerLocation.longitude,

          latitudeDelta:
            0.012,

          longitudeDelta:
            0.012,
        },
        500,
      );
    }, [
      customerLocation,
    ]);

  const handleWorkerLocation =
    useCallback(() => {
      const map =
        mapRef.current;

      if (
        !map ||
        !workerLocation
      ) {
        return;
      }

      map.animateToRegion(
        {
          latitude:
            workerLocation.latitude,

          longitude:
            workerLocation.longitude,

          latitudeDelta:
            0.012,

          longitudeDelta:
            0.012,
        },
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
     ERROR
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
     NO CUSTOMER LOCATION
  ============================================================ */

  if (!initialRegion) {
    return (
      <MapState
        icon="location"
        title="No service location"
        description="This order does not have a valid customer location."
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
        style={
          styles.map
        }
        provider={
          PROVIDER_GOOGLE
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
        showsCompass={
          false
        }
        toolbarEnabled={
          false
        }
        rotateEnabled
        pitchEnabled
        onMapReady={() =>
          setMapReady(
            true,
          )
        }
      >
        {/* ======================================================
            CUSTOMER MARKER
        ====================================================== */}

        {customerLocation ? (
          <Marker
            coordinate={
              customerLocation
            }
            title="Customer"
            description={
              address ||
              "Service location"
            }
          >
            <View
              style={
                styles.customerMarker
              }
            >
              <AppIcon
                name="home"
                size="sm"
                color={
                  Colors.textInverse
                }
              />
            </View>
          </Marker>
        ) : null}

        {/* ======================================================
            WORKER MARKER
        ====================================================== */}

        {workerLocation ? (
          <Marker
            coordinate={{
              latitude:
                workerLocation.latitude,

              longitude:
                workerLocation.longitude,
            }}
            title="Worker"
            description="Your live location"
          >
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
          </Marker>
        ) : null}
      </MapView>

      {/* ========================================================
          TOP OVERLAY
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
        <View
          style={
            styles.headerRow
          }
        >
          <AppButton
            title=""
            role="worker"
            variant="outline"
            size="sm"
            leftIconName="back"
            onPress={
              handleBack
            }
            style={
              styles.backControl
            }
          />

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
              Service Location
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={
                styles.subtitle
              }
            >
              {workerLocation
                ? "Your live location is active"
                : "Customer service location"}
            </AppText>
          </View>
        </View>

        {/* ======================================================
            STATUS
        ====================================================== */}

        <View
          style={
            styles.statusCard
          }
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
              numberOfLines={1}
              style={
                styles.statusTitle
              }
            >
              {workerLocation
                ? "LIVE LOCATION ACTIVE"
                : "CUSTOMER LOCATION"}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={2}
              style={
                styles.statusText
              }
            >
              {workerLocation
                ? "Your current location is being updated on this order."
                : "Your live location is not available yet."}
            </AppText>
          </View>
        </View>
      </View>

      {/* ========================================================
          MAP CONTROLS
      ======================================================== */}

      <View
        pointerEvents="box-none"
        style={[
          styles.locationButtons,

          {
            bottom:
              insets.bottom +
              128,
          },
        ]}
      >
        <MapControlButton
          icon="home"
          color={
            Colors.info
          }
          accessibilityLabel="Show customer location"
          onPress={
            handleCustomerLocation
          }
        />

        {workerLocation ? (
          <>
            <MapControlButton
              icon="profile"
              color={
                WorkerColors.primary
              }
              accessibilityLabel="Show worker location"
              onPress={
                handleWorkerLocation
              }
            />

            <MapControlButton
              icon="locate"
              color={
                Colors.textPrimary
              }
              accessibilityLabel="Show both locations"
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
        <View
          style={
            styles.bottomIcon
          }
        >
          <AppIcon
            name="location"
            size="sm"
            color={
              Colors.info
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
            weight="bold"
            numberOfLines={1}
            style={
              styles.bottomTitle
            }
          >
            Customer service location
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={2}
            style={
              styles.bottomAddress
            }
          >
            {address ||
              "Customer service location"}
          </AppText>
        </View>

        {!mapReady ? (
          <AppLoader
            role="worker"
            size="sm"
          />
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
        | "home"
        | "profile"
        | "locate";

      color: string;

      accessibilityLabel: string;

      onPress: () => void;
    }) {
      return (
        <AppButton
          title=""
          role="worker"
          variant="outline"
          size="sm"
          leftIconName={
            icon
          }
          accessibilityLabel={
            accessibilityLabel
          }
          onPress={
            onPress
          }
          style={
            styles.mapControlButton
          }
        />
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

        <AppButton
          title="Go Back"
          role="worker"
          variant="primary"
          leftIconName="back"
          onPress={
            onBack
          }
          style={
            styles.stateButton
          }
        />
      </View>
    </AppScreen>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
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
       TOP OVERLAY
    ========================================================== */

    topOverlay: {
      position:
        "absolute",

      left:
        FixxamTokens.spacing.md,

      right:
        FixxamTokens.spacing.md,
    },

    headerRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    backControl: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      minWidth:
        FixxamTokens.size.minimumTouchTarget,

      paddingHorizontal: 0,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    titleCard: {
      flex: 1,

      minWidth: 0,

      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

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

    /* ==========================================================
       STATUS
    ========================================================== */

    statusCard: {
      minHeight: 60,

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
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

    statusTitle: {
      color:
        Colors.textPrimary,
    },

    statusText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 16,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       MARKERS
    ========================================================== */

    customerMarker: {
      width: 42,

      height: 42,

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
        Colors.info,

      ...FixxamTokens.shadow.card,
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
        FixxamTokens.spacing.md,

      gap:
        FixxamTokens.spacing.sm,
    },

    mapControlButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      minWidth:
        FixxamTokens.size.minimumTouchTarget,

      paddingHorizontal: 0,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ==========================================================
       BOTTOM
    ========================================================== */

    bottomCard: {
      position:
        "absolute",

      left:
        FixxamTokens.spacing.md,

      right:
        FixxamTokens.spacing.md,

      minHeight: 76,

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

    bottomIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.infoSoft,
    },

    bottomContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    bottomTitle: {
      color:
        Colors.textPrimary,
    },

    bottomAddress: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 16,

      color:
        Colors.textSecondary,
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
      width:
        FixxamTokens.size.fabLarge,

      height:
        FixxamTokens.size.fabLarge,

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
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xl,
    },
  });