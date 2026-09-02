import React, {
  useEffect,
  useRef,
} from "react";

import {
  StyleSheet,
} from "react-native";

import {
  FlashList,
  FlashListRef,
} from "@shopify/flash-list";

import { AiMessage } from "../types";

import AssistantBubble from "./AssistantBubble";
import UserBubble from "./UserBubble";
import AiTypingIndicator from "./AiTypingIndicator";

interface MessageListProps {
  messages: AiMessage[];

  isTyping?: boolean;

  onCopy?: (
    text: string,
  ) => void;
}

export default function MessageList({
  messages,
  isTyping = false,
  onCopy,
}: MessageListProps) {
  const listRef =
    useRef<
      FlashListRef<AiMessage>
    >(null);

  useEffect(() => {
    if (
      !listRef.current ||
      messages.length === 0
    ) {
      return;
    }

    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({
        animated: true,
      });
    });
  }, [
    messages,
    isTyping,
  ]);

  return (
    <FlashList
      ref={listRef}
      data={messages}
      keyExtractor={(item) =>
        item.id
      }
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={
        false
      }

      contentContainerStyle={
        styles.content
      }
      renderItem={({
        item,
        index,
      }) => {
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
      }}
      ListFooterComponent={
        isTyping ? (
          <AiTypingIndicator />
        ) : (
          <></>
        )
      }
    />
  );
}

const styles =
  StyleSheet.create({
    content: {
      flexGrow: 1,

      paddingTop: 18,

      paddingBottom: 120,

      justifyContent:
        "flex-end",
    },
  });