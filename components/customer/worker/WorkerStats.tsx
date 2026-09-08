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
  experience: string;

  state: string;

  lga: string;

  hourlyRate: number;

  completedJobs?: number;
};

type StatItemProps = {
  icon:
    | "service"
    | "payment"
    | "success"
    | "location";

  iconColor: string;

  iconBackgroundColor: string;

  title: string;

  value: string;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value.trim();
}

function normalizeNumber(
  value: number,
): number {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    value,
  );
}

function normalizeCount(
  value: number,
): number {
  return Math.floor(
    normalizeNumber(
      value,
    ),
  );
}

function formatAmount(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-NG",
    {
      maximumFractionDigits: 0,
    },
  ).format(value);
}

/* ==============================================================
   STAT ITEM
============================================================== */

const StatItem =
  memo(function StatItem({
    icon,
    iconColor,
    iconBackgroundColor,
    title,
    value,
  }: StatItemProps) {
    return (
      <View
        style={
          styles.item
        }
      >
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor:
                iconBackgroundColor,
            },
          ]}
        >
          <AppIcon
            name={
              icon
            }
            role="customer"
            size="xs"
            color={
              iconColor
            }
          />
        </View>

        <AppText
          variant="caption"
          weight="semibold"
          tone="secondary"
          numberOfLines={1}
          style={
            styles.title
          }
        >
          {title}
        </AppText>

        <AppText
          variant="caption"
          weight="bold"
          numberOfLines={1}
          style={
            styles.value
          }
        >
          {value}
        </AppText>
      </View>
    );
  });

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerStats({
  experience,
  state,
  lga,
  hourlyRate,
  completedJobs = 0,
}: Props) {
  /* ============================================================
     NORMALIZED VALUES
  ============================================================ */

  const experienceLabel =
    cleanString(
      experience,
    ) ||
    "0";

  const safeHourlyRate =
    normalizeNumber(
      hourlyRate,
    );

  const safeCompletedJobs =
    normalizeCount(
      completedJobs,
    );

  const location =
    useMemo(() => {
      const cleanLga =
        cleanString(
          lga,
        );

      const cleanState =
        cleanString(
          state,
        );

      return (
        [
          cleanLga,
          cleanState,
        ]
          .filter(
            Boolean,
          )
          .join(
            ", ",
          ) ||
        "-"
      );
    }, [
      lga,
      state,
    ]);

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View
      style={
        styles.container
      }
    >
      <View
        style={
          styles.card
        }
      >
        {/* ====================================================
            EXPERIENCE
        ==================================================== */}

        <StatItem
          icon="service"
          iconColor={
            CustomerColors.primary
          }
          iconBackgroundColor={
            CustomerColors.primarySoft
          }
          title="Experience"
          value={
            experienceLabel
          }
        />

        <View
          style={
            styles.divider
          }
        />

        {/* ====================================================
            RATE
        ==================================================== */}

        <StatItem
          icon="payment"
          iconColor={
            CustomerColors.primary
          }
          iconBackgroundColor={
            CustomerColors.primarySoft
          }
          title="Rate"
          value={`₦${formatAmount(
            safeHourlyRate,
          )}/hr`}
        />

        <View
          style={
            styles.divider
          }
        />

        {/* ====================================================
            JOBS
        ==================================================== */}

        <StatItem
          icon="success"
          iconColor={
            Colors.success
          }
          iconBackgroundColor={
            Colors.successSoft
          }
          title="Jobs"
          value={String(
            safeCompletedJobs,
          )}
        />

        <View
          style={
            styles.divider
          }
        />

        {/* ====================================================
            LOCATION
        ==================================================== */}

        <StatItem
          icon="location"
          iconColor={
            Colors.info
          }
          iconBackgroundColor={
            Colors.infoSoft
          }
          title="Location"
          value={
            location
          }
        />
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
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      marginTop:
        -FixxamTokens.spacing.xl,

      marginBottom:
        FixxamTokens.spacing.md,

      zIndex: 10,
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      minHeight:
        FixxamTokens.size
          .cardMinHeight,

      flexDirection:
        "row",

      alignItems:
        "stretch",

      overflow:
        "hidden",

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
       ITEM
    ======================================================== */

    item: {
      flex: 1,

      minWidth: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xxs,

      paddingVertical:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       ICON
    ======================================================== */

    iconContainer: {
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

      marginBottom:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.md,
    },

    /* ========================================================
       TEXT
    ======================================================== */

    title: {
      maxWidth:
        "100%",

      textAlign:
        "center",
    },

    value: {
      maxWidth:
        "100%",

      marginTop:
        FixxamTokens.spacing.xxs,

      textAlign:
        "center",

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       DIVIDER
    ======================================================== */

    divider: {
      width: 1,

      marginVertical:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.divider,
    },
  });

export default memo(
  WorkerStats,
);