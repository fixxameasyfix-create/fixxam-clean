import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";

import {
  AppText,
} from "@/components/ui";

import useAiChat, {
  AiChatHistoryItem,
} from "@/hooks/ai/useAiChat";

/* ==============================================================
   HISTORY ITEM
============================================================== */

function HistoryItem({
  item,
  onOpen,
  onDelete,
}: {
  item: AiChatHistoryItem;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const messageCount =
    item.messages.length;

  const date =
    new Date(
      item.createdAt,
    ).toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      },
    );

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}
      style={({ pressed }) => [
        styles.historyCard,

        pressed &&
          styles.historyCardPressed,
      ]}
    >
      {/* ======================================================
          ICON
      ====================================================== */}

      <View style={styles.historyIcon}>
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={22}
          color="#2563EB"
        />
      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <View style={styles.historyContent}>
        <AppText
          weight="bold"
          numberOfLines={1}
          style={styles.historyTitle}
        >
          {item.title}
        </AppText>

        <AppText
          numberOfLines={1}
          style={styles.historyMeta}
        >
          {messageCount}{" "}
          {messageCount === 1
            ? "message"
            : "messages"}{" "}
          • {date}
        </AppText>
      </View>

      {/* ======================================================
          DELETE
      ====================================================== */}

      <Pressable
        onPress={(event) => {
          event.stopPropagation();
          onDelete();
        }}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${item.title}`}
        hitSlop={10}
        style={({ pressed }) => [
          styles.deleteButton,

          pressed &&
            styles.deleteButtonPressed,
        ]}
      >
        <Ionicons
          name="trash-outline"
          size={19}
          color="#DC2626"
        />
      </Pressable>

      {/* ======================================================
          ARROW
      ====================================================== */}

      <Ionicons
        name="chevron-forward"
        size={19}
        color="#94A3B8"
      />
    </Pressable>
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
  ] = useState<string | null>(
    null,
  );

  /* ============================================================
     DELETE
  ============================================================ */

  const handleDelete = useCallback(
    (item: AiChatHistoryItem) => {
      Alert.alert(
        "Delete Chat?",
        `Are you sure you want to delete "${item.title}" from History?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                setDeletingId(item.id);

                await deleteHistoryItem(
                  item.id,
                );
              } catch (error) {
                console.error(
                  "HISTORY_DELETE_ERROR:",
                  error,
                );

                Alert.alert(
                  "Delete Failed",
                  "Unable to delete this chat. Please try again.",
                );
              } finally {
                setDeletingId(null);
              }
            },
          },
        ],
      );
    },
    [deleteHistoryItem],
  );

  /* ============================================================
     OPEN CHAT
  ============================================================ */

  const handleOpenChat = useCallback(
    (
      item: AiChatHistoryItem,
    ) => {
      /*
       * For now we pass the history ID.
       *
       * The AI screen can later use this ID
       * to restore the selected conversation.
       */

      router.push({
        pathname:
          "/(customer)/ai",
        params: {
          historyId: item.id,
        },
      });
    },
    [],
  );

  /* ============================================================
     BACK
  ============================================================ */

  const handleBack = useCallback(
    () => {
      router.back();
    },
    [],
  );

  /* ============================================================
     LOADING
  ============================================================ */

  if (!historyLoaded) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color="#2563EB"
          />

          <AppText
            style={styles.loadingText}
          >
            Loading History...
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  /* ============================================================
     EMPTY
  ============================================================ */

  const emptyHistory =
    history.length === 0;

  /* ============================================================
     UI
  ============================================================ */

  return (
    <SafeAreaView
      style={styles.container}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
          style={({ pressed }) => [
            styles.backButton,

            pressed &&
              styles.backButtonPressed,
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color="#0F172A"
          />
        </Pressable>

        <View style={styles.headerText}>
          <AppText
            weight="bold"
            style={styles.headerTitle}
          >
            Chat History
          </AppText>

          <AppText
            style={styles.headerSubtitle}
          >
            Your saved conversations
          </AppText>
        </View>

        <View style={styles.countBadge}>
          <AppText
            weight="bold"
            style={styles.countText}
          >
            {history.length}/5
          </AppText>
        </View>
      </View>

      {/* ======================================================
          EMPTY STATE
      ====================================================== */}

      {emptyHistory ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="time-outline"
              size={42}
              color="#2563EB"
            />
          </View>

          <AppText
            weight="bold"
            style={styles.emptyTitle}
          >
            No saved chats
          </AppText>

          <AppText
            style={styles.emptyMessage}
          >
            Conversations you save before
            starting a new chat will appear
            here.
          </AppText>

          <Pressable
            onPress={() =>
              router.back()
            }
            style={({ pressed }) => [
              styles.startButton,

              pressed &&
                styles.startButtonPressed,
            ]}
          >
            <Ionicons
              name="chatbubble-outline"
              size={19}
              color="#FFFFFF"
            />

            <AppText
              weight="bold"
              style={styles.startButtonText}
            >
              Start a Chat
            </AppText>
          </Pressable>
        </View>
      ) : (
        /* ====================================================
           LIST
        ==================================================== */

        <FlatList
          data={history}
          keyExtractor={(item) =>
            item.id
          }
          contentContainerStyle={
            styles.listContent
          }
          showsVerticalScrollIndicator={
            false
          }
          renderItem={({
            item,
          }) => (
            <HistoryItem
              item={item}
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
          )}
        />
      )}
    </SafeAreaView>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FFFFFF",
    },

    /* ==========================================================
       HEADER
    ========================================================== */

    header: {
      minHeight: 76,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: "#EEF2F7",
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
    },

    backButtonPressed: {
      backgroundColor: "#F1F5F9",
    },

    headerText: {
      flex: 1,
      marginLeft: 10,
    },

    headerTitle: {
      fontSize: 21,
      lineHeight: 27,
      color: "#0F172A",
    },

    headerSubtitle: {
      marginTop: 2,
      fontSize: 13,
      lineHeight: 18,
      color: "#64748B",
    },

    countBadge: {
      minWidth: 42,
      height: 30,
      paddingHorizontal: 9,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#EFF6FF",
    },

    countText: {
      fontSize: 12,
      color: "#2563EB",
    },

    /* ==========================================================
       LIST
    ========================================================== */

    listContent: {
      padding: 18,
      paddingBottom: 30,
    },

    historyCard: {
      minHeight: 78,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      marginBottom: 11,
      borderRadius: 18,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E8EEF5",
      shadowColor: "#000000",
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },

    historyCardPressed: {
      backgroundColor: "#F8FAFC",
    },

    historyIcon: {
      width: 48,
      height: 48,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#EFF6FF",
    },

    historyContent: {
      flex: 1,
      marginLeft: 13,
      marginRight: 8,
    },

    historyTitle: {
      fontSize: 15,
      lineHeight: 21,
      color: "#0F172A",
    },

    historyMeta: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 17,
      color: "#64748B",
    },

    deleteButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 3,
    },

    deleteButtonPressed: {
      backgroundColor: "#FEF2F2",
    },

    /* ==========================================================
       LOADING
    ========================================================== */

    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    loadingText: {
      marginTop: 10,
      fontSize: 14,
      color: "#64748B",
    },

    /* ==========================================================
       EMPTY
    ========================================================== */

    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 40,
    },

    emptyIcon: {
      width: 82,
      height: 82,
      borderRadius: 26,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#EFF6FF",
      marginBottom: 20,
    },

    emptyTitle: {
      fontSize: 22,
      lineHeight: 28,
      color: "#0F172A",
      textAlign: "center",
    },

    emptyMessage: {
      marginTop: 9,
      fontSize: 15,
      lineHeight: 22,
      color: "#64748B",
      textAlign: "center",
    },

    startButton: {
      minHeight: 48,
      marginTop: 25,
      paddingHorizontal: 20,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: "#2563EB",
    },

    startButtonPressed: {
      opacity: 0.8,
    },

    startButtonText: {
      fontSize: 15,
      color: "#FFFFFF",
    },
  });