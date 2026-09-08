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
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  hasCustomerAccount: boolean;

  onPress: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

export default function WorkerQuickAction({
  hasCustomerAccount,
  onPress,
}: Props) {
  const title =
    hasCustomerAccount
      ? "Switch to Customer"
      : "Create Customer Account";

  const subtitle =
    hasCustomerAccount
      ? "Book services & shop products."
      : "Book services & purchase products.";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={
        hasCustomerAccount
          ? "Switches to your customer account"
          : "Starts customer account setup"
      }
      style={({ pressed }) => [
        styles.container,

        pressed
          ? styles.pressed
          : null,
      ]}
    >
      {/* ==================================================
          ICON
      ================================================== */}

      <View
        style={
          styles.iconContainer
        }
      >
        <AppIcon
          name={
            hasCustomerAccount
              ? "refresh"
              : "profile"
          }
          role="customer"
          size="sm"
          color={
            CustomerColors.primary
          }
        />
      </View>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <View
        style={styles.content}
      >
        <AppText
          variant="bodyMedium"
          weight="bold"
          numberOfLines={1}
          style={styles.title}
        >
          {title}
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={2}
          style={
            styles.subtitle
          }
        >
          {subtitle}
        </AppText>
      </View>

      {/* ==================================================
          ARROW
      ================================================== */}

      <AppIcon
        name="next"
        role="customer"
        size="xs"
        state="muted"
        color={
          Colors.textMuted
        }
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
      minHeight: 60,

      marginBottom:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        CustomerColors.primary,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    /* ========================================================
       ICON
    ======================================================== */

    iconContainer: {
      width:
        FixxamTokens.size
          .iconBox,

      height:
        FixxamTokens.size
          .iconBox,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 16,
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