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

import type {
  AppIconName,
} from "@/components/ui/AppIcon";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

type Props = {
  title: string;

  description: string;

  /**
   * Supports official Fixxam icon names.
   * Legacy names can still pass through
   * while existing screens are migrated.
   */
  icon:
    | AppIconName
    | (string & {});

  iconColor: string;

  iconBackground: string;

  onPress: () => void;
};

function DashboardWideCard({
  title,
  description,
  icon,
  iconColor,
  iconBackground,
  onPress,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={
        description || undefined
      }
      onPress={onPress}
      style={({
        pressed,
      }) => [
        styles.card,

        pressed
          ? styles.pressed
          : null,
      ]}
    >
      {/* ======================================================
          ICON
      ====================================================== */}

      <View
        style={[
          styles.iconContainer,

          {
            backgroundColor:
              iconBackground,
          },
        ]}
      >
        <AppIcon
          name={
            icon as AppIconName
          }
          role="customer"
          size="lg"
          color={iconColor}
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
          numberOfLines={2}
          ellipsizeMode="tail"
          style={styles.title}
        >
          {title}
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          numberOfLines={2}
          ellipsizeMode="tail"
          style={
            styles.description
          }
        >
          {description}
        </AppText>
      </View>

      {/* ======================================================
          NEXT
      ====================================================== */}

      <View
        style={
          styles.arrowContainer
        }
      >
        <AppIcon
          name="next"
          role="customer"
          size="sm"
          color={
            CustomerColors.primary
          }
        />
      </View>
    </Pressable>
  );
}

const styles =
  StyleSheet.create({
    card: {
      width: "100%",

      minHeight: 112,

      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingVertical:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

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

    iconContainer: {
      width: 58,

      height: 58,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.lg,
    },

    content: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    description: {
      marginTop:
        FixxamTokens.spacing.xs,
    },

    arrowContainer: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",
    },
  });

export default memo(
  DashboardWideCard,
);