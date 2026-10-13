import React, {
  memo,
} from "react";

import {
  Pressable,
  View,
} from "react-native";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

import {
  shortOrderId,
} from "@/components/market/chat/marketChatHelpers";

import {
  styles,
} from "./workerMarketChatStyles";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  orderId: string;

  deleting: boolean;

  onBack: () => void;

  onOpenMenu: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

function WorkerMarketChatHeader({
  orderId,
  deleting,
  onBack,
  onOpenMenu,
}: Props) {
  const insets =
    useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,

        {
          paddingTop:
            Math.max(
              insets.top,
              FixxamTokens.spacing.sm,
            ),
        },
      ]}
    >
      {/* ======================================================
          BACK
      ====================================================== */}

      <Pressable
        onPress={
          onBack
        }
        disabled={
          deleting
        }
        hitSlop={
          8
        }
        accessibilityRole="button"
        accessibilityLabel="Go back"
        accessibilityState={{
          disabled:
            deleting,
        }}
        style={[
          styles.headerButton,

          deleting
            ? styles.disabled
            : null,
        ]}
      >
        <AppIcon
          name="back"
          size="md"
          color={
            Colors.textPrimary
          }
        />
      </Pressable>

      {/* ======================================================
          CUSTOMER + ORDER
      ====================================================== */}

      <View
        style={
          styles.headerInfo
        }
      >
        <AppText
          variant="bodyMedium"
          weight="semibold"
          numberOfLines={
            1
          }
          style={
            styles.headerTitle
          }
        >
          Customer
        </AppText>

        <View
          style={
            styles.onlineRow
          }
        >
          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={
              1
            }
            style={
              styles.onlineText
            }
          >
            Order #
            {shortOrderId(
              orderId,
            )}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          MENU
      ====================================================== */}

      <Pressable
        onPress={
          onOpenMenu
        }
        disabled={
          deleting
        }
        hitSlop={
          8
        }
        accessibilityRole="button"
        accessibilityLabel="Open chat options"
        accessibilityState={{
          disabled:
            deleting,
        }}
        style={[
          styles.menuButton,

          deleting
            ? styles.disabled
            : null,
        ]}
      >
        <AppIcon
          name="more"
          size="md"
          color={
            Colors.textPrimary
          }
        />
      </Pressable>
    </View>
  );
}

export default memo(
  WorkerMarketChatHeader,
);