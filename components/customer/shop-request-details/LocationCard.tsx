import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

import AppLoader from "@/components/common/AppLoader";
import { AppText } from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

type ShopRequestStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "completed"
  | "cancelled";

type Props = {
  loading: boolean;
  latitude?: number;
  longitude?: number;
  hasLocation: boolean;
  status: ShopRequestStatus | string;
  onPress: () => void;
};

/* ==============================================================
   STATUS COLORS
============================================================== */

const STATUS_COLORS: Record<
  ShopRequestStatus,
  string
> = {
  pending: "#D99A00",
  accepted: CustomerColors.primary,
  declined: "#D93025",
  completed: "#16A34A",
  cancelled: Colors.textSecondary,
};

/* ==============================================================
   LOCKED STATUS MESSAGES
============================================================== */

const STATUS_MESSAGES: Record<
  ShopRequestStatus,
  string
> = {
  pending:
    "The map will be open if the shop accepts your request so that you can go to the shop.",

  accepted: "",

  declined:
    "The shop declined your request.",

  completed:
    "The visit is no longer available because you have already been to the shop.",

  cancelled:
    "The map is no longer available for this request.",
};

/* ==============================================================
   STATUS NORMALIZER
============================================================== */

function normalizeStatus(
  value: ShopRequestStatus | string,
): ShopRequestStatus {
  const normalized = String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  switch (normalized) {
    case "pending":
      return "pending";

    case "accepted":
      return "accepted";

    case "declined":
      return "declined";

    case "completed":
      return "completed";

    case "cancelled":
    case "canceled":
      return "cancelled";

    default:
      return "pending";
  }
}

/* ==============================================================
   COMPONENT
============================================================== */

