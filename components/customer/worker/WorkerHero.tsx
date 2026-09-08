import React, {
  memo,
  useEffect,
  useState,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  Image,
} from "expo-image";

import {
  LinearGradient,
} from "expo-linear-gradient";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  photo?: string;

  name: string;

  category?: string;

  location?: string;

  rating: number;

  reviews: number;

  verified: boolean;

  online: boolean;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value.trim();
}

function normalizeRating(
  value: number,
): number {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return 0;
  }

  return Math.min(
    5,
    Math.max(
      0,
      value,
    ),
  );
}

function normalizeCount(
  value: number,
): number {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(
      value,
    ),
  );
}

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerHero({
  photo,
  name,
  category,
  location,
  rating,
  reviews,
  verified,
  online,
}: Props) {
  const [
    imageFailed,
    setImageFailed,
  ] =
    useState(false);

  const photoUri =
    cleanString(
      photo,
    );

  const workerName =
    cleanString(
      name,
    ) ||
    "Worker";

  const workerCategory =
    cleanString(
      category,
    );

  const workerLocation =
    cleanString(
      location,
    );

  const safeRating =
    normalizeRating(
      rating,
    );

  const safeReviews =
    normalizeCount(
      reviews,
    );

  const showPhoto =
    Boolean(
      photoUri,
    ) &&
    !imageFailed;

  /* ============================================================
     RESET IMAGE ERROR
  ============================================================ */

  useEffect(() => {
    setImageFailed(
      false,
    );
  }, [
    photoUri,
  ]);

  return (
    <View
      style={
        styles.container
      }
    >
      <LinearGradient
        colors={[
          CustomerColors.primaryDark,
          CustomerColors.primary,
          CustomerColors.primary,
        ]}
        start={{
          x: 0,
          y: 0,
        }}
        end={{
          x: 1,
          y: 1,
        }}
        style={
          styles.cover
        }
      >
        {/* ====================================================
            AVATAR
        ==================================================== */}

        <View
          style={[
            styles.avatarRing,

            online
              ? styles.avatarRingOnline
              : styles.avatarRingOffline,
          ]}
        >
          {showPhoto ? (
            <Image
              source={{
                uri:
                  photoUri,
              }}
              style={
                styles.photo
              }
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={
                FixxamTokens.motion
                  .fast
              }
              accessibilityLabel={`${workerName} profile photo`}
              onError={() => {
                setImageFailed(
                  true,
                );
              }}
            />
          ) : (
            <View
              style={
                styles.photoPlaceholder
              }
            >
              <AppIcon
                name="profile"
                role="customer"
                size="xl"
                color={
                  Colors.textMuted
                }
              />
            </View>
          )}

          {/* ==================================================
              VERIFIED
          ================================================== */}

          {verified ? (
            <View
              accessibilityLabel="Verified worker"
              style={
                styles.verifiedBadge
              }
            >
              <AppIcon
                name="check"
                role="customer"
                size="xs"
                color={
                  Colors.textInverse
                }
              />
            </View>
          ) : null}
        </View>

        {/* ====================================================
            NAME
        ==================================================== */}

        <AppText
          variant="heading1"
          weight="bold"
          center
          numberOfLines={2}
          style={
            styles.name
          }
        >
          {workerName}
        </AppText>

        {/* ====================================================
            CATEGORY
        ==================================================== */}

        {workerCategory ? (
          <AppText
            variant="body"
            center
            numberOfLines={1}
            style={
              styles.category
            }
          >
            {workerCategory}
          </AppText>
        ) : null}

        {/* ====================================================
            BADGES
        ==================================================== */}

        <View
          style={
            styles.badgesRow
          }
        >
          {/* ==================================================
              RATING
          ================================================== */}

          <View
            style={
              styles.badge
            }
          >
            <AppIcon
              name="star"
              role="customer"
              size="xs"
              color={
                Colors.warning
              }
            />

            <AppText
              variant="caption"
              weight="bold"
              numberOfLines={1}
              style={
                styles.badgeText
              }
            >
              {safeRating.toFixed(
                1,
              )}{" "}
              ({safeReviews})
            </AppText>
          </View>

          {/* ==================================================
              LOCATION
          ================================================== */}

          {workerLocation ? (
            <View
              style={[
                styles.badge,
                styles.locationBadge,
              ]}
            >
              <AppIcon
                name="location"
                role="customer"
                size="xs"
                color={
                  Colors.textInverse
                }
              />

              <AppText
                variant="caption"
                weight="bold"
                numberOfLines={1}
                style={[
                  styles.badgeText,
                  styles.locationText,
                ]}
              >
                {workerLocation}
              </AppText>
            </View>
          ) : null}
        </View>

        {/* ====================================================
            STATUS
        ==================================================== */}

        <View
          style={
            styles.statusRow
          }
        >
          <View
            style={[
              styles.statusDot,

              online
                ? styles.statusDotOnline
                : styles.statusDotOffline,
            ]}
          />

          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.statusText
            }
          >
            {online
              ? "Online"
              : "Offline"}
          </AppText>
        </View>
      </LinearGradient>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      marginHorizontal:
        FixxamTokens.spacing.lg,

      marginTop:
        FixxamTokens.spacing.sm,

      overflow:
        "hidden",

      borderRadius:
        FixxamTokens.radius.xl,

      ...FixxamTokens.shadow.card,
    },

    cover: {
      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.xl,

      paddingBottom:
        FixxamTokens.spacing.xl,

      borderWidth: 1,

      borderColor:
        "rgba(255,255,255,0.18)",

      borderRadius:
        FixxamTokens.radius.xl,
    },

    /* ========================================================
       AVATAR
    ======================================================== */

    avatarRing: {
      width: 96,

      height: 96,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginBottom:
        FixxamTokens.spacing.md,

      borderWidth: 3,

      borderRadius:
        FixxamTokens.radius.full,
    },

    avatarRingOnline: {
      borderColor:
        Colors.success,
    },

    avatarRingOffline: {
      borderColor:
        Colors.textMuted,
    },

    photo: {
      width: 86,

      height: 86,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    photoPlaceholder: {
      width: 86,

      height: 86,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       VERIFIED
    ======================================================== */

    verifiedBadge: {
      position:
        "absolute",

      right: 1,

      bottom: 1,

      width: 24,

      height: 24,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 2,

      borderColor:
        Colors.textInverse,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.success,
    },

    /* ========================================================
       TEXT
    ======================================================== */

    name: {
      maxWidth: "90%",

      color:
        Colors.textInverse,
    },

    category: {
      maxWidth: "90%",

      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textInverse,

      opacity: 0.84,
    },

    /* ========================================================
       BADGES
    ======================================================== */

    badgesRow: {
      maxWidth: "100%",

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.lg,
    },

    badge: {
      minHeight: 36,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        "rgba(255,255,255,0.22)",

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        "rgba(255,255,255,0.14)",
    },

    locationBadge: {
      maxWidth: "75%",
    },

    badgeText: {
      marginLeft:
        FixxamTokens.spacing.xs,

      color:
        Colors.textInverse,
    },

    locationText: {
      flexShrink: 1,
    },

    /* ========================================================
       ONLINE STATUS
    ======================================================== */

    statusRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.md,
    },

    statusDot: {
      width: 8,

      height: 8,

      marginRight:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,
    },

    statusDotOnline: {
      backgroundColor:
        Colors.success,
    },

    statusDotOffline: {
      backgroundColor:
        Colors.textMuted,
    },

    statusText: {
      color:
        Colors.textInverse,
    },
  });

export default memo(
  WorkerHero,
);