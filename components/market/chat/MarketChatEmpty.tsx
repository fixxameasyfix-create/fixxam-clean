import React, {
  memo,
} from "react";

import {
  View,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  CustomerColors,
} from "@/theme";

import {
  styles,
} from "./marketChatStyles";

/* ============================================================
   COMPONENT
============================================================ */

function MarketChatEmptyComponent() {
  return (
    <View
      accessible
      accessibilityLabel="No messages yet. Start a conversation with the store about this order."
      style={
        styles.emptyContainer
      }
    >
      <View
        style={
          styles.emptyIcon
        }
      >
        <AppIcon
          name="messages"
          role="customer"
          size="md"
          color={
            CustomerColors.primary
          }
        />
      </View>

      <AppText
        variant="bodyMedium"
        weight="semibold"
        center
        style={
          styles.emptyTitle
        }
      >
        No messages yet
      </AppText>

      <AppText
        variant="caption"
        tone="secondary"
        center
        style={
          styles.emptyText
        }
      >
        Send a message to the store about this order.
      </AppText>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

const MarketChatEmpty =
  memo(
    MarketChatEmptyComponent,
  );

MarketChatEmpty.displayName =
  "MarketChatEmpty";

export default MarketChatEmpty;