import React, {
  memo,
} from "react";

import type {
  AiMessage as AiMessageType,
} from "../types";

import AssistantBubble from "./AssistantBubble";
import UserBubble from "./UserBubble";

/* ==============================================================
   TYPES
============================================================== */

interface AiMessageProps {
  message: AiMessageType;

  onCopy?: (
    text: string,
  ) => void;
}

/* ==============================================================
   COMPONENT
============================================================== */

function AiMessage({
  message,
  onCopy,
}: AiMessageProps) {
  switch (message.role) {
    case "assistant":
      return (
        <AssistantBubble
          message={message}
          onCopy={onCopy}
        />
      );

    case "user":
      return (
        <UserBubble
          message={message}
        />
      );

    default:
      return null;
  }
}

export default memo(
  AiMessage,
);