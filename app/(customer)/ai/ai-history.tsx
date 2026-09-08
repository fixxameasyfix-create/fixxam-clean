import React, {
  memo,
  useCallback,
  useState,
} from "react";

import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  AppButton,
  AppCard,
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  AppLoader,
} from "@/components/common";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import useAiChat, {
  type AiChatHistoryItem,
} from "@/hooks/ai/useAiChat";

/* ==============================================================
   HELPERS
============================================================== */

function formatHistoryDate(
  value: AiChatHistoryItem["createdAt"],
): string {
  try {
    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return "Date unavailable";
    }

    return date.toLocaleDateString(
      "en-NG",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      },
    );
  } catch {
    return "Date unavailable";
  }
}

/* ==============================================================
   HISTORY ITEM
============================================================== */

type HistoryItemProps = {
  item: AiChatHistoryItem;

  deleting: boolean;

  onOpen: () => void;

  onDelete: () => void;
};

const HistoryItem =
  memo(function HistoryItem({
    item,
    deleting,
    onOpen,
    onDelete,
  }: HistoryItemProps) {
    const messageCount =
      item.messages.length;

    const date =
      formatHistoryDate(
        item.createdAt,
      );

    return (
      <AppCard
        role="customer"
        variant="outlined"
        onPress={onOpen}
        disabled={deleting}
        accessibilityLabel={`Open ${item.title}`}
        style={styles.historyCard}
      >
        {/* ====================================================
            ICON
        ==================================================== */}

        <View
          style={
            styles.historyIcon
          }
        >
          <AppIcon
            name="messages"
            role="customer"
            size="md"
            state="active"
          />
        </View>

        {/* ====================================================
            CONTENT
        ==================================================== */}

        <View
          style={
            styles.historyContent
          }
        >
          <AppText
            variant="bodyLarge"
            weight="semibold"
            numberOfLines={1}
          >
            {item.title}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            style={
              styles.historyMeta
            }
          >
            {messageCount}{" "}
            {messageCount === 1
              ? "message"
              : "messages"}{" "}
            • {date}
          </AppText>
        </View>

        {/* ====================================================
            DELETE
        ==================================================== */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Delete ${item.title}`}
          accessibilityState={{
            disabled: deleting,
            busy: deleting,
          }}
          disabled={deleting}
          hitSlop={8}
          onPress={(event) => {
            event.stopPropagation();

            onDelete();
          }}
          style={({
            pressed,
          }) => [
            styles.deleteButton,

            deleting
              ? styles.deleteDisabled
              : null,

            pressed &&
            !deleting
              ? styles.deletePressed
              : null,
          ]}
        >
          <AppIcon
            name="delete"
            role="customer"
            size="sm"
            state={
              deleting
                ? "muted"
                : "error"
            }
          />
        </Pressable>

        {/* ====================================================
            ARROW
        ==================================================== */}

        <AppIcon
          name="next"
          role="customer"
          size="sm"
          state="muted"
        />
      </AppCard>
    );
  });

/* ==============================================================
   EMPTY STATE
============================================================== */

function EmptyHistory({
  onStartChat,
}: {
  onStartChat: () => void;
}) {
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
          name="clock"
          role="customer"
          size="xl"
          state="active"
        />
      </View>

      <AppText
        variant="heading2"
        weight="semibold"
        center
      >
        No saved chats
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        center
        style={
          styles.emptyMessage
        }
      >
        Conversations you save
        before starting a new chat
        will appear here.
      </AppText>

      <AppButton
        title="Start a Chat"
        role="customer"
        leftIconName="messages"
        onPress={onStartChat}
        style={
          styles.startButton
        }
      />
    </View>
  );
}

/* ==============================================================
   SCREEN
============================================================== */

export default function AiHistoryScreen() {
  const {
    history,
    historyLoaded,
    deleteHistoryItem,
  } = useAiChat();

  const [
    deletingId,
    setDeletingId,
  ] =
    useState<string | null>(
      null,
    );

  /* ============================================================
     BACK
  ============================================================ */

  const handleBack =
    useCallback(() => {
      if (
        router.canGoBack()
      ) {
        router.back();

        return;
      }

      router.replace(
        "/(customer)/ai",
      );
    }, []);

  /* ============================================================
     START CHAT
  ============================================================ */

  const handleStartChat =
    useCallback(() => {
      router.replace(
        "/(customer)/ai",
      );
    }, []);

  /* ============================================================
     OPEN HISTORY
  ============================================================ */

  const handleOpenChat =
    useCallback(
      (
        item:
          AiChatHistoryItem,
      ) => {
        router.push({
          pathname:
            "/(customer)/ai",

          params: {
            historyId:
              item.id,
          },
        });
      },
      [],
    );

  /* ============================================================
     DELETE
  ============================================================ */

  const handleDelete =
    useCallback(
      (
        item:
          AiChatHistoryItem,
      ) => {
        if (deletingId) {
          return;
        }

        Alert.alert(
          "Delete chat?",
          `Delete "${item.title}" from your chat history?`,
          [
            {
              text: "Cancel",
              style: "cancel",
            },

            {
              text: "Delete",
              style:
                "destructive",

              onPress:
                async () => {
                  try {
                    setDeletingId(
                      item.id,
                    );

                    await deleteHistoryItem(
                      item.id,
                    );
                  } catch (
                    error
                  ) {
                    console.error(
                      "HISTORY_DELETE_ERROR:",
                      error,
                    );

                    Alert.alert(
                      "Delete failed",
                      "Unable to delete this chat. Please try again.",
                    );
                  } finally {
                    setDeletingId(
                      null,
                    );
                  }
                },
            },
          ],
        );
      },
      [
        deleteHistoryItem,
        deletingId,
      ],
    );

  /* ============================================================
     RENDER ITEM
  ============================================================ */

  const renderItem =
    useCallback(
      ({
        item,
      }: {
        item:
          AiChatHistoryItem;
      }) => (
        <HistoryItem
          item={item}
          deleting={
            deletingId ===
            item.id
          }
          onOpen={() =>
            handleOpenChat(
              item,
            )
          }
          onDelete={() =>
            handleDelete(
              item,
            )
          }
        />
      ),
      [
        deletingId,
        handleDelete,
        handleOpenChat,
      ],
    );

  /* ============================================================
     LOADING
  ============================================================ */

  if (!historyLoaded) {
    return (
      <AppScreen
        role="customer"
        padded={false}
      >
        <AppLoader
          role="customer"
          fullScreen
          message="Loading history..."
        />
      </AppScreen>
    );
  }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <AppScreen
      role="customer"
      padded={false}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={
          styles.header
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          onPress={
            handleBack
          }
          style={({
            pressed,
          }) => [
            styles.headerButton,

            pressed
              ? styles.headerButtonPressed
              : null,
          ]}
        >
          <AppIcon
            name="back"
            role="customer"
            size="md"
          />
        </Pressable>

        <View
          style={
            styles.headerText
          }
        >
          <AppText
            variant="heading3"
            weight="semibold"
            numberOfLines={1}
          >
            Chat History
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            style={
              styles.headerSubtitle
            }
          >
            Your saved conversations
          </AppText>
        </View>

        <View
          accessibilityRole="text"
          accessibilityLabel={`${history.length} of 5 saved chats`}
          style={
            styles.countBadge
          }
        >
          <AppText
            variant="caption"
            weight="semibold"
            role="customer"
            tone="primary"
          >
            {history.length}/5
          </AppText>
        </View>
      </View>

      {/* ======================================================
          HISTORY LIST
      ====================================================== */}

      <FlatList
        data={history}
        keyExtractor={(
          item,
        ) => item.id}
        renderItem={
          renderItem
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={[
          styles.listContent,

          history.length === 0
            ? styles.emptyListContent
            : null,
        ]}
        ItemSeparatorComponent={
          ListSeparator
        }
        ListEmptyComponent={
          <EmptyHistory
            onStartChat={
              handleStartChat
            }
          />
        }
      />
    </AppScreen>
  );
}

/* ==============================================================
   LIST SEPARATOR
============================================================== */

function ListSeparator() {
  return (
    <View
      style={
        styles.listSeparator
      }
    />
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      minHeight:
        FixxamTokens.size
          .headerHeight,

      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      borderBottomWidth: 1,

      borderBottomColor:
        Colors.divider,

      backgroundColor:
        Colors.surface,
    },

    headerButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius
          .iconButton,
    },

    headerButtonPressed: {
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

    headerText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    headerSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    countBadge: {
      minWidth:
        FixxamTokens.size
          .minimumTouchTarget,

      minHeight: 32,

      alignItems: "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    /* ========================================================
       LIST
    ======================================================== */

    listContent: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.xxl,
    },

    emptyListContent: {
      flexGrow: 1,
    },

    listSeparator: {
      height:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       HISTORY CARD
    ======================================================== */

    historyCard: {
      width: "100%",

      minHeight:
        FixxamTokens.size
          .cardMinHeight,

      flexDirection: "row",

      alignItems: "center",

      padding:
        FixxamTokens.spacing.md,
    },

    historyIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius
          .iconButton,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    historyContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    historyMeta: {
      marginTop:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       DELETE
    ======================================================== */

    deleteButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius
          .iconButton,
    },

    deletePressed: {
      backgroundColor:
        Colors.errorSoft,

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

    deleteDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    /* ========================================================
       EMPTY STATE
    ======================================================== */

    emptyContainer: {
      flex: 1,

      alignItems: "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xxl,

      paddingBottom:
        FixxamTokens.spacing.lg *
        2,
    },

    emptyIcon: {
      width:
        FixxamTokens.size
          .roleCardHeight,

      height:
        FixxamTokens.size
          .roleCardHeight,

      alignItems: "center",

      justifyContent:
        "center",

      marginBottom:
        FixxamTokens.spacing.xl,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    emptyMessage: {
      maxWidth: 320,

      marginTop:
        FixxamTokens.spacing.sm,
    },

    startButton: {
      minWidth: 160,

      marginTop:
        FixxamTokens.spacing.xl,
    },
  });