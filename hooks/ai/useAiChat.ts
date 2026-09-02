import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  AiConversation,
  AiMessage,
} from "@/components/ai/types";

import type {
  ChatMessage,
} from "@/services/ai/shared/types";

/* ==============================================================
   CONSTANTS
============================================================== */

const HISTORY_STORAGE_KEY =
  "@fixxam_smarter_chat_history";

const MAX_HISTORY_ITEMS = 5;

/* ==============================================================
   TYPES
============================================================== */

export interface AiChatHistoryItem
  extends AiConversation {}

interface AiChatState {
  messages: AiMessage[];
  isTyping: boolean;
}

type Action =
  | {
      type: "ADD_MESSAGE";
      payload: AiMessage;
    }
  | {
      type: "UPDATE_MESSAGE";
      payload: {
        id: string;
        content: string;
      };
    }
  | {
      type: "REMOVE_MESSAGE";
      payload: string;
    }
  | {
      type: "SET_TYPING";
      payload: boolean;
    }
  | {
      type: "LOAD_MESSAGES";
      payload: AiMessage[];
    }
  | {
      type: "CLEAR_CHAT";
    };

/* ==============================================================
   INITIAL STATE
============================================================== */

const initialState: AiChatState = {
  messages: [],
  isTyping: false,
};

/* ==============================================================
   REDUCER
============================================================== */

function reducer(
  state: AiChatState,
  action: Action,
): AiChatState {
  switch (action.type) {
    /* ----------------------------------------------------------
       ADD
    ---------------------------------------------------------- */

    case "ADD_MESSAGE":
      return {
        ...state,

        messages: [
          ...state.messages,
          action.payload,
        ],
      };

    /* ----------------------------------------------------------
       UPDATE
    ---------------------------------------------------------- */

    case "UPDATE_MESSAGE":
      return {
        ...state,

        messages:
          state.messages.map(
            (message) =>
              message.id ===
              action.payload.id
                ? {
                    ...message,

                    content:
                      action.payload
                        .content,
                  }
                : message,
          ),
      };

    /* ----------------------------------------------------------
       REMOVE
    ---------------------------------------------------------- */

    case "REMOVE_MESSAGE":
      return {
        ...state,

        messages:
          state.messages.filter(
            (message) =>
              message.id !==
              action.payload,
          ),
      };

    /* ----------------------------------------------------------
       TYPING
    ---------------------------------------------------------- */

    case "SET_TYPING":
      return {
        ...state,

        isTyping:
          action.payload,
      };

    /* ----------------------------------------------------------
       LOAD SAVED CHAT
    ---------------------------------------------------------- */

    case "LOAD_MESSAGES":
      return {
        ...state,

        messages:
          action.payload,

        isTyping: false,
      };

    /* ----------------------------------------------------------
       CLEAR
    ---------------------------------------------------------- */

    case "CLEAR_CHAT":
      return {
        ...initialState,
      };

    default:
      return state;
  }
}

/* ==============================================================
   VALIDATION
============================================================== */

function isValidMessage(
  value: unknown,
): value is AiMessage {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const message =
    value as Partial<AiMessage>;

  return (
    typeof message.id === "string" &&
    (
      message.role === "user" ||
      message.role === "assistant" ||
      message.role === "system"
    ) &&
    typeof message.content === "string" &&
    typeof message.createdAt ===
      "number"
  );
}

/* ==============================================================
   VALIDATE HISTORY ITEM
============================================================== */

function isValidHistoryItem(
  value: unknown,
): value is AiChatHistoryItem {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const item =
    value as Partial<AiChatHistoryItem>;

  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.createdAt ===
      "number" &&
    typeof item.updatedAt ===
      "number" &&
    Array.isArray(item.messages) &&
    item.messages.every(
      isValidMessage,
    )
  );
}

/* ==============================================================
   CREATE ID
============================================================== */

