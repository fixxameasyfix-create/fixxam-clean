import React, { memo, useMemo } from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { Image } from "expo-image";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppCard,
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import type {
  BookingFulfillmentMode,
} from "@/types/bookingFulfillment";

import type {
  BookingPriority,
} from "@/types/bookingPriority";

import type {
  CustomerLiveTrackingState,
} from "@/hooks/orders/useCustomerLiveLocation";

/* ==============================================================
   TYPES
============================================================== */

type MaterialIconName =
  React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];

type BookingTiming =
  | "asap"
  | "schedule";

type TimingPresentation = {
  title: string;
  subtitle: string;
  urgent: boolean;
};

type CustomerSharingPresentation = {
  subtitle: string;
  badge:
    | "OFF"
    | "STARTING"
    | "LIVE"
    | "ATTENTION";
  icon:
    | "map-marker-off-outline"
    | "crosshairs"
    | "crosshairs-gps"
    | "alert-circle-outline";
};

type Props = {
  workerName: string;
  workerPhoto?: string | null;
  workerCategory?: string | null;

  serviceName: string;
  serviceIcon?: string | null;

  fulfillmentMode: BookingFulfillmentMode;

  description: string;
  photos: string[];

  address: string;
  hasCoordinates: boolean;

  trackingActive: boolean;
  liveTrackingAvailable: boolean;

  customerLiveSharingEnabled: boolean;
  customerLiveSharingState: CustomerLiveTrackingState;
  customerLiveLocationTracking: boolean;
  customerLiveSharingError?: string | null;
  customerLiveSharingBusy?: boolean;

  onStartCustomerLiveSharing: () => void;
  onStopCustomerLiveSharing: () => void;

  bookingPriority?: BookingPriority | null;
  timing?: BookingTiming | null;
  bookingDate?: string | null;
  bookingTime?: string | null;

  urgent?: boolean;
  date?: string | null;
  time?: string | null;

  onProfile: () => void;
  onMap: () => void;
  onLiveTrack: () => void;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanText(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function formatDisplayDate(value: unknown): string {
  const raw = cleanText(value);

  if (!raw) {
    return "";
  }

  const parsed = new Date(raw);

  if (!Number.isFinite(parsed.getTime())) {
    return raw;
  }

  return parsed.toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function resolveServiceIcon(
  value?: string | null,
): MaterialIconName {
  const icon = cleanText(value) as MaterialIconName;

  if (
    icon &&
    icon in MaterialCommunityIcons.glyphMap
  ) {
    return icon;
  }

  return "tools";
}

function resolveTimingPresentation({
  bookingPriority,
  timing,
  urgent,
  bookingDate,
  bookingTime,
  legacyDate,
  legacyTime,
}: {
  bookingPriority?: BookingPriority | null;
  timing?: BookingTiming | null;
  urgent?: boolean;
  bookingDate?: string | null;
  bookingTime?: string | null;
  legacyDate?: string | null;
  legacyTime?: string | null;
}): TimingPresentation {
  const resolvedDate = formatDisplayDate(
    bookingDate || legacyDate,
  );

  const resolvedTime = cleanText(
    bookingTime || legacyTime,
  );

  if (timing === "schedule") {
    const scheduleText = [
      resolvedDate,
      resolvedTime,
    ]
      .filter(Boolean)
      .join(" • ");

    return {
      title: "Scheduled",
      subtitle:
        scheduleText ||
        "Preferred service time",
      urgent: false,
    };
  }

  if (bookingPriority === "immediate") {
    return {
      title: "Immediately",
      subtitle: "As soon as possible",
      urgent: false,
    };
  }

  if (bookingPriority === "normal") {
    return {
      title: "Normally",
      subtitle: "Standard service priority",
      urgent: false,
    };
  }

  if (
    bookingPriority === "urgent" ||
    urgent === true
  ) {
    return {
      title: "Urgently",
      subtitle: "Urgent service requested",
      urgent: true,
    };
  }

  if (resolvedDate || resolvedTime) {
    return {
      title: "Scheduled",
      subtitle: [
        resolvedDate,
        resolvedTime,
      ]
        .filter(Boolean)
        .join(" • "),
      urgent: false,
    };
  }

  return {
    title: "Timing unavailable",
    subtitle:
      "Service timing information is not available.",
    urgent: false,
  };
}

/* ==============================================================
   COMPONENT
============================================================== */

function CustomerOrderRequest({
  workerName,
  workerPhoto,
  workerCategory,

  serviceName,
  serviceIcon,
  fulfillmentMode,

  description,
  photos,

  address,
  hasCoordinates,

  trackingActive,
  liveTrackingAvailable,

  customerLiveSharingEnabled,
  customerLiveSharingState,
  customerLiveLocationTracking,
  customerLiveSharingError,
  customerLiveSharingBusy = false,

  onStartCustomerLiveSharing,
  onStopCustomerLiveSharing,

  bookingPriority,
  timing,
  bookingDate,
  bookingTime,

  urgent = false,
  date,
  time,

  onProfile,
  onMap,
  onLiveTrack,
}: Props) {
  /* ============================================================
     SAFE VALUES
  ============================================================ */

  const safeWorkerName =
    cleanText(workerName) || "Worker";

  const safeWorkerCategory =
    cleanText(workerCategory) ||
    "Service provider";

  const safeWorkerPhoto =
    cleanText(workerPhoto);

  const safeServiceName =
    cleanText(serviceName) || "Service";

  const safeServiceIcon =
    resolveServiceIcon(serviceIcon);

  const isRemote =
    fulfillmentMode === "remote";

  const customerTravels =
    fulfillmentMode ===
    "customer_visits_worker";

  const workerTravels =
    fulfillmentMode ===
    "worker_visits_customer";

  const safeDescription =
    cleanText(description) ||
    "No description provided.";

  const safeAddress = isRemote
    ? ""
    : cleanText(address) ||
      "Location unavailable";

  /* ============================================================
     TIMING
  ============================================================ */

  const timingPresentation = useMemo(
    () =>
      resolveTimingPresentation({
        bookingPriority,
        timing,
        urgent,
        bookingDate,
        bookingTime,
        legacyDate: date,
        legacyTime: time,
      }),
    [
      bookingPriority,
      timing,
      urgent,
      bookingDate,
      bookingTime,
      date,
      time,
    ],
  );

  /* ============================================================
     CUSTOMER LIVE LOCATION
  ============================================================ */

  const customerSharingPresentation =
    useMemo<CustomerSharingPresentation>(
      () => {
        if (!trackingActive) {
          return {
            subtitle:
              "Available after the offer is accepted.",
            badge: "OFF",
            icon: "map-marker-off-outline",
          };
        }

        const isStarting =
          customerLiveSharingState ===
            "requesting-permission" ||
          (
            customerLiveSharingEnabled &&
            !customerLiveLocationTracking &&
            !customerLiveSharingError
          );

        if (isStarting) {
          return {
            subtitle:
              "Preparing your location for the worker.",
            badge: "STARTING",
            icon: "crosshairs",
          };
        }

        const hasSharingError =
          Boolean(customerLiveSharingError) ||
          customerLiveSharingState ===
            "permission-denied" ||
          customerLiveSharingState ===
            "error";

        if (hasSharingError) {
          return {
            subtitle:
              customerLiveSharingError ||
              "Live location sharing could not be started.",
            badge: "ATTENTION",
            icon: "alert-circle-outline",
          };
        }

        if (
          customerLiveSharingEnabled &&
          customerLiveLocationTracking
        ) {
          return {
            subtitle:
              `Your live location is being shared with ${safeWorkerName}.`,
            badge: "LIVE",
            icon: "crosshairs-gps",
          };
        }

        return {
          subtitle:
            `Allow ${safeWorkerName} to see your current location while this service is active.`,
          badge: "OFF",
          icon: "map-marker-off-outline",
        };
      },
      [
        customerLiveLocationTracking,
        customerLiveSharingEnabled,
        customerLiveSharingError,
        customerLiveSharingState,
        safeWorkerName,
        trackingActive,
      ],
    );

  const customerSharingStarting =
    customerLiveSharingState ===
      "requesting-permission" ||
    (
      customerLiveSharingEnabled &&
      !customerLiveLocationTracking &&
      !customerLiveSharingError
    );

  const customerSharingActionDisabled =
    !trackingActive ||
    customerLiveSharingBusy ||
    customerSharingStarting;

  /* ============================================================
     PHOTOS
  ============================================================ */

  const safePhotos = useMemo(() => {
    const seen = new Set<string>();

    return photos.reduce<string[]>(
      (items, photo) => {
        const value = cleanText(photo);

        if (!value || seen.has(value)) {
          return items;
        }

        seen.add(value);
        items.push(value);

        return items;
      },
      [],
    );
  }, [photos]);

  /* ============================================================
     LOCATION
  ============================================================ */

  const locationLabel = customerTravels
    ? "Worker location"
    : "Your service location";

  const locationDescription = customerTravels
    ? `You will travel to ${safeWorkerName}'s service location.`
    : `${safeWorkerName} will come to this location.`;

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <AppCard
      role="customer"
      variant="outlined"
      style={styles.card}
    >
      {/* Worker */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${safeWorkerName} profile`}
        onPress={onProfile}
        style={({ pressed }) => [
          styles.workerRow,
          pressed ? styles.pressed : null,
        ]}
      >
        <View style={styles.avatar}>
          {safeWorkerPhoto ? (
            <Image
              source={{
                uri: safeWorkerPhoto,
              }}
              style={styles.avatarImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={
                FixxamTokens.motion.fast
              }
              accessibilityLabel={`${safeWorkerName} profile photo`}
            />
          ) : (
            <AppIcon
              name="profile"
              role="customer"
              size="sm"
              state="muted"
            />
          )}
        </View>

        <View style={styles.workerInfo}>
          <AppText
            variant="bodyLarge"
            weight="semibold"
            numberOfLines={1}
          >
            {safeWorkerName}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            style={styles.workerCategory}
          >
            {safeWorkerCategory}
          </AppText>
        </View>

        <AppIcon
          name="next"
          role="customer"
          size="sm"
          state="muted"
        />
      </Pressable>

      <Divider />

      {/* Service */}

      <View style={styles.row}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons
            name={safeServiceIcon}
            size={21}
            color={CustomerColors.primary}
          />
        </View>

        <View style={styles.rowContent}>
          <AppText
            variant="caption"
            tone="muted"
          >
            Service
          </AppText>

          <AppText
            variant="bodyMedium"
            weight="semibold"
            numberOfLines={2}
            style={styles.rowValue}
          >
            {safeServiceName}
          </AppText>
        </View>
      </View>

      <Divider />

      {/* Request */}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppIcon
            name="messages"
            role="customer"
            size="xs"
            state="active"
          />

          <AppText
            variant="bodyMedium"
            weight="semibold"
            style={styles.sectionTitle}
          >
            Your request
          </AppText>
        </View>

        <AppText
          variant="body"
          tone="secondary"
          style={styles.description}
        >
          {safeDescription}
        </AppText>

        {safePhotos.length > 0 ? (
          <ScrollView
            horizontal
            bounces={false}
            overScrollMode="never"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photos}
          >
            {safePhotos.map(
              (photo, index) => (
                <Image
                  key={`${photo}-${index}`}
                  source={{ uri: photo }}
                  style={styles.photo}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={
                    FixxamTokens.motion.fast
                  }
                  accessibilityLabel={`Request photo ${index + 1}`}
                />
              ),
            )}
          </ScrollView>
        ) : null}
      </View>

      <Divider />

      {/* Service method / Location */}

      {isRemote ? (
        <View style={styles.row}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons
              name="laptop"
              size={21}
              color={CustomerColors.primary}
            />
          </View>

          <View style={styles.rowContent}>
            <AppText
              variant="caption"
              tone="muted"
            >
              Service method
            </AppText>

            <AppText
              variant="bodyMedium"
              weight="semibold"
              style={styles.rowValue}
            >
              Remote service
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={styles.secondaryText}
            >
              No physical service location is required.
            </AppText>
          </View>
        </View>
      ) : (
        <View style={styles.locationSection}>
          <View style={styles.locationRow}>
            <View style={styles.iconBox}>
              <AppIcon
                name="location"
                role="customer"
                size="sm"
                state="active"
              />
            </View>

            <View style={styles.rowContent}>
              <AppText
                variant="caption"
                tone="muted"
              >
                {locationLabel}
              </AppText>

              <AppText
                variant="bodyMedium"
                weight="semibold"
                numberOfLines={3}
                style={styles.rowValue}
              >
                {safeAddress}
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={styles.secondaryText}
              >
                {locationDescription}
              </AppText>
            </View>
          </View>

          {/* Customer visits worker */}

          {customerTravels ? (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`View map and directions to ${safeWorkerName}`}
                accessibilityState={{
                  disabled: !hasCoordinates,
                }}
                disabled={!hasCoordinates}
                onPress={onMap}
                style={({ pressed }) => [
                  styles.primaryLocationAction,

                  !hasCoordinates
                    ? styles.primaryLocationActionDisabled
                    : null,

                  pressed && hasCoordinates
                    ? styles.pressed
                    : null,
                ]}
              >
                <MaterialCommunityIcons
                  name="directions"
                  size={19}
                  color={
                    hasCoordinates
                      ? Colors.textInverse
                      : Colors.textMuted
                  }
                />

                <AppText
                  variant="bodyMedium"
                  weight="semibold"
                  style={[
                    styles.primaryLocationActionText,
                    !hasCoordinates
                      ? styles.locationActionTextDisabled
                      : null,
                  ]}
                >
                  View Map & Directions
                </AppText>
              </Pressable>

              {!hasCoordinates ? (
                <AppText
                  variant="caption"
                  tone="secondary"
                  style={styles.locationHint}
                >
                  The worker&apos;s map location is not available.
                </AppText>
              ) : null}
            </>
          ) : null}

          {/* Worker visits customer */}

          {workerTravels ? (
            <>
              <View style={styles.locationActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="View your service location on map"
                  accessibilityState={{
                    disabled: !hasCoordinates,
                  }}
                  disabled={!hasCoordinates}
                  onPress={onMap}
                  style={({ pressed }) => [
                    styles.locationAction,

                    !hasCoordinates
                      ? styles.locationActionDisabled
                      : null,

                    pressed && hasCoordinates
                      ? styles.pressed
                      : null,
                  ]}
                >
                  <AppIcon
                    name="location"
                    role="customer"
                    size="xs"
                    state={
                      hasCoordinates
                        ? "active"
                        : "muted"
                    }
                  />

                  <AppText
                    variant="caption"
                    weight="semibold"
                    numberOfLines={1}
                    style={[
                      styles.locationActionText,
                      !hasCoordinates
                        ? styles.locationActionTextDisabled
                        : null,
                    ]}
                  >
                    View Location
                  </AppText>
                </Pressable>

                {trackingActive ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      liveTrackingAvailable
                        ? `Track ${safeWorkerName} live`
                        : `Check ${safeWorkerName} live location`
                    }
                    onPress={onLiveTrack}
                    style={({ pressed }) => [
                      styles.locationAction,

                      liveTrackingAvailable
                        ? styles.liveTrackingAction
                        : null,

                      pressed
                        ? styles.pressed
                        : null,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={
                        liveTrackingAvailable
                          ? "crosshairs-gps"
                          : "crosshairs"
                      }
                      size={18}
                      color={
                        liveTrackingAvailable
                          ? Colors.success
                          : CustomerColors.primary
                      }
                    />

                    <AppText
                      variant="caption"
                      weight="semibold"
                      numberOfLines={1}
                      style={[
                        styles.locationActionText,
                        liveTrackingAvailable
                          ? styles.liveTrackingText
                          : null,
                      ]}
                    >
                      {liveTrackingAvailable
                        ? "Track Live"
                        : "Track Worker"}
                    </AppText>

                    {liveTrackingAvailable ? (
                      <View
                        style={styles.liveDot}
                      />
                    ) : null}
                  </Pressable>
                ) : null}
              </View>

              {!trackingActive ? (
                <View style={styles.trackingNotice}>
                  <MaterialCommunityIcons
                    name="information-outline"
                    size={17}
                    color={Colors.textSecondary}
                  />

                  <AppText
                    variant="caption"
                    tone="secondary"
                    style={styles.trackingNoticeText}
                  >
                    Tracking and live location sharing become available
                    after the offer is accepted.
                  </AppText>
                </View>
              ) : null}

              {/* Customer live location sharing */}

              {trackingActive ? (
                <View style={styles.sharingPanel}>
                  <View style={styles.sharingHeader}>
                    <View
                      style={[
                        styles.sharingIcon,

                        customerLiveLocationTracking
                          ? styles.sharingIconLive
                          : null,

                        customerLiveSharingError
                          ? styles.sharingIconAttention
                          : null,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={
                          customerSharingPresentation.icon
                        }
                        size={19}
                        color={
                          customerLiveLocationTracking
                            ? Colors.success
                            : customerLiveSharingError
                              ? Colors.warning
                              : CustomerColors.primary
                        }
                      />
                    </View>

                    <View style={styles.sharingContent}>
                      <View style={styles.sharingTitleRow}>
                        <AppText
                          variant="bodyMedium"
                          weight="semibold"
                          numberOfLines={1}
                          style={styles.sharingTitle}
                        >
                          Live location sharing
                        </AppText>

                        <StatusBadge
                          label={
                            customerSharingPresentation.badge
                          }
                          type={getStatusBadgeType(
                            customerSharingPresentation.badge,
                          )}
                        />
                      </View>

                      <AppText
                        variant="caption"
                        tone="secondary"
                        numberOfLines={
                          customerLiveSharingError
                            ? undefined
                            : 2
                        }
                        style={styles.sharingDescription}
                      >
                        {
                          customerSharingPresentation.subtitle
                        }
                      </AppText>
                    </View>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      customerLiveSharingEnabled
                        ? "Stop sharing your live location"
                        : "Share your live location with the worker"
                    }
                    accessibilityState={{
                      disabled:
                        customerSharingActionDisabled,
                    }}
                    disabled={
                      customerSharingActionDisabled
                    }
                    onPress={
                      customerLiveSharingEnabled
                        ? onStopCustomerLiveSharing
                        : onStartCustomerLiveSharing
                    }
                    style={({ pressed }) => [
                      styles.sharingAction,

                      customerLiveSharingEnabled
                        ? styles.sharingActionStop
                        : styles.sharingActionStart,

                      customerSharingActionDisabled
                        ? styles.sharingActionDisabled
                        : null,

                      pressed &&
                      !customerSharingActionDisabled
                        ? styles.pressed
                        : null,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={
                        customerLiveSharingEnabled
                          ? "map-marker-off-outline"
                          : "map-marker-radius-outline"
                      }
                      size={17}
                      color={
                        customerSharingActionDisabled
                          ? Colors.textMuted
                          : customerLiveSharingEnabled
                            ? Colors.error
                            : CustomerColors.primary
                      }
                    />

                    <AppText
                      variant="caption"
                      weight="semibold"
                      style={[
                        styles.sharingActionText,

                        customerLiveSharingEnabled
                          ? styles.sharingActionTextStop
                          : null,

                        customerSharingActionDisabled
                          ? styles.sharingActionTextDisabled
                          : null,
                      ]}
                    >
                      {customerLiveSharingBusy
                        ? "Updating..."
                        : customerSharingStarting
                          ? "Starting..."
                          : customerLiveSharingEnabled
                            ? "Stop sharing"
                            : "Share my location"}
                    </AppText>
                  </Pressable>

                  {customerLiveSharingError ? (
                    <View style={styles.sharingError}>
                      <MaterialCommunityIcons
                        name="alert-circle-outline"
                        size={16}
                        color={Colors.warning}
                      />

                      <AppText
                        variant="caption"
                        style={styles.sharingErrorText}
                      >
                        {customerLiveSharingError}
                      </AppText>
                    </View>
                  ) : null}

                  <AppText
                    variant="caption"
                    tone="muted"
                    style={styles.sharingPrivacy}
                  >
                    Optional. Only shared while this service is active.
                  </AppText>
                </View>
              ) : null}

              {!hasCoordinates ? (
                <AppText
                  variant="caption"
                  tone="secondary"
                  style={styles.locationHint}
                >
                  Your service location does not have map coordinates.
                </AppText>
              ) : null}
            </>
          ) : null}
        </View>
      )}

      <Divider />

      {/* Timing */}

      <View style={styles.row}>
        <View
          style={[
            styles.iconBox,
            timingPresentation.urgent
              ? styles.urgentIconBox
              : null,
          ]}
        >
          <AppIcon
            name="calendar"
            role="customer"
            size="sm"
            state={
              timingPresentation.urgent
                ? "warning"
                : "active"
            }
          />
        </View>

        <View style={styles.rowContent}>
          <AppText
            variant="caption"
            tone="muted"
          >
            Timing
          </AppText>

          <AppText
            variant="bodyMedium"
            weight="semibold"
            style={[
              styles.rowValue,
              timingPresentation.urgent
                ? styles.urgentText
                : null,
            ]}
          >
            {timingPresentation.title}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={2}
            style={styles.time}
          >
            {timingPresentation.subtitle}
          </AppText>
        </View>
      </View>
    </AppCard>
  );
}

/* ==============================================================
   STATUS BADGE
============================================================== */

type StatusBadgeType =
  | "live"
  | "starting"
  | "attention"
  | "off";

function getStatusBadgeType(
  badge: CustomerSharingPresentation["badge"],
): StatusBadgeType {
  switch (badge) {
    case "LIVE":
      return "live";

    case "STARTING":
      return "starting";

    case "ATTENTION":
      return "attention";

    case "OFF":
    default:
      return "off";
  }
}

function StatusBadge({
  label,
  type,
}: {
  label: string;
  type: StatusBadgeType;
}) {
  return (
    <View
      style={[
        styles.statusBadge,

        type === "live"
          ? styles.statusBadgeLive
          : null,

        type === "starting"
          ? styles.statusBadgeStarting
          : null,

        type === "attention"
          ? styles.statusBadgeAttention
          : null,

        type === "off"
          ? styles.statusBadgeOff
          : null,
      ]}
    >
      {type === "live" ? (
        <View style={styles.statusBadgeDot} />
      ) : null}

      <AppText
        variant="caption"
        weight="semibold"
        style={[
          styles.statusBadgeText,

          type === "live"
            ? styles.statusBadgeTextLive
            : null,

          type === "starting"
            ? styles.statusBadgeTextStarting
            : null,

          type === "attention"
            ? styles.statusBadgeTextAttention
            : null,

          type === "off"
            ? styles.statusBadgeTextOff
            : null,
        ]}
      >
        {label}
      </AppText>
    </View>
  );
}

/* ==============================================================
   DIVIDER
============================================================== */

function Divider() {
  return <View style={styles.divider} />;
}

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  card: {
    width: "100%",
    marginTop: FixxamTokens.spacing.sm,
    paddingHorizontal: FixxamTokens.spacing.md,
    paddingVertical: FixxamTokens.spacing.sm,
    borderRadius: FixxamTokens.radius.xl,
    backgroundColor: Colors.surface,
  },

  row: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },

  rowContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: FixxamTokens.spacing.sm,
  },

  rowValue: {
    marginTop: 1,
    color: Colors.textPrimary,
  },

  secondaryText: {
    marginTop: 3,
    lineHeight: 16,
    color: Colors.textSecondary,
  },

  iconBox: {
    width: 38,
    height: 38,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: FixxamTokens.radius.md,
    backgroundColor: CustomerColors.primarySoft,
  },

  divider: {
    width: "100%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },

  workerRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },

  avatar: {
    width: 44,
    height: 44,
    flexShrink: 0,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: FixxamTokens.radius.md,
    backgroundColor: Colors.disabledBackground,
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  workerInfo: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: FixxamTokens.spacing.sm,
  },

  workerCategory: {
    marginTop: 1,
  },

  section: {
    paddingVertical: FixxamTokens.spacing.sm,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  sectionTitle: {
    marginLeft: FixxamTokens.spacing.sm,
    color: Colors.textPrimary,
  },

  description: {
    marginTop: 6,
    lineHeight: 19,
    color: Colors.textSecondary,
  },

  photos: {
    flexDirection: "row",
    alignItems: "center",
    gap: FixxamTokens.spacing.sm,
    paddingTop: FixxamTokens.spacing.sm,
    paddingRight: FixxamTokens.spacing.md,
  },

  photo: {
    width: 82,
    height: 82,
    flexShrink: 0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderRadius: FixxamTokens.radius.md,
    backgroundColor: Colors.disabledBackground,
  },

  locationSection: {
    width: "100%",
    paddingVertical: FixxamTokens.spacing.sm,
  },

  locationRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  primaryLocationAction: {
    width: "100%",
    minHeight: FixxamTokens.size.minimumTouchTarget,
    marginTop: FixxamTokens.spacing.sm,
    paddingHorizontal: FixxamTokens.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: FixxamTokens.spacing.sm,
    borderRadius: FixxamTokens.radius.md,
    backgroundColor: CustomerColors.primary,
  },

  primaryLocationActionDisabled: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.disabledBackground,
    opacity: 0.7,
  },

  primaryLocationActionText: {
    color: Colors.textInverse,
  },

  locationActions: {
    width: "100%",
    marginTop: FixxamTokens.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: FixxamTokens.spacing.sm,
  },

  locationAction: {
    flex: 1,
    minWidth: 0,
    minHeight: FixxamTokens.size.minimumTouchTarget,
    paddingHorizontal: FixxamTokens.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: CustomerColors.primary,
    borderRadius: FixxamTokens.radius.md,
    backgroundColor: CustomerColors.primarySoft,
  },

  locationActionDisabled: {
    borderColor: Colors.border,
    backgroundColor: Colors.disabledBackground,
    opacity: 0.7,
  },

  locationActionText: {
    color: CustomerColors.primary,
  },

  locationActionTextDisabled: {
    color: Colors.textMuted,
  },

  liveTrackingAction: {
    borderColor: Colors.success,
    backgroundColor: Colors.surface,
  },

  liveTrackingText: {
    color: Colors.success,
  },

  liveDot: {
    width: 6,
    height: 6,
    flexShrink: 0,
    borderRadius: FixxamTokens.radius.full,
    backgroundColor: Colors.success,
  },

  locationHint: {
    marginTop: FixxamTokens.spacing.sm,
    lineHeight: 16,
    color: Colors.textSecondary,
  },

  trackingNotice: {
    width: "100%",
    marginTop: FixxamTokens.spacing.sm,
    paddingHorizontal: FixxamTokens.spacing.sm,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: FixxamTokens.radius.md,
    backgroundColor: Colors.disabledBackground,
  },

  trackingNoticeText: {
    flex: 1,
    minWidth: 0,
    lineHeight: 16,
    color: Colors.textSecondary,
  },

  sharingPanel: {
    width: "100%",
    marginTop: FixxamTokens.spacing.sm,
    padding: FixxamTokens.spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderRadius: FixxamTokens.radius.md,
    backgroundColor: Colors.surface,
  },

  sharingHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  sharingIcon: {
    width: 34,
    height: 34,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: FixxamTokens.radius.md,
    backgroundColor: CustomerColors.primarySoft,
  },

  sharingIconLive: {
    backgroundColor: Colors.disabledBackground,
  },

  sharingIconAttention: {
    backgroundColor: Colors.warningSoft,
  },

  sharingContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: FixxamTokens.spacing.sm,
  },

  sharingTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: FixxamTokens.spacing.sm,
  },

  sharingTitle: {
    flex: 1,
    minWidth: 0,
    color: Colors.textPrimary,
  },

  sharingDescription: {
    marginTop: 2,
    lineHeight: 16,
    color: Colors.textSecondary,
  },

  sharingAction: {
    width: "100%",
    minHeight: FixxamTokens.size.minimumTouchTarget,
    marginTop: 8,
    paddingHorizontal: FixxamTokens.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderRadius: FixxamTokens.radius.md,
  },

  sharingActionStart: {
    borderColor: CustomerColors.primary,
    backgroundColor: CustomerColors.primarySoft,
  },

  sharingActionStop: {
    borderColor: Colors.error,
    backgroundColor: Colors.surface,
  },

  sharingActionDisabled: {
    borderColor: Colors.border,
    backgroundColor: Colors.disabledBackground,
    opacity: 0.65,
  },

  sharingActionText: {
    color: CustomerColors.primary,
  },

  sharingActionTextStop: {
    color: Colors.error,
  },

  sharingActionTextDisabled: {
    color: Colors.textMuted,
  },

  sharingError: {
    marginTop: 7,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: FixxamTokens.spacing.xs,
  },

  sharingErrorText: {
    flex: 1,
    minWidth: 0,
    lineHeight: 16,
    color: Colors.warning,
  },

  sharingPrivacy: {
    marginTop: 6,
    lineHeight: 15,
    color: Colors.textMuted,
  },

  statusBadge: {
    flexShrink: 0,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: FixxamTokens.radius.full,
  },

  statusBadgeLive: {
    backgroundColor: CustomerColors.primarySoft,
  },

  statusBadgeStarting: {
    backgroundColor: CustomerColors.primarySoft,
  },

  statusBadgeAttention: {
    backgroundColor: Colors.warningSoft,
  },

  statusBadgeOff: {
    backgroundColor: Colors.disabledBackground,
  },

  statusBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: FixxamTokens.radius.full,
    backgroundColor: Colors.success,
  },

  statusBadgeText: {
    fontSize: 10,
  },

  statusBadgeTextLive: {
    color: Colors.success,
  },

  statusBadgeTextStarting: {
    color: CustomerColors.primary,
  },

  statusBadgeTextAttention: {
    color: Colors.warning,
  },

  statusBadgeTextOff: {
    color: Colors.textMuted,
  },

  urgentIconBox: {
    backgroundColor: Colors.warningSoft,
  },

  urgentText: {
    color: Colors.warning,
  },

  time: {
    marginTop: 1,
    lineHeight: 16,
    color: Colors.textSecondary,
  },

  pressed: {
    opacity: FixxamTokens.motion.pressedOpacity,
  },
});

/* ==============================================================
   EXPORT
============================================================== */

CustomerOrderRequest.displayName =
  "CustomerOrderRequest";

export default memo(CustomerOrderRequest);