import React from "react";

import {
  Image,
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

import {
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import {
  AiMessage,
} from "../types";

interface UserBubbleProps {
  message: AiMessage;
}

export default function UserBubble({
  message,
}: UserBubbleProps) {
  const hasText =
    message.content.trim().length > 0;

  const hasImage =
    !!message.image;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {hasImage && (
          <View
            style={styles.imageContainer}
          >
            <Image
              source={{
                uri: message.image,
              }}
              resizeMode="cover"
              style={styles.image}
            />
          </View>
        )}

        {hasText && (
          <View style={styles.bubble}>
            <AppText style={styles.text}>
              {message.content}
            </AppText>
          </View>
        )}

        <AppText style={styles.time}>
          {new Date(
            message.createdAt,
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </AppText>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      alignItems: "flex-end",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      marginTop: 14,
    },

    content: {
      alignItems: "flex-end",

      maxWidth: "86%",
    },

    imageContainer: {
      overflow: "hidden",

      borderRadius: 20,

      marginBottom: 8,

      backgroundColor:
        "#F5F7FA",

      borderWidth: 1,

      borderColor:
        CustomerColors.border,
    },

    image: {
      width: 240,

      height: 240,

      borderRadius: 20,
    },

    bubble: {
      backgroundColor:
        CustomerColors.primary,

      borderRadius: 20,

      borderBottomRightRadius: 8,

      paddingHorizontal: 16,

      paddingVertical: 14,

      maxWidth: "100%",
    },

    text: {
      fontSize: 16,

      lineHeight: 26,

      color: "#FFFFFF",
    },

    time: {
      marginTop: 6,

      marginRight: 4,

      fontSize: 12,

      color:
        CustomerColors.textSecondary,
    },
  });