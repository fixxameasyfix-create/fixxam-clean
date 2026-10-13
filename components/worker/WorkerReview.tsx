import React, {
  memo,
  useMemo,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import AppIcon from "@/components/ui/AppIcon";
import AppText from "@/components/ui/AppText";

import { FixxamTokens } from "@/theme";

type Props = {
  firstName: string;
  surname: string;
  otherName: string;

  email: string;

  category: string;
  subcategory: string;
  selectedServices: string[];

  experience: string;

  state: string;
  lga: string;

  serviceAddress: string;
  latitude: number | null;
  longitude: number | null;
  hourlyRate: string;
  phoneNumber: string;

  photo: string | null;

  about: string;

  workGallery: string[];

  acceptedTerms: boolean;

  onToggleTerms: () => void;
};

function WorkerReview({
  firstName,
  surname,
  otherName,
  email,
  category,
  subcategory,
  selectedServices,
  experience,
  state,
  lga,
  serviceAddress,
  latitude,
  longitude,
  hourlyRate,
  phoneNumber,
  photo,
  about,
  workGallery,
  acceptedTerms,
  onToggleTerms,
}: Props) {
  const fullName = useMemo(
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
      surname,
      otherName,
    ],
  );

  const servicesLabel = useMemo(
    () =>
      selectedServices
        .filter(Boolean)
        .join(", "),
    [selectedServices],
  );

  const locationLabel = useMemo(
    () =>
      [state, lga]
        .filter(Boolean)
        .join(", "),
    [state, lga],
  );

  const hourlyRateLabel =
    useMemo(() => {
      const normalized =
        hourlyRate
          .replace(
            /,/g,
            "",
          )
          .trim();

      if (!normalized) {
        return "Not provided";
      }

      return `₦${Number(
        normalized,
      ).toLocaleString(
        "en-NG",
      )} / hour`;
    }, [hourlyRate]);

  const hasGpsLocation =
    Number.isFinite(
      latitude,
    ) &&
    Number.isFinite(
      longitude,
    );

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          PERSONAL INFORMATION
      ====================================================== */}

      <ReviewSection
        icon="profile"
        title="Personal information"
      >
        <ReviewRow
          label="Full name"
          value={
            fullName ||
            "Not provided"
          }
        />

        <ReviewRow
          label="Email"
          value={
            email ||
            "Not provided"
          }
        />
      </ReviewSection>

      {/* ======================================================
          WORKER PROFILE
      ====================================================== */}

      <ReviewSection
        icon="professional"
        title="Worker profile"
      >
        <ReviewRow
          label="Category"
          value={
            category ||
            "Not provided"
          }
        />

        <ReviewRow
          label="Subcategory"
          value={
            subcategory ||
            "Not provided"
          }
        />

        <ReviewRow
          label="Services"
          value={
            servicesLabel ||
            "Not provided"
          }
        />

        <ReviewRow
          label="Experience"
          value={
            experience ||
            "Not provided"
          }
        />

        <ReviewRow
          label="Location"
          value={
            locationLabel ||
            "Not provided"
          }
        />

        <ReviewRow
          label="About"
          value={
            about.trim() ||
            "Not provided"
          }
        />
      </ReviewSection>

      {/* ======================================================
          SERVICE INFORMATION
      ====================================================== */}

      <ReviewSection
        icon="location"
        title="Service information"
      >
        <ReviewRow
          label="Service address"
          value={
            serviceAddress.trim() ||
            "Not provided"
          }
        />

        <ReviewRow
          label="GPS location"
          value={
            hasGpsLocation
              ? "Location saved"
              : "Not set"
          }
        />

        <ReviewRow
          label="Hourly rate"
          value={
            hourlyRateLabel
          }
        />

        {phoneNumber.trim() && (
  <ReviewRow
    label="Phone number"
    value={phoneNumber.trim()}
  />
)}
      </ReviewSection>

      {/* ======================================================
          PROFILE MEDIA
      ====================================================== */}

      <ReviewSection
        icon="image"
        title="Profile media"
      >
        <ReviewRow
          label="Profile photo"
          value={
            photo
              ? "Added"
              : "Not added"
          }
        />

        <ReviewRow
          label="Work gallery"
          value={
            workGallery.length >
            0
              ? `${workGallery.length} ${
                  workGallery.length ===
                  1
                    ? "photo"
                    : "photos"
                } added`
              : "No photos added"
          }
        />
      </ReviewSection>

      {/* ======================================================
          TERMS
      ====================================================== */}

      <Pressable
        style={[
          styles.termsCard,
          acceptedTerms &&
            styles.termsCardAccepted,
        ]}
        onPress={
          onToggleTerms
        }
        accessibilityRole="checkbox"
        accessibilityState={{
          checked:
            acceptedTerms,
        }}
        accessibilityLabel="Accept Terms and Conditions"
      >
        <View
          style={[
            styles.checkbox,
            acceptedTerms &&
              styles.checkboxAccepted,
          ]}
        >
          {acceptedTerms ? (
            <AppIcon
              name="check"
              role="worker"
              state="active"
              size="sm"
            />
          ) : null}
        </View>

        <View
          style={
            styles.termsContent
          }
        >
          <AppText
            variant="body"
            weight="semibold"
          >
            I agree to the Terms &
            Conditions
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
          >
            By creating your worker
            account, you agree to
            Fixxam's terms and
            conditions.
          </AppText>
        </View>
      </Pressable>
    </View>
  );
}

