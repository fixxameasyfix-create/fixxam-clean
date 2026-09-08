import React, {
  memo,
  useMemo,
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
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  name: string;

  photo?: string;

  phone?: string;

  rating?: number;

  verified?: boolean;

  onCall?: () => void;

  onMessage?: () => void;
};

/* ============================================================
   HELPERS
============================================================ */

function getSafeText(
  value: unknown,
  fallback = "",
): string {
  if (
    typeof value === "string" &&
    value.trim()
  ) {
    return value.trim();
  }

  return fallback;
}

function getSafeRating(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
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

/* ============================================================
   COMPONENT
============================================================ */

function WorkerOrderCustomer({
  name,
  photo,
  phone,
  rating = 0,
  verified = false,
  onCall,
  onMessage,
}: Props) {
  const displayName =
    useMemo(
      () =>
        getSafeText(
          name,
          "Customer",
        ),
      [name],
    );

  const displayPhoto =
    useMemo(
      () =>
        getSafeText(
          photo,
        ),
      [photo],
    );

  const displayPhone =
    useMemo(
      () =>
        getSafeText(
          phone,
        ),
      [phone],
    );

  const safeRating =
    useMemo(
      () =>
        getSafeRating(
          rating,
        ),
      [rating],
    );

  const hasActions =
    Boolean(
      onCall ||
        onMessage,
    );

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          CUSTOMER
      ====================================================== */}

      <View
        style={
          styles.row
        }
      >
        {displayPhoto ? (
          <Image
            source={{
              uri:
                displayPhoto,
            }}
            style={
              styles.avatar
            }
            contentFit="cover"
            transition={150}
            recyclingKey={
              displayPhoto
            }
            accessibilityLabel={`${displayName} profile photo`}
          />
        ) : (
          <View
            style={
              styles.placeholder
            }
          >
            <AppIcon
              name="profile"
              role="worker"
              size="lg"
              color={
                WorkerColors.primary
              }
            />
          </View>
        )}

        {/* ====================================================
            INFO
        ==================================================== */}

        <View
          style={
            styles.info
          }
        >
          <View
            style={
              styles.nameRow
            }
          >
            <AppText
              variant="heading3"
              weight="bold"
              numberOfLines={1}
              style={
                styles.name
              }
            >
              {displayName}
            </AppText>

            {verified ? (
              <AppIcon
                name="verified"
                size="sm"
                color={
                  Colors.success
                }
              />
            ) : null}
          </View>

          {displayPhone ? (
            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={
                styles.phone
              }
            >
              {displayPhone}
            </AppText>
          ) : null}

          <View
            style={
              styles.ratingRow
            }
          >
            <AppIcon
              name="star"
              size="xs"
              color={
                Colors.warning
              }
            />

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.rating
              }
            >
              {safeRating.toFixed(
                1,
              )}
            </AppText>
          </View>
        </View>
      </View>

      {/* ======================================================
          ACTIONS
      ====================================================== */}

      {hasActions ? (
        <View
          style={
            styles.actions
          }
        >
          {onCall ? (
            <Pressable
              onPress={
                onCall
              }
              accessibilityRole="button"
              accessibilityLabel={`Call ${displayName}`}
              hitSlop={6}
              style={({
                pressed,
              }) => [
                styles.actionButton,

                pressed
                  ? styles.actionPressed
                  : null,
              ]}
            >
              <AppIcon
                name="phone"
                role="worker"
                size="sm"
                color={
                  WorkerColors.primary
                }
              />
            </Pressable>
          ) : null}

          {onMessage ? (
            <Pressable
              onPress={
                onMessage
              }
              accessibilityRole="button"
              accessibilityLabel={`Message ${displayName}`}
              hitSlop={6}
              style={({
                pressed,
              }) => [
                styles.actionButton,

                pressed
                  ? styles.actionPressed
                  : null,
              ]}
            >
              <AppIcon
                name="messages"
                role="worker"
                size="sm"
                color={
                  WorkerColors.primary
                }
              />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

WorkerOrderCustomer.displayName =
  "WorkerOrderCustomer";

export default memo(
  WorkerOrderCustomer,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.lg,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       CUSTOMER
    ======================================================== */

    row: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    avatar: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      flexShrink: 0,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    placeholder: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    /* ========================================================
       INFO
    ======================================================== */

    info: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    nameRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    name: {
      flexShrink: 1,

      color:
        Colors.textPrimary,
    },

    phone: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },

    ratingRow: {
      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    rating: {
      marginLeft:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       ACTIONS
    ======================================================== */

    actions: {
      marginTop:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      justifyContent:
        "flex-end",

      gap:
        FixxamTokens.spacing.md,
    },

    actionButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        WorkerColors.primarySoft,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    actionPressed: {
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