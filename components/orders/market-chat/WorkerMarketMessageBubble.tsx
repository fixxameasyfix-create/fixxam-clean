import React, {
  memo,
} from "react";

import {
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

import {
  formatTime,
} from "@/components/market/chat/marketChatHelpers";

import {
  styles,
} from "./workerMarketChatStyles";

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

type Props = {
  message: ChatMessage;

  isMine: boolean;
};

/* ============================================================
   COMPONENT
============================================================ */

function WorkerMarketMessageBubbleComponent({
  message,
  isMine,
}: Props) {
  const messageText =
    typeof message.text ===
    "string"
      ? message.text.trim()
      : "";

  if (
    !messageText
  ) {
    return null;
  }

  const formattedTime =
    message.createdAt > 0
      ? formatTime(
          message.createdAt,
        )
      : "";

  const senderLabel =
    isMine
      ? "You"
      : message.senderRole ===
          "customer"
        ? "Customer"
        : "Worker";

  return (
    <View
      style={[
        styles.messageRow,

        isMine
          ? styles.messageRowMine
          : null,
      ]}
      accessible
      accessibilityLabel={
        formattedTime
          ? `${senderLabel}: ${messageText}. Sent at ${formattedTime}`
          : `${senderLabel}: ${messageText}`
      }
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
          variant="body"
          style={[
            styles.messageText,

            isMine
              ? styles.myMessageText
              : styles.customerMessageText,
          ]}
        >
          {messageText}
        </AppText>

        {formattedTime ? (
          <AppText
            variant="caption"
            style={[
              styles.messageTime,

              isMine
                ? styles.myMessageTime
                : styles.customerMessageTime,
            ]}
          >
            {formattedTime}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

const WorkerMarketMessageBubble =
  memo(
    WorkerMarketMessageBubbleComponent,
  );

WorkerMarketMessageBubble.displayName =
  "WorkerMarketMessageBubble";

export default WorkerMarketMessageBubble;