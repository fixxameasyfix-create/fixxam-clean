import React, {
  memo,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppText,
} from "@/components/ui";

import type {
  Order,
} from "./orders.types";

import {
  formatOrderNumber,
  resolveServiceIcon,
  STATUS_CONFIG,
} from "./orders.utils";

/* ==============================================================
   PROPS
============================================================== */

type Props = {
  order: Order;

  onPress: () => void;
};

/* ==============================================================
   ORDER CARD
============================================================== */

function OrderCard({
  order,
  onPress,
}: Props) {
  const status =
    STATUS_CONFIG[
      order.status
    ];

  const statusStyle =
    getStatusStyle(
      order.status,
    );

  const showSchedule =
    Boolean(order.time) &&
    order.status !==
      "pending";

  const serviceIcon =
    resolveServiceIcon(
      order.serviceIcon,
    );

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${order.serviceName} order`}
      style={({ pressed }) => [
        styles.orderCard,

        pressed &&
          styles.orderCardPressed,
      ]}
    >
      {/* ==================================================
          HEADER
      ================================================== */}

      <View
        style={
          styles.orderCardHeader
        }
      >
        <View
          style={[
            styles.statusBadge,
            statusStyle.background,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              statusStyle.dot,
            ]}
          />

          <AppText
            weight="bold"
            style={[
              styles.statusText,
              statusStyle.text,
            ]}
          >
            {status.label}
          </AppText>
        </View>

        <View
          style={
            styles.orderNumberContainer
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
            size={16}
            color="#334155"
          />
        </View>
      </View>

      {/* ==================================================
          SERVICE
      ================================================== */}

      <View
        style={
          styles.orderMainRow
        }
      >
        {/* SERVICE ICON */}

        <View
          style={[
            styles.serviceIconLarge,
            {
              backgroundColor:
                order.serviceBackgroundColor ??
                "#EFF6FF",
            },
          ]}
        >
          <MaterialCommunityIcons
            name={serviceIcon}
            size={24}
            color={
              order.serviceColor ??
              "#2563EB"
            }
          />
        </View>

        {/* SERVICE INFO */}

        <View
          style={
            styles.workerSection
          }
        >
          <AppText
            weight="bold"
            numberOfLines={1}
            style={
              styles.serviceNameLarge
            }
          >
            {order.serviceName}
          </AppText>

          <View
            style={
              styles.workerInfo
            }
          >
            <View
              style={
                styles.workerAvatar
              }
            >
              <Ionicons
                name="person"
                size={13}
                color="#94A3B8"
              />
            </View>

            <View
              style={
                styles.workerText
              }
            >
              <AppText
                weight="bold"
                numberOfLines={1}
                style={
                  styles.workerNameLarge
                }
              >
                {order.workerName}
              </AppText>

              <AppText
                numberOfLines={1}
                style={
                  styles.workerCategory
                }
              >
                {order.workerCategory}
              </AppText>
            </View>
          </View>
        </View>

        {/* ARROW */}

        <View
          style={
            styles.openOrderButton
          }
        >
          <Ionicons
            name="chevron-forward"
            size={17}
            color="#64748B"
          />
        </View>
      </View>

      {/* ==================================================
          DIVIDER
      ================================================== */}

      <View
        style={
          styles.orderDivider
        }
      />

      {/* ==================================================
          DETAILS
      ================================================== */}

      <View
        style={
          styles.orderInfoRow
        }
      >
        {/* LOCATION */}

        <View
          style={
            styles.infoItem
          }
        >
          <Ionicons
            name="location-outline"
            size={15}
            color="#64748B"
          />

          <AppText
            numberOfLines={1}
            style={
              styles.infoText
            }
          >
            {order.location}
          </AppText>
        </View>

        <View
          style={
            styles.infoSeparator
          }
        />

        {/* DATE / STATUS */}

        <View
          style={
            styles.infoItem
          }
        >
          <Ionicons
            name={
              showSchedule
                ? "calendar-outline"
                : "time-outline"
            }
            size={15}
            color="#64748B"
          />

          <AppText
            numberOfLines={1}
            style={
              styles.infoText
            }
          >
            {showSchedule
              ? order.date
              : order.status ===
                "pending"
              ? "Waiting for response"
              : order.date}
          </AppText>
        </View>

        {/* TIME */}

        {showSchedule &&
        order.time ? (
          <>
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
                name="time-outline"
                size={15}
                color="#64748B"
              />

              <AppText
                numberOfLines={1}
                style={
                  styles.infoText
                }
              >
                {order.time}
              </AppText>
            </View>
          </>
        ) : null}
      </View>

      {/* ==================================================
          OFFER
      ================================================== */}

      <LatestOfferRow
        order={order}
      />

      {/* ==================================================
          FOOTER
      ================================================== */}

      <View
        style={
          styles.orderFooter
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
            style={
              styles.requestedDate
            }
          >
            {order.date}
          </AppText>
        </View>

        <View
          style={
            styles.viewOrderButton
          }
        >
          <AppText
            weight="bold"
            style={
              styles.viewOrderText
            }
          >
            VIEW ORDER
          </AppText>

          <Ionicons
            name="arrow-forward"
            size={15}
            color="#FFFFFF"
          />
        </View>
      </View>
    </Pressable>
  );
}

/* ==============================================================
   LATEST OFFER
============================================================== */

function LatestOfferRow({
  order,
}: {
  order: Order;
}) {
  /* ----------------------------------------------------------
     COUNTER OFFER
  ---------------------------------------------------------- */

  if (
    order.counterOfferStatus ===
      "sent" &&
    typeof order.counterOfferAmount ===
      "number" &&
    Number.isFinite(
      order.counterOfferAmount,
    )
  ) {
    const label =
      order.counterOfferBy ===
        "customer"
        ? "Your counter offer"
        : "Worker counter offer";

    return (
      <View
        style={
          styles.offerRow
        }
      >
        <View
          style={
            styles.offerLeft
          }
        >
          <Ionicons
            name="pricetag-outline"
            size={14}
            color="#2563EB"
          />

          <AppText
            weight="bold"
            style={
              styles.offerLabel
            }
          >
            {label}
          </AppText>
        </View>

        <AppText
          weight="bold"
          style={
            styles.offerAmount
          }
        >
          ₦
          {order.counterOfferAmount.toLocaleString(
            "en-NG",
          )}
        </AppText>
      </View>
    );
  }

  /* ----------------------------------------------------------
     WORKER OFFER
  ---------------------------------------------------------- */

  if (
    order.offerStatus ===
      "sent" &&
    typeof order.offerAmount ===
      "number" &&
    Number.isFinite(
      order.offerAmount,
    )
  ) {
    return (
      <View
        style={
          styles.offerRow
        }
      >
        <View
          style={
            styles.offerLeft
          }
        >
          <Ionicons
            name="pricetag-outline"
            size={14}
            color="#2563EB"
          />

          <AppText
            weight="bold"
            style={
              styles.offerLabel
            }
          >
            Worker offer
          </AppText>
        </View>

        <AppText
          weight="bold"
          style={
            styles.offerAmount
          }
        >
          ₦
          {order.offerAmount.toLocaleString(
            "en-NG",
          )}
        </AppText>
      </View>
    );
  }

  /* ----------------------------------------------------------
     AGREED PRICE
  ---------------------------------------------------------- */

  if (
    order.status ===
      "accepted" &&
    typeof order.agreedPrice ===
      "number" &&
    Number.isFinite(
      order.agreedPrice,
    )
  ) {
    return (
      <View
        style={[
          styles.offerRow,
          styles.agreedOfferRow,
        ]}
      >
        <View
          style={
            styles.offerLeft
          }
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={14}
            color="#16A34A"
          />

          <AppText
            weight="bold"
            style={[
              styles.offerLabel,
              styles.agreedOfferLabel,
            ]}
          >
            Agreed price
          </AppText>
        </View>

        <AppText
          weight="bold"
          style={[
            styles.offerAmount,
            styles.agreedOfferAmount,
          ]}
        >
          ₦
          {order.agreedPrice.toLocaleString(
            "en-NG",
          )}
        </AppText>
      </View>
    );
  }

  return null;
}

/* ==============================================================
   STATUS STYLE
============================================================== */

function getStatusStyle(
  status: Order["status"],
) {
  switch (status) {
    case "accepted":
      return {
        background:
          styles.statusAccepted,
        dot:
          styles.dotAccepted,
        text:
          styles.textAccepted,
      };

    case "in-progress":
      return {
        background:
          styles.statusProgress,
        dot:
          styles.dotProgress,
        text:
          styles.textProgress,
      };

    case "completed":
      return {
        background:
          styles.statusCompleted,
        dot:
          styles.dotCompleted,
        text:
          styles.textCompleted,
      };

    case "cancelled":
      return {
        background:
          styles.statusCancelled,
        dot:
          styles.dotCancelled,
        text:
          styles.textCancelled,
      };

    case "expired":
      return {
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
    /* ========================================================
       CARD
    ======================================================== */

    orderCard: {
      paddingHorizontal: 10,
      paddingTop: 9,
      paddingBottom: 9,
      borderRadius: 16,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",

      shadowColor:
        "#0F172A",

      shadowOpacity: 0.045,

      shadowRadius: 5,

      shadowOffset: {
        width: 0,
        height: 2,
      },

      elevation: 2,
    },

    orderCardPressed: {
      opacity: 0.96,

      transform: [
        {
          scale: 0.995,
        },
      ],
    },

    /* ========================================================
       HEADER
    ======================================================== */

    orderCardHeader: {
      minHeight: 22,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",
    },

    statusBadge: {
      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal: 7,

      paddingVertical: 4,

      borderRadius: 999,
    },

    statusDot: {
      width: 5,

      height: 5,

      borderRadius: 3,

      marginRight: 4,
    },

    statusText: {
      fontSize: 6.8,

      letterSpacing: 0.15,
    },

    orderNumberContainer: {
      flexDirection: "row",

      alignItems: "center",

      gap: 4,
    },

    orderNumber: {
      fontSize: 8,

      color: "#64748B",
    },

    /* ========================================================
       SERVICE
    ======================================================== */

    orderMainRow: {
      marginTop: 8,

      flexDirection: "row",

      alignItems: "center",
    },

    serviceIconLarge: {
      width: 50,

      height: 50,

      borderRadius: 14,

      alignItems: "center",

      justifyContent: "center",
    },

    workerSection: {
      flex: 1,

      minWidth: 0,

      marginLeft: 8,

      marginRight: 5,
    },

    serviceNameLarge: {
      fontSize: 13,

      lineHeight: 16,

      color: "#0F172A",
    },

    workerInfo: {
      marginTop: 4,

      flexDirection: "row",

      alignItems: "center",
    },

    workerAvatar: {
      width: 25,

      height: 25,

      borderRadius: 13,

      backgroundColor:
        "#E2E8F0",

      alignItems: "center",

      justifyContent: "center",
    },

    workerText: {
      flex: 1,

      minWidth: 0,

      marginLeft: 5,
    },

    workerNameLarge: {
      fontSize: 9.5,

      color: "#334155",
    },

    workerCategory: {
      marginTop: 1,

      fontSize: 7.8,

      color: "#94A3B8",
    },

    openOrderButton: {
      width: 30,

      height: 30,

      borderRadius: 15,

      backgroundColor:
        "#F8FAFC",

      alignItems: "center",

      justifyContent: "center",
    },

    /* ========================================================
       DIVIDER
    ======================================================== */

    orderDivider: {
      height: 1,

      marginTop: 8,

      marginBottom: 7,

      backgroundColor:
        "#F1F5F9",
    },

    /* ========================================================
       DETAILS
    ======================================================== */

    orderInfoRow: {
      minHeight: 25,

      flexDirection: "row",

      alignItems: "center",
    },

    infoItem: {
      flex: 1,

      minWidth: 0,

      flexDirection: "row",

      alignItems: "center",
    },

    infoText: {
      flex: 1,

      minWidth: 0,

      marginLeft: 4,

      fontSize: 7.8,

      color: "#64748B",
    },

    infoSeparator: {
      width: 1,

      height: 18,

      marginHorizontal: 5,

      backgroundColor:
        "#E2E8F0",
    },

    /* ========================================================
       OFFER
    ======================================================== */

    offerRow: {
      marginTop: 6,

      paddingHorizontal: 7,

      paddingVertical: 5.5,

      borderRadius: 8,

      backgroundColor:
        "#EFF6FF",

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",
    },

    agreedOfferRow: {
      backgroundColor:
        "#ECFDF5",
    },

    offerLeft: {
      flex: 1,

      minWidth: 0,

      flexDirection: "row",

      alignItems: "center",

      gap: 4,
    },

    offerLabel: {
      fontSize: 8,

      color: "#1D4ED8",
    },

    agreedOfferLabel: {
      color: "#15803D",
    },

    offerAmount: {
      fontSize: 10,

      color: "#2563EB",
    },

    agreedOfferAmount: {
      color: "#15803D",
    },

    /* ========================================================
       FOOTER
    ======================================================== */

    orderFooter: {
      marginTop: 7,

      paddingTop: 7,

      borderTopWidth: 1,

      borderTopColor:
        "#F1F5F9",

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",
    },

    requestedContainer: {
      flex: 1,

      minWidth: 0,
    },

    requestedLabel: {
      fontSize: 7.2,

      color: "#94A3B8",
    },

    requestedDate: {
      marginTop: 1,

      fontSize: 8.5,

      color: "#64748B",
    },

    viewOrderButton: {
      minHeight: 31,

      paddingHorizontal: 10,

      borderRadius: 9,

      backgroundColor:
        "#2563EB",

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

      gap: 4,
    },

    viewOrderText: {
      fontSize: 7.8,

      color: "#FFFFFF",
    },

    /* ========================================================
       PENDING
    ======================================================== */

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

    /* ========================================================
       ACCEPTED
    ======================================================== */

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

    /* ========================================================
       IN PROGRESS
    ======================================================== */

    statusProgress: {
      backgroundColor:
        "#F3E8FF",
    },

    dotProgress: {
      backgroundColor:
        "#7C3AED",
    },

    textProgress: {
      color: "#6D28D9",
    },

    /* ========================================================
       COMPLETED
    ======================================================== */

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

    /* ========================================================
       CANCELLED
    ======================================================== */

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

    /* ========================================================
       EXPIRED
    ======================================================== */

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

/* ==============================================================
   EXPORT
============================================================== */

export default memo(
  OrderCard,
);