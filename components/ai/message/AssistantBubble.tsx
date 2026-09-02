import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

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

interface AssistantBubbleProps {
  message: AiMessage;
  showHeader?: boolean;
  onCopy?: (
    text: string,
  ) => void;
}

export default function AssistantBubble({
  message,
  showHeader = true,
  onCopy,
}: AssistantBubbleProps) {
  return (
    <View
      style={[
        styles.container,
        !showHeader &&
          styles.groupedContainer,
      ]}
    >
      {showHeader ? (
        <View style={styles.avatar}>
          <MaterialCommunityIcons
            name="headset"
            size={22}
            color="#EA580C"
          />
        </View>
      ) : (
        <View
          style={styles.avatarSpacer}
        />
      )}

      <View style={styles.content}>
        {showHeader && (
          <AppText
            weight="bold"
            style={styles.name}
          >
            Fixxam Smarter
          </AppText>
        )}

        <View style={styles.bubble}>
          <AppText style={styles.text}>
            {message.content}
          </AppText>
        </View>

        <View style={styles.footer}>
          <AppText style={styles.time}>
            {new Date(
              message.createdAt,
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </AppText>

          <Pressable
            hitSlop={8}
            style={
              styles.copyButton
            }
            onPress={() =>
              onCopy?.(
                message.content,
              )
            }
          >
            <Ionicons
              name="copy-outline"
              size={15}
              color={
                CustomerColors.textSecondary
              }
            />

            <AppText
              size="xs"
              style={
                styles.copyText
              }
            >
              Copy
            </AppText>
          </Pressable>
        </View>
      </View>
    </View>
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

    groupedContainer: {
      marginTop: 6,
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

    avatarSpacer: {
      width: 52,
      marginRight: 12,
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

      paddingHorizontal: 16,

      paddingVertical: 14,

      borderWidth: 1,

      borderColor:
        CustomerColors.border,

      maxWidth: "96%",
    },

    text: {
      fontSize: 16,
      lineHeight: 26,
      color:
        CustomerColors.textPrimary,
    },

    footer: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      marginTop: 8,
    },

    time: {
      fontSize: 12,
      color:
        CustomerColors.textSecondary,
    },

    copyButton: {
      flexDirection: "row",
      alignItems: "center",
    },

    copyText: {
      marginLeft: 4,
      color:
        CustomerColors.textSecondary,
    },
  });