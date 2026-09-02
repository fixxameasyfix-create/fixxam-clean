import React, {
  memo,
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
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  Stack,
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import {
  AppText,
} from "@/components/ui";

import {
  auth,
  db,
} from "@/firebase/config";

/* ==============================================================
   TYPES
============================================================== */

type ChatMessage = {
  id: string;
  senderId: string;
  senderRole: "customer" | "seller";
  text: string;
  createdAt: number;
};

type MessageDocument = {
  senderId?: unknown;
  senderRole?: unknown;
  text?: unknown;
  createdAt?: unknown;
};

type OrderItem = {
  id: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
};

type OrderDocument = {
  customerId?: unknown;

  storeId?: unknown;
  sellerId?: unknown;

  storeName?: unknown;
  storePhone?: unknown;

  items?: unknown;
  products?: unknown;
  orderItems?: unknown;

  subtotal?: unknown;
  deliveryFee?: unknown;
  total?: unknown;
};

type ChatParams = {
  orderId?: string | string[];
  storeId?: string | string[];
  sellerId?: string | string[];
  storePhone?: string | string[];
};

/* ==============================================================
   CONSTANTS
============================================================== */

const MAX_MESSAGE_LENGTH = 1000;
const DELETE_BATCH_SIZE = 450;

/* ==============================================================
   COMPONENT
============================================================== */

export default function MarketOrderChatRoom() {
  const params =
    useLocalSearchParams<ChatParams>();

  /* ============================================================
     PARAMS
  ============================================================ */

  const orderId = useMemo(
    () =>
      getParamString(
        params.orderId,
      ),
    [params.orderId],
  );

  const storeId = useMemo(
    () =>
      getParamString(
        params.storeId,
      ),
    [params.storeId],
  );

  const sellerId = useMemo(
    () =>
      getParamString(
        params.sellerId,
      ),
    [params.sellerId],
  );

  const paramStorePhone =
    useMemo(
      () =>
        getParamString(
          params.storePhone,
        ),
      [params.storePhone],
    );

  /* ============================================================
     AUTH
  ============================================================ */

  const currentUserId =
    auth.currentUser?.uid ?? "";

  /* ============================================================
     CHAT ROOM
  ============================================================ */

  const chatRoomId =
    orderId;

  /* ============================================================
     STATE
  ============================================================ */

  const [
    messages,
    setMessages,
  ] = useState<ChatMessage[]>([]);

  const [
    order,
    setOrder,
  ] = useState<OrderDocument | null>(
    null,
  );

  const [
    orderItems,
    setOrderItems,
  ] = useState<OrderItem[]>([]);

  const [
    text,
    setText,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    orderLoading,
    setOrderLoading,
  ] = useState(true);

  const [
    sending,
    setSending,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    menuVisible,
    setMenuVisible,
  ] = useState(false);

  /* ============================================================
     LIST REF
  ============================================================ */

  const listRef =
    useRef<FlatList<ChatMessage>>(
      null,
    );

  /* ============================================================
     ORDER VALUES
  ============================================================ */

  const storeName =
    useMemo(
      () =>
        getString(
          order?.storeName,
          "Store",
        ),
      [order],
    );

  const storePhone =
    useMemo(
      () =>
        getString(
          order?.storePhone,
          paramStorePhone,
        ),
      [
        order,
        paramStorePhone,
      ],
    );

  const orderTotal =
    useMemo(
      () =>
        getNumber(
          order?.total,
        ),
      [order],
    );

  /* ============================================================
     SCROLL
  ============================================================ */

  const scrollToBottom =
    useCallback(
      (
        animated = true,
      ) => {
        requestAnimationFrame(() => {
          listRef.current?.scrollToEnd({
            animated,
          });
        });
      },
      [],
    );

  /* ============================================================
     LOAD ORDER
  ============================================================ */

  useEffect(() => {
    if (
      !orderId ||
      !currentUserId
    ) {
      setOrder(null);
      setOrderItems([]);
      setOrderLoading(false);
      return;
    }

    setOrderLoading(true);
    setError("");

    const orderRef =
      doc(
        db,
        "orders",
        orderId,
      );

    const unsubscribe =
      onSnapshot(
        orderRef,
        (snapshot) => {
          if (
            !snapshot.exists()
          ) {
            setOrder(null);
            setOrderItems([]);
            setOrderLoading(false);
            setError(
              "This order could not be found.",
            );

            return;
          }

          const data =
            snapshot.data() as OrderDocument;

          /* ==================================================
             CUSTOMER OWNERSHIP
          ================================================== */

          const customerId =
            getString(
              data.customerId,
            );

          if (
            customerId &&
            customerId !==
              currentUserId
          ) {
            setOrder(null);
            setOrderItems([]);
            setOrderLoading(false);
            setError(
              "You do not have permission to access this order.",
            );

            return;
          }

          setOrder(data);

          setOrderItems(
            normalizeOrderItems(
              data.items ??
                data.products ??
                data.orderItems,
            ),
          );

          setOrderLoading(false);
          setError("");
        },
        (listenerError) => {
          console.error(
            "FIXXAM_MARKET_CHAT_ORDER_ERROR:",
            listenerError,
          );

          setOrder(null);
          setOrderItems([]);
          setOrderLoading(false);
          setError(
            "Unable to load order information.",
          );
        },
      );

    return unsubscribe;
  }, [
    currentUserId,
    orderId,
  ]);

  /* ============================================================
     LOAD CHAT MESSAGES
  ============================================================ */

  useEffect(() => {
    if (
      !chatRoomId ||
      !currentUserId
    ) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);

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
        (snapshot) => {
          const nextMessages =
            snapshot.docs
              .map(
                (messageDoc) => {
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
                (message) =>
                  message.text.trim()
                    .length > 0,
              );

          setMessages(
            nextMessages,
          );

          setLoading(false);

          requestAnimationFrame(() => {
            if (
              nextMessages.length >
              0
            ) {
              scrollToBottom(
                false,
              );
            }
          });
        },
        (listenerError) => {
          console.error(
            "FIXXAM_MARKET_CHAT_MESSAGES_ERROR:",
            listenerError,
          );

          setMessages([]);
          setLoading(false);
          setError(
            "Unable to load chat messages.",
          );
        },
      );

    return unsubscribe;
  }, [
    chatRoomId,
    currentUserId,
    scrollToBottom,
  ]);

  /* ============================================================
     SEND MESSAGE
  ============================================================ */

  const handleSend =
    useCallback(
      async () => {
        const cleanText =
          text.trim();

        if (
          sending ||
          deleting
        ) {
          return;
        }

        if (!cleanText) {
          return;
        }

        if (
          cleanText.length >
          MAX_MESSAGE_LENGTH
        ) {
          setError(
            `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`,
          );

          return;
        }

        if (!currentUserId) {
          setError(
            "Please sign in again to continue.",
          );

          return;
        }

        if (!orderId) {
          setError(
            "Order information is missing.",
          );

          return;
        }

        if (
          order &&
          getString(
            order.customerId,
          ) &&
          getString(
            order.customerId,
          ) !== currentUserId
        ) {
          setError(
            "You do not have permission to send messages for this order.",
          );

          return;
        }

        setSending(true);
        setError("");

        try {
          /* ==================================================
             CREATE / UPDATE SHARED CHAT ROOM
          ================================================== */

          await setDoc(
            doc(
              db,
              "marketChats",
              orderId,
            ),
            {
              orderId,

              customerId:
                currentUserId,

              ...(storeId
                ? {
                    storeId,
                  }
                : {}),

              ...(sellerId
                ? {
                    sellerId,
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

              updatedAt:
                serverTimestamp(),

              lastMessage:
                cleanText,

              lastMessageSenderId:
                currentUserId,

              lastMessageSenderRole:
                "customer",
            },
            {
              merge: true,
            },
          );

          /* ==================================================
             ADD MESSAGE
          ================================================== */

          await addDoc(
            collection(
              db,
              "marketChats",
              orderId,
              "messages",
            ),
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

          setText("");

          requestAnimationFrame(() => {
            scrollToBottom(
              true,
            );
          });
        } catch (sendError) {
          console.error(
            "FIXXAM_MARKET_CHAT_SEND_ERROR:",
            sendError,
          );

          setError(
            "Message could not be sent. Please try again.",
          );
        } finally {
          setSending(false);
        }
      },
      [
        currentUserId,
        deleting,
        order,
        orderId,
        scrollToBottom,
        sellerId,
        sending,
        storeId,
        storeName,
        storePhone,
        text,
      ],
    );

  /* ============================================================
     CALL STORE
  ============================================================ */

  const handleCallStore =
    useCallback(
      async () => {
        setMenuVisible(false);

        if (!storePhone) {
          Alert.alert(
            "Phone unavailable",
            "The store phone number is not available for this order.",
          );

          return;
        }

        const phoneUrl =
          `tel:${storePhone}`;

        try {
          const supported =
            await Linking.canOpenURL(
              phoneUrl,
            );

          if (!supported) {
            Alert.alert(
              "Unable to call",
              "Your device cannot make phone calls.",
            );

            return;
          }

          await Linking.openURL(
            phoneUrl,
          );
        } catch (callError) {
          console.error(
            "FIXXAM_MARKET_CHAT_CALL_ERROR:",
            callError,
          );

          Alert.alert(
            "Unable to call",
            "Something went wrong while trying to call the store.",
          );
        }
      },
      [
        storePhone,
      ],
    );

  /* ============================================================
     DELETE CUSTOMER'S OWN MESSAGES
  ============================================================ */

  const deleteMyMessages =
    useCallback(async () => {
      if (
        deleting ||
        sending
      ) {
        return;
      }

      if (!currentUserId) {
        Alert.alert(
          "Sign in required",
          "Please sign in again.",
        );

        return;
      }

      if (!chatRoomId) {
        Alert.alert(
          "Chat unavailable",
          "The chat room could not be found.",
        );

        return;
      }

      setDeleting(true);
      setMenuVisible(false);
      setError("");

      try {
        const messagesRef =
          collection(
            db,
            "marketChats",
            chatRoomId,
            "messages",
          );

        /*
         * IMPORTANT:
         *
         * We query ONLY messages where
         * senderId == current customer.
         *
         * Seller messages are never selected.
         */

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
          Alert.alert(
            "Nothing to delete",
            "You don't have any messages in this chat.",
          );

          return;
        }

        /*
         * Firestore batch maximum is 500.
         *
         * Keep it below the limit to leave room
         * for future changes.
         */

        for (
          let index = 0;
          index <
          snapshot.docs.length;
          index +=
            DELETE_BATCH_SIZE
        ) {
          const batch =
            writeBatch(db);

          const chunk =
            snapshot.docs.slice(
              index,
              index +
                DELETE_BATCH_SIZE,
            );

          chunk.forEach(
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

        /*
         * Do NOT delete:
         *
         * marketChats/{orderId}
         *
         * because the room is shared
         * between Customer and Seller.
         */

        setMessages(
          (currentMessages) =>
            currentMessages.filter(
              (message) =>
                message.senderId !==
                currentUserId,
            ),
        );

        setText("");

        Alert.alert(
          "Messages Deleted",
          "Your messages have been deleted. The store's messages are still available.",
        );
      } catch (deleteError) {
        console.error(
          "FIXXAM_MARKET_CHAT_DELETE_OWN_MESSAGES_ERROR:",
          deleteError,
        );

        setError(
          "Unable to delete your messages.",
        );

        Alert.alert(
          "Unable to delete",
          "Something went wrong while deleting your messages.",
        );
      } finally {
        setDeleting(false);
      }
    }, [
      chatRoomId,
      currentUserId,
      deleting,
      sending,
    ]);

  /* ============================================================
     DELETE CONFIRMATION
  ============================================================ */

  const handleDeleteChat =
    useCallback(() => {
      if (
        deleting ||
        sending
      ) {
        return;
      }

      setMenuVisible(false);

      Alert.alert(
        "Delete My Messages?",
        "Only the messages you sent will be permanently deleted. The store's messages will remain.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress:
              deleteMyMessages,
          },
        ],
      );
    }, [
      deleteMyMessages,
      deleting,
      sending,
    ]);

  /* ============================================================
     BACK
  ============================================================ */

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

  /* ============================================================
     INPUT FOCUS
  ============================================================ */

  const handleInputFocus =
    useCallback(() => {
      requestAnimationFrame(() => {
        scrollToBottom(
          true,
        );
      });
    }, [
      scrollToBottom,
    ]);

  /* ============================================================
     INVALID ORDER ID
  ============================================================ */

  if (!orderId) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />

        <View
          style={
            styles.center
          }
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={42}
            color="#94A3B8"
          />

          <AppText
            weight="bold"
            style={
              styles.errorTitle
            }
          >
            Chat unavailable
          </AppText>

          <AppText
            style={
              styles.errorText
            }
          >
            This chat room is missing
            the order information.
          </AppText>

          <Pressable
            onPress={
              handleBack
            }
            style={
              styles.backButton
            }
          >
            <AppText
              weight="bold"
              style={
                styles.backButtonText
              }
            >
              GO BACK
            </AppText>
          </Pressable>
        </View>
      </>
    );
  }

  /* ============================================================
     ORDER ERROR
  ============================================================ */

  if (
    !orderLoading &&
    !order
  ) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: false,
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
            <Ionicons
              name="alert-circle-outline"
              size={30}
              color="#DC2626"
            />
          </View>

          <AppText
            weight="bold"
            style={
              styles.errorTitle
            }
          >
            Chat unavailable
          </AppText>

          <AppText
            style={
              styles.errorText
            }
          >
            {error ||
              "Unable to load this order."}
          </AppText>

          <Pressable
            onPress={
              handleBack
            }
            style={
              styles.backButton
            }
          >
            <AppText
              weight="bold"
              style={
                styles.backButtonText
              }
            >
              GO BACK
            </AppText>
          </Pressable>
        </View>
      </>
    );
  }

  /* ============================================================
     SCREEN
  ============================================================ */

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
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
          0
        }
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
            onPress={
              handleBack
            }
            disabled={
              sending ||
              deleting
            }
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [
              styles.headerButton,
              pressed &&
                styles.headerPressed,
              (sending ||
                deleting) &&
                styles.disabled,
            ]}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#0F172A"
            />
          </Pressable>

          <View
            style={
              styles.headerInfo
            }
          >
            <AppText
              weight="bold"
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
              <View
                style={
                  styles.onlineDot
                }
              />

              <AppText
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

          <View
            style={
              styles.headerIcon
            }
          >
            <Ionicons
              name="storefront-outline"
              size={20}
              color="#2563EB"
            />
          </View>

          <Pressable
            onPress={() =>
              setMenuVisible(
                true,
              )
            }
            disabled={
              sending ||
              deleting
            }
            accessibilityRole="button"
            accessibilityLabel="Chat menu"
            style={({ pressed }) => [
              styles.menuButton,
              pressed &&
                styles.headerPressed,
              (sending ||
                deleting) &&
                styles.disabled,
            ]}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={21}
              color="#0F172A"
            />
          </Pressable>
        </View>

        {/* ======================================================
            CHAT AREA
        ====================================================== */}

        <View
          style={
            styles.chatContainer
          }
        >
          {orderLoading ? (
            <View
              style={
                styles.orderLoading
              }
            >
              <ActivityIndicator
                size="small"
                color="#2563EB"
              />
            </View>
          ) : null}

          {!orderLoading &&
          order ? (
            <OrderSummary
              orderId={
                orderId
              }
              items={
                orderItems
              }
              total={
                orderTotal
              }
            />
          ) : null}

          {loading ? (
            <View
              style={
                styles.center
              }
            >
              <ActivityIndicator
                size="small"
                color="#2563EB"
              />

              <AppText
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
              keyExtractor={(
                item,
              ) =>
                item.id
              }
              renderItem={({
                item,
              }) => (
                <MessageBubble
                  message={
                    item
                  }
                  isMine={
                    item.senderId ===
                    currentUserId
                  }
                />
              )}
              contentContainerStyle={[
                styles.messagesContent,
                messages.length ===
                  0 &&
                  styles.emptyMessages,
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
                <EmptyChat />
              }
            />
          )}
        </View>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error ? (
          <View
            style={
              styles.errorBar
            }
          >
            <Ionicons
              name="warning-outline"
              size={15}
              color="#DC2626"
            />

            <AppText
              style={
                styles.errorBarText
              }
            >
              {error}
            </AppText>
          </View>
        ) : null}

        {/* ======================================================
            INPUT
        ====================================================== */}

        <View
          style={
            styles.inputArea
          }
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
              onChangeText={(value) => {
                if (
                  value.length <=
                  MAX_MESSAGE_LENGTH
                ) {
                  setText(
                    value,
                  );
                }
              }}
              onFocus={
                handleInputFocus
              }
              placeholder="Type a message..."
              placeholderTextColor="#94A3B8"
              multiline
              maxLength={
                MAX_MESSAGE_LENGTH
              }
              editable={
                !sending &&
                !deleting &&
                !orderLoading
              }
              blurOnSubmit={
                false
              }
              returnKeyType="default"
              textAlignVertical="center"
              autoCorrect
              autoCapitalize="sentences"
              style={
                styles.input
              }
            />

            <Pressable
              onPress={
                handleSend
              }
              disabled={
                sending ||
                deleting ||
                !text.trim() ||
                orderLoading
              }
              accessibilityRole="button"
              accessibilityLabel="Send message"
              accessibilityState={{
                disabled:
                  sending ||
                  deleting ||
                  !text.trim() ||
                  orderLoading,
                busy:
                  sending,
              }}
              style={({ pressed }) => [
                styles.sendButton,

                (!text.trim() ||
                  sending ||
                  deleting ||
                  orderLoading) &&
                  styles.sendDisabled,

                pressed &&
                  text.trim() &&
                  !sending &&
                  !deleting &&
                  styles.sendPressed,
              ]}
            >
              {sending ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Ionicons
                  name="send"
                  size={18}
                  color="#FFFFFF"
                />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* ========================================================
          CHAT MENU
      ======================================================== */}

      <ChatMenu
        visible={
          menuVisible
        }
        busy={
          sending ||
          deleting
        }
        hasPhone={
          Boolean(
            storePhone,
          )
        }
        deleting={
          deleting
        }
        onClose={() =>
          setMenuVisible(
            false,
          )
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

/* ==============================================================
   ORDER SUMMARY
============================================================== */

const OrderSummary =
  memo(
    ({
      orderId,
      items,
      total,
    }: {
      orderId: string;
      items: OrderItem[];
      total: number;
    }) => {
      return (
        <View
          style={
            styles.orderSummary
          }
        >
          <View
            style={
              styles.orderSummaryHeader
            }
          >
            <View
              style={
                styles.orderHeaderInfo
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.orderSummaryTitle
                }
              >
                Order items
              </AppText>

              <AppText
                style={
                  styles.orderSummarySubtitle
                }
              >
                #{shortOrderId(
                  orderId,
                )}
              </AppText>
            </View>

            <View
              style={
                styles.orderCount
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.orderCountText
                }
              >
                {items.length}
              </AppText>

              <AppText
                style={
                  styles.orderCountLabel
                }
              >
                {items.length ===
                1
                  ? "item"
                  : "items"}
              </AppText>
            </View>
          </View>

          {items.length ===
          0 ? (
            <View
              style={
                styles.noItems
              }
            >
              <Ionicons
                name="cube-outline"
                size={20}
                color="#94A3B8"
              />

              <AppText
                style={
                  styles.noItemsText
                }
              >
                No item information
                available.
              </AppText>
            </View>
          ) : (
            items.map(
              (item) => (
                <View
                  key={
                    item.id
                  }
                  style={
                    styles.orderItem
                  }
                >
                  {item.image ? (
                    <Image
                      source={{
                        uri: item.image,
                      }}
                      style={
                        styles.orderItemImage
                      }
                    />
                  ) : (
                    <View
                      style={
                        styles.orderItemPlaceholder
                      }
                    >
                      <Ionicons
                        name="cube-outline"
                        size={20}
                        color="#2563EB"
                      />
                    </View>
                  )}

                  <View
                    style={
                      styles.orderItemInfo
                    }
                  >
                    <AppText
                      weight="bold"
                      numberOfLines={
                        1
                      }
                      style={
                        styles.orderItemName
                      }
                    >
                      {
                        item.name
                      }
                    </AppText>

                    <AppText
                      style={
                        styles.orderItemQuantity
                      }
                    >
                      ₦
                      {item.price.toLocaleString(
                        "en-NG",
                      )}{" "}
                      ×{" "}
                      {
                        item.quantity
                      }
                    </AppText>
                  </View>

                  <AppText
                    weight="bold"
                    style={
                      styles.orderItemTotal
                    }
                  >
                    ₦
                    {(
                      item.price *
                      item.quantity
                    ).toLocaleString(
                      "en-NG",
                    )}
                  </AppText>
                </View>
              ),
            )
          )}

          <View
            style={
              styles.orderTotalRow
            }
          >
            <AppText
              weight="bold"
              style={
                styles.orderTotalLabel
              }
            >
              Order total
            </AppText>

            <AppText
              weight="bold"
              style={
                styles.orderTotalValue
              }
            >
              ₦
              {total.toLocaleString(
                "en-NG",
              )}
            </AppText>
          </View>
        </View>
      );
    },
  );

