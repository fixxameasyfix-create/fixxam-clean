import React, {
  memo,
  useCallback,
  useState,
} from "react";

import {
  Alert,
  FlatList,
  Modal,
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

  opening: boolean;

  onOpen: () => void;

  onDelete: () => void;
};

const HistoryItem =
  memo(function HistoryItem({
    item,
    deleting,
    opening,
    onOpen,
    onDelete,
  }: HistoryItemProps) {
    const messageCount =
      item.messages.length;

    const date =
      formatHistoryDate(
        item.createdAt,
      );

    const disabled =
      deleting ||
      opening;

    return (
      <AppCard
        role="customer"
        variant="outlined"
        onPress={
          onOpen
        }
        disabled={
          disabled
        }
        accessibilityLabel={`Open ${item.title}`}
        style={[
          styles.historyCard,

          opening
            ? styles.historyCardOpening
            : null,
        ]}
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
            state={
              opening
                ? "muted"
                : "active"
            }
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
            {opening
              ? "Opening conversation..."
              : `${messageCount} ${
                  messageCount === 1
                    ? "message"
                    : "messages"
                } • ${date}`}
          </AppText>
        </View>

        {/* ====================================================
            DELETE
        ==================================================== */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Delete ${item.title}`}
          accessibilityState={{
            disabled,
            busy: deleting,
          }}
          disabled={
            disabled
          }
          hitSlop={8}
          onPress={(
            event,
          ) => {
            event.stopPropagation();

            onDelete();
          }}
          style={({
            pressed,
          }) => [
            styles.deleteButton,

            disabled
              ? styles.deleteDisabled
              : null,

            pressed &&
            !disabled
              ? styles.deletePressed
              : null,
          ]}
        >
          <AppIcon
            name="delete"
            role="customer"
            size="sm"
            state={
              disabled
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
        onPress={
          onStartChat
        }
        style={
          styles.startButton
        }
      />
    </View>
  );
}

/* ==============================================================
   DELETE HISTORY MODAL
============================================================== */

type DeleteHistoryModalProps = {
  visible: boolean;

  item:
    AiChatHistoryItem | null;

  deleting: boolean;

  onCancel: () => void;

  onDelete: () => void;
};

function DeleteHistoryModal({
  visible,
  item,
  deleting,
  onCancel,
  onDelete,
}: DeleteHistoryModalProps) {
  return (
    <Modal
      visible={
        visible
      }
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (
          !deleting
        ) {
          onCancel();
        }
      }}
    >
      <View
        style={
          styles.deleteModalOverlay
        }
      >
        {/* ====================================================
            BACKDROP
        ==================================================== */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close delete chat dialog"
          disabled={
            deleting
          }
          onPress={
            onCancel
          }
          style={
            StyleSheet.absoluteFill
          }
        />

        {/* ====================================================
            MODAL CARD
        ==================================================== */}

        <AppCard
          role="customer"
          variant="elevated"
          style={
            styles.deleteModalCard
          }
        >
          {/* ==================================================
              ICON
          ================================================== */}

          <View
            style={
              styles.deleteModalIcon
            }
          >
            <AppIcon
              name="delete"
              role="customer"
              size="lg"
              state="error"
            />
          </View>

          {/* ==================================================
              TITLE
          ================================================== */}

          <AppText
            variant="heading2"
            weight="semibold"
            style={
              styles.deleteModalTitle
            }
          >
            Delete chat?
          </AppText>

          {/* ==================================================
              MESSAGE
          ================================================== */}

          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.deleteModalMessage
            }
          >
            Delete{" "}
            <AppText
              variant="body"
              weight="semibold"
            >
              “
              {item?.title ??
                "this conversation"}
              ”
            </AppText>
            {" "}
            from your chat history?
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.deleteModalWarning
            }
          >
            This action cannot be undone.
          </AppText>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <View
            style={
              styles.deleteModalActions
            }
          >
            <View
              style={
                styles.deleteModalAction
              }
            >
              <AppButton
                title="Cancel"
                role="customer"
                variant="outline"
                disabled={
                  deleting
                }
                onPress={
                  onCancel
                }
              />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Confirm delete chat"
              accessibilityState={{
                disabled:
                  deleting,

                busy:
                  deleting,
              }}
              disabled={
                deleting
              }
              onPress={
                onDelete
              }
              style={({
                pressed,
              }) => [
                styles.deleteConfirmButton,

                deleting
                  ? styles.deleteConfirmDisabled
                  : null,

                pressed &&
                !deleting
                  ? styles.deleteConfirmPressed
                  : null,
              ]}
            >
              <AppIcon
                name="delete"
                role="customer"
                size="sm"
                state="error"
              />

              <AppText
                variant="bodyMedium"
                weight="semibold"
                style={
                  styles.deleteConfirmText
                }
              >
                {deleting
                  ? "Deleting..."
                  : "Delete"}
              </AppText>
            </Pressable>
          </View>
        </AppCard>
      </View>
    </Modal>
  );
}

/* ==============================================================
   SCREEN
============================================================== */

export default function AiHistoryScreen() {
  /* ============================================================
     CHAT
  ============================================================ */

  const {
    history,
    historyLoaded,

    activateConversation,

    deleteHistoryItem,
  } =
    useAiChat();

  /* ============================================================
     DELETE STATE
  ============================================================ */

  const [
    deletingId,
    setDeletingId,
  ] =
    useState<
      string | null
    >(null);

  const [
    deleteTarget,
    setDeleteTarget,
  ] =
    useState<
      AiChatHistoryItem | null
    >(null);

  /* ============================================================
     OPEN STATE
  ============================================================ */

  const [
    openingId,
    setOpeningId,
  ] =
    useState<
      string | null
    >(null);

  /* ============================================================
     BUSY
  ============================================================ */

  const isBusy =
    Boolean(
      deletingId ||
      openingId,
    );

  /* ============================================================
     BACK
  ============================================================ */

  const handleBack =
    useCallback(() => {
      if (
        isBusy
      ) {
        return;
      }

      if (
        router.canGoBack()
      ) {
        router.back();

        return;
      }

      router.replace(
        "/(customer)/ai",
      );
    }, [
      isBusy,
    ]);

  /* ============================================================
     START CHAT
  ============================================================ */

  const handleStartChat =
    useCallback(() => {
      if (
        isBusy
      ) {
        return;
      }

      router.replace(
        "/(customer)/ai",
      );
    }, [
      isBusy,
    ]);

  /* ============================================================
     OPEN HISTORY CHAT
  ============================================================ */

  const handleOpenChat =
    useCallback(
      async (
        item:
          AiChatHistoryItem,
      ) => {
        if (
          deletingId ||
          openingId ||
          deleteTarget
        ) {
          return;
        }

        if (
          !item.messages.length
        ) {
          Alert.alert(
            "Unable to open chat",
            "This saved conversation does not contain any messages.",
          );

          return;
        }

        setOpeningId(
          item.id,
        );

        try {
          const opened =
            await activateConversation(
              item,
            );

          if (
            !opened
          ) {
            Alert.alert(
              "Unable to open chat",
              "This saved conversation could not be opened. Please try again.",
            );

            return;
          }

          router.replace(
            "/(customer)/ai",
          );
        } catch (
          error: unknown
        ) {
          if (
            __DEV__
          ) {
            console.warn(
              "OPEN_HISTORY_CHAT_ERROR:",
              error,
            );
          }

          Alert.alert(
            "Unable to open chat",
            "This saved conversation could not be opened. Please try again.",
          );
        } finally {
          setOpeningId(
            null,
          );
        }
      },
      [
        activateConversation,
        deleteTarget,
        deletingId,
        openingId,
      ],
    );

  /* ============================================================
     REQUEST DELETE
  ============================================================ */

  const handleDelete =
    useCallback(
      (
        item:
          AiChatHistoryItem,
      ) => {
        if (
          deletingId ||
          openingId
        ) {
          return;
        }

        setDeleteTarget(
          item,
        );
      },
      [
        deletingId,
        openingId,
      ],
    );

  /* ============================================================
     CANCEL DELETE
  ============================================================ */

  const handleCancelDelete =
    useCallback(() => {
      if (
        deletingId
      ) {
        return;
      }

      setDeleteTarget(
        null,
      );
    }, [
      deletingId,
    ]);

  /* ============================================================
     CONFIRM DELETE
  ============================================================ */

  const handleConfirmDelete =
    useCallback(async () => {
      if (
        !deleteTarget ||
        deletingId ||
        openingId
      ) {
        return;
      }

      const item =
        deleteTarget;

      try {
        setDeletingId(
          item.id,
        );

        const deleted =
          await deleteHistoryItem(
            item.id,
          );

        if (
          !deleted
        ) {
          Alert.alert(
            "Delete failed",
            "This chat could not be found or deleted.",
          );

          return;
        }

        setDeleteTarget(
          null,
        );
      } catch (
        error: unknown
      ) {
        if (
          __DEV__
        ) {
          console.warn(
            "HISTORY_DELETE_ERROR:",
            error,
          );
        }

        Alert.alert(
          "Delete failed",
          "Unable to delete this chat. Please try again.",
        );
      } finally {
        setDeletingId(
          null,
        );
      }
    }, [
      deleteHistoryItem,
      deleteTarget,
      deletingId,
      openingId,
    ]);

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
          item={
            item
          }
          deleting={
            deletingId ===
            item.id
          }
          opening={
            openingId ===
            item.id
          }
          onOpen={() => {
            void handleOpenChat(
              item,
            );
          }}
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
        openingId,
      ],
    );

  /* ============================================================
     LOADING
  ============================================================ */

  if (
    !historyLoaded
  ) {
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
          accessibilityState={{
            disabled:
              isBusy,
          }}
          disabled={
            isBusy
          }
          hitSlop={8}
          onPress={
            handleBack
          }
          style={({
            pressed,
          }) => [
            styles.headerButton,

            isBusy
              ? styles.headerButtonDisabled
              : null,

            pressed &&
            !isBusy
              ? styles.headerButtonPressed
              : null,
          ]}
        >
          <AppIcon
            name="back"
            role="customer"
            size="md"
            state={
              isBusy
                ? "muted"
                : "default"
            }
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
        data={
          history
        }
        keyExtractor={(
          item,
        ) =>
          item.id
        }
        renderItem={
          renderItem
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.listContent,

          history.length ===
          0
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

      {/* ======================================================
          DELETE MODAL
      ====================================================== */}

      <DeleteHistoryModal
        visible={
          Boolean(
            deleteTarget,
          )
        }
        item={
          deleteTarget
        }
        deleting={
          Boolean(
            deletingId,
          )
        }
        onCancel={
          handleCancelDelete
        }
        onDelete={() => {
          void handleConfirmDelete();
        }}
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

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing
          .lg,

      borderBottomWidth:
        1,

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

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius
          .iconButton,
    },

    headerButtonPressed: {
      backgroundColor:
        CustomerColors
          .primarySoft,

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

    headerButtonDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    headerText: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing
          .sm,
    },

    headerSubtitle: {
      marginTop:
        FixxamTokens.spacing
          .xxs,
    },

    countBadge: {
      minWidth:
        FixxamTokens.size
          .minimumTouchTarget,

      minHeight:
        32,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing
          .sm,

      borderRadius:
        FixxamTokens.radius
          .full,

      backgroundColor:
        CustomerColors
          .primarySoft,
    },

    /* ========================================================
       LIST
    ======================================================== */

    listContent: {
      paddingHorizontal:
        FixxamTokens.spacing
          .lg,

      paddingTop:
        FixxamTokens.spacing
          .lg,

      paddingBottom:
        FixxamTokens.spacing
          .xxl,
    },

    emptyListContent: {
      flexGrow:
        1,
    },

    listSeparator: {
      height:
        FixxamTokens.spacing
          .md,
    },

    /* ========================================================
       HISTORY CARD
    ======================================================== */

    historyCard: {
      width:
        "100%",

      minHeight:
        FixxamTokens.size
          .cardMinHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      padding:
        FixxamTokens.spacing
          .md,
    },

    historyCardOpening: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    historyIcon: {
      width:
        FixxamTokens.size
          .iconBox,

      height:
        FixxamTokens.size
          .iconBox,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius
          .iconButton,

      backgroundColor:
        CustomerColors
          .primarySoft,
    },

    historyContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing
          .md,

      marginRight:
        FixxamTokens.spacing
          .sm,
    },

    historyMeta: {
      marginTop:
        FixxamTokens.spacing
          .xs,
    },

    /* ========================================================
       DELETE BUTTON
    ======================================================== */

    deleteButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing
          .xs,

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
       DELETE MODAL
    ======================================================== */

    deleteModalOverlay: {
      flex:
        1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing
          .xl,

      backgroundColor:
        Colors.overlayStrong,
    },

    deleteModalCard: {
      width:
        "100%",

      maxWidth:
        390,

      padding:
        FixxamTokens.spacing
          .xl,

      borderRadius:
        FixxamTokens.radius
          .xl,
    },

    deleteModalIcon: {
      width:
        56,

      height:
        56,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius
          .lg,

      backgroundColor:
        Colors.errorSoft,
    },

    deleteModalTitle: {
      marginTop:
        FixxamTokens.spacing
          .lg,

      color:
        Colors.textPrimary,
    },

    deleteModalMessage: {
      marginTop:
        FixxamTokens.spacing
          .sm,

      lineHeight:
        22,
    },

    deleteModalWarning: {
      marginTop:
        FixxamTokens.spacing
          .xs,
    },

    deleteModalActions: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing
          .sm,

      marginTop:
        FixxamTokens.spacing
          .xl,
    },

    deleteModalAction: {
      flex:
        1,

      minWidth:
        0,
    },

    deleteConfirmButton: {
      flex:
        1,

      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing
          .xs,

      paddingHorizontal:
        FixxamTokens.spacing
          .md,

      borderWidth:
        1,

      borderColor:
        Colors.error,

      borderRadius:
        FixxamTokens.radius
          .button,

      backgroundColor:
        Colors.errorSoft,
    },

    deleteConfirmPressed: {
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

    deleteConfirmDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    deleteConfirmText: {
      color:
        Colors.error,
    },

    /* ========================================================
       EMPTY STATE
    ======================================================== */

    emptyContainer: {
      flex:
        1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing
          .xxl,

      paddingBottom:
        FixxamTokens.spacing
          .lg *
        2,
    },

    emptyIcon: {
      width:
        FixxamTokens.size
          .roleCardHeight,

      height:
        FixxamTokens.size
          .roleCardHeight,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginBottom:
        FixxamTokens.spacing
          .xl,

      borderRadius:
        FixxamTokens.radius
          .xl,

      backgroundColor:
        CustomerColors
          .primarySoft,
    },

    emptyMessage: {
      maxWidth:
        320,

      marginTop:
        FixxamTokens.spacing
          .sm,
    },

    startButton: {
      minWidth:
        160,

      marginTop:
        FixxamTokens.spacing
          .xl,
    },
  });