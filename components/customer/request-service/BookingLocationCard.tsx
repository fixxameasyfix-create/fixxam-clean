import React, {
  memo,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import BookingCard from "../booking/BookingCard";
import BookingLocationMap from "../booking/BookingLocationMap";

import BookingLocationHeader from "./BookingLocationHeader";
import BookingLocationPermission from "./BookingLocationPermission";

import BookingLocationType, {
  type LocationType,
} from "./BookingLocationType";

import BookingManualLocation from "./BookingManualLocation";
import BookingCurrentLocation from "./BookingCurrentLocation";

import useBookingLocation from "@/hooks/booking/useBookingLocation";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  locationType: LocationType;

  address: string;

  onLocationTypeChange: (
    value: LocationType,
  ) => void;

  onAddressChange: (
    address: string,
  ) => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function BookingLocationCard({
  locationType,
  address,
  onLocationTypeChange,
  onAddressChange,
}: Props) {
  const location =
    useBookingLocation();

  const [
    manualAddress,
    setManualAddress,
  ] =
    useState("");

  const busy =
    location.loading;

  /* ============================================================
     MANUAL ADDRESS SYNC
  ============================================================ */

  useEffect(() => {
    if (
      locationType !==
      "manual"
    ) {
      return;
    }

    const nextAddress =
      address.trim();

    setManualAddress(
      current =>
        current === nextAddress
          ? current
          : nextAddress,
    );
  }, [
    address,
    locationType,
  ]);

  /* ============================================================
     CURRENT LOCATION ADDRESS SYNC
  ============================================================ */

  useEffect(() => {
    if (
      locationType !==
      "current"
    ) {
      return;
    }

    const currentAddress =
      location.address.trim();

    if (
      !currentAddress
    ) {
      return;
    }

    if (
      currentAddress ===
      address.trim()
    ) {
      return;
    }

    onAddressChange(
      currentAddress,
    );
  }, [
    address,
    location.address,
    locationType,
    onAddressChange,
  ]);

  /* ============================================================
     LOCATION TYPE
  ============================================================ */

  const handleLocationTypeChange =
    useCallback(
      (
        type: LocationType,
      ) => {
        if (
          busy ||
          type ===
            locationType
        ) {
          return;
        }

        if (
          type ===
          "manual"
        ) {
          const existingAddress =
            address.trim();

          setManualAddress(
            existingAddress,
          );

          onLocationTypeChange(
            "manual",
          );

          return;
        }

        /*
         * Returning to current location:
         * manual draft no longer controls
         * the displayed booking address.
         */
        setManualAddress(
          "",
        );

        onLocationTypeChange(
          "current",
        );
      },
      [
        address,
        busy,
        locationType,
        onLocationTypeChange,
      ],
    );

  /* ============================================================
     MANUAL ADDRESS
  ============================================================ */

  const handleManualAddressChange =
    useCallback(
      (
        text: string,
      ) => {
        setManualAddress(
          text,
        );

        onAddressChange(
          text,
        );
      },
      [
        onAddressChange,
      ],
    );

  /* ============================================================
     GET CURRENT LOCATION
  ============================================================ */

  const handleGetCurrentLocation =
    useCallback(
      async () => {
        if (
          location.loading
        ) {
          return;
        }

        try {
          const result =
            await location
              .getCurrentLocation();

          const nextAddress =
            result?.address
              ?.trim();

          if (
            nextAddress
          ) {
            onAddressChange(
              nextAddress,
            );
          }
        } catch (
          error
        ) {
          console.error(
            "BOOKING_GET_CURRENT_LOCATION_ERROR:",
            error,
          );
        }
      },
      [
        location.getCurrentLocation,
        location.loading,
        onAddressChange,
      ],
    );

  /* ============================================================
     MAP LOCATE
  ============================================================ */

  const handleLocateMe =
    useCallback(
      () => {
        if (
          locationType !==
          "current"
        ) {
          return;
        }

        void handleGetCurrentLocation();
      },
      [
        handleGetCurrentLocation,
        locationType,
      ],
    );

  /* ============================================================
     MARKER DRAG
  ============================================================ */

  const handleMarkerDragEnd =
    useCallback(
      async (
        event: Parameters<
          typeof location.onMarkerDragEnd
        >[0],
      ) => {
        /*
         * Marker movement only controls
         * Current Location mode.
         */
        if (
          locationType !==
            "current" ||
          location.loading
        ) {
          return;
        }

        try {
          const result =
            await location
              .onMarkerDragEnd(
                event,
              );

          const nextAddress =
            result?.address
              ?.trim();

          if (
            nextAddress
          ) {
            onAddressChange(
              nextAddress,
            );
          }
        } catch (
          error
        ) {
          console.error(
            "BOOKING_MARKER_DRAG_ERROR:",
            error,
          );
        }
      },
      [
        location.loading,
        location.onMarkerDragEnd,
        locationType,
        onAddressChange,
      ],
    );

  /* ============================================================
     UI
  ============================================================ */

  return (
    <BookingCard
      style={
        styles.card
      }
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={
          styles.headerSection
        }
      >
        <BookingLocationHeader
          address={
            address
          }
        />
      </View>

      {/* ======================================================
          CURRENT / MANUAL SELECTOR
      ====================================================== */}

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
            handleLocationTypeChange
          }
          disabled={
            busy
          }
        />
      </View>

      {/* ======================================================
          CURRENT LOCATION
      ====================================================== */}

      {locationType ===
      "current" ? (
        <View
          style={
            styles.locationContent
          }
        >
          {!location.permissionGranted ? (
            <BookingLocationPermission
              granted={
                location.permissionGranted
              }
              loading={
                location.loading
              }
              onRequestPermission={
                handleGetCurrentLocation
              }
            />
          ) : (
            <>
              <BookingCurrentLocation
                loading={
                  location.loading
                }
                address={
                  address
                }
                onRefresh={
                  handleGetCurrentLocation
                }
              />

              <View
                style={
                  styles.mapSection
                }
              >
                <BookingLocationMap
                  region={
                    location.region
                  }
                  marker={
                    location.marker
                  }
                  address={
                    address
                  }
                  onLocateMe={
                    handleLocateMe
                  }
                  onMarkerDragEnd={
                    handleMarkerDragEnd
                  }
                />
              </View>
            </>
          )}
        </View>
      ) : null}

      {/* ======================================================
          MANUAL LOCATION
      ====================================================== */}

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
              handleManualAddressChange
            }
            disabled={
              busy
            }
          />
        </View>
      ) : null}
    </BookingCard>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    card: {
      width:
        "100%",

      marginTop:
        FixxamTokens.spacing.xxs,

      overflow:
        "hidden",

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    headerSection: {
      marginBottom:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       LOCATION TYPE
    ======================================================== */

    typeSection: {
      marginBottom:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       CURRENT LOCATION
    ======================================================== */

    locationContent: {
      width:
        "100%",
    },

    mapSection: {
      width:
        "100%",

      marginTop:
        FixxamTokens.spacing.sm,

      overflow:
        "hidden",

      borderRadius:
        FixxamTokens.radius.xl,
    },

    /* ========================================================
       MANUAL LOCATION
    ======================================================== */

    manualSection: {
      width:
        "100%",

      marginTop:
        FixxamTokens.spacing.sm,
    },
  });

export default memo(
  BookingLocationCard,
);