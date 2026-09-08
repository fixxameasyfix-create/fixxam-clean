import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  StyleSheet,
  View,
} from "react-native";

import {
  Stack,
  router,
  useLocalSearchParams,
} from "expo-router";

import Toast from "react-native-toast-message";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import {
  AppButton,
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import type {
  AppIconName,
} from "@/components/ui/AppIcon";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import {
  auth,
  db,
} from "@/firebase/config";

import WorkerMarketChatHeader from "@/components/orders/market-chat/WorkerMarketChatHeader";

import WorkerMarketCustomerBar from "@/components/orders/market-chat/WorkerMarketCustomerBar";

import WorkerMarketMessageList, {
  type WorkerMarketChatMessage,
} from "@/components/orders/market-chat/WorkerMarketMessageList";

import WorkerMarketChatInput from "@/components/orders/market-chat/WorkerMarketChatInput";

import WorkerMarketChatMenu from "@/components/orders/market-chat/WorkerMarketChatMenu";

import WorkerMarketOrderItemsModal, {
  type WorkerMarketOrderItem,
} from "@/components/orders/market-chat/WorkerMarketOrderItemsModal";

/* ==============================================================
   TYPES
============================================================== */

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

  totalAmount?: number;

  subtotal?: number;

  deliveryFee?: number;

  status?: string;

  items?: unknown[];

  products?: unknown[];
};

type ChatParams = {
  orderId?:
    | string
    | string[];
};

/* ==============================================================
   CONSTANTS
============================================================== */

const DELETE_BATCH_SIZE =
  450;

/* ==============================================================
   HELPERS
============================================================== */

function getParam(
  value:
    | string
    | string[]
    | undefined,
): string {
  if (
    Array.isArray(
      value,
    )
  ) {
    return (
      value[0] ??
      ""
    ).trim();
  }

  return (
    value ??
    ""
  ).trim();
}

function getString(
  ...values: unknown[]
): string {
  for (
    const value of values
  ) {
    if (
      typeof value ===
        "string" &&
      value.trim()
    ) {
      return value.trim();
    }

    if (
      typeof value ===
        "number" &&
      Number.isFinite(
        value,
      )
    ) {
      return String(
        value,
      );
    }
  }

  return "";
}