/* ============================================================
   REVIEW SECTION
============================================================ */

type ReviewSectionProps = {
  icon: React.ComponentProps<
    typeof AppIcon
  >["name"];

  title: string;

  children: React.ReactNode;
};

function ReviewSection({
  icon,
  title,
  children,
}: ReviewSectionProps) {
  return (
    <View
      style={
        styles.section
      }
    >
      <View
        style={
          styles.sectionHeader
        }
      >
        <View
          style={
            styles.sectionIcon
          }
        >
          <AppIcon
            name={icon}
            role="worker"
            state="active"
            size="md"
          />
        </View>

        <AppText
          variant="body"
          weight="semibold"
        >
          {title}
        </AppText>
      </View>

      <View
        style={
          styles.sectionContent
        }
      >
        {children}
      </View>
    </View>
  );
}

/* ============================================================
   REVIEW ROW
============================================================ */

type ReviewRowProps = {
  label: string;
  value: string;
};

function ReviewRow({
  label,
  value,
}: ReviewRowProps) {
  return (
    <View
      style={
        styles.row
      }
    >
      <AppText
        variant="caption"
        tone="secondary"
      >
        {label}
      </AppText>

      <AppText
        variant="body"
        style={
          styles.value
        }
      >
        {value}
      </AppText>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",
      gap:
        FixxamTokens.spacing.md,
      paddingBottom:
        FixxamTokens.spacing.lg,
    },

    section: {
      width: "100%",
      padding:
        FixxamTokens.spacing.md,
      borderRadius:
        FixxamTokens.radius.lg,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E5E7EB",
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap:
        FixxamTokens.spacing.sm,
      marginBottom:
        FixxamTokens.spacing.md,
    },

    sectionIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#F0F8FF",
    },

    sectionContent: {
      gap:
        FixxamTokens.spacing.md,
    },

    row: {
      width: "100%",
      gap:
        FixxamTokens.spacing.xs,
    },

    value: {
      flexShrink: 1,
    },

    termsCard: {
      width: "100%",
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      gap:
        FixxamTokens.spacing.md,
      padding:
        FixxamTokens.spacing.md,
      borderRadius:
        FixxamTokens.radius.lg,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E5E7EB",
    },

    termsCardAccepted: {
      borderColor:
        "#43B982",
      backgroundColor:
        "#F0FBF6",
    },

    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor:
        "#D1D5DB",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginTop: 1,
    },

    checkboxAccepted: {
      borderColor:
        "#43B982",
      backgroundColor:
        "#E8F8F0",
    },

    termsContent: {
      flex: 1,
      gap:
        FixxamTokens.spacing.xs,
    },
  });

export default memo(
  WorkerReview,
);