OrderSummary.displayName =
  "OrderSummary";

/* ==============================================================
   MESSAGE BUBBLE
============================================================== */

const MessageBubble =
  memo(
    ({
      message,
      isMine,
    }: {
      message: ChatMessage;
      isMine: boolean;
    }) => {
      return (
        <View
          style={[
            styles.messageRow,
            isMine &&
              styles.messageRowMine,
          ]}
        >
          <View
            style={[
              styles.messageBubble,
              isMine
                ? styles.myBubble
                : styles.sellerBubble,
            ]}
          >
            <AppText
              style={[
                styles.messageText,
                isMine
                  ? styles.myMessageText
                  : styles.sellerMessageText,
              ]}
            >
              {
                message.text
              }
            </AppText>

            {message.createdAt >
            0 ? (
              <AppText
                style={[
                  styles.messageTime,
                  isMine
                    ? styles.myMessageTime
                    : styles.sellerMessageTime,
                ]}
              >
                {formatTime(
                  message.createdAt,
                )}
              </AppText>
            ) : null}
          </View>
        </View>
      );
    },
  );

MessageBubble.displayName =
  "MessageBubble";

/* ==============================================================
   EMPTY CHAT
============================================================== */

const EmptyChat =
  memo(() => {
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
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={30}
            color="#2563EB"
          />
        </View>

        <AppText
          weight="bold"
          style={
            styles.emptyTitle
          }
        >
          Start a conversation
        </AppText>

        <AppText
          style={
            styles.emptyText
          }
        >
          Send a message to the
          store about this order.
        </AppText>
      </View>
    );
  });