function createId(
  prefix: string,
): string {
  return `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

/* ==============================================================
   CREATE TITLE
============================================================== */

function createChatTitle(
  messages: AiMessage[],
): string {
  const firstUserMessage =
    messages.find(
      (message) =>
        message.role === "user" &&
        message.content.trim()
          .length > 0,
    );

  if (!firstUserMessage) {
    return "New Chat";
  }

  const title =
    firstUserMessage.content
      .trim()
      .replace(/\s+/g, " ");

  if (title.length <= 50) {
    return title;
  }

  return `${title.slice(0, 50).trim()}…`;
}

/* ==============================================================
   HOOK
============================================================== */

export default function useAiChat() {
  const [
    state,
    dispatch,
  ] = useReducer(
    reducer,
    initialState,
  );

  const [
    history,
    setHistory,
  ] = useState<
    AiChatHistoryItem[]
  >([]);

  const [
    historyLoaded,
    setHistoryLoaded,
  ] = useState(false);

  /* ============================================================
     LOAD HISTORY FROM STORAGE
  ============================================================ */

  useEffect(() => {
    let mounted = true;

    async function loadHistory() {
      try {
        const stored =
          await AsyncStorage.getItem(
            HISTORY_STORAGE_KEY,
          );

        if (!stored) {
          if (mounted) {
            setHistory([]);
          }

          return;
        }

        const parsed: unknown =
          JSON.parse(stored);

        if (
          !Array.isArray(parsed)
        ) {
          throw new Error(
            "Invalid AI chat history.",
          );
        }

        const validHistory =
          parsed
            .filter(
              isValidHistoryItem,
            )
            .sort(
              (a, b) =>
                b.updatedAt -
                a.updatedAt,
            )
            .slice(
              0,
              MAX_HISTORY_ITEMS,
            );

        if (mounted) {
          setHistory(
            validHistory,
          );
        }
      } catch (error) {
        console.error(
          "AI_HISTORY_LOAD_ERROR:",
          error,
        );

        if (mounted) {
          setHistory([]);
        }
      } finally {
        if (mounted) {
          setHistoryLoaded(true);
        }
      }
    }

    void loadHistory();

    return () => {
      mounted = false;
    };
  }, []);

  /* ============================================================
     PERSIST HISTORY
  ============================================================ */

  const persistHistory =
    useCallback(
      async (
        nextHistory: AiChatHistoryItem[],
      ) => {
        const limitedHistory =
          nextHistory
            .slice(
              0,
              MAX_HISTORY_ITEMS,
            );

        await AsyncStorage.setItem(
          HISTORY_STORAGE_KEY,
          JSON.stringify(
            limitedHistory,
          ),
        );
      },
      [],
    );

  /* ============================================================
     ADD MESSAGE
  ============================================================ */

  const addMessage =
    useCallback(
      (message: AiMessage) => {
        dispatch({
          type: "ADD_MESSAGE",

          payload: message,
        });

        return message;
      },
      [],
    );

  /* ============================================================
     UPDATE MESSAGE
  ============================================================ */

  const updateMessage =
    useCallback(
      (
        id: string,
        content: string,
      ) => {
        dispatch({
          type: "UPDATE_MESSAGE",

          payload: {
            id,
            content,
          },
        });
      },
      [],
    );

  /* ============================================================
     REMOVE MESSAGE
  ============================================================ */

  const removeMessage =
    useCallback(
      (id: string) => {
        dispatch({
          type: "REMOVE_MESSAGE",

          payload: id,
        });
      },
      [],
    );

  /* ============================================================
     SET TYPING
  ============================================================ */

  const setTyping =
    useCallback(
      (typing: boolean) => {
        dispatch({
          type: "SET_TYPING",

          payload: typing,
        });
      },
      [],
    );

  /* ============================================================
     CLEAR CURRENT CHAT
  ============================================================ */

  const clearChat =
    useCallback(() => {
      dispatch({
        type: "CLEAR_CHAT",
      });
    }, []);

  /* ============================================================
     SEND USER MESSAGE
  ============================================================ */

  const sendMessage =
    useCallback(
      (
        content: string,
        image?: string,
      ) => {
        const message: AiMessage =
          {
            id: createId("user"),

            role: "user",

            content,

            ...(image
              ? {
                  image,
                }
              : {}),

            createdAt:
              Date.now(),

            status: "sent",
          };

        return addMessage(
          message,
        );
      },
      [addMessage],
    );

  /* ============================================================
     RECEIVE AI MESSAGE
  ============================================================ */

  const receiveMessage =
    useCallback(
      (content: string) => {
        const message: AiMessage =
          {
            id: createId(
              "assistant",
            ),

            role: "assistant",

            content,

            createdAt:
              Date.now(),

            status: "sent",
          };

        return addMessage(
          message,
        );
      },
      [addMessage],
    );

  /* ============================================================
     LOAD SAVED CONVERSATION
  ============================================================ */

  const loadConversation =
    useCallback(
      (
        conversation: AiChatHistoryItem,
      ) => {
        if (
          !conversation.messages
            ?.length
        ) {
          return false;
        }

        dispatch({
          type: "LOAD_MESSAGES",

          payload:
            conversation.messages,
        });

        return true;
      },
      [],
    );

  /* ============================================================
     SAVE CURRENT CHAT
  ============================================================ */

  const saveCurrentChat =
    useCallback(async () => {
      const currentMessages =
        state.messages.filter(
          (message) =>
            message.role === "user" ||
            message.role ===
              "assistant",
        );

      /*
       * Do not save an empty chat.
       */

      if (
        currentMessages.length ===
        0
      ) {
        return null;
      }

      /*
       * Do not save while AI
       * is still responding.
       */

      if (state.isTyping) {
        return null;
      }

      const now =
        Date.now();

      const savedChat: AiChatHistoryItem =
        {
          id: createId("chat"),

          title:
            createChatTitle(
              currentMessages,
            ),

          messages:
            currentMessages,

          createdAt:
            currentMessages[0]
              ?.createdAt ?? now,

          updatedAt: now,
        };

      /*
       * Newest chat first.
       *
       * If there are already
       * 5 chats, the oldest
       * one is automatically
       * removed.
       */

      const nextHistory = [
        savedChat,
        ...history,
      ].slice(
        0,
        MAX_HISTORY_ITEMS,
      );

      setHistory(
        nextHistory,
      );

      await persistHistory(
        nextHistory,
      );

      return savedChat;
    }, [
      history,
      persistHistory,
      state.isTyping,
      state.messages,
    ]);

  /* ============================================================
     CLEAR + START NEW
  ============================================================ */

  const clearAndStartNew =
    useCallback(() => {
      dispatch({
        type: "CLEAR_CHAT",
      });
    }, []);

  /* ============================================================
     SAVE + START NEW
  ============================================================ */

  const saveAndStartNew =
    useCallback(async () => {
      const savedChat =
        await saveCurrentChat();

      dispatch({
        type: "CLEAR_CHAT",
      });

      return savedChat;
    }, [saveCurrentChat]);

  /* ============================================================
     DELETE HISTORY ITEM
  ============================================================ */

  const deleteHistoryItem =
    useCallback(
      async (id: string) => {
        const normalizedId =
          id.trim();

        if (!normalizedId) {
          return false;
        }

        const nextHistory =
          history.filter(
            (item) =>
              item.id !==
              normalizedId,
          );

        /*
         * Nothing was deleted.
         */

        if (
          nextHistory.length ===
          history.length
        ) {
          return false;
        }

        setHistory(
          nextHistory,
        );

        await persistHistory(
          nextHistory,
        );

        return true;
      },
      [
        history,
        persistHistory,
      ],
    );

  /* ============================================================
     CLEAR ALL HISTORY
  ============================================================ */

  const clearAllHistory =
    useCallback(async () => {
      setHistory([]);

      await AsyncStorage.removeItem(
        HISTORY_STORAGE_KEY,
      );
    }, []);

  /* ============================================================
     FIND HISTORY ITEM
  ============================================================ */

  const getHistoryItem =
    useCallback(
      (id: string) => {
        return (
          history.find(
            (item) =>
              item.id ===
              id,
          ) ?? null
        );
      },
      [history],
    );

  /* ============================================================
     CONVERSATION MESSAGES
  ============================================================ */

  const conversationMessages =
    useMemo<ChatMessage[]>(
      () =>
        state.messages
          .filter(
            (message) =>
              message.role ===
                "user" ||
              message.role ===
                "assistant",
          )
          .map(
            (message) => ({
              role:
                message.role,

              content:
                message.content,
            }),
          ),
      [state.messages],
    );

  /* ============================================================
     DERIVED STATE
  ============================================================ */

  const hasCurrentChat =
    state.messages.length > 0;

  const hasUserMessages =
    state.messages.some(
      (message) =>
        message.role ===
          "user" &&
        message.content
          .trim().length > 0,
    );

  const canSaveCurrentChat =
    hasUserMessages &&
    !state.isTyping &&
    historyLoaded;

  /* ============================================================
     RETURN
  ============================================================ */

  return {
    /* ----------------------------------------------------------
       CURRENT CHAT
    ---------------------------------------------------------- */

    messages:
      state.messages,

    conversationMessages,

    isTyping:
      state.isTyping,

    hasCurrentChat,

    hasUserMessages,

    canSaveCurrentChat,

    /* ----------------------------------------------------------
       HISTORY
    ---------------------------------------------------------- */

    history,

    historyLoaded,

    historyCount:
      history.length,

    maxHistory:
      MAX_HISTORY_ITEMS,

    /* ----------------------------------------------------------
       MESSAGE ACTIONS
    ---------------------------------------------------------- */

    addMessage,

    updateMessage,

    removeMessage,

    sendMessage,

    receiveMessage,

    setTyping,

    /* ----------------------------------------------------------
       CURRENT CHAT ACTIONS
    ---------------------------------------------------------- */

    clearChat,

    clearAndStartNew,

    /* ----------------------------------------------------------
       HISTORY ACTIONS
    ---------------------------------------------------------- */

    saveCurrentChat,

    saveAndStartNew,

    loadConversation,

    deleteHistoryItem,

    clearAllHistory,

    getHistoryItem,
  };
}