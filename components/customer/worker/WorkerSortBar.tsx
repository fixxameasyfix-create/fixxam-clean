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
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  label: string;

  onPress: () => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerSortBar({
  label,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={
        onPress
      }
      accessibilityRole="button"
      accessibilityLabel={`Sort workers by ${label}`}
      accessibilityHint="Opens worker sorting options"
      style={({
        pressed,
      }) => [
        styles.container,

        pressed
          ? styles.pressed
          : null,
      ]}
    >
      {/* ======================================================
          LEFT
      ====================================================== */}

      <View
        style={
          styles.left
        }
      >
        <View
          style={
            styles.iconContainer
          }
        >
          <AppIcon
            name="filter"
            role="customer"
            size="sm"
            state="active"
          />
        </View>

        <AppText
          variant="bodyMedium"
          weight="medium"
          numberOfLines={1}
          style={
            styles.label
          }
        >
          {label}
        </AppText>
      </View>

      {/* ======================================================
          DOWN
      ====================================================== */}

      <AppIcon
        name="down"
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
      minHeight:
        FixxamTokens.size
          .inputHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      paddingHorizontal:
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

    left: {
      flex: 1,

      minWidth: 0,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingRight:
        FixxamTokens.spacing.sm,
    },

    iconContainer: {
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
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    label: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    pressed: {
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
  });

export default memo(
  WorkerSortBar,
);