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
  StatusBar,
} from "expo-status-bar";

import {
  router,
} from "expo-router";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

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

interface Props {
  onMenuPress?: () => void;
}

/* ============================================================
   COMPONENT
============================================================ */

function AiHeader({
  onMenuPress,
}: Props) {
  const insets =
    useSafeAreaInsets();

  /* ==========================================================
     BACK
  ========================================================== */

  const handleBack =
    useCallback(() => {
      if (
        router.canGoBack()
      ) {
        router.back();

        return;
      }

      router.replace(
        "/(customer)/(tabs)/home",
      );
    }, []);

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingTop:
            insets.top,
        },
      ]}
    >
      <StatusBar
        style="dark"
      />

      <View
        style={
          styles.container
        }
      >
        {/* ====================================================
            BACK
        ==================================================== */}

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
            styles.sideButton,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppIcon
            name="back"
            role="customer"
            size="md"
          />
        </Pressable>

        {/* ====================================================
            TITLE
        ==================================================== */}

        <View
          style={
            styles.center
          }
        >
          <AppText
            variant="heading3"
            weight="semibold"
            numberOfLines={1}
            center
          >
            Fixxam Smarter
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            center
            style={
              styles.subtitle
            }
          >
            Smart Repair Assistant
          </AppText>
        </View>

        {/* ====================================================
            MENU
        ==================================================== */}

        {onMenuPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open assistant menu"
            hitSlop={8}
            onPress={
              onMenuPress
            }
            style={({
              pressed,
            }) => [
              styles.sideButton,

              pressed
                ? styles.pressed
                : null,
            ]}
          >
            <AppIcon
              name="menu"
              role="customer"
              size="md"
            />
          </Pressable>
        ) : (
          <View
            style={
              styles.sideSpacer
            }
          />
        )}
      </View>
    </View>
  );
}

export default memo(
  AiHeader,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    wrapper: {
      width:
        "100%",

      backgroundColor:
        Colors.surface,

      borderBottomWidth:
        1,

      borderBottomColor:
        Colors.divider,

      /*
       * FixxamTokens.shadow.sm
       * does not exist in the current theme.
       *
       * card is an existing production token.
       */
      ...FixxamTokens
        .shadow
        .card,
    },

    container: {
      minHeight:
        FixxamTokens
          .size
          .headerHeight,

      /*
       * screenPadding does not exist
       * in the current spacing tokens.
       *
       * lg matches the horizontal spacing
       * used across the customer UI.
       */
      paddingHorizontal:
        FixxamTokens
          .spacing
          .lg,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    sideButton: {
      width:
        FixxamTokens
          .size
          .minimumTouchTarget,

      height:
        FixxamTokens
          .size
          .minimumTouchTarget,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens
          .radius
          .iconButton,
    },

    sideSpacer: {
      width:
        FixxamTokens
          .size
          .minimumTouchTarget,

      height:
        FixxamTokens
          .size
          .minimumTouchTarget,
    },

    center: {
      flex:
        1,

      minWidth:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens
          .spacing
          .sm,
    },

    subtitle: {
      marginTop:
        FixxamTokens
          .spacing
          .xxs,
    },

    pressed: {
      backgroundColor:
        CustomerColors
          .primarySoft,

      opacity:
        FixxamTokens
          .motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens
              .motion
              .scalePressed,
        },
      ],
    },
  });