import React from "react";

import { AiMessage as AiMessageType } from "../types";
import AssistantBubble from "./AssistantBubble";
import UserBubble from "./UserBubble";

interface AiMessageProps {
  message: AiMessageType;
  onCopy?: (text: string) => void;
}

export default function AiMessage({
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