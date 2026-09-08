import React, {
  memo,
  useCallback,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  Image,
} from "expo-image";

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

/* ============================================================
   TYPES
============================================================ */

export type NearbyWorkerData = {
  id: string;

  name: string;

  profession: string;

  location: string;

  distanceKm?: number | null;

  completedJobs: number;

  rating: number;

  available: boolean;

  pricePerHour: number;

  avatarUrl?: string | null;
};

type NearbyWorkerCardProps = {
  worker: NearbyWorkerData;

  onPress: (
    workerId: string,
  ) => void;

  onBookNow: (
    workerId: string,
  ) => void;
};

/* ============================================================
   HELPERS
============================================================ */

function formatCount(
  value: number,
): string {
  if (
    !Number.isFinite(value) ||
    value < 0
  ) {
    return "0";
  }

  return Math.floor(
    value,
  ).toLocaleString("en-NG");
}

function formatRating(
  value: number,
): string {
  if (!Number.isFinite(value)) {
    return "0.0";
  }

  const safeValue =
    Math.min(
      5,
      Math.max(0, value),
    );

  return safeValue.toFixed(1);
}

function formatPrice(
  value: number,
): string {
  if (
    !Number.isFinite(value) ||
    value < 0
  ) {
    return "₦0/hr";
  }

  return `₦${Math.round(
    value,
  ).toLocaleString("en-NG")}/hr`;
}

function formatDistance(
  value?: number | null,
): string | null {
  if (
    value == null ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    return null;
  }

  return `${value.toFixed(1)} km`;
}

/* ============================================================
   COMPONENT
============================================================ */

function NearbyWorkerCard({
  worker,
  onPress,
  onBookNow,
}: NearbyWorkerCardProps) {
  const distance =
    formatDistance(
      worker.distanceKm,
    );

  const hasAvatar =
    typeof worker.avatarUrl ===
      "string" &&
    worker.avatarUrl.trim()
      .length > 0;

  const handlePress =
    useCallback(() => {
      onPress(worker.id);
    }, [
      onPress,
      worker.id,
    ]);

  const handleBookNow =
    useCallback(() => {
      onBookNow(worker.id);
    }, [
      onBookNow,
      worker.id,
    ]);

  return (
    <AppCard
      role="customer"
      variant="outlined"
      style={
        styles.card
      }
    >
      {/* ======================================================
          WORKER PROFILE
      ====================================================== */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${worker.name}'s profile`}
        onPress={
          handlePress
        }
        style={({
          pressed,
        }) => [
          styles.profilePressable,

          pressed
            ? styles.pressed
            : null,
        ]}
      >
        <View
          style={
            styles.header
          }
        >
          <View
            style={
              styles.avatarContainer
            }
          >
            {hasAvatar ? (
              <Image
                source={{
                  uri:
                    worker.avatarUrl!,
                }}
                contentFit="cover"
                transition={150}
                accessibilityLabel={`${worker.name} profile photo`}
                style={
                  styles.avatar
                }
              />
            ) : (
              <View
                style={
                  styles.avatarPlaceholder
                }
              >
                <AppIcon
                  name="profile"
                  role="customer"
                  size="lg"
                  state="muted"
                />
              </View>
            )}

            {worker.available ? (
              <View
                accessibilityLabel="Worker is available"
                style={
                  styles.availabilityBadge
                }
              />
            ) : null}
          </View>

          <View
            style={
              styles.info
            }
          >
            <AppText
              variant="bodyLarge"
              weight="bold"
              numberOfLines={1}
              style={
                styles.name
              }
            >
              {worker.name}
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              numberOfLines={1}
              style={
                styles.profession
              }
            >
              {worker.profession}
            </AppText>

            <View
              style={
                styles.locationRow
              }
            >
              <AppIcon
                name="location"
                role="customer"
                size="xs"
                state="muted"
              />

              <AppText
                variant="caption"
                tone="secondary"
                numberOfLines={1}
                style={
                  styles.location
                }
              >
                {worker.location}
                {distance
                  ? ` • ${distance}`
                  : ""}
              </AppText>
            </View>
          </View>
        </View>
      </Pressable>

      {/* ======================================================
          STATS
      ====================================================== */}

      <View
        style={
          styles.stats
        }
      >
        <View
          style={
            styles.stat
          }
        >
          <AppIcon
            name="jobs"
            role="customer"
            size="sm"
            state="active"
          />

          <AppText
            variant="caption"
            weight="medium"
            style={
              styles.statText
            }
          >
            {formatCount(
              worker.completedJobs,
            )}{" "}
            Jobs
          </AppText>
        </View>

        <View
          style={
            styles.stat
          }
        >
          <AppIcon
            name="star"
            role="customer"
            size="sm"
            state="warning"
          />

          <AppText
            variant="caption"
            weight="medium"
            style={
              styles.statText
            }
          >
            {formatRating(
              worker.rating,
            )}
          </AppText>
        </View>

        <View
          style={
            styles.stat
          }
        >
          <View
            style={[
              styles.statusDot,

              worker.available
                ? styles.statusAvailable
                : styles.statusUnavailable,
            ]}
          />

          <AppText
            variant="caption"
            weight="medium"
            style={
              styles.statText
            }
          >
            {worker.available
              ? "Available"
              : "Unavailable"}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <View
        style={
          styles.footer
        }
      >
        <View
          style={
            styles.priceContainer
          }
        >
          <AppText
            variant="caption"
            tone="secondary"
          >
            Starting from
          </AppText>

          <AppText
            variant="bodyLarge"
            weight="bold"
            numberOfLines={1}
            style={
              styles.price
            }
          >
            {formatPrice(
              worker.pricePerHour,
            )}
          </AppText>
        </View>

        <AppButton
          title="Book Now"
          role="customer"
          variant="primary"
          size="sm"
          disabled={
            !worker.available
          }
          onPress={
            handleBookNow
          }
        />
      </View>
    </AppCard>
  );
}

export default memo(
  NearbyWorkerCard,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    card: {
      marginBottom:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.surface,
    },

    profilePressable: {
      borderRadius:
        FixxamTokens.radius.md,
    },

    pressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    avatarContainer: {
      position:
        "relative",

      flexShrink: 0,
    },

    avatar: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    avatarPlaceholder: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    availabilityBadge: {
      position:
        "absolute",

      right: 1,

      bottom: 1,

      width: 14,

      height: 14,

      borderRadius:
        FixxamTokens.radius.full,

      borderWidth: 2,

      borderColor:
        Colors.surface,

      backgroundColor:
        Colors.success,
    },

    info: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,

      justifyContent:
        "center",
    },

    name: {
      color:
        Colors.textPrimary,
    },

    profession: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    locationRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.xs,

      gap:
        FixxamTokens.spacing.xxs,
    },

    location: {
      flex: 1,

      minWidth: 0,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       STATS
    ======================================================== */

    stats: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginTop:
        FixxamTokens.spacing.lg,

      paddingVertical:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.background,
    },

    stat: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xxs,
    },

    statText: {
      color:
        Colors.textSecondary,
    },

    statusDot: {
      width: 8,

      height: 8,

      borderRadius:
        FixxamTokens.radius.full,
    },

    statusAvailable: {
      backgroundColor:
        Colors.success,
    },

    statusUnavailable: {
      backgroundColor:
        Colors.textMuted,
    },

    /* ========================================================
       FOOTER
    ======================================================== */

    footer: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,

      marginTop:
        FixxamTokens.spacing.md,
    },

    priceContainer: {
      flex: 1,

      minWidth: 0,
    },

    price: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        CustomerColors.primary,
    },
  });