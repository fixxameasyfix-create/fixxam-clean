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

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   COMPONENT
============================================================== */

function ServicesHeader() {
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
      {/* ========================================================
          BACK
      ======================================================== */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        accessibilityHint="Returns to the previous screen"
        hitSlop={8}
        onPress={
          handleBack
        }
        style={({
          pressed,
        }) => [
          styles.backButton,

          pressed
            ? styles.pressed
            : null,
        ]}
      >
        <MaterialCommunityIcons
          name="arrow-left"
          size={
            FixxamTokens.size.iconMd
          }
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
          styles.content
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
          Services
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={1}
          style={
            styles.subtitle
          }
        >
          Find trusted professionals near you.
        </AppText>
      </View>
    </View>
  );
}

export default memo(
  ServicesHeader,
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

      marginBottom:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    backButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      marginRight:
        FixxamTokens.spacing.md,

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

      ...FixxamTokens.shadow.card,
    },

    content: {
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

    pressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },
  });