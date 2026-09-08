import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  Image,
} from "expo-image";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import Toast from "react-native-toast-message";

import {
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import type {
  AppIconName,
} from "@/components/ui/AppIcon";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type TrackStatus =
  | "pending"
  | "accepted"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "expired";

type TimelineKey =
  | "pending"
  | "accepted"
  | "in-progress"
  | "completed";

type OrderData = {
  id: string;

  status: string;

  customerId?: string;

  workerId?: string;
  workerName?: string;
  workerPhone?: string;
  workerPhoto?: string;

  storeId?: string;
  storeName?: string;
  storePhone?: string;

  receiverName?: string;
  receiverPhone?: string;

  address?: string;
  deliveryAddress?: string;
  location?: string;
  deliveryLocation?: string;

  paymentMethod?: string;
  paymentStatus?: string;

  subtotal?: number;
  deliveryFee?: number;
  total?: number;

  acceptedAt?: unknown;
  onTheWayAt?: unknown;
  completedAt?: unknown;

  createdAt?: unknown;
  updatedAt?: unknown;

  [key: string]: unknown;
};

type TimelineStep = {
  key: TimelineKey;

  title: string;

  description: string;

  icon: AppIconName;
};

/* ============================================================
   TIMELINE
============================================================ */

const STEPS: readonly TimelineStep[] =
  [
    {
      key: "pending",

      title: "Order placed",

      description:
        "Your order has been placed successfully.",

      icon: "package",
    },

    {
      key: "accepted",

      title: "Seller accepted",

      description:
        "The seller has accepted your order.",

      icon: "success",
    },

    {
      key: "in-progress",

      title: "On the way",

      description:
        "The worker is delivering your order.",

      icon: "navigation",
    },

    {
      key: "completed",

      title: "Completed",

      description:
        "Your order has been completed.",

      icon: "success",
    },
  ];

/* ============================================================
   STRING HELPERS
============================================================ */

function normalizeStatus(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value
    .trim()
    .toLowerCase();
}

function getString(
  ...values: unknown[]
): string {
  for (
    const value of values
  ) {
    if (
      typeof value ===
        "string" &&
      value.trim()
    ) {
      return value.trim();
    }

    if (
      typeof value ===
        "number" &&
      Number.isFinite(value)
    ) {
      return String(value);
    }
  }

  return "";
}

/* ============================================================
   NUMBER
============================================================ */

function getNumber(
  ...values: unknown[]
): number {
  for (
    const value of values
  ) {
    if (
      typeof value ===
        "number" &&
      Number.isFinite(value)
    ) {
      return Math.max(
        0,
        value,
      );
    }

    if (
      typeof value ===
        "string" &&
      value.trim()
    ) {
      const parsed =
        Number(value);

      if (
        Number.isFinite(
          parsed,
        )
      ) {
        return Math.max(
          0,
          parsed,
        );
      }
    }
  }

  return 0;
}

/* ============================================================
   FORMATTERS
============================================================ */

function formatMoney(
  amount: number,
): string {
  const safeAmount =
    Number.isFinite(amount)
      ? Math.max(
          0,
          amount,
        )
      : 0;

  return `₦${safeAmount.toLocaleString(
    "en-NG",
  )}`;
}

function formatReadableValue(
  value: string,
): string {
  const normalized =
    value
      .trim()
      .replace(
        /[_-]+/g,
        " ",
      );

  if (!normalized) {
    return "";
  }

  return normalized.replace(
    /\b\w/g,
    (character) =>
      character.toUpperCase(),
  );
}

function formatTimestamp(
  value: unknown,
): string {
  try {
    let date:
      | Date
      | null = null;

    if (
      value &&
      typeof value ===
        "object" &&
      "toDate" in value
    ) {
      const timestamp =
        value as {
          toDate?: unknown;
        };

      if (
        typeof timestamp.toDate ===
        "function"
      ) {
        const resolved =
          timestamp.toDate();

        if (
          resolved instanceof
            Date
        ) {
          date = resolved;
        }
      }
    } else if (
      value instanceof Date
    ) {
      date = value;
    } else if (
      typeof value ===
        "number" &&
      Number.isFinite(value)
    ) {
      date =
        new Date(value);
    } else if (
      typeof value ===
        "string" &&
      value.trim()
    ) {
      date =
        new Date(value);
    }

    if (
      !date ||
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return "";
    }

    return date.toLocaleString(
      "en-NG",
      {
        day: "2-digit",

        month: "short",

        hour: "2-digit",

        minute:
          "2-digit",
      },
    );
  } catch (
    formatError
  ) {
    console.error(
      "FIXXAM_FORMAT_TRACK_TIMESTAMP_ERROR:",
      formatError,
    );

    return "";
  }
}

/* ============================================================
   TRACK STATUS
============================================================ */

function normalizeTrackStatus(
  value: unknown,
): TrackStatus {
  const status =
    normalizeStatus(value);

  switch (status) {
    case "accepted":
      return "accepted";

    case "in-progress":
    case "in_progress":
    case "on-the-way":
    case "on_the_way":
    case "on the way":
      return "in-progress";

    case "completed":
    case "delivered":
      return "completed";

    case "cancelled":
    case "canceled":
      return "cancelled";

    case "expired":
      return "expired";

    case "pending":
    default:
      return "pending";
  }
}

function getStatusIndex(
  status: TrackStatus,
): number {
  switch (status) {
    case "accepted":
      return 1;

    case "in-progress":
      return 2;

    case "completed":
      return 3;

    case "pending":
    case "cancelled":
    case "expired":
    default:
      return 0;
  }
}

function getStatusIcon(
  status: TrackStatus,
): AppIconName {
  switch (status) {
    case "completed":
      return "success";

    case "cancelled":
      return "error";

    case "expired":
      return "clock";

    case "in-progress":
      return "navigation";

    case "accepted":
      return "success";

    case "pending":
    default:
      return "package";
  }
}

function getTimelineTimestamp(
  order: OrderData,
  key: TimelineKey,
): string {
  switch (key) {
    case "pending":
      return formatTimestamp(
        order.createdAt,
      );

    case "accepted":
      return formatTimestamp(
        order.acceptedAt,
      );

    case "in-progress":
      return formatTimestamp(
        order.onTheWayAt,
      );

    case "completed":
      return formatTimestamp(
        order.completedAt,
      );
  }
}

/* ============================================================
   SCREEN
============================================================ */

export default function MarketOrderTrackScreen() {
  const {
    orderId,
  } =
    useLocalSearchParams<{
      orderId?:
        | string
        | string[];
    }>();

  /* ==========================================================
     ORDER ID
  ========================================================== */

  const cleanOrderId =
    useMemo(() => {
      if (
        Array.isArray(
          orderId,
        )
      ) {
        return (
          orderId[0] ??
          ""
        ).trim();
      }

      return (
        orderId ?? ""
      ).trim();
    }, [
      orderId,
    ]);

  /* ==========================================================
     STATE
  ========================================================== */

  const [
    order,
    setOrder,
  ] =
    useState<OrderData | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  /* ==========================================================
     FIRESTORE LIVE LISTENER
  ========================================================== */

  useEffect(() => {
    const user =
      auth.currentUser;

    if (!user) {
      setOrder(null);

      setLoading(false);

      setError(
        "Please sign in again to track this order.",
      );

      return;
    }

    if (!cleanOrderId) {
      setOrder(null);

      setLoading(false);

      setError(
        "Order ID is missing.",
      );

      return;
    }

    setLoading(true);

    setError(null);

    const orderRef =
      doc(
        db,
        "orders",
        cleanOrderId,
      );

    const unsubscribe =
      onSnapshot(
        orderRef,

        (
          snapshot,
        ) => {
          if (
            !snapshot.exists()
          ) {
            setOrder(null);

            setLoading(
              false,
            );

            setError(
              "This order could not be found.",
            );

            return;
          }

          const data =
            snapshot.data();

          /* ==================================================
             CUSTOMER OWNERSHIP
          ================================================== */

          const customerId =
            getString(
              data.customerId,
            );

          /*
           * Missing customerId is also denied.
           *
           * Firestore Security Rules must enforce
           * the same ownership server-side.
           */
          if (
            customerId !==
            user.uid
          ) {
            setOrder(null);

            setLoading(
              false,
            );

            setError(
              "You do not have permission to track this order.",
            );

            return;
          }

          /* ==================================================
             MARKET ORDER CHECK
          ================================================== */

          const orderType =
            normalizeStatus(
              data.orderType,
            );

          const type =
            normalizeStatus(
              data.type,
            );

          if (
            orderType !==
              "market" &&
            type !==
              "market"
          ) {
            setOrder(null);

            setLoading(
              false,
            );

            setError(
              "This is not a market order.",
            );

            return;
          }

          /* ==================================================
             SAFE ORDER MAPPING
          ================================================== */

          const mappedOrder: OrderData =
            {
              ...data,

              id:
                snapshot.id,

              status:
                getString(
                  data.status,
                  "pending",
                ),
            };

          setOrder(
            mappedOrder,
          );

          setLoading(false);

          setError(null);
        },

        (
          listenerError,
        ) => {
          console.error(
            "FIXXAM_CUSTOMER_MARKET_TRACK_ERROR:",
            listenerError,
          );

          setOrder(null);

          setLoading(false);

          setError(
            "Unable to track this order. Please try again.",
          );
        },
      );

    return unsubscribe;
  }, [
    cleanOrderId,
  ]);

  /* ==========================================================
     CALL WORKER
  ========================================================== */

  const handleCallWorker =
    useCallback(async () => {
      const workerPhone =
        getString(
          order?.workerPhone,
        );

      if (!workerPhone) {
        Toast.show({
          type: "info",

          text1:
            "Worker phone unavailable",

          text2:
            "This worker does not have a phone number.",
        });

        return;
      }

      const safePhone =
        workerPhone.replace(
          /[^+\d]/g,
          "",
        );

      if (!safePhone) {
        Toast.show({
          type: "error",

          text1:
            "Invalid phone number",

          text2:
            "The worker's phone number is not valid.",
        });

        return;
      }

      const phoneUrl =
        `tel:${safePhone}`;

      try {
        const supported =
          await Linking.canOpenURL(
            phoneUrl,
          );

        if (!supported) {
          Toast.show({
            type:
              "error",

            text1:
              "Calling unavailable",

            text2:
              "Your device cannot make phone calls.",
          });

          return;
        }

        await Linking.openURL(
          phoneUrl,
        );
      } catch (
        callError
      ) {
        console.error(
          "FIXXAM_TRACK_CALL_WORKER_ERROR:",
          callError,
        );

        Toast.show({
          type: "error",

          text1:
            "Unable to call worker",

          text2:
            "Please try again.",
        });
      }
    }, [
      order?.workerPhone,
    ]);

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <AppScreen
        role="customer"
        contentContainerStyle={
          styles.screen
        }
      >
        <View
          style={
            styles.centerState
          }
        >
          <ActivityIndicator
            size="small"
            color={
              CustomerColors.primary
            }
          />

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.stateText
            }
          >
            Loading tracking...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (
    error ||
    !order
  ) {
    return (
      <AppScreen
        role="customer"
        contentContainerStyle={
          styles.screen
        }
      >
        <View
          style={
            styles.centerState
          }
        >
          <View
            style={
              styles.errorIcon
            }
          >
            <AppIcon
              name="error"
              size="lg"
              color={
                Colors.error
              }
            />
          </View>

          <AppText
            variant="heading3"
            weight="bold"
            center
            style={
              styles.stateTitle
            }
          >
            Unable to track order
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.stateText
            }
          >
            {error ??
              "Order not found."}
          </AppText>

          <Pressable
            onPress={() =>
              router.back()
            }
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({
              pressed,
            }) => [
              styles.backButton,

              pressed
                ? styles.pressed
                : null,
            ]}
          >
            <AppIcon
              name="back"
              size="xs"
              color={
                Colors.textInverse
              }
            />

            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.backButtonText
              }
            >
              GO BACK
            </AppText>
          </Pressable>
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
     VALUES
  ========================================================== */

  const status =
    normalizeTrackStatus(
      order.status,
    );

  const currentIndex =
    getStatusIndex(
      status,
    );

  const isCancelled =
    status ===
    "cancelled";

  const isExpired =
    status ===
    "expired";

  const isCompleted =
    status ===
    "completed";

  const workerId =
    getString(
      order.workerId,
    );

  const workerName =
    getString(
      order.workerName,
      "Delivery Worker",
    );

  const workerPhone =
    getString(
      order.workerPhone,
    );

  const workerPhoto =
    getString(
      order.workerPhoto,
    );

  const storeName =
    getString(
      order.storeName,
      "Market Store",
    );

  const address =
    getString(
      order.address,
      order.deliveryAddress,
      order.location,
      order.deliveryLocation,
      "Delivery address unavailable",
    );

  const receiverName =
    getString(
      order.receiverName,
      "Customer",
    );

  const receiverPhone =
    getString(
      order.receiverPhone,
    );

  const paymentMethod =
    formatReadableValue(
      getString(
        order.paymentMethod,
        "cash",
      ),
    );

  const paymentStatus =
    formatReadableValue(
      getString(
        order.paymentStatus,
        "pending",
      ),
    );

  const subtotal =
    getNumber(
      order.subtotal,
    );

  const deliveryFee =
    getNumber(
      order.deliveryFee,
    );

  const total =
    getNumber(
      order.total,
      subtotal +
        deliveryFee,
    );

  const statusIcon =
    getStatusIcon(
      status,
    );

  const statusColor =
    isCompleted
      ? Colors.success
      : isCancelled
        ? Colors.error
        : isExpired
          ? Colors.warning
          : CustomerColors.primary;

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen
      role="customer"
      contentContainerStyle={
        styles.screen
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={
          styles.content
        }
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <View
          style={
            styles.header
          }
        >
          <Pressable
            onPress={() =>
              router.back()
            }
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({
              pressed,
            }) => [
              styles.headerButton,

              pressed
                ? styles.pressed
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

          <View
            style={
              styles.headerText
            }
          >
            <AppText
              variant="heading2"
              weight="bold"
              style={
                styles.headerTitle
              }
            >
              Track Order
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={
                styles.headerSubtitle
              }
            >
              #{cleanOrderId}
            </AppText>
          </View>

          <View
            style={
              styles.liveBadge
            }
            accessibilityLabel="Live order updates enabled"
          >
            <View
              style={
                styles.liveDot
              }
            />

            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.liveText
              }
            >
              LIVE
            </AppText>
          </View>
        </View>

        {/* ====================================================
            CURRENT STATUS
        ==================================================== */}

        <View
          style={[
            styles.currentStatus,

            isCompleted
              ? styles.completedStatus
              : null,

            isCancelled
              ? styles.cancelledStatus
              : null,

            isExpired
              ? styles.expiredStatus
              : null,
          ]}
        >
          <View
            style={[
              styles.currentStatusIcon,

              {
                backgroundColor:
                  isCompleted
                    ? Colors.successSoft
                    : isCancelled
                      ? Colors.errorSoft
                      : isExpired
                        ? Colors.warningSoft
                        : CustomerColors.primarySoft,
              },
            ]}
          >
            <AppIcon
              name={
                statusIcon
              }
              role="customer"
              size="lg"
              color={
                statusColor
              }
            />
          </View>

          <View
            style={
              styles.currentStatusContent
            }
          >
            <AppText
              variant="body"
              weight="bold"
              style={
                styles.currentStatusTitle
              }
            >
              {isCompleted
                ? "Order completed"
                : isCancelled
                  ? "Order cancelled"
                  : isExpired
                    ? "Order expired"
                    : status ===
                        "in-progress"
                      ? "Your order is on the way"
                      : status ===
                          "accepted"
                        ? "Order accepted"
                        : "Order placed"}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.currentStatusText
              }
            >
              {isCompleted
                ? "Your market order has been completed."
                : isCancelled
                  ? "This order has been cancelled."
                  : isExpired
                    ? "This order is no longer active."
                    : status ===
                        "in-progress"
                      ? "The worker is delivering your order."
                      : status ===
                          "accepted"
                        ? "The seller has accepted your order."
                        : "Waiting for the seller to accept your order."}
            </AppText>
          </View>
        </View>

        {/* ====================================================
            TIMELINE
        ==================================================== */}

        {!isCancelled &&
        !isExpired ? (
          <View
            style={
              styles.card
            }
          >
            <AppText
              variant="body"
              weight="bold"
              style={
                styles.cardTitle
              }
            >
              Order progress
            </AppText>

            <View
              style={
                styles.timeline
              }
            >
              {STEPS.map(
                (
                  step,
                  index,
                ) => {
                  const completed =
                    index <
                    currentIndex;

                  const active =
                    index ===
                    currentIndex;

                  const finalCompleted =
                    active &&
                    isCompleted;

                  const last =
                    index ===
                    STEPS.length -
                      1;

                  const stepTimestamp =
                    getTimelineTimestamp(
                      order,
                      step.key,
                    );

                  return (
                    <View
                      key={
                        step.key
                      }
                      style={
                        styles.timelineRow
                      }
                    >
                      <View
                        style={
                          styles.timelineLeft
                        }
                      >
                        <View
                          style={[
                            styles.timelineCircle,

                            completed
                              ? styles.timelineCircleCompleted
                              : null,

                            active &&
                            !finalCompleted
                              ? styles.timelineCircleActive
                              : null,

                            finalCompleted
                              ? styles.timelineCircleCompleted
                              : null,
                          ]}
                        >
                          {completed ||
                          finalCompleted ? (
                            <AppIcon
                              name="check"
                              size="xs"
                              color={
                                Colors.textInverse
                              }
                            />
                          ) : (
                            <AppIcon
                              name={
                                step.icon
                              }
                              role="customer"
                              size="xs"
                              color={
                                active
                                  ? CustomerColors.primary
                                  : Colors.textMuted
                              }
                            />
                          )}
                        </View>

                        {!last ? (
                          <View
                            style={[
                              styles.verticalLine,

                              index <
                              currentIndex
                                ? styles.verticalLineActive
                                : null,
                            ]}
                          />
                        ) : null}
                      </View>

                      <View
                        style={
                          styles.timelineContent
                        }
                      >
                        <AppText
                          variant="caption"
                          weight={
                            active ||
                            completed
                              ? "bold"
                              : undefined
                          }
                          style={[
                            styles.timelineTitle,

                            active
                              ? styles.timelineTitleActive
                              : null,
                          ]}
                        >
                          {step.title}
                        </AppText>

                        <AppText
                          variant="caption"
                          tone="secondary"
                          style={
                            styles.timelineDescription
                          }
                        >
                          {step.description}
                        </AppText>

                        {stepTimestamp ? (
                          <AppText
                            variant="caption"
                            style={
                              styles.timelineDate
                            }
                          >
                            {stepTimestamp}
                          </AppText>
                        ) : null}
                      </View>
                    </View>
                  );
                },
              )}
            </View>
          </View>
        ) : (
          <View
            style={
              styles.card
            }
          >
            <View
              style={[
                styles.closedBox,

                isCancelled
                  ? styles.cancelledClosedBox
                  : styles.expiredClosedBox,
              ]}
            >
              <AppIcon
                name={
                  isCancelled
                    ? "error"
                    : "clock"
                }
                size="lg"
                color={
                  isCancelled
                    ? Colors.error
                    : Colors.warning
                }
              />

              <AppText
                variant="body"
                weight="bold"
                style={
                  styles.closedTitle
                }
              >
                {isCancelled
                  ? "Order cancelled"
                  : "Order expired"}
              </AppText>
            </View>
          </View>
        )}

        {/* ====================================================
            WORKER
        ==================================================== */}

        {workerId ? (
          <View
            style={
              styles.card
            }
          >
            <AppText
              variant="body"
              weight="bold"
              style={
                styles.cardTitle
              }
            >
              Delivery worker
            </AppText>

            <View
              style={
                styles.workerRow
              }
            >
              <WorkerAvatar
                photoURL={
                  workerPhoto
                }
                name={
                  workerName
                }
              />

              <View
                style={
                  styles.workerInfo
                }
              >
                <AppText
                  variant="body"
                  weight="bold"
                  numberOfLines={1}
                  style={
                    styles.workerName
                  }
                >
                  {workerName}
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.workerRole
                  }
                >
                  Delivery worker
                </AppText>

                {workerPhone ? (
                  <AppText
                    variant="caption"
                    style={
                      styles.workerPhone
                    }
                  >
                    {workerPhone}
                  </AppText>
                ) : null}
              </View>

              {workerPhone ? (
                <Pressable
                  onPress={
                    handleCallWorker
                  }
                  hitSlop={5}
                  accessibilityRole="button"
                  accessibilityLabel="Call delivery worker"
                  style={({
                    pressed,
                  }) => [
                    styles.callButton,

                    pressed
                      ? styles.pressed
                      : null,
                  ]}
                >
                  <AppIcon
                    name="phone"
                    role="customer"
                    size="sm"
                    color={
                      Colors.textInverse
                    }
                  />
                </Pressable>
              ) : null}
            </View>

            {status ===
            "in-progress" ? (
              <View
                style={
                  styles.trackingNotice
                }
              >
                <View
                  style={
                    styles.trackingDot
                  }
                />

                <AppText
                  variant="caption"
                  style={
                    styles.trackingText
                  }
                >
                  Your order is currently with the delivery worker.
                </AppText>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* ====================================================
            DELIVERY DETAILS
        ==================================================== */}

        <View
          style={
            styles.card
          }
        >
          <AppText
            variant="body"
            weight="bold"
            style={
              styles.cardTitle
            }
          >
            Delivery details
          </AppText>

          <DetailRow
            icon="profile"
            label="Receiver"
            value={
              receiverName
            }
            subValue={
              receiverPhone
            }
          />

          <View
            style={
              styles.detailDivider
            }
          />

          <DetailRow
            icon="location"
            label="Delivery address"
            value={
              address
            }
          />
        </View>

        {/* ====================================================
            ORDER INFORMATION
        ==================================================== */}

        <View
          style={
            styles.card
          }
        >
          <AppText
            variant="body"
            weight="bold"
            style={
              styles.cardTitle
            }
          >
            Order information
          </AppText>

          <InfoRow
            label="Order ID"
            value={`#${cleanOrderId}`}
          />

          <InfoRow
            label="Store"
            value={
              storeName
            }
          />

          <InfoRow
            label="Payment"
            value={
              paymentMethod
            }
          />

          <InfoRow
            label="Payment status"
            value={
              paymentStatus
            }
          />

          <InfoRow
            label="Subtotal"
            value={
              formatMoney(
                subtotal,
              )
            }
          />

          <InfoRow
            label="Delivery fee"
            value={
              formatMoney(
                deliveryFee,
              )
            }
          />

          <View
            style={
              styles.totalRow
            }
          >
            <AppText
              variant="body"
              weight="bold"
              style={
                styles.totalLabel
              }
            >
              Total
            </AppText>

            <AppText
              variant="heading3"
              weight="bold"
              style={
                styles.totalValue
              }
            >
              {formatMoney(
                total,
              )}
            </AppText>
          </View>
        </View>

        {/* ====================================================
            LIVE INFO
        ==================================================== */}

        {status ===
        "in-progress" ? (
          <View
            style={
              styles.liveInfo
            }
          >
            <View
              style={
                styles.liveInfoIcon
              }
            >
              <AppIcon
                name="info"
                role="customer"
                size="sm"
                color={
                  CustomerColors.primary
                }
              />
            </View>

            <View
              style={
                styles.liveInfoContent
              }
            >
              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.liveInfoTitle
                }
              >
                Live order tracking
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.liveInfoText
                }
              >
                This page updates automatically when the worker changes the order status.
              </AppText>
            </View>
          </View>
        ) : null}

        <View
          style={
            styles.bottomSpace
          }
        />
      </ScrollView>
    </AppScreen>
  );
}