EmptyChat.displayName =
  "EmptyChat";

/* ==============================================================
   CHAT MENU
============================================================== */

const ChatMenu =
  memo(
    ({
      visible,
      busy,
      hasPhone,
      deleting,
      onClose,
      onCall,
      onDelete,
    }: {
      visible: boolean;
      busy: boolean;
      hasPhone: boolean;
      deleting: boolean;
      onClose: () => void;
      onCall: () => void;
      onDelete: () => void;
    }) => {
      return (
        <Modal
          visible={
            visible
          }
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={
            onClose
          }
        >
          <Pressable
            style={
              styles.menuOverlay
            }
            onPress={
              onClose
            }
          >
            <Pressable
              style={
                styles.menuCard
              }
              onPress={(event) =>
                event.stopPropagation()
              }
            >
              <View
                style={
                  styles.menuHeader
                }
              >
                <AppText
                  weight="bold"
                  style={
                    styles.menuTitle
                  }
                >
                  Chat Options
                </AppText>

                <Pressable
                  onPress={
                    onClose
                  }
                  style={
                    styles.menuClose
                  }
                >
                  <Ionicons
                    name="close"
                    size={19}
                    color="#0F172A"
                  />
                </Pressable>
              </View>

              {/* CALL STORE */}

              <Pressable
                onPress={
                  onCall
                }
                disabled={
                  busy ||
                  !hasPhone
                }
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed &&
                    styles.menuItemPressed,
                  (!hasPhone ||
                    busy) &&
                    styles.menuItemDisabled,
                ]}
              >
                <View
                  style={[
                    styles.menuIcon,
                    styles.callIcon,
                  ]}
                >
                  <Ionicons
                    name="call-outline"
                    size={19}
                    color="#16A34A"
                  />
                </View>

                <View
                  style={
                    styles.menuItemInfo
                  }
                >
                  <AppText
                    weight="bold"
                    style={
                      styles.menuItemTitle
                    }
                  >
                    Call Store
                  </AppText>

                  <AppText
                    style={
                      styles.menuItemSubtitle
                    }
                  >
                    {hasPhone
                      ? "Call the store directly"
                      : "Store phone unavailable"}
                  </AppText>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={17}
                  color="#94A3B8"
                />
              </Pressable>

              {/* DELETE MY MESSAGES */}

              <Pressable
                onPress={
                  onDelete
                }
                disabled={
                  busy
                }
                style={({ pressed }) => [
                  styles.menuItem,
                  styles.deleteMenuItem,
                  pressed &&
                    styles.menuItemPressed,
                  busy &&
                    styles.menuItemDisabled,
                ]}
              >
                <View
                  style={[
                    styles.menuIcon,
                    styles.deleteIcon,
                  ]}
                >
                  {deleting ? (
                    <ActivityIndicator
                      size="small"
                      color="#DC2626"
                    />
                  ) : (
                    <Ionicons
                      name="trash-outline"
                      size={19}
                      color="#DC2626"
                    />
                  )}
                </View>

                <View
                  style={
                    styles.menuItemInfo
                  }
                >
                  <AppText
                    weight="bold"
                    style={
                      styles.deleteTitle
                    }
                  >
                    {deleting
                      ? "Deleting Messages..."
                      : "Delete My Messages"}
                  </AppText>

                  <AppText
                    style={
                      styles.menuItemSubtitle
                    }
                  >
                    Delete only the messages
                    you sent
                  </AppText>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={17}
                  color="#94A3B8"
                />
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      );
    },
  );

