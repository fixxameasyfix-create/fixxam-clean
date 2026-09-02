import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import {
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";

import {
  Conversation,
  ConversationMessage,
} from "./types";

const conversationsRef = (userId: string) =>
  collection(db, "users", userId, "aiConversations");

const messagesRef = (
  userId: string,
  conversationId: string,
) =>
  collection(
    db,
    "users",
    userId,
    "aiConversations",
    conversationId,
    "messages",
  );

export async function createConversation(
  userId: string,
  title = "New Conversation",
): Promise<string> {
  const conversation = await addDoc(
    conversationsRef(userId),
    {
      title,
      language: "auto",
      status: "active",
      lastMessage: "",
      lastMessageRole: "assistant",
      serviceCategory: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  );

  return conversation.id;
}

export async function getConversation(
  userId: string,
  conversationId: string,
): Promise<Conversation | null> {
  const snapshot = await getDoc(
    doc(
      db,
      "users",
      userId,
      "aiConversations",
      conversationId,
    ),
  );

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<
      Conversation,
      "id"
    >),
  };
}

export async function listConversations(
  userId: string,
): Promise<Conversation[]> {
  const snapshot = await getDocs(
    query(
      conversationsRef(userId),
      orderBy("updatedAt", "desc"),
      limit(50),
    ),
  );

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...(docItem.data() as Omit<
      Conversation,
      "id"
    >),
  }));
}

export async function saveMessage(
  userId: string,
  conversationId: string,
  message: ConversationMessage,
): Promise<void> {
  const messageDoc = doc(
    messagesRef(userId, conversationId),
    message.id,
  );

  await setDoc(messageDoc, {
    ...message,
    createdAt: serverTimestamp(),
  });

  await updateDoc(
    doc(
      db,
      "users",
      userId,
      "aiConversations",
      conversationId,
    ),
    {
      lastMessage: message.content,
      lastMessageRole: message.role,
      updatedAt: serverTimestamp(),
    },
  );
}

export async function loadMessages(
  userId: string,
  conversationId: string,
): Promise<ConversationMessage[]> {
  const snapshot = await getDocs(
    query(
      messagesRef(userId, conversationId),
      orderBy("createdAt", "asc"),
    ),
  );

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...(docItem.data() as Omit<
      ConversationMessage,
      "id"
    >),
  }));
}

export async function archiveConversation(
  userId: string,
  conversationId: string,
): Promise<void> {
  await updateDoc(
    doc(
      db,
      "users",
      userId,
      "aiConversations",
      conversationId,
    ),
    {
      status: "archived",
      updatedAt: serverTimestamp(),
    },
  );
}

export async function deleteConversation(
  userId: string,
  conversationId: string,
): Promise<void> {
  await deleteDoc(
    doc(
      db,
      "users",
      userId,
      "aiConversations",
      conversationId,
    ),
  );
}


export function subscribeToMessages(
  userId: string,
  conversationId: string,
  onMessages: (
    messages: ConversationMessage[],
  ) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const messagesQuery = query(
    messagesRef(userId, conversationId),
    orderBy("createdAt", "asc"),
  );

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      const messages = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...(docItem.data() as Omit<
          ConversationMessage,
          "id"
        >),
      }));

      onMessages(messages);
    },
    (error) => {
      console.error(
        "Failed to subscribe to conversation messages.",
        error,
      );

      onError?.(error);
    },
  );
}