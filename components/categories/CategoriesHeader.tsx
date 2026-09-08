import React, {
  memo,
  useCallback,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

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

type CategoriesHeaderProps = {
  title?: string;
};

/* ==============================================================
   COMPONENT
============================================================== */

function CategoriesHeader({
  title = "All Categories",
}: CategoriesHeaderProps) {
  const handleBack =
    useCallback(() => {
      router.back();
    }, []);

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          BACK
      ====================================================== */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
        onPress={
          handleBack
        }
        style={({
          pressed,
        }) => [
          styles.backButton,

          pressed
            ? styles.backButtonPressed
            : null,
        ]}
      >
        <AppIcon
          name="back"
          role="customer"
          size="sm"
          state="default"
        />
      </Pressable>

      {/* ======================================================
          TITLE
      ====================================================== */}

      <AppText
        variant="heading3"
        weight="bold"
        center
        numberOfLines={1}
        style={
          styles.title
        }
      >
        {title}
      </AppText>

      {/* ======================================================
          BALANCE
      ====================================================== */}

      <View
        pointerEvents="none"
        style={
          styles.placeholder
        }
      />
    </View>
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
          .headerHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        FixxamTokens.spacing.lg,
    },

    backButton: {
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

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius
          .iconButton,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    backButtonPressed: {
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

    title: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.sm,
    },

    placeholder: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,
    },
  });

export default memo(
  CategoriesHeader,
);