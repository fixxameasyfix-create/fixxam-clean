import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import Animated, {
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
  CustomerColors,
  FixxamTokens,
} from "@/theme";

function AnimatedDot({
  delay,
}: {
  delay: number;
}) {
  const scale =
    useSharedValue(0.8);

  React.useEffect(() => {
    scale.value =
      withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1.3, {
              duration: 300,
            }),
            withTiming(0.8, {
              duration: 300,
            }),
          ),
          -1,
          false,
        ),
      );
  }, [delay, scale]);

  const animatedStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          scale:
            scale.value,
        },
      ],
      opacity:
        scale.value,
    }));

  return (
    <Animated.View
      style={[
        styles.dot,
        animatedStyle,
      ]}
    />
  );
}

export default function AiTypingIndicator() {
  return (
    <Animated.View
      entering={FadeIn.duration(
        250,
      )}
      exiting={FadeOut.duration(
        200,
      )}
      style={styles.container}
    >
      <View style={styles.avatar}>
        <MaterialCommunityIcons
          name="headset"
          size={22}
          color="#EA580C"
        />
      </View>

      <View style={styles.content}>
        <AppText
          weight="bold"
          style={styles.name}
        >
          Fixxam Smarter
        </AppText>

        <View style={styles.bubble}>
          <View
            style={styles.dots}
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

const styles =
  StyleSheet.create({
    container: {
      flexDirection: "row",

      alignItems:
        "flex-start",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      marginTop: 14,
    },

    avatar: {
      width: 52,

      height: 52,

      borderRadius: 18,

      justifyContent:
        "center",

      alignItems:
        "center",

      marginRight: 12,

      backgroundColor:
        "#FFF7ED",

      borderWidth: 1,

      borderColor:
        "#FED7AA",
    },

    content: {
      flex: 1,
    },

    name: {
      marginBottom: 6,

      fontSize: 13,

      color:
        CustomerColors.textSecondary,
    },

    bubble: {
      backgroundColor:
        "#F8FAFC",

      borderRadius: 20,

      borderTopLeftRadius: 8,

      borderWidth: 1,

      borderColor:
        CustomerColors.border,

      paddingHorizontal: 18,

      paddingVertical: 16,
    },

    dots: {
      flexDirection: "row",

      alignItems: "center",
    },

    dot: {
      width: 8,

      height: 8,

      borderRadius: 4,

      marginHorizontal: 4,

      backgroundColor:
        CustomerColors.primary,
    },
  });