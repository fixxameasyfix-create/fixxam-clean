import React, {
  memo,
  useEffect,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import Animated, {
  cancelAnimation,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import {
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   ANIMATED DOT
============================================================== */

function AnimatedDot({
  delay,
}: {
  delay: number;
}) {
  const progress =
    useSharedValue(0);

  useEffect(() => {
    progress.value =
      withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, {
              duration: 300,
            }),

            withTiming(0, {
              duration: 300,
            }),
          ),
          -1,
          false,
        ),
      );

    return () => {
      cancelAnimation(
        progress,
      );
    };
  }, [
    delay,
    progress,
  ]);

  const animatedStyle =
    useAnimatedStyle(
      () => ({
        opacity:
          0.45 +
          progress.value *
            0.55,

        transform: [
          {
            scale:
              0.8 +
              progress.value *
                0.35,
          },
        ],
      }),
    );

  return (
    <Animated.View
      style={[
        styles.dot,
        animatedStyle,
      ]}
    />
  );
}

/* ==============================================================
   COMPONENT
============================================================== */

function AiTypingIndicator() {
  return (
    <Animated.View
      accessibilityRole="text"
      accessibilityLabel="Fixxam Smarter is typing"
      entering={FadeIn.duration(
        FixxamTokens.motion
          .normal,
      )}
      exiting={FadeOut.duration(
        FixxamTokens.motion
          .fast,
      )}
      style={
        styles.container
      }
    >
      {/* ======================================================
          ASSISTANT AVATAR
      ====================================================== */}

      <View
        style={
          styles.avatar
        }
      >
        <MaterialCommunityIcons
          name="headset"
          size={
            FixxamTokens.size
              .iconSm
          }
          color={
            CustomerColors.primary
          }
        />
      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <View
        style={
          styles.content
        }
      >
        <AppText
          variant="caption"
          weight="semibold"
          tone="secondary"
          style={
            styles.name
          }
        >
          Fixxam Smarter
        </AppText>

        <View
          style={
            styles.bubble
          }
        >
          <View
            style={
              styles.dots
            }
          >
            <AnimatedDot
              delay={0}
            />

            <AnimatedDot
              delay={180}
            />

            <AnimatedDot
              delay={360}
            />
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      flexDirection: "row",

      alignItems:
        "flex-start",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      marginTop:
        FixxamTokens.spacing.md,
    },

    avatar: {
      width:
        FixxamTokens.size
          .avatarMd,

      height:
        FixxamTokens.size
          .avatarMd,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        CustomerColors.primaryLight,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    content: {
      flex: 1,

      minWidth: 0,
    },

    name: {
      marginBottom:
        FixxamTokens.spacing.xs,
    },

    bubble: {
      alignSelf:
        "flex-start",

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
    },

    dots: {
      minHeight:
        FixxamTokens.size
          .iconSm,

      flexDirection: "row",

      alignItems: "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    dot: {
      width: 7,

      height: 7,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primary,
    },
  });

export default memo(
  AiTypingIndicator,
);