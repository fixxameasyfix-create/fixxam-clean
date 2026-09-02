import React, {
  memo,
  useEffect,
  useState,
} from "react";

import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  router,
} from "expo-router";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import {
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

/* ==============================================================
   COMPONENT
============================================================== */

function MarketOrderCard({
  order,
  onPress,
}: Props) {
  /* ============================================================
     PRODUCT
  ============================================================ */

  const product =
    order.products[0];

  /* ============================================================
     ITEM COUNT
  ============================================================ */

  const itemCount =
    order.products.reduce(
      (sum, item) =>
        sum + item.quantity,
      0,
    );

  /* ============================================================
     TOTAL
  ============================================================ */

  const total =
    typeof order.total ===
      "number"
      ? order.total
      : order.products.reduce(
          (sum, item) =>
            sum +
            item.price *
              item.quantity,
          0,
        );

  /* ============================================================
     STATUS
  ============================================================ */

  const status =
    getStatusStyle(
      order.status,
    );

  const isOnTheWay =
    order.status ===
    "in-progress";

  const isCompleted =
    order.status ===
    "completed";

  /* ============================================================
     CHAT STATE
  ============================================================ */

  const [
    chatArrowState,
    setChatArrowState,
  ] =
    useState<ChatArrowState>(
      "empty",
    );

  /* ============================================================
     CURRENT CUSTOMER
  ============================================================ */

  const currentUserId =
    auth.currentUser?.uid ?? "";

  /* ============================================================
     CHAT REAL-TIME LISTENER
  ============================================================ */

  useEffect(() => {
    const orderId =
      String(
        order.id ?? "",
      ).trim();

    if (!orderId) {
      setChatArrowState(
        "empty",
      );

      return;
    }

    /*
     * Shared market chat room:
     *
     * marketChats/{orderId}
     *
     * The document contains:
     *
     * lastMessage
     * lastMessageSenderId
     */

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
          /*
           * Chat room does not
           * exist yet.
           */

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

          /*
           * No valid message.
           */

          if (!lastMessage) {
            setChatArrowState(
              "empty",
            );

            return;
          }

          /*
           * ====================================================
           * CURRENT CUSTOMER
           * ====================================================
           *
           * Customer sent latest message.
           *
           * State:
           * customer
           *
           * Direction on CUSTOMER APP:
           * ↑
           */

          if (
            senderId &&
            currentUserId &&
            senderId ===
              currentUserId
          ) {
            setChatArrowState(
              "customer",
            );

            return;
          }

          /*
           * ====================================================
           * SELLER / WORKER
           * ====================================================
           *
           * Someone else sent latest
           * message.
           *
           * Direction on CUSTOMER APP:
           * ↓
           */

          if (senderId) {
            setChatArrowState(
              "seller",
            );

            return;
          }

          /*
           * Sender unavailable.
           */

          setChatArrowState(
            "empty",
          );
        },
        (error) => {
          console.error(
            "MARKET_ORDER_CHAT_LISTENER_ERROR:",
            error,
          );

          /*
           * Chat must never break
           * the order card.
           */

          setChatArrowState(
            "empty",
          );
        },
      );

    return unsubscribe;
  }, [
    order.id,
    currentUserId,
  ]);

  /* ============================================================
     CHAT PRESS
  ============================================================ */

  const handleChatPress =
    () => {
      const orderId =
        String(
          order.id ?? "",
        ).trim();

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
    };

  /* ============================================================
     RENDER CHAT ARROW
  ============================================================ */

  const renderChatArrow =
    () => {
      /*
       * ========================================================
       * CUSTOMER APP
       * ========================================================
       *
       * Customer message → ↑
       *
       * Blue
       */

      if (
        chatArrowState ===
        "customer"
      ) {
        return (
          <Pressable
            onPress={
              handleChatPress
            }
            accessibilityRole="button"
            accessibilityLabel={`Open chat for order ${order.id}. You sent the latest message.`}
            hitSlop={8}
            style={({ pressed }) => [
              styles.chatArrowButton,
              styles.chatArrowCustomer,
              pressed &&
                styles.chatArrowPressed,
            ]}
          >
            <Ionicons
              name="arrow-up"
              size={21}
              color="#FFFFFF"
            />
          </Pressable>
        );
      }

      /*
       * ========================================================
       * SELLER / WORKER
       * ========================================================
       *
       * Worker message → ↓
       *
       * Green
       */

      if (
        chatArrowState ===
        "seller"
      ) {
        return (
          <Pressable
            onPress={
              handleChatPress
            }
            accessibilityRole="button"
            accessibilityLabel={`Open chat for order ${order.id}. Seller sent the latest message.`}
            hitSlop={8}
            style={({ pressed }) => [
              styles.chatArrowButton,
              styles.chatArrowSeller,
              pressed &&
                styles.chatArrowPressed,
            ]}
          >
            <Ionicons
              name="arrow-down"
              size={21}
              color="#FFFFFF"
            />
          </Pressable>
        );
      }

      /*
       * ========================================================
       * EMPTY
       * ========================================================
       */

      return (
        <Pressable
          onPress={
            handleChatPress
          }
          accessibilityRole="button"
          accessibilityLabel={`Open chat for order ${order.id}. No messages yet.`}
          hitSlop={8}
          style={({ pressed }) => [
            styles.arrowButton,
            pressed &&
              styles.arrowPressed,
          ]}
        >
          <Ionicons
            name="chevron-forward"
            size={18}
            color="#64748B"
          />
        </Pressable>
      );
    };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <Pressable
      onPress={
        onPress
      }
      accessibilityRole="button"
      accessibilityLabel={`Open ${
        product?.name ??
        "market"
      } order`}
      style={({ pressed }) => [
        styles.card,
        pressed &&
          styles.cardPressed,
      ]}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={
          styles.header
        }
      >
        <View
          style={[
            styles.statusBadge,
            status.background,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              status.dot,
            ]}
          />

          <AppText
            weight="bold"
            style={[
              styles.statusText,
              status.text,
            ]}
          >
            {status.label}
          </AppText>
        </View>

        <View
          style={
            styles.orderNumberRow
          }
        >
          <AppText
            style={
              styles.orderNumber
            }
          >
            {formatOrderNumber(
              order.id,
            )}
          </AppText>

          <Ionicons
            name="ellipsis-vertical"
            size={17}
            color="#0F172A"
          />
        </View>
      </View>

      {/* ======================================================
          PRODUCT
      ====================================================== */}

      <View
        style={
          styles.productRow
        }
      >
        {product?.image ? (
          <Image
            source={{
              uri: product.image,
            }}
            style={
              styles.productImage
            }
            resizeMode="cover"
          />
        ) : (
          <View
            style={
              styles.productPlaceholder
            }
          >
            <Ionicons
              name="cube-outline"
              size={27}
              color="#2563EB"
            />
          </View>
        )}

        <View
          style={
            styles.productInfo
          }
        >
          <AppText
            weight="bold"
            numberOfLines={1}
            style={
              styles.productName
            }
          >
            {product?.name ??
              "Market Order"}
          </AppText>

          <AppText
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
            <Ionicons
              name="bag-handle-outline"
              size={13}
              color="#475569"
            />

            <AppText
              weight="bold"
              style={
                styles.itemText
              }
            >
              {itemCount}{" "}
              {itemCount === 1
                ? "item"
                : "items"}
            </AppText>
          </View>
        </View>

        {/* ==================================================
            CHAT ARROW
        ================================================== */}

        {renderChatArrow()}
      </View>

      {/* ======================================================
          DIVIDER
      ====================================================== */}

      <View
        style={
          styles.divider
        }
      />

      {/* ======================================================
          ORDER INFO
      ====================================================== */}

      <View
        style={
          styles.infoRow
        }
      >
        <View
          style={
            styles.infoItem
          }
        >
          <Ionicons
            name="location-outline"
            size={17}
            color="#64748B"
          />

          <AppText
            numberOfLines={1}
            style={
              styles.infoText
            }
          >
            {order.address ||
              "Address unavailable"}
          </AppText>
        </View>

        <View
          style={
            styles.infoSeparator
          }
        />

        <View
          style={
            styles.infoItem
          }
        >
          <Ionicons
            name={
              isOnTheWay
                ? "car-outline"
                : isCompleted
                  ? "checkmark-circle-outline"
                  : "time-outline"
            }
            size={17}
            color={
              isOnTheWay ||
              isCompleted
                ? "#16A34A"
                : "#64748B"
            }
          />

          <AppText
            numberOfLines={1}
            style={[
              styles.infoText,
              isOnTheWay &&
                styles.onTheWayText,
              isCompleted &&
                styles.completedText,
            ]}
          >
            {getOrderMessage(
              order,
            )}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <View
        style={
          styles.footer
        }
      >
        <View
          style={
            styles.dateContainer
          }
        >
          <AppText
            style={
              styles.dateLabel
            }
          >
            Ordered on
          </AppText>

          <AppText
            weight="bold"
            style={
              styles.date
            }
          >
            {order.date}
          </AppText>
        </View>

        <AppText
          weight="bold"
          style={
            styles.total
          }
        >
          ₦
          {total.toLocaleString(
            "en-NG",
          )}
        </AppText>

        <Pressable
          onPress={
            onPress
          }
          accessibilityRole="button"
          accessibilityLabel={`View order ${order.id}`}
          style={[
            styles.actionButton,
            isOnTheWay &&
              styles.trackButton,
            isCompleted &&
              styles.completedButton,
          ]}
        >
          <AppText
            weight="bold"
            style={
              styles.actionText
            }
          >
            {isOnTheWay
              ? "TRACK ORDER"
              : "VIEW ORDER"}
          </AppText>

          <Ionicons
            name={
              isOnTheWay
                ? "location"
                : "arrow-forward"
            }
            size={16}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

