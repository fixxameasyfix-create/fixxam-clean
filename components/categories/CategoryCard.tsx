import React, {
  memo,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

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

type MaterialIconName =
  React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];

type Props = {
  icon: string;

  iconColor: string;

  backgroundColor: string;

  title: string;

  onPress: () => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function CategoryCard({
  icon,
  iconColor,
  backgroundColor,
  title,
  onPress,
}: Props) {
  const materialIcon =
    icon as MaterialIconName;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={`Open ${title} services`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,

        pressed
          ? styles.cardPressed
          : null,
      ]}
    >
      {/* ======================================================
          SERVICE ICON
      ====================================================== */}

      <View
        style={[
          styles.iconContainer,

          {
            backgroundColor,
          },
        ]}
      >
        {/* MaterialCommunityIcons intentionally preserved */}
        <MaterialCommunityIcons
          name={materialIcon}
          size={
            FixxamTokens.size
              .iconMd
          }
          color={iconColor}
        />
      </View>

      {/* ======================================================
          TITLE
      ====================================================== */}

      <View
        style={
          styles.content
        }
      >
        <AppText
          variant="bodyMedium"
          weight="bold"
          numberOfLines={1}
        >
          {title}
        </AppText>
      </View>

      {/* ======================================================
          NEXT
      ====================================================== */}

      <View
        style={
          styles.nextIcon
        }
      >
        <AppIcon
          name="next"
          role="customer"
          size="xs"
          state="muted"
        />
      </View>
    </Pressable>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    card: {
      width: "100%",

      minHeight:
        FixxamTokens.size
          .cardMinHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    cardPressed: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primarySoft,

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

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       NEXT
    ======================================================== */

    nextIcon: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius
          .iconButton,
    },
  });

export default memo(
  CategoryCard,
);