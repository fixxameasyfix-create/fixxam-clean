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
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import {
  auth,
} from "@/firebase/config";

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
  icon: string;

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
  /* ============================================================
     FIREBASE AUTH DETAILS
  ============================================================ */

  const firebaseUser =
    auth.currentUser;

  const firebaseEmail =
    firebaseUser?.email?.trim() ?? "";

  /* ============================================================
     RESOLVED EMAIL
     
     Priority:
     1. Form email
     2. Firebase Auth email
  ============================================================ */

  const resolvedEmail =
    useMemo(() => {
      const formEmail =
        email.trim();

      if (formEmail) {
        return formEmail;
      }

      if (firebaseEmail) {
        return firebaseEmail;
      }

      return "";
    }, [
      email,
      firebaseEmail,
    ]);

  /* ============================================================
     RESOLVED PHONE
     
     Phone normally comes from the customer form/profile.
     Firebase Auth does not always contain a phone number,
     so we do not pretend it does.
  ============================================================ */

  const resolvedPhone =
    useMemo(() => {
      return phone.trim();
    }, [phone]);

  /* ============================================================
     FULL NAME
  ============================================================ */

  const fullName =
    useMemo(
      () =>
        [
          firstName,
          surname,
          otherName,
        ]
          .map(value =>
            value.trim(),
          )
          .filter(Boolean)
          .join(" "),
      [
        firstName,
        surname,
        otherName,
      ],
    );

  /* ============================================================
     PHOTO
  ============================================================ */

  const hasPhoto =
    typeof photo === "string" &&
    photo.trim().length > 0;

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View
      style={styles.container}
    >
      {/* ======================================================
          PROFILE PHOTO
      ====================================================== */}

      <View
        style={styles.photoRow}
      >
        {hasPhoto ? (
          <Image
            source={{
              uri: photo,
            }}
            contentFit="cover"
            transition={150}
            accessibilityLabel="Profile photo"
            style={styles.photo}
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
              size="md"
              state="muted"
            />
          </View>
        )}

        <View
          style={styles.photoInfo}
        >
          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.photoLabel
            }
          >
            Profile photo
          </AppText>

          <AppText
            variant="body"
            weight="medium"
            style={
              styles.photoValue
            }
          >
            {hasPhoto
              ? "Added"
              : "Not added"}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          DETAILS
      ====================================================== */}

      <View
        style={styles.details}
      >
        <ReviewItem
          icon="profile"
          label="Full name"
          value={
            fullName ||
            "Not provided"
          }
        />

        <ReviewItem
          icon="mail"
          label="Email address"
          value={
            resolvedEmail ||
            "Not provided"
          }
        />

        {resolvedPhone ? (
          <ReviewItem
            icon="phone"
            label="Phone number"
            value={resolvedPhone}
          />
        ) : null}

        <ReviewItem
          icon="lock"
          label="Password"
          value="••••••••"
          last
        />
      </View>

      {/* ======================================================
          SECURITY NOTICE
      ====================================================== */}

      <View
        style={styles.notice}
      >
        <View
          style={styles.noticeIcon}
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
    </View>
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
      icon,
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
          <View
            style={
              styles.itemIcon
            }
          >
            <AppIcon
              name={icon}
              role="customer"
              size="sm"
              state="muted"
            />
          </View>

          <View
            style={
              styles.itemContent
            }
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
              ellipsizeMode="tail"
              style={
                styles.value
              }
            >
              {value}
            </AppText>
          </View>
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
    container: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.md,
    },

    /* ==========================================================
       PROFILE PHOTO
    ========================================================== */

    photoRow: {
      width: "100%",

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.background,
    },

    photo: {
      width: 52,

      height: 52,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    photoPlaceholder: {
      width: 52,

      height: 52,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    photoInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    photoLabel: {
      marginBottom:
        FixxamTokens.spacing.xxs,
    },

    photoValue: {
      color:
        Colors.textPrimary,
    },

    /* ==========================================================
       DETAILS
    ========================================================== */

    details: {
      width: "100%",

      overflow: "hidden",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.background,
    },

    item: {
      minHeight: 64,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderBottomWidth: 1,

      borderBottomColor:
        Colors.divider,
    },

    lastItem: {
      borderBottomWidth: 0,
    },

    itemIcon: {
      width: 32,

      height: 32,

      alignItems: "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.sm,
    },

    itemContent: {
      flex: 1,

      minWidth: 0,
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
       SECURITY NOTICE
    ========================================================== */

    notice: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
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

      lineHeight: 20,
    },
  });