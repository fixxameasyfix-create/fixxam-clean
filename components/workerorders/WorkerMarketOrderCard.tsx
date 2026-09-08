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
} from "react-native";

import {
  Image,
} from "expo-image";

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

  backgroundColor: string;

  color: string;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const PRODUCT_IMAGE_SIZE =
  68;

const CUSTOMER_IMAGE_SIZE =
  24;

/* ==============================================================
   STRING
============================================================== */

function getString(
  value: unknown,
): string {
  if (
    typeof value ===
    "string"
  ) {
    return value.trim();
  }

  if (
    typeof value ===
      "number" &&
    Number.isFinite(value)
  ) {
    return String(
      value,
    );
  }

  return "";
}

/* ==============================================================
   NUMBER
============================================================== */

function getOptionalNumber(
  value: unknown,
): number | undefined {
  if (
    typeof value ===
      "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value ===
      "string"
  ) {
    const cleaned =
      value
        .replace(
          /[₦,\s]/g,
          "",
        )
        .trim();

    if (!cleaned) {
      return undefined;
    }

    const parsed =
      Number(
        cleaned,
      );

    return Number.isFinite(
      parsed,
    )
      ? parsed
      : undefined;
  }

  return undefined;
}

function getSafeNumber(
  value: unknown,
  fallback = 0,
): number {
  return (
    getOptionalNumber(
      value,
    ) ??
    fallback
  );
}

/* ==============================================================
   MONEY
============================================================== */

function formatMoney(
  value: unknown,
): string {
  const parsed =
    getSafeNumber(
      value,
    );

  const safeValue =
    Math.max(
      0,
      parsed,
    );

  return `₦${safeValue.toLocaleString(
    "en-NG",
    {
      maximumFractionDigits:
        2,
    },
  )}`;
}

/* ==============================================================
   ADDRESS
============================================================== */

