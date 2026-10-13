import React, {
  memo,
  useEffect,
  useMemo,
  useState,
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
  workerId: string;

  name: string;

  photoUrl?: string;

  location?: string;

  rating?: number;

  onViewProfile: () => void;

  onCall: () => void;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value.trim();
}

function getRemoteImageUrl(
  value: unknown,
): string {
  const url =
    cleanString(value);

  if (
    url.startsWith(
      "https://",
    ) ||
    url.startsWith(
      "http://",
    )
  ) {
    return url;
  }

  return "";
}

/* ==============================================================
   COMPONENT
============================================================== */

function ProductSeller({
  name,
  photoUrl,
  location,
  rating = 0,
  onViewProfile,
  onCall,
}: Props) {
  const [
    imageFailed,
    setImageFailed,
  ] =
    useState(false);

  /* ============================================================
     SELLER DATA
  ============================================================ */

  const sellerName =
    cleanString(name) ||
    "Worker";

  const sellerLocation =
    cleanString(location);

  const imageUrl =
    getRemoteImageUrl(
      photoUrl,
    );

  useEffect(() => {
    setImageFailed(false);
  }, [
    imageUrl,
  ]);

  const showPhoto =
    Boolean(imageUrl) &&
    !imageFailed;

  /* ============================================================
     RATING
  ============================================================ */

  const safeRating =
    useMemo(() => {
      const parsed =
        Number(rating);

      if (
        !Number.isFinite(parsed) ||
        parsed <= 0
      ) {
        return null;
      }

      return Math.min(
        5,
        Math.max(
          0,
          parsed,
        ),
      );
    }, [
      rating,
    ]);

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View style={styles.container}>
      {/* ======================================================
          SELLER
      ====================================================== */}

      <View style={styles.sellerHeader}>
        <View style={styles.avatarWrapper}>
          {showPhoto ? (
            <Image
              source={{
                uri: imageUrl,
              }}
              style={styles.avatar}
              contentFit="cover"
              cachePolicy="memory-disk"
              accessibilityLabel={`${sellerName} profile photo`}
              onError={() =>
                setImageFailed(true)
              }
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <AppIcon
                name="profile"
                role="customer"
                size="sm"
                state="muted"
              />
            </View>
          )}
        </View>

        <View style={styles.sellerInfo}>
          <AppText
            variant="bodyMedium"
            weight="bold"
            numberOfLines={1}
          >
            {sellerName}
          </AppText>

          {sellerLocation ? (
            <View style={styles.locationRow}>
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
                style={styles.location}
              >
                {sellerLocation}
              </AppText>
            </View>
          ) : null}
        </View>
      </View>

      {/* ======================================================
          RATING
      ====================================================== */}

      <View style={styles.ratingRow}>
        <AppIcon
          name="star"
          role="customer"
          size="xs"
          color={Colors.warning}
        />

        <AppText
          variant="caption"
          weight="bold"
          style={styles.rating}
        >
          {safeRating !== null
            ? safeRating.toFixed(1)
            : "New"}
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          style={styles.ratingLabel}
        >
          Seller
        </AppText>
      </View>

      {/* ======================================================
          ACTIONS
      ====================================================== */}

      <View style={styles.actions}>
        {/* VIEW PROFILE */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View ${sellerName}'s profile`}
          onPress={onViewProfile}
          style={({ pressed }) => [
            styles.actionButton,
            styles.profileButton,

            pressed
              ? styles.buttonPressed
              : null,
          ]}
        >
          <AppIcon
            name="profile"
            role="customer"
            size="sm"
            state="active"
          />

          <AppText
            variant="caption"
            weight="bold"
            numberOfLines={1}
            style={styles.profileButtonText}
          >
            View Profile
          </AppText>
        </Pressable>

        {/* FIXXAM VOICE */}

<Pressable
  accessibilityRole="button"
  accessibilityLabel={`Start Fixxam Voice call with ${sellerName}`}
  accessibilityHint="Starts a secure voice call inside Fixxam"
  onPress={onCall}
  style={({ pressed }) => [
    styles.actionButton,
    styles.callButton,

    pressed
      ? styles.buttonPressed
      : null,
  ]}
>
  <AppIcon
    name="phone"
    role="customer"
    size="sm"
    color={Colors.textInverse}
  />

  <AppText
    variant="caption"
    weight="bold"
    numberOfLines={1}
    style={styles.callButtonText}
  >
    Call
  </AppText>
</Pressable>
      </View>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  container: {
    marginHorizontal:
      FixxamTokens.spacing.lg,

    marginTop:
      FixxamTokens.spacing.md,

    marginBottom:
      FixxamTokens.spacing.md,

    padding:
      FixxamTokens.spacing.md,

    borderWidth: 1,

    borderColor:
      Colors.border,

    borderRadius:
      FixxamTokens.radius.lg,

    backgroundColor:
      Colors.surface,

    ...FixxamTokens.shadow.card,
  },

  /* ==========================================================
     SELLER
  ========================================================== */

  sellerHeader: {
    flexDirection: "row",

    alignItems: "center",
  },

  avatarWrapper: {
    width:
      FixxamTokens.size.avatarSm,

    height:
      FixxamTokens.size.avatarSm,

    flexShrink: 0,

    overflow: "hidden",

    borderRadius:
      FixxamTokens.radius.full,

    backgroundColor:
      Colors.disabledBackground,
  },

  avatar: {
    width: "100%",

    height: "100%",

    backgroundColor:
      Colors.disabledBackground,
  },

  avatarPlaceholder: {
    flex: 1,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor:
      CustomerColors.primarySoft,
  },

  sellerInfo: {
    flex: 1,

    minWidth: 0,

    marginLeft:
      FixxamTokens.spacing.sm,
  },

  locationRow: {
    flexDirection: "row",

    alignItems: "center",

    marginTop:
      FixxamTokens.spacing.xxs,
  },

  location: {
    flex: 1,

    minWidth: 0,

    marginLeft:
      FixxamTokens.spacing.xs,
  },

  /* ==========================================================
     RATING
  ========================================================== */

  ratingRow: {
    alignSelf: "flex-start",

    flexDirection: "row",

    alignItems: "center",

    marginTop:
      FixxamTokens.spacing.sm,

    paddingHorizontal:
      FixxamTokens.spacing.sm,

    paddingVertical:
      FixxamTokens.spacing.xs,

    borderRadius:
      FixxamTokens.radius.sm,

    backgroundColor:
      Colors.warningSoft,
  },

  rating: {
    marginLeft:
      FixxamTokens.spacing.xs,

    color:
      Colors.textPrimary,
  },

  ratingLabel: {
    marginLeft:
      FixxamTokens.spacing.xs,
  },

  /* ==========================================================
     ACTIONS
  ========================================================== */

  actions: {
    flexDirection: "row",

    gap:
      FixxamTokens.spacing.sm,

    marginTop:
      FixxamTokens.spacing.md,
  },

  actionButton: {
    flex: 1,

    minWidth: 0,

    minHeight:
      FixxamTokens.size
        .minimumTouchTarget,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap:
      FixxamTokens.spacing.xs,

    paddingHorizontal:
      FixxamTokens.spacing.sm,

    borderRadius:
      FixxamTokens.radius.button,
  },

  profileButton: {
    borderWidth: 1,

    borderColor:
      CustomerColors.primary,

    backgroundColor:
      Colors.surface,
  },

  profileButtonText: {
    color:
      CustomerColors.primary,
  },

  callButton: {
    borderWidth: 1,

    borderColor:
      CustomerColors.primary,

    backgroundColor:
      CustomerColors.primary,
  },

  callButtonText: {
    color:
      Colors.textInverse,
  },

  /* ==========================================================
     PRESSED
  ========================================================== */

  buttonPressed: {
    opacity:
      FixxamTokens.motion
        .pressedOpacity,

    transform: [
      {
        scale:
          FixxamTokens.motion
            .scalePressed,
      },
    ],
  },
});

export default memo(
  ProductSeller,
);