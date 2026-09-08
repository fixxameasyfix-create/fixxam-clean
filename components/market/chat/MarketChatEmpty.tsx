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

function MarketChatEmptyComponent() {
  return (
    <View
      style={
        styles.emptyContainer
      }
      accessibilityLabel="No messages yet"
    >
      <View
        style={
          styles.emptyIcon
        }
      >
        <AppIcon
          name="messages"
          role="customer"
          size="lg"
          color={
            CustomerColors.primary
          }
        />
      </View>

      <AppText
        variant="body"
        weight="bold"
        center
        style={
          styles.emptyTitle
        }
      >
        Start a conversation
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

const MarketChatEmpty =
  memo(
    MarketChatEmptyComponent,
  );

MarketChatEmpty.displayName =
  "MarketChatEmpty";

export default MarketChatEmpty;