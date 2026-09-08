import React, {
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

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  AppButton,
  AppCard,
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

/* ==============================================================
   COMPONENT
============================================================== */

export default function RequestLocation({
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

  /* ============================================================
     MODAL
  ============================================================ */

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
    selectedLocationType,
    setSelectedLocationType,
  ] =
    useState<LocationType | null>(
      null,
    );

  /* ============================================================
     MANUAL LOCATION
  ============================================================ */

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

  /* ============================================================
     LOADING
  ============================================================ */

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
     OPEN
  ============================================================ */

  const openModal =
    useCallback(() => {
      if (disabled) {
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

  /* ============================================================
     CLOSE
  ============================================================ */

  const closeModal =
    useCallback(() => {
      if (busy) {
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
        if (busy) {
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
        if (!place) {
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
                (part) =>
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
     LOCATION PERMISSION
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
    useCallback(async () => {
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
        } catch (error) {
          console.warn(
            "FRESH_LOCATION_ERROR:",
            error,
          );

          /*
           * Use parent location only
           * when it is valid.
           */
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
            readableAddress
              .trim()
          ) {
            currentAddress =
              readableAddress;
          }
        } catch (error) {
          /*
           * Coordinates are still
           * usable if reverse geocoding
           * fails.
           */
          console.warn(
            "CURRENT_LOCATION_GEOCODING_ERROR:",
            error,
          );
        }

        setSelectedLocationType(
          "current",
        );

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
      } catch (error) {
        console.error(
          "SELECT_CURRENT_LOCATION_ERROR:",
          error,
        );

        Alert.alert(
          "Location error",
          "We couldn't select your current location. Please try again.",
        );
      } finally {
        setSelectingCurrent(
          false,
        );
      }
    }, [
      buildAddress,
      currentLocation,
      ensureLocationPermission,
      onLocationSelected,
      onSearchLocation,
      selectingCurrent,
    ]);

  /* ============================================================
     MANUAL ADDRESS
  ============================================================ */

  const handleManualChange =
    useCallback(
      (
        text: string,
      ) => {
        setManualAddress(
          text,
        );

        /*
         * Once text changes, previously
         * selected coordinates may no
         * longer represent that address.
         */
        setManualCoordinates(
          null,
        );
      },
      [],
    );

  /* ============================================================
     SEARCH
  ============================================================ */

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

  /* ============================================================
     SELECT SUGGESTION
  ============================================================ */

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

        setManualAddress(
          suggestion.title.trim(),
        );

        setManualCoordinates({
          latitude:
            suggestion.latitude,

          longitude:
            suggestion.longitude,
        });
      },
      [],
    );

  /* ============================================================
     CONFIRM MANUAL LOCATION
  ============================================================ */

  const handleConfirmManual =
    useCallback(async () => {
      if (
        confirmingManual
      ) {
        return;
      }

      const cleanAddress =
        manualAddress.trim();

      if (
        !cleanAddress
      ) {
        Alert.alert(
          "Enter your location",
          "Please enter the address or area where the worker should come.",
        );

        return;
      }

      setConfirmingManual(
        true,
      );

      try {
        let coordinates =
          manualCoordinates;

        /*
         * Never create a booking with
         * fake 0,0 coordinates.
         *
         * If user typed an address
         * instead of selecting a result,
         * resolve it before continuing.
         */
        if (
          !coordinates
        ) {
          const geocoded =
            await Location
              .geocodeAsync(
                cleanAddress,
              );

          const first =
            geocoded.find(
              (item) =>
                isValidCoordinates(
                  item.latitude,
                  item.longitude,
                ),
            );

          if (!first) {
            Alert.alert(
              "Choose a valid location",
              "We couldn't find this address. Please select one of the suggested locations and try again.",
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

        setSelectedLocationType(
          "manual",
        );

        onLocationSelected?.({
          latitude:
            coordinates.latitude,

          longitude:
            coordinates.longitude,

          address:
            cleanAddress,
        });

        onSearchLocation?.(
          "",
        );

        setVisible(
          false,
        );
      } catch (error) {
        console.error(
          "CONFIRM_MANUAL_LOCATION_ERROR:",
          error,
        );

        Alert.alert(
          "Location unavailable",
          "We couldn't verify this address. Please select one of the suggested locations and try again.",
        );
      } finally {
        setConfirmingManual(
          false,
        );
      }
    }, [
      confirmingManual,
      manualAddress,
      manualCoordinates,
      onLocationSelected,
      onSearchLocation,
    ]);

  /* ============================================================
     RESET BUSY STATE
  ============================================================ */

  useEffect(() => {
    if (visible) {
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
     DISPLAY DATA
  ============================================================ */

  const cleanAddress =
    address?.trim() ??
    "";

  const locationLabel =
    selectedLocationType ===
    "manual"
      ? "Manual location"
      : selectedLocationType ===
          "current"
        ? "Current location"
        : "Selected location";

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
          SERVICE LOCATION CARD
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
          styles.card,

          selected
            ? styles.cardSelected
            : null,

          disabled
            ? styles.cardDisabled
            : null,

          pressed &&
          !disabled
            ? styles.cardPressed
            : null,
        ]}
      >
        {/* ====================================================
            ICON
        ==================================================== */}

        <View
          style={
            styles.iconContainer
          }
        >
          <AppIcon
            name="location"
            role="customer"
            size="sm"
            state="active"
          />
        </View>

        {/* ====================================================
            CONTENT
        ==================================================== */}

        <View
          style={
            styles.cardContent
          }
        >
          <AppText
            variant="bodyMedium"
            weight="bold"
            numberOfLines={1}
          >
            Service location
          </AppText>

          {selected ? (
            <>
              <AppText
                variant="caption"
                weight="semibold"
                numberOfLines={1}
                style={
                  styles.locationType
                }
              >
                {locationLabel}
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={
                  styles.address
                }
              >
                {cleanAddress ||
                  "Location selected"}
              </AppText>
            </>
          ) : (
            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={2}
              ellipsizeMode="tail"
              style={
                styles.address
              }
            >
              Choose where the worker
              should come
            </AppText>
          )}
        </View>

        {/* ====================================================
            NEXT
        ==================================================== */}

        <View
          style={
            styles.chevronContainer
          }
        >
          <AppIcon
            name="next"
            role="customer"
            size="sm"
            state="muted"
          />
        </View>
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
          {/* ==================================================
              BACKDROP
          ================================================== */}

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

          {/* ==================================================
              SHEET
          ================================================== */}

          <View
            style={[
              styles.modalCard,

              {
                paddingBottom:
                  Math.max(
                    insets.bottom,
                    FixxamTokens
                      .spacing.lg,
                  ) +
                  FixxamTokens
                    .spacing.sm,
              },
            ]}
          >
            {/* ================================================
                HANDLE
            ================================================ */}

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
                <AppIcon
                  name="location"
                  role="customer"
                  size="sm"
                  state="active"
                />
              </View>

              <View
                style={
                  styles.modalHeaderContent
                }
              >
                <AppText
                  variant="heading3"
                  weight="bold"
                >
                  Service location
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.modalSubtitle
                  }
                >
                  Where should the
                  worker come?
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
                  !busy
                    ? styles.closeButtonPressed
                    : null,

                  busy
                    ? styles.controlDisabled
                    : null,
                ]}
              >
                <AppIcon
                  name="close"
                  role="customer"
                  size="sm"
                  state="muted"
                />
              </Pressable>
            </View>

            {/* ================================================
                LOCATION TYPE
            ================================================ */}

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

            {/* ==================================================
                CURRENT LOCATION
            ================================================== */}

            {locationType ===
            "current" ? (
              <>
                <AppCard
                  role="customer"
                  variant="outlined"
                  style={
                    styles.currentPanel
                  }
                >
                  <View
                    style={
                      styles.currentIcon
                    }
                  >
                    <AppIcon
                      name="locate"
                      role="customer"
                      size="sm"
                      state="active"
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
                      Use my current location
                    </AppText>

                    <AppText
                      variant="caption"
                      tone="secondary"
                      style={
                        styles.currentText
                      }
                    >
                      Fixxam will use
                      your latest GPS
                      position to set
                      the service
                      location.
                    </AppText>
                  </View>
                </AppCard>

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
                    selectingCurrent
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
              </>
            ) : null}

            {/* ==================================================
                MANUAL LOCATION
            ================================================== */}

            {locationType ===
            "manual" ? (
              <>
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
                    !manualCanConfirm
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
              </>
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
       CARD
    ======================================================== */

    card: {
      minHeight:
        FixxamTokens.size
          .cardMinHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    cardSelected: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        Colors.surface,
    },

    cardPressed: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primarySoft,

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

    cardDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    /* ========================================================
       ICON
    ======================================================== */

    iconContainer: {
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
        CustomerColors.primarySoft,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    cardContent: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.sm,
    },

    locationType: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        CustomerColors.primary,
    },

    address: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       CHEVRON
    ======================================================== */

    chevronContainer: {
      width: 34,

      height: 34,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.background,
    },

    /* ========================================================
       MODAL
    ======================================================== */

    modalRoot: {
      flex: 1,

      justifyContent:
        "flex-end",
    },

    backdrop: {
      ...StyleSheet.absoluteFillObject,

      backgroundColor:
        Colors.overlayMedium,
    },

    modalCard: {
      width: "100%",

      maxHeight: "90%",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      borderTopLeftRadius:
        FixxamTokens.radius.xl,

      borderTopRightRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.modal,
    },

    handle: {
      width: 42,

      height: 4,

      alignSelf:
        "center",

      marginBottom:
        FixxamTokens.spacing.lg,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabled,
    },

    /* ========================================================
       MODAL HEADER
    ======================================================== */

    modalHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    modalHeaderIcon: {
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
        CustomerColors.primarySoft,
    },

    modalHeaderContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    modalSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    closeButton: {
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
        Colors.background,
    },

    closeButtonPressed: {
      backgroundColor:
        CustomerColors.primarySoft,

      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    controlDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    /* ========================================================
       CURRENT LOCATION
    ======================================================== */

    currentPanel: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,
    },

    currentIcon: {
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
        CustomerColors.primarySoft,
    },

    currentContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    currentText: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       ACTION
    ======================================================== */

    primaryButton: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.md,
    },
  });