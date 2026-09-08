import React from "react";

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

/* ============================================================
   TYPES
============================================================ */

type Props = {
  hasWorkerAccount: boolean;

  onPress: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

export default function CustomerQuickAction({
  hasWorkerAccount,
  onPress,
}: Props) {
  const title =
    hasWorkerAccount
      ? "Switch to Worker"
      : "Become a Worker";

  const subtitle =
    hasWorkerAccount
      ? "Start receiving jobs and manage your business."
      : "Create your worker account and begin earning.";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={
        hasWorkerAccount
          ? "Switches to your worker account"
          : "Starts worker account registration"
      }
      style={({ pressed }) => [
        styles.container,

        pressed
          ? styles.pressed
          : null,
      ]}
    >
      {/* ======================================================
          ICON
      ====================================================== */}

      <View
        style={styles.iconContainer}
      >
        <AppIcon
          name={
            hasWorkerAccount
              ? "refresh"
              : "service"
          }
          role="worker"
          size="lg"
          color={
            WorkerColors.primary
          }
        />
      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <View
        style={styles.content}
      >
        <AppText
          variant="bodyLarge"
          weight="bold"
          numberOfLines={1}
          style={styles.title}
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

      {/* ======================================================
          ARROW
      ====================================================== */}

      <AppIcon
        name="next"
        size="sm"
        state="muted"
      />
    </Pressable>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CONTAINER
    ======================================================== */

    container: {
      marginHorizontal:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    /* ========================================================
       ICON
    ======================================================== */

    iconContainer: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
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
        FixxamTokens.spacing.xs,

      lineHeight: 18,
    },

    /* ========================================================
       PRESSED
    ======================================================== */

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