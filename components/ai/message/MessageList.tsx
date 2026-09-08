import React, {
  memo,
  useCallback,
  useEffect,
  useRef,
} from "react";

import {
  StyleSheet,
} from "react-native";

import {
  FlashList,
  type FlashListRef,
  type ListRenderItemInfo,
} from "@shopify/flash-list";

import type {
  AiMessage,
} from "../types";

import AssistantBubble from "./AssistantBubble";
import UserBubble from "./UserBubble";
import AiTypingIndicator from "./AiTypingIndicator";

import {
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

interface MessageListProps {
  messages: AiMessage[];

  isTyping?: boolean;

  onCopy?: (
    text: string,
  ) => void;
}

/* ==============================================================
   COMPONENT
============================================================== */

function MessageList({
  messages,
  isTyping = false,
  onCopy,
}: MessageListProps) {
  const listRef =
    useRef<
      FlashListRef<AiMessage>
    >(null);

  /* ============================================================
     AUTO SCROLL
  ============================================================ */

  useEffect(() => {
    if (
      messages.length === 0 &&
      !isTyping
    ) {
      return;
    }

    const frame =
      requestAnimationFrame(
        () => {
          listRef.current
            ?.scrollToEnd({
              animated: true,
            });
        },
      );

    return () => {
      cancelAnimationFrame(
        frame,
      );
    };
  }, [
    messages.length,
    isTyping,
  ]);

  /* ============================================================
     RENDER MESSAGE
  ============================================================ */

  const renderItem =
    useCallback(
      ({
        item,
        index,
      }: ListRenderItemInfo<AiMessage>) => {
        if (
          item.role ===
          "assistant"
        ) {
          const previous =
            messages[
              index - 1
            ];

          const showHeader =
            !previous ||
            previous.role !==
              "assistant";

          return (
            <AssistantBubble
              message={item}
              showHeader={
                showHeader
              }
              onCopy={onCopy}
            />
          );
        }

        if (
          item.role ===
          "user"
        ) {
          return (
            <UserBubble
              message={item}
            />
          );
        }

        return null;
      },
      [
        messages,
        onCopy,
      ],
    );

  /* ============================================================
     KEY
  ============================================================ */

  const keyExtractor =
    useCallback(
      (
        item: AiMessage,
      ) => item.id,
      [],
    );

  /* ============================================================
     UI
  ============================================================ */

  return (
    <FlashList
      ref={listRef}
      data={messages}
      keyExtractor={
        keyExtractor
      }
      renderItem={
        renderItem
      }
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={
        false
      }
      contentContainerStyle={
        styles.content
      }
      ListFooterComponent={
        isTyping
          ? AiTypingIndicator
          : null
      }
    />
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    content: {
      flexGrow: 1,

      justifyContent:
        "flex-end",

      paddingTop:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.lg,
    },
  });

export default memo(
  MessageList,
);