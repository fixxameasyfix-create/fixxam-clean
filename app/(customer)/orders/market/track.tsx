import React, {
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

import Ionicons from "@expo/vector-icons/Ionicons";

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
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  auth,
  db,
} from "@/firebase/config";

/* ============================================================
   TYPES
============================================================ */

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

/* ============================================================
   TIMELINE
============================================================ */

const STEPS = [
  {
    key: "pending",
    title: "Order placed",
    description:
      "Your order has been placed successfully.",
    icon: "receipt-outline" as const,
  },
  {
    key: "accepted",
    title: "Seller accepted",
    description:
      "The seller has accepted your order.",
    icon: "checkmark-circle-outline" as const,
  },
  {
    key: "in-progress",
    title: "On the way",
    description:
      "The worker is delivering your order.",
    icon: "navigate-outline" as const,
  },
  {
    key: "completed",
    title: "Completed",
    description:
      "Your order has been completed.",
    icon: "checkmark-done-circle-outline" as const,
  },
];

/* ============================================================
   HELPERS
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
  for (const value of values) {
    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return String(value);
    }
  }

  return "";
}

function getNumber(
  ...values: unknown[]
): number {
  for (const value of values) {
    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      const parsed =
        Number(value);

      if (
        Number.isFinite(parsed)
      ) {
        return parsed;
      }
    }
  }

  return 0;
}

function formatMoney(
  amount: number,
): string {
  return `₦${amount.toLocaleString(
    "en-NG",
  )}`;
}

function formatTimestamp(
  value: unknown,
): string {
  try {
    if (
      value &&
      typeof value === "object" &&
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
        const date =
          timestamp.toDate();

        if (
          date instanceof Date &&
          !Number.isNaN(
            date.getTime(),
          )
        ) {
          return date.toLocaleString(
            "en-NG",
            {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            },
          );
        }
      }
    }

    if (
      value instanceof Date &&
      !Number.isNaN(
        value.getTime(),
      )
    ) {
      return value.toLocaleString(
        "en-NG",
        {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        },
      );
    }

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      const date =
        new Date(value);

      if (
        !Number.isNaN(
          date.getTime(),
        )
      ) {
        return date.toLocaleString(
          "en-NG",
          {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          },
        );
      }
    }
  } catch (error) {
    console.error(
      "FIXXAM_FORMAT_TRACK_TIMESTAMP_ERROR:",
      error,
    );
  }

  return "";
}

function getStatusIndex(
  status: string,
): number {
  switch (
    normalizeStatus(status)
  ) {
    case "accepted":
      return 1;

    case "in-progress":
    case "in_progress":
    case "on-the-way":
    case "on_the_way":
    case "on the way":
      return 2;

    case "completed":
    case "delivered":
      return 3;

    case "pending":
    default:
      return 0;
  }
}

function normalizeTrackStatus(
  value: unknown,
): string {
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
        Array.isArray(orderId)
      ) {
        return (
          orderId[0] ?? ""
        ).trim();
      }

      return (
        orderId ?? ""
      ).trim();
    }, [orderId]);

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
        (snapshot) => {
          if (
            !snapshot.exists()
          ) {
            setOrder(null);
            setLoading(false);
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

          if (
            customerId &&
            customerId !==
              user.uid
          ) {
            setOrder(null);
            setLoading(false);
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
            orderType !== "market" &&
            type !== "market"
          ) {
            setOrder(null);
            setLoading(false);
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
              id: snapshot.id,
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
        (listenerError) => {
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

    return () => {
      unsubscribe();
    };
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

      const phoneUrl =
        `tel:${workerPhone}`;

      try {
        const supported =
          await Linking.canOpenURL(
            phoneUrl,
          );

        if (!supported) {
          Toast.show({
            type: "error",
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
      } catch (callError) {
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
            color="#2563EB"
          />

          <AppText
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
            <Ionicons
              name="location-outline"
              size={29}
              color="#DC2626"
            />
          </View>

          <AppText
            weight="bold"
            style={
              styles.stateTitle
            }
          >
            Unable to track order
          </AppText>

          <AppText
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
            style={
              styles.backButton
            }
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <AppText
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
    status === "cancelled";

  const isExpired =
    status === "expired";

  const isCompleted =
    status === "completed";

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
    getString(
      order.paymentMethod,
      "cash",
    );

  const paymentStatus =
    getString(
      order.paymentStatus,
      "pending",
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

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen
      contentContainerStyle={
        styles.screen
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
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
            style={
              styles.headerButton
            }
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="chevron-back"
              size={21}
              color="#0F172A"
            />
          </Pressable>

          <View
            style={
              styles.headerText
            }
          >
            <AppText
              weight="bold"
              style={
                styles.headerTitle
              }
            >
              Track Order
            </AppText>

            <AppText
              style={
                styles.headerSubtitle
              }
              numberOfLines={1}
            >
              #{cleanOrderId}
            </AppText>
          </View>

          <View
            style={
              styles.liveBadge
            }
          >
            <View
              style={
                styles.liveDot
              }
            />

            <AppText
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
            isCompleted &&
              styles.completedStatus,
            (isCancelled ||
              isExpired) &&
              styles.closedStatus,
          ]}
        >
          <View
            style={[
              styles.currentStatusIcon,
              isCompleted &&
                styles.completedStatusIcon,
              isCancelled &&
                styles.cancelledStatusIcon,
              isExpired &&
                styles.expiredStatusIcon,
            ]}
          >
            <Ionicons
              name={
                isCompleted
                  ? "checkmark-done-circle"
                  : isCancelled
                    ? "close-circle"
                    : isExpired
                      ? "time"
                      : status ===
                          "in-progress"
                        ? "navigate"
                        : status ===
                            "accepted"
                          ? "checkmark-circle"
                          : "receipt"
              }
              size={27}
              color={
                isCompleted
                  ? "#15803D"
                  : isCancelled
                    ? "#DC2626"
                    : isExpired
                      ? "#64748B"
                      : "#2563EB"
              }
            />
          </View>

          <View
            style={
              styles.currentStatusContent
            }
          >
            <AppText
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

                  const last =
                    index ===
                    STEPS.length -
                      1;

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
                            completed &&
                              styles.timelineCircleCompleted,
                            active &&
                              styles.timelineCircleActive,
                          ]}
                        >
                          {completed ? (
                            <Ionicons
                              name="checkmark"
                              size={14}
                              color="#FFFFFF"
                            />
                          ) : (
                            <Ionicons
                              name={
                                step.icon
                              }
                              size={14}
                              color={
                                active
                                  ? "#2563EB"
                                  : "#94A3B8"
                              }
                            />
                          )}
                        </View>

                        {!last ? (
                          <View
                            style={[
                              styles.verticalLine,
                              index <
                                currentIndex &&
                                styles.verticalLineActive,
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
                          weight={
                            active ||
                            completed
                              ? "bold"
                              : undefined
                          }
                          style={[
                            styles.timelineTitle,
                            active &&
                              styles.timelineTitleActive,
                          ]}
                        >
                          {
                            step.title
                          }
                        </AppText>

                        <AppText
                          style={
                            styles.timelineDescription
                          }
                        >
                          {
                            step.description
                          }
                        </AppText>

                        {step.key ===
                        "accepted" ? (
                          <AppText
                            style={
                              styles.timelineDate
                            }
                          >
                            {formatTimestamp(
                              order.acceptedAt,
                            )}
                          </AppText>
                        ) : null}

                        {step.key ===
                        "in-progress" ? (
                          <AppText
                            style={
                              styles.timelineDate
                            }
                          >
                            {formatTimestamp(
                              order.onTheWayAt,
                            )}
                          </AppText>
                        ) : null}

                        {step.key ===
                        "completed" ? (
                          <AppText
                            style={
                              styles.timelineDate
                            }
                          >
                            {formatTimestamp(
                              order.completedAt,
                            )}
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
                isCancelled &&
                  styles.cancelledClosedBox,
              ]}
            >
              <Ionicons
                name={
                  isCancelled
                    ? "close-circle-outline"
                    : "time-outline"
                }
                size={26}
                color={
                  isCancelled
                    ? "#DC2626"
                    : "#64748B"
                }
              />

              <AppText
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
              <View
                style={
                  styles.workerAvatar
                }
              >
                <Ionicons
                  name="person-outline"
                  size={24}
                  color="#2563EB"
                />
              </View>

              <View
                style={
                  styles.workerInfo
                }
              >
                <AppText
                  weight="bold"
                  numberOfLines={1}
                  style={
                    styles.workerName
                  }
                >
                  {workerName}
                </AppText>

                <AppText
                  style={
                    styles.workerRole
                  }
                >
                  Delivery worker
                </AppText>

                {workerPhone ? (
                  <AppText
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
                  style={
                    styles.callButton
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Call delivery worker"
                >
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color="#FFFFFF"
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
                  style={
                    styles.trackingText
                  }
                >
                  Your order is currently
                  with the delivery worker.
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
            weight="bold"
            style={
              styles.cardTitle
            }
          >
            Delivery details
          </AppText>

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
              <Ionicons
                name="person-outline"
                size={19}
                color="#2563EB"
              />
            </View>

            <View
              style={
                styles.detailContent
              }
            >
              <AppText
                style={
                  styles.detailLabel
                }
              >
                Receiver
              </AppText>

              <AppText
                weight="bold"
                style={
                  styles.detailValue
                }
              >
                {receiverName}
              </AppText>

              {receiverPhone ? (
                <AppText
                  style={
                    styles.detailSubValue
                  }
                >
                  {receiverPhone}
                </AppText>
              ) : null}
            </View>
          </View>

          <View
            style={
              styles.detailDivider
            }
          />

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
              <Ionicons
                name="location-outline"
                size={20}
                color="#2563EB"
              />
            </View>

            <View
              style={
                styles.detailContent
              }
            >
              <AppText
                style={
                  styles.detailLabel
                }
              >
                Delivery address
              </AppText>

              <AppText
                weight="bold"
                style={
                  styles.detailValue
                }
              >
                {address}
              </AppText>
            </View>
          </View>
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
              weight="bold"
              style={
                styles.totalLabel
              }
            >
              Total
            </AppText>

            <AppText
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
              <Ionicons
                name="radio-outline"
                size={20}
                color="#2563EB"
              />
            </View>

            <View
              style={
                styles.liveInfoContent
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.liveInfoTitle
                }
              >
                Live order tracking
              </AppText>

              <AppText
                style={
                  styles.liveInfoText
                }
              >
                This page updates automatically
                when the worker changes the
                order status.
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
   INFO ROW
============================================================ */

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
        style={
          styles.infoLabel
        }
      >
        {label}
      </AppText>

      <AppText
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
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      width: "100%",
      backgroundColor:
        "#F8FAFC",
    },

    content: {
      paddingHorizontal: 14,
      paddingTop: 7,
      paddingBottom: 30,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      minHeight: 55,
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    headerText: {
      flex: 1,
      minWidth: 0,
      marginHorizontal: 10,
    },

    headerTitle: {
      fontSize: 19,
      color: "#0F172A",
    },

    headerSubtitle: {
      marginTop: 1,
      fontSize: 8.5,
      color: "#64748B",
    },

    liveBadge: {
      minHeight: 31,
      paddingHorizontal: 9,
      borderRadius: 11,
      backgroundColor:
        "#ECFDF5",
      borderWidth: 1,
      borderColor:
        "#BBF7D0",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 5,
    },

    liveDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor:
        "#16A34A",
    },

    liveText: {
      fontSize: 8,
      color: "#15803D",
    },

    /* ========================================================
       CURRENT STATUS
    ======================================================== */

    currentStatus: {
      marginTop: 9,
      padding: 15,
      borderRadius: 19,
      backgroundColor:
        "#EFF6FF",
      borderWidth: 1,
      borderColor:
        "#BFDBFE",
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    completedStatus: {
      backgroundColor:
        "#ECFDF5",
      borderColor:
        "#BBF7D0",
    },

    closedStatus: {
      backgroundColor:
        "#F8FAFC",
      borderColor:
        "#E2E8F0",
    },

    currentStatusIcon: {
      width: 49,
      height: 49,
      borderRadius: 15,
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    completedStatusIcon: {
      backgroundColor:
        "#F0FDF4",
    },

    cancelledStatusIcon: {
      backgroundColor:
        "#FEF2F2",
    },

    expiredStatusIcon: {
      backgroundColor:
        "#F1F5F9",
    },

    currentStatusContent: {
      flex: 1,
      minWidth: 0,
      marginLeft: 11,
    },

    currentStatusTitle: {
      fontSize: 13,
      color: "#0F172A",
    },

    currentStatusText: {
      marginTop: 4,
      fontSize: 9.5,
      lineHeight: 15,
      color: "#64748B",
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      marginTop: 11,
      padding: 15,
      borderRadius: 19,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    cardTitle: {
      fontSize: 14,
      color: "#0F172A",
    },

    /* ========================================================
       TIMELINE
    ======================================================== */

    timeline: {
      marginTop: 17,
    },

    timelineRow: {
      flexDirection:
        "row",
      minHeight: 76,
    },

    timelineLeft: {
      width: 38,
      alignItems:
        "center",
    },

    timelineCircle: {
      width: 29,
      height: 29,
      borderRadius: 15,
      backgroundColor:
        "#F8FAFC",
      borderWidth: 2,
      borderColor:
        "#CBD5E1",
      alignItems:
        "center",
      justifyContent:
        "center",
      zIndex: 2,
    },

    timelineCircleCompleted: {
      backgroundColor:
        "#16A34A",
      borderColor:
        "#16A34A",
    },

    timelineCircleActive: {
      backgroundColor:
        "#EFF6FF",
      borderColor:
        "#2563EB",
    },

    verticalLine: {
      position:
        "absolute",
      top: 29,
      bottom: 0,
      width: 2,
      backgroundColor:
        "#E2E8F0",
    },

    verticalLineActive: {
      backgroundColor:
        "#86EFAC",
    },

    timelineContent: {
      flex: 1,
      minWidth: 0,
      marginLeft: 10,
      paddingBottom: 18,
    },

    timelineTitle: {
      fontSize: 11.5,
      color: "#64748B",
    },

    timelineTitleActive: {
      color: "#0F172A",
    },

    timelineDescription: {
      marginTop: 3,
      fontSize: 9,
      lineHeight: 14,
      color: "#64748B",
    },

    timelineDate: {
      marginTop: 3,
      fontSize: 8,
      color: "#94A3B8",
    },

    /* ========================================================
       CLOSED
    ======================================================== */

    closedBox: {
      minHeight: 75,
      borderRadius: 14,
      backgroundColor:
        "#F8FAFC",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    cancelledClosedBox: {
      backgroundColor:
        "#FEF2F2",
    },

    closedTitle: {
      marginTop: 6,
      fontSize: 11,
      color: "#334155",
    },

    /* ========================================================
       WORKER
    ======================================================== */

    workerRow: {
      marginTop: 14,
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    workerAvatar: {
      width: 48,
      height: 48,
      borderRadius: 15,
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    workerInfo: {
      flex: 1,
      minWidth: 0,
      marginLeft: 11,
    },

    workerName: {
      fontSize: 12.5,
      color: "#0F172A",
    },

    workerRole: {
      marginTop: 3,
      fontSize: 9,
      color: "#64748B",
    },

    workerPhone: {
      marginTop: 2,
      fontSize: 8.5,
      color: "#94A3B8",
    },

    callButton: {
      width: 43,
      height: 43,
      borderRadius: 13,
      backgroundColor:
        "#2563EB",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    trackingNotice: {
      marginTop: 13,
      padding: 10,
      borderRadius: 12,
      backgroundColor:
        "#EFF6FF",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 8,
    },

    trackingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor:
        "#2563EB",
    },

    trackingText: {
      flex: 1,
      fontSize: 8.5,
      color: "#1D4ED8",
    },

    /* ========================================================
       DELIVERY
    ======================================================== */

    detailRow: {
      marginTop: 14,
      flexDirection:
        "row",
      alignItems:
        "flex-start",
    },

    detailIcon: {
      width: 39,
      height: 39,
      borderRadius: 12,
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    detailContent: {
      flex: 1,
      minWidth: 0,
      marginLeft: 10,
    },

    detailLabel: {
      fontSize: 8.5,
      color: "#94A3B8",
    },

    detailValue: {
      marginTop: 3,
      fontSize: 10.5,
      lineHeight: 15,
      color: "#0F172A",
    },

    detailSubValue: {
      marginTop: 2,
      fontSize: 8.5,
      color: "#64748B",
    },

    detailDivider: {
      height: 1,
      marginTop: 14,
      backgroundColor:
        "#F1F5F9",
    },

    /* ========================================================
       INFO
    ======================================================== */

    infoRow: {
      minHeight: 39,
      borderBottomWidth: 1,
      borderBottomColor:
        "#F1F5F9",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      gap: 12,
    },

    infoLabel: {
      fontSize: 9.5,
      color: "#64748B",
    },

    infoValue: {
      flex: 1,
      fontSize: 9.5,
      textAlign: "right",
      color: "#0F172A",
    },

    totalRow: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor:
        "#E2E8F0",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    totalLabel: {
      fontSize: 12,
      color: "#0F172A",
    },

    totalValue: {
      fontSize: 18,
      color: "#2563EB",
    },

    /* ========================================================
       LIVE INFO
    ======================================================== */

    liveInfo: {
      marginTop: 11,
      padding: 13,
      borderRadius: 17,
      backgroundColor:
        "#EFF6FF",
      borderWidth: 1,
      borderColor:
        "#BFDBFE",
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    liveInfoIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    liveInfoContent: {
      flex: 1,
      minWidth: 0,
      marginLeft: 10,
    },

    liveInfoTitle: {
      fontSize: 10.5,
      color: "#1D4ED8",
    },

    liveInfoText: {
      marginTop: 3,
      fontSize: 8.5,
      lineHeight: 14,
      color: "#64748B",
    },

    /* ========================================================
       STATES
    ======================================================== */

    centerState: {
      flex: 1,
      minHeight: 500,
      paddingHorizontal: 30,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    stateTitle: {
      marginTop: 13,
      fontSize: 15,
      color: "#0F172A",
    },

    stateText: {
      marginTop: 7,
      fontSize: 10,
      lineHeight: 16,
      color: "#64748B",
    },

    errorIcon: {
      width: 60,
      height: 60,
      borderRadius: 19,
      backgroundColor:
        "#FEF2F2",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    backButton: {
      marginTop: 17,
      minHeight: 43,
      paddingHorizontal: 20,
      borderRadius: 13,
      backgroundColor:
        "#2563EB",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    backButtonText: {
      fontSize: 10,
      color: "#FFFFFF",
    },

    bottomSpace: {
      height: 25,
    },
  });