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

  if (
    !url ||
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
    useMemo(
      () => {
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
      },
      [
        distance,
      ],
    );

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
    }, []);

  const handleImageLoad =
    useCallback(() => {
      setImageLoading(
        false,
      );

      setImageFailed(
        false,
      );
    }, []);

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

        if (
          __DEV__
        ) {
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

  const shouldShowImage =
    Boolean(
      safePhotoUrl &&
      !imageFailed,
    );

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          AVATAR
      ====================================================== */}

      <View
        style={
          styles.avatarContainer
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
              FixxamTokens.motion.fast
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
              size="sm"
              state="muted"
            />
          </View>
        )}

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

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <View
        style={
          styles.content
        }
      >
        <AppText
          variant="caption"
          tone="muted"
        >
          Worker
        </AppText>

        <AppText
          variant="bodyMedium"
          weight="bold"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={
            styles.name
          }
        >
          {name}
        </AppText>

        <View
          style={
            styles.metaRow
          }
        >
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

          {safeDistance !==
          undefined ? (
            <>
              <View
                style={
                  styles.metaDot
                }
              />

              <View
                style={
                  styles.distance
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
                >
                  {safeDistance.toFixed(
                    1,
                  )}{" "}
                  km
                </AppText>
              </View>
            </>
          ) : null}
        </View>
      </View>

      {/* ======================================================
          STATUS
      ====================================================== */}

      <View
        style={[
          styles.status,

          online
            ? styles.statusOnline
            : styles.statusOffline,
        ]}
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
          weight="semibold"
          style={
            online
              ? styles.statusTextOnline
              : styles.statusTextOffline
          }
        >
          {online
            ? "Available"
            : "Offline"}
        </AppText>
      </View>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width:
        "100%",

      minHeight:
        70,

      flexDirection:
        "row",

      alignItems:
        "center",

      padding:
        FixxamTokens.spacing.sm,

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.background,
    },

    /* ========================================================
       AVATAR
    ======================================================== */

    avatarContainer: {
      position:
        "relative",

      width:
        52,

      height:
        52,

      flexShrink:
        0,

      overflow:
        "hidden",

      marginRight:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    avatar: {
      width:
        "100%",

      height:
        "100%",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    avatarPlaceholder: {
      flex:
        1,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
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
       CONTENT
    ======================================================== */

    content: {
      flex:
        1,

      minWidth:
        0,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    name: {
      marginTop:
        2,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       META
    ======================================================== */

    metaRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        2,
    },

    category: {
      flexShrink:
        1,

      maxWidth:
        "68%",
    },

    metaDot: {
      width:
        3,

      height:
        3,

      flexShrink:
        0,

      marginHorizontal:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.textMuted,
    },

    distance: {
      flexShrink:
        0,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       STATUS
    ======================================================== */

    status: {
      flexShrink:
        0,

      minHeight:
        28,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.full,
    },

    statusOnline: {
      backgroundColor:
        Colors.successSoft,
    },

    statusOffline: {
      backgroundColor:
        Colors.disabledBackground,
    },

    statusDot: {
      width:
        6,

      height:
        6,

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

    statusTextOnline: {
      color:
        Colors.success,
    },

    statusTextOffline: {
      color:
        Colors.textSecondary,
    },
  });

export default memo(
  RequestWorkerCard,
);