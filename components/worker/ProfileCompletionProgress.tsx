import React, {
  memo,
  useMemo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  progress: number;
};

/* ============================================================
   COMPONENT
============================================================ */

function ProfileCompletionProgress({
  progress,
}: Props) {
  const safeProgress =
    useMemo(() => {
      if (
        !Number.isFinite(
          progress,
        )
      ) {
        return 0;
      }

      return Math.min(
        100,
        Math.max(
          0,
          Math.round(
            progress,
          ),
        ),
      );
    }, [progress]);

  return (
    <View
      style={
        styles.container
      }
    >
      <View
        style={
          styles.header
        }
      >
        <View
          style={
            styles.headerContent
          }
        >
          <AppText
            variant="bodyLarge"
            weight="bold"
            style={
              styles.title
            }
          >
            Profile Completion
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.subtitle
            }
          >
            Complete your profile to receive customer requests.
          </AppText>
        </View>

        <View
          style={
            styles.badge
          }
        >
          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.badgeText
            }
          >
            {safeProgress}%
          </AppText>
        </View>
      </View>

      <View
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now:
            safeProgress,
        }}
        style={
          styles.track
        }
      >
        <View
          style={[
            styles.fill,
            {
              width:
                `${safeProgress}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

export default memo(
  ProfileCompletionProgress,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      marginBottom:
        FixxamTokens.spacing.md,
    },

    header: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.sm,
    },

    headerContent: {
      flex: 1,

      minWidth: 0,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    badge: {
      flexShrink: 0,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    badgeText: {
      color:
        WorkerColors.primary,
    },

    track: {
      height: 6,

      overflow:
        "hidden",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.border,
    },

    fill: {
      height:
        "100%",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primary,
    },
  });