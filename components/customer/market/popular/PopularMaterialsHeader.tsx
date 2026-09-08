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

function PopularMaterialsHeader() {
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
      <View
        style={
          styles.headerRow
        }
      >
        {/* ====================================================
            BACK
        ==================================================== */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={6}
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
            size={22}
            color={
              Colors.textPrimary
            }
          />
        </Pressable>

        {/* ====================================================
            TITLE
        ==================================================== */}

        <View
          style={
            styles.headerText
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
            Materials
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            numberOfLines={2}
            style={
              styles.subtitle
            }
          >
            Find quality materials and tools for your service.
          </AppText>
        </View>
      </View>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.background,
    },

    headerRow: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    /* ========================================================
       BACK
    ======================================================== */

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
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       TEXT
    ======================================================== */

    headerText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 19,
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

export default memo(
  PopularMaterialsHeader,
);