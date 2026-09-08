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

  phone: string;

  email: string;

  photoUrl?: string;

  onEditPhoto: () => void;
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
  onEditPhoto,
}: Props) {
  const safeName =
    cleanText(name) ||
    "Fixxam Worker";

  const safePhone =
    cleanText(phone);

  const safeEmail =
    cleanText(email);

  return (
    <AppCard
      role="worker"
      style={styles.card}
    >
      <View
        style={styles.row}
      >
        {/* ==================================================
            PROFILE PHOTO
        ================================================== */}

        <ProfileAvatar
          photoUrl={photoUrl}
          size={
            FixxamTokens.size
              .avatarXl
          }
          editable
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
              WORKER BADGE
          ================================================= */}

          <View
            style={styles.badge}
          >
            <View
              style={styles.dot}
            />

            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.badgeText
              }
            >
              Worker Account
            </AppText>
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
                  styles.contact
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
                  styles.contact
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
      marginHorizontal: 0,

      marginTop: 0,

      marginBottom: 0,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       ROW
    ======================================================== */

    row: {
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

    /* ========================================================
       NAME
    ======================================================== */

    name: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       WORKER BADGE
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

      flexDirection: "row",

      alignItems: "center",

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    dot: {
      width: 6,

      height: 6,

      marginRight:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primary,
    },

    badgeText: {
      lineHeight: 14,

      color:
        WorkerColors.primary,
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

    contact: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },
  });