function getAddressText(
  value: unknown,
): string {
  if (
    typeof value ===
    "string"
  ) {
    return (
      value.trim() ||
      "Address unavailable"
    );
  }

  if (
    value &&
    typeof value ===
      "object"
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

    if (
      formattedAddress
    ) {
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
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
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
    typeof value ===
    "string"
  ) {
    const text =
      value.trim();

    if (!text) {
      return "Date unavailable";
    }

    const parsed =
      new Date(
        text,
      );

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
    typeof value ===
      "number" &&
    Number.isFinite(value)
  ) {
    return formatDate(
      new Date(
        value,
      ),
    );
  }

  if (
    value instanceof
    Date
  ) {
    return formatDate(
      value,
    );
  }

  if (
    typeof value ===
      "object" &&
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
        return formatDate(
          (
            timestamp.toDate as () => Date
          )(),
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
          timestamp.seconds *
            1000,
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
  value: unknown,
): string {
  return String(
    value ?? "",
  )
    .trim()
    .toLowerCase()
    .replace(
      /[_\s]+/g,
      "-",
    );
}

/* ==============================================================
   CHAT STATE
============================================================== */

function resolveMessageState(
  data: MessageData,
  currentUserId: string,
): ChatArrowState {
  const text =
    getString(
      data.text,
    );

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
    senderRole ===
      "customer" ||
    senderRole ===
      "client"
  ) {
    return "customer";
  }

  if (
    senderRole ===
    "seller"
  ) {
    return "seller";
  }

  if (
    senderRole ===
    "worker"
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
    normalizeStatus(
      status,
    )
  ) {
    case "accepted":
      return {
        label:
          "ACCEPTED",

        backgroundColor:
          Colors.infoSoft,

        color:
          Colors.info,
      };

    case "in-progress":
      return {
        label:
          "ON THE WAY",

        backgroundColor:
          Colors.successSoft,

        color:
          Colors.success,
      };

    case "completed":
      return {
        label:
          "COMPLETED",

        backgroundColor:
          Colors.successSoft,

        color:
          Colors.success,
      };

    case "cancelled":
    case "canceled":
      return {
        label:
          "CANCELLED",

        backgroundColor:
          Colors.errorSoft,

        color:
          Colors.error,
      };

    case "expired":
      return {
        label:
          "EXPIRED",

        backgroundColor:
          Colors.disabledBackground,

        color:
          Colors.textSecondary,
      };

    case "pending":
    default:
      return {
        label:
          "PENDING",

        backgroundColor:
          Colors.warningSoft,

        color:
          Colors.warning,
      };
  }
}

/* ==============================================================
   STATUS BADGE
============================================================== */

const StatusBadge =
  memo(
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

            {
              backgroundColor:
                config.backgroundColor,
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,

              {
                backgroundColor:
                  config.color,
              },
            ]}
          />

          <AppText
            variant="caption"
            weight="bold"
            style={[
              styles.statusText,

              {
                color:
                  config.color,
              },
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

const ChatArrow =
  memo(
    function ChatArrow({
      state,
      onPress,
      orderId,
    }: {
      state: ChatArrowState;

      onPress: () => void;

      orderId: string;
    }) {
      const isCustomer =
        state ===
        "customer";

      const isOutgoing =
        state ===
          "worker" ||
        state ===
          "seller";

      if (
        isCustomer ||
        isOutgoing
      ) {
        const backgroundColor =
          isCustomer
            ? CustomerColors.primary
            : WorkerColors.primary;

        return (
          <Pressable
            onPress={event => {
              event.stopPropagation();

              onPress();
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={
              isCustomer
                ? `Open chat for order ${orderId}. Customer sent the latest message.`
                : `Open chat for order ${orderId}. You sent the latest message.`
            }
            style={({
              pressed,
            }) => [
              styles.chatArrowButton,

              {
                backgroundColor,
              },

              pressed
                ? styles.pressed
                : null,
            ]}
          >
            <AppIcon
              name={
                isCustomer
                  ? "down"
                  : "arrow-up"
              }
              size="sm"
              color={
                Colors.textInverse
              }
            />
          </Pressable>
        );
      }

      return (
        <Pressable
          onPress={event => {
            event.stopPropagation();

            onPress();
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Open order ${orderId}. No chat messages yet.`}
          style={({
            pressed,
          }) => [
            styles.arrowButton,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppIcon
            name="next"
            size="sm"
            color={
              Colors.textSecondary
            }
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
     DISPLAY
  ============================================================ */

  const orderId =
    useMemo(
      () =>
        getString(
          order.id,
        ),
      [
        order.id,
      ],
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
      [
        order.customerName,
      ],
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
        order.customerPhoto,
        order.customerPhotoURL,
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

    const messagesQuery =
      query(
        collection(
          db,
          "marketChats",
          orderId,
          "messages",
        ),

        orderBy(
          "createdAt",
          "desc",
        ),

        limit(1),
      );

    const unsubscribe =
      onSnapshot(
        messagesQuery,

        snapshot => {
          if (
            snapshot.empty
          ) {
            setChatArrowState(
              "empty",
            );

            return;
          }

          const message =
            snapshot.docs[0].data() as MessageData;

          const nextState =
            resolveMessageState(
              message,
              workerId,
            );

          setChatArrowState(
            current =>
              current ===
              nextState
                ? current
                : nextState,
          );
        },

        listenerError => {
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
  }, [
    orderId,
  ]);

  /* ============================================================
     ITEM COUNT
  ============================================================ */

  const itemCount =
    useMemo(() => {
      const explicitCount =
        getOptionalNumber(
          order.itemCount,
        );

      if (
        explicitCount !==
          undefined &&
        explicitCount > 0
      ) {
        return Math.max(
          1,
          Math.floor(
            explicitCount,
          ),
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
            ) => {
              const quantity =
                Math.max(
                  1,
                  Math.floor(
                    getSafeNumber(
                      product.quantity,
                      1,
                    ),
                  ),
                );

              return (
                total +
                quantity
              );
            },
            0,
          );

        if (
          count > 0
        ) {
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
      const directValues = [
        order.total,
        order.totalAmount,
        order.amount,
      ];

      for (
        const value of
        directValues
      ) {
        const parsed =
          getOptionalNumber(
            value,
          );

        if (
          parsed !==
          undefined
        ) {
          return Math.max(
            0,
            parsed,
          );
        }
      }

      if (
        Array.isArray(
          order.products,
        ) &&
        order.products.length >
          0
      ) {
        const calculated =
          order.products.reduce(
            (
              sum,
              product,
            ) => {
              const price =
                Math.max(
                  0,
                  getSafeNumber(
                    product.price,
                  ),
                );

              const quantity =
                Math.max(
                  1,
                  Math.floor(
                    getSafeNumber(
                      product.quantity,
                      1,
                    ),
                  ),
                );

              return (
                sum +
                price *
                  quantity
              );
            },
            0,
          );

        if (
          Number.isFinite(
            calculated,
          ) &&
          calculated > 0
        ) {
          return calculated;
        }
      }

      return Math.max(
        0,
        getSafeNumber(
          order.offerAmount,
        ),
      );
    }, [
      order.amount,
      order.offerAmount,
      order.products,
      order.total,
      order.totalAmount,
    ]);

  /* ============================================================
     STATUS / OFFER
  ============================================================ */

  const status =
    normalizeStatus(
      order.status,
    );

  const isPending =
    status ===
    "pending";

  const offerAmount =
    getOptionalNumber(
      order.offerAmount,
    );

  const hasOffer =
    normalizeStatus(
      order.offerStatus,
    ) ===
      "sent" &&
    offerAmount !==
      undefined;

  /* ============================================================
     HANDLERS
  ============================================================ */

  const handlePress =
    useCallback(() => {
      if (!orderId) {
        return;
      }

      onPress(
        order,
      );
    }, [
      onPress,
      order,
      orderId,
    ]);

  const handleChatPress =
    useCallback(() => {
      if (!orderId) {
        return;
      }

      if (
        onChatPress
      ) {
        onChatPress(
          order,
        );

        return;
      }

      /*
       * Avoid a dead nested button when
       * no dedicated chat callback exists.
       */
      onPress(
        order,
      );
    }, [
      onChatPress,
      onPress,
      order,
      orderId,
    ]);

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
      style={({
        pressed,
      }) => [
        styles.card,

        pressed
          ? styles.cardPressed
          : null,
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
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            style={
              styles.orderNumber
            }
          >
            {orderId
              ? `#${orderId}`
              : "#—"}
          </AppText>

          <AppIcon
            name="more"
            size="xs"
            color={
              Colors.textSecondary
            }
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
              uri:
                productImage,
            }}
            contentFit="cover"
            transition={150}
            recyclingKey={
              productImage
            }
            accessibilityLabel={`${productName} product image`}
            style={
              styles.productImage
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
              role="worker"
              size="md"
              color={
                WorkerColors.primary
              }
            />
          </View>
        )}

        <View
          style={
            styles.productInfo
          }
        >
          <AppText
            variant="bodyMedium"
            weight="bold"
            numberOfLines={1}
            style={
              styles.productName
            }
          >
            {productName}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
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
                  uri:
                    customerPhoto,
                }}
                contentFit="cover"
                transition={150}
                recyclingKey={
                  customerPhoto
                }
                accessibilityLabel={`${customerName} profile photo`}
                style={
                  styles.customerPhoto
                }
              />
            ) : (
              <View
                style={
                  styles.customerPlaceholder
                }
              >
                <AppIcon
                  name="profile"
                  size="xs"
                  color={
                    Colors.textMuted
                  }
                />
              </View>
            )}

            <AppText
              variant="caption"
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
            <AppIcon
              name="cart"
              size="xs"
              color={
                Colors.textSecondary
              }
            />

            <AppText
              variant="caption"
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
          <AppIcon
            name="location"
            size="xs"
            color={
              Colors.textSecondary
            }
          />

          <AppText
            variant="caption"
            tone="secondary"
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
          <AppIcon
            name="calendar"
            size="xs"
            color={
              Colors.textSecondary
            }
          />

          <AppText
            variant="caption"
            tone="secondary"
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

      {isPending ? (
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
              <AppIcon
                name="clock"
                size="xs"
                color={
                  Colors.warning
                }
              />
            </View>

            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.pendingTitle
              }
            >
              NEW MARKET ORDER
            </AppText>
          </View>

          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.pendingAction
            }
          >
            Review & respond
          </AppText>
        </View>
      ) : null}

      {/* ======================================================
          OFFER
      ====================================================== */}

      {hasOffer ? (
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
            <AppIcon
              name="payment"
              size="xs"
              color={
                Colors.success
              }
            />

            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.offerTitle
              }
            >
              OFFER SENT
            </AppText>
          </View>

          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.offerAmount
            }
          >
            {formatMoney(
              offerAmount,
            )}
          </AppText>
        </View>
      ) : null}

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
            variant="caption"
            tone="secondary"
            style={
              styles.requestedLabel
            }
          >
            Requested on
          </AppText>

          <AppText
            variant="caption"
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
          variant="bodyMedium"
          weight="bold"
          numberOfLines={1}
          style={
            styles.total
          }
        >
          {formatMoney(
            total,
          )}
        </AppText>

        <Pressable
          onPress={event => {
            event.stopPropagation();

            handlePress();
          }}
          accessibilityRole="button"
          accessibilityLabel={`View order ${orderId || "unknown"}`}
          style={({
            pressed,
          }) => [
            styles.viewButton,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.viewButtonText
            }
          >
            VIEW ORDER
          </AppText>

          <AppIcon
            name="next"
            role="worker"
            size="xs"
            color={
              Colors.textInverse
            }
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

/* ==============================================================
   MEMO
============================================================== */

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
    /* ==========================================================
       CARD
    ========================================================== */

    card: {
      width: "100%",

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    cardPressed: {
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

    /* ==========================================================
       HEADER
    ========================================================== */

    header: {
      minHeight:
        28,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,
    },

    statusBadge: {
      minHeight:
        26,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderRadius:
        FixxamTokens.radius.sm,
    },

    statusDot: {
      width: 6,

      height: 6,

      marginRight:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,
    },

    statusText: {
      lineHeight:
        14,
    },

    orderNumberRow: {
      flexShrink: 1,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    orderNumber: {
      flexShrink: 1,

      maxWidth:
        130,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       PRODUCT
    ========================================================== */

    productRow: {
      minHeight:
        78,

      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    productImage: {
      width:
        PRODUCT_IMAGE_SIZE,

      height:
        PRODUCT_IMAGE_SIZE,

      flexShrink: 0,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.disabledBackground,
    },

    productPlaceholder: {
      width:
        PRODUCT_IMAGE_SIZE,

      height:
        PRODUCT_IMAGE_SIZE,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    productInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    productName: {
      color:
        Colors.textPrimary,
    },

    customerLabel: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textMuted,
    },

    customerRow: {
      minWidth: 0,

      marginTop:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    customerPhoto: {
      width:
        CUSTOMER_IMAGE_SIZE,

      height:
        CUSTOMER_IMAGE_SIZE,

      flexShrink: 0,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    customerPlaceholder: {
      width:
        CUSTOMER_IMAGE_SIZE,

      height:
        CUSTOMER_IMAGE_SIZE,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    customerName: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },

    itemBadge: {
      alignSelf:
        "flex-start",

      marginTop:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.sm,

      backgroundColor:
        Colors.disabledBackground,
    },

    itemText: {
      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       CHAT
    ========================================================== */

    arrowButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.background,
    },

    chatArrowButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      ...FixxamTokens.shadow.card,
    },

    /* ==========================================================
       META
    ========================================================== */

    metaRow: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderTopWidth: 1,

      borderBottomWidth: 1,

      borderColor:
        Colors.divider,
    },

    metaItem: {
      flex: 1,

      minWidth: 0,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    metaText: {
      flex: 1,

      minWidth: 0,

      color:
        Colors.textSecondary,
    },

    metaDivider: {
      width: 1,

      height: 18,

      marginHorizontal:
        FixxamTokens.spacing.sm,

      backgroundColor:
        Colors.divider,
    },

    metaDate: {
      maxWidth:
        120,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    dateText: {
      flexShrink: 1,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       PENDING
    ========================================================== */

    pendingNotice: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.warning,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.warningSoft,
    },

    pendingLeft: {
      flex: 1,

      minWidth: 0,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    pendingIcon: {
      width: 30,

      height: 30,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.sm,

      backgroundColor:
        Colors.surface,
    },

    pendingTitle: {
      flexShrink: 1,

      color:
        Colors.warning,
    },

    pendingAction: {
      flexShrink: 0,

      color:
        Colors.warning,
    },

    /* ==========================================================
       OFFER
    ========================================================== */

    offerNotice: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.success,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.successSoft,
    },

    offerLeft: {
      flex: 1,

      minWidth: 0,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    offerTitle: {
      color:
        Colors.success,
    },

    offerAmount: {
      flexShrink: 0,

      color:
        Colors.success,
    },

    /* ==========================================================
       FOOTER
    ========================================================== */

    footer: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    requestedContainer: {
      flex: 1,

      minWidth: 0,
    },

    requestedLabel: {
      color:
        Colors.textMuted,
    },

    requestedDate: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    total: {
      flexShrink: 1,

      maxWidth:
        120,

      color:
        Colors.textPrimary,
    },

    viewButton: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        WorkerColors.primary,
    },

    viewButtonText: {
      color:
        Colors.textInverse,
    },

    /* ==========================================================
       STATES
    ========================================================== */

    pressed: {
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
  });