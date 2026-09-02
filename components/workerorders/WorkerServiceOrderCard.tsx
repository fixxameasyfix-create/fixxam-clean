import React, { memo } from "react";
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
  WorkerOrder,
} from "@/types/workerOrders";

type WorkerServiceOrderCardProps = {
  order: WorkerOrder;
  onPress: (order: WorkerOrder) => void;
};

function WorkerServiceOrderCard({
  order,
  onPress,
}: WorkerServiceOrderCardProps) {
  const isPending =
    order.status === "pending";

  return (
    <Pressable
      onPress={() => onPress(order)}
      accessibilityRole="button"
      accessibilityLabel={`View job ${order.serviceName}`}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      {/* TOP */}
      <View style={styles.topRow}>
        <StatusBadge status={order.status} />

        <View style={styles.idRow}>
          <AppText
            numberOfLines={1}
            style={styles.orderId}
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

      {/* SERVICE */}
      <View style={styles.mainRow}>
        <View
          style={[
            styles.serviceIcon,
            {
              backgroundColor:
                order.serviceBackgroundColor ??
                "#EFF6FF",
            },
          ]}
        >
          <MaterialCommunityIcons
            name={order.serviceIcon}
            size={24}
            color={
              order.serviceColor ??
              "#2563EB"
            }
          />
        </View>

        <View style={styles.info}>
          <AppText
            weight="bold"
            numberOfLines={1}
            style={styles.serviceName}
          >
            {order.serviceName}
          </AppText>

          <View style={styles.customerRow}>
            <View style={styles.customerAvatar}>
              <Ionicons
                name="person"
                size={14}
                color="#94A3B8"
              />
            </View>

            <View style={styles.customerInfo}>
              <AppText
                weight="bold"
                numberOfLines={1}
                style={styles.customerName}
              >
                {order.customerName}
              </AppText>

              <AppText
                style={styles.customerLabel}
              >
                Customer
              </AppText>
            </View>
          </View>
        </View>

        <View style={styles.arrow}>
          <Ionicons
            name="chevron-forward"
            size={17}
            color="#64748B"
          />
        </View>
      </View>

      {/* META */}
      <View style={styles.metaRow}>
        <Ionicons
          name="location-outline"
          size={15}
          color="#64748B"
        />

        <AppText
          numberOfLines={1}
          style={styles.location}
        >
          {order.location}
        </AppText>

        <View style={styles.divider} />

        <Ionicons
          name="calendar-outline"
          size={14}
          color="#64748B"
        />

        <AppText
          numberOfLines={1}
          style={styles.date}
        >
          {order.date}
        </AppText>
      </View>

      {/* NEW REQUEST */}
      {isPending && (
        <View style={styles.pendingNotice}>
          <Ionicons
            name="time-outline"
            size={15}
            color="#D97706"
          />

          <AppText
            weight="bold"
            style={styles.pendingText}
          >
            NEW REQUEST
          </AppText>

          <AppText style={styles.pendingHint}>
            Review & respond
          </AppText>
        </View>
      )}

      {/* FOOTER */}
      <View style={styles.footer}>
        <AppText style={styles.requestedText}>
          Requested on {order.date}
        </AppText>

        <View style={styles.viewButton}>
          <AppText
            weight="bold"
            style={styles.viewButtonText}
          >
            VIEW JOB
          </AppText>

          <Ionicons
            name="arrow-forward"
            size={16}
            color="#FFFFFF"
          />
        </View>
      </View>
    </Pressable>
  );
}

/* ==============================================================
   STATUS
============================================================== */

const StatusBadge = memo(
  ({
    status,
  }: {
    status: WorkerOrder["status"];
  }) => {
    const config = getStatusConfig(status);

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
  status: WorkerOrder["status"],
) {
  switch (status) {
    case "accepted":
      return {
        label: "ACCEPTED",
        background: styles.acceptedBackground,
        dot: styles.acceptedDot,
        text: styles.acceptedText,
      };

    case "in-progress":
      return {
        label: "IN PROGRESS",
        background: styles.progressBackground,
        dot: styles.progressDot,
        text: styles.progressText,
      };

    case "completed":
      return {
        label: "COMPLETED",
        background: styles.completedBackground,
        dot: styles.completedDot,
        text: styles.completedText,
      };

    case "cancelled":
      return {
        label: "CANCELLED",
        background: styles.cancelledBackground,
        dot: styles.cancelledDot,
        text: styles.cancelledText,
      };

    case "pending":
    default:
      return {
        label: "PENDING",
        background: styles.pendingBackground,
        dot: styles.pendingDot,
        text: styles.pendingStatusText,
      };
  }
}

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  card: {
    width: "100%",
    padding: 11,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",

    shadowColor: "#0F172A",
    shadowOpacity: 0.045,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  pressed: {
    opacity: 0.88,
    transform: [
      {
        scale: 0.987,
      },
    ],
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  idRow: {
    maxWidth: "52%",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  orderId: {
    flexShrink: 1,
    fontSize: 8.5,
    color: "#64748B",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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

  pendingBackground: {
    backgroundColor: "#FFF7E8",
  },

  pendingDot: {
    backgroundColor: "#F59E0B",
  },

  pendingStatusText: {
    color: "#D97706",
  },

  acceptedBackground: {
    backgroundColor: "#EFF6FF",
  },

  acceptedDot: {
    backgroundColor: "#2563EB",
  },

  acceptedText: {
    color: "#1D4ED8",
  },

  progressBackground: {
    backgroundColor: "#F3E8FF",
  },

  progressDot: {
    backgroundColor: "#7C3AED",
  },

  progressText: {
    color: "#6D28D9",
  },

  completedBackground: {
    backgroundColor: "#ECFDF5",
  },

  completedDot: {
    backgroundColor: "#16A34A",
  },

  completedText: {
    color: "#15803D",
  },

  cancelledBackground: {
    backgroundColor: "#FEF2F2",
  },

  cancelledDot: {
    backgroundColor: "#DC2626",
  },

  cancelledText: {
    color: "#B91C1C",
  },

  mainRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  serviceIcon: {
    width: 57,
    height: 57,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  info: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  serviceName: {
    fontSize: 14,
    lineHeight: 18,
    color: "#0F172A",
  },

  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  customerAvatar: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
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
    marginTop: 0,
    fontSize: 8.5,
    lineHeight: 11,
    color: "#94A3B8",
  },

  arrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },

  metaRow: {
    minHeight: 35,
    marginTop: 9,
    paddingVertical: 7,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
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
    backgroundColor: "#E2E8F0",
  },

  date: {
    flexShrink: 1,
    fontSize: 8.5,
    color: "#64748B",
  },

  pendingNotice: {
    minHeight: 34,
    marginTop: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#FFF7E8",
    borderWidth: 1,
    borderColor: "#FDE68A",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  pendingText: {
    fontSize: 8,
    color: "#D97706",
  },

  pendingHint: {
    flex: 1,
    textAlign: "right",
    fontSize: 8.5,
    color: "#92400E",
  },

  footer: {
    minHeight: 36,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  requestedText: {
    flex: 1,
    fontSize: 8.5,
    lineHeight: 12,
    color: "#64748B",
  },

  viewButton: {
    minWidth: 118,
    height: 36,
    paddingHorizontal: 11,
    borderRadius: 11,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  viewButtonText: {
    fontSize: 8.5,
    color: "#FFFFFF",
  },
});

export default memo(WorkerServiceOrderCard);