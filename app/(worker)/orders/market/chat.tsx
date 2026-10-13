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
  View,
} from "react-native";

import {
  Stack,
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import Toast from "react-native-toast-message";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import type {
  AppIconName,
} from "@/components/ui/AppIcon";

import {
  Colors,
  WorkerColors,
} from "@/theme";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  createWorkerMarketCallSession,
} from "@/services/calls/callSession";

import WorkerMarketChatHeader from "@/components/orders/market-chat/WorkerMarketChatHeader";

import WorkerMarketMessageList, {
  type WorkerMarketChatMessage,
} from "@/components/orders/market-chat/WorkerMarketMessageList";

import WorkerMarketChatInput from "@/components/orders/market-chat/WorkerMarketChatInput";

import WorkerMarketChatMenu, {
  type WorkerMarketChatMenuItem,
} from "@/components/orders/market-chat/WorkerMarketChatMenu";

import {
  styles,
} from "@/components/orders/market-chat/workerMarketChatStyles";

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
  receiverName?: string;

  workerId?: string;

  sellerId?: string;
  storeId?: string;

  status?: string;

  items?: unknown[];
  products?: unknown[];
};

type ChatParams = {
  orderId?:
    | string
    | string[];

  customerId?:
    | string
    | string[];

  customerName?:
    | string
    | string[];
};

/* ==============================================================
   CONSTANTS
============================================================== */

