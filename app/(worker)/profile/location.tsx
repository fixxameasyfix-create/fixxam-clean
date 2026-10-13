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
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  Stack,
} from "expo-router";

import * as Location from "expo-location";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import Toast from "react-native-toast-message";

import {
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type SavedLocation = {
  latitude: number;
  longitude: number;

  accuracy?: number | null;

  area?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;

  label?: string | null;

  source?: "device";
};

/* ============================================================
   HELPERS
============================================================ */

function cleanText(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function isFiniteNumber(
  value: unknown,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

function isValidLatitude(
  value: unknown,
): value is number {
  return (
    isFiniteNumber(value) &&
    value >= -90 &&
    value <= 90
  );
}

function isValidLongitude(
  value: unknown,
): value is number {
  return (
    isFiniteNumber(value) &&
    value >= -180 &&
    value <= 180
  );
}

function buildLocationLabel(
  values: Array<
    string | null | undefined
  >,
): string {
  const seen =
    new Set<string>();

  const parts =
    values
      .map((value) =>
        cleanText(value),
      )
      .filter(Boolean)
      .filter((value) => {
        const key =
          value.toLowerCase();

        if (seen.has(key)) {
          return false;
        }

        seen.add(key);

        return true;
      });

  return parts.join(", ");
}

function parseSavedLocation(
  value: unknown,
): SavedLocation | null {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return null;
  }

  const data =
    value as Record<
      string,
      unknown
    >;

  if (
    !isValidLatitude(
      data.latitude,
    ) ||
    !isValidLongitude(
      data.longitude,
    )
  ) {
    return null;
  }

  return {
    latitude:
      data.latitude,

    longitude:
      data.longitude,

    accuracy:
      isFiniteNumber(
        data.accuracy,
      )
        ? Math.max(
            0,
            data.accuracy,
          )
        : null,

    area:
      cleanText(
        data.area,
      ) || null,

    city:
      cleanText(
        data.city,
      ) || null,

    state:
      cleanText(
        data.state,
      ) || null,

    country:
      cleanText(
        data.country,
      ) || null,

    label:
      cleanText(
        data.label,
      ) || null,

    source:
      data.source ===
      "device"
        ? "device"
        : undefined,
  };
}

/* ============================================================
   TOAST
============================================================ */

function showErrorToast(
  title: string,
  message: string,
) {
  Toast.show({
    type: "error",
    text1: title,
    text2: message,
  });
}

function showSuccessToast(
  title: string,
  message: string,
) {
  Toast.show({
    type: "success",
    text1: title,
    text2: message,
  });
}

/* ============================================================
   SCREEN
============================================================ */

export default function WorkerLocationScreen() {
  const [
    userId,
    setUserId,
  ] = useState(
    auth.currentUser?.uid ?? "",
  );

  const [
    savedLocation,
    setSavedLocation,
  ] =
    useState<SavedLocation | null>(
      null,
    );

  const [
    loadingSavedLocation,
    setLoadingSavedLocation,
  ] = useState(true);

  const [
    locating,
    setLocating,
  ] = useState(false);

  const locationRequestInFlight =
    useRef(false);

  /* ==========================================================
     AUTH STATE
  ========================================================== */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (user) => {
          setUserId(
            user?.uid ?? "",
          );
        },
      );

    return unsubscribe;
  }, []);

  /* ==========================================================
     CURRENT SAVED LOCATION
  ========================================================== */

  useEffect(() => {
    if (!userId) {
      setSavedLocation(
        null,
      );

      setLoadingSavedLocation(
        false,
      );

      return;
    }

    setLoadingSavedLocation(
      true,
    );

    const userRef =
      doc(
        db,
        "users",
        userId,
      );

    const unsubscribe =
      onSnapshot(
        userRef,

        (snapshot) => {
          if (
            !snapshot.exists()
          ) {
            setSavedLocation(
              null,
            );

            setLoadingSavedLocation(
              false,
            );

            return;
          }

          const data =
            snapshot.data();

          setSavedLocation(
            parseSavedLocation(
              data.location,
            ),
          );

          setLoadingSavedLocation(
            false,
          );
        },

        (error) => {
          if (__DEV__) {
            console.error(
              "WORKER_LOCATION_LISTENER_ERROR:",
              error,
            );
          }

          setLoadingSavedLocation(
            false,
          );

          showErrorToast(
            "Unable to load location",
            "Fixxam could not load your saved location.",
          );
        },
      );

    return unsubscribe;
  }, [
    userId,
  ]);

  /* ==========================================================
     DISPLAY LOCATION
  ========================================================== */

  const currentLocationLabel =
    useMemo(() => {
      if (!savedLocation) {
        return "";
      }

      const savedLabel =
        cleanText(
          savedLocation.label,
        );

      if (savedLabel) {
        return savedLabel;
      }

      return (
        buildLocationLabel([
          savedLocation.area,
          savedLocation.city,
          savedLocation.state,
          savedLocation.country,
        ]) ||
        "Current location saved"
      );
    }, [
      savedLocation,
    ]);

  /* ==========================================================
     BACK
  ========================================================== */

  const handleBack =
    useCallback(() => {
      router.back();
    }, []);

  /* ==========================================================
     SETTINGS
  ========================================================== */

  const handleOpenSettings =
    useCallback(() => {
      Linking.openSettings().catch(
        (error) => {
          if (__DEV__) {
            console.error(
              "WORKER_LOCATION_SETTINGS_ERROR:",
              error,
            );
          }

          showErrorToast(
            "Unable to open settings",
            "Please open your device settings and allow location access for Fixxam.",
          );
        },
      );
    }, []);

  /* ==========================================================
     USE CURRENT LOCATION
  ========================================================== */

  const handleUseCurrentLocation =
    useCallback(async () => {
      if (
        locating ||
        locationRequestInFlight.current
      ) {
        return;
      }

      const user =
        auth.currentUser;

      if (!user?.uid) {
        showErrorToast(
          "Sign in required",
          "Please sign in again before updating your location.",
        );

        return;
      }

      locationRequestInFlight.current =
        true;

      setLocating(
        true,
      );

      try {
        /* ================================================
           DEVICE LOCATION SERVICES
        ================================================ */

        const servicesEnabled =
          await Location.hasServicesEnabledAsync();

        if (!servicesEnabled) {
          showErrorToast(
            "Turn on location",
            "Location services are turned off on your device. Turn them on and try again.",
          );

          return;
        }

        /* ================================================
           FOREGROUND PERMISSION
        ================================================ */

        let permission =
          await Location.getForegroundPermissionsAsync();

        if (
          permission.status !==
          "granted"
        ) {
          permission =
            await Location.requestForegroundPermissionsAsync();
        }

        if (
          permission.status !==
          "granted"
        ) {
          if (
            permission.canAskAgain ===
            false
          ) {
            Alert.alert(
              "Location permission needed",
              "Allow Fixxam to use your location from your device settings.",
              [
                {
                  text:
                    "Not now",

                  style:
                    "cancel",
                },

                {
                  text:
                    "Open settings",

                  onPress:
                    handleOpenSettings,
                },
              ],
            );

            return;
          }

          showErrorToast(
            "Location permission needed",
            "Allow location access so Fixxam can use your location for nearby jobs and services.",
          );

          return;
        }

        /* ================================================
           CURRENT POSITION
        ================================================ */

        const position =
          await Location.getCurrentPositionAsync(
            {
              accuracy:
                Location.Accuracy
                  .Balanced,
            },
          );

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        if (
          !isValidLatitude(
            latitude,
          ) ||
          !isValidLongitude(
            longitude,
          )
        ) {
          throw new Error(
            "INVALID_COORDINATES",
          );
        }

        /* ================================================
           REVERSE GEOCODE
        ================================================ */

        let area:
          | string
          | null =
          null;

        let city:
          | string
          | null =
          null;

        let state:
          | string
          | null =
          null;

        let country:
          | string
          | null =
          null;

        try {
          const addresses =
            await Location.reverseGeocodeAsync(
              {
                latitude,
                longitude,
              },
            );

          const address =
            addresses[0];

          if (address) {
            area =
              cleanText(
                address.district,
              ) ||
              cleanText(
                address.subregion,
              ) ||
              null;

            city =
              cleanText(
                address.city,
              ) ||
              null;

            state =
              cleanText(
                address.region,
              ) ||
              null;

            country =
              cleanText(
                address.country,
              ) ||
              null;
          }
        } catch (
          geocodeError
        ) {
          if (__DEV__) {
            console.warn(
              "WORKER_LOCATION_GEOCODE_ERROR:",
              geocodeError,
            );
          }
        }

        const label =
          buildLocationLabel([
            area,
            city,
            state,
            country,
          ]);

        const accuracy =
          isFiniteNumber(
            position.coords.accuracy,
          )
            ? Math.max(
                0,
                Math.round(
                  position.coords
                    .accuracy,
                ),
              )
            : null;

        /* ================================================
           SAVE TO FIRESTORE
        ================================================ */

        const userRef =
          doc(
            db,
            "users",
            user.uid,
          );

        await updateDoc(
          userRef,
          {
            location: {
              latitude,
              longitude,
              accuracy,

              area,
              city,
              state,
              country,

              label:
                label ||
                "Current location",

              source:
                "device",

              updatedAt:
                serverTimestamp(),
            },

            updatedAt:
              serverTimestamp(),
          },
        );

        /* ================================================
           OPTIMISTIC UI
        ================================================ */

        setSavedLocation({
          latitude,
          longitude,
          accuracy,

          area,
          city,
          state,
          country,

          label:
            label ||
            "Current location",

          source:
            "device",
        });

        showSuccessToast(
          "Location updated",
          "Your worker location has been updated successfully.",
        );
      } catch (error) {
        if (__DEV__) {
          console.error(
            "WORKER_LOCATION_UPDATE_ERROR:",
            error,
          );
        }

        if (
          error instanceof
            Error &&
          error.message ===
            "INVALID_COORDINATES"
        ) {
          showErrorToast(
            "Location unavailable",
            "Fixxam could not determine your current location. Please try again.",
          );

          return;
        }

        if (
          typeof error ===
            "object" &&
          error !== null &&
          "code" in error
        ) {
          const code =
            String(
              (
                error as {
                  code?: unknown;
                }
              ).code ?? "",
            );

          if (
            code ===
            "permission-denied"
          ) {
            showErrorToast(
              "Unable to save location",
              "Your account is not allowed to update this location.",
            );

            return;
          }

          if (
            code ===
            "unavailable"
          ) {
            showErrorToast(
              "Connection problem",
              "Fixxam could not save your location. Check your connection and try again.",
            );

            return;
          }
        }

        showErrorToast(
          "Location unavailable",
          "Make sure location is turned on, then try again.",
        );
      } finally {
        locationRequestInFlight.current =
          false;

        setLocating(
          false,
        );
      }
    }, [
      handleOpenSettings,
      locating,
    ]);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      <Stack.Screen
        options={{
          headerShown:
            false,
        }}
      />

      <AppScreen
        role="worker"
        padded={false}
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <View
          style={
            styles.header
          }
        >
          <Pressable
            onPress={
              handleBack
            }
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            style={({
              pressed,
            }) => [
              styles.backButton,

              pressed
                ? styles.pressed
                : null,
            ]}
          >
            <AppIcon
              name="back"
              role="worker"
              size="sm"
              color={
                Colors.textPrimary
              }
            />
          </Pressable>

          <AppText
            variant="bodyLarge"
            weight="bold"
            style={
              styles.headerTitle
            }
          >
            Location
          </AppText>

          <View
            style={
              styles.headerSpacer
            }
          />
        </View>

        {/* ====================================================
            CONTENT
        ==================================================== */}

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.content
          }
        >
          {/* ==================================================
              INTRO
          ================================================== */}

          <View
            style={
              styles.hero
            }
          >
            <View
              style={
                styles.heroIcon
              }
            >
              <AppIcon
                name="location"
                role="worker"
                size="lg"
                color={
                  WorkerColors.primary
                }
              />
            </View>

            <AppText
              variant="bodyLarge"
              weight="bold"
              style={
                styles.heroTitle
              }
            >
              Use your current location
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.heroDescription
              }
            >
              You don&apos;t need to know or enter your address.
              Fixxam can use your current location when you allow
              location access.
            </AppText>
          </View>

          {/* ==================================================
              CURRENT LOCATION
          ================================================== */}

          <View
            style={
              styles.locationSection
            }
          >
            <AppText
              variant="caption"
              weight="medium"
              tone="secondary"
              style={
                styles.sectionLabel
              }
            >
              CURRENT LOCATION
            </AppText>

            <View
              style={
                styles.locationRow
              }
            >
              <View
                style={
                  styles.locationIcon
                }
              >
                <AppIcon
                  name="location"
                  role="worker"
                  size="sm"
                  color={
                    WorkerColors.primary
                  }
                />
              </View>

              <View
                style={
                  styles.locationContent
                }
              >
                {loadingSavedLocation ? (
                  <>
                    <AppText
                      variant="bodyMedium"
                      weight="medium"
                      style={
                        styles.locationTitle
                      }
                    >
                      Checking location...
                    </AppText>

                    <ActivityIndicator
                      size="small"
                      color={
                        WorkerColors.primary
                      }
                      style={
                        styles.inlineLoader
                      }
                    />
                  </>
                ) : savedLocation ? (
                  <>
                    <AppText
                      variant="bodyMedium"
                      weight="medium"
                      numberOfLines={2}
                      style={
                        styles.locationTitle
                      }
                    >
                      {currentLocationLabel}
                    </AppText>

                    <AppText
                      variant="caption"
                      tone="secondary"
                      style={
                        styles.locationSubtitle
                      }
                    >
                      Saved for nearby jobs and services
                    </AppText>
                  </>
                ) : (
                  <>
                    <AppText
                      variant="bodyMedium"
                      weight="medium"
                      style={
                        styles.locationTitle
                      }
                    >
                      Not set yet
                    </AppText>

                    <AppText
                      variant="caption"
                      tone="secondary"
                      style={
                        styles.locationSubtitle
                      }
                    >
                      Use your device location to get started
                    </AppText>
                  </>
                )}
              </View>
            </View>
          </View>

          {/* ==================================================
              PRIMARY ACTION
          ================================================== */}

          <Pressable
            onPress={
              handleUseCurrentLocation
            }
            disabled={
              locating
            }
            accessibilityRole="button"
            accessibilityLabel={
              savedLocation
                ? "Update current location"
                : "Use current location"
            }
            accessibilityState={{
              disabled:
                locating,

              busy:
                locating,
            }}
            style={({
              pressed,
            }) => [
              styles.primaryButton,

              locating
                ? styles.disabled
                : null,

              pressed &&
              !locating
                ? styles.pressed
                : null,
            ]}
          >
            {locating ? (
              <ActivityIndicator
                size="small"
                color={
                  Colors.textInverse
                }
              />
            ) : (
              <AppIcon
                name="navigation"
                role="worker"
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
                styles.primaryButtonText
              }
            >
              {locating
                ? "Finding your location..."
                : savedLocation
                  ? "Update current location"
                  : "Use current location"}
            </AppText>
          </Pressable>

          {/* ==================================================
              INFO
          ================================================== */}

          <View
            style={
              styles.infoRow
            }
          >
            <View
              style={
                styles.infoIcon
              }
            >
              <AppIcon
                name="info"
                role="worker"
                size="sm"
                color={
                  WorkerColors.primary
                }
              />
            </View>

            <View
              style={
                styles.infoContent
              }
            >
              <AppText
                variant="bodyMedium"
                weight="medium"
                style={
                  styles.infoTitle
                }
              >
                Why Fixxam uses your location
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.infoText
                }
              >
                Your location helps Fixxam connect you with nearby
                customers, jobs and service opportunities.
              </AppText>
            </View>
          </View>

          {/* ==================================================
              PRIVACY
          ================================================== */}

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.privacyText
            }
          >
            Your location is updated only when you tap the button
            above. This screen does not request background location.
          </AppText>
        </ScrollView>
      </AppScreen>
    </>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    header: {
      minHeight:
        FixxamTokens.size.headerHeight,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,

      backgroundColor:
        Colors.surface,
    },

    backButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.button,
    },

    headerTitle: {
      flex: 1,

      textAlign:
        "center",

      color:
        Colors.textPrimary,
    },

    headerSpacer: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,
    },

    content: {
      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    hero: {
      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.sm,
    },

    heroIcon: {
      width: 64,

      height: 64,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    heroTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      textAlign:
        "center",

      color:
        Colors.textPrimary,
    },

    heroDescription: {
      maxWidth: 420,

      marginTop:
        FixxamTokens.spacing.sm,

      textAlign:
        "center",

      lineHeight: 21,
    },

    locationSection: {
      marginTop:
        FixxamTokens.spacing.xl,
    },

    sectionLabel: {
      marginBottom:
        FixxamTokens.spacing.xs,
    },

    locationRow: {
      minHeight: 72,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderTopWidth:
        StyleSheet.hairlineWidth,

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.divider,
    },

    locationIcon: {
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
        WorkerColors.primarySoft,
    },

    locationContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    locationTitle: {
      color:
        Colors.textPrimary,
    },

    locationSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    inlineLoader: {
      marginTop:
        FixxamTokens.spacing.xs,

      alignSelf:
        "flex-start",
    },

    primaryButton: {
      minHeight:
        FixxamTokens.size.buttonHeight,

      marginTop:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        WorkerColors.primary,
    },

    primaryButtonText: {
      color:
        Colors.textInverse,
    },

    infoRow: {
      marginTop:
        FixxamTokens.spacing.xl,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    infoIcon: {
      width: 36,

      height: 36,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    infoContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    infoTitle: {
      color:
        Colors.textPrimary,
    },

    infoText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 18,
    },

    privacyText: {
      marginTop:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      textAlign:
        "center",

      lineHeight: 18,
    },

    pressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },

    disabled: {
      opacity:
        FixxamTokens.motion.disabledOpacity,
    },
  });