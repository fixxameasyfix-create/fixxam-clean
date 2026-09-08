import React, {
  memo,
  useMemo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  Image,
} from "expo-image";

import {
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import type {
  AiMessage,
} from "../types";

/* ==============================================================
   TYPES
============================================================== */

interface UserBubbleProps {
  message: AiMessage;
}

/* ==============================================================
   TIME
============================================================== */

function formatMessageTime(
  value: AiMessage["createdAt"],
): string {
  try {
    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return "";
    }

    return date.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  } catch {
    return "";
  }
}

/* ==============================================================
   COMPONENT
============================================================== */

function UserBubble({
  message,
}: UserBubbleProps) {
  const hasText =
    message.content.trim()
      .length > 0;

  const hasImage =
    Boolean(
      message.image,
    );

  const time =
    useMemo(
      () =>
        formatMessageTime(
          message.createdAt,
        ),
      [
        message.createdAt,
      ],
    );

  return (
    <View
      style={
        styles.container
      }
    >
      <View
        style={
          styles.content
        }
      >
        {/* ====================================================
            IMAGE
        ==================================================== */}

        {hasImage &&
        message.image ? (
          <View
            style={
              styles.imageContainer
            }
          >
            <Image
              source={{
                uri: message.image,
              }}
              style={
                styles.image
              }
              contentFit="cover"
              transition={
                FixxamTokens.motion
                  .fast
              }
              cachePolicy="memory-disk"
              accessibilityLabel="Image sent with message"
            />
          </View>
        ) : null}

        {/* ====================================================
            MESSAGE
        ==================================================== */}

        {hasText ? (
          <View
            style={
              styles.bubble
            }
          >
            <AppText
              variant="body"
              style={
                styles.text
              }
            >
              {message.content}
            </AppText>
          </View>
        ) : null}

        {/* ====================================================
            TIME
        ==================================================== */}

        {time ? (
          <AppText
            variant="caption"
            tone="muted"
            style={
              styles.time
            }
          >
            {time}
          </AppText>
        ) : null}
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
      alignItems:
        "flex-end",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      marginTop:
        FixxamTokens.spacing.md,
    },

    content: {
      maxWidth: "86%",

      alignItems:
        "flex-end",
    },

    /* ========================================================
       IMAGE
    ======================================================== */

    imageContainer: {
      overflow: "hidden",

      marginBottom:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.image,

      backgroundColor:
        Colors.iconBackground,
    },

    image: {
      width: 240,

      height: 240,

      borderRadius:
        FixxamTokens.radius.image,
    },

    /* ========================================================
       BUBBLE
    ======================================================== */

    bubble: {
      maxWidth: "100%",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingVertical:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.lg,

      borderBottomRightRadius:
        FixxamTokens.radius.sm,

      backgroundColor:
        CustomerColors.primary,
    },

    text: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       TIME
    ======================================================== */

    time: {
      marginTop:
        FixxamTokens.spacing.xs,

      marginRight:
        FixxamTokens.spacing.xs,
    },
  });

export default memo(
  UserBubble,
);