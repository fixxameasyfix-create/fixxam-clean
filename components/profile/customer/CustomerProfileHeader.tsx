import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import ProfileAvatar from "@/components/profile/shared/ProfileAvatar";
import ProfileBadge from "@/components/profile/shared/ProfileBadge";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  name: string;

  phone: string;

  email: string;

  photoUrl?: string;

  verified?: boolean;

  onEditPhoto?: () => void;

  onNotifications?: () => void;

  onSettings?: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

export default function CustomerProfileHeader({
  name,
  phone,
  email,
  photoUrl,
  verified = true,
  onEditPhoto,
  onNotifications,
  onSettings,
}: Props) {
  const hasPhone =
    Boolean(phone?.trim());

  const hasEmail =
    Boolean(email?.trim());

  return (
    <View
      style={styles.container}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <View
        style={styles.topRow}
      >
        <AppText
          variant="heading3"
          weight="bold"
          style={styles.title}
        >
          Profile
        </AppText>

        <View
          style={styles.actions}
        >
          {/* NOTIFICATIONS */}

          <Pressable
            onPress={
              onNotifications
            }
            disabled={
              !onNotifications
            }
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            accessibilityState={{
              disabled:
                !onNotifications,
            }}
            hitSlop={4}
            style={({
              pressed,
            }) => [
              styles.iconButton,

              pressed &&
              onNotifications
                ? styles.pressed
                : null,
            ]}
          >
            <AppIcon
              name="notifications"
              role="customer"
              size="sm"
              color={
                Colors.textPrimary
              }
            />
          </Pressable>

          {/* SETTINGS */}

          <Pressable
            onPress={
              onSettings
            }
            disabled={
              !onSettings
            }
            accessibilityRole="button"
            accessibilityLabel="Settings"
            accessibilityState={{
              disabled:
                !onSettings,
            }}
            hitSlop={4}
            style={({
              pressed,
            }) => [
              styles.iconButton,

              pressed &&
              onSettings
                ? styles.pressed
                : null,
            ]}
          >
            <AppIcon
              name="settings"
              role="customer"
              size="sm"
              color={
                Colors.textPrimary
              }
            />
          </Pressable>
        </View>
      </View>

      {/* =====================================================
          PROFILE
      ===================================================== */}

      <View
        style={styles.profileRow}
      >
        <ProfileAvatar
          photoUrl={
            photoUrl
          }
          size={
            FixxamTokens.size.avatarXl
          }
          editable={
            Boolean(
              onEditPhoto,
            )
          }
          onPress={
            onEditPhoto
          }
        />

        <View
          style={styles.info}
        >
          {/* NAME */}

          <AppText
            variant="bodyLarge"
            weight="bold"
            numberOfLines={1}
            style={styles.name}
          >
            {name}
          </AppText>

          {/* BADGE */}

          <View
            style={styles.badge}
          >
            <ProfileBadge
              role="customer"
              verified={
                verified
              }
            />
          </View>

          {/* PHONE */}

          {hasPhone ? (
            <View
              style={
                styles.detailRow
              }
            >
              <AppIcon
                name="phone"
                role="customer"
                size="xs"
                color={
                  Colors.textSecondary
                }
              />

              <AppText
                variant="caption"
                tone="secondary"
                numberOfLines={1}
                style={
                  styles.detail
                }
              >
                {phone}
              </AppText>
            </View>
          ) : null}

          {/* EMAIL */}

          {hasEmail ? (
            <View
              style={
                styles.detailRow
              }
            >
              <AppIcon
                name="mail"
                role="customer"
                size="xs"
                color={
                  Colors.textSecondary
                }
              />

              <AppText
                variant="caption"
                tone="secondary"
                numberOfLines={1}
                style={
                  styles.detail
                }
              >
                {email}
              </AppText>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CONTAINER
    ======================================================== */

    container: {
      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    topRow: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      marginBottom:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",
    },

    title: {
      color:
        Colors.textPrimary,
    },

    actions: {
      flexDirection: "row",

      alignItems: "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    iconButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      alignItems: "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.background,
    },

    pressed: {
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

    /* ========================================================
       PROFILE ROW
    ======================================================== */

    profileRow: {
      flexDirection: "row",

      alignItems: "center",
    },

    /* ========================================================
       PROFILE INFO
    ======================================================== */

    info: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    name: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       BADGE
    ======================================================== */

    badge: {
      alignSelf:
        "flex-start",

      marginTop:
        FixxamTokens.spacing.xxs,

      marginBottom:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       CONTACT
    ======================================================== */

    detailRow: {
      minWidth: 0,

      marginTop:
        FixxamTokens.spacing.xxs,

      flexDirection: "row",

      alignItems: "center",
    },

    detail: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },
  });