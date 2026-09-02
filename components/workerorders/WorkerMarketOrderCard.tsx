import React, {
  memo,
  useEffect,
  useMemo,
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
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import {
  AppText,
} from "@/components/ui";

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

  onPress: (
    order: WorkerMarketOrder,
  ) => void;

  onChatPress?: (
    order: WorkerMarketOrder,
  ) => void;
};

type ChatArrowState =
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

  background: {
    backgroundColor: string;
  };

  dot: {
    backgroundColor: string;
  };

  text: {
    color: string;
  };
};

/* ==============================================================
   HELPERS
============================================================== */

function getString(
  value: unknown,
): string {
  if (
    typeof value === "string"
  ) {
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

/* ==============================================================
   MONEY
============================================================== */

function formatMoney(
  value: number,
): string {
  if (
    !Number.isFinite(value)
  ) {
    return "₦0";
  }

  return `₦${value.toLocaleString(
    "en-NG",
  )}`;
}

/* ==============================================================
   ADDRESS
============================================================== */

function getAddressText(
  value: unknown,
): string {
  if (
    typeof value === "string"
  ) {
    return (
      value.trim() ||
      "Address unavailable"
    );
  }

  if (
    value &&
    typeof value === "object"
  ) {
    const location =
      value as {
        address?: unknown;
        formattedAddress?: unknown;
        name?: unknown;
      };

    const address =
      getString(
        location.address,
      );

    if (address) {
      return address;
    }

    const formattedAddress =
      getString(
        location.formattedAddress,
      );

    if (formattedAddress) {
      return formattedAddress;
    }

    const name =
      getString(
        location.name,
      );

    if (name) {
      return name;
    }
  }

  return "Address unavailable";
}

/* ==============================================================
   DATE
============================================================== */

function formatDate(
  date: Date,
): string {
  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Date unavailable";
  }

  return date.toLocaleDateString(
    "en-NG",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

function getDateText(
  value: unknown,
): string {
  if (!value) {
    return "Date unavailable";
  }

  if (
    typeof value === "string"
  ) {
    const text =
      value.trim();

    if (!text) {
      return "Date unavailable";
    }

    const parsed =
      new Date(text);

    if (
      !Number.isNaN(
        parsed.getTime(),
      )
    ) {
      return formatDate(
        parsed,
      );
    }

    return text;
  }

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return formatDate(
      new Date(value),
    );
  }

  if (
    value instanceof Date
  ) {
    return formatDate(
      value,
    );
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    const timestamp =
      value as {
        toDate?: unknown;
        seconds?: unknown;
      };

    if (
      typeof timestamp.toDate ===
      "function"
    ) {
      try {
        const date =
          (
            timestamp.toDate as () => Date
          )();

        return formatDate(
          date,
        );
      } catch {
        return "Date unavailable";
      }
    }

    if (
      typeof timestamp.seconds ===
        "number" &&
      Number.isFinite(
        timestamp.seconds,
      )
    ) {
      return formatDate(
        new Date(
          timestamp.seconds * 1000,
        ),
      );
    }
  }

  return "Date unavailable";
}

/* ==============================================================
   STATUS
============================================================== */

function normalizeStatus(
  status: unknown,
): string {
  return String(
    status ?? "",
  )
    .trim()
    .toLowerCase();
}

/* ==============================================================
   CHAT STATE
============================================================== */

function resolveMessageState(
  data: MessageData,
  currentUserId: string,
): ChatArrowState {
  const text =
    getString(data.text);

  if (!text) {
    return "empty";
  }

  const senderId =
    getString(
      data.senderId,
    );

  if (
    senderId &&
    senderId ===
      currentUserId
  ) {
    return "worker";
  }

  const senderRole =
    getString(
      data.senderRole,
    ).toLowerCase();

  if (
    senderRole === "customer" ||
    senderRole === "client"
  ) {
    return "customer";
  }

  if (
    senderRole === "seller"
  ) {
    return "seller";
  }

  if (
    senderRole === "worker"
  ) {
    return "worker";
  }

  if (
    senderId &&
    senderId !==
      currentUserId
  ) {
    return "customer";
  }

  return "empty";
}

/* ==============================================================
   STATUS CONFIG
============================================================== */

function getStatusConfig(
  status: unknown,
): StatusConfig {
  switch (
    normalizeStatus(status)
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
    case "in_progress":
    case "in progress":
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
    case "canceled":
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
   STATUS BADGE
============================================================== */

const StatusBadge = memo(
  function StatusBadge({
    status,
  }: {
    status: unknown;
  }) {
    const config =
      getStatusConfig(
        status,
      );

    return (
      <View
        style={[
          styles.statusBadge,
          config.background,
        ]}
      >
        <View
          style={[
            styles.statusDot,
            config.dot,
          ]}
        />

        <AppText
          weight="bold"
          style={[
            styles.statusText,
            config.text,
          ]}
        >
          {config.label}
        </AppText>
      </View>
    );
  },
);

StatusBadge.displayName =
  "WorkerMarketOrderStatusBadge";

/* ==============================================================
   CHAT ARROW
============================================================== */

const ChatArrow = memo(
  function ChatArrow({
    state,
    onPress,
    orderId,
  }: {
    state: ChatArrowState;
    onPress: () => void;
    orderId: string;
  }) {
    if (
      state === "customer"
    ) {
      return (
        <Pressable
          onPress={onPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Open chat for order ${orderId}. Customer sent the latest message.`}
          style={({ pressed }) => [
            styles.chatArrowButton,
            styles.chatArrowCustomer,
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

    if (
      state === "worker"
    ) {
      return (
        <Pressable
          onPress={onPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Open chat for order ${orderId}. You sent the latest message.`}
          style={({ pressed }) => [
            styles.chatArrowButton,
            styles.chatArrowWorker,
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

    if (
      state === "seller"
    ) {
      return (
        <Pressable
          onPress={onPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Open chat for order ${orderId}. Seller sent the latest message.`}
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

    return (
      <Pressable
        onPress={onPress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Open chat for order ${orderId}. No messages yet.`}
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
  },
);

ChatArrow.displayName =
  "WorkerMarketOrderChatArrow";

/* ==============================================================
   CARD
============================================================== */

function WorkerMarketOrderCard({
  order,
  onPress,
  onChatPress,
}: Props) {
  const [
    chatArrowState,
    setChatArrowState,
  ] =
    useState<ChatArrowState>(
      "empty",
    );

  /* ============================================================
     DISPLAY VALUES
  ============================================================ */

  const orderId =
    useMemo(
      () =>
        getString(
          order.id,
        ),
      [order.id],
    );

  const productName =
    useMemo(
      () =>
        getString(
          order.productName,
        ) ||
        getString(
          order.products?.[0]
            ?.name,
        ) ||
        "Market Order",
      [
        order.productName,
        order.products,
      ],
    );

  const productImage =
    useMemo(
      () =>
        getString(
          order.productImage,
        ) ||
        getString(
          order.products?.[0]
            ?.image,
        ),
      [
        order.productImage,
        order.products,
      ],
    );

  const customerName =
    useMemo(
      () =>
        getString(
          order.customerName,
        ) ||
        "Customer",
      [order.customerName],
    );

  const customerPhoto =
    useMemo(
      () =>
        getString(
          order.customerPhotoURL,
        ) ||
        getString(
          order.customerPhoto,
        ),
      [
        order.customerPhotoURL,
        order.customerPhoto,
      ],
    );

  const addressText =
    useMemo(
      () =>
        getAddressText(
          order.address ??
            order.location,
        ),
      [
        order.address,
        order.location,
      ],
    );

  const dateText =
    useMemo(
      () =>
        getDateText(
          order.createdAt ??
            order.date,
        ),
      [
        order.createdAt,
        order.date,
      ],
    );

  /* ============================================================
     CHAT LISTENER
  ============================================================ */

  useEffect(() => {
    const workerId =
      auth.currentUser?.uid;

    if (
      !workerId ||
      !orderId
    ) {
      setChatArrowState(
        "empty",
      );

      return;
    }

    const messagesRef =
      collection(
        db,
        "marketChats",
        orderId,
        "messages",
      );

    const messagesQuery =
      query(
        messagesRef,
        orderBy(
          "createdAt",
          "desc",
        ),
        limit(1),
      );

    const unsubscribe =
      onSnapshot(
        messagesQuery,
        (snapshot) => {
          if (
            snapshot.empty
          ) {
            setChatArrowState(
              "empty",
            );

            return;
          }

          const latest =
            snapshot.docs[0];

          const message =
            latest.data() as MessageData;

          setChatArrowState(
            resolveMessageState(
              message,
              workerId,
            ),
          );
        },
        (listenerError) => {
          console.error(
            "FIXXAM_MARKET_CHAT_LISTENER_ERROR:",
            listenerError,
          );

          setChatArrowState(
            "empty",
          );
        },
      );

    return unsubscribe;
  }, [orderId]);

  /* ============================================================
     ITEM COUNT
  ============================================================ */

  const itemCount =
    useMemo(() => {
      if (
        typeof order.itemCount ===
          "number" &&
        Number.isFinite(
          order.itemCount,
        ) &&
        order.itemCount > 0
      ) {
        return Math.floor(
          order.itemCount,
        );
      }

      if (
        Array.isArray(
          order.products,
        ) &&
        order.products.length >
          0
      ) {
        const count =
          order.products.reduce(
            (
              total,
              product,
            ) =>
              total +
              Math.max(
                1,
                Math.floor(
                  product.quantity,
                ),
              ),
            0,
          );

        if (count > 0) {
          return count;
        }
      }

      return 1;
    }, [
      order.itemCount,
      order.products,
    ]);

  /* ============================================================
     TOTAL
  ============================================================ */

  const total =
    useMemo(() => {
      if (
        typeof order.total ===
          "number" &&
        Number.isFinite(
          order.total,
        )
      ) {
        return order.total;
      }

      if (
        typeof order.totalAmount ===
          "number" &&
        Number.isFinite(
          order.totalAmount,
        )
      ) {
        return order.totalAmount;
      }

      if (
        typeof order.amount ===
          "number" &&
        Number.isFinite(
          order.amount,
        )
      ) {
        return order.amount;
      }

      if (
        Array.isArray(
          order.products,
        )
      ) {
        const calculated =
          order.products.reduce(
            (
              sum,
              product,
            ) =>
              sum +
              product.price *
                Math.max(
                  1,
                  product.quantity,
                ),
            0,
          );

        if (
          Number.isFinite(
            calculated,
          )
        ) {
          return calculated;
        }
      }

      if (
        typeof order.offerAmount ===
          "number" &&
        Number.isFinite(
          order.offerAmount,
        )
      ) {
        return order.offerAmount;
      }

      return 0;
    }, [
      order.total,
      order.totalAmount,
      order.amount,
      order.products,
      order.offerAmount,
    ]);

  /* ============================================================
     STATUS
  ============================================================ */

  const status =
    normalizeStatus(
      order.status,
    );

  const isPending =
    status === "pending";

  /* ============================================================
     OFFER
  ============================================================ */

  const hasOffer =
    normalizeStatus(
      order.offerStatus,
    ) === "sent" &&
    typeof order.offerAmount ===
      "number" &&
    Number.isFinite(
      order.offerAmount,
    );

  /* ============================================================
     HANDLERS
  ============================================================ */

  const handlePress =
    () => {
      if (!orderId) {
        return;
      }

      onPress(order);
    };

  const handleChatPress =
    () => {
      if (!orderId) {
        return;
      }

      if (onChatPress) {
        onChatPress(order);
      }
    };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <Pressable
      onPress={
        handlePress
      }
      accessibilityRole="button"
      accessibilityLabel={`View market order ${orderId || "unknown"}`}
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
        <StatusBadge
          status={
            order.status
          }
        />

        <View
          style={
            styles.orderNumberRow
          }
        >
          <AppText
            numberOfLines={1}
            style={
              styles.orderNumber
            }
          >
            {orderId
              ? `#${orderId}`
              : "#—"}
          </AppText>

          <Ionicons
            name="ellipsis-vertical"
            size={16}
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
        {productImage ? (
          <Image
            source={{
              uri: productImage,
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
              size={25}
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
            {productName}
          </AppText>

          <AppText
            numberOfLines={1}
            style={
              styles.customerLabel
            }
          >
            Customer
          </AppText>

          <View
            style={
              styles.customerRow
            }
          >
            {customerPhoto ? (
              <Image
                source={{
                  uri: customerPhoto,
                }}
                style={
                  styles.customerPhoto
                }
                resizeMode="cover"
              />
            ) : (
              <View
                style={
                  styles.customerPlaceholder
                }
              >
                <Ionicons
                  name="person"
                  size={12}
                  color="#94A3B8"
                />
              </View>
            )}

            <AppText
              weight="bold"
              numberOfLines={1}
              style={
                styles.customerName
              }
            >
              {customerName}
            </AppText>
          </View>

          <View
            style={
              styles.itemBadge
            }
          >
            <Ionicons
              name="bag-handle-outline"
              size={12}
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

        <ChatArrow
          state={
            chatArrowState
          }
          onPress={
            handleChatPress
          }
          orderId={
            orderId
          }
        />
      </View>

      {/* ======================================================
          META
      ====================================================== */}

      <View
        style={
          styles.metaRow
        }
      >
        <View
          style={
            styles.metaItem
          }
        >
          <Ionicons
            name="location-outline"
            size={16}
            color="#64748B"
          />

          <AppText
            numberOfLines={1}
            ellipsizeMode="tail"
            style={
              styles.metaText
            }
          >
            {addressText}
          </AppText>
        </View>

        <View
          style={
            styles.metaDivider
          }
        />

        <View
          style={
            styles.metaDate
          }
        >
          <Ionicons
            name="calendar-outline"
            size={15}
            color="#64748B"
          />

          <AppText
            numberOfLines={1}
            style={
              styles.dateText
            }
          >
            {dateText}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          PENDING
      ====================================================== */}

      {isPending && (
        <View
          style={
            styles.pendingNotice
          }
        >
          <View
            style={
              styles.pendingLeft
            }
          >
            <View
              style={
                styles.pendingIcon
              }
            >
              <Ionicons
                name="time-outline"
                size={16}
                color="#D97706"
              />
            </View>

            <AppText
              weight="bold"
              style={
                styles.pendingTitle
              }
            >
              NEW MARKET ORDER
            </AppText>
          </View>

          <AppText
            style={
              styles.pendingAction
            }
          >
            Review & respond
          </AppText>
        </View>
      )}

      {/* ======================================================
          OFFER
      ====================================================== */}

      {hasOffer && (
        <View
          style={
            styles.offerNotice
          }
        >
          <View
            style={
              styles.offerLeft
            }
          >
            <Ionicons
              name="cash-outline"
              size={16}
              color="#15803D"
            />

            <AppText
              weight="bold"
              style={
                styles.offerTitle
              }
            >
              OFFER SENT
            </AppText>
          </View>

          <AppText
            weight="bold"
            style={
              styles.offerAmount
            }
          >
            {formatMoney(
              order.offerAmount as number,
            )}
          </AppText>
        </View>
      )}

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
            styles.requestedContainer
          }
        >
          <AppText
            style={
              styles.requestedLabel
            }
          >
            Requested on
          </AppText>

          <AppText
            weight="bold"
            numberOfLines={1}
            style={
              styles.requestedDate
            }
          >
            {dateText}
          </AppText>
        </View>

        <AppText
          weight="bold"
          numberOfLines={1}
          style={
            styles.total
          }
        >
          {formatMoney(total)}
        </AppText>

        <Pressable
          onPress={
            handlePress
          }
          accessibilityRole="button"
          accessibilityLabel={`View order ${orderId || "unknown"}`}
          style={({ pressed }) => [
            styles.viewButton,
            pressed &&
              styles.viewButtonPressed,
          ]}
        >
          <AppText
            weight="bold"
            style={
              styles.viewButtonText
            }
          >
            VIEW ORDER
          </AppText>

          <Ionicons
            name="arrow-forward"
            size={17}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

WorkerMarketOrderCard.displayName =
  "WorkerMarketOrderCard";

export default memo(
  WorkerMarketOrderCard,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    card: {
      width: "100%",
      paddingHorizontal: 10,
      paddingTop: 10,
      paddingBottom: 10,
      borderRadius: 18,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E2E8F0",

      shadowColor: "#0F172A",
      shadowOpacity: 0.045,
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

    header: {
      minHeight: 23,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },

    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 5,
    },

    statusText: {
      fontSize: 7.5,
      lineHeight: 10,
    },

    orderNumberRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },

    orderNumber: {
      maxWidth: 130,
      fontSize: 8,
      color: "#64748B",
    },

    productRow: {
      marginTop: 9,
      paddingRight: 4,
      minHeight: 78,
      flexDirection: "row",
      alignItems: "center",
    },

    productImage: {
      width: 68,
      height: 68,
      borderRadius: 14,
      backgroundColor:
        "#F1F5F9",
    },

    productPlaceholder: {
      width: 68,
      height: 68,
      borderRadius: 14,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent:
        "center",
    },

    productInfo: {
      flex: 1,
      minWidth: 0,
      marginLeft: 10,
      marginRight: 8,
    },

    productName: {
      fontSize: 14,
      lineHeight: 17,
      color: "#0F172A",
    },

    customerLabel: {
      marginTop: 2,
      fontSize: 8.5,
      color: "#94A3B8",
    },

    customerRow: {
      marginTop: 3,
      flexDirection: "row",
      alignItems: "center",
      minWidth: 0,
    },

    customerPhoto: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor:
        "#E2E8F0",
    },

    customerPlaceholder: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor:
        "#E2E8F0",
      alignItems: "center",
      justifyContent:
        "center",
    },

    customerName: {
      flex: 1,
      minWidth: 0,
      marginLeft: 6,
      fontSize: 9.5,
      color: "#334155",
    },

    itemBadge: {
      alignSelf:
        "flex-start",
      marginTop: 4,
      paddingHorizontal: 7,
      paddingVertical: 4,
      borderRadius: 7,
      backgroundColor:
        "#F1F5F9",
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },

    itemText: {
      fontSize: 8,
      color: "#475569",
    },

    arrowButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor:
        "#F8FAFC",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      alignItems: "center",
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

    chatArrowButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
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

    chatArrowCustomer: {
      backgroundColor:
        "#2563EB",
    },

    chatArrowWorker: {
      backgroundColor:
        "#16A34A",
    },

    chatArrowSeller: {
      backgroundColor:
        "#7C3AED",
    },

    chatArrowPressed: {
      opacity: 0.82,
      transform: [
        {
          scale: 0.94,
        },
      ],
    },

    metaRow: {
      minHeight: 32,
      marginTop: 9,
      paddingVertical: 6,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor:
        "#F1F5F9",
      flexDirection: "row",
      alignItems: "center",
    },

    metaItem: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
    },

    metaText: {
      flex: 1,
      minWidth: 0,
      marginLeft: 5,
      fontSize: 8.5,
      color: "#64748B",
    },

    metaDivider: {
      width: 1,
      height: 17,
      marginHorizontal: 7,
      backgroundColor:
        "#E2E8F0",
    },

    metaDate: {
      maxWidth: 105,
      flexDirection: "row",
      alignItems: "center",
    },

    dateText: {
      marginLeft: 4,
      fontSize: 8.5,
      color: "#64748B",
    },

    pendingNotice: {
      minHeight: 38,
      marginTop: 8,
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor:
        "#FFF7E8",
      borderWidth: 1,
      borderColor:
        "#FDE68A",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    pendingLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      minWidth: 0,
    },

    pendingIcon: {
      width: 25,
      height: 25,
      borderRadius: 8,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        "#FFF1C7",
    },

    pendingTitle: {
      fontSize: 8,
      color: "#D97706",
    },

    pendingAction: {
      marginLeft: 8,
      fontSize: 8.5,
      color: "#92400E",
    },

    offerNotice: {
      minHeight: 38,
      marginTop: 8,
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor:
        "#F0FDF4",
      borderWidth: 1,
      borderColor:
        "#BBF7D0",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    offerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      minWidth: 0,
    },

    offerTitle: {
      fontSize: 8,
      color: "#15803D",
    },

    offerAmount: {
      fontSize: 9,
      color: "#15803D",
    },

    footer: {
      marginTop: 8,
      paddingTop: 1,
      flexDirection: "row",
      alignItems: "center",
    },

    requestedContainer: {
      flex: 1,
      minWidth: 0,
    },

    requestedLabel: {
      fontSize: 7.5,
      color: "#94A3B8",
    },

    requestedDate: {
      marginTop: 1,
      fontSize: 8.5,
      color: "#64748B",
    },

    total: {
      maxWidth: 115,
      marginHorizontal: 9,
      fontSize: 14,
      color: "#0F172A",
    },

    viewButton: {
      minHeight: 35,
      paddingHorizontal: 10,
      borderRadius: 10,
      backgroundColor:
        "#2563EB",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 5,
    },

    viewButtonPressed: {
      opacity: 0.82,
      transform: [
        {
          scale: 0.97,
        },
      ],
    },

    viewButtonText: {
      fontSize: 8,
      color: "#FFFFFF",
    },

    statusPending: {
      backgroundColor:
        "#FFF7E8",
    },

    dotPending: {
      backgroundColor:
        "#F59E0B",
    },

    textPending: {
      color: "#D97706",
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
      color: "#1D4ED8",
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
      color: "#15803D",
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
      color: "#15803D",
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
      color: "#B91C1C",
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
      color: "#475569",
    },
  });