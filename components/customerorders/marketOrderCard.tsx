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
  AppDivider,
} from "@/components/common";

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

type StatusTone =
  | "pending"
  | "accepted"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "expired";

/* ==============================================================
   HELPERS
============================================================== */

function formatCurrency(
  amount: number,
): string {
  return `₦${Math.max(
    0,
    amount,
  ).toLocaleString("en-NG")}`;
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

function getStatusAppearance(
  status: StatusTone,
) {
  switch (status) {
    case "accepted":
      return {
        backgroundColor:
          CustomerColors.primarySoft,

        color:
          CustomerColors.primaryDark,

        dotColor:
          CustomerColors.primary,
      };

    case "in-progress":
    case "completed":
      return {
        backgroundColor:
          Colors.successSoft,

        color:
          Colors.success,

        dotColor:
          Colors.success,
      };

    case "cancelled":
      return {
        backgroundColor:
          Colors.errorSoft,

        color:
          Colors.error,

        dotColor:
          Colors.error,
      };

    case "expired":
      return {
        backgroundColor:
          Colors.disabledBackground,

        color:
          Colors.textSecondary,

        dotColor:
          Colors.textMuted,
      };

    case "pending":
    default:
      return {
        backgroundColor:
          Colors.warningSoft,

        color:
          Colors.warning,

        dotColor:
          Colors.warning,
      };
  }
}

/* ==============================================================
   COMPONENT
============================================================== */

function MarketOrderCard({
  order,
  onPress,
}: Props) {
  const product =
    order.products[0];

  const orderId =
    useMemo(
      () =>
        String(
          order.id ?? "",
        ).trim(),
      [order.id],
    );

  const itemCount =
    useMemo(() => {
      if (
        typeof order.itemCount ===
          "number" &&
        Number.isFinite(
          order.itemCount,
        )
      ) {
        return Math.max(
          0,
          Math.floor(
            order.itemCount,
          ),
        );
      }

      return order.products.reduce(
        (
          total,
          item,
        ) =>
          total +
          Math.max(
            1,
            Math.floor(
              item.quantity,
            ),
          ),
        0,
      );
    }, [
      order.itemCount,
      order.products,
    ]);

  const total =
    useMemo(() => {
      if (
        typeof order.total ===
          "number" &&
        Number.isFinite(
          order.total,
        )
      ) {
        return Math.max(
          0,
          order.total,
        );
      }

      return order.products.reduce(
        (
          sum,
          item,
        ) =>
          sum +
          Math.max(
            0,
            item.price,
          ) *
            Math.max(
              1,
              item.quantity,
            ),
        0,
      );
    }, [
      order.products,
      order.total,
    ]);

  const [
    chatArrowState,
    setChatArrowState,
  ] =
    useState<ChatArrowState>(
      "empty",
    );

  const currentUserId =
    auth.currentUser?.uid ?? "";

  const isOnTheWay =
    order.status ===
    "in-progress";

  const isCompleted =
    order.status ===
    "completed";

  const statusAppearance =
    getStatusAppearance(
      order.status,
    );

  /* ============================================================
     CHAT LISTENER
  ============================================================ */

  useEffect(() => {
    if (!orderId) {
      setChatArrowState(
        "empty",
      );

      return;
    }

    const chatRef =
      doc(
        db,
        "marketChats",
        orderId,
      );

    const unsubscribe =
      onSnapshot(
        chatRef,

        (snapshot) => {
          if (
            !snapshot.exists()
          ) {
            setChatArrowState(
              "empty",
            );

            return;
          }

          const data =
            snapshot.data() as ChatDocument;

          const lastMessage =
            typeof data.lastMessage ===
              "string"
              ? data.lastMessage.trim()
              : "";

          const senderId =
            typeof data.lastMessageSenderId ===
              "string"
              ? data.lastMessageSenderId.trim()
              : "";

          if (
            !lastMessage ||
            !senderId
          ) {
            setChatArrowState(
              "empty",
            );

            return;
          }

          if (
            currentUserId &&
            senderId ===
              currentUserId
          ) {
            setChatArrowState(
              "customer",
            );

            return;
          }

          setChatArrowState(
            "seller",
          );
        },

        (error) => {
          console.error(
            "MARKET_ORDER_CHAT_LISTENER_ERROR:",
            error,
          );

          /*
           * Chat state must never
           * break order rendering.
           */
          setChatArrowState(
            "empty",
          );
        },
      );

    return unsubscribe;
  }, [
    currentUserId,
    orderId,
  ]);

  /* ============================================================
     CHAT
  ============================================================ */

  const handleChatPress =
    useCallback(
      (
        event?:
          GestureResponderEvent,
      ) => {
        event?.stopPropagation();

        if (!orderId) {
          return;
        }

        router.push({
          pathname:
            "/(customer)/orders/market/chat",

          params: {
            orderId,
          },
        });
      },
      [orderId],
    );

  /* ============================================================
     UI
  ============================================================ */

  return (
    <AppCard
      role="customer"
      variant="outlined"
      onPress={onPress}
      accessibilityLabel={`Open ${
        product?.name ??
        "market"
      } order`}
      style={styles.card}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View style={styles.header}>
        <View
          style={[
            styles.statusBadge,

            {
              backgroundColor:
                statusAppearance
                  .backgroundColor,
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,

              {
                backgroundColor:
                  statusAppearance
                    .dotColor,
              },
            ]}
          />

          <AppText
            variant="caption"
            weight="semibold"
            style={{
              color:
                statusAppearance
                  .color,
            }}
          >
            {getStatusLabel(
              order.status,
            )}
          </AppText>
        </View>

        <AppText
          variant="caption"
          tone="muted"
          numberOfLines={1}
        >
          {formatOrderNumber(
            order.id,
          )}
        </AppText>
      </View>

      {/* ======================================================
          PRODUCT
      ====================================================== */}

      <View style={styles.productRow}>
        {product?.image ? (
          <Image
            source={{
              uri: product.image,
            }}
            style={
              styles.productImage
            }
            contentFit="cover"
            transition={150}
            cachePolicy="memory-disk"
            accessibilityLabel={
              product.name
                ? `${product.name} image`
                : "Product image"
            }
          />
        ) : (
          <View
            style={
              styles.productPlaceholder
            }
          >
            <AppIcon
              name="package"
              role="customer"
              size="lg"
              state="active"
            />
          </View>
        )}

        <View
          style={
            styles.productInfo
          }
        >
          <AppText
            variant="bodyLarge"
            weight="semibold"
            numberOfLines={1}
          >
            {product?.name ??
              "Market Order"}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            style={
              styles.storeName
            }
          >
            {order.storeName ??
              "Seller"}
          </AppText>

          <View
            style={
              styles.itemBadge
            }
          >
            <AppIcon
              name="package"
              role="customer"
              size="xs"
              state="muted"
            />

            <AppText
              variant="caption"
              weight="semibold"
              tone="secondary"
            >
              {itemCount}{" "}
              {itemCount === 1
                ? "item"
                : "items"}
            </AppText>
          </View>
        </View>

        <ChatButton
          state={
            chatArrowState
          }
          orderId={orderId}
          onPress={
            handleChatPress
          }
        />
      </View>

      <AppDivider
        style={styles.divider}
      />

      {/* ======================================================
          INFO
      ====================================================== */}

      <View style={styles.infoSection}>
        <InfoRow
          icon="location"
          text={
            order.address ||
            order.location ||
            "Address unavailable"
          }
        />

        <InfoRow
          icon={
            isOnTheWay
              ? "navigation"
              : isCompleted
                ? "success"
                : "clock"
          }
          text={
            getOrderMessage(
              order,
            )
          }
          success={
            isOnTheWay ||
            isCompleted
          }
        />
      </View>

      <AppDivider
        style={
          styles.footerDivider
        }
      />

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <View style={styles.footer}>
        <View
          style={
            styles.dateContainer
          }
        >
          <AppText
            variant="caption"
            tone="muted"
          >
            Ordered on
          </AppText>

          <AppText
            variant="caption"
            weight="semibold"
            tone="secondary"
            style={styles.date}
          >
            {order.date}
          </AppText>
        </View>

        <AppText
          variant="bodyLarge"
          weight="semibold"
        >
          {formatCurrency(
            total,
          )}
        </AppText>

        <View
          style={
            styles.viewDetails
          }
        >
          <AppText
            variant="bodyMedium"
            role="customer"
            tone={
              isOnTheWay
                ? "success"
                : "primary"
            }
          >
            {isOnTheWay
              ? "Track"
              : "View details"}
          </AppText>

          <AppIcon
            name={
              isOnTheWay
                ? "navigation"
                : "next"
            }
            role="customer"
            size="xs"
            state={
              isOnTheWay
                ? "success"
                : "active"
            }
          />
        </View>
      </View>
    </AppCard>
  );
}

/* ==============================================================
   CHAT BUTTON
============================================================== */

function ChatButton({
  state,
  orderId,
  onPress,
}: {
  state: ChatArrowState;

  orderId: string;

  onPress: (
    event:
      GestureResponderEvent,
  ) => void;
}) {
  if (
    state === "customer"
  ) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open chat for order ${orderId}. You sent the latest message.`}
        hitSlop={8}
        onPress={onPress}
        style={({ pressed }) => [
          styles.chatButton,

          {
            backgroundColor:
              CustomerColors.primary,
          },

          pressed
            ? styles.chatPressed
            : null,
        ]}
      >
        <AppIcon
          name="arrow-up"
          role="customer"
          size="sm"
          color={
            Colors.textInverse
          }
          strokeWidth="strong"
        />
      </Pressable>
    );
  }

  if (
    state === "seller"
  ) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open chat for order ${orderId}. Seller sent the latest message.`}
        hitSlop={8}
        onPress={onPress}
        style={({ pressed }) => [
          styles.chatButton,

          {
            backgroundColor:
              Colors.success,
          },

          pressed
            ? styles.chatPressed
            : null,
        ]}
      >
        <AppIcon
          name="arrow-down"
          role="customer"
          size="sm"
          color={
            Colors.textInverse
          }
          strokeWidth="strong"
        />
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open chat for order ${orderId}. No messages yet.`}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.emptyChatButton,

        pressed
          ? styles.chatPressed
          : null,
      ]}
    >
      <AppIcon
        name="messages"
        role="customer"
        size="sm"
        state="muted"
      />
    </Pressable>
  );
}

/* ==============================================================
   INFO ROW
============================================================== */

function InfoRow({
  icon,
  text,
  success = false,
}: {
  icon:
    | "location"
    | "navigation"
    | "success"
    | "clock";

  text: string;

  success?: boolean;
}) {
  return (
    <View style={styles.infoItem}>
      <AppIcon
        name={icon}
        role="customer"
        size="xs"
        state={
          success
            ? "success"
            : "muted"
        }
      />

      <AppText
        variant="caption"
        tone={
          success
            ? "success"
            : "secondary"
        }
        numberOfLines={1}
        style={styles.infoText}
      >
        {text}
      </AppText>
    </View>
  );
}

/* ==============================================================
   ORDER MESSAGE
============================================================== */

function getOrderMessage(
  order: MarketOrder,
): string {
  switch (order.status) {
    case "in-progress":
      return "Seller is on the way";

    case "completed":
      return order.completedAt
        ? `Delivered on ${order.completedAt}`
        : "Delivered";

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

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  card: {
    width: "100%",

    padding:
      FixxamTokens.spacing.lg,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",

    gap:
      FixxamTokens.spacing.sm,
  },

 statusBadge: {
  flexDirection: "row",
  alignItems: "center",

  paddingHorizontal:
    FixxamTokens.spacing.sm,

  paddingVertical:
    FixxamTokens.spacing.xs,

  borderRadius:
    FixxamTokens.radius.full,
},

  statusDot: {
    width: 6,
    height: 6,

    borderRadius:
      FixxamTokens.radius.full,

    marginRight:
      FixxamTokens.spacing.xs,
  },

  productRow: {
    flexDirection: "row",
    alignItems: "center",

    marginTop:
      FixxamTokens.spacing.md,
  },

  productImage: {
    width:
      FixxamTokens.size.avatarXl,

    height:
      FixxamTokens.size.avatarXl,

    flexShrink: 0,

    borderRadius:
      FixxamTokens.radius.image,

    backgroundColor:
      Colors.iconBackground,
  },

  productPlaceholder: {
    width:
      FixxamTokens.size.avatarXl,

    height:
      FixxamTokens.size.avatarXl,

    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    borderRadius:
      FixxamTokens.radius.image,

    backgroundColor:
      CustomerColors.primarySoft,
  },

  productInfo: {
    flex: 1,
    minWidth: 0,

    marginHorizontal:
      FixxamTokens.spacing.md,
  },

  storeName: {
    marginTop:
      FixxamTokens.spacing.xs,
  },

  itemBadge: {
    alignSelf: "flex-start",

    flexDirection: "row",
    alignItems: "center",

    gap:
      FixxamTokens.spacing.xs,

    marginTop:
      FixxamTokens.spacing.sm,

    paddingHorizontal:
      FixxamTokens.spacing.sm,

    paddingVertical:
      FixxamTokens.spacing.xs,

    borderRadius:
      FixxamTokens.radius.badge,

    backgroundColor:
      Colors.iconBackground,
  },

  emptyChatButton: {
    width:
      FixxamTokens.size
        .minimumTouchTarget,

    height:
      FixxamTokens.size
        .minimumTouchTarget,

    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,

    borderColor:
      Colors.border,

    borderRadius:
      FixxamTokens.radius.full,

    backgroundColor:
      Colors.surface,
  },

  chatButton: {
    width:
      FixxamTokens.size
        .minimumTouchTarget,

    height:
      FixxamTokens.size
        .minimumTouchTarget,

    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    borderRadius:
      FixxamTokens.radius.full,

    ...FixxamTokens.shadow.floating,
  },

  chatPressed: {
    opacity:
      FixxamTokens.motion
        .pressedOpacity,

    transform: [
      {
        scale:
          FixxamTokens.motion
            .scalePressed,
      },
    ],
  },

  divider: {
    marginVertical:
      FixxamTokens.spacing.md,
  },

  infoSection: {
    gap:
      FixxamTokens.spacing.sm,
  },

  infoItem: {
    minWidth: 0,

    flexDirection: "row",
    alignItems: "center",
  },

  infoText: {
    flex: 1,
    minWidth: 0,

    marginLeft:
      FixxamTokens.spacing.sm,
  },

  footerDivider: {
    marginTop:
      FixxamTokens.spacing.md,

    marginBottom:
      FixxamTokens.spacing.sm,
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",

    gap:
      FixxamTokens.spacing.md,
  },

  dateContainer: {
    flex: 1,
    minWidth: 0,
  },

  date: {
    marginTop:
      FixxamTokens.spacing.xxs,
  },

  viewDetails: {
    flexDirection: "row",
    alignItems: "center",

    gap:
      FixxamTokens.spacing.xs,
  },
});

export default memo(
  MarketOrderCard,
);