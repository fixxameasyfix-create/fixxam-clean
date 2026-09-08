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

/* ==============================================================
   TYPES
============================================================== */

interface Props {
  icon: AppIconName;

  title: string;

  danger?: boolean;

  onPress: () => void;
}

/* ==============================================================
   COMPONENT
============================================================== */

function MenuItem({
  icon,
  title,
  danger = false,
  onPress,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,

        pressed
          ? danger
            ? styles.dangerPressed
            : styles.pressed
          : null,
      ]}
    >
      <View
        style={[
          styles.iconBox,

          danger
            ? styles.iconDanger
            : null,
        ]}
      >
        <AppIcon
          name={icon}
          role="customer"
          size="sm"
          state={
            danger
              ? "error"
              : "active"
          }
        />
      </View>

      <AppText
        variant="body"
        weight="semibold"
        numberOfLines={1}
        style={[
          styles.title,

          danger
            ? styles.dangerText
            : null,
        ]}
      >
        {title}
      </AppText>

      <AppIcon
        name="next"
        role="customer"
        size="sm"
        state="muted"
      />
    </Pressable>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      minHeight:
        FixxamTokens.size
          .headerHeight,

      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    iconBox: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius
          .iconButton,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    iconDanger: {
      backgroundColor:
        Colors.errorSoft,
    },

    title: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    dangerText: {
      color:
        Colors.error,
    },

    pressed: {
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

    dangerPressed: {
      backgroundColor:
        Colors.errorSoft,

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

export default memo(
  MenuItem,
);