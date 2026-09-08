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
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  urgent: boolean;

  date?: string | null;

  time?: string | null;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanText(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/* ==============================================================
   COMPONENT
============================================================== */

const WorkerOrderTiming = memo(
  function WorkerOrderTiming({
    urgent,
    date,
    time,
  }: Props) {
    const safeDate =
      useMemo(
        () => cleanText(date),
        [date],
      );

    const safeTime =
      useMemo(
        () => cleanText(time),
        [time],
      );

    const title =
      urgent
        ? "AS SOON AS POSSIBLE"
        : safeDate ||
          "Scheduled service";

    const subtitle =
      urgent
        ? "Customer needs the service as soon as possible."
        : safeTime ||
          "Scheduled time unavailable";

    return (
      <View
        style={styles.card}
        accessible
        accessibilityLabel={`${title}. ${subtitle}`}
      >
        {/* ====================================================
            TIMING ICON
        ==================================================== */}

        <View
          style={[
            styles.icon,

            urgent
              ? styles.urgentIcon
              : null,
          ]}
        >
          <AppIcon
            name={
              urgent
                ? "clock"
                : "calendar"
            }
            role="worker"
            size="sm"
            color={
              urgent
                ? Colors.warning
                : WorkerColors.primary
            }
          />
        </View>

        {/* ====================================================
            INFO
        ==================================================== */}

        <View
          style={styles.info}
        >
          <AppText
            variant="body"
            weight="bold"
            numberOfLines={2}
            style={[
              styles.title,

              urgent
                ? styles.urgentTitle
                : null,
            ]}
          >
            {title}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={styles.subtitle}
          >
            {subtitle}
          </AppText>
        </View>
      </View>
    );
  },
);

WorkerOrderTiming.displayName =
  "WorkerOrderTiming";

export default WorkerOrderTiming;

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       CARD
    ======================================================== */

    card: {
      minHeight:
        FixxamTokens.size
          .cardMinHeight,

      padding:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",

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
       ICON
    ======================================================== */

    icon: {
      width: 44,

      height: 44,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    urgentIcon: {
      backgroundColor:
        Colors.warningSoft,
    },

    /* ========================================================
       INFO
    ======================================================== */

    info: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    urgentTitle: {
      color:
        Colors.warning,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 16,
    },
  });