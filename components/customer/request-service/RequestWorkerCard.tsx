import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import {
  Image,
} from "expo-image";

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

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  name: string;

  photoUrl?: string;

  category?: string;

  online?: boolean;

  distance?: number;
};

/* ==============================================================
   PHOTO URL
============================================================== */

function normalizePhotoUrl(
  value?: string,
): string {
  if (
    typeof value !==
      "string"
  ) {
    return "";
  }

  const url =
    value.trim();

  if (!url) {
    return "";
  }

  /*
   * Production worker profile
   * images must use secure HTTPS.
   *
   * file:// and content:// URIs
   * are intentionally rejected.
   */
  if (
    !url.startsWith(
      "https://",
    )
  ) {
    return "";
  }

  return url;
}

/* ==============================================================
   COMPONENT
============================================================== */

function RequestWorkerCard({
  name,
  photoUrl,
  category = "Service Provider",
  online = false,
  distance,
}: Props) {
  const [
    imageFailed,
    setImageFailed,
  ] =
    useState(false);

  const [
    imageLoading,
    setImageLoading,
  ] =
    useState(false);

  /* ============================================================
     PHOTO
  ============================================================ */

  const safePhotoUrl =
    useMemo(
      () =>
        normalizePhotoUrl(
          photoUrl,
        ),
      [
        photoUrl,
      ],
    );

  useEffect(() => {
    setImageFailed(
      false,
    );

    setImageLoading(
      Boolean(
        safePhotoUrl,
      ),
    );
  }, [
    safePhotoUrl,
  ]);

  /* ============================================================
     DISTANCE
  ============================================================ */

  const safeDistance =
    useMemo(() => {
      if (
        typeof distance !==
          "number" ||
        !Number.isFinite(
          distance,
        )
      ) {
        return undefined;
      }

      return Math.max(
        0,
        distance,
      );
    }, [
      distance,
    ]);

  /* ============================================================
     IMAGE EVENTS
  ============================================================ */

  const handleImageLoadStart =
    useCallback(() => {
      setImageLoading(
        true,
      );

      setImageFailed(
        false,
      );

      if (__DEV__) {
        console.log(
          "REQUEST_WORKER_IMAGE_LOAD_START",
          {
            name,

            photoUrl:
              safePhotoUrl,
          },
        );
      }
    }, [
      name,
      safePhotoUrl,
    ]);

  const handleImageLoad =
    useCallback(() => {
      setImageLoading(
        false,
      );

      setImageFailed(
        false,
      );

      if (__DEV__) {
        console.log(
          "REQUEST_WORKER_IMAGE_LOADED",
          {
            name,

            photoUrl:
              safePhotoUrl,
          },
        );
      }
    }, [
      name,
      safePhotoUrl,
    ]);

  const handleImageError =
    useCallback(
      (
        error: unknown,
      ) => {
        setImageLoading(
          false,
        );

        setImageFailed(
          true,
        );

        if (__DEV__) {
          console.warn(
            "REQUEST_WORKER_IMAGE_LOAD_FAILED",
            {
              name,

              photoUrl:
                safePhotoUrl,

              error,
            },
          );
        }
      },
      [
        name,
        safePhotoUrl,
      ],
    );

  /* ============================================================
     IMAGE STATE
  ============================================================ */

  const shouldShowImage =
    Boolean(
      safePhotoUrl &&
      !imageFailed,
    );

  /* ============================================================
     UI
  ============================================================ */

  return (
    <AppCard
      role="customer"
      variant="outlined"
      style={
        styles.card
      }
    >
      {/* ======================================================
          AVATAR
      ====================================================== */}

      <View
        style={
          styles.avatarWrapper
        }
      >
        <View
          style={
            styles.avatarRing
          }
        >
          {shouldShowImage ? (
            <Image
              source={{
                uri:
                  safePhotoUrl,
              }}
              style={
                styles.avatar
              }
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={
                FixxamTokens.motion
                  .fast
              }
              onLoadStart={
                handleImageLoadStart
              }
              onLoad={
                handleImageLoad
              }
              onError={
                handleImageError
              }
              accessibilityLabel={`${name} profile photo`}
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

          {/* ==================================================
              LOADING
          ================================================== */}

          {imageLoading &&
          shouldShowImage ? (
            <View
              pointerEvents="none"
              style={
                styles.imageLoadingOverlay
              }
            >
              <ActivityIndicator
                size="small"
                color={
                  CustomerColors.primary
                }
              />
            </View>
          ) : null}
        </View>

        {/* ====================================================
            STATUS DOT
        ==================================================== */}

        <View
          style={[
            styles.statusDot,

            online
              ? styles.statusOnline
              : styles.statusOffline,
          ]}
        />
      </View>

      {/* ======================================================
          WORKER INFORMATION
      ====================================================== */}

      <View
        style={
          styles.content
        }
      >
        <AppText
          variant="bodyLarge"
          weight="bold"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {name}
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={
            styles.category
          }
        >
          {category}
        </AppText>

        {/* ====================================================
            META
        ==================================================== */}

        <View
          style={
            styles.metaRow
          }
        >
          {safeDistance !==
          undefined ? (
            <View
              style={
                styles.distanceRow
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
                weight="semibold"
                style={
                  styles.distanceText
                }
              >
                {safeDistance.toFixed(
                  1,
                )}{" "}
                km away
              </AppText>
            </View>
          ) : null}

          {/* ==================================================
              AVAILABILITY
          ================================================== */}

          <View
            style={[
              styles.availability,

              online
                ? styles.availabilityOnline
                : styles.availabilityOffline,

              safeDistance !==
              undefined
                ? styles.availabilitySpacing
                : null,
            ]}
          >
            <View
              style={[
                styles.availabilityDot,

                online
                  ? styles.statusOnline
                  : styles.statusOffline,
              ]}
            />

            <AppText
              variant="caption"
              weight="semibold"
              style={[
                styles.availabilityText,

                online
                  ? styles.availabilityTextOnline
                  : styles.availabilityTextOffline,
              ]}
            >
              {online
                ? "Available"
                : "Offline"}
            </AppText>
          </View>
        </View>
      </View>
    </AppCard>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    card: {
      width: "100%",

      minHeight:
        FixxamTokens.size
          .roleCardHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      padding:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       AVATAR
    ======================================================== */

    avatarWrapper: {
      position:
        "relative",

      width:
        FixxamTokens.size
          .roleCardHeight,

      height:
        FixxamTokens.size
          .roleCardHeight,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.md,
    },

    avatarRing: {
      width:
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

      overflow:
        "hidden",

      padding:
        FixxamTokens.spacing.xxs,

      borderWidth: 1,

      borderColor:
        CustomerColors.primaryLight,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    avatar: {
      width: "100%",

      height: "100%",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    avatarPlaceholder: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    imageLoadingOverlay: {
      ...StyleSheet.absoluteFillObject,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.overlayLight,
    },

    /* ========================================================
       STATUS
    ======================================================== */

    statusDot: {
      position:
        "absolute",

      right:
        FixxamTokens.spacing.xs,

      bottom:
        FixxamTokens.spacing.xs,

      width: 18,

      height: 18,

      borderWidth: 3,

      borderColor:
        Colors.surface,

      borderRadius:
        FixxamTokens.radius.full,
    },

    statusOnline: {
      backgroundColor:
        Colors.success,
    },

    statusOffline: {
      backgroundColor:
        Colors.textMuted,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      flex: 1,

      minWidth: 0,
    },

    category: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       META
    ======================================================== */

    metaRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      flexWrap:
        "wrap",

      marginTop:
        FixxamTokens.spacing.sm,
    },

    distanceRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      flexShrink: 1,
    },

    distanceText: {
      marginLeft:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       AVAILABILITY
    ======================================================== */

    availability: {
      minHeight: 30,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      flexShrink: 0,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderRadius:
        FixxamTokens.radius.chip,
    },

    availabilityOnline: {
      borderColor:
        Colors.success,

      backgroundColor:
        Colors.successSoft,
    },

    availabilityOffline: {
      borderColor:
        Colors.border,

      backgroundColor:
        Colors.disabledBackground,
    },

    availabilitySpacing: {
      marginLeft:
        FixxamTokens.spacing.sm,
    },

    availabilityDot: {
      width: 7,

      height: 7,

      marginRight:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,
    },

    availabilityText: {
      flexShrink: 0,
    },

    availabilityTextOnline: {
      color:
        Colors.success,
    },

    availabilityTextOffline: {
      color:
        Colors.textSecondary,
    },
  });

export default memo(
  RequestWorkerCard,
);