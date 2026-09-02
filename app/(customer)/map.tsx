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

type LiveLocation = {
  latitude: number;
  longitude: number;
  updatedAt?: unknown;
};

type BookingLocationData = {
  customerId?: string;

  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;

  liveLocation?: {
    latitude?: number | null;
    longitude?: number | null;
    updatedAt?: unknown;
  } | null;
};

/* ============================================================
   HELPERS
============================================================ */

function parseCoordinate(
  value: string | string[] | undefined,
): number | null {
  const raw =
    typeof value === "string"
      ? value
      : Array.isArray(value)
        ? value[0]
        : undefined;

  if (!raw) {
    return null;
  }

  const parsed = Number(raw);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function isValidCoordinate(
  latitude: number | null,
  longitude: number | null,
): boolean {
  return (
    latitude !== null &&
    longitude !== null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/* ============================================================
   SCREEN
============================================================ */

export default function CustomerLiveMapScreen() {
  const params =
    useLocalSearchParams<{
      orderId?: string | string[];
      latitude?: string | string[];
      longitude?: string | string[];
      address?: string | string[];
    }>();

  /* ==========================================================
     ORDER ID
  ========================================================== */

  const orderId =
    useMemo(() => {
      if (
        typeof params.orderId ===
        "string"
      ) {
        return params.orderId.trim();
      }

      if (
        Array.isArray(
          params.orderId,
        )
      ) {
        return (
          params.orderId[0]?.trim() ||
          ""
        );
      }

      return "";
    }, [params.orderId]);

  /* ==========================================================
     CUSTOMER LOCATION
  ========================================================== */

  const initialLatitude =
    useMemo(
      () =>
        parseCoordinate(
          params.latitude,
        ),
      [params.latitude],
    );

  const initialLongitude =
    useMemo(
      () =>
        parseCoordinate(
          params.longitude,
        ),
      [params.longitude],
    );

  /* ==========================================================
     ADDRESS
  ========================================================== */

  const address =
    useMemo(() => {
      if (
        typeof params.address ===
        "string"
      ) {
        return params.address;
      }

      if (
        Array.isArray(params.address)
      ) {
        return (
          params.address[0] || ""
        );
      }

      return "";
    }, [params.address]);

  /* ==========================================================
     MAP REF
  ========================================================== */

  const mapRef =
    useRef<MapView | null>(null);

  /* ==========================================================
     STATE
  ========================================================== */

  const [
    liveLocation,
    setLiveLocation,
  ] = useState<LiveLocation | null>(
    null,
  );

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
     INITIAL REGION
  ========================================================== */

  const initialRegion =
    useMemo<Region | undefined>(() => {
      if (
        !isValidCoordinate(
          initialLatitude,
          initialLongitude,
        )
      ) {
        return undefined;
      }

      return {
        latitude:
          initialLatitude as number,

        longitude:
          initialLongitude as number,

        latitudeDelta:
          0.01,

        longitudeDelta:
          0.01,
      };
    }, [
      initialLatitude,
      initialLongitude,
    ]);

  /* ==========================================================
     AUTH + PARAM VALIDATION
  ========================================================== */

  useEffect(() => {
    if (!auth.currentUser) {
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

    if (
      !isValidCoordinate(
        initialLatitude,
        initialLongitude,
      )
    ) {
      setLoading(false);

      setError(
        "This order does not have a valid service location.",
      );

      return;
    }

    setLoading(true);
    setError(null);
  }, [
    orderId,
    initialLatitude,
    initialLongitude,
  ]);

  /* ==========================================================
     LIVE WORKER LOCATION
  ========================================================== */

  useEffect(() => {
    const customerId =
      auth.currentUser?.uid;

    if (
      !customerId ||
      !orderId
    ) {
      return;
    }

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
            setLiveLocation(null);
            setLoading(false);

            setError(
              "This order no longer exists.",
            );

            return;
          }

          const data =
            snapshot.data() as BookingLocationData;

          /* ==================================================
             SECURITY CHECK
          ================================================== */

          if (
            data.customerId &&
            data.customerId !==
              customerId
          ) {
            setLiveLocation(null);
            setLoading(false);

            setError(
              "You do not have access to this order.",
            );

            return;
          }

          /* ==================================================
             WORKER LIVE LOCATION
          ================================================== */

          const workerLocation =
            data.liveLocation;

          const latitude =
            typeof workerLocation?.latitude ===
            "number"
              ? workerLocation.latitude
              : null;

          const longitude =
            typeof workerLocation?.longitude ===
            "number"
              ? workerLocation.longitude
              : null;

          if (
            isValidCoordinate(
              latitude,
              longitude,
            )
          ) {
            setLiveLocation({
              latitude:
                latitude as number,

              longitude:
                longitude as number,

              updatedAt:
                workerLocation?.updatedAt,
            });
          } else {
            setLiveLocation(null);
          }

          setLoading(false);
          setError(null);
        },

        (snapshotError) => {
          console.error(
            "CUSTOMER_LIVE_MAP_LISTENER_ERROR",
            snapshotError,
          );

          setLoading(false);

          setError(
            "Unable to load live location.",
          );
        },
      );

    return unsubscribe;
  }, [orderId]);

  /* ==========================================================
     AUTO FOLLOW WORKER
  ========================================================== */

  useEffect(() => {
    if (
      !liveLocation ||
      !mapReady
    ) {
      return;
    }

    mapRef.current?.animateToRegion(
      {
        latitude:
          liveLocation.latitude,

        longitude:
          liveLocation.longitude,

        latitudeDelta:
          0.01,

        longitudeDelta:
          0.01,
      },
      700,
    );
  }, [
    liveLocation,
    mapReady,
  ]);

  /* ==========================================================
     BACK
  ========================================================== */

  const handleBack =
    useCallback(() => {
      router.back();
    }, []);

  /* ==========================================================
     CENTER CUSTOMER
  ========================================================== */

  const handleCustomerLocation =
    useCallback(() => {
      if (
        !isValidCoordinate(
          initialLatitude,
          initialLongitude,
        )
      ) {
        return;
      }

      mapRef.current?.animateToRegion(
        {
          latitude:
            initialLatitude as number,

          longitude:
            initialLongitude as number,

          latitudeDelta:
            0.01,

          longitudeDelta:
            0.01,
        },
        500,
      );
    }, [
      initialLatitude,
      initialLongitude,
    ]);

  /* ==========================================================
     CENTER WORKER
  ========================================================== */

  const handleWorkerLocation =
    useCallback(() => {
      if (!liveLocation) {
        return;
      }

      mapRef.current?.animateToRegion(
        {
          latitude:
            liveLocation.latitude,

          longitude:
            liveLocation.longitude,

          latitudeDelta:
            0.01,

          longitudeDelta:
            0.01,
        },
        500,
      );
    }, [liveLocation]);

  /* ==========================================================
     SHOW BOTH LOCATIONS
  ========================================================== */

  const handleShowBoth =
    useCallback(() => {
      if (
        !isValidCoordinate(
          initialLatitude,
          initialLongitude,
        ) ||
        !liveLocation
      ) {
        return;
      }

      mapRef.current?.fitToCoordinates(
        [
          {
            latitude:
              initialLatitude as number,

            longitude:
              initialLongitude as number,
          },

          {
            latitude:
              liveLocation.latitude,

            longitude:
              liveLocation.longitude,
          },
        ],
        {
          edgePadding: {
            top: 180,
            right: 70,
            bottom: 210,
            left: 70,
          },

          animated: true,
        },
      );
    }, [
      initialLatitude,
      initialLongitude,
      liveLocation,
    ]);

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
          <Ionicons
            name="lock-closed-outline"
            size={34}
            color="#2563EB"
          />

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
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
     LOADING
  ========================================================== */

  if (
    loading &&
    !initialRegion
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

  /* ==========================================================
     ERROR
  ========================================================== */

  if (
    error &&
    !initialRegion
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
            accessibilityRole="button"
            accessibilityLabel="Go back"
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
    return null;
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
        onMapReady={() =>
          setMapReady(true)
        }
      >
        {/* ====================================================
            CUSTOMER LOCATION
        ==================================================== */}

        <Marker
          coordinate={{
            latitude:
              initialLatitude as number,

            longitude:
              initialLongitude as number,
          }}
          title="Service location"
          description={
            address ||
            "Customer service location"
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

        {/* ====================================================
            WORKER LIVE LOCATION
        ==================================================== */}

        {liveLocation && (
          <Marker
            coordinate={{
              latitude:
                liveLocation.latitude,

              longitude:
                liveLocation.longitude,
            }}
            title="Worker"
            description="Worker's live location"
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
            Live Location
          </AppText>

          <AppText
            style={
              styles.subtitle
            }
          >
            {liveLocation
              ? "Worker location is live"
              : "Waiting for worker location"}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          STATUS CARD
      ====================================================== */}

      <View
        style={
          styles.statusCard
        }
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
            weight="bold"
            style={
              styles.statusTitle
            }
          >
            {liveLocation
              ? "WORKER IS LIVE"
              : "WAITING FOR WORKER"}
          </AppText>

          <AppText
            style={
              styles.statusText
            }
          >
            {liveLocation
              ? "Worker location updates automatically."
              : "Live tracking will appear when the worker starts sharing location."}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          LOCATION BUTTONS
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
          accessibilityLabel="Center on service location"
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

        {liveLocation && (
          <>
            <Pressable
              onPress={
                handleWorkerLocation
              }
              accessibilityRole="button"
              accessibilityLabel="Center on worker"
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

            <Pressable
              onPress={
                handleShowBoth
              }
              accessibilityRole="button"
              accessibilityLabel="Show worker and service location"
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
          </>
        )}
      </View>

      {/* ======================================================
          BOTTOM ADDRESS
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
            Service location
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
      position: "relative",
    },

    workerPulse: {
      position: "absolute",
      width: 50,
      height: 50,
      borderRadius: 25,
      borderWidth: 2,
      borderColor:
        "#16A34A",
      opacity: 0.25,
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
       BOTTOM
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
       ERROR
    ======================================================== */

    center: {
      flex: 1,
      minHeight: 500,
      alignItems: "center",
      justifyContent: "center",
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

    /* ========================================================
       PRESS
    ======================================================== */

    buttonPressed: {
      opacity: 0.82,
      transform: [
        {
          scale: 0.985,
        },
      ],
    },
  });