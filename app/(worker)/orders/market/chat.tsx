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

import { AppText } from "@/components/ui";

import {
  auth,
  db,
} from "@/firebase/config";

/* ============================================================
   TYPES
============================================================ */

type ChatMessage = {
  id: string;
  senderId: string;
  senderRole: "customer" | "worker";
  text: string;
  createdAt: number;
};

type MessageDocument = {
  senderId?: unknown;
  senderRole?: unknown;
  text?: unknown;
  createdAt?: unknown;
};

type OrderData = {
  id: string;

  customerId?: string;
  customerName?: string;
  customerPhone?: string;

  receiverName?: string;
  receiverPhone?: string;

  workerId?: string;

  storeId?: string;
  storeName?: string;

  address?: string;
  deliveryAddress?: string;
  location?: string;

  total?: number;
  subtotal?: number;
  deliveryFee?: number;

  status?: string;

  items?: unknown[];
  products?: unknown[];

  [key: string]: unknown;
};

type ChatParams = {
  orderId?: string | string[];
};

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
};

const DELETE_BATCH_SIZE = 450;

/* ============================================================
   HELPERS
============================================================ */

function getParam(
  value: string | string[] | undefined,
): string {
  if (Array.isArray(value)) {
    return (value[0] ?? "").trim();
  }

  return (value ?? "").trim();
}

function getString(
  ...values: unknown[]
): string {
  for (const value of values) {
    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return String(value);
    }
  }

  return "";
}

function getNumber(
  ...values: unknown[]
): number {
  for (const value of values) {
    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return 0;
}

function formatMoney(
  value: number,
): string {
  return `₦${value.toLocaleString(
    "en-NG",
  )}`;
}

function normalizeRole(
  value: unknown,
): "customer" | "worker" {
  if (
    typeof value === "string" &&
    value.trim().toLowerCase() ===
      "worker"
  ) {
    return "worker";
  }

  return "customer";
}

function getTimestampMillis(
  value: unknown,
): number {
  if (
    value &&
    typeof value === "object"
  ) {
    const timestamp =
      value as {
        toMillis?: () => number;
      };

    if (
      typeof timestamp.toMillis ===
      "function"
    ) {
      return timestamp.toMillis();
    }
  }

  if (
    typeof value === "number"
  ) {
    return value;
  }

  return 0;
}

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

function shortOrderId(
  value: string,
): string {
  if (value.length <= 10) {
    return value;
  }

  return `${value.slice(
    0,
    5,
  )}...${value.slice(-4)}`;
}

/* ============================================================
   NORMALIZE ITEMS
============================================================ */

function normalizeItems(
  value: unknown,
): OrderItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (
        !item ||
        typeof item !== "object"
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

      const price =
        getNumber(
          data.price,
          data.unitPrice,
          data.amount,
        );

      return {
        id:
          getString(
            data.id,
            data.productId,
          ) ||
          `item-${index}`,

        name,
        quantity,
        price,

        image:
          getString(
            data.image,
            data.imageUrl,
            data.photo,
          ) || undefined,
      };
    })
    .filter(
      (
        item,
      ): item is OrderItem =>
        item !== null,
    );
}

/* ============================================================
   SCREEN
============================================================ */

