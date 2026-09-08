import React, {
  memo,
  useCallback,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

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

function formatTime(
  timestamp: number,
): string {
  if (
    !timestamp ||
    !Number.isFinite(
      timestamp,
    )
  ) {
    return "";
  }

  const date =
    new Date(
      timestamp,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return date.toLocaleTimeString(
    "en-NG",
    {
      hour: "numeric",

      minute: "2-digit",
    },
  );
}

function keyExtractor(
  item: WorkerMarketChatMessage,
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
        return (
          <MessageBubble
            message={
              item
            }
            isMine={
              item.senderId ===
              currentUserId
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

  if (loading) {
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
          <View
            style={
              styles.loadingIcon
            }
          >
            <ActivityIndicator
              size="small"
              color={
                WorkerColors.primary
              }
            />
          </View>

          <AppText
            variant="body"
            tone="secondary"
            center
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
        initialNumToRender={
          20
        }
        maxToRenderPerBatch={
          12
        }
        windowSize={
          9
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
        onContentSizeChange={
          handleContentSizeChange
        }
        ListEmptyComponent={
          EmptyChat
        }
      />
    </View>
  );
}

export default memo(
  WorkerMarketMessageList,
);

/* ==============================================================
   MESSAGE
============================================================== */

const MessageBubble =
  memo(
    function MessageBubble({
      message,
      isMine,
    }: {
      message:
        WorkerMarketChatMessage;

      isMine: boolean;
    }) {
      const messageTime =
        formatTime(
          message.createdAt,
        );

      return (
        <View
          style={[
            styles.messageRow,

            isMine
              ? styles.messageRowMine
              : null,
          ]}
        >
          <View
            accessible
            accessibilityLabel={`${
              isMine
                ? "You"
                : "Customer"
            }: ${message.text}${
              messageTime
                ? `. ${messageTime}`
                : ""
            }`}
            style={[
              styles.messageBubble,

              isMine
                ? styles.myBubble
                : styles.customerBubble,
            ]}
          >
            <AppText
              variant="body"
              style={[
                styles.messageText,

                isMine
                  ? styles.myMessageText
                  : styles.customerMessageText,
              ]}
            >
              {message.text}
            </AppText>

            {messageTime ? (
              <AppText
                variant="caption"
                style={[
                  styles.messageTime,

                  isMine
                    ? styles.myMessageTime
                    : styles.customerMessageTime,
                ]}
              >
                {messageTime}
              </AppText>
            ) : null}
          </View>
        </View>
      );
    },
  );

MessageBubble.displayName =
  "WorkerMarketMessageBubble";

/* ==============================================================
   EMPTY
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
            Start a conversation
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

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    chatContainer: {
      flex: 1,

      minHeight: 0,

      backgroundColor:
        Colors.background,
    },

    /* ==========================================================
       LIST
    ========================================================== */

    messagesContent: {
      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.xl,
    },

    emptyMessages: {
      flexGrow: 1,
    },

    /* ==========================================================
       MESSAGE
    ========================================================== */

    messageRow: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.sm,

      alignItems:
        "flex-start",
    },

    messageRowMine: {
      alignItems:
        "flex-end",
    },

    messageBubble: {
      maxWidth: "80%",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.lg,
    },

    customerBubble: {
      borderWidth: 1,

      borderColor:
        Colors.border,

      borderBottomLeftRadius:
        FixxamTokens.radius.xs,

      backgroundColor:
        Colors.surface,
    },

    myBubble: {
      borderBottomRightRadius:
        FixxamTokens.radius.xs,

      backgroundColor:
        WorkerColors.primary,
    },

    messageText: {
      lineHeight: 20,
    },

    customerMessageText: {
      color:
        Colors.textPrimary,
    },

    myMessageText: {
      color:
        Colors.textInverse,
    },

    messageTime: {
      marginTop:
        FixxamTokens.spacing.xs,

      alignSelf:
        "flex-end",
    },

    customerMessageTime: {
      color:
        Colors.textMuted,
    },

    myMessageTime: {
      color:
        Colors.textInverse,

      opacity: 0.72,
    },

    /* ==========================================================
       EMPTY
    ========================================================== */

    emptyContainer: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    emptyIcon: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    emptyTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    emptyText: {
      maxWidth: 290,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       LOADING
    ========================================================== */

    center: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loadingIcon: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textSecondary,
    },
  });