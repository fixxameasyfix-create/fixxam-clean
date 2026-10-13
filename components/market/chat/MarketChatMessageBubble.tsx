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
} from "./marketChatHelpers";

import {
  styles,
} from "./marketChatStyles";

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

function MarketChatMessageBubbleComponent({
  message,
  isMine,
}: Props) {
  const messageText =
    typeof message.text ===
    "string"
      ? message.text.trim()
      : "";

  if (!messageText) {
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
          "worker"
        ? "Store"
        : "Customer";

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
            : styles.sellerBubble,
        ]}
      >
        <AppText
          variant="body"
          style={[
            styles.messageText,

            isMine
              ? styles.myMessageText
              : styles.sellerMessageText,
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
                : styles.sellerMessageTime,
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

const MarketChatMessageBubble =
  memo(
    MarketChatMessageBubbleComponent,
  );

MarketChatMessageBubble.displayName =
  "MarketChatMessageBubble";

export default MarketChatMessageBubble;