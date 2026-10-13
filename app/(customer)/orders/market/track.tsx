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

  receiverName?: string;
  receiverPhone?: string;

  address?: string;
  deliveryAddress?: string;
  location?: string;
  deliveryLocation?: string;

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
        "Your order was placed successfully.",

      icon: "package",
    },

    {
      key: "accepted",

      title: "Seller accepted",

      description:
        "The seller accepted your order.",

      icon: "success",
    },

    {
      key: "in-progress",

      title: "On the way",

      description:
        "Your order is being delivered.",

      icon: "navigation",
    },

    {
      key: "completed",

      title: "Delivered",

      description:
        "Your order was delivered successfully.",

      icon: "success",
    },
  ];

/* ============================================================
   HELPERS
============================================================ */

function normalizeStatus(
  value: unknown,
): string {
  if (
    typeof value !==
    "string"
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

function normalizePhone(
  value: string,
): string {
  const trimmed =
    value.trim();

  if (!trimmed) {
    return "";
  }

  const hasLeadingPlus =
    trimmed.startsWith("+");

  const digits =
    trimmed.replace(
      /\D/g,
      "",
    );

  if (!digits) {
    return "";
  }

  return hasLeadingPlus
    ? `+${digits}`
    : digits;
}

/* ============================================================
   DATE
============================================================ */

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
          date =
            resolved;
        }
      }
    } else if (
      value instanceof Date
    ) {
      date =
        value;
    } else if (
      typeof value ===
        "number" &&
      Number.isFinite(value)
    ) {
      date =
        new Date(
          value,
        );
    } else if (
      typeof value ===
        "string" &&
      value.trim()
    ) {
      date =
        new Date(
          value,
        );
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
        day:
          "numeric",

        month:
          "short",

        hour:
          "2-digit",

        minute:
          "2-digit",
      },
    );
  } catch (
    error
  ) {
    console.error(
      "FIXXAM_FORMAT_TRACK_TIMESTAMP_ERROR:",
      error,
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
    normalizeStatus(
      value,
    );

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
        orderId ??
        ""
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
      setOrder(
        null,
      );

      setLoading(
        false,
      );

      setError(
        "Please sign in again to track this order.",
      );

      return;
    }

    if (!cleanOrderId) {
      setOrder(
        null,
      );

      setLoading(
        false,
      );

      setError(
        "Order ID is missing.",
      );

      return;
    }

    setLoading(
      true,
    );

    setError(
      null,
    );

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
            setOrder(
              null,
            );

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
             OWNERSHIP
          ================================================== */

          const customerId =
            getString(
              data.customerId,
            );

          if (
            customerId !==
            user.uid
          ) {
            setOrder(
              null,
            );

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
            setOrder(
              null,
            );

            setLoading(
              false,
            );

            setError(
              "This is not a market order.",
            );

            return;
          }

          /* ==================================================
             SAFE MAPPING
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

          setLoading(
            false,
          );

          setError(
            null,
          );
        },

        (
          listenerError,
        ) => {
          console.error(
            "FIXXAM_CUSTOMER_MARKET_TRACK_ERROR:",
            listenerError,
          );

          setOrder(
            null,
          );

          setLoading(
            false,
          );

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
     CALL DELIVERY WORKER
  ========================================================== */

  const handleCallWorker =
    useCallback(async () => {
      const rawPhone =
        getString(
          order?.workerPhone,
        );

      const workerPhone =
        normalizePhone(
          rawPhone,
        );

      if (!workerPhone) {
        Toast.show({
          type:
            "info",

          text1:
            "Phone unavailable",

          text2:
            "The delivery worker's phone number is unavailable.",
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
          type:
            "error",

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
              variant="bodyMedium"
              weight="semibold"
              style={
                styles.backButtonText
              }
            >
              Go back
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

  const isActive =
    !isCancelled &&
    !isExpired &&
    !isCompleted;

  const workerId =
    getString(
      order.workerId,
    );

  const workerName =
    getString(
      order.workerName,
      "Delivery worker",
    );

  const workerPhone =
    getString(
      order.workerPhone,
    );

  const workerPhoto =
    getString(
      order.workerPhoto,
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

  const address =
    getString(
      order.address,
      order.deliveryAddress,
      order.location,
      order.deliveryLocation,
      "Delivery address unavailable",
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
              Track order
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

          {isActive ? (
            <View
              accessible
              accessibilityLabel="Live order updates enabled"
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
                variant="caption"
                weight="semibold"
                style={
                  styles.liveText
                }
              >
                Live
              </AppText>
            </View>
          ) : (
            <View
              style={
                styles.headerSpacer
              }
            />
          )}
        </View>

        {/* ====================================================
            CURRENT STATUS
        ==================================================== */}

        <View
          style={[
            styles.currentStatus,

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
          <View
            style={
              styles.currentStatusIcon
            }
          >
            <AppIcon
              name={
                statusIcon
              }
              role="customer"
              size="sm"
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
              variant="bodyMedium"
              weight="semibold"
              style={
                styles.currentStatusTitle
              }
            >
              {isCompleted
                ? "Order delivered"
                : isCancelled
                  ? "Order cancelled"
                  : isExpired
                    ? "Order expired"
                    : status ===
                        "in-progress"
                      ? "On the way"
                      : status ===
                          "accepted"
                        ? "Seller accepted"
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
                ? "Your order has been delivered."
                : isCancelled
                  ? "This order has been cancelled."
                  : isExpired
                    ? "This order is no longer active."
                    : status ===
                        "in-progress"
                      ? "Your order is being delivered."
                      : status ===
                          "accepted"
                        ? "Your order is being prepared for delivery."
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
              variant="bodyMedium"
              weight="semibold"
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

                            completed ||
                            finalCompleted
                              ? styles.timelineCircleCompleted
                              : null,

                            active &&
                            !finalCompleted
                              ? styles.timelineCircleActive
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
                              ? "semibold"
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
              styles.closedCard
            }
          >
            <AppIcon
              name={
                isCancelled
                  ? "error"
                  : "clock"
              }
              size="md"
              color={
                isCancelled
                  ? Colors.error
                  : Colors.warning
              }
            />

            <View
              style={
                styles.closedContent
              }
            >
              <AppText
                variant="bodyMedium"
                weight="semibold"
                style={
                  styles.closedTitle
                }
              >
                {isCancelled
                  ? "Order cancelled"
                  : "Order expired"}
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.closedText
                }
              >
                {isCancelled
                  ? "Tracking is no longer available for this order."
                  : "This order is no longer active."}
              </AppText>
            </View>
          </View>
        )}

        {/* ====================================================
            DELIVERY WORKER
        ==================================================== */}

        {workerId ? (
          <View
            style={
              styles.card
            }
          >
            <AppText
              variant="bodyMedium"
              weight="semibold"
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
                  variant="bodyMedium"
                  weight="semibold"
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
                      CustomerColors.primary
                    }
                  />
                </Pressable>
              ) : null}
            </View>

            {status ===
            "in-progress" ? (
              <View
                style={
                  styles.workerTrackingRow
                }
              >
                <View
                  style={
                    styles.workerTrackingDot
                  }
                />

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.workerTrackingText
                  }
                >
                  Your order is currently with the delivery worker.
                </AppText>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* ====================================================
            DELIVERY
        ==================================================== */}

        <View
          style={
            styles.card
          }
        >
          <AppText
            variant="bodyMedium"
            weight="semibold"
            style={
              styles.cardTitle
            }
          >
            Delivery
          </AppText>

          <DetailRow
            icon="location"
            label="Delivery address"
            value={
              address
            }
          />

          <View
            style={
              styles.detailDivider
            }
          />

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
        </View>

        {/* ====================================================
            LIVE UPDATE
        ==================================================== */}

        {isActive ? (
          <View
            style={
              styles.liveUpdateRow
            }
          >
            <View
              style={
                styles.liveUpdateDot
              }
            />

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.liveUpdateText
              }
            >
              Updates appear here automatically.
            </AppText>
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
            cachePolicy="memory-disk"
            transition={
              FixxamTokens.motion.fast
            }
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

WorkerAvatar.displayName =
  "WorkerAvatar";

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
          accessible
          accessibilityLabel={`${label}. ${value}${
            subValue
              ? `. ${subValue}`
              : ""
          }`}
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
              name={
                icon
              }
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
              tone="secondary"
              style={
                styles.detailLabel
              }
            >
              {label}
            </AppText>

            <AppText
              variant="caption"
              weight="semibold"
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

DetailRow.displayName =
  "DetailRow";

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       SCREEN
    ======================================================== */

    screen: {
      flex:
        1,

      width:
        "100%",

      paddingHorizontal:
        0,

      paddingTop:
        0,

      paddingBottom:
        0,

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

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    headerText: {
      flex:
        1,

      minWidth:
        0,

      marginHorizontal:
        FixxamTokens.spacing.md,
    },

    headerTitle: {
      color:
        Colors.textPrimary,
    },

    headerSubtitle: {
      marginTop:
        2,
    },

    headerSpacer: {
      width:
        FixxamTokens.size.minimumTouchTarget,
    },

    liveBadge: {
      minHeight:
        30,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        Colors.successSoft,
    },

    liveDot: {
      width:
        7,

      height:
        7,

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
      minHeight:
        64,

      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,
    },

    currentStatusIcon: {
      width:
        40,

      height:
        40,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    currentStatusContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    currentStatusTitle: {
      color:
        Colors.textPrimary,
    },

    currentStatusText: {
      marginTop:
        2,

      lineHeight:
        18,
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      width:
        "100%",

      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,
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
        FixxamTokens.spacing.md,
    },

    timelineRow: {
      minHeight:
        70,

      flexDirection:
        "row",
    },

    timelineLeft: {
      width:
        34,

      alignItems:
        "center",
    },

    timelineCircle: {
      width:
        28,

      height:
        28,

      zIndex:
        2,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        1.5,

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

      top:
        28,

      bottom:
        0,

      width:
        2,

      backgroundColor:
        Colors.divider,
    },

    verticalLineActive: {
      backgroundColor:
        Colors.success,
    },

    timelineContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.md,
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
        2,

      lineHeight:
        16,
    },

    timelineDate: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textMuted,
    },

    /* ========================================================
       CLOSED ORDER
    ======================================================== */

    closedCard: {
      width:
        "100%",

      minHeight:
        72,

      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,
    },

    closedContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    closedTitle: {
      color:
        Colors.textPrimary,
    },

    closedText: {
      marginTop:
        2,

      lineHeight:
        17,
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

      flexShrink:
        0,

      overflow:
        "hidden",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    workerInfo: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    workerName: {
      color:
        Colors.textPrimary,
    },

    workerRole: {
      marginTop:
        2,
    },

    callButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth:
        1,

      borderColor:
        CustomerColors.primary,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    workerTrackingRow: {
      minHeight:
        36,

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
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

    workerTrackingDot: {
      width:
        7,

      height:
        7,

      flexShrink:
        0,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primary,
    },

    workerTrackingText: {
      flex:
        1,
    },

    /* ========================================================
       DELIVERY
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
        40,

      height:
        40,

      flexShrink:
        0,

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
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    detailLabel: {
      color:
        Colors.textMuted,
    },

    detailValue: {
      marginTop:
        2,

      lineHeight:
        18,

      color:
        Colors.textPrimary,
    },

    detailSubValue: {
      marginTop:
        2,
    },

    detailDivider: {
      height:
        StyleSheet.hairlineWidth,

      marginTop:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.divider,
    },

    /* ========================================================
       LIVE UPDATE
    ======================================================== */

    liveUpdateRow: {
      minHeight:
        44,

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    liveUpdateDot: {
      width:
        7,

      height:
        7,

      flexShrink:
        0,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.success,
    },

    liveUpdateText: {
      flexShrink:
        1,
    },

    /* ========================================================
       STATES
    ======================================================== */

    centerState: {
      flex:
        1,

      minHeight:
        500,

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
      maxWidth:
        320,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight:
        18,
    },

    errorIcon: {
      width:
        68,

      height:
        68,

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
        FixxamTokens.size.minimumTouchTarget,

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

    pressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },
  });