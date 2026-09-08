import React, {
  memo,
  useMemo,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  MaterialCommunityIcons,
} from "@expo/vector-icons";

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

interface AssistantBubbleProps {
  message: AiMessage;

  showHeader?: boolean;

  onCopy?: (
    text: string,
  ) => void;
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

function AssistantBubble({
  message,
  showHeader = true,
  onCopy,
}: AssistantBubbleProps) {
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

  const handleCopy =
    () => {
      if (!onCopy) {
        return;
      }

      onCopy(
        message.content,
      );
    };

  return (
    <View
      style={[
        styles.container,

        !showHeader
          ? styles.groupedContainer
          : null,
      ]}
    >
      {/* ======================================================
          AVATAR
      ====================================================== */}

      {showHeader ? (
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
      ) : (
        <View
          style={
            styles.avatarSpacer
          }
        />
      )}

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <View
        style={
          styles.content
        }
      >
        {showHeader ? (
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
        ) : null}

        {/* ====================================================
            MESSAGE
        ==================================================== */}

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

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <View
          style={
            styles.footer
          }
        >
          {time ? (
            <AppText
              variant="caption"
              tone="muted"
            >
              {time}
            </AppText>
          ) : (
            <View />
          )}

          {onCopy ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Copy assistant message"
              hitSlop={8}
              onPress={
                handleCopy
              }
              style={({
                pressed,
              }) => [
                styles.copyButton,

                pressed
                  ? styles.copyPressed
                  : null,
              ]}
            >
              <MaterialCommunityIcons
                name="content-copy"
                size={
                  FixxamTokens.size
                    .iconXs
                }
                color={
                  Colors.textSecondary
                }
              />

              <AppText
                variant="caption"
                tone="secondary"
              >
                Copy
              </AppText>
            </Pressable>
          ) : null}
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
      flexDirection: "row",

      alignItems:
        "flex-start",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      marginTop:
        FixxamTokens.spacing.md,
    },

    groupedContainer: {
      marginTop:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       AVATAR
    ======================================================== */

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

    avatarSpacer: {
      width:
        FixxamTokens.size
          .avatarMd,

      flexShrink: 0,

      marginRight:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      flex: 1,

      minWidth: 0,
    },

    name: {
      marginBottom:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       BUBBLE
    ======================================================== */

    bubble: {
      alignSelf:
        "flex-start",

      maxWidth: "96%",

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

    text: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       FOOTER
    ======================================================== */

    footer: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      marginTop:
        FixxamTokens.spacing.xs,
    },

    copyButton: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,
    },

    copyPressed: {
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
  AssistantBubble,
);