export default function LocationCard({
  loading,
  latitude,
  longitude,
  hasLocation,
  status,
  onPress,
}: Props) {
  const normalizedStatus = useMemo(
    () => normalizeStatus(status),
    [status],
  );

  /* ============================================================
     LOCATION VALIDATION
  ============================================================ */

  const hasValidLocation =
    hasLocation &&
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

  /* ============================================================
     MAP STATE
  ============================================================ */

  const isAccepted =
    normalizedStatus === "accepted";

  /*
   * ONLY ACCEPTED CAN OPEN THE MAP.
   */
  const canOpenMap =
    isAccepted &&
    hasValidLocation;

  /* ============================================================
     STATUS UI
  ============================================================ */

  const statusColor =
    STATUS_COLORS[normalizedStatus];

  const lockedMessage =
    STATUS_MESSAGES[normalizedStatus];

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <View style={styles.sectionCard}>
      {/* ========================================================
         LOCATION TITLE
      ======================================================== */}

      <View style={styles.sectionTitleRow}>
        <Ionicons
          name="location-outline"
          size={16}
          color={CustomerColors.primary}
        />

        <AppText
          variant="caption"
          weight="bold"
        >
          Location
        </AppText>
      </View>

      {/* ========================================================
         LOADING
      ======================================================== */}

      {loading ? (
        <View style={styles.mapLoading}>
          <AppLoader
            role="customer"
            size="sm"
            message="Loading location..."
          />
        </View>
      ) : !hasValidLocation ? (
        /* ======================================================
           LOCATION UNAVAILABLE
        ====================================================== */

        <View style={styles.locationUnavailable}>
          <Ionicons
            name="location-outline"
            size={17}
            color={Colors.textSecondary}
          />

          <AppText
            variant="caption"
            tone="secondary"
            style={styles.flexContent}
          >
            Shop location is currently unavailable.
          </AppText>
        </View>
      ) : (
        /* ======================================================
           MAP
        ====================================================== */

        <View style={styles.mapWrapper}>
          {canOpenMap ? (
            /* ==================================================
               ACCEPTED
               ACTIVE MAP
            ================================================== */

            <>
              <Pressable
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel="Get directions to the shop"
                accessibilityHint="Opens the shop location and directions."
                style={({ pressed }) => [
                  styles.mapPreviewContainer,
                  pressed && styles.pressed,
                ]}
              >
                <MapView
                  pointerEvents="none"
                  style={styles.mapPreview}
                  initialRegion={{
                    latitude,
                    longitude,
                    latitudeDelta: 0.008,
                    longitudeDelta: 0.008,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  rotateEnabled={false}
                  pitchEnabled={false}
                  toolbarEnabled={false}
                >
                  <Marker
                    coordinate={{
                      latitude,
                      longitude,
                    }}
                  />
                </MapView>
              </Pressable>

              {/* =================================================
                 ACTIVE DIRECTIONS BUTTON
              ================================================= */}

              <Pressable
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel="Get directions to the shop"
                accessibilityHint="Opens the shop location and directions."
                style={({ pressed }) => [
                  styles.directionsButton,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={
                    styles.directionsContent
                  }
                >
                  <Ionicons
                    name="navigate-outline"
                    size={17}
                    color={
                      CustomerColors.primary
                    }
                  />

                  <AppText
                    variant="caption"
                    weight="semibold"
                    style={
                      styles.directionsText
                    }
                  >
                    Get directions to the shop
                  </AppText>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={17}
                  color={
                    Colors.textSecondary
                  }
                />
              </Pressable>
            </>
          ) : (
            /* ==================================================
               LOCKED
               PENDING / DECLINED /
               COMPLETED / CANCELLED
            ================================================== */

            <>
              {/* =================================================
                 LOCKED MAP
              ================================================= */}

              <View
                style={
                  styles.mapPreviewContainer
                }
              >
                <MapView
                  pointerEvents="none"
                  style={[
                    styles.mapPreview,
                    styles.lockedMap,
                  ]}
                  initialRegion={{
                    latitude,
                    longitude,
                    latitudeDelta: 0.008,
                    longitudeDelta: 0.008,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  rotateEnabled={false}
                  pitchEnabled={false}
                  toolbarEnabled={false}
                >
                  <Marker
                    coordinate={{
                      latitude,
                      longitude,
                    }}
                  />
                </MapView>

                {/* =============================================
                   LOCK OVERLAY
                ============================================= */}

                <View
                  pointerEvents="none"
                  style={
                    styles.lockOverlay
                  }
                >
                  <View
                    style={[
                      styles.lockBox,
                      {
                        borderColor:
                          statusColor,
                      },
                    ]}
                  >
                    <View
                      style={
                        styles.lockIconContainer
                      }
                    >
                      <Ionicons
                        name="lock-closed"
                        size={18}
                        color={
                          statusColor
                        }
                      />
                    </View>

                    <Text
                      allowFontScaling
                      style={[
                        styles.lockText,
                        {
                          color:
                            statusColor,
                        },
                      ]}
                    >
                      {lockedMessage}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  pressed: {
    opacity:
      FixxamTokens.motion.pressedOpacity,
  },

  flexContent: {
    flex: 1,
    minWidth: 0,
  },

  sectionCard: {
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderWidth:
      StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 6,
  },

  mapLoading: {
    minHeight: 90,
    alignItems: "center",
    justifyContent: "center",
  },

  mapWrapper: {
    overflow: "hidden",
    borderWidth:
      StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.background,
  },

  mapPreviewContainer: {
    position: "relative",
    width: "100%",
    height: 90,
    overflow: "hidden",
    backgroundColor: Colors.background,
  },

  mapPreview: {
    width: "100%",
    height: "100%",
  },

  /* ==========================================================
     LOCKED MAP
  ========================================================== */

  lockedMap: {
    opacity: 0.38,
  },

  /* ==========================================================
     LOCK OVERLAY
  ========================================================== */

  lockOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 10,

    backgroundColor:
      "rgba(255,255,255,0.18)",

    zIndex: 100,
    elevation: 100,
  },

  /* ==========================================================
     LOCK MESSAGE BOX
  ========================================================== */

  lockBox: {
    width: "94%",
    minHeight: 48,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 12,
    paddingVertical: 9,

    borderWidth: 1.2,
    borderRadius: 12,

    backgroundColor: "#FFFFFF",

    zIndex: 101,
    elevation: 101,
  },

  lockIconContainer: {
    width: 26,

    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,
  },

  lockText: {
    flex: 1,

    marginLeft: 8,

    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",

    textAlign: "center",

    includeFontPadding: true,
  },

  /* ==========================================================
     ACCEPTED — DIRECTIONS BUTTON
  ========================================================== */

  directionsButton: {
    minHeight: 44,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    gap: 8,

    paddingHorizontal: 10,

    borderTopWidth:
      StyleSheet.hairlineWidth,
    borderTopColor:
      Colors.border,

    backgroundColor:
      Colors.surface,
  },

  directionsContent: {
    flex: 1,
    minWidth: 0,

    flexDirection: "row",
    alignItems: "center",

    gap: 6,
  },

  directionsText: {
    flex: 1,
    color: CustomerColors.primary,
  },

  /* ==========================================================
     LOCATION UNAVAILABLE
  ========================================================== */

  locationUnavailable: {
    minHeight: 38,

    flexDirection: "row",
    alignItems: "center",

    gap: 6,

    paddingHorizontal: 7,

    borderRadius: 9,

    backgroundColor:
      Colors.background,
  },
});