/* ============================================================
   WORKER AVATAR
============================================================ */

const WorkerAvatar =
  memo(
    function WorkerAvatar({
      photoURL,
      name,
    }: {
      photoURL: string;

      name: string;
    }) {
      const [
        imageFailed,
        setImageFailed,
      ] =
        useState(false);

      useEffect(() => {
        setImageFailed(
          false,
        );
      }, [
        photoURL,
      ]);

      if (
        photoURL &&
        !imageFailed
      ) {
        return (
          <Image
            source={{
              uri:
                photoURL,
            }}
            contentFit="cover"
            transition={150}
            accessibilityLabel={`${name} profile photo`}
            onError={() => {
              setImageFailed(
                true,
              );
            }}
            style={
              styles.workerAvatar
            }
          />
        );
      }

      return (
        <View
          style={
            styles.workerAvatar
          }
        >
          <AppIcon
            name="profile"
            role="customer"
            size="md"
            color={
              CustomerColors.primary
            }
          />
        </View>
      );
    },
  );

/* ============================================================
   DETAIL ROW
============================================================ */

const DetailRow =
  memo(
    function DetailRow({
      icon,
      label,
      value,
      subValue,
    }: {
      icon: AppIconName;

      label: string;

      value: string;

      subValue?: string;
    }) {
      return (
        <View
          style={
            styles.detailRow
          }
        >
          <View
            style={
              styles.detailIcon
            }
          >
            <AppIcon
              name={icon}
              role="customer"
              size="sm"
              color={
                CustomerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.detailContent
            }
          >
            <AppText
              variant="caption"
              style={
                styles.detailLabel
              }
            >
              {label}
            </AppText>

            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.detailValue
              }
            >
              {value}
            </AppText>

            {subValue ? (
              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.detailSubValue
                }
              >
                {subValue}
              </AppText>
            ) : null}
          </View>
        </View>
      );
    },
  );

