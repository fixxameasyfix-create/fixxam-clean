import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";

import {
  Stack,
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import Toast from "react-native-toast-message";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import MarketChatMessageBubble from "@/components/market/chat/MarketChatMessageBubble";
import MarketChatMenu from "@/components/market/chat/MarketChatMenu";
import MarketChatEmpty from "@/components/market/chat/MarketChatEmpty";

import {
  getParamString,
  getString,
  getTimestampMillis,
  normalizeOrderItems,
  normalizeSenderRole,
  shortOrderId,
} from "@/components/market/chat/marketChatHelpers";

import {
  styles,
} from "@/components/market/chat/marketChatStyles";

/* ============================================================
   TYPES
============================================================ */

type ChatMessage = {
  id: string;

  senderId: string;

  senderRole:
    | "customer"
    | "worker";

  text: string;

  createdAt: number;
};

type MessageDocument = {
  senderId?: unknown;

  senderRole?: unknown;

  text?: unknown;

  createdAt?: unknown;
};

type OrderDocument = {
  customerId?: unknown;

  storeId?: unknown;

  sellerId?: unknown;

  storeName?: unknown;

  storePhone?: unknown;

  orderType?: unknown;

  type?: unknown;

  status?: unknown;

  items?: unknown;

  products?: unknown;

  orderItems?: unknown;
};

type ChatParams = {
  orderId?:
    | string
    | string[];

  storePhone?:
    | string
    | string[];
};

/* ============================================================
   CONSTANTS
============================================================ */

const MAX_MESSAGE_LENGTH =
  1000;

const DELETE_BATCH_SIZE =
  450;

/* ============================================================
   HELPERS
============================================================ */

function normalizeValue(
  value: unknown,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value
    .trim()
    .toLowerCase();
}

/* ============================================================
   TOAST
============================================================ */

function showErrorToast(
  title: string,
  message: string,
) {
  Toast.show({
    type: "error",
    text1: title,
    text2: message,
  });
}

function showInfoToast(
  title: string,
  message: string,
) {
  Toast.show({
    type: "info",
    text1: title,
    text2: message,
  });
}

function showSuccessToast(
  title: string,
  message?: string,
) {
  Toast.show({
    type: "success",
    text1: title,

    ...(message
      ? {
          text2:
            message,
        }
      : {}),
  });
}

/* ============================================================
   SCREEN
============================================================ */

export default function MarketOrderChatRoom() {
  const params =
    useLocalSearchParams<ChatParams>();

  const insets =
    useSafeAreaInsets();

  /* ==========================================================
     PARAMS
  ========================================================== */

  const orderId =
    useMemo(
      () =>
        getParamString(
          params.orderId,
        ),
      [
        params.orderId,
      ],
    );

  const paramStorePhone =
    useMemo(
      () =>
        getParamString(
          params.storePhone,
        ),
      [
        params.storePhone,
      ],
    );

  const currentUserId =
    auth.currentUser?.uid ??
    "";

  const chatRoomId =
    orderId;

  /* ==========================================================
     STATE
  ========================================================== */

  const [
    messages,
    setMessages,
  ] =
    useState<ChatMessage[]>(
      [],
    );

  const [
    order,
    setOrder,
  ] =
    useState<OrderDocument | null>(
      null,
    );

  const [
    text,
    setText,
  ] =
    useState("");

  const [
    messagesLoading,
    setMessagesLoading,
  ] =
    useState(true);

  const [
    orderLoading,
    setOrderLoading,
  ] =
    useState(true);

  const [
    sending,
    setSending,
  ] =
    useState(false);

  const [
    deleting,
    setDeleting,
  ] =
    useState(false);

  const [
    orderError,
    setOrderError,
  ] =
    useState("");

  const [
    chatError,
    setChatError,
  ] =
    useState("");

  const [
    menuVisible,
    setMenuVisible,
  ] =
    useState(false);

  const listRef =
    useRef<
      FlatList<ChatMessage>
    >(null);

  /* ==========================================================
     ORDER VALUES
  ========================================================== */

  const storeName =
    useMemo(
      () =>
        getString(
          order?.storeName,
          "Store",
        ),
      [
        order?.storeName,
      ],
    );

  const storePhone =
    useMemo(
      () =>
        getString(
          order?.storePhone,
          paramStorePhone,
        ),
      [
        order?.storePhone,
        paramStorePhone,
      ],
    );

  const resolvedStoreId =
    useMemo(
      () =>
        getString(
          order?.storeId,
        ),
      [
        order?.storeId,
      ],
    );

  const resolvedSellerId =
    useMemo(
      () =>
        getString(
          order?.sellerId,
        ),
      [
        order?.sellerId,
      ],
    );

  const orderItems =
    useMemo(
      () =>
        normalizeOrderItems(
          order?.items ??
            order?.products ??
            order?.orderItems,
        ),
      [
        order?.items,
        order?.products,
        order?.orderItems,
      ],
    );

  /* ==========================================================
     SCROLL
  ========================================================== */

  const scrollToBottom =
    useCallback(
      (
        animated = true,
      ) => {
        requestAnimationFrame(
          () => {
            listRef.current?.scrollToEnd(
              {
                animated,
              },
            );
          },
        );
      },
      [],
    );

  /* ==========================================================
     ORDER LISTENER
  ========================================================== */

  useEffect(() => {
    if (
      !orderId ||
      !currentUserId
    ) {
      setOrder(
        null,
      );

      setOrderLoading(
        false,
      );

      setOrderError(
        !currentUserId
          ? "Please sign in again to access this chat."
          : "Order information is missing.",
      );

      return;
    }

    setOrderLoading(
      true,
    );

    setOrderError(
      "",
    );

    const orderRef =
      doc(
        db,
        "orders",
        orderId,
      );

    const unsubscribe =
      onSnapshot(
        orderRef,

        (
          snapshot,
        ) => {
          if (
            !snapshot.exists()
          ) {
            setOrder(
              null,
            );

            setOrderLoading(
              false,
            );

            setOrderError(
              "This order could not be found.",
            );

            return;
          }

          const data =
            snapshot.data() as OrderDocument;

          const customerId =
            getString(
              data.customerId,
            );

          if (
            !customerId ||
            customerId !==
              currentUserId
          ) {
            setOrder(
              null,
            );

            setOrderLoading(
              false,
            );

            setOrderError(
              "You do not have permission to access this order.",
            );

            return;
          }

          const orderType =
            normalizeValue(
              data.orderType,
            );

          const type =
            normalizeValue(
              data.type,
            );

          if (
            orderType !==
              "market" &&
            type !==
              "market"
          ) {
            setOrder(
              null,
            );

            setOrderLoading(
              false,
            );

            setOrderError(
              "This chat is not associated with a market order.",
            );

            return;
          }

          setOrder(
            data,
          );

          setOrderLoading(
            false,
          );

          setOrderError(
            "",
          );
        },

        (
          listenerError,
        ) => {
          console.error(
            "FIXXAM_MARKET_CHAT_ORDER_ERROR:",
            listenerError,
          );

          setOrder(
            null,
          );

          setOrderLoading(
            false,
          );

          setOrderError(
            "Unable to load order information.",
          );
        },
      );

    return unsubscribe;
  }, [
    currentUserId,
    orderId,
  ]);

  /* ==========================================================
     MESSAGE LISTENER
  ========================================================== */

  useEffect(() => {
    if (
      !chatRoomId ||
      !currentUserId ||
      orderLoading ||
      !order
    ) {
      setMessages(
        [],
      );

      if (
        !orderLoading
      ) {
        setMessagesLoading(
          false,
        );
      }

      return;
    }

    const customerId =
      getString(
        order.customerId,
      );

    if (
      customerId !==
      currentUserId
    ) {
      setMessages(
        [],
      );

      setMessagesLoading(
        false,
      );

      return;
    }

    setMessagesLoading(
      true,
    );

    setChatError(
      "",
    );

    const messagesRef =
      collection(
        db,
        "marketChats",
        chatRoomId,
        "messages",
      );

    const messagesQuery =
      query(
        messagesRef,

        orderBy(
          "createdAt",
          "asc",
        ),
      );

    const unsubscribe =
      onSnapshot(
        messagesQuery,

        (
          snapshot,
        ) => {
          const nextMessages =
            snapshot.docs
              .map(
                (
                  messageDoc,
                ): ChatMessage => {
                  const data =
                    messageDoc.data() as MessageDocument;

                  return {
                    id:
                      messageDoc.id,

                    senderId:
                      getString(
                        data.senderId,
                      ),

                    senderRole:
                      normalizeSenderRole(
                        data.senderRole,
                      ),

                    text:
                      getString(
                        data.text,
                      ),

                    createdAt:
                      getTimestampMillis(
                        data.createdAt,
                      ),
                  };
                },
              )
              .filter(
                (
                  message,
                ) =>
                  message.text
                    .trim()
                    .length >
                  0,
              );

          setMessages(
            nextMessages,
          );

          setMessagesLoading(
            false,
          );

          setChatError(
            "",
          );

          if (
            nextMessages.length >
            0
          ) {
            requestAnimationFrame(
              () => {
                scrollToBottom(
                  false,
                );
              },
            );
          }
        },

        (
          listenerError,
        ) => {
          console.error(
            "FIXXAM_MARKET_CHAT_MESSAGES_ERROR:",
            listenerError,
          );

          setMessages(
            [],
          );

          setMessagesLoading(
            false,
          );

          setChatError(
            "Unable to load chat messages.",
          );
        },
      );

    return unsubscribe;
  }, [
    chatRoomId,
    currentUserId,
    order,
    orderLoading,
    scrollToBottom,
  ]);

  /* ==========================================================
     SEND
  ========================================================== */

  const handleSend =
    useCallback(
      async () => {
        const cleanText =
          text.trim();

        if (
          sending ||
          deleting ||
          !cleanText
        ) {
          return;
        }

        if (
          cleanText.length >
          MAX_MESSAGE_LENGTH
        ) {
          showErrorToast(
            "Message too long",
            `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`,
          );

          return;
        }

        if (
          !currentUserId
        ) {
          showErrorToast(
            "Sign in required",
            "Please sign in again to continue.",
          );

          return;
        }

        if (
          !orderId ||
          !order
        ) {
          showErrorToast(
            "Chat unavailable",
            "Order information is missing.",
          );

          return;
        }

        const customerId =
          getString(
            order.customerId,
          );

        if (
          customerId !==
          currentUserId
        ) {
          showErrorToast(
            "Access denied",
            "You do not have permission to send messages for this order.",
          );

          return;
        }

        setSending(
          true,
        );

        setChatError(
          "",
        );

        try {
          const chatRef =
            doc(
              db,
              "marketChats",
              orderId,
            );

          const messagesRef =
            collection(
              db,
              "marketChats",
              orderId,
              "messages",
            );

          const messageRef =
            doc(
              messagesRef,
            );

          const batch =
            writeBatch(
              db,
            );

          batch.set(
            chatRef,
            {
              orderId,

              customerId:
                currentUserId,

              ...(resolvedStoreId
                ? {
                    storeId:
                      resolvedStoreId,
                  }
                : {}),

              ...(resolvedSellerId
                ? {
                    sellerId:
                      resolvedSellerId,
                  }
                : {}),

              ...(storeName
                ? {
                    storeName,
                  }
                : {}),

              ...(storePhone
                ? {
                    storePhone,
                  }
                : {}),

              lastMessage:
                cleanText,

              lastMessageSenderId:
                currentUserId,

              lastMessageSenderRole:
                "customer",

              updatedAt:
                serverTimestamp(),
            },

            {
              merge:
                true,
            },
          );

          batch.set(
            messageRef,
            {
              senderId:
                currentUserId,

              senderRole:
                "customer",

              text:
                cleanText,

              createdAt:
                serverTimestamp(),
            },
          );

          await batch.commit();

          setText(
            "",
          );

          requestAnimationFrame(
            () => {
              scrollToBottom(
                true,
              );
            },
          );
        } catch (
          sendError
        ) {
          console.error(
            "FIXXAM_MARKET_CHAT_SEND_ERROR:",
            sendError,
          );

          showErrorToast(
            "Message not sent",
            "Message could not be sent. Please try again.",
          );
        } finally {
          setSending(
            false,
          );
        }
      },
      [
        currentUserId,
        deleting,
        order,
        orderId,
        resolvedSellerId,
        resolvedStoreId,
        scrollToBottom,
        sending,
        storeName,
        storePhone,
        text,
      ],
    );

  /* ==========================================================
     VOICE CALL
  ========================================================== */

  const handleCallStore =
    useCallback(() => {
      setMenuVisible(
        false,
      );

      if (
        !currentUserId
      ) {
        showErrorToast(
          "Sign in required",
          "Please sign in again before starting a call.",
        );

        return;
      }

      if (
        !order
      ) {
        showErrorToast(
          "Order unavailable",
          "Order information could not be loaded.",
        );

        return;
      }

      const customerId =
        getString(
          order.customerId,
        );

      if (
        customerId !==
        currentUserId
      ) {
        showErrorToast(
          "Access denied",
          "You do not have permission to call the store for this order.",
        );

        return;
      }

      const sellerId =
        resolvedSellerId.trim();

      if (
        !sellerId
      ) {
        showInfoToast(
          "Store unavailable",
          "The store could not be identified for this call.",
        );

        return;
      }

      router.push({
        pathname:
          "/(customer)/call/[workerId]",

        params: {
          workerId:
            sellerId,

          name:
            storeName ||
            "Store",
        },
      } as never);
    }, [
      currentUserId,
      order,
      resolvedSellerId,
      storeName,
    ]);

  /* ==========================================================
     DELETE MESSAGES
  ========================================================== */

  const deleteMyMessages =
    useCallback(
      async () => {
        if (
          deleting ||
          sending ||
          !currentUserId ||
          !chatRoomId ||
          !order
        ) {
          return;
        }

        const customerId =
          getString(
            order.customerId,
          );

        if (
          customerId !==
          currentUserId
        ) {
          showErrorToast(
            "Access denied",
            "You do not have permission to modify this chat.",
          );

          return;
        }

        setDeleting(
          true,
        );

        setMenuVisible(
          false,
        );

        try {
          const messagesRef =
            collection(
              db,
              "marketChats",
              chatRoomId,
              "messages",
            );

          const ownMessagesQuery =
            query(
              messagesRef,

              where(
                "senderId",
                "==",
                currentUserId,
              ),
            );

          const snapshot =
            await getDocs(
              ownMessagesQuery,
            );

          if (
            snapshot.empty
          ) {
            showInfoToast(
              "Nothing to delete",
              "You don't have any messages in this chat.",
            );

            return;
          }

          for (
            let index = 0;
            index <
            snapshot.docs.length;
            index +=
              DELETE_BATCH_SIZE
          ) {
            const batch =
              writeBatch(
                db,
              );

            snapshot.docs
              .slice(
                index,
                index +
                  DELETE_BATCH_SIZE,
              )
              .forEach(
                (
                  messageDoc,
                ) => {
                  batch.delete(
                    messageDoc.ref,
                  );
                },
              );

            await batch.commit();
          }

          setMessages(
            (
              currentMessages,
            ) =>
              currentMessages.filter(
                (
                  message,
                ) =>
                  message.senderId !==
                  currentUserId,
              ),
          );

          setText(
            "",
          );

          showSuccessToast(
            "Messages deleted",
            "Your messages were deleted. The store's messages are still available.",
          );
        } catch (
          deleteError
        ) {
          console.error(
            "FIXXAM_MARKET_CHAT_DELETE_ERROR:",
            deleteError,
          );

          showErrorToast(
            "Unable to delete",
            "Something went wrong while deleting your messages.",
          );
        } finally {
          setDeleting(
            false,
          );
        }
      },
      [
        chatRoomId,
        currentUserId,
        deleting,
        order,
        sending,
      ],
    );

  const handleDeleteChat =
    useCallback(() => {
      if (
        deleting ||
        sending
      ) {
        return;
      }

      setMenuVisible(
        false,
      );

      Alert.alert(
        "Delete my messages?",
        "Only the messages you sent will be permanently deleted. The store's messages will remain.",
        [
          {
            text:
              "Cancel",

            style:
              "cancel",
          },

          {
            text:
              "Delete",

            style:
              "destructive",

            onPress: () => {
              void deleteMyMessages();
            },
          },
        ],
      );
    }, [
      deleteMyMessages,
      deleting,
      sending,
    ]);

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const handleBack =
    useCallback(() => {
      if (
        sending ||
        deleting
      ) {
        return;
      }

      router.back();
    }, [
      deleting,
      sending,
    ]);

  const handleOpenMenu =
    useCallback(() => {
      if (
        sending ||
        deleting
      ) {
        return;
      }

      setMenuVisible(
        true,
      );
    }, [
      deleting,
      sending,
    ]);

  const handleCloseMenu =
    useCallback(() => {
      setMenuVisible(
        false,
      );
    }, []);

  const handleInputFocus =
    useCallback(() => {
      requestAnimationFrame(
        () => {
          scrollToBottom(
            true,
          );
        },
      );
    }, [
      scrollToBottom,
    ]);

  /* ==========================================================
     LIST
  ========================================================== */

  const renderMessage =
    useCallback(
      ({
        item,
      }: {
        item: ChatMessage;
      }) => (
        <MarketChatMessageBubble
          message={
            item
          }
          isMine={
            item.senderId ===
            currentUserId
          }
        />
      ),
      [
        currentUserId,
      ],
    );

  const keyExtractor =
    useCallback(
      (
        item:
          ChatMessage,
      ) =>
        item.id,
      [],
    );

  /* ==========================================================
     INVALID ORDER
  ========================================================== */

  if (
    !orderId
  ) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown:
              false,
          }}
        />

        <View
          style={
            styles.center
          }
        >
          <AppIcon
            name="messages"
            size="xl"
            color={
              Colors.textMuted
            }
          />

          <AppText
            variant="heading3"
            weight="bold"
            style={
              styles.errorTitle
            }
          >
            Chat unavailable
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.errorText
            }
          >
            This chat room is missing the order information.
          </AppText>

          <Pressable
            onPress={
              handleBack
            }
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={
              styles.backButton
            }
          >
            <AppText
              variant="bodyMedium"
              weight="semibold"
              style={
                styles.backButtonText
              }
            >
              Go back
            </AppText>
          </Pressable>
        </View>
      </>
    );
  }

  /* ==========================================================
     ORDER ERROR
  ========================================================== */

  if (
    !orderLoading &&
    !order
  ) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown:
              false,
          }}
        />

        <View
          style={
            styles.center
          }
        >
          <View
            style={
              styles.errorIcon
            }
          >
            <AppIcon
              name="error"
              size="lg"
              color={
                Colors.error
              }
            />
          </View>

          <AppText
            variant="heading3"
            weight="bold"
            style={
              styles.errorTitle
            }
          >
            Chat unavailable
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.errorText
            }
          >
            {orderError ||
              "Unable to load this order."}
          </AppText>

          <Pressable
            onPress={
              handleBack
            }
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={
              styles.backButton
            }
          >
            <AppText
              variant="bodyMedium"
              weight="semibold"
              style={
                styles.backButtonText
              }
            >
              Go back
            </AppText>
          </Pressable>
        </View>
      </>
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      <Stack.Screen
        options={{
          headerShown:
            false,
        }}
      />

      <KeyboardAvoidingView
        style={
          styles.screen
        }
        behavior={
          Platform.OS ===
          "ios"
            ? "padding"
            : "height"
        }
        keyboardVerticalOffset={
          Platform.OS ===
          "ios"
            ? insets.top
            : 0
        }
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <View
          style={[
            styles.header,

            {
              paddingTop:
                Math.max(
                  insets.top,
                  FixxamTokens.spacing.sm,
                ),
            },
          ]}
        >
          <Pressable
            onPress={
              handleBack
            }
            disabled={
              sending ||
              deleting
            }
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={[
              styles.headerButton,

              sending ||
              deleting
                ? styles.disabled
                : null,
            ]}
          >
            <AppIcon
              name="back"
              size="md"
              color={
                Colors.textPrimary
              }
            />
          </Pressable>

          <View
            style={
              styles.headerInfo
            }
          >
            <AppText
              variant="bodyMedium"
              weight="semibold"
              numberOfLines={1}
              style={
                styles.headerTitle
              }
            >
              {storeName}
            </AppText>

            <View
              style={
                styles.onlineRow
              }
            >
              <AppText
                variant="caption"
                tone="secondary"
                numberOfLines={1}
                style={
                  styles.onlineText
                }
              >
                Order #
                {shortOrderId(
                  orderId,
                )}
              </AppText>
            </View>
          </View>

          <Pressable
            onPress={
              handleOpenMenu
            }
            disabled={
              sending ||
              deleting
            }
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Open chat options"
            style={[
              styles.menuButton,

              sending ||
              deleting
                ? styles.disabled
                : null,
            ]}
          >
            <AppIcon
              name="more"
              size="md"
              color={
                Colors.textPrimary
              }
            />
          </Pressable>
        </View>

        {/* ====================================================
            MESSAGES
        ==================================================== */}

        <View
          style={
            styles.chatContainer
          }
        >
          {messagesLoading ? (
            <View
              style={
                styles.center
              }
            >
              <ActivityIndicator
                size="small"
                color={
                  CustomerColors.primary
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
          ) : (
            <FlatList
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
              onContentSizeChange={() => {
                if (
                  messages.length >
                  0
                ) {
                  scrollToBottom(
                    false,
                  );
                }
              }}
              ListEmptyComponent={
                <MarketChatEmpty />
              }
            />
          )}
        </View>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {chatError ? (
          <View
            style={
              styles.errorBar
            }
          >
            <AppIcon
              name="warning"
              size="xs"
              color={
                Colors.error
              }
            />

            <AppText
              variant="caption"
              style={
                styles.errorBarText
              }
            >
              {chatError}
            </AppText>
          </View>
        ) : null}

        {/* ====================================================
            INPUT
        ==================================================== */}

        <View
          style={[
            styles.inputArea,

            {
              paddingBottom:
                Math.max(
                  insets.bottom,
                  FixxamTokens.spacing.sm,
                ),
            },
          ]}
        >
          <View
            style={
              styles.inputContainer
            }
          >
            <TextInput
              value={
                text
              }
              onChangeText={
                setText
              }
              onFocus={
                handleInputFocus
              }
              placeholder="Type a message..."
              placeholderTextColor={
                Colors.textMuted
              }
              multiline
              maxLength={
                MAX_MESSAGE_LENGTH
              }
              editable={
                !sending &&
                !deleting &&
                !orderLoading &&
                Boolean(
                  order,
                )
              }
              textAlignVertical="center"
              accessibilityLabel="Message"
              accessibilityHint="Type a message to the store"
              style={
                styles.input
              }
            />

            <Pressable
              onPress={() => {
                void handleSend();
              }}
              disabled={
                sending ||
                deleting ||
                !text.trim() ||
                orderLoading ||
                !order
              }
              accessibilityRole="button"
              accessibilityLabel="Send message"
              style={[
                styles.sendButton,

                (!text.trim() ||
                  sending ||
                  deleting ||
                  orderLoading ||
                  !order) &&
                  styles.sendDisabled,
              ]}
            >
              {sending ? (
                <ActivityIndicator
                  size="small"
                  color={
                    Colors.textInverse
                  }
                />
              ) : (
                <AppIcon
                  name="next"
                  role="customer"
                  size="sm"
                  color={
                    Colors.textInverse
                  }
                />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* ======================================================
          OPTIONS
      ====================================================== */}

      <MarketChatMenu
        visible={
          menuVisible
        }
        busy={
          sending ||
          deleting
        }
        deleting={
          deleting
        }
        canCall={
          Boolean(
            resolvedSellerId,
          )
        }
        items={
          orderItems
        }
        onClose={
          handleCloseMenu
        }
        onCall={
          handleCallStore
        }
        onDelete={
          handleDeleteChat
        }
      />
    </>
  );
}