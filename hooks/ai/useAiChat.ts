import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  useAuth,
} from "@/contexts/AuthContext";

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

const HISTORY_STORAGE_KEY_PREFIX =
  "@fixxam_smarter_chat_history";

const CURRENT_CHAT_STORAGE_KEY_PREFIX =
  "@fixxam_smarter_current_chat";

const CURRENT_CHAT_STORAGE_VERSION =
  1;

const MAX_HISTORY_ITEMS =
  5;

/*
 * Prevent one active conversation
 * from growing forever in local storage.
 *
 * The current UI session can contain more,
 * but restoration keeps the latest messages.
 */
const MAX_PERSISTED_CURRENT_MESSAGES =
  100;

/* ==============================================================
   TYPES
============================================================== */

export interface AiChatHistoryItem
  extends AiConversation {}

interface AiChatState {
  messages: AiMessage[];

  isTyping: boolean;
}

type PersistedCurrentChat = {
  version: number;

  messages: AiMessage[];

  updatedAt: number;
};

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

const initialState: AiChatState =
  {
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
       LOAD
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
   MESSAGE VALIDATION
============================================================== */

function isValidMessage(
  value: unknown,
): value is AiMessage {
  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return false;
  }

  const message =
    value as Partial<AiMessage>;

  return (
    typeof message.id ===
      "string" &&
    (
      message.role ===
        "user" ||
      message.role ===
        "assistant" ||
      message.role ===
        "system"
    ) &&
    typeof message.content ===
      "string" &&
    typeof message.createdAt ===
      "number" &&
    Number.isFinite(
      message.createdAt,
    )
  );
}

/* ==============================================================
   HISTORY VALIDATION
============================================================== */

function isValidHistoryItem(
  value: unknown,
): value is AiChatHistoryItem {
  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return false;
  }

  const item =
    value as Partial<AiChatHistoryItem>;

  return (
    typeof item.id ===
      "string" &&
    typeof item.title ===
      "string" &&
    typeof item.createdAt ===
      "number" &&
    Number.isFinite(
      item.createdAt,
    ) &&
    typeof item.updatedAt ===
      "number" &&
    Number.isFinite(
      item.updatedAt,
    ) &&
    Array.isArray(
      item.messages,
    ) &&
    item.messages.every(
      isValidMessage,
    )
  );
}

/* ==============================================================
   CURRENT CHAT VALIDATION
============================================================== */

function isValidCurrentChat(
  value: unknown,
): value is PersistedCurrentChat {
  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return false;
  }

  const chat =
    value as Partial<PersistedCurrentChat>;

  return (
    chat.version ===
      CURRENT_CHAT_STORAGE_VERSION &&
    typeof chat.updatedAt ===
      "number" &&
    Number.isFinite(
      chat.updatedAt,
    ) &&
    Array.isArray(
      chat.messages,
    ) &&
    chat.messages.every(
      isValidMessage,
    )
  );
}

/* ==============================================================
   PARSE HISTORY
============================================================== */

function parseStoredHistory(
  raw: string | null,
): AiChatHistoryItem[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown =
      JSON.parse(raw);

    if (
      !Array.isArray(
        parsed,
      )
    ) {
      return [];
    }

    return parsed
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
  } catch {
    return [];
  }
}

/* ==============================================================
   PARSE CURRENT CHAT
============================================================== */

function parseStoredCurrentChat(
  raw: string | null,
): AiMessage[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown =
      JSON.parse(raw);

    if (
      !isValidCurrentChat(
        parsed,
      )
    ) {
      return [];
    }

    return parsed.messages.slice(
      -MAX_PERSISTED_CURRENT_MESSAGES,
    );
  } catch {
    return [];
  }
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
        message.role ===
          "user" &&
        message.content
          .trim()
          .length > 0,
    );

  if (
    !firstUserMessage
  ) {
    return "New Chat";
  }

  const title =
    firstUserMessage.content
      .trim()
      .replace(
        /\s+/g,
        " ",
      );

  if (
    title.length <= 50
  ) {
    return title;
  }

  return `${title
    .slice(
      0,
      50,
    )
    .trim()}…`;
}