const MAX_MESSAGE_LENGTH =
  1000;

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
    const value of
    values
  ) {
    if (
      typeof value ===
      "string"
    ) {
      const normalized =
        value.trim();

      if (
        normalized
      ) {
        return normalized;
      }
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

function normalizeRole(
  value: unknown,
):
  | "customer"
  | "worker" {
  return getString(
    value,
  ).toLowerCase() ===
    "worker"
    ? "worker"
    : "customer";
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

/* ==============================================================
   NORMALIZE GALLERY ITEMS
============================================================== */

function normalizeItems(
  value: unknown,
): WorkerMarketChatMenuItem[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }

  const result:
    WorkerMarketChatMenuItem[] =
    [];

  value.forEach(
    (
      item,
      index,
    ) => {
      if (
        !item ||
        typeof item !==
          "object"
      ) {
        return;
      }

      const data =
        item as Record<
          string,
          unknown
        >;

      const image =
        getString(
          data.image,
          data.imageURL,
          data.imageUrl,
          data.productImage,
          data.photo,
          data.photoUrl,
        );

      const normalizedItem:
        WorkerMarketChatMenuItem = {
          id:
            getString(
              data.id,
              data.productId,
            ) ||
            `item-${index}`,

          name:
            getString(
              data.name,
              data.productName,
              data.title,
            ) ||
            "Product",
        };

      if (
        image
      ) {
        normalizedItem.image =
          image;
      }

      result.push(
        normalizedItem,
      );
    },
  );

  return result;
}

/* ==============================================================
   SCREEN
============================================================== */

export default function WorkerMarketOrderChatRoom() {
  const params =
    useLocalSearchParams<ChatParams>();

  const insets =
    useSafeAreaInsets();

  /* ============================================================
     ROUTE PARAMS
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

  const customerIdParam =
    useMemo(
      () =>
        getParam(
          params.customerId,
        ),
      [
        params.customerId,
      ],
    );

  const customerNameParam =
    useMemo(
      () =>
        getParam(
          params.customerName,
        ),
      [
        params.customerName,
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
    >(null);

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

  const [
    callingCustomer,
    setCallingCustomer,
  ] =
    useState(false);

  const [
    menuVisible,
    setMenuVisible,
  ] =
    useState(false);

  const sendingRef =
    useRef(false);

  const deletingRef =
    useRef(false);

  const callingRef =
    useRef(false);

  const listRef =
    useRef<
      FlatList<WorkerMarketChatMessage>
    >(null);

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
            uid ||
              null,
          );

          setAuthReady(
            true,
          );
        },
      );

    return unsubscribe;
  }, []);

  /* ============================================================
     ORDER LISTENER
  ============================================================ */

  useEffect(() => {
    if (
      !authReady
    ) {
      return;
    }

    if (
      !workerId
    ) {
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

    if (
      !orderId
    ) {
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

        listenerError => {
          if (
            __DEV__
          ) {
            console.error(
              "FIXXAM_WORKER_CHAT_ORDER_ERROR:",
              listenerError,
            );
          }

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
     VERIFIED DATA
  ============================================================ */

  const assignedWorkerId =
    getString(
      order?.workerId,
    );

  const customerAccountId =
    getString(
      order?.customerId,
      customerIdParam,
    );

  const orderAvailable =
    Boolean(
      order &&
      workerId &&
      assignedWorkerId ===
        workerId,
    );

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

  const canCallCustomer =
    Boolean(
      customerAccountId &&
      workerId &&
      customerAccountId !==
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
     MESSAGE LISTENER
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
                  message.text.trim().length >
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

        listenerError => {
          if (
            __DEV__
          ) {
            console.error(
              "FIXXAM_WORKER_CHAT_LISTEN_ERROR:",
              listenerError,
            );
          }

          setMessages(
            [],
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
          deletingRef.current ||
          callingRef.current
        ) {
          return;
        }

        if (
          cleanText.length >
          MAX_MESSAGE_LENGTH
        ) {
          Toast.show({
            type:
              "error",

            text1:
              "Message too long",

            text2:
              `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`,
          });

          return;
        }

        const currentWorker =
          auth.currentUser;

        if (
          !workerId ||
          !currentWorker ||
          currentWorker.uid !==
            workerId
        ) {
          Toast.show({
            type:
              "error",

            text1:
              "Sign in required",

            text2:
              "Please sign in again before sending a message.",
          });

          return;
        }

        if (
          !orderId ||
          !chatRoomId ||
          !order ||
          !orderAvailable
        ) {
          Toast.show({
            type:
              "error",

            text1:
              "Chat unavailable",

            text2:
              "Order information is unavailable.",
          });

          return;
        }

        const verifiedWorkerId =
          getString(
            order.workerId,
          );

        const verifiedCustomerId =
          getString(
            order.customerId,
          );

        if (
          verifiedWorkerId !==
          workerId
        ) {
          Toast.show({
            type:
              "error",

            text1:
              "Chat unavailable",

            text2:
              "You are not assigned to this order.",
          });

          return;
        }

        if (
          !verifiedCustomerId
        ) {
          Toast.show({
            type:
              "error",

            text1:
              "Chat unavailable",

            text2:
              "Customer information is missing from this order.",
          });

          return;
        }

        sendingRef.current =
          true;

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
              chatRoomId,
            );

          /*
           * IMPORTANT:
           *
           * We read the chat before creating the batch.
           *
           * Existing chats must update ONLY the summary fields
           * permitted by Firestore rules.
           *
           * New chats may include participant/order fields.
           */

          const chatSnapshot =
            await getDoc(
              chatRef,
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

          const batch =
            writeBatch(
              db,
            );

          if (
            chatSnapshot.exists()
          ) {
            /*
             * EXISTING CHAT
             *
             * Do NOT resend:
             * - orderId
             * - customerId
             * - workerId
             * - sellerId
             * - storeId
             *
             * Firestore rules intentionally treat participant
             * associations as immutable.
             */

            batch.update(
              chatRef,
              {
                lastMessage:
                  cleanText,

                lastMessageSenderId:
                  workerId,

                lastMessageSenderRole:
                  "worker",

                updatedAt:
                  serverTimestamp(),
              },
            );
          } else {
            /*
             * NEW CHAT
             *
             * The source order remains the authority for
             * customer/worker/seller identities.
             */

            const newChatData: Record<
              string,
              unknown
            > = {
              orderId,

              customerId:
                verifiedCustomerId,

              workerId,

              lastMessage:
                cleanText,

              lastMessageSenderId:
                workerId,

              lastMessageSenderRole:
                "worker",

              updatedAt:
                serverTimestamp(),
            };

            const sellerId =
              getString(
                order.sellerId,
              );

            const storeId =
              getString(
                order.storeId,
              );

            if (
              sellerId
            ) {
              newChatData.sellerId =
                sellerId;
            }

            if (
              storeId
            ) {
              newChatData.storeId =
                storeId;
            }

            batch.set(
              chatRef,
              newChatData,
            );
          }

          /*
           * MESSAGE DOCUMENT
           */

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
        } catch (
          sendError
        ) {
          if (
            __DEV__
          ) {
            console.error(
              "FIXXAM_WORKER_CHAT_SEND_ERROR:",
              {
                chatRoomId,
                orderId,
                customerId:
                  verifiedCustomerId,
                workerId,
                verifiedWorkerId,
                error:
                  sendError,
              },
            );
          }

          Toast.show({
            type:
              "error",

            text1:
              "Message not sent",

            text2:
              "Unable to send this message. Please try again.",
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
     FIXXAM VOICE
  ============================================================ */

  const handleCallCustomer =
    useCallback(
      async () => {
        setMenuVisible(
          false,
        );

        if (
          callingRef.current ||
          deletingRef.current ||
          sendingRef.current
        ) {
          return;
        }

        if (
          !workerId ||
          !order ||
          !orderAvailable ||
          !orderId
        ) {
          Toast.show({
            type:
              "error",

            text1:
              "Call unavailable",

            text2:
              "Order information is not available.",
          });

          return;
        }

        const customerId =
          getString(
            order.customerId,
            customerIdParam,
          );

        if (
          !customerId
        ) {
          Toast.show({
            type:
              "error",

            text1:
              "Customer unavailable",

            text2:
              "This order does not contain a customer account.",
          });

          return;
        }

        if (
          customerId ===
          workerId
        ) {
          Toast.show({
            type:
              "error",

            text1:
              "Call unavailable",

            text2:
              "You cannot call your own account.",
          });

          return;
        }

        const currentWorker =
          auth.currentUser;

        if (
          !currentWorker ||
          currentWorker.uid !==
            workerId
        ) {
          Toast.show({
            type:
              "error",

            text1:
              "Sign in required",

            text2:
              "Please sign in again before starting a call.",
          });

          return;
        }

        const resolvedCustomerName =
          getString(
            order.customerName,
            order.receiverName,
            customerNameParam,
          ) ||
          "Customer";

        callingRef.current =
          true;

        setCallingCustomer(
          true,
        );

        try {
          const callId =
            await createWorkerMarketCallSession({
              workerId,

              customerId,

              orderId,

              workerSnapshot: {
                name:
                  getString(
                    currentWorker.displayName,
                  ) ||
                  "Worker",

                image:
                  getString(
                    currentWorker.photoURL,
                  ),

                service:
                  "Market Order",
              },

              customerSnapshot: {
                name:
                  resolvedCustomerName,

                image:
                  "",

                service:
                  "Market Order",
              },
            });

          if (
            !callId
          ) {
            throw new Error(
              "Call session was not created.",
            );
          }

          router.push({
            pathname:
              "/call/[customer]",

            params: {
              callId,

              customerName:
                resolvedCustomerName,
            },
          } as never);
        } catch (
          callError
        ) {
          if (
            __DEV__
          ) {
            console.error(
              "FIXXAM_WORKER_MARKET_CALL_START_ERROR:",
              callError,
            );
          }

          Toast.show({
            type:
              "error",

            text1:
              "Call failed",

            text2:
              callError instanceof
                Error &&
              callError.message
                ? callError.message
                : "Unable to start Fixxam Voice. Please try again.",
          });
        } finally {
          callingRef.current =
            false;

          setCallingCustomer(
            false,
          );
        }
      },
      [
        customerIdParam,
        customerNameParam,
        order,
        orderAvailable,
        orderId,
        workerId,
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
          sendingRef.current ||
          callingRef.current ||
          !chatRoomId ||
          !workerId ||
          !orderAvailable
        ) {
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
              type:
                "info",

              text1:
                "Nothing to delete",

              text2:
                "You don't have any messages in this chat.",
            });

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
            /*
             * The current Firestore update rule requires the
             * summary sender to be the authenticated user.
             *
             * Therefore we only clear the visible summary here.
             */

            await updateDoc(
              chatRef,
              {
                lastMessage:
                  "",

                lastMessageSenderId:
                  workerId,

                lastMessageSenderRole:
                  "worker",

                updatedAt:
                  serverTimestamp(),
              },
            );
          } else {
            const latestData =
              remainingSnapshot.docs[0]
                .data() as MessageDocument;

            const latestSenderId =
              getString(
                latestData.senderId,
              );

            /*
             * We must not spoof another participant as the
             * authenticated sender in the chat summary.
             *
             * If the remaining latest message belongs to this
             * worker, update the summary. Otherwise leave the
             * summary untouched.
             */

            if (
              latestSenderId ===
              workerId
            ) {
              await updateDoc(
                chatRef,
                {
                  lastMessage:
                    getString(
                      latestData.text,
                    ),

                  lastMessageSenderId:
                    workerId,

                  lastMessageSenderRole:
                    "worker",

                  updatedAt:
                    serverTimestamp(),
                },
              );
            }
          }

          setText(
            "",
          );

          Toast.show({
            type:
              "success",

            text1:
              "Messages deleted",

            text2:
              "Only the messages you sent were removed.",
          });
        } catch (
          deleteError
        ) {
          if (
            __DEV__
          ) {
            console.error(
              "FIXXAM_WORKER_DELETE_OWN_MESSAGES_ERROR:",
              deleteError,
            );
          }

          Toast.show({
            type:
              "error",

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
     ACTIONS
  ============================================================ */

  const handleDeleteChat =
    useCallback(() => {
      if (
        deletingRef.current ||
        sendingRef.current ||
        callingRef.current
      ) {
        return;
      }

      setMenuVisible(
        false,
      );

      Alert.alert(
        "Delete my messages?",
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

  const handleBack =
    useCallback(() => {
      if (
        sendingRef.current ||
        deletingRef.current ||
        callingRef.current
      ) {
        return;
      }

      router.back();
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

  const handleOpenMenu =
    useCallback(() => {
      if (
        sendingRef.current ||
        deletingRef.current ||
        callingRef.current ||
        !orderAvailable
      ) {
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

  /* ============================================================
     INVALID / LOADING STATES
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

  if (
    !authReady ||
    loadingOrder
  ) {
    return (
      <ChatLoadingState />
    );
  }

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
        <WorkerMarketChatHeader
          orderId={
            orderId
          }
          deleting={
            deleting ||
            callingCustomer
          }
          onBack={
            handleBack
          }
          onOpenMenu={
            handleOpenMenu
          }
        />

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

        <WorkerMarketChatInput
          text={
            text
          }
          sending={
            sending
          }
          deleting={
            deleting ||
            callingCustomer
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

      <WorkerMarketChatMenu
        visible={
          menuVisible
        }
        busy={
          sending ||
          deleting ||
          callingCustomer
        }
        deleting={
          deleting
        }
        canCall={
          canCallCustomer
        }
        items={
          items
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
    </>
  );
}

/* ==============================================================
   LOADING
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
    </>
  );
}

/* ==============================================================
   UNAVAILABLE
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
            name={
              icon
            }
            size="lg"
            color={
              Colors.error
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

        <Pressable
          onPress={
            onBack
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