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

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  name: string;

  photoURL?: string | null;

  onProfile: () => void;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanText(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/* ==============================================================
   COMPONENT
============================================================== */

const WorkerCustomerCard = memo(
  function WorkerCustomerCard({
    name,
    photoURL,
    onProfile,
  }: Props) {
    const safeName =
      useMemo(
        () =>
          cleanText(name) ||
          "Customer",
        [name],
      );

    const safePhotoURL =
      useMemo(
        () =>
          cleanText(photoURL),
        [photoURL],
      );

    return (
      <View
        style={
          styles.customerCard
        }
        accessible
        accessibilityRole="summary"
        accessibilityLabel={`${safeName}. Customer requesting service.`}
      >
        {/* ====================================================
            CUSTOMER INFO
        ==================================================== */}

        <View
          style={
            styles.customerTop
          }
        >
          <View
            style={
              styles.customerAvatar
            }
          >
            {safePhotoURL ? (
              <Image
                source={{
                  uri: safePhotoURL,
                }}
                style={
                  styles.avatarImage
                }
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={150}
                accessibilityLabel={`${safeName} profile photo`}
              />
            ) : (
              <AppIcon
                name="profile"
                size="lg"
                color={
                  Colors.textMuted
                }
              />
            )}
          </View>

          <View
            style={
              styles.customerInfo
            }
          >
            <AppText
              variant="body"
              weight="bold"
              numberOfLines={1}
              style={
                styles.customerName
              }
            >
              {safeName}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.customerCategory
              }
            >
              Customer
            </AppText>

            <View
              style={
                styles.customerStatusRow
              }
            >
              <View
                style={
                  styles.customerDot
                }
              />

              <AppText
                variant="caption"
                weight="semibold"
                style={
                  styles.customerStatus
                }
              >
                Requesting service
              </AppText>
            </View>
          </View>
        </View>

        {/* ====================================================
            PROFILE BUTTON
        ==================================================== */}

        <Pressable
          onPress={onProfile}
          accessibilityRole="button"
          accessibilityLabel={`View ${safeName} profile`}
          hitSlop={6}
          style={({
            pressed,
          }) => [
            styles.profileButton,

            pressed
              ? styles.buttonPressed
              : null,
          ]}
        >
          <AppIcon
            name="profile"
            role="worker"
            size="xs"
            color={
              WorkerColors.primary
            }
          />

          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.profileText
            }
          >
            VIEW PROFILE
          </AppText>

          <AppIcon
            name="next"
            role="worker"
            size="xs"
            color={
              WorkerColors.primary
            }
          />
        </Pressable>
      </View>
    );
  },
);

WorkerCustomerCard.displayName =
  "WorkerCustomerCard";

export default WorkerCustomerCard;

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       CARD
    ======================================================== */

    customerCard: {
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

    /* ========================================================
       CUSTOMER TOP
    ======================================================== */

    customerTop: {
      flexDirection: "row",

      alignItems: "center",
    },

    customerAvatar: {
      width:
        FixxamTokens.size
          .avatarLg,

      height:
        FixxamTokens.size
          .avatarLg,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      overflow: "hidden",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.disabledBackground,
    },

    avatarImage: {
      width: "100%",

      height: "100%",
    },

    customerInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    customerName: {
      color:
        Colors.textPrimary,
    },

    customerCategory: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    customerStatusRow: {
      marginTop:
        FixxamTokens.spacing.xs,

      flexDirection: "row",

      alignItems: "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    customerDot: {
      width: 7,

      height: 7,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.success,
    },

    customerStatus: {
      color:
        Colors.success,
    },

    /* ========================================================
       PROFILE BUTTON
    ======================================================== */

    profileButton: {
      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderWidth: 1,

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    profileText: {
      color:
        WorkerColors.primary,
    },

    /* ========================================================
       PRESS
    ======================================================== */

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