/* ==============================================================
   ORDER MESSAGE
============================================================== */

function getOrderMessage(
  order: MarketOrder,
): string {
  switch (
    order.status
  ) {
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
   STATUS STYLE
============================================================== */

function getStatusStyle(
  status: MarketOrder["status"],
) {
  switch (
    status
  ) {
    case "accepted":
      return {
        label: "ACCEPTED",

        background:
          styles.statusAccepted,

        dot:
          styles.dotAccepted,

        text:
          styles.textAccepted,
      };

    case "in-progress":
      return {
        label: "ON THE WAY",

        background:
          styles.statusOnTheWay,

        dot:
          styles.dotOnTheWay,

        text:
          styles.textOnTheWay,
      };

    case "completed":
      return {
        label: "COMPLETED",

        background:
          styles.statusCompleted,

        dot:
          styles.dotCompleted,

        text:
          styles.textCompleted,
      };

    case "cancelled":
      return {
        label: "CANCELLED",

        background:
          styles.statusCancelled,

        dot:
          styles.dotCancelled,

        text:
          styles.textCancelled,
      };

    case "expired":
      return {
        label: "EXPIRED",

        background:
          styles.statusExpired,

        dot:
          styles.dotExpired,

        text:
          styles.textExpired,
      };

    case "pending":
    default:
      return {
        label: "PENDING",

        background:
          styles.statusPending,

        dot:
          styles.dotPending,

        text:
          styles.textPending,
      };
  }
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ==========================================================
       CARD
    ========================================================== */

    card: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 20,

      borderWidth: 1,

      borderColor:
        "#E2E8F0",

      paddingHorizontal: 10,

      paddingTop: 10,

      paddingBottom: 10,

      shadowColor:
        "#0F172A",

      shadowOpacity: 0.05,

      shadowRadius: 6,

      shadowOffset: {
        width: 0,
        height: 2,
      },

      elevation: 2,
    },

    cardPressed: {
      opacity: 0.97,

      transform: [
        {
          scale: 0.995,
        },
      ],
    },

    /* ==========================================================
       HEADER
    ========================================================== */

    header: {
      minHeight: 24,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    statusBadge: {
      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal: 9,

      paddingVertical: 5,

      borderRadius: 999,
    },

    statusDot: {
      width: 6,

      height: 6,

      borderRadius: 3,

      marginRight: 5,
    },

    statusText: {
      fontSize: 8,

      letterSpacing: 0.2,
    },

    orderNumberRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 4,
    },

    orderNumber: {
      fontSize: 8.5,

      color:
        "#64748B",
    },

    /* ==========================================================
       PRODUCT
    ========================================================== */

    productRow: {
      marginTop: 10,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    productImage: {
      width: 74,

      height: 74,

      borderRadius: 15,

      backgroundColor:
        "#F1F5F9",
    },

    productPlaceholder: {
      width: 74,

      height: 74,

      borderRadius: 15,

      backgroundColor:
        "#EFF6FF",

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    productInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft: 12,

      marginRight: 8,
    },

    productName: {
      fontSize: 15,

      color:
        "#0F172A",
    },

    storeName: {
      marginTop: 4,

      fontSize: 11.5,

      color:
        "#64748B",
    },

    itemBadge: {
      alignSelf:
        "flex-start",

      marginTop: 7,

      paddingHorizontal: 8,

      paddingVertical: 5,

      borderRadius: 7,

      backgroundColor:
        "#F1F5F9",

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 5,
    },

    itemText: {
      fontSize: 9,

      color:
        "#475569",
    },

    /* ==========================================================
       EMPTY ARROW
    ========================================================== */

    arrowButton: {
      width: 40,

      height: 40,

      borderRadius: 20,

      backgroundColor:
        "#F8FAFC",

      borderWidth: 1,

      borderColor:
        "#E2E8F0",

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    arrowPressed: {
      opacity: 0.75,

      transform: [
        {
          scale: 0.94,
        },
      ],
    },

    /* ==========================================================
       CHAT ARROW
    ========================================================== */

    chatArrowButton: {
      width: 40,

      height: 40,

      borderRadius: 20,

      alignItems:
        "center",

      justifyContent:
        "center",

      shadowColor:
        "#0F172A",

      shadowOpacity: 0.12,

      shadowRadius: 5,

      shadowOffset: {
        width: 0,

        height: 2,
      },

      elevation: 3,
    },

    /*
     * CUSTOMER APP
     *
     * Customer → BLUE → ↑
     */

    chatArrowCustomer: {
      backgroundColor:
        "#2563EB",
    },

    /*
     * CUSTOMER APP
     *
     * Seller / Worker → GREEN → ↓
     */

    chatArrowSeller: {
      backgroundColor:
        "#16A34A",
    },

    chatArrowPressed: {
      opacity: 0.82,

      transform: [
        {
          scale: 0.94,
        },
      ],
    },

    /* ==========================================================
       DIVIDER
    ========================================================== */

    divider: {
      height: 1,

      marginTop: 10,

      marginBottom: 9,

      backgroundColor:
        "#F1F5F9",
    },

    /* ==========================================================
       INFO
    ========================================================== */

    infoRow: {
      minHeight: 28,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    infoItem: {
      flex: 1,

      minWidth: 0,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    infoText: {
      flex: 1,

      minWidth: 0,

      marginLeft: 5,

      fontSize: 9,

      color:
        "#64748B",
    },

    onTheWayText: {
      color:
        "#15803D",
    },

    completedText: {
      color:
        "#15803D",
    },

    infoSeparator: {
      width: 1,

      height: 20,

      marginHorizontal: 7,

      backgroundColor:
        "#E2E8F0",
    },

    /* ==========================================================
       FOOTER
    ========================================================== */

    footer: {
      marginTop: 8,

      paddingTop: 8,

      borderTopWidth: 1,

      borderTopColor:
        "#F1F5F9",

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    dateContainer: {
      flex: 1,

      minWidth: 0,
    },

    dateLabel: {
      fontSize: 7.5,

      color:
        "#94A3B8",
    },

    date: {
      marginTop: 2,

      fontSize: 9,

      color:
        "#64748B",
    },

    total: {
      marginHorizontal: 10,

      fontSize: 15,

      color:
        "#0F172A",
    },

    actionButton: {
      minHeight: 36,

      paddingHorizontal: 11,

      borderRadius: 10,

      backgroundColor:
        "#2563EB",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 5,
    },

    trackButton: {
      backgroundColor:
        "#16A34A",
    },

    completedButton: {
      backgroundColor:
        "#2563EB",
    },

    actionText: {
      fontSize: 8,

      color:
        "#FFFFFF",
    },

    /* ==========================================================
       STATUS COLORS
    ========================================================== */

    statusPending: {
      backgroundColor:
        "#FFF7E8",
    },

    dotPending: {
      backgroundColor:
        "#F59E0B",
    },

    textPending: {
      color:
        "#D97706",
    },

    statusAccepted: {
      backgroundColor:
        "#EFF6FF",
    },

    dotAccepted: {
      backgroundColor:
        "#2563EB",
    },

    textAccepted: {
      color:
        "#1D4ED8",
    },

    statusOnTheWay: {
      backgroundColor:
        "#ECFDF5",
    },

    dotOnTheWay: {
      backgroundColor:
        "#16A34A",
    },

    textOnTheWay: {
      color:
        "#15803D",
    },

    statusCompleted: {
      backgroundColor:
        "#ECFDF5",
    },

    dotCompleted: {
      backgroundColor:
        "#16A34A",
    },

    textCompleted: {
      color:
        "#15803D",
    },

    statusCancelled: {
      backgroundColor:
        "#FEF2F2",
    },

    dotCancelled: {
      backgroundColor:
        "#DC2626",
    },

    textCancelled: {
      color:
        "#B91C1C",
    },

    statusExpired: {
      backgroundColor:
        "#F1F5F9",
    },

    dotExpired: {
      backgroundColor:
        "#64748B",
    },

    textExpired: {
      color:
        "#475569",
    },
  });

export default memo(
  MarketOrderCard,
);