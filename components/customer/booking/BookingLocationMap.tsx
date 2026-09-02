import React, {
  memo,
  useEffect,
  useRef,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  region: Region;

  marker: {
    latitude: number;
    longitude: number;
  };

  onMarkerDragEnd: (
    event: any
  ) => void;

  address: string;

  onLocateMe?: () => void;
};

function BookingLocationMap({
  region,
  marker,
  onMarkerDragEnd,
  address,
  onLocateMe,
}: Props) {
  const mapRef =
    useRef<MapView>(null);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    mapRef.current.animateCamera(
      {
        center: {
          latitude: region.latitude,
          longitude: region.longitude,
        },
        zoom: 16,
      },
      {
        duration: 500,
      }
    );
  }, [
    region.latitude,
    region.longitude,
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.mapWrapper}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
          rotateEnabled={false}
          pitchEnabled={false}
          toolbarEnabled={false}
        >
          <Marker
            draggable
            coordinate={marker}
            tracksViewChanges={false}
            onDragEnd={
              onMarkerDragEnd
            }
          >
            <View style={styles.marker}>
              <View
                style={
                  styles.markerInner
                }
              />
            </View>
          </Marker>
        </MapView>

        {onLocateMe && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Use my current location"
            onPress={onLocateMe}
            style={({ pressed }) => [
              styles.locateButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <Ionicons
              name="locate-outline"
              size={19}
              color="#2563EB"
            />
          </Pressable>
        )}
      </View>

      <View style={styles.footer}>
        <Ionicons
          name="location-outline"
          size={16}
          color="#16A34A"
        />

        <AppText
          numberOfLines={2}
          style={styles.address}
        >
          {address ||
            "Choose your service location."}
        </AppText>
      </View>
    </View>
  );
}

export default memo(
  BookingLocationMap
);

const styles = StyleSheet.create({
  container: {
    marginTop: 12,

    overflow: "hidden",

    borderRadius: 16,

    borderWidth: 1,
    borderColor: "#E2E8F0",

    backgroundColor: "#FFFFFF",
  },

  mapWrapper: {
    position: "relative",
  },

  map: {
    width: "100%",
    height: 190,
  },

  locateButton: {
    position: "absolute",

    bottom: 10,
    right: 10,

    width: 36,
    height: 36,

    borderRadius: 10,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 3,
  },

  marker: {
    width: 24,
    height: 24,

    borderRadius: 12,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 2,
    borderColor: "#F97316",
  },

  markerInner: {
    width: 8,
    height: 8,

    borderRadius: 4,

    backgroundColor: "#F97316",
  },

  footer: {
    minHeight: 48,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  address: {
    flex: 1,

    marginLeft: 7,

    fontSize: 12,
    lineHeight: 17,

    color: "#475569",
  },

  pressed: {
    opacity: 0.72,
  },
});