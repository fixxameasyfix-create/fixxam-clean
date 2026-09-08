import React, {
  memo,
  useMemo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
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
  about?: string | null;

  experience?:
    | string
    | number
    | null;

  category?: string | null;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value.trim();
}

function normalizeExperience(
  value: Props["experience"],
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "Not specified";
  }

  const normalized =
    String(value).trim();

  return (
    normalized ||
    "Not specified"
  );
}

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerAbout({
  about,
  experience,
  category,
}: Props) {
  const normalizedAbout =
    cleanString(about);

  const normalizedExperience =
    useMemo(
      () =>
        normalizeExperience(
          experience,
        ),
      [
        experience,
      ],
    );

  const normalizedCategory =
    cleanString(category) ||
    "Not specified";

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={
          styles.header
        }
      >
        <View
          style={
            styles.headerIcon
          }
        >
          <AppIcon
            name="profile"
            role="customer"
            size="sm"
            state="active"
          />
        </View>

        <AppText
          variant="bodyLarge"
          weight="bold"
          style={
            styles.title
          }
        >
          About
        </AppText>
      </View>

      {/* ======================================================
          DESCRIPTION
      ====================================================== */}

      <AppText
        variant="body"
        tone="secondary"
        style={
          styles.description
        }
      >
        {normalizedAbout ||
          "This worker has not added a professional description yet."}
      </AppText>

      {/* ======================================================
          INFORMATION
      ====================================================== */}

      <View
        style={
          styles.infoCard
        }
      >
        {/* ====================================================
            EXPERIENCE
        ==================================================== */}

        <View
          style={
            styles.infoRow
          }
        >
          <View
            style={
              styles.infoIcon
            }
          >
            <AppIcon
              name="jobs"
              role="customer"
              size="sm"
              state="active"
            />
          </View>

          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.label
            }
          >
            Experience
          </AppText>

          <AppText
            variant="bodyMedium"
            weight="bold"
            numberOfLines={1}
            style={
              styles.value
            }
          >
            {normalizedExperience}
          </AppText>
        </View>

        <View
          style={
            styles.divider
          }
        />

        {/* ====================================================
            CATEGORY
        ==================================================== */}

        <View
          style={
            styles.infoRow
          }
        >
          <View
            style={
              styles.infoIcon
            }
          >
            <AppIcon
              name="service"
              role="customer"
              size="sm"
              state="active"
            />
          </View>

          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.label
            }
          >
            Category
          </AppText>

          <AppText
            variant="bodyMedium"
            weight="bold"
            numberOfLines={1}
            style={
              styles.value
            }
          >
            {normalizedCategory}
          </AppText>
        </View>
      </View>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      marginTop:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.lg,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        FixxamTokens.spacing.sm,
    },

    headerIcon: {
      width:
        FixxamTokens.size
          .avatarXs,

      height:
        FixxamTokens.size
          .avatarXs,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    title: {
      marginLeft:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       DESCRIPTION
    ======================================================== */

    description: {
      marginBottom:
        FixxamTokens.spacing.md,

      lineHeight: 21,
    },

    /* ========================================================
       INFO CARD
    ======================================================== */

    infoCard: {
      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.xs,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    infoRow: {
      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    infoIcon: {
      width:
        FixxamTokens.size
          .avatarXs,

      height:
        FixxamTokens.size
          .avatarXs,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    label: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    value: {
      maxWidth: "58%",

      marginLeft:
        FixxamTokens.spacing.sm,

      textAlign:
        "right",

      color:
        Colors.textPrimary,
    },

    divider: {
      height: 1,

      marginLeft:
        FixxamTokens.size
          .avatarXs +
        FixxamTokens.spacing.sm,

      backgroundColor:
        Colors.divider,
    },
  });

export default memo(
  WorkerAbout,
);