import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
} from "react-native";

import { Image } from "expo-image";
import { router } from "expo-router";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import {
  AppCard,
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  formatOrderNumber,
} from "./orders.utils";

import type {
  MarketOrder,
} from "./orders.types";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  order: MarketOrder;
  onPress: () => void;
};

type ChatArrowState =
  | "empty"
  | "customer"
  | "seller";

type ChatDocument = {
  lastMessageSenderId?: unknown;
  lastMessage?: unknown;
};

type StatusBadgeVariant =
  | "primary"
  | "neutral"
  | "success"
  | "warning"
  | "error"
  | "info";

/* ==============================================================
   HELPERS
============================================================== */

function formatCurrency(amount: number): string {
  return `₦${Math.max(0, amount).toLocaleString("en-NG")}`;
}

function getStatusLabel(
  status: MarketOrder["status"],
): string {
  switch (status) {
    case "accepted":
      return "ACCEPTED";
    case "in-progress":
      return "ON THE WAY";
    case "completed":
      return "COMPLETED";
    case "cancelled":
      return "CANCELLED";
    case "expired":
      return "EXPIRED";
    case "pending":
    default:
      return "PENDING";
  }
}

function getStatusVariant(
  status: MarketOrder["status"],
): StatusBadgeVariant {
  switch (status) {
    case "accepted":
      return "info";
    case "in-progress":
      return "primary";
    case "completed":
      return "success";
    case "cancelled":
      return "error";
    case "expired":
      return "neutral";
    case "pending":
    default:
      return "warning";
  }
}

function getOrderMessage(
  order: MarketOrder,
): string {
  switch (order.status) {
    case "in-progress":
      return "Seller is on the way";
    case "completed":
      return "Delivered";
    case "accepted":
      return "Seller is preparing your order";
    case "cancelled":
      return "Order cancelled";
    case "expired":
      return "Order expired";
    case "pending":
    default:
      return "Waiting for seller response";
  }
}

function getStatusColors(
  variant: StatusBadgeVariant,
) {
  switch (variant) {
    case "primary":
      return {
        text: CustomerColors.primary,
        background: CustomerColors.primarySoft,
      };

    case "info":
      return {
        text: Colors.info,
        background: Colors.infoSoft,
      };

    case "success":
      return {
        text: Colors.success,
        background: Colors.successSoft,
      };

    case "warning":
      return {
        text: Colors.warning,
        background: Colors.warningSoft,
      };

    case "error":
      return {
        text: Colors.error,
        background: Colors.errorSoft,
      };

    case "neutral":
    default:
      return {
        text: Colors.textSecondary,
        background: Colors.iconBackground,
      };
  }
}

/* ==============================================================
   STATUS BADGE
============================================================== */

const CompactStatusBadge = memo(
  function CompactStatusBadge({
    status,
  }: {
    status: MarketOrder["status"];
  }) {
    const label = getStatusLabel(status);

    const colors = getStatusColors(
      getStatusVariant(status),
    );

    return (
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <View
          style={[
            styles.statusBadgeDot,
            {
              backgroundColor: colors.text,
            },
          ]}
        />

        <AppText
          variant="caption"
          weight="bold"
          numberOfLines={1}
          style={[
            styles.statusBadgeText,
            {
              color: colors.text,
            },
          ]}
        >
          {label}
        </AppText>
      </View>
    );
  },
);

CompactStatusBadge.displayName = "CompactStatusBadge";

/* ==============================================================
   CHAT BUTTON
============================================================== */

const ChatButton = memo(
  function ChatButton({
    state,
    orderId,
    onPress,
  }: {
    state: ChatArrowState;
    orderId: string;
    onPress: (
      event: GestureResponderEvent,
    ) => void;
  }) {
    const isCustomer = state === "customer";
    const isSeller = state === "seller";
    const hasMessage = isCustomer || isSeller;

    const iconName = isCustomer
      ? "arrow-up"
      : isSeller
        ? "arrow-down"
        : "message-outline";

    const iconColor = hasMessage
      ? Colors.textInverse
      : Colors.textSecondary;

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          isCustomer
            ? `Open chat for order ${orderId}. You sent the last message.`
            : isSeller
              ? `Open chat for order ${orderId}. Seller sent the last message.`
              : `Open chat for order ${orderId}. No messages yet.`
        }
        hitSlop={8}
        onPress={onPress}
        style={({ pressed }) => [
          styles.chatButton,

          isCustomer
            ? styles.chatButtonCustomer
            : isSeller
              ? styles.chatButtonSeller
              : styles.chatButtonEmpty,

          pressed && styles.chatPressed,
        ]}
      >
        <MaterialCommunityIcons
          name={iconName}
          size={16}
          color={iconColor}
        />
      </Pressable>
    );
  },
);