/* ==============================================================
   HOOK
============================================================== */

export default function useAiChat() {
  /* ============================================================
     AUTH
  ============================================================ */

  const {
    user,
    loading:
      authLoading,
  } =
    useAuth();

  const userId =
    user?.uid ??
    null;

  /* ============================================================
     STORAGE KEYS
  ============================================================ */

  const historyStorageKey =
    useMemo(
      () =>
        userId
          ? `${HISTORY_STORAGE_KEY_PREFIX}:${userId}`
          : null,
      [
        userId,
      ],
    );

  const currentChatStorageKey =
    useMemo(
      () =>
        userId
          ? `${CURRENT_CHAT_STORAGE_KEY_PREFIX}:${userId}`
          : null,
      [
        userId,
      ],
    );

  /* ============================================================
     CHAT STATE
  ============================================================ */

  const [
    state,
    dispatch,
  ] =
    useReducer(
      reducer,
      initialState,
    );

  /* ============================================================
     HISTORY STATE
  ============================================================ */

  const [
    history,
    setHistory,
  ] =
    useState<
      AiChatHistoryItem[]
    >([]);

  const [
    historyLoaded,
    setHistoryLoaded,
  ] =
    useState(false);

  /* ============================================================
     CURRENT CHAT STORAGE STATE
  ============================================================ */

  const [
    currentChatLoaded,
    setCurrentChatLoaded,
  ] =
    useState(false);

  /*
   * Protect against account switching.
   *
   * We only persist messages when the
   * currently loaded storage belongs to
   * the active Firebase user.
   */
  const [
    loadedUserId,
    setLoadedUserId,
  ] =
    useState<
      string | null
    >(null);

  /* ============================================================
     STORAGE WRITE QUEUE
  ============================================================ */

  const currentChatWriteQueue =
    useRef<
      Promise<void>
    >(
      Promise.resolve(),
    );

  /* ============================================================
     LOAD USER CHAT DATA
  ============================================================ */

  useEffect(() => {
    let mounted =
      true;

    async function loadChatData() {
      if (
        authLoading
      ) {
        return;
      }

      /* --------------------------------------------------------
         LOCK STORAGE WHILE USER CHANGES
      -------------------------------------------------------- */

      setHistoryLoaded(
        false,
      );

      setCurrentChatLoaded(
        false,
      );

      setLoadedUserId(
        null,
      );

      setHistory([]);

      dispatch({
        type:
          "CLEAR_CHAT",
      });

      /* --------------------------------------------------------
         GUEST
      -------------------------------------------------------- */

      if (
        !userId ||
        !historyStorageKey ||
        !currentChatStorageKey
      ) {
        if (
          mounted
        ) {
          setHistoryLoaded(
            true,
          );

          setCurrentChatLoaded(
            true,
          );
        }

        return;
      }

      try {
        /* ------------------------------------------------------
           LOAD BOTH STORAGE VALUES
        ------------------------------------------------------ */

        const entries =
          await AsyncStorage.multiGet([
            historyStorageKey,
            currentChatStorageKey,
          ]);

        if (
          !mounted
        ) {
          return;
        }

        const historyRaw =
          entries[0]?.[1] ??
          null;

        const currentChatRaw =
          entries[1]?.[1] ??
          null;

        /* ------------------------------------------------------
           HISTORY
        ------------------------------------------------------ */

        const storedHistory =
          parseStoredHistory(
            historyRaw,
          );

        setHistory(
          storedHistory,
        );

        /* ------------------------------------------------------
           CURRENT CHAT
        ------------------------------------------------------ */

        const storedCurrentMessages =
          parseStoredCurrentChat(
            currentChatRaw,
          );

        if (
          storedCurrentMessages
            .length > 0
        ) {
          dispatch({
            type:
              "LOAD_MESSAGES",

            payload:
              storedCurrentMessages,
          });
        } else {
          dispatch({
            type:
              "CLEAR_CHAT",
          });
        }

        /* ------------------------------------------------------
           STORAGE OWNER
        ------------------------------------------------------ */

        setLoadedUserId(
          userId,
        );
      } catch (
        error: unknown
      ) {
        if (
          __DEV__
        ) {
          console.warn(
            "AI_CHAT_STORAGE_LOAD_ERROR:",
            error,
          );
        }

        if (
          !mounted
        ) {
          return;
        }

        setHistory([]);

        dispatch({
          type:
            "CLEAR_CHAT",
        });

        setLoadedUserId(
          userId,
        );
      } finally {
        if (
          mounted
        ) {
          setHistoryLoaded(
            true,
          );

          setCurrentChatLoaded(
            true,
          );
        }
      }
    }

    void loadChatData();

    return () => {
      mounted =
        false;
    };
  }, [
    authLoading,
    currentChatStorageKey,
    historyStorageKey,
    userId,
  ]);

  /* ============================================================
     AUTO-SAVE CURRENT CHAT
  ============================================================ */

  useEffect(() => {
    if (
      !userId ||
      !currentChatStorageKey ||
      !currentChatLoaded ||
      loadedUserId !==
        userId
    ) {
      return;
    }

    const messages =
      state.messages.slice(
        -MAX_PERSISTED_CURRENT_MESSAGES,
      );

    const storageKey =
      currentChatStorageKey;

    /*
     * Serialize AsyncStorage writes.
     *
     * This prevents an older write from
     * finishing after a newer write and
     * restoring stale chat data.
     */

    currentChatWriteQueue.current =
      currentChatWriteQueue.current
        .catch(
          () =>
            undefined,
        )
        .then(
          async () => {
            /* -----------------------------------------------
               EMPTY CHAT
            ----------------------------------------------- */

            if (
              messages.length ===
              0
            ) {
              await AsyncStorage.removeItem(
                storageKey,
              );

              return;
            }

            /* -----------------------------------------------
               SAVE CHAT
            ----------------------------------------------- */

            const payload: PersistedCurrentChat =
              {
                version:
                  CURRENT_CHAT_STORAGE_VERSION,

                messages,

                updatedAt:
                  Date.now(),
              };

            await AsyncStorage.setItem(
              storageKey,
              JSON.stringify(
                payload,
              ),
            );
          },
        )
        .catch(
          (
            error: unknown,
          ) => {
            if (
              __DEV__
            ) {
              console.warn(
                "AI_CURRENT_CHAT_SAVE_ERROR:",
                error,
              );
            }
          },
        );
  }, [
    currentChatLoaded,
    currentChatStorageKey,
    loadedUserId,
    state.messages,
    userId,
  ]);

  /* ============================================================
     REMOVE PERSISTED CURRENT CHAT
  ============================================================ */

  const removePersistedCurrentChat =
    useCallback(() => {
      if (
        !userId ||
        !currentChatStorageKey ||
        loadedUserId !==
          userId
      ) {
        return;
      }

      const storageKey =
        currentChatStorageKey;

      currentChatWriteQueue.current =
        currentChatWriteQueue.current
          .catch(
            () =>
              undefined,
          )
          .then(
            async () => {
              await AsyncStorage.removeItem(
                storageKey,
              );
            },
          )
          .catch(
            (
              error: unknown,
            ) => {
              if (
                __DEV__
              ) {
                console.warn(
                  "AI_CURRENT_CHAT_REMOVE_ERROR:",
                  error,
                );
              }
            },
          );
    }, [
      currentChatStorageKey,
      loadedUserId,
      userId,
    ]);

  /* ============================================================
     PERSIST HISTORY
  ============================================================ */

  const persistHistory =
    useCallback(
      async (
        nextHistory: AiChatHistoryItem[],
      ) => {
        if (
          !userId ||
          !historyStorageKey ||
          loadedUserId !==
            userId
        ) {
          return;
        }

        const limitedHistory =
          nextHistory.slice(
            0,
            MAX_HISTORY_ITEMS,
          );

        await AsyncStorage.setItem(
          historyStorageKey,
          JSON.stringify(
            limitedHistory,
          ),
        );
      },
      [
        historyStorageKey,
        loadedUserId,
        userId,
      ],
    );

  /* ============================================================
     ADD MESSAGE
  ============================================================ */

  const addMessage =
    useCallback(
      (
        message: AiMessage,
      ) => {
        dispatch({
          type:
            "ADD_MESSAGE",

          payload:
            message,
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
          type:
            "UPDATE_MESSAGE",

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
      (
        id: string,
      ) => {
        dispatch({
          type:
            "REMOVE_MESSAGE",

          payload:
            id,
        });
      },
      [],
    );

  /* ============================================================
     SET TYPING
  ============================================================ */

  const setTyping =
    useCallback(
      (
        typing: boolean,
      ) => {
        dispatch({
          type:
            "SET_TYPING",

          payload:
            typing,
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
        type:
          "CLEAR_CHAT",
      });

      removePersistedCurrentChat();
    }, [
      removePersistedCurrentChat,
    ]);

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
            id:
              createId(
                "user",
              ),

            role:
              "user",

            content,

            ...(image
              ? {
                  image,
                }
              : {}),

            createdAt:
              Date.now(),

            status:
              "sent",
          };

        return addMessage(
          message,
        );
      },
      [
        addMessage,
      ],
    );

  /* ============================================================
     RECEIVE AI MESSAGE
  ============================================================ */

  const receiveMessage =
    useCallback(
      (
        content: string,
      ) => {
        const message: AiMessage =
          {
            id:
              createId(
                "assistant",
              ),

            role:
              "assistant",

            content,

            createdAt:
              Date.now(),

            status:
              "sent",
          };

        return addMessage(
          message,
        );
      },
      [
        addMessage,
      ],
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
          type:
            "LOAD_MESSAGES",

          payload:
            conversation.messages,
        });

        /*
         * Auto-save effect will now
         * persist this conversation as
         * the active/current chat.
         */

        return true;
      },
      [],
    );


    /* ============================================================
   ACTIVATE SAVED CONVERSATION
============================================================ */

