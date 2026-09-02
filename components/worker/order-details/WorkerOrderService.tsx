import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

type Props = {
  serviceName: string;
  address: string;
  date: string;
  time?: string;
  description?: string;
};

export default function WorkerOrderService({
  serviceName,
  address,
  date,
  time,
  description,
}: Props) {
  const safeServiceName =
    serviceName?.trim() ||
    "Service Booking";

  const safeAddress =
    address?.trim() ||
    "Location not available";

  const safeDate =
    date?.trim() ||
    "Date not available";

  const safeDescription =
    description?.trim() ||
    "No description provided.";

  return (
    <View style={styles.container}>
      <AppText
        weight="bold"
        style={styles.title}
      >
        Service Details
      </AppText>

      {/* SERVICE */}

      <View style={styles.item}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="construct-outline"
            size={20}
            color="#FF6B00"
          />
        </View>

        <View style={styles.content}>
          <AppText
            style={styles.label}
          >
            Service
          </AppText>

          <AppText
            weight="bold"
            style={styles.value}
          >
            {safeServiceName}
          </AppText>
        </View>
      </View>

      {/* LOCATION */}

      <View style={styles.item}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="location-outline"
            size={20}
            color="#FF6B00"
          />
        </View>

        <View style={styles.content}>
          <AppText
            style={styles.label}
          >
            Service Location
          </AppText>

          <AppText
            style={styles.value}
          >
            {safeAddress}
          </AppText>
        </View>
      </View>

      {/* DATE & TIME */}

      <View style={styles.item}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color="#FF6B00"
          />
        </View>

        <View style={styles.content}>
          <AppText
            style={styles.label}
          >
            Date & Time
          </AppText>

          <AppText
            style={styles.value}
          >
            {safeDate}
            {time?.trim()
              ? ` • ${time.trim()}`
              : ""}
          </AppText>
        </View>
      </View>

      {/* DESCRIPTION */}

      <View
        style={[
          styles.item,
          styles.lastItem,
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name="document-text-outline"
            size={20}
            color="#FF6B00"
          />
        </View>

        <View style={styles.content}>
          <AppText
            style={styles.label}
          >
            Description
          </AppText>

          <AppText
            style={styles.description}
          >
            {safeDescription}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
  },

  title: {
    fontSize: 18,
    color: "#0F172A",
    marginBottom: 18,
  },

  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },

  lastItem: {
    marginBottom: 0,
  },

  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flex: 1,
    marginLeft: 12,
  },

  label: {
    fontSize: 11,
    color: "#94A3B8",
    marginBottom: 3,
  },

  value: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
  },

  description: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 21,
  },
});