ChatButton.displayName = "ChatButton";

/* ==============================================================
   MARKET ORDER CARD
============================================================== */

function MarketOrderCard({
  order,
  onPress,
}: Props) {
  const product = order.products[0];

  const orderId = useMemo(
    () => String(order.id ?? "").trim(),
    [order.id],
  );

  /* ============================================================
     ITEM COUNT
  ============================================================ */

  const itemCount = useMemo(() => {
    if (
      typeof order.itemCount === "number" &&
      Number.isFinite(order.itemCount)
    ) {
      return Math.max(
        0,
        Math.floor(order.itemCount),
      );
    }

    return order.products.reduce(
      (total, item) =>
        total +
        Math.max(
          1,
          Math.floor(item.quantity),
        ),
      0,
    );
  }, [
    order.itemCount,
    order.products,
  ]);

  /* ============================================================
     TOTAL
  ============================================================ */

  const total = useMemo(() => {
    if (
      typeof order.total === "number" &&
      Number.isFinite(order.total)
    ) {
      return Math.max(0, order.total);
    }

    return order.products.reduce(
      (sum, item) =>
        sum +
        Math.max(0, item.price) *
          Math.max(1, item.quantity),
      0,
    );
  }, [
    order.products,
    order.total,
  ]);

  /* ============================================================
     CHAT STATE
  ============================================================ */

  const [
    chatArrowState,
    setChatArrowState,
  ] = useState<ChatArrowState>("empty");

  const currentUserId =
    auth.currentUser?.uid ?? "";

  useEffect(() => {
    if (!orderId) {
      setChatArrowState("empty");
      return;
    }

    const chatRef = doc(
      db,
      "marketChats",
      orderId,
    );

    return onSnapshot(
      chatRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setChatArrowState("empty");
          return;
        }

        const data =
          snapshot.data() as ChatDocument;

        const lastMessage =
          typeof data.lastMessage === "string"
            ? data.lastMessage.trim()
            : "";

        const senderId =
          typeof data.lastMessageSenderId === "string"
            ? data.lastMessageSenderId.trim()
            : "";

        if (!lastMessage || !senderId) {
          setChatArrowState("empty");
          return;
        }

        setChatArrowState(
          currentUserId &&
            senderId === currentUserId
            ? "customer"
            : "seller",
        );
      },
      (error) => {
        console.error(
          "MARKET_ORDER_CHAT_LISTENER_ERROR:",
          error,
        );

        setChatArrowState("empty");
      },
    );
  }, [
    currentUserId,
    orderId,
  ]);

  /* ============================================================
     CHAT NAVIGATION
  ============================================================ */

  const handleChatPress = useCallback(
    (event: GestureResponderEvent) => {
      event.stopPropagation();

      if (!orderId) {
        return;
      }

      router.push({
        pathname: "/(customer)/orders/market/chat",
        params: {
          orderId,
        },
      });
    },
    [orderId],
  );

  /* ============================================================
     STATUS
  ============================================================ */

  const completed = order.status === "completed";
  const onTheWay = order.status === "in-progress";

  const statusMessage = getOrderMessage(order);

  /* ============================================================
     UI
  ============================================================ */

  return (
    <AppCard
      role="customer"
      variant="outlined"
      onPress={onPress}
      accessibilityLabel={`Open ${
        product?.name ?? "market"
      } order`}
      style={styles.card}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <CompactStatusBadge
          status={order.status}
        />

        <AppText
          variant="caption"
          tone="muted"
          numberOfLines={1}
          style={styles.orderNumber}
        >
          {formatOrderNumber(order.id)}
        </AppText>
      </View>

      {/* PRODUCT */}

      <View style={styles.productRow}>
        {product?.image ? (
          <Image
            source={{
              uri: product.image,
            }}
            style={styles.productImage}
            contentFit="cover"
            transition={FixxamTokens.motion.fast}
            cachePolicy="memory-disk"
            accessibilityLabel={
              product.name
                ? `${product.name} image`
                : "Product image"
            }
          />
        ) : (
          <View style={styles.productPlaceholder}>
            <AppIcon
              name="package"
              role="customer"
              size="sm"
              state="active"
            />
          </View>
        )}

        {/* PRODUCT INFORMATION */}

        <View style={styles.productInfo}>
          <View style={styles.productTopRow}>
            <AppText
              variant="bodyMedium"
              weight="semibold"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.productName}
            >
              {product?.name ?? "Market Order"}
            </AppText>

            <AppText
              variant="caption"
              weight="bold"
              numberOfLines={1}
              style={styles.total}
            >
              {formatCurrency(total)}
            </AppText>
          </View>

          {/* STORE AND ITEMS */}

          <View style={styles.metaRow}>
            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.storeName}
            >
              {order.storeName ?? "Seller"}
            </AppText>

            <View style={styles.metaDot} />

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={styles.itemCount}
            >
              {itemCount}{" "}
              {itemCount === 1 ? "item" : "items"}
            </AppText>
          </View>

          {/* ORDER STATUS */}

          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                completed && styles.statusDotSuccess,
                onTheWay && styles.statusDotActive,
              ]}
            />

            <AppText
              variant="caption"
              tone={
                completed || onTheWay
                  ? "success"
                  : "secondary"
              }
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.statusText}
            >
              {statusMessage}
            </AppText>
          </View>
        </View>

        {/* CHAT BUTTON */}

        <ChatButton
          state={chatArrowState}
          orderId={orderId}
          onPress={handleChatPress}
        />
      </View>
    </AppCard>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  card: {
    width: "100%",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
  },

  /* HEADER */

  header: {
    minHeight: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  statusBadge: {
    minHeight: 20,
    paddingHorizontal: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: 6,
  },

  statusBadgeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  statusBadgeText: {
    fontSize: 8,
    lineHeight: 10,
    letterSpacing: 0.45,
    includeFontPadding: false,
  },

  orderNumber: {
    flexShrink: 1,
    maxWidth: 130,
    fontSize: 10,
    lineHeight: 13,
    includeFontPadding: false,
  },

  /* PRODUCT */

  productRow: {
    marginTop: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 58,
  },

  productImage: {
    width: 56,
    height: 56,
    flexShrink: 0,
    borderRadius: 12,
    backgroundColor: Colors.iconBackground,
  },

  productPlaceholder: {
    width: 56,
    height: 56,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: CustomerColors.primarySoft,
  },

  /* PRODUCT INFORMATION */

  productInfo: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },

  productTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },

  productName: {
    flex: 1,
    minWidth: 0,
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 19,
  },

  total: {
    flexShrink: 0,
    color: CustomerColors.primary,
    fontSize: 13,
    lineHeight: 17,
  },

  /* STORE AND ITEMS */

  metaRow: {
    marginTop: 3,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  storeName: {
    flexShrink: 1,
    maxWidth: "62%",
    fontSize: 10,
    lineHeight: 14,
  },

  itemCount: {
    flexShrink: 0,
    fontSize: 10,
    lineHeight: 14,
  },

  metaDot: {
    width: 3,
    height: 3,
    flexShrink: 0,
    marginHorizontal: 5,
    borderRadius: 2,
    backgroundColor: Colors.textMuted,
  },

  /* ORDER STATUS */

  statusRow: {
    minWidth: 0,
    marginTop: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  statusDot: {
    width: 5,
    height: 5,
    flexShrink: 0,
    borderRadius: 3,
    backgroundColor: Colors.textMuted,
  },

  statusDotSuccess: {
    backgroundColor: Colors.success,
  },

  statusDotActive: {
    backgroundColor: CustomerColors.primary,
  },

  statusText: {
    flex: 1,
    minWidth: 0,
    fontSize: 10,
    lineHeight: 14,
  },

  /* CHAT BUTTON */

  chatButton: {
    width: 34,
    height: 34,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
  },

  chatButtonEmpty: {
    backgroundColor: Colors.iconBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },

  chatButtonCustomer: {
    backgroundColor: CustomerColors.primary,
  },

  chatButtonSeller: {
    backgroundColor: Colors.success,
  },

  chatPressed: {
    opacity: FixxamTokens.motion.pressedOpacity,
    transform: [
      {
        scale: FixxamTokens.motion.scalePressed,
      },
    ],
  },
});

MarketOrderCard.displayName = "MarketOrderCard";

export default memo(MarketOrderCard);