/* ============================================================
   INFO ROW
============================================================ */

const InfoRow =
  memo(
    function InfoRow({
      label,
      value,
    }: {
      label: string;

      value: string;
    }) {
      return (
        <View
          style={
            styles.infoRow
          }
        >
          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.infoLabel
            }
          >
            {label}
          </AppText>

          <AppText
            variant="caption"
            weight="bold"
            numberOfLines={2}
            style={
              styles.infoValue
            }
          >
            {value}
          </AppText>
        </View>
      );
    },
  );

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       SCREEN
    ======================================================== */

    screen: {
      flex: 1,

      width: "100%",

      paddingHorizontal: 0,

      paddingTop: 0,

      paddingBottom: 0,

      backgroundColor:
        Colors.background,
    },

    content: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.xs,

      paddingBottom:
        FixxamTokens.spacing.xxl,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      minHeight:
        FixxamTokens.size.headerHeight,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    headerButton: {
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
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    headerText: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.md,
    },

    headerTitle: {
      color:
        Colors.textPrimary,
    },

    headerSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    liveBadge: {
      minHeight: 32,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderWidth: 1,

      borderColor:
        Colors.success,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        Colors.successSoft,
    },

    liveDot: {
      width: 7,

      height: 7,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.success,
    },

    liveText: {
      color:
        Colors.success,
    },

    /* ========================================================
       CURRENT STATUS
    ======================================================== */

    currentStatus: {
      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        CustomerColors.primary,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    completedStatus: {
      borderColor:
        Colors.success,

      backgroundColor:
        Colors.successSoft,
    },

    cancelledStatus: {
      borderColor:
        Colors.error,

      backgroundColor:
        Colors.errorSoft,
    },

    expiredStatus: {
      borderColor:
        Colors.warning,

      backgroundColor:
        Colors.warningSoft,
    },

    currentStatusIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,
    },

    currentStatusContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    currentStatusTitle: {
      color:
        Colors.textPrimary,
    },

    currentStatusText: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 16,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      marginTop:
        FixxamTokens.spacing.md,

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

    cardTitle: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       TIMELINE
    ======================================================== */

    timeline: {
      marginTop:
        FixxamTokens.spacing.lg,
    },

    timelineRow: {
      minHeight: 76,

      flexDirection:
        "row",
    },

    timelineLeft: {
      width: 38,

      alignItems:
        "center",
    },

    timelineCircle: {
      width: 30,

      height: 30,

      zIndex: 2,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 2,

      borderColor:
        Colors.disabled,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.background,
    },

    timelineCircleCompleted: {
      borderColor:
        Colors.success,

      backgroundColor:
        Colors.success,
    },

    timelineCircleActive: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    verticalLine: {
      position:
        "absolute",

      top: 30,

      bottom: 0,

      width: 2,

      backgroundColor:
        Colors.divider,
    },

    verticalLineActive: {
      backgroundColor:
        Colors.success,
    },

    timelineContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.lg,
    },

    timelineTitle: {
      color:
        Colors.textSecondary,
    },

    timelineTitleActive: {
      color:
        Colors.textPrimary,
    },

    timelineDescription: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 15,

      color:
        Colors.textSecondary,
    },

    timelineDate: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textMuted,
    },

    /* ========================================================
       CLOSED
    ======================================================== */

    closedBox: {
      minHeight: 100,

      padding:
        FixxamTokens.spacing.md,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,
    },

    cancelledClosedBox: {
      backgroundColor:
        Colors.errorSoft,
    },

    expiredClosedBox: {
      backgroundColor:
        Colors.warningSoft,
    },

    closedTitle: {
      marginTop:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       WORKER
    ======================================================== */

    workerRow: {
      marginTop:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    workerAvatar: {
      width:
        FixxamTokens.size.avatarMd,

      height:
        FixxamTokens.size.avatarMd,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      overflow:
        "hidden",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    workerInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    workerName: {
      color:
        Colors.textPrimary,
    },

    workerRole: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    workerPhone: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textMuted,
    },

    callButton: {
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
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primary,
    },

    trackingNotice: {
      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    trackingDot: {
      width: 8,

      height: 8,

      flexShrink: 0,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primary,
    },

    trackingText: {
      flex: 1,

      color:
        CustomerColors.primary,
    },

    /* ========================================================
       DELIVERY DETAILS
    ======================================================== */

    detailRow: {
      marginTop:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "flex-start",
    },

    detailIcon: {
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
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    detailContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    detailLabel: {
      color:
        Colors.textMuted,
    },

    detailValue: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 16,

      color:
        Colors.textPrimary,
    },

    detailSubValue: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    detailDivider: {
      height: 1,

      marginTop:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.divider,
    },

    /* ========================================================
       INFO
    ======================================================== */

    infoRow: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,

      borderBottomWidth: 1,

      borderBottomColor:
        Colors.divider,
    },

    infoLabel: {
      color:
        Colors.textSecondary,
    },

    infoValue: {
      flex: 1,

      minWidth: 0,

      textAlign:
        "right",

      color:
        Colors.textPrimary,
    },

    totalRow: {
      marginTop:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      borderTopWidth: 1,

      borderTopColor:
        Colors.border,
    },

    totalLabel: {
      color:
        Colors.textPrimary,
    },

    totalValue: {
      color:
        CustomerColors.primary,
    },

    /* ========================================================
       LIVE INFO
    ======================================================== */

    liveInfo: {
      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        CustomerColors.primary,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    liveInfoIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    liveInfoContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    liveInfoTitle: {
      color:
        CustomerColors.primary,
    },

    liveInfoText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 15,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       STATES
    ======================================================== */

    centerState: {
      flex: 1,

      minHeight: 500,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    stateTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    stateText: {
      maxWidth: 320,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    errorIcon: {
      width: 68,

      height: 68,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.errorSoft,
    },

    backButton: {
      minHeight:
        FixxamTokens.size.buttonHeight,

      marginTop:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    backButtonText: {
      color:
        Colors.textInverse,
    },

    bottomSpace: {
      height:
        FixxamTokens.spacing.xl,
    },

    /* ========================================================
       PRESS
    ======================================================== */

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