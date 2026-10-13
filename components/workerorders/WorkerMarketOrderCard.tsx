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

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";

import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import {
  auth,
  db,
} from "@/firebase/config";

import type {
  WorkerMarketOrder,
} from "@/types/workerOrders";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  order: WorkerMarketOrder;
  onPress: (order: WorkerMarketOrder) => void;
  onChatPress?: (order: WorkerMarketOrder) => void;
};

type ChatState =
  | "empty"
  | "customer"
  | "worker"
  | "seller";

type MessageData = {
  senderId?: unknown;
  senderRole?: unknown;
  text?: unknown;
};

type StatusConfig = {
  label: string;
  backgroundColor: string;
  color: string;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const PRODUCT_IMAGE_SIZE = 48;
const ACTION_SIZE = 36;
const ACTION_ICON_SIZE = 16;

/* ==============================================================
   HELPERS
============================================================== */

function getString(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return String(value);
  }

  return "";
}

function getOptionalNumber(
  value: unknown,
): number | undefined {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/[₦,\s]/g, "");

    if (!cleaned) {
      return undefined;
    }

    const parsed = Number(cleaned);

    return Number.isFinite(parsed)
      ? parsed
      : undefined;
  }

  return undefined;
}

function getSafeNumber(
  value: unknown,
  fallback = 0,
): number {
  return getOptionalNumber(value) ?? fallback;
}

function formatMoney(value: unknown): string {
  const amount = Math.max(0, getSafeNumber(value));

  return `₦${amount.toLocaleString("en-NG", {
    maximumFractionDigits: 2,
  })}`;
}

function normalizeStatus(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");
}

/* ==============================================================
   STATUS
============================================================== */

function getStatusConfig(status: unknown): StatusConfig {
  switch (normalizeStatus(status)) {
    case "accepted":
      return {
        label: "Accepted",
        backgroundColor: Colors.infoSoft,
        color: Colors.info,
      };

    case "in-progress":
      return {
        label: "Active",
        backgroundColor: Colors.infoSoft,
        color: Colors.info,
      };

    case "completed":
      return {
        label: "Completed",
        backgroundColor: Colors.successSoft,
        color: Colors.success,
      };

    case "cancelled":
    case "canceled":
      return {
        label: "Cancelled",
        backgroundColor: Colors.errorSoft,
        color: Colors.error,
      };

    case "expired":
      return {
        label: "Expired",
        backgroundColor: Colors.disabledBackground,
        color: Colors.textSecondary,
      };

    case "pending":
    default:
      return {
        label: "Pending",
        backgroundColor: Colors.warningSoft,
        color: Colors.warning,
      };
  }
}

const StatusBadge = memo(function StatusBadge({
  status,
}: {
  status: unknown;
}) {
  const config = useMemo(
    () => getStatusConfig(status),
    [status],
  );

  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor: config.backgroundColor,
        },
      ]}
    >
      <AppText
        variant="caption"
        weight="bold"
        numberOfLines={1}
        style={[
          styles.statusText,
          {
            color: config.color,
          },
        ]}
      >
        {config.label}
      </AppText>
    </View>
  );
});

StatusBadge.displayName =
  "WorkerMarketOrderStatusBadge";

/* ==============================================================
   CHAT STATE
============================================================== */

function resolveMessageState(
  data: MessageData,
  currentUserId: string,
): ChatState {
  if (!getString(data.text)) {
    return "empty";
  }

  const senderId = getString(data.senderId);

  if (
    currentUserId &&
    senderId === currentUserId
  ) {
    return "worker";
  }

  const senderRole = getString(
    data.senderRole,
  ).toLowerCase();

  if (
    senderRole === "customer" ||
    senderRole === "client"
  ) {
    return "customer";
  }

  if (senderRole === "seller") {
    return "seller";
  }

  if (senderRole === "worker") {
    return "worker";
  }

  if (senderId && senderId !== currentUserId) {
    return "customer";
  }

  return "empty";
}

/* ==============================================================
   ACTION BUTTON
============================================================== */

const CardAction = memo(function CardAction({
  state,
  orderId,
  onPress,
}: {
  state: ChatState;
  orderId: string;
  onPress: (event: GestureResponderEvent) => void;
}) {
  const hasChat = state !== "empty";

  const backgroundColor =
    state === "customer"
      ? CustomerColors.primary
      : state === "worker" || state === "seller"
        ? WorkerColors.primary
        : Colors.background;

  const iconColor = hasChat
    ? Colors.textInverse
    : Colors.textSecondary;

  const iconName =
    state === "customer"
      ? "arrow-down"
      : state === "worker" || state === "seller"
        ? "arrow-up"
        : "chevron-right";

  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={`Open chat for order ${orderId}`}
      accessibilityHint="Opens the conversation for this order"
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor,
        },
        pressed && styles.actionPressed,
      ]}
    >
      <MaterialCommunityIcons
        name={iconName}
        size={ACTION_ICON_SIZE}
        color={iconColor}
      />
    </Pressable>
  );
});

