import React, {
  memo,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  StyleSheet,
} from "react-native";

import BookingCard from "../booking/BookingCard";
import BookingLocationMap from "../booking/BookingLocationMap";

import BookingLocationHeader from "./BookingLocationHeader";
import BookingLocationPermission from "./BookingLocationPermission";
import BookingLocationType, {
  LocationType,
} from "./BookingLocationType";
import BookingManualLocation from "./BookingManualLocation";
import BookingCurrentLocation from "./BookingCurrentLocation";

import useBookingLocation from "@/hooks/booking/useBookingLocation";

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
  ] = useState("");

  /* ============================================================
     INITIAL / MANUAL ADDRESS
  ============================================================ */

  useEffect(() => {
    if (locationType !== "manual") {
      return;
    }

    setManualAddress(address);
  }, [locationType]);

  /* ============================================================
     CURRENT LOCATION
  ============================================================ */

  useEffect(() => {
    if (
      locationType !== "current"
    ) {
      return;
    }

    const currentAddress =
      location.address.trim();

    if (!currentAddress) {
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
    locationType,
    location.address,
    address,
    onAddressChange,
  ]);

  /* ============================================================
     LOCATION TYPE
  ============================================================ */

  const handleLocationTypeChange =
    useCallback(
      (type: LocationType) => {
        if (type === "manual") {
          /*
           * Manual mode is completely
           * controlled by the customer.
           *
           * No Google search.
           * No suggestions.
           * No geocoding.
           */
          const existingAddress =
            address.trim();

          setManualAddress(
            existingAddress,
          );

          onLocationTypeChange(
            type,
          );

          return;
        }

        /*
         * Current mode.
         *
         * Clear the manual local state.
         * GPS will provide the address.
         */
        setManualAddress("");

        onLocationTypeChange(
          type,
        );
      },
      [
        address,
        onLocationTypeChange,
      ],
    );

  /* ============================================================
     MANUAL ADDRESS
  ============================================================ */

  const handleManualAddressChange =
    useCallback(
      (text: string) => {
        setManualAddress(text);

        onAddressChange(text);
      },
      [onAddressChange],
    );

  /* ============================================================
     CURRENT LOCATION
  ============================================================ */

  const handleGetCurrentLocation =
    useCallback(
      async () => {
        const result =
          await location.getCurrentLocation();

        if (
          result?.address
        ) {
          onAddressChange(
            result.address,
          );
        }
      },
      [
        location.getCurrentLocation,
        onAddressChange,
      ],
    );

  /* ============================================================
     MAP LOCATE
  ============================================================ */

  const handleLocateMe =
    useCallback(() => {
      void handleGetCurrentLocation();
    }, [
      handleGetCurrentLocation,
    ]);

  /* ============================================================
     MARKER DRAG
  ============================================================ */

  const handleMarkerDragEnd =
    useCallback(
      async (
        event: any,
      ) => {
        /*
         * Marker dragging belongs
         * to Current Location mode.
         *
         * Manual address remains
         * completely untouched.
         */
        if (
          locationType !==
          "current"
        ) {
          return;
        }

        const result =
          await location.onMarkerDragEnd(
            event,
          );

        if (
          result?.address
        ) {
          onAddressChange(
            result.address,
          );
        }
      },
      [
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
      style={styles.card}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <BookingLocationHeader
        address={address}
      />

      {/* ======================================================
          CURRENT / MANUAL
      ====================================================== */}

      <BookingLocationType
        value={locationType}
        onChange={
          handleLocationTypeChange
        }
      />

      {/* ======================================================
          CURRENT LOCATION
      ====================================================== */}

      {locationType ===
        "current" && (
        <>
          {!location.permissionGranted && (
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
          )}

          <BookingCurrentLocation
            loading={
              location.loading
            }
            permissionGranted={
              location.permissionGranted
            }
            address={address}
            onRefresh={
              handleGetCurrentLocation
            }
          />
        </>
      )}

      {/* ======================================================
          MANUAL LOCATION

          IMPORTANT:
          No suggestions.
          No Google Places.
          No location search.
      ====================================================== */}

      {locationType ===
        "manual" && (
        <BookingManualLocation
          value={manualAddress}
          onChange={
            handleManualAddressChange
          }
        />
      )}

      {/* ======================================================
          MAP
      ====================================================== */}

      <BookingLocationMap
        region={
          location.region
        }
        marker={
          location.marker
        }
        address={address}
        onLocateMe={
          handleLocateMe
        }
        onMarkerDragEnd={
          handleMarkerDragEnd
        }
      />
    </BookingCard>
  );
}

export default memo(
  BookingLocationCard,
);

const styles =
  StyleSheet.create({
    card: {
      marginTop: 2,
    },
  });