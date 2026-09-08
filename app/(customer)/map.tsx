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

/* ============================================================
   TYPES
============================================================ */

type Coordinate = {
  latitude: number;

  longitude: number;
};

type LiveLocation =
  Coordinate & {
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

type LiveMapParams = {
  orderId?:
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
  if (
    Array.isArray(value)
  ) {
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
    getParamString(
      value,
    );

  if (!raw) {
    return null;
  }

  const parsed =
    Number(raw);

  return Number.isFinite(
    parsed,
  )
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
    typeof latitude ===
      "number" &&
    typeof longitude ===
      "number" &&
    Number.isFinite(
      latitude,
    ) &&
    Number.isFinite(
      longitude,
    ) &&
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

    latitudeDelta:
      0.01,

    longitudeDelta:
      0.01,
  };
}

/* ============================================================
   SCREEN
============================================================ */

export default function CustomerLiveMapScreen() {
  const insets =
    useSafeAreaInsets();

  const params =
    useLocalSearchParams<LiveMapParams>();

  const mapRef =
    useRef<MapView | null>(
      null,
    );

  /*
   * Only auto-frame the worker once.
   * Future live updates should not keep
   * stealing map control from the user.
   */
  const hasAutoFramedRef =
    useRef(false);

  /* ==========================================================
     ROUTE DATA
  ========================================================== */

  const orderId =
    useMemo(
      () =>
        getParamString(
          params.orderId,
        ),
      [
        params.orderId,
      ],
    );

  const routeLatitude =
    useMemo(
      () =>
        parseCoordinate(
          params.latitude,
        ),
      [
        params.latitude,
      ],
    );

  const routeLongitude =
    useMemo(
      () =>
        parseCoordinate(
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
        getParamString(
          params.address,
        ),
      [
        params.address,
      ],
    );

  /* ==========================================================
     STATE
  ========================================================== */

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

  /* ==========================================================
     BOOKING + SECURITY + LIVE LOCATION
  ========================================================== */

  useEffect(() => {
    const customerId =
      normalizeString(
        auth.currentUser?.uid,
      );

    hasAutoFramedRef.current =
      false;

    setLiveLocation(
      null,
    );

    setServiceLocation(
      null,
    );

    setServiceAddress(
      "",
    );

    setMapReady(
      false,
    );

    setFatalError(
      null,
    );

    if (!customerId) {
      setLoading(
        false,
      );

      setFatalError(
        "Please sign in to view this location.",
      );

      return;
    }

    if (!orderId) {
      setLoading(
        false,
      );

      setFatalError(
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

          /* ================================================
             STRICT OWNERSHIP CHECK

             Missing customerId is not treated as permission.
             Firestore Security Rules must enforce this too.
          ================================================ */

          const bookingCustomerId =
            normalizeString(
              data.customerId,
            );

          if (
            !bookingCustomerId ||
            bookingCustomerId !==
              customerId
          ) {
            setLoading(
              false,
            );

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

          /* ================================================
             SERVICE LOCATION

             Firestore is preferred.
             Route coordinates are only a fallback after
             ownership has been verified.
          ================================================ */

          const bookingLocation =
            createCoordinate(
              data.latitude,
              data.longitude,
            );

          const resolvedLocation =
            bookingLocation ??
            routeLocation;

          if (
            !resolvedLocation
          ) {
            setLoading(
              false,
            );

            setFatalError(
              "This order does not have a valid service location.",
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
            resolvedLocation,
          );

          setServiceAddress(
            normalizeString(
              data.address,
            ) ||
              routeAddress ||
              "Customer service location",
          );

          /* ================================================
             WORKER LIVE LOCATION
          ================================================ */

          const workerLocation =
            data.liveLocation;

          const resolvedLiveLocation =
            createCoordinate(
              workerLocation
                ?.latitude,

              workerLocation
                ?.longitude,
            );

          if (
            resolvedLiveLocation
          ) {
            setLiveLocation({
              ...resolvedLiveLocation,

              updatedAt:
                workerLocation
                  ?.updatedAt,
            });
          } else {
            setLiveLocation(
              null,
            );
          }

          setFatalError(
            null,
          );

          setLoading(
            false,
          );
        },

        snapshotError => {
          console.error(
            "CUSTOMER_LIVE_MAP_LISTENER_ERROR:",
            snapshotError,
          );

          setLoading(
            false,
          );

          setFatalError(
            "Unable to load live location.",
          );

          setLiveLocation(
            null,
          );

          setServiceLocation(
            null,
          );
        },
      );

    return unsubscribe;
  }, [
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
      [
        serviceLocation,
      ],
    );

  /* ==========================================================
     AUTO FRAME FIRST LIVE LOCATION
  ========================================================== */

  useEffect(() => {
    if (
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

            bottom: 180,

            left: 70,
          },

          animated:
            true,
        },
      );
  }, [
    liveLocation,
    mapReady,
    serviceLocation,
  ]);

  /* ==========================================================
     BACK
  ========================================================== */

  const handleBack =
    useCallback(() => {
      router.back();
    }, []);

  /* ==========================================================
     CENTER SERVICE LOCATION
  ========================================================== */

  const handleCustomerLocation =
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

  /* ==========================================================
     CENTER WORKER
  ========================================================== */

  const handleWorkerLocation =
    useCallback(() => {
      if (
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
    ]);

  /* ==========================================================
     SHOW BOTH
  ========================================================== */

  const handleShowBoth =
    useCallback(() => {
      if (
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

              bottom: 180,

              left: 70,
            },

            animated:
              true,
          },
        );
    }, [
      liveLocation,
      serviceLocation,
    ]);

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
          Loading map...
        </AppText>
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
    const signedIn =
      Boolean(
        auth.currentUser,
      );

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
            name={
              signedIn
                ? "location"
                : "lock"
            }
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
          {signedIn
            ? "Location unavailable"
            : "Sign in required"}
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
          style={({
            pressed,
          }) => [
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
        onMapReady={() => {
          setMapReady(
            true,
          );
        }}
      >
        {/* ====================================================
            SERVICE LOCATION
        ==================================================== */}

        <Marker
          coordinate={
            serviceLocation
          }
          title="Service location"
          description={
            serviceAddress ||
            "Customer service location"
          }
          tracksViewChanges={
            false
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

        {/* ====================================================
            WORKER
        ==================================================== */}

        {liveLocation ? (
          <Marker
            coordinate={{
              latitude:
                liveLocation.latitude,

              longitude:
                liveLocation.longitude,
            }}
            title="Worker"
            description="Worker's live location"
            tracksViewChanges={
              false
            }
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
            variant="body"
            weight="bold"
            style={
              styles.title
            }
          >
            Live Location
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
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
          STATUS
      ====================================================== */}

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
            style={[
              styles.statusTitle,

              liveLocation
                ? styles.statusTitleLive
                : styles.statusTitleWaiting,
            ]}
          >
            {liveLocation
              ? "WORKER IS LIVE"
              : "WAITING FOR WORKER"}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
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
          MAP CONTROLS
      ====================================================== */}

      <View
        style={[
          styles.locationButtons,

          {
            bottom:
              insets.bottom +
              124,
          },
        ]}
      >
        <MapControlButton
          icon="home"
          color={
            CustomerColors.primary
          }
          label="Center on service location"
          onPress={
            handleCustomerLocation
          }
        />

        {liveLocation ? (
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
              label="Show worker and service location"
              onPress={
                handleShowBoth
              }
            />
          </>
        ) : null}
      </View>

      {/* ======================================================
          ADDRESS CARD
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
            weight="bold"
            style={
              styles.bottomTitle
            }
          >
            Service location
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={2}
            style={
              styles.bottomAddress
            }
          >
            {serviceAddress ||
              "Customer service location"}
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
    </View>
  );
}

/* ============================================================
   MAP CONTROL
============================================================ */

function MapControlButton({
  icon,
  color,
  label,
  onPress,
}: {
  icon:
    | "home"
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
      style={({
        pressed,
      }) => [
        styles.locationButton,

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
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       STATE SCREEN
    ======================================================== */

    stateScreen: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.background,
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       MAP
    ======================================================== */

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
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       STATUS
    ======================================================== */

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

    statusTitle: {},

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
       MARKERS
    ======================================================== */

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
        CustomerColors.primary,
    },

    workerMarker: {
      width: 44,

      height: 44,

      position:
        "relative",

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
        Colors.success,
    },

    workerPulse: {
      position:
        "absolute",

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
      position:
        "absolute",

      right:
        FixxamTokens.spacing.lg,

      gap:
        FixxamTokens.spacing.sm,
    },

    locationButton: {
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

    /* ========================================================
       BOTTOM CARD
    ======================================================== */

    bottomCard: {
      position:
        "absolute",

      left:
        FixxamTokens.spacing.lg,

      right:
        FixxamTokens.spacing.lg,

      minHeight: 78,

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

      backgroundColor:
        CustomerColors.primarySoft,
    },

    bottomContent: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
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

    /* ========================================================
       ERROR
    ======================================================== */

    errorIcon: {
      width:
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

      alignItems:
        "center",

      justifyContent:
        "center",

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
        FixxamTokens.size.buttonHeight,

      marginTop:
        FixxamTokens.spacing.lg,

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
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    errorBackText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       PRESS
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