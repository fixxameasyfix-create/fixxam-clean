import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";
import { getOrderStatus } from "@/constants/orderStatus";

type Props = {
  workerName: string;
  workerPhoto: string;
  serviceName: string;
  serviceImage?: string;

  // Kept for compatibility with the existing OrdersScreen.
  location: string;

  bookingDate: string;
  bookingTime: string;

  status: string;
  amount: number;

  onPress: () => void;
};

export default function OrderCard({
  workerName,
  workerPhoto,
  serviceName,
  serviceImage,
  bookingDate,
  bookingTime,
  status,
  amount,
  onPress,
}: Props) {
  const formattedDate = bookingDate
    ? new Date(bookingDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  const formattedTime = bookingTime
    ? new Date(bookingTime).toLocaleTimeString("en-GB", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  const statusConfig = getOrderStatus(status);

  const imageUri = workerPhoto || serviceImage;

  const displayName =
    workerName?.trim() || "Market Order";

  const displayService =
    serviceName?.trim() || "Service Booking";

  const hasAmount = amount > 0;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${displayService} order`}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      {/* Main information */}
      <View style={styles.mainRow}>
        <View style={styles.identity}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons
                name="person"
                size={21}
                color="#94A3B8"
              />
            </View>
          )}

          <View style={styles.identityContent}>
            <AppText
              weight="bold"
              numberOfLines={1}
              style={styles.workerName}
            >
              {displayName}
            </AppText>

            <AppText
              numberOfLines={1}
              style={styles.serviceName}
            >
              {displayService}
            </AppText>
          </View>
        </View>

        {hasAmount ? (
          <AppText
            weight="bold"
            numberOfLines={1}
            style={styles.amount}
          >
            ₦{amount.toLocaleString()}
          </AppText>
        ) : null}
      </View>

      {/* Status + date + time + arrow */}
      <View style={styles.metaRow}>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                statusConfig.backgroundColor,
            },
          ]}
        >
          <Ionicons
            name={statusConfig.icon}
            size={13}
            color={statusConfig.textColor}
          />

          <AppText
            numberOfLines={1}
            style={[
              styles.statusText,
              {
                color: statusConfig.textColor,
              },
            ]}
          >
            {statusConfig.label}
          </AppText>
        </View>

        <View style={styles.dateTime}>
          {formattedDate ? (
            <>
              <Ionicons
                name="calendar-outline"
                size={14}
                color="#94A3B8"
              />

              <AppText
                numberOfLines={1}
                style={styles.metaText}
              >
                {formattedDate}
              </AppText>
            </>
          ) : null}

          {formattedDate && formattedTime ? (
            <View style={styles.separator} />
          ) : null}

          {formattedTime ? (
            <>
              <Ionicons
                name="time-outline"
                size={14}
                color="#94A3B8"
              />

              <AppText
                numberOfLines={1}
                style={styles.metaText}
              >
                {formattedTime}
              </AppText>
            </>
          ) : null}
        </View>

        <View style={styles.arrow}>
          <Ionicons
            name="chevron-forward"
            size={18}
            color="#2563EB"
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",

    borderRadius: 20,

    paddingHorizontal: 14,
    paddingVertical: 14,

    marginBottom: 10,

    borderWidth: 1,
    borderColor: "#E8EDF3",

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.035,
    shadowRadius: 7,

    elevation: 2,
  },

  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },

  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  identity: {
    flex: 1,

    flexDirection: "row",
    alignItems: "center",

    minWidth: 0,

    paddingRight: 10,
  },

  avatar: {
    width: 52,
    height: 52,

    borderRadius: 26,

    backgroundColor: "#F1F5F9",
  },

  avatarPlaceholder: {
    width: 52,
    height: 52,

    borderRadius: 26,

    backgroundColor: "#F1F5F9",

    alignItems: "center",
    justifyContent: "center",
  },

  identityContent: {
    flex: 1,

    minWidth: 0,

    marginLeft: 12,
  },

  workerName: {
    fontSize: 16,
    lineHeight: 21,

    color: "#0F172A",
  },

  serviceName: {
    marginTop: 3,

    fontSize: 13.5,
    lineHeight: 19,

    color: "#64748B",
  },

  amount: {
    maxWidth: 105,

    fontSize: 16,
    lineHeight: 21,

    color: "#0F172A",

    textAlign: "right",
  },

  metaRow: {
    marginTop: 13,

    paddingTop: 11,

    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",

    flexDirection: "row",
    alignItems: "center",

    paddingRight: 38,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",

    maxWidth: 145,

    paddingHorizontal: 9,
    paddingVertical: 6,

    borderRadius: 999,
  },

  statusText: {
    marginLeft: 5,

    fontSize: 11.5,
    lineHeight: 15,

    fontWeight: "700",
  },

  dateTime: {
    flex: 1,

    flexDirection: "row",
    alignItems: "center",

    minWidth: 0,

    marginLeft: 10,
  },

  metaText: {
    marginLeft: 4,

    fontSize: 11.5,
    lineHeight: 16,

    color: "#94A3B8",
  },

  separator: {
    width: 3,
    height: 3,

    borderRadius: 2,

    backgroundColor: "#CBD5E1",

    marginHorizontal: 6,
  },

  arrow: {
    position: "absolute",

    right: 0,

    width: 34,
    height: 34,

    borderRadius: 17,

    backgroundColor: "#EFF6FF",

    alignItems: "center",
    justifyContent: "center",
  },
});