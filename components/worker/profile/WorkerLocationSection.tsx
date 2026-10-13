import React, {
  memo,
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import * as Location from "expo-location";

import {
  Ionicons,
} from "@expo/vector-icons";

import states from "@/assets/data/states.json";
import lgas from "@/assets/data/lgas.json";

import {
  AppText,
} from "@/components/ui";

import LocationSelector from "@/components/worker/LocationSelector";

import {
  EMPTY_WORKER_SERVICE_LOCATION,
  WorkerProfile,
  WorkerProfileField,
  WorkerServiceLocation,
} from "@/types/workerProfile";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type UpdateField = <
  K extends WorkerProfileField,
>(
  field: K,
  value: WorkerProfile[K],
) => void;

type Props = {
  profile: WorkerProfile;

  updateField: UpdateField;
};

/* ============================================================
   HELPERS
============================================================ */

function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/* ============================================================
   LOCATION DATA
============================================================ */

const STATE_OPTIONS =
  states as string[];

const LGA_MAP =
  lgas as Record<
    string,
    string[]
  >;

/* ============================================================
   COMPONENT
============================================================ */

function WorkerLocationSection({
  profile,
  updateField,
}: Props) {
  const [
    locating,
    setLocating,
  ] = useState(false);

  /* ==========================================================
     SERVICE LOCATION
  ========================================================== */

  const serviceLocation =
    profile.serviceLocation ??
    EMPTY_WORKER_SERVICE_LOCATION;

  /* ==========================================================
     UPDATE LOCATION
  ========================================================== */

  const updateServiceLocation =
    useCallback(
      (
        patch: Partial<WorkerServiceLocation>,
      ) => {
        updateField(
          "serviceLocation",
          {
            ...serviceLocation,
            ...patch,
          },
        );
      },
      [
        serviceLocation,
        updateField,
      ],
    );

  /* ==========================================================
     STATE
  ========================================================== */

  const handleStateChange =
    useCallback(
      (value: string) => {
        updateServiceLocation({
          state: value,
          lga: "",
          latitude: null,
          longitude: null,
        });
      },
      [
        updateServiceLocation,
      ],
    );

  /* ==========================================================
     LGA
  ========================================================== */

  const handleLgaChange =
    useCallback(
      (value: string) => {
        if (!value) {
          return;
        }

        updateServiceLocation({
          lga: value,
          latitude: null,
          longitude: null,
        });
      },
      [
        updateServiceLocation,
      ],
    );

  /* ==========================================================
     ADDRESS
  ========================================================== */

  const handleAddressChange =
    useCallback(
      (value: string) => {
        updateServiceLocation({
          address: value,
          latitude: null,
          longitude: null,
        });
      },
      [
        updateServiceLocation,
      ],
    );

  /* ==========================================================
     CURRENT LOCATION
  ========================================================== */

  const handleUseCurrentLocation =
    useCallback(
      async () => {
        if (locating) {
          return;
        }

        try {
          setLocating(true);

          /* ==================================================
             PERMISSION
          ================================================== */

          const permission =
            await Location.requestForegroundPermissionsAsync();

          if (
            permission.status !==
            Location.PermissionStatus.GRANTED
          ) {
            Alert.alert(
              "Location permission",
              "Please allow location access so Fixxam can save your exact service location.",
            );

            return;
          }

          /* ==================================================
             GET GPS
          ================================================== */

          const position =
            await Location.getCurrentPositionAsync(
              {
                accuracy:
                  Location.Accuracy.High,
              },
            );

          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;

          if (
            !Number.isFinite(
              latitude,
            ) ||
            !Number.isFinite(
              longitude,
            )
          ) {
            throw new Error(
              "Invalid location coordinates received.",
            );
          }

          /* ==================================================
             START WITH CURRENT MANUAL VALUES
          ================================================== */

          let address =
            serviceLocation.address;

          let state =
            serviceLocation.state;

          let lga =
            serviceLocation.lga;

          /* ==================================================
             REVERSE GEOCODE
          ================================================== */

          try {
            const results =
              await Location.reverseGeocodeAsync(
                {
                  latitude,
                  longitude,
                },
              );

            const first =
              results[0];

            if (first) {
              /* ==============================================
                 ADDRESS
              ============================================== */

              const addressParts = [
                first.name,
                first.street,
                first.city,
                first.subregion,
                first.region,
              ].filter(
                (
                  value,
                ): value is string =>
                  typeof value ===
                    "string" &&
                  value.trim()
                    .length > 0,
              );

              if (
                addressParts.length >
                0
              ) {
                address =
                  Array.from(
                    new Set(
                      addressParts.map(
                        (
                          item,
                        ) =>
                          item.trim(),
                      ),
                    ),
                  ).join(
                    ", ",
                  );
              }

              /* ==============================================
                 STATE
              ============================================== */

              const detectedRegion =
                cleanString(
                  first.region,
                );

              /* ==============================================
                 LGA
              ============================================== */

              const detectedCity =
                cleanString(
                  first.city,
                );

              const detectedSubregion =
                cleanString(
                  first.subregion,
                );

              /*
               * Only replace state when
               * it exists in our official
               * state data.
               */

              const matchedState =
                STATE_OPTIONS.find(
                  (item) =>
                    item.toLowerCase() ===
                    detectedRegion.toLowerCase(),
                );

              if (
                matchedState
              ) {
                state =
                  matchedState;
              }

              /*
               * Only use LGA when it
               * belongs to the detected
               * state.
               */

              const possibleLgas =
                matchedState
                  ? LGA_MAP[
                      matchedState
                    ] ?? []
                  : [];

              const detectedLga =
                possibleLgas.find(
                  (item) => {
                    const normalized =
                      item.toLowerCase();

                    return (
                      normalized ===
                        detectedCity.toLowerCase() ||
                      normalized ===
                        detectedSubregion.toLowerCase()
                    );
                  },
                );

              if (
                detectedLga
              ) {
                lga =
                  detectedLga;
              }
            }
          } catch {
            /*
             * GPS coordinates are still
             * valid even when reverse
             * geocoding fails.
             */
          }

          /* ==================================================
             SAVE LOCATION
          ================================================== */

          updateServiceLocation({
            address,
            state,
            lga,
            latitude,
            longitude,
          });

          Alert.alert(
            "Location updated",
            "Your current service location has been added successfully.",
          );
        } catch (error) {
          Alert.alert(
            "Location error",
            error instanceof Error
              ? error.message
              : "Unable to get your current location.",
          );
        } finally {
          setLocating(false);
        }
      },
      [
        locating,
        serviceLocation,
        updateServiceLocation,
      ],
    );

  /* ==========================================================
     COORDINATE STATUS
  ========================================================== */

  const hasCoordinates =
    Number.isFinite(
      serviceLocation.latitude,
    ) &&
    Number.isFinite(
      serviceLocation.longitude,
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View
      style={
        styles.card
      }
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <AppText
        variant="heading3"
        style={
          styles.cardTitle
        }
      >
        Service Location
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        style={
          styles.cardDescription
        }
      >
        Location customers will use for your services.
      </AppText>

      {/* ======================================================
          STATE + LGA PICKERS
      ====================================================== */}

      <View
        style={
          styles.selectorContainer
        }
      >
        <LocationSelector
          state={
            serviceLocation.state
          }
          lga={
            serviceLocation.lga
          }
          setState={
            handleStateChange
          }
          setLga={
            handleLgaChange
          }
        />
      </View>

      {/* ======================================================
          SERVICE ADDRESS
      ====================================================== */}

      <View
        style={
          styles.addressField
        }
      >
        <AppText
          variant="label"
          style={
            styles.label
          }
        >
          Service Address
        </AppText>

        <View
          style={
            styles.addressContainer
          }
        >
          <Ionicons
            name="navigate-outline"
            size={22}
            color={
              Colors.textSecondary
            }
            style={
              styles.addressIcon
            }
          />

          <TextInput
            value={
              serviceLocation.address
            }
            onChangeText={
              handleAddressChange
            }
            placeholder="Enter your service address"
            placeholderTextColor={
              Colors.textSecondary
            }
            multiline
            textAlignVertical="top"
            style={
              styles.addressInput
            }
          />
        </View>
      </View>

      {/* ======================================================
          CURRENT LOCATION
      ====================================================== */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Use my current location"
        disabled={locating}
        onPress={
          handleUseCurrentLocation
        }
        style={({ pressed }) => [
          styles.locationButton,

          pressed
            ? styles.locationButtonPressed
            : null,

          locating
            ? styles.locationButtonDisabled
            : null,
        ]}
      >
        {locating ? (
          <ActivityIndicator
            size="small"
            color={
              WorkerColors.primary
            }
          />
        ) : (
          <>
            <Ionicons
              name="locate-outline"
              size={20}
              color={
                WorkerColors.primary
              }
            />

            <AppText
              variant="button"
              style={
                styles.locationButtonText
              }
            >
              Use My Current Location
            </AppText>
          </>
        )}
      </Pressable>

      {/* ======================================================
          STATUS
      ====================================================== */}

      <View
        style={
          styles.locationStatus
        }
      >
        <View
          style={[
            styles.statusDot,

            hasCoordinates
              ? styles.statusActive
              : styles.statusInactive,
          ]}
        />

        <AppText
          variant="caption"
          tone="secondary"
          style={
            styles.statusText
          }
        >
          {hasCoordinates
            ? "Exact service location saved"
            : "Current location has not been set"}
        </AppText>
      </View>

      {/* ======================================================
          NOTE
      ====================================================== */}

      <AppText
        variant="caption"
        tone="secondary"
        style={
          styles.locationNote
        }
      >
        Exact coordinates improve service location accuracy.
      </AppText>
    </View>
  );
}

export default memo(
  WorkerLocationSection,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CARD
    ======================================================== */

    card: {
      marginBottom: 5,

      padding: 9,

      borderRadius: 15,

      borderWidth: 1,

      borderColor:
        Colors.border,

      backgroundColor:
        Colors.surface,

      elevation: 1,
    },

    cardTitle: {
      color:
        Colors.textPrimary,

      fontWeight: "800",

      fontSize: 17,

      lineHeight: 20,

      letterSpacing: -0.1,
    },

    cardDescription: {
      marginTop: 1,

      lineHeight: 14,

      fontSize: 11,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       SELECTORS
    ======================================================== */

    selectorContainer: {
      marginTop: 6,
    },

    /* ========================================================
       ADDRESS
    ======================================================== */

    addressField: {
      marginTop: 1,
    },

    label: {
      marginBottom: 3,

      color:
        Colors.textPrimary,

      fontWeight: "700",

      fontSize: 11,

      lineHeight: 14,
    },

    addressContainer: {
      minHeight: 82,

      flexDirection: "row",

      alignItems: "flex-start",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius: 12,

      backgroundColor:
        Colors.surface,
    },

    addressIcon: {
      marginLeft: 9,

      marginTop: 10,
    },

    addressInput: {
      flex: 1,

      minHeight: 80,

      paddingHorizontal: 7,

      paddingTop: 9,

      paddingBottom: 8,

      color:
        Colors.textPrimary,

      fontSize: 14,

      lineHeight: 19,
    },

    /* ========================================================
       CURRENT LOCATION
    ======================================================== */

    locationButton: {
      minHeight: 42,

      marginTop: 6,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

      gap: 5,

      borderWidth: 1.5,

      borderColor:
        WorkerColors.primary,

      borderRadius: 10,

      backgroundColor:
        Colors.surface,
    },

    locationButtonPressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    locationButtonDisabled: {
      opacity: 0.55,
    },

    locationButtonText: {
      color:
        WorkerColors.primary,

      fontWeight: "800",

      fontSize: 12,
    },

    /* ========================================================
       STATUS
    ======================================================== */

    locationStatus: {
      flexDirection: "row",

      alignItems: "center",

      marginTop: 4,
    },

    statusDot: {
      width: 7,

      height: 7,

      marginRight: 5,

      borderRadius: 4,
    },

    statusActive: {
      backgroundColor:
        WorkerColors.primary,
    },

    statusInactive: {
      backgroundColor:
        Colors.textSecondary,
    },

    statusText: {
      fontSize: 11,

      lineHeight: 14,
    },

    /* ========================================================
       NOTE
    ======================================================== */

    locationNote: {
      marginTop: 1,

      lineHeight: 13,

      fontSize: 10,
    },
  });