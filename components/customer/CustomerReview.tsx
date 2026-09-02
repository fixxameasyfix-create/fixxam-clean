import React from "react";
import {
  Image,
  StyleSheet,
  View,
} from "react-native";

import {
  AppCard,
  AppText,
} from "@/components/ui";

import {
  CustomerColors,
} from "@/theme";

interface Props {
  firstName: string;
  surname: string;
  otherName: string;
  email: string;
  phone: string;
  photo: string | null;
}

export default function CustomerReview({
  firstName,
  surname,
  otherName,
  email,
  phone,
  photo,
}: Props) {
  const fullName =
    [
      firstName,
      surname,
      otherName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

  return (
    <AppCard style={styles.card}>
      {/* PROFILE PHOTO */}

      <View style={styles.photoSection}>
        {photo ? (
          <Image
            source={{ uri: photo }}
            style={styles.photo}
          />
        ) : (
          <View style={styles.photoPlaceholder}>
            <AppText style={styles.photoPlaceholderText}>
              No photo
            </AppText>
          </View>
        )}

        <AppText
          weight="semibold"
          style={styles.photoLabel}
        >
          Profile photo
        </AppText>
      </View>

      {/* HEADER */}

      <AppText
        weight="bold"
        style={styles.title}
      >
        Almost there!
      </AppText>

      <AppText
        style={styles.subtitle}
      >
        Check your details before
        creating your account.
      </AppText>

      {/* DETAILS */}

      <View style={styles.details}>
        <ReviewItem
          label="Full name"
          value={
            fullName || "Not provided"
          }
        />

        <ReviewItem
          label="Account type"
          value="Customer"
        />

        <ReviewItem
          label="Email address"
          value={
            email || "Not provided"
          }
        />

        <ReviewItem
          label="Phone number"
          value={
            phone || "Not provided"
          }
        />

        <ReviewItem
          label="Password"
          value="••••••••"
          last
        />
      </View>

      {/* SECURITY NOTICE */}

      <View style={styles.notice}>
        <View style={styles.noticeDot} />

        <View style={styles.noticeContent}>
          <AppText
            weight="bold"
            style={styles.noticeTitle}
          >
            Your information is secure
          </AppText>

          <AppText
            style={styles.noticeText}
          >
            You can update most of your
            details later from your profile.
          </AppText>
        </View>
      </View>
    </AppCard>
  );
}

/* ==============================================================
   REVIEW ITEM
============================================================== */

function ReviewItem({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.item,
        last && styles.lastItem,
      ]}
    >
      <AppText style={styles.label}>
        {label}
      </AppText>

      <AppText
        weight="semibold"
        numberOfLines={1}
        style={styles.value}
      >
        {value}
      </AppText>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 18,
  },

  photoSection: {
    alignItems: "center",
    marginBottom: 16,
  },

  photo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F3F4F6",
  },

  photoPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  photoPlaceholderText: {
    fontSize: 11,
    color: CustomerColors.textSecondary,
  },

  photoLabel: {
    marginTop: 7,
    fontSize: 11,
    color: CustomerColors.textSecondary,
  },

  title: {
    fontSize: 20,
    lineHeight: 26,
    color: CustomerColors.textPrimary,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: CustomerColors.textSecondary,
    marginBottom: 16,
  },

  details: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#F8FAFC",
  },

  item: {
    minHeight: 54,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#E8EDF3",
    justifyContent: "center",
  },

  lastItem: {
    borderBottomWidth: 0,
  },

  label: {
    fontSize: 10.5,
    lineHeight: 15,
    color: CustomerColors.textSecondary,
    marginBottom: 2,
  },

  value: {
    fontSize: 13,
    lineHeight: 18,
    color: CustomerColors.textPrimary,
  },

  notice: {
    marginTop: 14,
    padding: 11,
    borderRadius: 13,
    backgroundColor: "#FFF7ED",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  noticeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FF6A00",
    marginTop: 5,
    marginRight: 9,
  },

  noticeContent: {
    flex: 1,
  },

  noticeTitle: {
    fontSize: 11.5,
    lineHeight: 17,
    color: "#EA580C",
    marginBottom: 1,
  },

  noticeText: {
    fontSize: 10.5,
    lineHeight: 16,
    color: "#7C2D12",
  },
});