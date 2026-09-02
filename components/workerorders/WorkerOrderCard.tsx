import React, {
  memo,
} from "react";

import {
  Image,
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
  WorkerOrderStatus,
  WorkerServiceOrder,
} from "@/types/workerOrders";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  order: WorkerServiceOrder;

  onPress: (
    order: WorkerServiceOrder,
  ) => void;
};

/* ==============================================================
   HELPERS
============================================================== */

function getSafeText(
  value: unknown,
  fallback = "",
): string {
  if (
    typeof value === "string" &&
    value.trim().length > 0
  ) {
    return value.trim();
  }

  return fallback;
}

/* ==============================================================
   LOCATION
============================================================== */

function getLocationText(
  order: WorkerServiceOrder,
): string {
  const address =
    getSafeText(
      order.address,
    );

  if (address) {
    return address;
  }

  const location =
    order.location;

  if (location) {
    return location;
  }

  return "Location unavailable";
}

/* ==============================================================
   CARD
============================================================== */

function WorkerOrderCard({
  order,
  onPress,
}: Props) {
  const isPending =
    order.status === "pending";

  const locationText =
    getLocationText(order);

  const customerName =
    getSafeText(
      order.customerName,
      "Customer",
    );

  const customerPhoto =
    getSafeText(
      order.customerPhotoURL ??
        order.customerPhoto,
    );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View job ${order.id}`}
      onPress={() =>
        onPress(order)
      }
      style={({ pressed }) => [
        styles.card,
        pressed &&
          styles.cardPressed,
      ]}
    >
      {/* ========================================================
          HEADER
      ======================================================== */}

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
            styles.orderIdRow
          }
        >
          <AppText
            numberOfLines={1}
            style={
              styles.orderId
            }
          >
            #{order.id}
          </AppText>

          <Ionicons
            name="copy-outline"
            size={15}
            color="#94A3B8"
          />
        </View>
      </View>

      {/* ========================================================
          SERVICE + CUSTOMER
      ======================================================== */}

      <View
        style={
          styles.mainRow
        }
      >
        <View
          style={[
            styles.serviceIcon,
            {
              backgroundColor:
                order.serviceBackgroundColor,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={
              order.serviceIcon
            }
            size={24}
            color={
              order.serviceColor
            }
          />
        </View>

        <View
          style={
            styles.mainInfo
          }
        >
          <AppText
            weight="bold"
            numberOfLines={1}
            style={
              styles.serviceName
            }
          >
            {getSafeText(
              order.serviceName,
              "Service",
            )}
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
                accessibilityLabel="Customer profile photo"
              />
            ) : (
              <View
                style={
                  styles.customerPlaceholder
                }
              >
                <Ionicons
                  name="person"
                  size={14}
                  color="#94A3B8"
                />
              </View>
            )}

            <View
              style={
                styles.customerInfo
              }
            >
              <AppText
                weight="bold"
                numberOfLines={1}
                style={
                  styles.customerName
                }
              >
                {customerName}
              </AppText>

              <AppText
                numberOfLines={1}
                style={
                  styles.customerLabel
                }
              >
                Customer
              </AppText>
            </View>
          </View>
        </View>

        <View
          style={
            styles.arrow
          }
        >
          <Ionicons
            name="chevron-forward"
            size={17}
            color="#64748B"
          />
        </View>
      </View>

      {/* ========================================================
          META
      ======================================================== */}

      <View
        style={
          styles.metaRow
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
            styles.location
          }
        >
          {locationText}
        </AppText>

        <View
          style={
            styles.divider
          }
        />

        <Ionicons
          name="calendar-outline"
          size={14}
          color="#64748B"
        />

        <AppText
          numberOfLines={1}
          style={
            styles.date
          }
        >
          {getSafeText(
            order.date,
            "Date unavailable",
          )}
        </AppText>
      </View>

      {/* ========================================================
          TIME
      ======================================================== */}

      {!!order.time && (
        <View
          style={
            styles.timeRow
          }
        >
          <Ionicons
            name="time-outline"
            size={14}
            color="#64748B"
          />

          <AppText
            numberOfLines={1}
            style={
              styles.timeText
            }
          >
            {order.time}
          </AppText>
        </View>
      )}

      {/* ========================================================
          DESCRIPTION
      ======================================================== */}

      {!!order.description && (
        <AppText
          numberOfLines={2}
          style={
            styles.description
          }
        >
          {order.description}
        </AppText>
      )}

      {/* ========================================================
          PENDING
      ======================================================== */}

      {isPending && (
        <View
          style={
            styles.pendingNotice
          }
        >
          <Ionicons
            name="time-outline"
            size={15}
            color="#D97706"
          />

          <AppText
            weight="bold"
            style={
              styles.pendingTitle
            }
          >
            NEW REQUEST
          </AppText>

          <AppText
            style={
              styles.pendingHint
            }
          >
            Review & respond
          </AppText>
        </View>
      )}

      {/* ========================================================
          OFFER
      ======================================================== */}

      {order.offerStatus ===
        "sent" && (
        <View
          style={
            styles.offerNotice
          }
        >
          <Ionicons
            name="cash-outline"
            size={15}
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

          {typeof order.offerAmount ===
            "number" && (
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
          )}
        </View>
      )}

      {/* ========================================================
          FOOTER
      ======================================================== */}

      <View
        style={
          styles.footer
        }
      >
        <AppText
          numberOfLines={1}
          style={
            styles.requestedText
          }
        >
          Requested on{" "}
          {getSafeText(
            order.date,
            "Unknown date",
          )}
        </AppText>

        <View
          style={
            styles.viewButton
          }
        >
          <AppText
            weight="bold"
            style={
              styles.viewButtonText
            }
          >
            VIEW JOB
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
   STATUS BADGE
============================================================== */

const StatusBadge = memo(
  function StatusBadge({
    status,
  }: {
    status: WorkerOrderStatus;
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

/* ==============================================================
   STATUS CONFIG
============================================================== */

function getStatusConfig(
  status: WorkerOrderStatus,
) {
  switch (status) {
    case "accepted":
      return {
        label: "ACCEPTED",
        background:
          styles.statusAccepted,
        dot: styles.dotAccepted,
        text: styles.textAccepted,
      };

    case "in-progress":
      return {
        label: "IN PROGRESS",
        background:
          styles.statusProgress,
        dot: styles.dotProgress,
        text: styles.textProgress,
      };

    case "completed":
      return {
        label: "COMPLETED",
        background:
          styles.statusCompleted,
        dot: styles.dotCompleted,
        text: styles.textCompleted,
      };

    case "cancelled":
      return {
        label: "CANCELLED",
        background:
          styles.statusCancelled,
        dot: styles.dotCancelled,
        text: styles.textCancelled,
      };

    case "expired":
      return {
        label: "EXPIRED",
        background:
          styles.statusExpired,
        dot: styles.dotExpired,
        text: styles.textExpired,
      };

    case "pending":
    default:
      return {
        label: "PENDING",
        background:
          styles.statusPending,
        dot: styles.dotPending,
        text: styles.textPending,
      };
  }
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    card: {
      width: "100%",
      padding: 10,
      borderRadius: 18,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",

      shadowColor:
        "#0F172A",
      shadowOpacity: 0.045,
      shadowRadius: 7,
      shadowOffset: {
        width: 0,
        height: 3,
      },

      elevation: 2,
    },

    cardPressed: {
      opacity: 0.88,
      transform: [
        {
          scale: 0.987,
        },
      ],
    },

    header: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      marginBottom: 9,
    },

    statusBadge: {
      flexDirection:
        "row",
      alignItems:
        "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      gap: 5,
    },

    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },

    statusText: {
      fontSize: 7.5,
      lineHeight: 10,
    },

    orderIdRow: {
      maxWidth: "55%",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 5,
    },

    orderId: {
      flexShrink: 1,
      fontSize: 8,
      color: "#64748B",
    },

    mainRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    serviceIcon: {
      width: 55,
      height: 55,
      borderRadius: 15,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    mainInfo: {
      flex: 1,
      minWidth: 0,
      marginLeft: 10,
    },

    serviceName: {
      fontSize: 13,
      lineHeight: 17,
      color: "#0F172A",
    },

    customerRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginTop: 5,
    },

    customerPhoto: {
      width: 27,
      height: 27,
      borderRadius: 14,
      backgroundColor:
        "#E2E8F0",
    },

    customerPlaceholder: {
      width: 27,
      height: 27,
      borderRadius: 14,
      backgroundColor:
        "#E2E8F0",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    customerInfo: {
      flex: 1,
      minWidth: 0,
      marginLeft: 7,
    },

    customerName: {
      fontSize: 10,
      lineHeight: 13,
      color: "#334155",
    },

    customerLabel: {
      fontSize: 8.5,
      lineHeight: 11,
      color: "#94A3B8",
    },

    arrow: {
      width: 31,
      height: 31,
      borderRadius: 16,
      backgroundColor:
        "#F8FAFC",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    metaRow: {
      minHeight: 34,
      marginTop: 9,
      paddingVertical: 7,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor:
        "#E2E8F0",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 5,
    },

    location: {
      flex: 1,
      minWidth: 0,
      fontSize: 8.5,
      color: "#64748B",
    },

    divider: {
      width: 1,
      height: 15,
      marginHorizontal: 3,
      backgroundColor:
        "#E2E8F0",
    },

    date: {
      flexShrink: 1,
      fontSize: 8.5,
      color: "#64748B",
    },

    timeRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 5,
      marginTop: 8,
    },

    timeText: {
      fontSize: 8.5,
      color: "#64748B",
    },

    description: {
      marginTop: 8,
      fontSize: 9,
      lineHeight: 14,
      color: "#475569",
    },

    pendingNotice: {
      minHeight: 34,
      marginTop: 8,
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor:
        "#FFF7E8",
      borderWidth: 1,
      borderColor:
        "#FDE68A",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 5,
    },

    pendingTitle: {
      fontSize: 8,
      color: "#D97706",
    },

    pendingHint: {
      flex: 1,
      textAlign:
        "right",
      fontSize: 8.5,
      color: "#92400E",
    },

    offerNotice: {
      minHeight: 34,
      marginTop: 8,
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor:
        "#F0FDF4",
      borderWidth: 1,
      borderColor:
        "#BBF7D0",
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 5,
    },

    offerTitle: {
      flex: 1,
      fontSize: 8,
      color: "#15803D",
    },

    offerAmount: {
      fontSize: 9,
      color: "#15803D",
    },

    footer: {
      minHeight: 36,
      marginTop: 8,
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 8,
    },

    requestedText: {
      flex: 1,
      fontSize: 8.5,
      lineHeight: 12,
      color: "#64748B",
    },

    viewButton: {
      minWidth: 112,
      height: 36,
      paddingHorizontal: 11,
      borderRadius: 11,
      backgroundColor:
        "#2563EB",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 7,
    },

    viewButtonText: {
      fontSize: 8.5,
      color: "#FFFFFF",
    },

    /* ========================================================
       STATUS COLORS
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

export default memo(
  WorkerOrderCard,
);