CardAction.displayName =
  "WorkerMarketOrderCardAction";

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerMarketOrderCard({
  order,
  onPress,
  onChatPress,
}: Props) {
  const [chatState, setChatState] =
    useState<ChatState>("empty");

  const orderId = useMemo(
    () => getString(order.id),
    [order.id],
  );

  const productName = useMemo(
    () =>
      getString(order.productName) ||
      getString(order.products?.[0]?.name) ||
      "Market Order",
    [order.productName, order.products],
  );

  const productImage = useMemo(
    () =>
      getString(order.productImage) ||
      getString(order.products?.[0]?.image),
    [order.productImage, order.products],
  );

  const customerName = useMemo(
    () => getString(order.customerName) || "Customer",
    [order.customerName],
  );

  const itemCount = useMemo(() => {
    const explicitCount = getOptionalNumber(
      order.itemCount,
    );

    if (
      explicitCount !== undefined &&
      explicitCount > 0
    ) {
      return Math.max(
        1,
        Math.floor(explicitCount),
      );
    }

    if (Array.isArray(order.products)) {
      const count = order.products.reduce(
        (total, product) =>
          total +
          Math.max(
            1,
            Math.floor(
              getSafeNumber(product.quantity, 1),
            ),
          ),
        0,
      );

      if (count > 0) {
        return count;
      }
    }

    return 1;
  }, [order.itemCount, order.products]);

  const total = useMemo(() => {
    const directValues = [
      order.total,
      order.totalAmount,
      order.amount,
    ];

    for (const value of directValues) {
      const parsed = getOptionalNumber(value);

      if (parsed !== undefined) {
        return Math.max(0, parsed);
      }
    }

    if (Array.isArray(order.products)) {
      const calculated = order.products.reduce(
        (sum, product) =>
          sum +
          Math.max(0, getSafeNumber(product.price)) *
            Math.max(
              1,
              Math.floor(
                getSafeNumber(product.quantity, 1),
              ),
            ),
        0,
      );

      if (calculated > 0) {
        return calculated;
      }
    }

    return Math.max(
      0,
      getSafeNumber(order.offerAmount),
    );
  }, [
    order.amount,
    order.offerAmount,
    order.products,
    order.total,
    order.totalAmount,
  ]);

  const status = normalizeStatus(order.status);
  const isPending = status === "pending";

  const offerAmount = getOptionalNumber(
    order.offerAmount,
  );

  const hasOffer =
    normalizeStatus(order.offerStatus) === "sent" &&
    offerAmount !== undefined;

  const responseText = useMemo(() => {
    if (isPending) {
      return hasOffer
        ? "Waiting for customer"
        : "Waiting for response";
    }

    switch (status) {
      case "accepted":
        return "Order accepted";

      case "in-progress":
        return "Order in progress";

      case "completed":
        return "Order completed";

      case "cancelled":
      case "canceled":
        return "Order cancelled";

      case "expired":
        return "Order expired";

      default:
        return "View order details";
    }
  }, [hasOffer, isPending, status]);

  /* ============================================================
     FIRESTORE CHAT LISTENER
  ============================================================ */

  useEffect(() => {
    const currentUserId = auth.currentUser?.uid;

    if (!currentUserId || !orderId) {
      setChatState("empty");
      return;
    }

    const messagesQuery = query(
      collection(
        db,
        "marketChats",
        orderId,
        "messages",
      ),
      orderBy("createdAt", "desc"),
      limit(1),
    );

    return onSnapshot(
      messagesQuery,
      (snapshot) => {
        if (snapshot.empty) {
          setChatState("empty");
          return;
        }

        const message = snapshot.docs[0]
          .data() as MessageData;

        setChatState(
          resolveMessageState(message, currentUserId),
        );
      },
      (error) => {
        console.error(
          "WORKER_MARKET_ORDER_CHAT_LISTENER_ERROR:",
          error,
        );

        setChatState("empty");
      },
    );
  }, [orderId]);

  /* ============================================================
     HANDLERS
  ============================================================ */

  const handlePress = useCallback(() => {
    if (!orderId) {
      return;
    }

    onPress(order);
  }, [onPress, order, orderId]);

  // The arrow always opens chat, even if no messages exist.
  const handleActionPress = useCallback(
    (event: GestureResponderEvent) => {
      event.stopPropagation();

      if (!orderId) {
        return;
      }

      if (onChatPress) {
        onChatPress(order);
        return;
      }

      // Do not silently open order details when the chat
      // callback has not been connected by the parent.
      console.warn(
        "WorkerMarketOrderCard: onChatPress is required to open chat.",
      );
    },
    [onChatPress, order, orderId],
  );

  /* ============================================================
     UI
  ============================================================ */

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`View market order ${
        orderId || "unknown"
      }`}
      accessibilityHint="Opens order details"
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <StatusBadge status={order.status} />

        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={1}
          style={styles.orderNumber}
        >
          {orderId ? `#${orderId}` : "#—"}
        </AppText>
      </View>

      {/* ORDER SUMMARY */}

      <View style={styles.contentRow}>
        {productImage ? (
          <Image
            source={{ uri: productImage }}
            contentFit="cover"
            transition={150}
            recyclingKey={productImage}
            accessibilityLabel={`${productName} product image`}
            style={styles.productImage}
          />
        ) : (
          <View style={styles.productPlaceholder}>
            <AppIcon
              name="package"
              role="worker"
              size="sm"
              color={WorkerColors.primary}
            />
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.productTopRow}>
            <AppText
              variant="bodyMedium"
              weight="semibold"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.productName}
            >
              {productName}
            </AppText>

            <AppText
              variant="caption"
              weight="bold"
              numberOfLines={1}
              style={styles.total}
            >
              {formatMoney(total)}
            </AppText>
          </View>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            style={styles.customerText}
          >
            {customerName}
            {"  •  "}
            {itemCount}{" "}
            {itemCount === 1 ? "item" : "items"}
          </AppText>

          <View style={styles.responseRow}>
            <View style={styles.responseDot} />

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={styles.responseText}
            >
              {responseText}
            </AppText>
          </View>
        </View>

        <CardAction
          state={chatState}
          orderId={orderId}
          onPress={handleActionPress}
        />
      </View>

      {/* OFFER */}

      {hasOffer ? (
        <View style={styles.offerRow}>
          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
          >
            Your offer
          </AppText>

          <AppText
            variant="caption"
            weight="bold"
            numberOfLines={1}
            style={styles.offerAmount}
          >
            {formatMoney(offerAmount)}
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
}

WorkerMarketOrderCard.displayName =
  "WorkerMarketOrderCard";

export default memo(WorkerMarketOrderCard);

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  card: {
    width: "100%",
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderRadius: 14,
    backgroundColor: Colors.surface,
  },

  cardPressed: {
    opacity: FixxamTokens.motion.pressedOpacity,
    transform: [
      {
        scale: FixxamTokens.motion.scalePressed,
      },
    ],
  },

  /* HEADER */

  header: {
    minHeight: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  statusBadge: {
    minHeight: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    borderRadius: 999,
  },

  statusText: {
    fontSize: 10,
  },

  orderNumber: {
    flexShrink: 1,
    maxWidth: 140,
    fontSize: 11,
    color: Colors.textMuted,
  },

  /* CONTENT */

  contentRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },

  productImage: {
    width: PRODUCT_IMAGE_SIZE,
    height: PRODUCT_IMAGE_SIZE,
    flexShrink: 0,
    borderRadius: 10,
    backgroundColor: Colors.disabledBackground,
  },

  productPlaceholder: {
    width: PRODUCT_IMAGE_SIZE,
    height: PRODUCT_IMAGE_SIZE,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: WorkerColors.primarySoft,
  },

  content: {
    flex: 1,
    minWidth: 0,
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
  },

  total: {
    flexShrink: 0,
    color: WorkerColors.primary,
    fontVariant: ["tabular-nums"],
  },

  customerText: {
    marginTop: 2,
    fontSize: 11,
    color: Colors.textSecondary,
  },

  responseRow: {
    minWidth: 0,
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  responseDot: {
    width: 5,
    height: 5,
    flexShrink: 0,
    borderRadius: 3,
    backgroundColor: Colors.textMuted,
  },

  responseText: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    color: Colors.textMuted,
  },

  /* ACTION BUTTON */

  actionButton: {
    width: ACTION_SIZE,
    height: ACTION_SIZE,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: ACTION_SIZE / 2,
  },

  actionPressed: {
    opacity: FixxamTokens.motion.pressedOpacity,
    transform: [
      {
        scale: FixxamTokens.motion.scalePressed,
      },
    ],
  },

  /* OFFER */

  offerRow: {
    minHeight: 30,
    marginTop: 8,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    borderRadius: 8,
    backgroundColor: WorkerColors.primarySoft,
  },

  offerAmount: {
    flexShrink: 0,
    color: WorkerColors.primary,
  },
});