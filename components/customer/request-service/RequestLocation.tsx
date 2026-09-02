import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import * as Location from "expo-location";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

import BookingLocationType from "./BookingLocationType";

import BookingManualLocation, {
  BookingLocationSuggestion,
} from "./BookingManualLocation";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type Coordinates = {
  latitude: number;
  longitude: number;
};

type SelectedLocation = Coordinates & {
  address?: string;
};

type LocationType =
  | "current"
  | "manual";

type Props = {
  /*
   * Whether a location has already
   * been selected by the customer.
   */
  selected: boolean;

  /*
   * Address currently displayed on
   * the service location card.
   */
  address?: string;

  /*
   * Called when customer opens/selects
   * the location card.
   */
  onPress: () => void;

  /*
   * Returns the final selected location
   * to the parent screen.
   */
  onLocationSelected?: (
    location: SelectedLocation,
  ) => void;

  /*
   * Disable the entire location selector.
   */
  disabled?: boolean;

  /*
   * Existing/current coordinates supplied
   * by the parent as a fallback.
   */
  currentLocation?: Coordinates | null;

  /*
   * Location search suggestions.
   */
  suggestions?: BookingLocationSuggestion[];

  /*
   * Whether location suggestions are
   * currently loading.
   */
  suggestionsLoading?: boolean;

  /*
   * Search callback connected to the
   * parent/useBookingLocation hook.
   */
  onSearchLocation?: (
    query: string,
  ) => void;
};

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

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
  /* ============================================================
     MODAL STATE
  ============================================================ */

  const [visible, setVisible] =
    useState(false);

  const [locationType, setLocationType] =
    useState<LocationType>("current");

  const [
    selectedLocationType,
    setSelectedLocationType,
  ] = useState<LocationType | null>(
    null,
  );

  const [manualAddress, setManualAddress] =
    useState("");

  /*
   * Coordinates selected from a location
   * search suggestion.
   */
  const [
    manualCoordinates,
    setManualCoordinates,
  ] = useState<Coordinates | null>(
    null,
  );

  const [
    selectingCurrent,
    setSelectingCurrent,
  ] = useState(false);

  /* ============================================================
     OPEN MODAL
  ============================================================ */

  const openModal = useCallback(() => {
    if (disabled) {
      return;
    }

    /*
     * Always start from current location.
     */
    setLocationType("current");

    /*
     * Do not copy the existing address
     * into manual search.
     */
    setManualAddress("");

    setManualCoordinates(null);

    setVisible(true);

    onPress();
  }, [
    disabled,
    onPress,
  ]);

  /* ============================================================
     CLOSE MODAL
  ============================================================ */

  const closeModal = useCallback(() => {
    /*
     * Prevent closing while GPS is being
     * requested.
     */
    if (selectingCurrent) {
      return;
    }

    setVisible(false);
  }, [
    selectingCurrent,
  ]);

  /* ============================================================
     LOCATION TYPE
  ============================================================ */

  const handleTypeChange =
    useCallback(
      (type: LocationType) => {
        setLocationType(type);

        /*
         * Manual search starts clean.
         */
        if (type === "manual") {
          setManualAddress("");

          setManualCoordinates(null);

          /*
           * Clear previous search results
           * through the parent hook.
           */
          onSearchLocation?.("");

          return;
        }

        /*
         * Switching back to current location
         * should clear manual selection.
         */
        setManualAddress("");

        setManualCoordinates(null);

        onSearchLocation?.("");
      },
      [
        onSearchLocation,
      ],
    );

  /* ============================================================
     BUILD READABLE ADDRESS
  ============================================================ */

  const buildAddress = useCallback(
    (
      place:
        | Location.LocationGeocodedAddress
        | undefined,
    ): string => {
      if (!place) {
        return "";
      }

      /*
       * Build street number + street.
       */
      const street = [
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

      /*
       * Build complete readable address.
       */
      const parts = [
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

      /*
       * Remove duplicate address
       * sections.
       */
      const uniqueParts = [
        ...new Set(
          parts.map((part) =>
            part.trim(),
          ),
        ),
      ];

      return uniqueParts.join(", ");
    },
    [],
  );

  /* ============================================================
     CURRENT LOCATION
  ============================================================ */

  const handleCurrentLocation =
    useCallback(async () => {
      /*
       * Prevent multiple GPS requests.
       */
      if (selectingCurrent) {
        return;
      }

      setSelectingCurrent(true);

      try {
        /* ======================================================
           PERMISSION
        ====================================================== */

        const permission =
          await Location.getForegroundPermissionsAsync();

        if (
          permission.status !==
          Location.PermissionStatus.GRANTED
        ) {
          Alert.alert(
            "Location permission required",
            "Please allow Fixxam to access your location so we can use your current location.",
          );

          return;
        }

        /* ======================================================
           GET FRESH GPS
        ====================================================== */

        let position:
          | Location.LocationObject
          | null = null;

        try {
          position =
            await Location.getCurrentPositionAsync(
              {
                accuracy:
                  Location.Accuracy.High,
              },
            );
        } catch (locationError) {
          console.warn(
            "FRESH_LOCATION_ERROR",
            locationError,
          );

          /*
           * Fallback to parent coordinates
           * if fresh GPS fails.
           */
          if (currentLocation) {
            position = {
              coords: {
                latitude:
                  currentLocation.latitude,

                longitude:
                  currentLocation.longitude,

                altitude: null,

                accuracy: null,

                altitudeAccuracy: null,

                heading: null,

                speed: null,
              },

              timestamp: Date.now(),
            } as Location.LocationObject;
          }
        }

        /* ======================================================
           VALIDATE POSITION
        ====================================================== */

        if (!position) {
          Alert.alert(
            "Location unavailable",
            "We couldn't determine your current location. Please check your GPS and try again.",
          );

          return;
        }

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        /*
         * Validate coordinates.
         */
        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)
        ) {
          Alert.alert(
            "Location unavailable",
            "Your current location could not be determined. Please try again.",
          );

          return;
        }

        /* ======================================================
           REVERSE GEOCODING
        ====================================================== */

        let currentAddress =
          "Current location";

        try {
          const results =
            await Location.reverseGeocodeAsync(
              {
                latitude,
                longitude,
              },
            );

          const place = results[0];

          const readableAddress =
            buildAddress(place);

          if (
            readableAddress.trim()
          ) {
            currentAddress =
              readableAddress;
          }
        } catch (geocodeError) {
          /*
           * GPS is still valid even if
           * reverse geocoding fails.
           */
          console.warn(
            "CURRENT_LOCATION_GEOCODING_ERROR",
            geocodeError,
          );
        }

        /* ======================================================
           SAVE CURRENT LOCATION
        ====================================================== */

        setSelectedLocationType(
          "current",
        );

        /*
         * Send real coordinates + address
         * to parent.
         */
        onLocationSelected?.({
          latitude,
          longitude,
          address: currentAddress,
        });

        /*
         * Close after successful selection.
         */
        setVisible(false);
      } catch (error) {
        console.error(
          "SELECT_CURRENT_LOCATION_ERROR",
          error,
        );

        Alert.alert(
          "Location error",
          "We couldn't select your current location. Please try again.",
        );
      } finally {
        setSelectingCurrent(false);
      }
    }, [
      buildAddress,
      currentLocation,
      onLocationSelected,
      selectingCurrent,
    ]);

  /* ============================================================
     MANUAL ADDRESS CHANGE
  ============================================================ */

  const handleManualChange =
    useCallback(
      (text: string) => {
        setManualAddress(text);

        /*
         * If the customer edits the selected
         * suggestion, its coordinates are no
         * longer guaranteed to match.
         */
        setManualCoordinates(null);
      },
      [],
    );

  /* ============================================================
     LOCATION SEARCH
  ============================================================ */

  const handleSearchLocation =
    useCallback(
      (query: string) => {
        /*
         * Forward search to parent.
         *
         * The parent is responsible for
         * debounce/network/API handling.
         */
        onSearchLocation?.(query);
      },
      [
        onSearchLocation,
      ],
    );

  /* ============================================================
     SELECT LOCATION SUGGESTION
  ============================================================ */

  const handleSuggestionSelected =
    useCallback(
      (
        suggestion: BookingLocationSuggestion,
      ) => {
        /*
         * Validate coordinates before
         * accepting the suggestion.
         */
        if (
          !Number.isFinite(
            suggestion.latitude,
          ) ||
          !Number.isFinite(
            suggestion.longitude,
          )
        ) {
          Alert.alert(
            "Location unavailable",
            "This location does not have valid coordinates. Please choose another location.",
          );

          return;
        }

        /*
         * Save readable address.
         */
        setManualAddress(
          suggestion.title,
        );

        /*
         * Save actual GPS coordinates.
         */
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
    useCallback(() => {
      const cleanAddress =
        manualAddress.trim();

      /*
       * Address is required.
       */
      if (!cleanAddress) {
        Alert.alert(
          "Enter your location",
          "Please enter the address or area where the worker should come.",
        );

        return;
      }

      /*
       * Manual location can either have:
       *
       * 1. Real coordinates from a suggestion.
       * 2. 0,0 when customer entered an
       *    address manually.
       *
       * This preserves compatibility with
       * the existing booking model.
       */
      const latitude =
        manualCoordinates?.latitude ?? 0;

      const longitude =
        manualCoordinates?.longitude ?? 0;

      setSelectedLocationType(
        "manual",
      );

      /*
       * Return final location to parent.
       */
      onLocationSelected?.({
        latitude,
        longitude,
        address: cleanAddress,
      });

      setVisible(false);
    }, [
      manualAddress,
      manualCoordinates,
      onLocationSelected,
    ]);

  /* ============================================================
     RESET LOADING STATE
  ============================================================ */

  useEffect(() => {
    if (visible) {
      return;
    }

    setSelectingCurrent(false);
  }, [
    visible,
  ]);

  /* ============================================================
     CARD DATA
  ============================================================ */

  const cleanAddress =
    address?.trim() || "";

  const locationLabel =
    selectedLocationType ===
    "manual"
      ? "Manual location"
      : selectedLocationType ===
          "current"
        ? "Current location"
        : null;

  /* ============================================================
     UI
  ============================================================ */

  return (
    <>
      {/* ========================================================
          SERVICE LOCATION CARD
      ======================================================== */}

      <Pressable
        onPress={openModal}
        disabled={disabled}
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
        style={({ pressed }) => [
          styles.card,

          disabled &&
            styles.cardDisabled,

          pressed &&
            !disabled &&
            styles.cardPressed,
        ]}
      >
        {/* LOCATION ICON */}

        <View
          style={styles.iconContainer}
        >
          <Ionicons
            name="location-outline"
            size={22}
            color="#EF4444"
          />
        </View>

        {/* CONTENT */}

        <View
          style={styles.cardContent}
        >
          <AppText
            weight="bold"
            numberOfLines={1}
            style={styles.title}
          >
            Service location
          </AppText>

          {selected &&
          locationLabel ? (
            <>
              <AppText
                weight="bold"
                numberOfLines={1}
                style={
                  styles.locationType
                }
              >
                {locationLabel}
              </AppText>

              <AppText
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.address}
              >
                {cleanAddress ||
                  "Location selected"}
              </AppText>
            </>
          ) : (
            <AppText
              numberOfLines={2}
              ellipsizeMode="tail"
              style={styles.address}
            >
              Choose where the worker
              should come
            </AppText>
          )}
        </View>

        {/* CHEVRON */}

        <View
          style={
            styles.chevronContainer
          }
        >
          <Ionicons
            name="chevron-forward"
            size={18}
            color="#64748B"
          />
        </View>
      </Pressable>

      {/* ========================================================
          LOCATION MODAL
      ======================================================== */}

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
          style={styles.modalRoot}
        >
          {/* BACKDROP */}

          <Pressable
            style={styles.backdrop}
            onPress={closeModal}
          />

          {/* SHEET */}

          <View
            style={styles.modalCard}
          >
            {/* HANDLE */}

            <View
              style={styles.handle}
            />

            {/* HEADER */}

            <View
              style={styles.modalHeader}
            >
              <View
                style={
                  styles.modalHeaderIcon
                }
              >
                <Ionicons
                  name="location"
                  size={21}
                  color="#2563EB"
                />
              </View>

              <View
                style={
                  styles.modalHeaderContent
                }
              >
                <AppText
                  weight="bold"
                  style={
                    styles.modalTitle
                  }
                >
                  Service location
                </AppText>

                <AppText
                  style={
                    styles.modalSubtitle
                  }
                >
                  Where should the worker come?
                </AppText>
              </View>

              <Pressable
                onPress={closeModal}
                disabled={
                  selectingCurrent
                }
                accessibilityRole="button"
                accessibilityLabel="Close location"
                accessibilityState={{
                  disabled:
                    selectingCurrent,
                }}
                style={({ pressed }) => [
                  styles.closeButton,

                  pressed &&
                    styles.closeButtonPressed,
                ]}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color="#475569"
                />
              </Pressable>
            </View>

            {/* LOCATION TYPE */}

            <BookingLocationType
              value={locationType}
              onChange={
                handleTypeChange
              }
            />

            {/* ==================================================
                CURRENT LOCATION
            ================================================== */}

            {locationType ===
              "current" && (
              <>
                <View
                  style={
                    styles.currentPanel
                  }
                >
                  <View
                    style={
                      styles.currentIcon
                    }
                  >
                    <Ionicons
                      name="navigate"
                      size={20}
                      color="#2563EB"
                    />
                  </View>

                  <View
                    style={
                      styles.currentContent
                    }
                  >
                    <AppText
                      weight="bold"
                      style={
                        styles.currentTitle
                      }
                    >
                      Use my current location
                    </AppText>

                    <AppText
                      style={
                        styles.currentText
                      }
                    >
                      Fixxam will get your
                      latest GPS position and
                      use the location detected
                      by your phone.
                    </AppText>
                  </View>
                </View>

                <Pressable
                  onPress={
                    handleCurrentLocation
                  }
                  disabled={
                    selectingCurrent
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Use current location"
                  accessibilityState={{
                    disabled:
                      selectingCurrent,
                  }}
                  style={({ pressed }) => [
                    styles.primaryButton,

                    selectingCurrent &&
                      styles.primaryButtonDisabled,

                    pressed &&
                      !selectingCurrent &&
                      styles.primaryButtonPressed,
                  ]}
                >
                  {selectingCurrent ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <Ionicons
                      name="navigate"
                      size={19}
                      color="#FFFFFF"
                    />
                  )}

                  <AppText
                    weight="bold"
                    style={
                      styles.primaryButtonText
                    }
                  >
                    {selectingCurrent
                      ? "GETTING LOCATION..."
                      : "USE CURRENT LOCATION"}
                  </AppText>
                </Pressable>
              </>
            )}

            {/* ==================================================
                MANUAL LOCATION
            ================================================== */}

            {locationType ===
              "manual" && (
              <>
                <BookingManualLocation
                  value={manualAddress}
                  onChange={
                    handleManualChange
                  }
                  disabled={
                    suggestionsLoading
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

                <Pressable
                  onPress={
                    handleConfirmManual
                  }
                  disabled={
                    !manualAddress.trim()
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Confirm service location"
                  accessibilityState={{
                    disabled:
                      !manualAddress.trim(),
                  }}
                  style={({ pressed }) => [
                    styles.primaryButton,

                    !manualAddress.trim() &&
                      styles.primaryButtonDisabled,

                    pressed &&
                      manualAddress.trim() &&
                      styles.primaryButtonPressed,
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#FFFFFF"
                  />

                  <AppText
                    weight="bold"
                    style={
                      styles.primaryButtonText
                    }
                  >
                    CONFIRM LOCATION
                  </AppText>
                </Pressable>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

/*
 * ==============================================================
 * STYLES
 * ==============================================================
 */

const styles = StyleSheet.create({
  /* ==========================================================
     CARD
  ========================================================== */

  card: {
    minHeight: 82,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 13,
    paddingVertical: 11,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#E2E8F0",

    borderRadius: 18,

    shadowColor: "#0F172A",

    shadowOpacity: 0.035,

    shadowRadius: 9,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  cardPressed: {
    opacity: 0.88,

    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  cardDisabled: {
    opacity: 0.55,
  },

  /* ==========================================================
     LOCATION ICON
  ========================================================== */

  iconContainer: {
    width: 44,

    height: 44,

    borderRadius: 14,

    backgroundColor: "#FEF2F2",

    borderWidth: 1,

    borderColor: "#FECACA",

    alignItems: "center",

    justifyContent: "center",
  },

  /* ==========================================================
     CARD CONTENT
  ========================================================== */

  cardContent: {
    flex: 1,

    minWidth: 0,

    marginLeft: 10,

    marginRight: 8,
  },

  title: {
    fontSize: 14,

    lineHeight: 19,

    color: "#0F172A",
  },

  locationType: {
    marginTop: 2,

    fontSize: 11.5,

    lineHeight: 16,

    color: "#2563EB",
  },

  address: {
    marginTop: 1,

    fontSize: 11.5,

    lineHeight: 17,

    color: "#64748B",
  },

  /* ==========================================================
     CHEVRON
  ========================================================== */

  chevronContainer: {
    width: 34,

    height: 34,

    borderRadius: 11,

    backgroundColor: "#F8FAFC",

    alignItems: "center",

    justifyContent: "center",
  },

  /* ==========================================================
     MODAL
  ========================================================== */

  modalRoot: {
    flex: 1,

    justifyContent: "flex-end",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor:
      "rgba(15, 23, 42, 0.52)",
  },

  modalCard: {
    width: "100%",

    maxHeight: "90%",

    paddingHorizontal: 18,

    paddingTop: 9,

    paddingBottom: 25,

    backgroundColor: "#FFFFFF",

    borderTopLeftRadius: 28,

    borderTopRightRadius: 28,

    shadowColor: "#000000",

    shadowOpacity: 0.15,

    shadowRadius: 20,

    shadowOffset: {
      width: 0,

      height: -6,
    },

    elevation: 20,
  },

  handle: {
    alignSelf: "center",

    width: 42,

    height: 4,

    borderRadius: 2,

    backgroundColor: "#CBD5E1",

    marginBottom: 15,
  },

  /* ==========================================================
     HEADER
  ========================================================== */

  modalHeader: {
    flexDirection: "row",

    alignItems: "center",
  },

  modalHeaderIcon: {
    width: 44,

    height: 44,

    borderRadius: 14,

    backgroundColor: "#EFF6FF",

    borderWidth: 1,

    borderColor: "#DBEAFE",

    alignItems: "center",

    justifyContent: "center",
  },

  modalHeaderContent: {
    flex: 1,

    minWidth: 0,

    marginLeft: 10,
  },

  modalTitle: {
    fontSize: 17,

    lineHeight: 22,

    color: "#0F172A",
  },

  modalSubtitle: {
    marginTop: 1,

    fontSize: 10.5,

    lineHeight: 15,

    color: "#64748B",
  },

  closeButton: {
    width: 37,

    height: 37,

    borderRadius: 12,

    backgroundColor: "#F8FAFC",

    alignItems: "center",

    justifyContent: "center",
  },

  closeButtonPressed: {
    opacity: 0.6,
  },

  /* ==========================================================
     CURRENT LOCATION PANEL
  ========================================================== */

  currentPanel: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 14,

    padding: 12,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#E2E8F0",

    borderRadius: 18,

    shadowColor: "#0F172A",

    shadowOpacity: 0.03,

    shadowRadius: 8,

    shadowOffset: {
      width: 0,

      height: 3,
    },

    elevation: 1,
  },

  currentIcon: {
    width: 42,

    height: 42,

    borderRadius: 13,

    backgroundColor: "#EFF6FF",

    borderWidth: 1,

    borderColor: "#DBEAFE",

    alignItems: "center",

    justifyContent: "center",
  },

  currentContent: {
    flex: 1,

    minWidth: 0,

    marginLeft: 9,
  },

  currentTitle: {
    fontSize: 13,

    lineHeight: 18,

    color: "#0F172A",
  },

  currentText: {
    marginTop: 2,

    fontSize: 10.5,

    lineHeight: 15,

    color: "#64748B",
  },

  /* ==========================================================
     PRIMARY BUTTON
  ========================================================== */

  primaryButton: {
    minHeight: 52,

    marginTop: 12,

    borderRadius: 16,

    backgroundColor: "#2563EB",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 8,
  },

  primaryButtonPressed: {
    opacity: 0.88,

    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  primaryButtonDisabled: {
    opacity: 0.45,
  },

  primaryButtonText: {
    fontSize: 12.5,

    lineHeight: 18,

    color: "#FFFFFF",
  },
});