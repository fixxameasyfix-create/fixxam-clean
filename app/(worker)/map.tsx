import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  auth,
  db,
} from "@/firebase/config";

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

  location?: BookingLocation | null;

  liveLocation?: {
    latitude?: number | null;
    longitude?: number | null;
    updatedAt?: unknown;
  } | null;

  status?: string;
};

/* ============================================================
   HELPERS
============================================================ */

function resolveParam(
  value: string | string[] | undefined,
): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value[0]?.trim() || "";
  }

  return "";
}

function isValidCoordinate(
  latitude: unknown,
  longitude: unknown,
): latitude is number {
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

function getCustomerCoordinate(
  data: BookingData,
): Coordinate | null {
  const directLatitude =
    data.latitude;

  const directLongitude =
    data.longitude;

  if (
    isValidCoordinate(
      directLatitude,
      directLongitude,
    )
  ) {
    return {
      latitude: directLatitude,
      longitude:
        directLongitude as number,
    };
  }

  const nestedLatitude =
    data.location?.latitude;

  const nestedLongitude =
    data.location?.longitude;

  if (
    isValidCoordinate(
      nestedLatitude,
      nestedLongitude,
    )
  ) {
    return {
      latitude: nestedLatitude,
      longitude:
        nestedLongitude as number,
    };
  }

  return null;
}

function getWorkerLiveLocation(
  data: BookingData,
): LiveLocation | null {
  const latitude =
    data.liveLocation?.latitude;

  const longitude =
    data.liveLocation?.longitude;

  if (
    !isValidCoordinate(
      latitude,
      longitude,
    )
  ) {
    return null;
  }

  return {
    latitude,
    longitude:
      longitude as number,
    updatedAt:
      data.liveLocation
        ?.updatedAt,
  };
}

/* ============================================================
   SCREEN
============================================================ */

export default function WorkerMapScreen() {
  const params =
    useLocalSearchParams<{
      orderId?: string | string[];
    }>();

  const orderId = useMemo(
    () =>
      resolveParam(
        params.orderId,
      ),
    [params.orderId],
  );

  /* ==========================================================
     STATE
  ========================================================== */

  const [
    customerLocation,
    setCustomerLocation,
  ] = useState<Coordinate | null>(
    null,
  );

  const [
    workerLocation,
    setWorkerLocation,
  ] = useState<LiveLocation | null>(
    null,
  );

  const [
    address,
    setAddress,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    mapReady,
    setMapReady,
  ] = useState(false);

  /* ==========================================================
     MAP REF
  ========================================================== */

  const mapRef =
    useRef<MapView | null>(null);

  /* ==========================================================
     FIRESTORE LISTENER
  ========================================================== */

  useEffect(() => {
    const currentUser =
      auth.currentUser;

    if (!currentUser) {
      setLoading(false);

      setError(
        "Please sign in to view this location.",
      );

      return;
    }

    if (!orderId) {
      setLoading(false);

      setError(
        "This order could not be found.",
      );

      return;
    }

    setLoading(true);
    setError(null);

    const bookingRef = doc(
      db,
      "bookings",
      orderId,
    );

    const unsubscribe =
      onSnapshot(
        bookingRef,

        (snapshot) => {
          if (!snapshot.exists()) {
            setCustomerLocation(null);
            setWorkerLocation(null);
            setLoading(false);

            setError(
              "This order no longer exists.",
            );

            return;
          }

          const data =
            snapshot.data() as BookingData;

          /* ==================================================
             ACCESS CHECK
          ================================================== */

          const isCustomer =
            data.customerId ===
            currentUser.uid;

          const isWorker =
            data.workerId ===
            currentUser.uid;

          if (
            !isCustomer &&
            !isWorker
          ) {
            setCustomerLocation(null);
            setWorkerLocation(null);
            setLoading(false);

            setError(
              "You do not have access to this order location.",
            );

            return;
          }

          /* ==================================================
             CUSTOMER LOCATION
          ================================================== */

          const customer =
            getCustomerCoordinate(
              data,
            );

          setCustomerLocation(
            customer,
          );

          /* ==================================================
             WORKER LIVE LOCATION
          ================================================== */

          const worker =
            getWorkerLiveLocation(
              data,
            );

          setWorkerLocation(
            worker,
          );

          /* ==================================================
             ADDRESS
          ================================================== */

          const resolvedAddress =
            typeof data.address ===
            "string"
              ? data.address.trim()
              : typeof data.location
                    ?.address ===
                  "string"
                ? data.location.address.trim()
                : "";

          setAddress(
            resolvedAddress,
          );

          setLoading(false);
          setError(null);
        },

        (snapshotError) => {
          console.error(
            "WORKER_MAP_LISTENER_ERROR",
            snapshotError,
          );

          setLoading(false);

          setError(
            "Unable to load this order location.",
          );
        },
      );

    return unsubscribe;
  }, [orderId]);

  /* ==========================================================
     INITIAL REGION
  ========================================================== */

  const initialRegion =
    useMemo<Region | undefined>(() => {
      if (!customerLocation) {
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
    }, [customerLocation]);

  /* ==========================================================
     FIT ALL LOCATIONS
  ========================================================== */

  const fitLocations =
    useCallback(() => {
      if (!mapRef.current) {
        return;
      }

      const coordinates: Coordinate[] =
        [];

      if (customerLocation) {
        coordinates.push(
          customerLocation,
        );
      }

      if (workerLocation) {
        coordinates.push({
          latitude:
            workerLocation.latitude,

          longitude:
            workerLocation.longitude,
        });
      }

      if (coordinates.length === 0) {
        return;
      }

      if (coordinates.length === 1) {
        mapRef.current.animateToRegion(
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

      mapRef.current.fitToCoordinates(
        coordinates,
        {
          edgePadding: {
            top: 180,
            right: 70,
            bottom: 220,
            left: 70,
          },

          animated: true,
        },
      );
    }, [
      customerLocation,
      workerLocation,
    ]);

  /* ==========================================================
     AUTO FIT WHEN LOCATION CHANGES
  ========================================================== */

  useEffect(() => {
    if (!mapReady) {
      return;
    }

    if (
      !customerLocation &&
      !workerLocation
    ) {
      return;
    }

    const timer =
      setTimeout(() => {
        fitLocations();
      }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [
    mapReady,
    customerLocation,
    workerLocation,
    fitLocations,
  ]);

  /* ==========================================================
     BACK
  ========================================================== */

  const handleBack =
    useCallback(() => {
      router.back();
    }, []);

  /* ==========================================================
     CUSTOMER LOCATION
  ========================================================== */

  const handleCustomerLocation =
    useCallback(() => {
      if (
        !mapRef.current ||
        !customerLocation
      ) {
        return;
      }

      mapRef.current.animateToRegion(
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
    }, [customerLocation]);

  /* ==========================================================
     WORKER LOCATION
  ========================================================== */

  const handleWorkerLocation =
    useCallback(() => {
      if (
        !mapRef.current ||
        !workerLocation
      ) {
        return;
      }

      mapRef.current.animateToRegion(
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
    }, [workerLocation]);

  /* ==========================================================
     BOTH LOCATIONS
  ========================================================== */

  const handleShowBoth =
    useCallback(() => {
      fitLocations();
    }, [fitLocations]);

  /* ==========================================================
     AUTH ERROR
  ========================================================== */

  if (!auth.currentUser) {
    return (
      <AppScreen
        contentContainerStyle={
          styles.screen
        }
      >
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
              name="lock-closed-outline"
              size={30}
              color="#2563EB"
            />
          </View>

          <AppText
            weight="bold"
            style={
              styles.errorTitle
            }
          >
            Sign in required
          </AppText>

          <AppText
            center
            style={
              styles.errorText
            }
          >
            Please sign in to view this
            location.
          </AppText>

          <Pressable
            onPress={
              handleBack
            }
            style={({ pressed }) => [
              styles.backButton,
              pressed &&
                styles.buttonPressed,
            ]}
          >
            <Ionicons
              name="arrow-back"
              size={17}
              color="#FFFFFF"
            />

            <AppText
              weight="bold"
              style={
                styles.backButtonText
              }
            >
              GO BACK
            </AppText>
          </Pressable>
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
     LOADING / ERROR
  ========================================================== */

  if (
    loading &&
    !customerLocation
  ) {
    return (
      <AppScreen
        contentContainerStyle={
          styles.screen
        }
      >
        <View
          style={
            styles.center
          }
        >
          <ActivityIndicator
            size="small"
            color="#2563EB"
          />

          <AppText
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

  if (
    error &&
    !customerLocation
  ) {
    return (
      <AppScreen
        contentContainerStyle={
          styles.screen
        }
      >
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
              name="location-outline"
              size={30}
              color="#2563EB"
            />
          </View>

          <AppText
            weight="bold"
            style={
              styles.errorTitle
            }
          >
            Location unavailable
          </AppText>

          <AppText
            center
            style={
              styles.errorText
            }
          >
            {error}
          </AppText>

          <Pressable
            onPress={
              handleBack
            }
            style={({ pressed }) => [
              styles.backButton,
              pressed &&
                styles.buttonPressed,
            ]}
          >
            <Ionicons
              name="arrow-back"
              size={17}
              color="#FFFFFF"
            />

            <AppText
              weight="bold"
              style={
                styles.backButtonText
              }
            >
              GO BACK
            </AppText>
          </Pressable>
        </View>
      </AppScreen>
    );
  }

  if (!initialRegion) {
    return (
      <AppScreen
        contentContainerStyle={
          styles.screen
        }
      >
        <View
          style={
            styles.center
          }
        >
          <Ionicons
            name="location-outline"
            size={32}
            color="#64748B"
          />

          <AppText
            weight="bold"
            style={
              styles.emptyTitle
            }
          >
            No service location
          </AppText>

          <AppText
            center
            style={
              styles.emptyText
            }
          >
            This order does not have a
            valid customer location.
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View
      style={
        styles.mapContainer
      }
    >
      <MapView
        ref={mapRef}
        style={
          styles.map
        }
        provider={
          PROVIDER_GOOGLE
        }
        initialRegion={
          initialRegion
        }
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        rotateEnabled
        pitchEnabled
        onMapReady={() =>
          setMapReady(true)
        }
      >
        {/* ==================================================
            CUSTOMER LOCATION
        ================================================== */}

        {customerLocation && (
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
              <Ionicons
                name="home"
                size={20}
                color="#FFFFFF"
              />
            </View>
          </Marker>
        )}

        {/* ==================================================
            WORKER LIVE LOCATION
        ================================================== */}

        {workerLocation && (
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
              <Ionicons
                name="person"
                size={19}
                color="#FFFFFF"
              />
            </View>
          </Marker>
        )}
      </MapView>

      {/* ======================================================
          TOP HEADER
      ====================================================== */}

      <View
        pointerEvents="box-none"
        style={
          styles.topOverlay
        }
      >
        <Pressable
          onPress={
            handleBack
          }
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [
            styles.iconButton,
            pressed &&
              styles.buttonPressed,
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#0F172A"
          />
        </Pressable>

        <View
          style={
            styles.titleCard
          }
        >
          <AppText
            weight="bold"
            style={
              styles.title
            }
          >
            Service Location
          </AppText>

          <AppText
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
          LIVE STATUS
      ====================================================== */}

      <View
        style={
          styles.statusCard
        }
      >
        <View
          style={[
            styles.statusDot,
            workerLocation
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
            weight="bold"
            style={
              styles.statusTitle
            }
          >
            {workerLocation
              ? "LIVE LOCATION ACTIVE"
              : "CUSTOMER LOCATION"}
          </AppText>

          <AppText
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

      {/* ======================================================
          MAP CONTROLS
      ====================================================== */}

      <View
        style={
          styles.locationButtons
        }
      >
        <Pressable
          onPress={
            handleCustomerLocation
          }
          accessibilityRole="button"
          accessibilityLabel="Show customer location"
          style={({ pressed }) => [
            styles.locationButton,
            pressed &&
              styles.buttonPressed,
          ]}
        >
          <Ionicons
            name="home-outline"
            size={19}
            color="#2563EB"
          />
        </Pressable>

        {workerLocation && (
          <Pressable
            onPress={
              handleWorkerLocation
            }
            accessibilityRole="button"
            accessibilityLabel="Show worker location"
            style={({ pressed }) => [
              styles.locationButton,
              pressed &&
                styles.buttonPressed,
            ]}
          >
            <Ionicons
              name="person-outline"
              size={19}
              color="#16A34A"
            />
          </Pressable>
        )}

        {workerLocation && (
          <Pressable
            onPress={
              handleShowBoth
            }
            accessibilityRole="button"
            accessibilityLabel="Show both locations"
            style={({ pressed }) => [
              styles.locationButton,
              pressed &&
                styles.buttonPressed,
            ]}
          >
            <Ionicons
              name="scan-outline"
              size={19}
              color="#0F172A"
            />
          </Pressable>
        )}
      </View>

      {/* ======================================================
          BOTTOM SERVICE LOCATION
      ====================================================== */}

      <View
        style={
          styles.bottomCard
        }
      >
        <View
          style={
            styles.bottomIcon
          }
        >
          <Ionicons
            name="location"
            size={19}
            color="#2563EB"
          />
        </View>

        <View
          style={
            styles.bottomContent
          }
        >
          <AppText
            weight="bold"
            style={
              styles.bottomTitle
            }
          >
            Customer service location
          </AppText>

          <AppText
            numberOfLines={2}
            style={
              styles.bottomAddress
            }
          >
            {address ||
              "Customer service location"}
          </AppText>
        </View>

        {!mapReady && (
          <ActivityIndicator
            size="small"
            color="#2563EB"
          />
        )}
      </View>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor:
        "#F8FAFC",
    },

    mapContainer: {
      flex: 1,
      backgroundColor:
        "#E2E8F0",
    },

    map: {
      ...StyleSheet.absoluteFillObject,
    },

    /* ========================================================
       TOP
    ======================================================== */

    topOverlay: {
      position: "absolute",
      top: 52,
      left: 16,
      right: 16,
      flexDirection: "row",
      alignItems: "center",
    },

    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor:
        "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000000",
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      elevation: 4,
    },

    titleCard: {
      flex: 1,
      marginLeft: 10,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 14,
      backgroundColor:
        "#FFFFFF",
      shadowColor: "#000000",
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      elevation: 4,
    },

    title: {
      fontSize: 14,
      color: "#0F172A",
    },

    subtitle: {
      marginTop: 2,
      fontSize: 9.5,
      color: "#64748B",
    },

    /* ========================================================
       STATUS
    ======================================================== */

    statusCard: {
      position: "absolute",
      top: 116,
      left: 16,
      right: 16,
      minHeight: 60,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 15,
      backgroundColor:
        "#FFFFFF",
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#000000",
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      elevation: 4,
    },

    statusDot: {
      width: 11,
      height: 11,
      borderRadius: 6,
    },

    statusDotLive: {
      backgroundColor:
        "#16A34A",
    },

    statusDotWaiting: {
      backgroundColor:
        "#F59E0B",
    },

    statusContent: {
      flex: 1,
      marginLeft: 9,
    },

    statusTitle: {
      fontSize: 9.5,
      color: "#0F172A",
    },

    statusText: {
      marginTop: 2,
      fontSize: 9,
      lineHeight: 13,
      color: "#64748B",
    },

    /* ========================================================
       MARKERS
    ======================================================== */

    customerMarker: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor:
        "#2563EB",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 3,
      borderColor:
        "#FFFFFF",
    },

    workerMarker: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor:
        "#16A34A",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 3,
      borderColor:
        "#FFFFFF",
    },

    /* ========================================================
       LOCATION BUTTONS
    ======================================================== */

    locationButtons: {
      position: "absolute",
      right: 16,
      bottom: 166,
      gap: 8,
    },

    locationButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor:
        "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000000",
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      elevation: 4,
    },

    /* ========================================================
       BOTTOM CARD
    ======================================================== */

    bottomCard: {
      position: "absolute",
      left: 16,
      right: 16,
      bottom: 24,
      minHeight: 76,
      padding: 12,
      borderRadius: 18,
      backgroundColor:
        "#FFFFFF",
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#000000",
      shadowOpacity: 0.14,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 5,
    },

    bottomIcon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    bottomContent: {
      flex: 1,
      marginLeft: 10,
      marginRight: 8,
    },

    bottomTitle: {
      fontSize: 9.5,
      color: "#0F172A",
    },

    bottomAddress: {
      marginTop: 3,
      fontSize: 9.5,
      lineHeight: 14,
      color: "#64748B",
    },

    /* ========================================================
       ERROR / EMPTY
    ======================================================== */

    center: {
      flex: 1,
      minHeight: 500,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 30,
    },

    loadingText: {
      marginTop: 10,
      fontSize: 11,
      color: "#64748B",
    },

    errorContainer: {
      flex: 1,
      minHeight: 500,
      paddingHorizontal: 30,
      alignItems: "center",
      justifyContent: "center",
    },

    errorIcon: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    errorTitle: {
      marginTop: 14,
      fontSize: 17,
      color: "#0F172A",
    },

    errorText: {
      marginTop: 7,
      fontSize: 11.5,
      lineHeight: 18,
      color: "#64748B",
    },

    emptyTitle: {
      marginTop: 12,
      fontSize: 16,
      color: "#0F172A",
    },

    emptyText: {
      marginTop: 7,
      fontSize: 11,
      lineHeight: 17,
      color: "#64748B",
    },

    backButton: {
      marginTop: 18,
      minHeight: 42,
      paddingHorizontal: 16,
      borderRadius: 11,
      backgroundColor:
        "#2563EB",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },

    backButtonText: {
      fontSize: 9,
      color: "#FFFFFF",
    },

    buttonPressed: {
      opacity: 0.82,
      transform: [
        {
          scale: 0.985,
        },
      ],
    },
  });