const activateConversation =
  useCallback(
    async (
      conversation: AiChatHistoryItem,
    ) => {
      if (
        !userId ||
        !currentChatStorageKey ||
        !currentChatLoaded ||
        loadedUserId !== userId
      ) {
        return false;
      }

      const conversationMessages =
        conversation.messages
          .filter(
            isValidMessage,
          )
          .slice(
            -MAX_PERSISTED_CURRENT_MESSAGES,
          );

      if (
        conversationMessages.length ===
        0
      ) {
        return false;
      }

      const payload: PersistedCurrentChat =
        {
          version:
            CURRENT_CHAT_STORAGE_VERSION,

          messages:
            conversationMessages,

          updatedAt:
            Date.now(),
        };

      const storageKey =
        currentChatStorageKey;

      try {
        /*
         * Wait for any previous storage
         * writes before activating this chat.
         */

        currentChatWriteQueue.current =
          currentChatWriteQueue.current
            .catch(
              () =>
                undefined,
            )
            .then(
              async () => {
                await AsyncStorage.setItem(
                  storageKey,
                  JSON.stringify(
                    payload,
                  ),
                );
              },
            );

        await currentChatWriteQueue.current;

        /*
         * Keep this hook instance in sync too.
         */

        dispatch({
          type:
            "LOAD_MESSAGES",

          payload:
            conversationMessages,
        });

        return true;
      } catch (
        error: unknown
      ) {
        if (__DEV__) {
          console.warn(
            "AI_HISTORY_ACTIVATE_ERROR:",
            error,
          );
        }

        return false;
      }
    },
    [
      currentChatLoaded,
      currentChatStorageKey,
      loadedUserId,
      userId,
    ],
  );

  /* ============================================================
     SAVE CURRENT CHAT
  ============================================================ */

  const saveCurrentChat =
    useCallback(async () => {
      if (
        !userId ||
        loadedUserId !==
          userId ||
        !currentChatLoaded
      ) {
        return null;
      }

      const currentMessages =
        state.messages.filter(
          (message) =>
            message.role ===
              "user" ||
            message.role ===
              "assistant",
        );

      /* --------------------------------------------------------
         EMPTY
      -------------------------------------------------------- */

      if (
        currentMessages.length ===
        0
      ) {
        return null;
      }

      /* --------------------------------------------------------
         AI STILL RESPONDING
      -------------------------------------------------------- */

      if (
        state.isTyping
      ) {
        return null;
      }

      const now =
        Date.now();

      const savedChat: AiChatHistoryItem =
        {
          id:
            createId(
              "chat",
            ),

          title:
            createChatTitle(
              currentMessages,
            ),

          messages:
            currentMessages,

          createdAt:
            currentMessages[0]
              ?.createdAt ??
            now,

          updatedAt:
            now,
        };

      /*
       * Newest first.
       *
       * Maximum 5 explicit history items.
       */

      const nextHistory =
        [
          savedChat,
          ...history,
        ].slice(
          0,
          MAX_HISTORY_ITEMS,
        );

      await persistHistory(
        nextHistory,
      );

      setHistory(
        nextHistory,
      );

      return savedChat;
    }, [
      currentChatLoaded,
      history,
      loadedUserId,
      persistHistory,
      state.isTyping,
      state.messages,
      userId,
    ]);

  /* ============================================================
     CLEAR + START NEW
  ============================================================ */

  const clearAndStartNew =
    useCallback(() => {
      dispatch({
        type:
          "CLEAR_CHAT",
      });

      removePersistedCurrentChat();
    }, [
      removePersistedCurrentChat,
    ]);

  /* ============================================================
     SAVE + START NEW
  ============================================================ */

  const saveAndStartNew =
    useCallback(async () => {
      const savedChat =
        await saveCurrentChat();

      dispatch({
        type:
          "CLEAR_CHAT",
      });

      removePersistedCurrentChat();

      return savedChat;
    }, [
      removePersistedCurrentChat,
      saveCurrentChat,
    ]);

  /* ============================================================
     DELETE HISTORY ITEM
  ============================================================ */

  const deleteHistoryItem =
    useCallback(
      async (
        id: string,
      ) => {
        const normalizedId =
          id.trim();

        if (
          !normalizedId
        ) {
          return false;
        }

        const nextHistory =
          history.filter(
            (item) =>
              item.id !==
              normalizedId,
          );

        if (
          nextHistory.length ===
          history.length
        ) {
          return false;
        }

        await persistHistory(
          nextHistory,
        );

        setHistory(
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
      if (
        !userId ||
        !historyStorageKey ||
        loadedUserId !==
          userId
      ) {
        setHistory([]);

        return;
      }

      await AsyncStorage.removeItem(
        historyStorageKey,
      );

      setHistory([]);
    }, [
      historyStorageKey,
      loadedUserId,
      userId,
    ]);

  /* ============================================================
     FIND HISTORY ITEM
  ============================================================ */

  const getHistoryItem =
    useCallback(
      (
        id: string,
      ) => {
        return (
          history.find(
            (item) =>
              item.id ===
              id,
          ) ??
          null
        );
      },
      [
        history,
      ],
    );

  /* ============================================================
     CONVERSATION MESSAGES
  ============================================================ */

  const conversationMessages =
    useMemo<
      ChatMessage[]
    >(
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
      [
        state.messages,
      ],
    );

  /* ============================================================
     DERIVED STATE
  ============================================================ */

  const hasCurrentChat =
    state.messages.length >
    0;

  const hasUserMessages =
    state.messages.some(
      (message) =>
        message.role ===
          "user" &&
        message.content
          .trim()
          .length > 0,
    );

  const canSaveCurrentChat =
    hasUserMessages &&
    !state.isTyping &&
    historyLoaded &&
    currentChatLoaded &&
    Boolean(
      userId &&
      loadedUserId ===
        userId,
    );

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

    currentChatLoaded,

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

activateConversation,

deleteHistoryItem,

clearAllHistory,

getHistoryItem,
  };
}