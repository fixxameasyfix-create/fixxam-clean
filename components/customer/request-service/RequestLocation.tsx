import React, {
  memo,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import * as Location from "expo-location";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  AppButton,
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import BookingLocationType from "./BookingLocationType";

import BookingManualLocation, {
  type BookingLocationSuggestion,
} from "./BookingManualLocation";

/* ==============================================================
   TYPES
============================================================== */

type Coordinates = {
  latitude: number;
  longitude: number;
};

type SelectedLocation =
  Coordinates & {
    address?: string;
  };

type LocationType =
  | "current"
  | "manual";

type Props = {
  selected: boolean;

  address?: string;

  onPress: () => void;

  onLocationSelected?: (
    location: SelectedLocation,
  ) => void;

  disabled?: boolean;

  currentLocation?: Coordinates | null;

  suggestions?: BookingLocationSuggestion[];

  suggestionsLoading?: boolean;

  onSearchLocation?: (
    query: string,
  ) => void;
};

/* ==============================================================
   COORDINATE VALIDATION
============================================================== */

function isValidCoordinates(
  latitude: number,
  longitude: number,
): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/* ==============================================================
   COMPONENT
============================================================== */

function RequestLocation({
  selected,
  address,
  onPress,
  onLocationSelected,
  disabled = false,
  currentLocation = null,
  suggestions = [],
  suggestionsLoading = false,
  onSearchLocation,
}: Props) {
  const insets =
    useSafeAreaInsets();

  const [
    visible,
    setVisible,
  ] =
    useState(false);

  const [
    locationType,
    setLocationType,
  ] =
    useState<LocationType>(
      "current",
    );

  const [
    manualAddress,
    setManualAddress,
  ] =
    useState("");

  const [
    manualCoordinates,
    setManualCoordinates,
  ] =
    useState<Coordinates | null>(
      null,
    );

  const [
    selectingCurrent,
    setSelectingCurrent,
  ] =
    useState(false);

  const [
    confirmingManual,
    setConfirmingManual,
  ] =
    useState(false);

  const busy =
    selectingCurrent ||
    confirmingManual;

  /* ============================================================
     OPEN / CLOSE
  ============================================================ */

  const openModal =
    useCallback(() => {
      if (
        disabled
      ) {
        return;
      }

      setLocationType(
        "current",
      );

      setManualAddress(
        "",
      );

      setManualCoordinates(
        null,
      );

      onSearchLocation?.(
        "",
      );

      setVisible(
        true,
      );

      onPress();
    }, [
      disabled,
      onPress,
      onSearchLocation,
    ]);

  const closeModal =
    useCallback(() => {
      if (
        busy
      ) {
        return;
      }

      setVisible(
        false,
      );

      onSearchLocation?.(
        "",
      );
    }, [
      busy,
      onSearchLocation,
    ]);

  /* ============================================================
     LOCATION TYPE
  ============================================================ */

  const handleTypeChange =
    useCallback(
      (
        type: LocationType,
      ) => {
        if (
          busy
        ) {
          return;
        }

        setLocationType(
          type,
        );

        setManualAddress(
          "",
        );

        setManualCoordinates(
          null,
        );

        onSearchLocation?.(
          "",
        );
      },
      [
        busy,
        onSearchLocation,
      ],
    );

  /* ============================================================
     BUILD ADDRESS
  ============================================================ */

  const buildAddress =
    useCallback(
      (
        place:
          | Location.LocationGeocodedAddress
          | undefined,
      ): string => {
        if (
          !place
        ) {
          return "";
        }

        const street =
          [
            place.streetNumber,
            place.street,
          ]
            .filter(
              (
                value,
              ): value is string =>
                Boolean(
                  value?.trim(),
                ),
            )
            .join(" ")
            .trim();

        const parts =
          [
            street,
            place.name,
            place.district,
            place.subregion,
            place.city,
            place.region,
            place.country,
          ].filter(
            (
              value,
            ): value is string =>
              Boolean(
                value?.trim(),
              ),
          );

        const uniqueParts =
          [
            ...new Set(
              parts.map(
                part =>
                  part.trim(),
              ),
            ),
          ];

        return uniqueParts.join(
          ", ",
        );
      },
      [],
    );

  /* ============================================================
     PERMISSION
  ============================================================ */

  const ensureLocationPermission =
    useCallback(
      async (): Promise<boolean> => {
        let permission =
          await Location
            .getForegroundPermissionsAsync();

        if (
          permission.status ===
          Location.PermissionStatus.GRANTED
        ) {
          return true;
        }

        if (
          permission.canAskAgain
        ) {
          permission =
            await Location
              .requestForegroundPermissionsAsync();

          if (
            permission.status ===
            Location.PermissionStatus.GRANTED
          ) {
            return true;
          }
        }

        Alert.alert(
          "Location permission required",
          "Enable location access so Fixxam can use your current position.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Open Settings",
              onPress: () => {
                void Linking.openSettings();
              },
            },
          ],
        );

        return false;
      },
      [],
    );

  /* ============================================================
     CURRENT LOCATION
  ============================================================ */

  const handleCurrentLocation =
    useCallback(
      async () => {
        if (
          selectingCurrent
        ) {
          return;
        }

        setSelectingCurrent(
          true,
        );

        try {
          const hasPermission =
            await ensureLocationPermission();

          if (
            !hasPermission
          ) {
            return;
          }

          let coordinates:
            | Coordinates
            | null = null;

          try {
            const position =
              await Location
                .getCurrentPositionAsync({
                  accuracy:
                    Location.Accuracy.High,
                });

            const {
              latitude,
              longitude,
            } =
              position.coords;

            if (
              isValidCoordinates(
                latitude,
                longitude,
              )
            ) {
              coordinates = {
                latitude,
                longitude,
              };
            }
          } catch (
            error
          ) {
            if (
              __DEV__
            ) {
              console.warn(
                "FRESH_LOCATION_ERROR",
                error,
              );
            }

            if (
              currentLocation &&
              isValidCoordinates(
                currentLocation.latitude,
                currentLocation.longitude,
              )
            ) {
              coordinates = {
                latitude:
                  currentLocation.latitude,

                longitude:
                  currentLocation.longitude,
              };
            }
          }

          if (
            !coordinates
          ) {
            Alert.alert(
              "Location unavailable",
              "We couldn't determine your current location. Please check your GPS and try again.",
            );

            return;
          }

          let currentAddress =
            "Current location";

          try {
            const results =
              await Location
                .reverseGeocodeAsync(
                  coordinates,
                );

            const readableAddress =
              buildAddress(
                results[0],
              );

            if (
              readableAddress.trim()
            ) {
              currentAddress =
                readableAddress;
            }
          } catch (
            error
          ) {
            if (
              __DEV__
            ) {
              console.warn(
                "CURRENT_LOCATION_GEOCODING_ERROR",
                error,
              );
            }
          }

          onLocationSelected?.({
            ...coordinates,

            address:
              currentAddress,
          });

          onSearchLocation?.(
            "",
          );

          setVisible(
            false,
          );
        } catch (
          error
        ) {
          if (
            __DEV__
          ) {
            console.warn(
              "SELECT_CURRENT_LOCATION_ERROR",
              error,
            );
          }

          Alert.alert(
            "Location error",
            "We couldn't select your current location. Please try again.",
          );
        } finally {
          setSelectingCurrent(
            false,
          );
        }
      },
      [
        buildAddress,
        currentLocation,
        ensureLocationPermission,
        onLocationSelected,
        onSearchLocation,
        selectingCurrent,
      ],
    );

  /* ============================================================
     MANUAL LOCATION
  ============================================================ */

  const handleManualChange =
    useCallback(
      (
        text: string,
      ) => {
        setManualAddress(
          text,
        );

        setManualCoordinates(
          null,
        );
      },
      [],
    );

  const handleSearchLocation =
    useCallback(
      (
        query: string,
      ) => {
        onSearchLocation?.(
          query,
        );
      },
      [
        onSearchLocation,
      ],
    );

  const handleSuggestionSelected =
    useCallback(
      (
        suggestion:
          BookingLocationSuggestion,
      ) => {
        if (
          !isValidCoordinates(
            suggestion.latitude,
            suggestion.longitude,
          )
        ) {
          Alert.alert(
            "Location unavailable",
            "This location does not have valid coordinates. Please choose another location.",
          );

          return;
        }

        const selectedAddress =
          suggestion.subtitle?.trim() ||
          suggestion.title.trim();

        setManualAddress(
          selectedAddress,
        );

        setManualCoordinates({
          latitude:
            suggestion.latitude,

          longitude:
            suggestion.longitude,
        });

        onSearchLocation?.(
          "",
        );
      },
      [
        onSearchLocation,
      ],
    );

  /* ============================================================
     CONFIRM MANUAL
  ============================================================ */

  const handleConfirmManual =
    useCallback(
      async () => {
        if (
          confirmingManual
        ) {
          return;
        }

        const cleanManualAddress =
          manualAddress.trim();

        if (
          !cleanManualAddress
        ) {
          Alert.alert(
            "Enter your location",
            "Please enter the address or area where the provider should come.",
          );

          return;
        }

        setConfirmingManual(
          true,
        );

        try {
          let coordinates =
            manualCoordinates;

          if (
            !coordinates
          ) {
            const geocoded =
              await Location
                .geocodeAsync(
                  cleanManualAddress,
                );

            const first =
              geocoded.find(
                item =>
                  isValidCoordinates(
                    item.latitude,
                    item.longitude,
                  ),
              );

            if (
              !first
            ) {
              Alert.alert(
                "Choose a valid location",
                "We couldn't find this address. Please choose one of the suggested locations and try again.",
              );

              return;
            }

            coordinates = {
              latitude:
                first.latitude,

              longitude:
                first.longitude,
            };
          }

          if (
            !isValidCoordinates(
              coordinates.latitude,
              coordinates.longitude,
            )
          ) {
            Alert.alert(
              "Invalid location",
              "Please select a valid service location.",
            );

            return;
          }

          onLocationSelected?.({
            latitude:
              coordinates.latitude,

            longitude:
              coordinates.longitude,

            address:
              cleanManualAddress,
          });

          onSearchLocation?.(
            "",
          );

          setVisible(
            false,
          );
        } catch (
          error
        ) {
          if (
            __DEV__
          ) {
            console.warn(
              "CONFIRM_MANUAL_LOCATION_ERROR",
              error,
            );
          }

          Alert.alert(
            "Location unavailable",
            "We couldn't verify this address. Please select one of the suggested locations and try again.",
          );
        } finally {
          setConfirmingManual(
            false,
          );
        }
      },
      [
        confirmingManual,
        manualAddress,
        manualCoordinates,
        onLocationSelected,
        onSearchLocation,
      ],
    );

  /* ============================================================
     RESET BUSY
  ============================================================ */

  useEffect(() => {
    if (
      visible
    ) {
      return;
    }

    setSelectingCurrent(
      false,
    );

    setConfirmingManual(
      false,
    );
  }, [
    visible,
  ]);

  /* ============================================================
     DISPLAY
  ============================================================ */

  const cleanAddress =
    address?.trim() ??
    "";

  const manualCanConfirm =
    Boolean(
      manualAddress.trim(),
    ) &&
    !suggestionsLoading &&
    !confirmingManual;

  /* ============================================================
     UI
  ============================================================ */

  return (
    <>
      {/* ========================================================
          LOCATION SELECTOR
      ======================================================== */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          selected
            ? "Change service location"
            : "Choose service location"
        }
        accessibilityHint="Opens service location options"
        accessibilityState={{
          disabled,
        }}
        disabled={
          disabled
        }
        onPress={
          openModal
        }
        style={({
          pressed,
        }) => [
          styles.locationField,

          selected &&
            styles.locationFieldSelected,

          pressed &&
            !disabled &&
            styles.pressed,

          disabled &&
            styles.disabled,
        ]}
      >
        <View
          style={
            styles.locationIcon
          }
        >
          <MaterialCommunityIcons
            name={
              selected
                ? "map-marker-check-outline"
                : "map-marker-outline"
            }
            size={25}
            color={
              CustomerColors.primary
            }
          />
        </View>

        <View
          style={
            styles.locationContent
          }
        >
          <AppText
            variant="bodyMedium"
            weight="semibold"
            numberOfLines={
              selected
                ? 2
                : 1
            }
            ellipsizeMode="tail"
          >
            {selected
              ? cleanAddress ||
                "Service location selected"
              : "Choose service location"}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            style={
              styles.locationHint
            }
          >
            {selected
              ? "Tap to change location"
              : "Use your current location or enter an address"}
          </AppText>
        </View>

        <MaterialCommunityIcons
          name="chevron-right"
          size={25}
          color={
            Colors.textSecondary
          }
        />
      </Pressable>

      {/* ========================================================
          LOCATION MODAL
      ======================================================== */}

      <Modal
        visible={
          visible
        }
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={
          closeModal
        }
      >
        <KeyboardAvoidingView
          behavior={
            Platform.OS ===
            "ios"
              ? "padding"
              : "height"
          }
          style={
            styles.modalRoot
          }
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close location options"
            onPress={
              closeModal
            }
            style={
              styles.backdrop
            }
          />

          <View
            style={[
              styles.sheet,

              {
                paddingBottom:
                  Math.max(
                    insets.bottom,
                    FixxamTokens.spacing.lg,
                  ) +
                  FixxamTokens.spacing.sm,
              },
            ]}
          >
            <View
              style={
                styles.handle
              }
            />

            {/* ================================================
                HEADER
            ================================================ */}

            <View
              style={
                styles.modalHeader
              }
            >
              <View
                style={
                  styles.modalHeaderIcon
                }
              >
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={26}
                  color={
                    CustomerColors.primary
                  }
                />
              </View>

              <View
                style={
                  styles.modalHeaderContent
                }
              >
                <AppText
                  variant="heading2"
                  weight="bold"
                >
                  Service Location
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.modalSubtitle
                  }
                >
                  Where should the provider come?
                </AppText>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close location"
                accessibilityState={{
                  disabled:
                    busy,
                }}
                disabled={
                  busy
                }
                hitSlop={8}
                onPress={
                  closeModal
                }
                style={({
                  pressed,
                }) => [
                  styles.closeButton,

                  pressed &&
                    !busy &&
                    styles.closeButtonPressed,

                  busy &&
                    styles.disabled,
                ]}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={23}
                  color={
                    Colors.textSecondary
                  }
                />
              </Pressable>
            </View>

            {/* ================================================
                LOCATION TYPE
            ================================================ */}

            <View
              style={
                styles.typeSection
              }
            >
              <BookingLocationType
                value={
                  locationType
                }
                onChange={
                  handleTypeChange
                }
                disabled={
                  busy
                }
              />
            </View>

            {/* ================================================
                CURRENT LOCATION
            ================================================ */}

            {locationType ===
            "current" ? (
              <View
                style={
                  styles.currentSection
                }
              >
                <View
                  style={
                    styles.currentCard
                  }
                >
                  <View
                    style={
                      styles.currentIcon
                    }
                  >
                    <MaterialCommunityIcons
                      name="crosshairs-gps"
                      size={25}
                      color={
                        CustomerColors.primary
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.currentContent
                    }
                  >
                    <AppText
                      variant="bodyMedium"
                      weight="bold"
                    >
                      Use Current Location
                    </AppText>

                    <AppText
                      variant="caption"
                      tone="secondary"
                      style={
                        styles.currentText
                      }
                    >
                      Fixxam will use your device location for this service request.
                    </AppText>
                  </View>
                </View>

                <AppButton
                  title={
                    selectingCurrent
                      ? "Getting Location..."
                      : "Use Current Location"
                  }
                  role="customer"
                  loading={
                    selectingCurrent
                  }
                  disabled={
                    busy
                  }
                  leftIconName={
                    selectingCurrent
                      ? undefined
                      : "locate"
                  }
                  onPress={
                    handleCurrentLocation
                  }
                  style={
                    styles.primaryButton
                  }
                />
              </View>
            ) : null}

            {/* ================================================
                MANUAL LOCATION
            ================================================ */}

            {locationType ===
            "manual" ? (
              <View
                style={
                  styles.manualSection
                }
              >
                <BookingManualLocation
                  value={
                    manualAddress
                  }
                  onChange={
                    handleManualChange
                  }
                  disabled={
                    confirmingManual
                  }
                  suggestions={
                    suggestions
                  }
                  suggestionsLoading={
                    suggestionsLoading
                  }
                  onSearchLocation={
                    handleSearchLocation
                  }
                  onSuggestionSelected={
                    handleSuggestionSelected
                  }
                />

                <AppButton
                  title={
                    confirmingManual
                      ? "Confirming Location..."
                      : "Confirm Location"
                  }
                  role="customer"
                  loading={
                    confirmingManual
                  }
                  disabled={
                    !manualCanConfirm ||
                    busy
                  }
                  leftIconName={
                    confirmingManual
                      ? undefined
                      : "check"
                  }
                  onPress={
                    handleConfirmManual
                  }
                  style={
                    styles.primaryButton
                  }
                />
              </View>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       LOCATION FIELD
    ======================================================== */

    locationField: {
      width:
        "100%",

      minHeight:
        72,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        14,

      paddingVertical:
        12,

      borderWidth:
        1,

      borderColor:
        "#DDE5EF",

      borderRadius:
        14,

      backgroundColor:
        "#FFFFFF",
    },

    locationFieldSelected: {
      borderColor:
        "#93C5FD",

      backgroundColor:
        "#FFFFFF",
    },

    locationIcon: {
      width:
        46,

      height:
        46,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        12,

      borderRadius:
        10,

      backgroundColor:
        "#EAF3FF",
    },

    locationContent: {
      flex:
        1,

      minWidth:
        0,

      marginRight:
        10,
    },

    locationHint: {
      marginTop:
        3,

      lineHeight:
        18,

      color:
        "#64748B",
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

    /* ========================================================
       MODAL
    ======================================================== */

    modalRoot: {
      flex:
        1,

      justifyContent:
        "flex-end",
    },

    backdrop: {
      ...StyleSheet.absoluteFillObject,

      backgroundColor:
        Colors.overlayMedium,
    },

    sheet: {
      width:
        "100%",

      maxHeight:
        "90%",

      paddingHorizontal:
        20,

      paddingTop:
        10,

      borderTopLeftRadius:
        24,

      borderTopRightRadius:
        24,

      backgroundColor:
        "#FFFFFF",

      ...FixxamTokens.shadow.modal,
    },

    handle: {
      width:
        42,

      height:
        5,

      alignSelf:
        "center",

      marginBottom:
        20,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        "#CBD5E1",
    },

    /* ========================================================
       HEADER
    ======================================================== */

    modalHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    modalHeaderIcon: {
      width:
        48,

      height:
        48,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        12,

      backgroundColor:
        "#EAF3FF",
    },

    modalHeaderContent: {
      flex:
        1,

      minWidth:
        0,

      marginHorizontal:
        12,
    },

    modalSubtitle: {
      marginTop:
        3,

      lineHeight:
        18,

      color:
        "#64748B",
    },

    closeButton: {
      width:
        40,

      height:
        40,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        20,

      backgroundColor:
        "#F8FAFC",
    },

    closeButtonPressed: {
      backgroundColor:
        "#EAF3FF",
    },

    typeSection: {
      marginTop:
        20,
    },

    /* ========================================================
       CURRENT LOCATION
    ======================================================== */

    currentSection: {
      marginTop:
        20,
    },

    currentCard: {
      minHeight:
        82,

      flexDirection:
        "row",

      alignItems:
        "center",

      padding:
        14,

      borderWidth:
        1,

      borderColor:
        "#DDE5EF",

      borderRadius:
        14,

      backgroundColor:
        "#FFFFFF",
    },

    currentIcon: {
      width:
        48,

      height:
        48,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        12,

      borderRadius:
        10,

      backgroundColor:
        "#EAF3FF",
    },

    currentContent: {
      flex:
        1,

      minWidth:
        0,
    },

    currentText: {
      marginTop:
        3,

      lineHeight:
        18,

      color:
        "#64748B",
    },

    /* ========================================================
       MANUAL LOCATION
    ======================================================== */

    manualSection: {
      marginTop:
        20,
    },

    /* ========================================================
       PRIMARY BUTTON
    ======================================================== */

    primaryButton: {
      width:
        "100%",

      marginTop:
        20,
    },
  });

export default memo(
  RequestLocation,
);