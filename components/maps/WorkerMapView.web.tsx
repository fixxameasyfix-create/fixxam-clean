import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
} from "react";

import {
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type WorkerMapHandle = {
  animateToRegion: (
    region: Region,
    duration?: number,
  ) => void;
  fitToCoordinates: (
    coordinates: Array<{
      latitude: number;
      longitude: number;
    }>,
    options?: {
      edgePadding?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
      };
      animated?: boolean;
    },
  ) => void;
};

type MapProps = {
  children?: React.ReactNode;
  style?: ViewStyle;
  initialRegion?: Region;
  provider?: string;
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  showsCompass?: boolean;
  toolbarEnabled?: boolean;
  rotateEnabled?: boolean;
  pitchEnabled?: boolean;
  onMapReady?: () => void;
};

const WebMap = forwardRef<WorkerMapHandle, MapProps>(
  function WebMap(
    { style, initialRegion, onMapReady },
    ref,
  ) {
    useImperativeHandle(
      ref,
      () => ({
        animateToRegion: () => undefined,
        fitToCoordinates: () => undefined,
      }),
      [],
    );

    useEffect(() => {
      onMapReady?.();
    }, [onMapReady]);

    return (
      <View style={[styles.container, style]}>
        <Text style={styles.title}>
          Map preview unavailable
        </Text>

        <Text style={styles.description}>
          Open Fixxam on Android or iOS to use the interactive map.
        </Text>

        {initialRegion ? (
          <Text style={styles.coordinates}>
            {initialRegion.latitude.toFixed(5)},{" "}
            {initialRegion.longitude.toFixed(5)}
          </Text>
        ) : null}
      </View>
    );
  },
);

WebMap.displayName = "WorkerWebMap";

export function Marker(
  _props: Record<string, unknown>,
) {
  return null;
}

export const PROVIDER_GOOGLE = "google";

export default WebMap;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 240,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#EEF2F7",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#172033",
    textAlign: "center",
  },
  description: {
    marginTop: 8,
    maxWidth: 300,
    fontSize: 14,
    lineHeight: 21,
    color: "#586579",
    textAlign: "center",
  },
  coordinates: {
    marginTop: 12,
    fontSize: 12,
    color: "#586579",
  },
});