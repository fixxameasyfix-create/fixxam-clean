import React, {
  memo,
  useCallback,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Platform,
  View,
  type ListRenderItemInfo,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  WorkerColors,
} from "@/theme";

import WorkerMarketMessageBubble from "./WorkerMarketMessageBubble";

import {
  styles,
} from "./workerMarketChatStyles";

/* ==============================================================
   TYPES
============================================================== */

export type WorkerMarketChatMessage = {
  id: string;

  senderId: string;

  senderRole:
    | "customer"
    | "worker";

  text: string;

  createdAt: number;
};

type Props = {
  loading: boolean;

  messages:
    WorkerMarketChatMessage[];

  currentUserId: string;

  listRef:
    React.RefObject<
      FlatList<WorkerMarketChatMessage> | null
    >;

  onScrollToBottom: (
    animated?: boolean,
  ) => void;
};

/* ==============================================================
   HELPERS
============================================================== */

function keyExtractor(
  item:
    WorkerMarketChatMessage,
): string {
  return item.id;
}

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerMarketMessageList({
  loading,
  messages,
  currentUserId,
  listRef,
  onScrollToBottom,
}: Props) {
  /* ============================================================
     RENDER MESSAGE
  ============================================================ */

  const renderMessage =
    useCallback(
      ({
        item,
      }: ListRenderItemInfo<WorkerMarketChatMessage>) => {
        const isMine =
          item.senderId ===
          currentUserId;

        return (
          <WorkerMarketMessageBubble
            message={
              item
            }
            isMine={
              isMine
            }
          />
        );
      },
      [
        currentUserId,
      ],
    );

  /* ============================================================
     CONTENT SIZE
  ============================================================ */

  const handleContentSizeChange =
    useCallback(() => {
      if (
        messages.length ===
        0
      ) {
        return;
      }

      onScrollToBottom(
        false,
      );
    }, [
      messages.length,
      onScrollToBottom,
    ]);

  /* ============================================================
     LOADING
  ============================================================ */

  if (
    loading
  ) {
    return (
      <View
        style={
          styles.chatContainer
        }
      >
        <View
          style={
            styles.center
          }
        >
          <ActivityIndicator
            size="small"
            color={
              WorkerColors.primary
            }
          />

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.loadingText
            }
          >
            Loading chat...
          </AppText>
        </View>
      </View>
    );
  }

  /* ============================================================
     LIST
  ============================================================ */

  return (
    <View
      style={
        styles.chatContainer
      }
    >
      <FlatList<WorkerMarketChatMessage>
        ref={
          listRef
        }
        data={
          messages
        }
        keyExtractor={
          keyExtractor
        }
        renderItem={
          renderMessage
        }
        contentContainerStyle={[
          styles.messagesContent,

          messages.length ===
            0
            ? styles.emptyMessages
            : null,
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={
          Platform.OS ===
          "ios"
            ? "interactive"
            : "on-drag"
        }
        showsVerticalScrollIndicator={
          false
        }
        initialNumToRender={
          20
        }
        maxToRenderPerBatch={
          20
        }
        windowSize={
          9
        }
        removeClippedSubviews={
          Platform.OS ===
          "android"
        }
        onContentSizeChange={
          handleContentSizeChange
        }
        ListEmptyComponent={
          <EmptyChat />
        }
      />
    </View>
  );
}

export default memo(
  WorkerMarketMessageList,
);

/* ==============================================================
   EMPTY STATE
============================================================== */

const EmptyChat =
  memo(
    function EmptyChat() {
      return (
        <View
          style={
            styles.emptyContainer
          }
        >
          <View
            style={
              styles.emptyIcon
            }
          >
            <AppIcon
              name="messages"
              role="worker"
              size="lg"
              color={
                WorkerColors.primary
              }
            />
          </View>

          <AppText
            variant="heading3"
            weight="bold"
            center
            style={
              styles.emptyTitle
            }
          >
            No messages yet
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.emptyText
            }
          >
            Send a message to the customer about this order.
          </AppText>
        </View>
      );
    },
  );

EmptyChat.displayName =
  "WorkerMarketEmptyChat";