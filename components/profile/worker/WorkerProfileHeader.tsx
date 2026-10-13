import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppCard,
  AppIcon,
  AppText,
} from "@/components/ui";

import ProfileAvatar from "@/components/profile/shared/ProfileAvatar";
import ProfileBadge from "@/components/profile/shared/ProfileBadge";

import {
  Colors,
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

export default function WorkerProfileHeader({
  name,
  phone,
  email,
  photoUrl,
  verified = false,
  onEditPhoto,
}: Props) {
  const safeName =
    cleanText(name) ||
    "Worker";

  const safePhone =
    cleanText(phone);

  const safeEmail =
    cleanText(email);

  return (
    <AppCard
      role="worker"
      style={styles.card}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <View
        style={styles.headerRow}
      >
        <AppText
          variant="heading3"
          weight="bold"
          style={styles.title}
        >
          Profile
        </AppText>
      </View>

      {/* =====================================================
          PROFILE
      ===================================================== */}

      <View
        style={styles.profileRow}
      >
        {/* ==================================================
            PHOTO
        ================================================== */}

        <ProfileAvatar
          role="worker"
          photoUrl={photoUrl}
          size={
            FixxamTokens.size
              .avatarXl
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

        {/* ==================================================
            INFO
        ================================================== */}

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

          {/* =================================================
              VERIFICATION
          ================================================= */}

          <View
            style={styles.badge}
          >
            <ProfileBadge
              role="worker"
              verified={
                verified
              }
            />
          </View>

          {/* =================================================
              PHONE
          ================================================= */}

          {safePhone ? (
            <View
              style={
                styles.contactRow
              }
            >
              <AppIcon
                name="phone"
                role="worker"
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

          {/* =================================================
              EMAIL
          ================================================= */}

          {safeEmail ? (
            <View
              style={
                styles.contactRow
              }
            >
              <AppIcon
                name="mail"
                role="worker"
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
    </AppCard>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CARD
    ======================================================== */

    card: {
      marginHorizontal:
        FixxamTokens.spacing.md,

      marginTop:
        FixxamTokens.spacing.xs,

      marginBottom:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
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
       HEADER
    ======================================================== */

    headerRow: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      marginBottom:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",
    },

    title: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       PROFILE
    ======================================================== */

    profileRow: {
      flexDirection: "row",

      alignItems: "center",
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