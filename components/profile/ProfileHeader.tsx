import React, {
  useMemo,
} from "react";

import {
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
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  name: string;

  photoUrl: string;

  email: string;

  phone: string;

  role: "customer" | "worker";
};

/* ============================================================
   HELPERS
============================================================ */

function cleanText(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/* ============================================================
   COMPONENT
============================================================ */

export default function ProfileHeader({
  name,
  photoUrl,
  email,
  phone,
  role,
}: Props) {
  const safeName =
    cleanText(name) || "Fixxam User";

  const safePhotoUrl =
    cleanText(photoUrl);

  const safeEmail =
    cleanText(email);

  const safePhone =
    cleanText(phone);

  const roleColors =
    useMemo(
      () =>
        role === "worker"
          ? WorkerColors
          : CustomerColors,
      [role],
    );

  const accountLabel =
    role === "worker"
      ? "Worker Account"
      : "Customer Account";

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View
      style={styles.container}
    >
      {/* =====================================================
          AVATAR
      ===================================================== */}

      <View
        style={[
          styles.avatarContainer,
          {
            backgroundColor:
              roleColors.primarySoft,
          },
        ]}
      >
        {safePhotoUrl ? (
          <Image
            source={{
              uri: safePhotoUrl,
            }}
            style={styles.avatar}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={150}
            accessibilityLabel={`${safeName} profile photo`}
          />
        ) : (
          <AppIcon
            name="profile"
            role={role}
            size="lg"
            color={
              roleColors.primary
            }
          />
        )}
      </View>

      {/* =====================================================
          INFO
      ===================================================== */}

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
          {safeName}
        </AppText>

        {/* ===================================================
            ACCOUNT BADGE
        =================================================== */}

        <View
          style={[
            styles.badge,
            {
              backgroundColor:
                roleColors.primarySoft,
            },
          ]}
        >
          <AppText
            variant="caption"
            weight="bold"
            style={[
              styles.badgeText,
              {
                color:
                  roleColors.primary,
              },
            ]}
          >
            {accountLabel}
          </AppText>
        </View>

        {/* ===================================================
            PHONE
        =================================================== */}

        {safePhone ? (
          <View
            style={
              styles.contactRow
            }
          >
            <AppIcon
              name="phone"
              role={role}
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
                styles.contactText
              }
            >
              {safePhone}
            </AppText>
          </View>
        ) : null}

        {/* ===================================================
            EMAIL
        =================================================== */}

        {safeEmail ? (
          <View
            style={
              styles.contactRow
            }
          >
            <AppIcon
              name="mail"
              role={role}
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
                styles.contactText
              }
            >
              {safeEmail}
            </AppText>
          </View>
        ) : null}
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
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       AVATAR
    ======================================================== */

    avatarContainer: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      flexShrink: 0,

      overflow: "hidden",

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.lg,
    },

    avatar: {
      width: "100%",

      height: "100%",
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

    /* ========================================================
       NAME
    ======================================================== */

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
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xxs,

      borderRadius:
        FixxamTokens.radius.chip,
    },

    badgeText: {
      lineHeight: 14,
    },

    /* ========================================================
       CONTACT
    ======================================================== */

    contactRow: {
      minWidth: 0,

      marginTop:
        FixxamTokens.spacing.xxs,

      flexDirection: "row",

      alignItems: "center",
    },

    contactText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },
  });