ChatMenu.displayName =
  "ChatMenu";

/* ==============================================================
   PARAM HELPER
============================================================== */

function getParamString(
  value:
    | string
    | string[]
    | undefined,
): string {
  if (
    Array.isArray(value)
  ) {
    return (
      value[0] ??
      ""
    ).trim();
  }

  return (
    value ?? ""
  ).trim();
}

/* ==============================================================
   STRING HELPER
============================================================== */

function getString(
  ...values: unknown[]
): string {
  for (const value of values) {
    if (
      typeof value ===
        "string" &&
      value.trim()
    ) {
      return value.trim();
    }

    if (
      typeof value ===
      "number"
    ) {
      return String(
        value,
      );
    }
  }

  return "";
}

/* ==============================================================
   NUMBER HELPER
============================================================== */

function getNumber(
  ...values: unknown[]
): number {
  for (const value of values) {
    if (
      typeof value ===
        "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }

    if (
      typeof value ===
        "string" &&
      value.trim()
    ) {
      const parsed =
        Number(value);

      if (
        Number.isFinite(
          parsed,
        )
      ) {
        return parsed;
      }
    }
  }

  return 0;
}

/* ==============================================================
   NORMALIZE ORDER ITEMS
============================================================== */

function normalizeOrderItems(
  value: unknown,
): OrderItem[] {
  if (
    !Array.isArray(value)
  ) {
    return [];
  }

  return value
    .map(
      (
        item,
        index,
      ) => {
        if (
          !item ||
          typeof item !==
            "object"
        ) {
          return null;
        }

        const data =
          item as Record<
            string,
            unknown
          >;

        const name =
          getString(
            data.name,
            data.productName,
            data.title,
            "Product",
          );

        const price =
          getNumber(
            data.price,
            data.unitPrice,
            data.amount,
          );

        const quantity =
          Math.max(
            1,
            Math.floor(
              getNumber(
                data.quantity,
                data.qty,
                1,
              ),
            ),
          );

        const image =
          getString(
            data.image,
            data.imageUrl,
            data.productImage,
            data.photo,
          );

        const id =
          getString(
            data.id,
            data.productId,
            data.itemId,
          );

        return {
          id:
            id ||
            `item-${index}`,

          name:
            name ||
            "Product",

          image:
            image ||
            undefined,

          price,

          quantity,
        };
      },
    )
    .filter(
      (
        item,
      ): item is OrderItem =>
        item !== null,
    );
}

/* ==============================================================
   NORMALIZE SENDER ROLE
============================================================== */

function normalizeSenderRole(
  value: unknown,
): "customer" | "seller" {
  if (
    typeof value ===
      "string" &&
    value
      .trim()
      .toLowerCase() ===
      "seller"
  ) {
    return "seller";
  }

  return "customer";
}

/* ==============================================================
   FIRESTORE TIMESTAMP
============================================================== */

function getTimestampMillis(
  value: unknown,
): number {
  if (
    typeof value ===
      "object" &&
    value !== null
  ) {
    const timestamp =
      value as {
        toMillis?: () => number;
        toDate?: () => Date;
      };

    if (
      typeof timestamp.toMillis ===
      "function"
    ) {
      return timestamp.toMillis();
    }

    if (
      typeof timestamp.toDate ===
      "function"
    ) {
      return timestamp
        .toDate()
        .getTime();
    }
  }

  if (
    typeof value ===
    "number"
  ) {
    return value;
  }

  return 0;
}

/* ==============================================================
   FORMAT TIME
============================================================== */

function formatTime(
  timestamp: number,
): string {
  if (!timestamp) {
    return "";
  }

  return new Date(
    timestamp,
  ).toLocaleTimeString(
    "en-NG",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  );
}

/* ==============================================================
   SHORT ORDER ID
============================================================== */

function shortOrderId(
  value: string,
): string {
  if (
    value.length <=
    10
  ) {
    return value;
  }

  return `${value.slice(
    0,
    5,
  )}...${value.slice(-4)}`;
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor:
        "#F8FAFC",
    },

    header: {
      minHeight: 72,
      paddingHorizontal: 12,
      paddingTop:
        Platform.OS ===
        "android"
          ? 8
          : 12,
      paddingBottom: 10,
      backgroundColor:
        "#FFFFFF",
      borderBottomWidth: 1,
      borderBottomColor:
        "#E2E8F0",
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    headerButton: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor:
        "#F1F5F9",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    headerInfo: {
      flex: 1,
      minWidth: 0,
      marginLeft: 10,
    },

    headerTitle: {
      fontSize: 15,
      color: "#0F172A",
    },

    onlineRow: {
      marginTop: 3,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 5,
    },

    onlineDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor:
        "#16A34A",
    },

    onlineText: {
      fontSize: 8,
      color: "#64748B",
    },

    headerIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 7,
    },

    menuButton: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor:
        "#F8FAFC",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    headerPressed: {
      opacity: 0.65,
      transform: [
        {
          scale: 0.96,
        },
      ],
    },

    disabled: {
      opacity: 0.45,
    },

    chatContainer: {
      flex: 1,
      minHeight: 0,
    },

    orderLoading: {
      minHeight: 35,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    messagesContent: {
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 20,
    },

    emptyMessages: {
      flexGrow: 1,
    },

    /* ========================================================
       ORDER
    ======================================================== */

    orderSummary: {
      marginHorizontal: 12,
      marginTop: 10,
      marginBottom: 4,
      padding: 12,
      borderRadius: 17,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    orderSummaryHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      marginBottom: 8,
    },

    orderHeaderInfo: {
      flex: 1,
      minWidth: 0,
    },

    orderSummaryTitle: {
      fontSize: 11.5,
      color: "#0F172A",
    },

    orderSummarySubtitle: {
      marginTop: 2,
      fontSize: 7.5,
      color: "#94A3B8",
    },

    orderCount: {
      minWidth: 42,
      paddingHorizontal: 7,
      paddingVertical: 5,
      borderRadius: 10,
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
    },

    orderCountText: {
      fontSize: 10,
      color: "#2563EB",
    },

    orderCountLabel: {
      fontSize: 6.5,
      color: "#64748B",
    },

    orderItem: {
      minHeight: 57,
      paddingVertical: 7,
      borderTopWidth: 1,
      borderTopColor:
        "#F1F5F9",
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    orderItemImage: {
      width: 42,
      height: 42,
      borderRadius: 11,
      backgroundColor:
        "#F8FAFC",
    },

    orderItemPlaceholder: {
      width: 42,
      height: 42,
      borderRadius: 11,
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    orderItemInfo: {
      flex: 1,
      minWidth: 0,
      marginLeft: 9,
    },

    orderItemName: {
      fontSize: 9.5,
      color: "#0F172A",
    },

    orderItemQuantity: {
      marginTop: 3,
      fontSize: 7.5,
      color: "#64748B",
    },

    orderItemTotal: {
      marginLeft: 8,
      fontSize: 9,
      color: "#0F172A",
    },

    orderTotalRow: {
      marginTop: 7,
      paddingTop: 9,
      borderTopWidth: 1,
      borderTopColor:
        "#E2E8F0",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    orderTotalLabel: {
      fontSize: 9,
      color: "#334155",
    },

    orderTotalValue: {
      fontSize: 12,
      color: "#2563EB",
    },

    noItems: {
      minHeight: 55,
      borderTopWidth: 1,
      borderTopColor:
        "#F1F5F9",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 7,
    },

    noItemsText: {
      fontSize: 8,
      color: "#64748B",
    },

    /* ========================================================
       MESSAGES
    ======================================================== */

    messageRow: {
      width: "100%",
      marginBottom: 9,
      alignItems:
        "flex-start",
    },

    messageRowMine: {
      alignItems:
        "flex-end",
    },

    messageBubble: {
      maxWidth: "78%",
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: 16,
    },

    sellerBubble: {
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      borderBottomLeftRadius: 5,
    },

    myBubble: {
      backgroundColor:
        "#2563EB",
      borderBottomRightRadius: 5,
    },

    messageText: {
      fontSize: 10,
      lineHeight: 15,
    },

    sellerMessageText: {
      color: "#334155",
    },

    myMessageText: {
      color: "#FFFFFF",
    },

    messageTime: {
      marginTop: 4,
      fontSize: 6.8,
    },

    sellerMessageTime: {
      color: "#94A3B8",
    },

    myMessageTime: {
      color: "#DBEAFE",
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyContainer: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal: 40,
    },

    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    emptyTitle: {
      marginTop: 12,
      fontSize: 14,
      color: "#0F172A",
    },

    emptyText: {
      marginTop: 5,
      fontSize: 9.5,
      lineHeight: 15,
      textAlign: "center",
      color: "#64748B",
    },

    /* ========================================================
       INPUT
    ======================================================== */

    inputArea: {
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom:
        Platform.OS ===
        "ios"
          ? 20
          : 10,
      backgroundColor:
        "#FFFFFF",
      borderTopWidth: 1,
      borderTopColor:
        "#E2E8F0",
    },

    inputContainer: {
      minHeight: 48,
      maxHeight: 120,
      borderRadius: 15,
      backgroundColor:
        "#F8FAFC",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      paddingLeft: 12,
      paddingRight: 5,
      flexDirection:
        "row",
      alignItems:
        "flex-end",
    },

    input: {
      flex: 1,
      minHeight: 42,
      maxHeight: 105,
      paddingTop: 11,
      paddingBottom: 10,
      paddingHorizontal: 0,
      fontSize: 11,
      lineHeight: 16,
      color: "#0F172A",
    },

    sendButton: {
      width: 38,
      height: 38,
      marginBottom: 4,
      borderRadius: 12,
      backgroundColor:
        "#2563EB",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    sendDisabled: {
      opacity: 0.45,
    },

    sendPressed: {
      opacity: 0.8,
      transform: [
        {
          scale: 0.96,
        },
      ],
    },

    /* ========================================================
       ERROR
    ======================================================== */

    errorBar: {
      marginHorizontal: 12,
      marginBottom: 6,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor:
        "#FEF2F2",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 6,
    },

    errorBarText: {
      flex: 1,
      fontSize: 8,
      color: "#B91C1C",
    },

    /* ========================================================
       CENTER
    ======================================================== */

    center: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal: 30,
    },

    loadingText: {
      marginTop: 8,
      fontSize: 9,
      color: "#64748B",
    },

    errorIcon: {
      width: 60,
      height: 60,
      borderRadius: 19,
      backgroundColor:
        "#FEF2F2",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    errorTitle: {
      marginTop: 12,
      fontSize: 15,
      color: "#0F172A",
    },

    errorText: {
      marginTop: 6,
      fontSize: 9.5,
      lineHeight: 15,
      textAlign: "center",
      color: "#64748B",
    },

    backButton: {
      marginTop: 16,
      minHeight: 44,
      paddingHorizontal: 18,
      borderRadius: 12,
      backgroundColor:
        "#2563EB",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    backButtonText: {
      fontSize: 9,
      color: "#FFFFFF",
    },

    /* ========================================================
       MENU
    ======================================================== */

    menuOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(15,23,42,0.38)",
      justifyContent:
        "flex-start",
      alignItems:
        "flex-end",
      paddingTop:
        Platform.OS ===
        "android"
          ? 62
          : 86,
      paddingRight: 12,
    },

    menuCard: {
      width: 285,
      borderRadius: 18,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      overflow: "hidden",
      shadowColor:
        "#000000",
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.12,
      shadowRadius: 18,
      elevation: 8,
    },

    menuHeader: {
      minHeight: 54,
      paddingHorizontal: 14,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      borderBottomWidth: 1,
      borderBottomColor:
        "#F1F5F9",
    },

    menuTitle: {
      fontSize: 13,
      color: "#0F172A",
    },

    menuClose: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor:
        "#F1F5F9",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    menuItem: {
      minHeight: 70,
      paddingHorizontal: 14,
      flexDirection:
        "row",
      alignItems:
        "center",
      borderBottomWidth: 1,
      borderBottomColor:
        "#F1F5F9",
    },

    deleteMenuItem: {
      borderBottomWidth: 0,
    },

    menuItemPressed: {
      backgroundColor:
        "#F8FAFC",
    },

    menuItemDisabled: {
      opacity: 0.45,
    },

    menuIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    callIcon: {
      backgroundColor:
        "#ECFDF5",
    },

    deleteIcon: {
      backgroundColor:
        "#FEF2F2",
    },

    menuItemInfo: {
      flex: 1,
      minWidth: 0,
      marginLeft: 10,
      marginRight: 8,
    },

    menuItemTitle: {
      fontSize: 10.5,
      color: "#0F172A",
    },

    deleteTitle: {
      fontSize: 10.5,
      color: "#DC2626",
    },

    menuItemSubtitle: {
      marginTop: 3,
      fontSize: 8,
      lineHeight: 12,
      color: "#64748B",
    },
  });