function getNumber(
  ...values: unknown[]
): number {
  for (
    const value of values
  ) {
    if (
      typeof value ===
        "number" &&
      Number.isFinite(
        value,
      )
    ) {
      return value;
    }

    if (
      typeof value ===
        "string" &&
      value.trim()
    ) {
      const parsed =
        Number(
          value,
        );

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

function normalizeRole(
  value: unknown,
):
  | "customer"
  | "worker" {
  if (
    typeof value ===
      "string" &&
    value
      .trim()
      .toLowerCase() ===
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
    typeof value ===
      "object"
  ) {
    const timestamp =
      value as {
        toMillis?: () => number;
      };

    if (
      typeof timestamp.toMillis ===
      "function"
    ) {
      try {
        const millis =
          timestamp.toMillis();

        return Number.isFinite(
          millis,
        )
          ? millis
          : 0;
      } catch {
        return 0;
      }
    }
  }

  if (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    )
  ) {
    return value;
  }

  return 0;
}

function sanitizePhone(
  value: string,
): string {
  return value.replace(
    /[^0-9+*#,;]/g,
    "",
  );
}

/* ==============================================================
   NORMALIZE ITEMS
============================================================== */

function normalizeItems(
  value: unknown,
): WorkerMarketOrderItem[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }

  return value
    .map(
      (
        item,
        index,
      ):
        | WorkerMarketOrderItem
        | null => {
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
          ) ||
          "Product";

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
          Math.max(
            0,

            getNumber(
              data.price,
              data.unitPrice,
              data.amount,
            ),
          );

        const image =
          getString(
            data.image,
            data.imageURL,
            data.imageUrl,
            data.productImage,
            data.photo,
            data.photoUrl,
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

          image,
        };
      },
    )
    .filter(
      (
        item,
      ): item is WorkerMarketOrderItem =>
        item !== null,
    );
}

/* ==============================================================
   SCREEN
============================================================== */

export default function WorkerMarketOrderChatRoom() {
  const params =
    useLocalSearchParams<ChatParams>();

  /* ============================================================
     ORDER ID
  ============================================================ */

  const orderId =
    useMemo(
      () =>
        getParam(
          params.orderId,
        ),
      [
        params.orderId,
      ],
    );

  const chatRoomId =
    orderId;

  /* ============================================================
     AUTH
  ============================================================ */

  const [
    authReady,
    setAuthReady,
  ] =
    useState(false);

  const [
    workerId,
    setWorkerId,
  ] =
    useState<
      string | null
    >(
      null,
    );

  /* ============================================================
     ORDER
  ============================================================ */

  const [
    order,
    setOrder,
  ] =
    useState<OrderData | null>(
      null,
    );

  const [
    loadingOrder,
    setLoadingOrder,
  ] =
    useState(true);

  const [
    orderError,
    setOrderError,
  ] =
    useState("");

  /* ============================================================
     CHAT
  ============================================================ */

  const [
    messages,
    setMessages,
  ] =
    useState<
      WorkerMarketChatMessage[]
    >([]);

  const [
    text,
    setText,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    chatError,
    setChatError,
  ] =
    useState("");

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

  const sendingRef =
    useRef(false);

  const deletingRef =
    useRef(false);

  /* ============================================================
     MODALS
  ============================================================ */

  const [
    menuVisible,
    setMenuVisible,
  ] =
    useState(false);

  const [
    itemsVisible,
    setItemsVisible,
  ] =
    useState(false);

  /* ============================================================
     LIST
  ============================================================ */

  const listRef =
    useRef<
      FlatList<WorkerMarketChatMessage>
    >(
      null,
    );

  /* ============================================================
     AUTH LISTENER
  ============================================================ */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        user => {
          const uid =
            getString(
              user?.uid,
            );

          setWorkerId(
            uid || null,
          );

          setAuthReady(
            true,
          );
        },
      );

    return unsubscribe;
  }, []);

  /* ============================================================
     LOAD ORDER
  ============================================================ */

  useEffect(() => {
    if (!authReady) {
      return;
    }

    if (!workerId) {
      setOrder(
        null,
      );

      setLoadingOrder(
        false,
      );

      setOrderError(
        "Please sign in to access this chat.",
      );

      return;
    }

    if (!orderId) {
      setOrder(
        null,
      );

      setLoadingOrder(
        false,
      );

      setOrderError(
        "This chat is missing the order information.",
      );

      return;
    }

    setLoadingOrder(
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

        snapshot => {
          if (
            !snapshot.exists()
          ) {
            setOrder(
              null,
            );

            setLoadingOrder(
              false,
            );

            setOrderError(
              "This order no longer exists.",
            );

            return;
          }

          const data =
            snapshot.data();

          const assignedWorkerId =
            getString(
              data.workerId,
            );

          /*
           * Client-side UX protection.
           *
           * Firestore Rules must independently
           * enforce this ownership.
           */
          if (
            assignedWorkerId !==
            workerId
          ) {
            setOrder(
              null,
            );

            setLoadingOrder(
              false,
            );

            setOrderError(
              "You are not assigned to this order.",
            );

            return;
          }

          setOrder({
            id:
              snapshot.id,

            ...data,
          });

          setLoadingOrder(
            false,
          );

          setOrderError(
            "",
          );
        },

        snapshotError => {
          console.error(
            "FIXXAM_WORKER_CHAT_ORDER_ERROR:",
            snapshotError,
          );

          setOrder(
            null,
          );

          setLoadingOrder(
            false,
          );

          setOrderError(
            "Unable to load this order. Please try again.",
          );
        },
      );

    return unsubscribe;
  }, [
    authReady,
    orderId,
    workerId,
  ]);

  /* ============================================================
     VERIFIED ACCESS
  ============================================================ */

  const assignedWorkerId =
    getString(
      order?.workerId,
    );

  const orderAvailable =
    Boolean(
      order &&
      workerId &&
      assignedWorkerId ===
        workerId,
    );

  /* ============================================================
     SCROLL
  ============================================================ */

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

  /* ============================================================
     CHAT LISTENER
  ============================================================ */

  useEffect(() => {
    if (
      !authReady ||
      loadingOrder
    ) {
      setLoading(
        true,
      );

      return;
    }

    if (
      !chatRoomId ||
      !workerId ||
      !orderAvailable
    ) {
      setMessages(
        [],
      );

      setLoading(
        false,
      );

      setChatError(
        "",
      );

      return;
    }

    setLoading(
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

        snapshot => {
          const nextMessages =
            snapshot.docs
              .map(
                (
                  messageDoc,
                ): WorkerMarketChatMessage => {
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
                message =>
                  message.text.length >
                  0,
              );

          setMessages(
            nextMessages,
          );

          setLoading(
            false,
          );

          setChatError(
            "",
          );

          requestAnimationFrame(
            () => {
              if (
                nextMessages.length >
                0
              ) {
                scrollToBottom(
                  false,
                );
              }
            },
          );
        },

        listenerError => {
          console.error(
            "FIXXAM_WORKER_CHAT_LISTEN_ERROR:",
            listenerError,
          );

          setLoading(
            false,
          );

          setChatError(
            "Unable to load chat messages.",
          );
        },
      );

    return unsubscribe;
  }, [
    authReady,
    chatRoomId,
    loadingOrder,
    orderAvailable,
    scrollToBottom,
    workerId,
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
          !cleanText ||
          sendingRef.current ||
          deletingRef.current
        ) {
          return;
        }

        if (!workerId) {
          Toast.show({
            type: "error",

            text1:
              "Sign in required",

            text2:
              "Please sign in again before sending a message.",
          });

          return;
        }

        if (
          !orderId ||
          !chatRoomId
        ) {
          Toast.show({
            type: "error",

            text1:
              "Chat unavailable",

            text2:
              "Order information is missing.",
          });

          return;
        }

        if (
          !order ||
          !orderAvailable
        ) {
          Toast.show({
            type: "error",

            text1:
              "Order unavailable",

            text2:
              "You cannot send a message in this chat.",
          });

          return;
        }

        sendingRef.current =
          true;

        setSending(
          true,
        );

        try {
          const chatRef =
            doc(
              db,
              "marketChats",
              chatRoomId,
            );

          const messagesRef =
            collection(
              db,
              "marketChats",
              chatRoomId,
              "messages",
            );

          const messageRef =
            doc(
              messagesRef,
            );

          /*
           * Atomic write:
           *
           * Chat summary and actual message
           * either succeed together or fail together.
           */
          const batch =
            writeBatch(
              db,
            );

          batch.set(
            chatRef,

            {
              orderId,

              customerId:
                getString(
                  order.customerId,
                ) ||
                null,

              workerId,

              storeId:
                getString(
                  order.storeId,
                ) ||
                null,

              updatedAt:
                serverTimestamp(),

              lastMessage:
                cleanText,

              lastMessageSenderId:
                workerId,

              lastMessageSenderRole:
                "worker",
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
                workerId,

              senderRole:
                "worker",

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
        } catch (sendError) {
          console.error(
            "FIXXAM_WORKER_CHAT_SEND_ERROR:",
            sendError,
          );

          Toast.show({
            type: "error",

            text1:
              "Message not sent",

            text2:
              "Please check your connection and try again.",
          });
        } finally {
          sendingRef.current =
            false;

          setSending(
            false,
          );
        }
      },
      [
        chatRoomId,
        order,
        orderAvailable,
        orderId,
        scrollToBottom,
        text,
        workerId,
      ],
    );

  /* ============================================================
     CALL CUSTOMER
  ============================================================ */

  const handleCallCustomer =
    useCallback(
      async () => {
        setMenuVisible(
          false,
        );

        const rawPhone =
          getString(
            order?.customerPhone,
            order?.receiverPhone,
          );

        const phone =
          sanitizePhone(
            rawPhone,
          );

        if (!phone) {
          Toast.show({
            type: "error",

            text1:
              "Phone unavailable",

            text2:
              "The customer's phone number is not available.",
          });

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
            Toast.show({
              type: "error",

              text1:
                "Unable to call",

              text2:
                "Your device cannot open the phone dialer.",
            });

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

          Toast.show({
            type: "error",

            text1:
              "Unable to call",

            text2:
              "We could not open the phone app.",
          });
        }
      },
      [
        order,
      ],
    );

  /* ============================================================
     DELETE OWN MESSAGES
  ============================================================ */

  const confirmDeleteChat =
    useCallback(
      async () => {
        if (
          deletingRef.current ||
          !chatRoomId
        ) {
          return;
        }

        if (
          !workerId
        ) {
          Toast.show({
            type: "error",

            text1:
              "Sign in required",

            text2:
              "Please sign in again.",
          });

          return;
        }

        if (
          !orderAvailable
        ) {
          Toast.show({
            type: "error",

            text1:
              "Chat unavailable",

            text2:
              "You no longer have access to this chat.",
          });

          return;
        }

        deletingRef.current =
          true;

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
                workerId,
              ),
            );

          const snapshot =
            await getDocs(
              ownMessagesQuery,
            );

          if (
            snapshot.empty
          ) {
            Toast.show({
              type: "info",

              text1:
                "Nothing to delete",

              text2:
                "You don't have any messages in this chat.",
            });

            return;
          }

          /* ==================================================
             DELETE IN SAFE BATCHES
          ================================================== */

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

            const chunk =
              snapshot.docs.slice(
                index,
                index +
                  DELETE_BATCH_SIZE,
              );

            chunk.forEach(
              messageDoc => {
                batch.delete(
                  messageDoc.ref,
                );
              },
            );

            await batch.commit();
          }

          /* ==================================================
             REBUILD CHAT SUMMARY
          ================================================== */

          const remainingQuery =
            query(
              messagesRef,

              orderBy(
                "createdAt",
                "desc",
              ),

              limit(
                1,
              ),
            );

          const remainingSnapshot =
            await getDocs(
              remainingQuery,
            );

          const chatRef =
            doc(
              db,
              "marketChats",
              chatRoomId,
            );

          if (
            remainingSnapshot.empty
          ) {
            await setDoc(
              chatRef,

              {
                lastMessage:
                  "",

                lastMessageSenderId:
                  null,

                lastMessageSenderRole:
                  null,
              },

              {
                merge:
                  true,
              },
            );
          } else {
            const latestDoc =
              remainingSnapshot.docs[0];

            const latestData =
              latestDoc.data() as MessageDocument;

            const latestRole =
              normalizeRole(
                latestData.senderRole,
              );

            await setDoc(
              chatRef,

              {
                lastMessage:
                  getString(
                    latestData.text,
                  ),

                lastMessageSenderId:
                  getString(
                    latestData.senderId,
                  ) ||
                  null,

                lastMessageSenderRole:
                  latestRole,

                updatedAt:
                  latestData.createdAt ||
                  serverTimestamp(),
              },

              {
                merge:
                  true,
              },
            );
          }

          setText(
            "",
          );

          Toast.show({
            type: "success",

            text1:
              "Messages deleted",

            text2:
              "Only the messages you sent were removed.",
          });
        } catch (deleteError) {
          console.error(
            "FIXXAM_WORKER_DELETE_OWN_MESSAGES_ERROR:",
            deleteError,
          );

          Toast.show({
            type: "error",

            text1:
              "Unable to delete",

            text2:
              "We could not delete your messages. Please try again.",
          });
        } finally {
          deletingRef.current =
            false;

          setDeleting(
            false,
          );
        }
      },
      [
        chatRoomId,
        orderAvailable,
        workerId,
      ],
    );

  /* ============================================================
     DELETE CONFIRMATION
  ============================================================ */

  const handleDeleteChat =
    useCallback(() => {
      if (
        deletingRef.current
      ) {
        return;
      }

      setMenuVisible(
        false,
      );

      Alert.alert(
        "Delete My Messages?",
        "Only the messages you sent will be permanently deleted. The customer's messages will remain.",
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
              void confirmDeleteChat();
            },
          },
        ],
      );
    }, [
      confirmDeleteChat,
    ]);

  /* ============================================================
     BACK
  ============================================================ */

  const handleBack =
    useCallback(() => {
      if (
        deletingRef.current
      ) {
        return;
      }

      router.back();
    }, []);

  /* ============================================================
     INPUT FOCUS
  ============================================================ */

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

  /* ============================================================
     MODALS
  ============================================================ */

  const handleOpenMenu =
    useCallback(() => {
      if (
        deletingRef.current
      ) {
        return;
      }

      if (
        !orderAvailable
      ) {
        Toast.show({
          type: "info",

          text1:
            "Chat unavailable",

          text2:
            "Order information is not available.",
        });

        return;
      }

      setMenuVisible(
        true,
      );
    }, [
      orderAvailable,
    ]);

  const handleCloseMenu =
    useCallback(() => {
      if (
        deletingRef.current
      ) {
        return;
      }

      setMenuVisible(
        false,
      );
    }, []);

  const handleOpenItems =
    useCallback(() => {
      if (
        !orderAvailable
      ) {
        return;
      }

      setItemsVisible(
        true,
      );
    }, [
      orderAvailable,
    ]);

  const handleCloseItems =
    useCallback(() => {
      setItemsVisible(
        false,
      );
    }, []);

  /* ============================================================
     DERIVED DATA
  ============================================================ */

  const items =
    useMemo(
      () =>
        normalizeItems(
          order?.items ??
            order?.products,
        ),
      [
        order?.items,
        order?.products,
      ],
    );

  const customerName =
    getString(
      order?.customerName,
      order?.receiverName,
    ) ||
    "Customer";

  const customerPhone =
    getString(
      order?.customerPhone,
      order?.receiverPhone,
    );

  const total =
    getNumber(
      order?.total,
      order?.totalAmount,
    );

  /* ============================================================
     INVALID ORDER ID
  ============================================================ */

  if (
    !orderId
  ) {
    return (
      <ChatUnavailableState
        icon="messages"
        title="Chat unavailable"
        description="This chat is missing the order information."
        onBack={
          handleBack
        }
      />
    );
  }

  /* ============================================================
     AUTH LOADING
  ============================================================ */

  if (
    !authReady
  ) {
    return (
      <ChatLoadingState />
    );
  }

  /* ============================================================
     SIGNED OUT
  ============================================================ */

  if (
    !workerId
  ) {
    return (
      <ChatUnavailableState
        icon="lock"
        title="Sign in required"
        description="Please sign in to access this chat."
        onBack={
          handleBack
        }
      />
    );
  }

  /* ============================================================
     ORDER LOADING
  ============================================================ */

  if (
    loadingOrder
  ) {
    return (
      <ChatLoadingState />
    );
  }

  /* ============================================================
     ORDER UNAVAILABLE
  ============================================================ */

  if (
    orderError ||
    !orderAvailable ||
    !order
  ) {
    return (
      <ChatUnavailableState
        icon="warning"
        title="Chat unavailable"
        description={
          orderError ||
          "This order is unavailable."
        }
        onBack={
          handleBack
        }
      />
    );
  }

  /* ============================================================
     SCREEN
  ============================================================ */

  return (
    <>
      <Stack.Screen
        options={{
          headerShown:
            false,
        }}
      />

      <AppScreen
        role="worker"
        contentContainerStyle={
          styles.screen
        }
      >
        <KeyboardAvoidingView
          style={
            styles.keyboard
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
          {/* ==================================================
              HEADER
          ================================================== */}

          <WorkerMarketChatHeader
            orderId={
              orderId
            }
            deleting={
              deleting
            }
            onBack={
              handleBack
            }
            onOpenMenu={
              handleOpenMenu
            }
          />

          {/* ==================================================
              CUSTOMER
          ================================================== */}

          <WorkerMarketCustomerBar
            customerName={
              customerName
            }
            customerPhone={
              customerPhone
            }
            onOpenItems={
              handleOpenItems
            }
          />

          {/* ==================================================
              CHAT
          ================================================== */}

          <WorkerMarketMessageList
            loading={
              loading
            }
            messages={
              messages
            }
            currentUserId={
              workerId
            }
            listRef={
              listRef
            }
            onScrollToBottom={
              scrollToBottom
            }
          />

          {/* ==================================================
              CHAT ERROR
          ================================================== */}

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

          {/* ==================================================
              INPUT
          ================================================== */}

          <WorkerMarketChatInput
            text={
              text
            }
            sending={
              sending
            }
            deleting={
              deleting
            }
            loadingOrder={
              loadingOrder
            }
            orderAvailable={
              orderAvailable
            }
            onChangeText={
              setText
            }
            onFocus={
              handleInputFocus
            }
            onSend={
              handleSend
            }
          />
        </KeyboardAvoidingView>
      </AppScreen>

      {/* ======================================================
          CHAT MENU
      ====================================================== */}

      <WorkerMarketChatMenu
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
        onClose={
          handleCloseMenu
        }
        onCall={
          handleCallCustomer
        }
        onDelete={
          handleDeleteChat
        }
      />

      {/* ======================================================
          ITEMS
      ====================================================== */}

      <WorkerMarketOrderItemsModal
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
        onClose={
          handleCloseItems
        }
      />
    </>
  );
}

