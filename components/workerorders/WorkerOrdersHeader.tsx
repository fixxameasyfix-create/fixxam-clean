import React, {
  memo,
} from "react";

import {
  Pressable,
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

type WorkerOrdersHeaderProps = {
  onBack: () => void;

  onManage: () => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerOrdersHeader({
  onBack,
  onManage,
}: WorkerOrdersHeaderProps) {
  return (
    <View
      style={
        styles.container
      }
    >
      {/* ========================================================
          BACK
      ======================================================== */}

      <Pressable
        onPress={
          onBack
        }
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={6}
        style={({
          pressed,
        }) => [
          styles.iconButton,

          pressed
            ? styles.pressed
            : null,
        ]}
      >
        <AppIcon
          name="back"
          size="sm"
          color={
            Colors.textPrimary
          }
        />
      </Pressable>

      {/* ========================================================
          TITLE
      ======================================================== */}

      <View
        style={
          styles.titleContainer
        }
      >
        <AppText
          variant="heading2"
          weight="bold"
          numberOfLines={1}
          style={
            styles.title
          }
        >
          My Jobs
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={1}
          style={
            styles.subtitle
          }
        >
          Track and manage your jobs and orders
        </AppText>
      </View>

      {/* ========================================================
          MANAGE
      ======================================================== */}

      <Pressable
        onPress={
          onManage
        }
        accessibilityRole="button"
        accessibilityLabel="Manage jobs"
        hitSlop={6}
        style={({
          pressed,
        }) => [
          styles.manageButton,

          pressed
            ? styles.pressed
            : null,
        ]}
      >
        <AppIcon
          name="settings"
          role="worker"
          size="sm"
          color={
            WorkerColors.primary
          }
        />
      </Pressable>
    </View>
  );
}

/* ==============================================================
   MEMO
============================================================== */

WorkerOrdersHeader.displayName =
  "WorkerOrdersHeader";

export default memo(
  WorkerOrdersHeader,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      minHeight:
        FixxamTokens.size.headerHeight,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    /* ==========================================================
       BUTTONS
    ========================================================== */

    iconButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    manageButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        WorkerColors.primarySoft,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    /* ==========================================================
       TITLE
    ========================================================== */

    titleContainer: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.md,
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

    /* ==========================================================
       STATE
    ========================================================== */

    pressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },
  });