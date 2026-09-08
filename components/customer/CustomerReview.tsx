import React, {
  memo,
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
  firstName: string;

  surname: string;

  otherName: string;

  email: string;

  phone: string;

  photo: string | null;
};

type ReviewItemProps = {
  label: string;

  value: string;

  last?: boolean;
};

/* ==============================================================
   COMPONENT
============================================================== */

function CustomerReview({
  firstName,
  surname,
  otherName,
  email,
  phone,
  photo,
}: Props) {
  const fullName =
    useMemo(
      () =>
        [
          firstName,
          surname,
          otherName,
        ]
          .map((value) =>
            value.trim(),
          )
          .filter(Boolean)
          .join(" "),
      [
        firstName,
        otherName,
        surname,
      ],
    );

  const hasPhoto =
    typeof photo === "string" &&
    photo.trim().length > 0;

  return (
    <AppCard
      role="customer"
      variant="outlined"
      style={
        styles.card
      }
    >
      {/* ========================================================
          PROFILE PHOTO
      ======================================================== */}

      <View
        style={
          styles.photoSection
        }
      >
        {hasPhoto ? (
          <Image
            source={{
              uri: photo,
            }}
            contentFit="cover"
            transition={150}
            accessibilityLabel="Profile photo"
            style={
              styles.photo
            }
          />
        ) : (
          <View
            accessibilityLabel="No profile photo added"
            style={
              styles.photoPlaceholder
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

        <AppText
          variant="caption"
          weight="medium"
          tone="secondary"
          style={
            styles.photoLabel
          }
        >
          Profile photo
        </AppText>
      </View>

      {/* ========================================================
          HEADER
      ======================================================== */}

      <AppText
        variant="heading2"
        weight="bold"
        style={
          styles.title
        }
      >
        Almost there!
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        style={
          styles.subtitle
        }
      >
        Check your details before creating your account.
      </AppText>

      {/* ========================================================
          DETAILS
      ======================================================== */}

      <View
        style={
          styles.details
        }
      >
        <ReviewItem
          label="Full name"
          value={
            fullName ||
            "Not provided"
          }
        />

        <ReviewItem
          label="Account type"
          value="Customer"
        />

        <ReviewItem
          label="Email address"
          value={
            email.trim() ||
            "Not provided"
          }
        />

        <ReviewItem
          label="Phone number"
          value={
            phone.trim() ||
            "Not provided"
          }
        />

        <ReviewItem
          label="Password"
          value="••••••••"
          last
        />
      </View>

      {/* ========================================================
          SECURITY NOTICE
      ======================================================== */}

      <View
        style={
          styles.notice
        }
      >
        <View
          style={
            styles.noticeIcon
          }
        >
          <AppIcon
            name="shield"
            role="customer"
            size="sm"
            state="active"
          />
        </View>

        <View
          style={
            styles.noticeContent
          }
        >
          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.noticeTitle
            }
          >
            Your information is secure
          </AppText>

          <AppText
            variant="caption"
            style={
              styles.noticeText
            }
          >
            You can update most of your details later from your profile.
          </AppText>
        </View>
      </View>
    </AppCard>
  );
}

export default memo(
  CustomerReview,
);

/* ==============================================================
   REVIEW ITEM
============================================================== */

const ReviewItem =
  memo(
    function ReviewItem({
      label,
      value,
      last = false,
    }: ReviewItemProps) {
      return (
        <View
          style={[
            styles.item,

            last
              ? styles.lastItem
              : null,
          ]}
        >
          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.label
            }
          >
            {label}
          </AppText>

          <AppText
            variant="body"
            weight="medium"
            numberOfLines={1}
            style={
              styles.value
            }
          >
            {value}
          </AppText>
        </View>
      );
    },
  );

ReviewItem.displayName =
  "CustomerReviewItem";

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    card: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.md,
    },

    /* ==========================================================
       PHOTO
    ========================================================== */

    photoSection: {
      alignItems:
        "center",

      marginBottom:
        FixxamTokens.spacing.md,
    },

    photo: {
      width:
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    photoPlaceholder: {
      width:
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    photoLabel: {
      marginTop:
        FixxamTokens.spacing.xs,
    },

    /* ==========================================================
       HEADER
    ========================================================== */

    title: {
      marginBottom:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginBottom:
        FixxamTokens.spacing.md,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       DETAILS
    ========================================================== */

    details: {
      overflow:
        "hidden",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.background,
    },

    item: {
      minHeight: 54,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      justifyContent:
        "center",

      borderBottomWidth: 1,

      borderBottomColor:
        Colors.divider,
    },

    lastItem: {
      borderBottomWidth: 0,
    },

    label: {
      marginBottom:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    value: {
      color:
        Colors.textPrimary,
    },

    /* ==========================================================
       NOTICE
    ========================================================== */

    notice: {
      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    noticeIcon: {
      width:
        FixxamTokens.size.iconBox,

      flexShrink: 0,

      paddingTop:
        FixxamTokens.spacing.xxs,
    },

    noticeContent: {
      flex: 1,

      minWidth: 0,
    },

    noticeTitle: {
      marginBottom:
        FixxamTokens.spacing.xxs,

      color:
        CustomerColors.primary,
    },

    noticeText: {
      color:
        Colors.textSecondary,
    },
  });