/* ==============================================================
   LOADING STATE
============================================================== */

function ChatLoadingState() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown:
            false,
        }}
      />

      <AppScreen
        role="worker"
        contentContainerStyle={
          styles.screen
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
      </AppScreen>
    </>
  );
}

/* ==============================================================
   UNAVAILABLE STATE
============================================================== */

function ChatUnavailableState({
  icon,
  title,
  description,
  onBack,
}: {
  icon: AppIconName;

  title: string;

  description: string;

  onBack: () => void;
}) {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown:
            false,
        }}
      />

      <AppScreen
        role="worker"
        contentContainerStyle={
          styles.screen
        }
      >
        <View
          style={
            styles.center
          }
        >
          <View
            style={
              styles.stateIcon
            }
          >
            <AppIcon
              name={
                icon
              }
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
              styles.errorTitle
            }
          >
            {title}
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.errorText
            }
          >
            {description}
          </AppText>

          <View
            style={
              styles.backAction
            }
          >
            <AppButton
              title="Go Back"
              role="worker"
              variant="primary"
              leftIconName="back"
              onPress={
                onBack
              }
            />
          </View>
        </View>
      </AppScreen>
    </>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,

      backgroundColor:
        Colors.background,
    },

    keyboard: {
      flex: 1,

      minHeight: 0,
    },

    /* ========================================================
       ERROR
    ======================================================== */

    errorBar: {
      marginHorizontal:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.errorSoft,
    },

    errorBarText: {
      flex: 1,

      lineHeight: 16,

      color:
        Colors.error,
    },

    /* ========================================================
       STATES
    ======================================================== */

    center: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.background,
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
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textSecondary,
    },

    stateIcon: {
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

    errorTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    errorText: {
      maxWidth: 300,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    backAction: {
      width: "100%",

      maxWidth: 220,

      marginTop:
        FixxamTokens.spacing.xl,
    },
  });