export default function WorkerMarketOrderChatRoom() {
  const params =
    useLocalSearchParams<ChatParams>();

  const orderId =
    useMemo(
      () =>
        getParam(
          params.orderId,
        ),
      [params.orderId],
    );

  const currentUserId =
    auth.currentUser?.uid ?? "";

  const [
    order,
    setOrder,
  ] =
    useState<OrderData | null>(
      null,
    );

  const [
    messages,
    setMessages,
  ] =
    useState<ChatMessage[]>([]);

  const [
    text,
    setText,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadingOrder,
    setLoadingOrder,
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

  const [
    itemsVisible,
    setItemsVisible,
  ] = useState(false);

  const listRef =
    useRef<
      FlatList<ChatMessage>
    >(null);

  const chatRoomId = orderId;

  /* ==========================================================
     LOAD ORDER
  ========================================================== */

  useEffect(() => {
    if (
      !orderId ||
      !currentUserId
    ) {
      setLoadingOrder(false);
      return;
    }

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
            setLoadingOrder(false);
            setError(
              "Order not found.",
            );
            return;
          }

          const data =
            snapshot.data();

          const workerId =
            getString(
              data.workerId,
            );

          if (
            workerId &&
            workerId !==
              currentUserId
          ) {
            setOrder(null);
            setLoadingOrder(false);
            setError(
              "You are not assigned to this order.",
            );
            return;
          }

          setOrder({
            id: snapshot.id,
            ...data,
          });

          setLoadingOrder(false);
          setError("");
        },
        (snapshotError) => {
          console.error(
            "FIXXAM_WORKER_CHAT_ORDER_ERROR:",
            snapshotError,
          );

          setOrder(null);
          setLoadingOrder(false);
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

  /* ==========================================================
     SCROLL
  ========================================================== */

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

  /* ==========================================================
     LISTEN TO CHAT
  ========================================================== */

  useEffect(() => {
    if (
      !chatRoomId ||
      !currentUserId
    ) {
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
                (
                  messageDoc,
                ) => {
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
                      normalizeRole(
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
                    .length > 0,
              );

          setMessages(
            nextMessages,
          );

          setLoading(false);

          requestAnimationFrame(() => {
            if (
              nextMessages.length
            ) {
              scrollToBottom(
                false,
              );
            }
          });
        },
        (listenerError) => {
          console.error(
            "FIXXAM_WORKER_CHAT_LISTEN_ERROR:",
            listenerError,
          );

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

  /* ==========================================================
     SEND MESSAGE
  ========================================================== */

  const handleSend =
    useCallback(async () => {
      const cleanText =
        text.trim();

      if (
        !cleanText ||
        sending ||
        deleting
      ) {
        return;
      }

      if (!currentUserId) {
        setError(
          "Please sign in again.",
        );
        return;
      }

      if (!orderId) {
        setError(
          "Order information is missing.",
        );
        return;
      }

      if (!order) {
        setError(
          "Order information is unavailable.",
        );
        return;
      }

      const assignedWorkerId =
        getString(
          order.workerId,
        );

      if (
        assignedWorkerId &&
        assignedWorkerId !==
          currentUserId
      ) {
        setError(
          "You are not assigned to this order.",
        );
        return;
      }

      setSending(true);
      setError("");

      try {
        const chatRef =
          doc(
            db,
            "marketChats",
            chatRoomId,
          );

        await setDoc(
          chatRef,
          {
            orderId,

            customerId:
              getString(
                order.customerId,
                "",
              ) || null,

            workerId:
              currentUserId,

            storeId:
              getString(
                order.storeId,
                "",
              ) || null,

            updatedAt:
              serverTimestamp(),

            lastMessage:
              cleanText,

            lastMessageSenderId:
              currentUserId,

            lastMessageSenderRole:
              "worker",
          },
          {
            merge: true,
          },
        );

        await addDoc(
          collection(
            db,
            "marketChats",
            chatRoomId,
            "messages",
          ),
          {
            senderId:
              currentUserId,

            senderRole:
              "worker",

            text:
              cleanText,

            createdAt:
              serverTimestamp(),
          },
        );

        setText("");

        requestAnimationFrame(() => {
          scrollToBottom(true);
        });
      } catch (sendError) {
        console.error(
          "FIXXAM_WORKER_CHAT_SEND_ERROR:",
          sendError,
        );

        setError(
          "Message could not be sent. Please try again.",
        );
      } finally {
        setSending(false);
      }
    }, [
      chatRoomId,
      currentUserId,
      deleting,
      order,
      orderId,
      scrollToBottom,
      sending,
      text,
    ]);

  /* ==========================================================
     CALL CUSTOMER
  ========================================================== */

  const handleCallCustomer =
    useCallback(async () => {
      setMenuVisible(false);

      const phone =
        getString(
          order?.customerPhone,
          order?.receiverPhone,
        );

      if (!phone) {
        Alert.alert(
          "Phone unavailable",
          "The customer's phone number is not available.",
        );
        return;
      }

      const phoneUrl =
        `tel:${phone}`;

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
          "FIXXAM_WORKER_CALL_CUSTOMER_ERROR:",
          callError,
        );

        Alert.alert(
          "Unable to call",
          "Something went wrong while trying to call the customer.",
        );
      }
    }, [
      order,
    ]);

  /* ==========================================================
     DELETE OWN MESSAGES
  ========================================================== */

  const confirmDeleteChat =
    useCallback(async () => {
      if (
        deleting ||
        !chatRoomId
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
         * Only query messages belonging
         * to the current Worker.
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

        if (snapshot.empty) {
          Alert.alert(
            "Nothing to delete",
            "You don't have any messages in this chat.",
          );

          return;
        }

        /*
         * Delete only Worker messages.
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
         * IMPORTANT:
         *
         * Do NOT delete:
         *
         * marketChats/{orderId}
         *
         * because Customer and Worker
         * share the same chat room.
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
          "Your messages have been deleted. The customer's messages are still available.",
        );
      } catch (deleteError) {
        console.error(
          "FIXXAM_WORKER_DELETE_OWN_MESSAGES_ERROR:",
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
    ]);

  /* ==========================================================
     DELETE CONFIRMATION
  ========================================================== */

  const handleDeleteChat =
    useCallback(() => {
      if (deleting) {
        return;
      }

      setMenuVisible(false);

      Alert.alert(
        "Delete My Messages?",
        "Only the messages you sent will be permanently deleted. The customer's messages will remain.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress:
              confirmDeleteChat,
          },
        ],
      );
    }, [
      confirmDeleteChat,
      deleting,
    ]);

  /* ==========================================================
     BACK
  ========================================================== */

  const handleBack =
    useCallback(() => {
      if (deleting) {
        return;
      }

      router.back();
    }, [
      deleting,
    ]);

  /* ==========================================================
     INPUT FOCUS
  ========================================================== */

  const handleInputFocus =
    useCallback(() => {
      requestAnimationFrame(() => {
        scrollToBottom(true);
      });
    }, [
      scrollToBottom,
    ]);

  /* ==========================================================
     ITEMS
  ========================================================== */

  const items =
    useMemo(
      () =>
        normalizeItems(
          order?.items ??
            order?.products,
        ),
      [order],
    );

  const customerName =
    getString(
      order?.customerName,
      order?.receiverName,
      "Customer",
    );

  const customerPhone =
    getString(
      order?.customerPhone,
      order?.receiverPhone,
    );

  const total =
    getNumber(
      order?.total,
    );

  /* ==========================================================
     INVALID ORDER
  ========================================================== */

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
            This chat is missing the
            order information.
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

  /* ==========================================================
     SCREEN
  ========================================================== */

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
        {/* HEADER */}

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
              deleting
            }
            style={({ pressed }) => [
              styles.headerButton,
              pressed &&
                styles.headerPressed,
              deleting &&
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
              Customer Chat
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
              name="person-outline"
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
              deleting
            }
            style={({ pressed }) => [
              styles.menuButton,
              pressed &&
                styles.headerPressed,
              deleting &&
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

        {/* CUSTOMER */}

        {!loadingOrder &&
        order ? (
          <View
            style={
              styles.customerBar
            }
          >
            <View
              style={
                styles.customerAvatar
              }
            >
              <Ionicons
                name="person"
                size={20}
                color="#2563EB"
              />
            </View>

            <View
              style={
                styles.customerInfo
              }
            >
              <AppText
                weight="bold"
                numberOfLines={1}
                style={
                  styles.customerName
                }
              >
                {customerName}
              </AppText>

              <AppText
                style={
                  styles.customerPhone
                }
              >
                {customerPhone ||
                  "Phone unavailable"}
              </AppText>
            </View>

            <Pressable
              onPress={() =>
                setItemsVisible(
                  true,
                )
              }
              style={
                styles.itemsButton
              }
            >
              <Ionicons
                name="bag-handle-outline"
                size={17}
                color="#2563EB"
              />

              <AppText
                weight="bold"
                style={
                  styles.itemsButtonText
                }
              >
                ITEMS
              </AppText>
            </Pressable>
          </View>
        ) : null}

        {/* CHAT */}

        <View
          style={
            styles.chatContainer
          }
        >
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
              onContentSizeChange={() =>
                messages.length > 0 &&
                scrollToBottom(
                  false,
                )
              }
              ListEmptyComponent={
                <EmptyChat />
              }
            />
          )}
        </View>

        {/* ERROR */}

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

        {/* INPUT */}

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
              onChangeText={
                setText
              }
              onFocus={
                handleInputFocus
              }
              placeholder="Reply to customer..."
              placeholderTextColor="#94A3B8"
              multiline
              maxLength={1000}
              editable={
                !sending &&
                !deleting &&
                !loadingOrder
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
                loadingOrder
              }
              style={({ pressed }) => [
                styles.sendButton,

                (!text.trim() ||
                  sending ||
                  deleting ||
                  loadingOrder) &&
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

      {/* MENU */}

      <ChatMenu
        visible={
          menuVisible
        }
        deleting={
          deleting
        }
        hasPhone={
          Boolean(
            customerPhone,
          )
        }
        onClose={() =>
          setMenuVisible(
            false,
          )
        }
        onCall={
          handleCallCustomer
        }
        onDelete={
          handleDeleteChat
        }
      />

      {/* ITEMS */}

      <OrderItemsModal
        visible={
          itemsVisible
        }
        items={
          items
        }
        total={
          total
        }
        customerName={
          customerName
        }
        onClose={() =>
          setItemsVisible(
            false,
          )
        }
      />
    </>
  );
}

/* ============================================================
   MESSAGE BUBBLE
============================================================ */

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
                : styles.customerBubble,
            ]}
          >
            <AppText
              style={[
                styles.messageText,
                isMine
                  ? styles.myMessageText
                  : styles.customerMessageText,
              ]}
            >
              {message.text}
            </AppText>

            {message.createdAt >
            0 ? (
              <AppText
                style={[
                  styles.messageTime,
                  isMine
                    ? styles.myMessageTime
                    : styles.customerMessageTime,
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
  "WorkerMessageBubble";

/* ============================================================
   EMPTY CHAT
============================================================ */

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
          Send a message to the customer
          about this order.
        </AppText>
      </View>
    );
  });

EmptyChat.displayName =
  "WorkerEmptyChat";

/* ============================================================
   CHAT MENU
============================================================ */

const ChatMenu =
  memo(
    ({
      visible,
      deleting,
      hasPhone,
      onClose,
      onCall,
      onDelete,
    }: {
      visible: boolean;
      deleting: boolean;
      hasPhone: boolean;
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

              {/* CALL */}

              <Pressable
                onPress={
                  onCall
                }
                disabled={
                  deleting ||
                  !hasPhone
                }
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed &&
                    styles.menuItemPressed,
                  (!hasPhone ||
                    deleting) &&
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
                    Call Customer
                  </AppText>

                  <AppText
                    style={
                      styles.menuItemSubtitle
                    }
                  >
                    {hasPhone
                      ? "Call the customer directly"
                      : "Customer phone unavailable"}
                  </AppText>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={17}
                  color="#94A3B8"
                />
              </Pressable>

              {/* DELETE OWN */}

              <Pressable
                onPress={
                  onDelete
                }
                disabled={
                  deleting
                }
                style={({ pressed }) => [
                  styles.menuItem,
                  styles.deleteMenuItem,
                  pressed &&
                    styles.menuItemPressed,
                  deleting &&
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
  "WorkerChatMenu";

/* ============================================================
   ORDER ITEMS MODAL
============================================================ */

const OrderItemsModal =
  memo(
    ({
      visible,
      items,
      total,
      customerName,
      onClose,
    }: {
      visible: boolean;
      items: OrderItem[];
      total: number;
      customerName: string;
      onClose: () => void;
    }) => {
      return (
        <Modal
          visible={
            visible
          }
          transparent
          animationType="slide"
          onRequestClose={
            onClose
          }
        >
          <View
            style={
              styles.itemsOverlay
            }
          >
            <View
              style={
                styles.itemsCard
              }
            >
              <View
                style={
                  styles.itemsHeader
                }
              >
                <View
                  style={
                    styles.itemsHeaderInfo
                  }
                >
                  <AppText
                    weight="bold"
                    style={
                      styles.itemsTitle
                    }
                  >
                    Order Items
                  </AppText>

                  <AppText
                    style={
                      styles.itemsSubtitle
                    }
                  >
                    {customerName}
                  </AppText>
                </View>

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

              {items.length ===
              0 ? (
                <View
                  style={
                    styles.noItems
                  }
                >
                  <Ionicons
                    name="bag-outline"
                    size={30}
                    color="#94A3B8"
                  />

                  <AppText
                    style={
                      styles.noItemsText
                    }
                  >
                    No order items
                    available.
                  </AppText>
                </View>
              ) : (
                <FlatList
                  data={
                    items
                  }
                  keyExtractor={(
                    item,
                  ) =>
                    item.id
                  }
                  showsVerticalScrollIndicator={
                    false
                  }
                  contentContainerStyle={
                    styles.itemsList
                  }
                  renderItem={({
                    item,
                  }) => (
                    <View
                      style={
                        styles.itemRow
                      }
                    >
                      <View
                        style={
                          styles.itemIcon
                        }
                      >
                        <Ionicons
                          name="cube-outline"
                          size={20}
                          color="#2563EB"
                        />
                      </View>

                      <View
                        style={
                          styles.itemInfo
                        }
                      >
                        <AppText
                          weight="bold"
                          numberOfLines={
                            2
                          }
                          style={
                            styles.itemName
                          }
                        >
                          {
                            item.name
                          }
                        </AppText>

                        <AppText
                          style={
                            styles.itemQuantity
                          }
                        >
                          Qty:{" "}
                          {
                            item.quantity
                          }
                        </AppText>
                      </View>

                      <AppText
                        weight="bold"
                        style={
                          styles.itemPrice
                        }
                      >
                        {formatMoney(
                          item.price *
                            item.quantity,
                        )}
                      </AppText>
                    </View>
                  )}
                />
              )}

              <View
                style={
                  styles.itemsTotal
                }
              >
                <AppText
                  weight="bold"
                  style={
                    styles.itemsTotalLabel
                  }
                >
                  Order Total
                </AppText>

                <AppText
                  weight="bold"
                  style={
                    styles.itemsTotalValue
                  }
                >
                  {formatMoney(
                    total,
                  )}
                </AppText>
              </View>

              <Pressable
                onPress={
                  onClose
                }
                style={
                  styles.closeItemsButton
                }
              >
                <AppText
                  weight="bold"
                  style={
                    styles.closeItemsText
                  }
                >
                  CLOSE
                </AppText>
              </Pressable>
            </View>
          </View>
        </Modal>
      );
    },
  );

OrderItemsModal.displayName =
  "WorkerOrderItemsModal";

/* ============================================================
   STYLES
============================================================ */

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

    customerBar: {
      minHeight: 66,
      paddingHorizontal: 13,
      paddingVertical: 9,
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

    customerAvatar: {
      width: 43,
      height: 43,
      borderRadius: 13,
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    customerInfo: {
      flex: 1,
      minWidth: 0,
      marginLeft: 10,
    },

    customerName: {
      fontSize: 11.5,
      color: "#0F172A",
    },

    customerPhone: {
      marginTop: 3,
      fontSize: 8,
      color: "#64748B",
    },

    itemsButton: {
      minHeight: 38,
      paddingHorizontal: 10,
      borderRadius: 11,
      backgroundColor:
        "#EFF6FF",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 5,
    },

    itemsButtonText: {
      fontSize: 8,
      color: "#2563EB",
    },

    chatContainer: {
      flex: 1,
      minHeight: 0,
    },

    messagesContent: {
      paddingHorizontal: 14,
      paddingTop: 16,
      paddingBottom: 20,
    },

    emptyMessages: {
      flexGrow: 1,
    },

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

    customerBubble: {
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

    customerMessageText: {
      color: "#334155",
    },

    myMessageText: {
      color: "#FFFFFF",
    },

    messageTime: {
      marginTop: 4,
      fontSize: 6.8,
    },

    customerMessageTime: {
      color: "#94A3B8",
    },

    myMessageTime: {
      color: "#DBEAFE",
    },

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

    disabled: {
      opacity: 0.45,
    },

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

    itemsOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(15,23,42,0.4)",
      justifyContent:
        "flex-end",
    },

    itemsCard: {
      maxHeight: "78%",
      minHeight: 320,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      backgroundColor:
        "#FFFFFF",
      paddingTop: 8,
      paddingBottom:
        Platform.OS ===
        "ios"
          ? 28
          : 14,
    },

    itemsHeader: {
      minHeight: 64,
      paddingHorizontal: 16,
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

    itemsHeaderInfo: {
      flex: 1,
      minWidth: 0,
    },

    itemsTitle: {
      fontSize: 16,
      color: "#0F172A",
    },

    itemsSubtitle: {
      marginTop: 3,
      fontSize: 8.5,
      color: "#64748B",
    },

    itemsList: {
      paddingHorizontal: 14,
      paddingVertical: 10,
    },

    itemRow: {
      minHeight: 62,
      paddingVertical: 9,
      borderBottomWidth: 1,
      borderBottomColor:
        "#F1F5F9",
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    itemIcon: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    itemInfo: {
      flex: 1,
      minWidth: 0,
      marginLeft: 10,
    },

    itemName: {
      fontSize: 10.5,
      lineHeight: 15,
      color: "#0F172A",
    },

    itemQuantity: {
      marginTop: 3,
      fontSize: 8,
      color: "#64748B",
    },

    itemPrice: {
      marginLeft: 8,
      fontSize: 10,
      color: "#2563EB",
    },

    noItems: {
      flex: 1,
      minHeight: 220,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    noItemsText: {
      marginTop: 8,
      fontSize: 9,
      color: "#64748B",
    },

    itemsTotal: {
      marginHorizontal: 14,
      paddingTop: 13,
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

    itemsTotalLabel: {
      fontSize: 12,
      color: "#0F172A",
    },

    itemsTotalValue: {
      fontSize: 18,
      color: "#2563EB",
    },

    closeItemsButton: {
      minHeight: 46,
      marginHorizontal: 14,
      marginTop: 12,
      borderRadius: 14,
      backgroundColor:
        "#2563EB",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    closeItemsText: {
      fontSize: 9,
      color: "#FFFFFF",
    },
  });