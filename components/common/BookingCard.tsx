import React from "react";

import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

export type BookingStatus =
  | "pending"
  | "pending_estimate"
  | "accepted"
  | "negotiating"
  | "arrived"
  | "ongoing"
  | "completed"
  | "cancelled";

export type BookingCardProps = {
  customerName: string;

  customerPhotoURL?: string;
  bookingPhotoURL?: string;

  serviceName: string;

  amount: number;

  status: BookingStatus;

  location: string;

  bookingDate: string;
  bookingTime: string;

  onPress: () => void;
};

const STATUS_CONFIG: Record<
  BookingStatus,
  {
    label: string;
    textColor: string;
    backgroundColor: string;
    borderColor: string;
  }
> = {
  pending: {
    label: "Pending",
    textColor: "#B45309",
    backgroundColor: "#FFF7ED",
    borderColor: "#F59E0B",
  },

  pending_estimate: {
    label: "Pending Estimate",
    textColor: "#B45309",
    backgroundColor: "#FFF7ED",
    borderColor: "#F59E0B",
  },

  accepted: {
    label: "Accepted",
    textColor: "#2563EB",
    backgroundColor: "#EFF6FF",
    borderColor: "#93C5FD",
  },

  negotiating: {
    label: "Negotiating",
    textColor: "#7E22CE",
    backgroundColor: "#FFF7ED",
    borderColor: "#F59E0B",
  },

  arrived: {
    label: "Arrived",
    textColor: "#0891B2",
    backgroundColor: "#ECFEFF",
    borderColor: "#67E8F9",
  },

  ongoing: {
    label: "In Progress",
    textColor: "#0F766E",
    backgroundColor: "#ECFDF5",
    borderColor: "#6EE7B7",
  },

  completed: {
    label: "Completed",
    textColor: "#16A34A",
    backgroundColor: "#ECFDF5",
    borderColor: "#6EE7B7",
  },

  cancelled: {
    label: "Cancelled",
    textColor: "#DC2626",
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
  },
};

export default function BookingCard({
  customerName,
  customerPhotoURL,
  bookingPhotoURL,
  serviceName,
  amount,
  status,
  location,
  bookingDate,
  bookingTime,
  onPress,
}: BookingCardProps) {
  const badge = STATUS_CONFIG[status];

  const imageSource =
    customerPhotoURL || bookingPhotoURL;
return (
    <Pressable
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.left}>
          {imageSource ? (
            <Image
              source={{ uri: imageSource }}
              style={styles.avatar}
            />
          ) : (
            <View
              style={styles.avatarPlaceholder}
            >
              <Ionicons
                name="person"
                size={26}
                color="#2563EB"
              />
            </View>
          )}

          <View style={styles.content}>
            <AppText
              weight="bold"
              style={styles.customerName}
              numberOfLines={1}
            >
              {customerName}
            </AppText>

            <AppText
              style={styles.service}
              numberOfLines={1}
            >
              {serviceName}
            </AppText>
          </View>
        </View>

        <View style={styles.right}>
          <AppText
            weight="bold"
            style={styles.price}
          >
            ₦{amount.toLocaleString()}
          </AppText>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <View
          style={[
            styles.badge,
            {
              backgroundColor:
                badge.backgroundColor,
              borderColor:
                badge.borderColor,
            },
          ]}
        >
          <AppText
            style={[
              styles.badgeText,
              {
                color: badge.textColor,
              },
            ]}
          >
            {badge.label}
          </AppText>
        </View>

        <View style={styles.meta}>
          <Ionicons
            name="location-outline"
            size={14}
            color="#64748B"
          />

          <AppText
            numberOfLines={1}
            style={styles.metaText}
          >
            {location}
          </AppText>
        </View>

        <View style={styles.meta}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color="#64748B"
          />

          <AppText
            style={styles.metaText}
          >
            {bookingDate} • {bookingTime}
          </AppText>
        </View>

        <Pressable
          style={styles.arrowButton}
          onPress={onPress}
        >
          <Ionicons
            name="chevron-forward"
            size={18}
            color="#2563EB"
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,

    elevation: 4,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  left: {
    flex: 1,
    flexDirection: "row",
    marginRight: 12,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F1F5F9",
  },

  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    marginLeft: 14,
  },

  customerName: {
    fontSize: 17,
    color: "#0F172A",
  },

  service: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748B",
  },

  right: {
    alignItems: "flex-end",
    justifyContent: "center",
  },

  price: {
    fontSize: 20,
    color: "#2563EB",
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 16,
  },

  footer: {
    position: "relative",
  },

  badge: {
    alignSelf: "flex-start",

    paddingHorizontal: 14,
    paddingVertical: 7,

    borderRadius: 999,

    borderWidth: 1,
  },

  badgeText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  meta: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 12,

    paddingRight: 54,
  },

  metaText: {
    flex: 1,
    marginLeft: 8,

    fontSize: 13,
    color: "#64748B",
  },

  arrowButton: {
    position: "absolute",
    right: 0,
    bottom: 0,

    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: "#EFF6FF",

    justifyContent: "center",
    alignItems: "center",
  },
});