import React from "react";

import {
  Image,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppCard,
  AppText,
} from "@/components/ui";

type Props = {
  serviceName: string;
  bookingDate: string;
  bookingTime: string;
  address: string;
  description: string;
  photos?: string[];
};

export default function BookingInfoCard({
  serviceName,
  bookingDate,
  bookingTime,
  address,
  description,
  photos,
}: Props) {
  const formattedDate = bookingDate
    ? new Date(bookingDate).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        },
      )
    : "-";

  const formattedTime = bookingTime
    ? new Date(bookingTime).toLocaleTimeString(
        "en-GB",
        {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        },
      )
    : "-";

  return (
    <AppCard style={styles.card}>
      {/* SERVICE */}

      <View style={styles.serviceRow}>
        <View style={styles.serviceIcon}>
          <Ionicons
            name="construct-outline"
            size={20}
            color="#2563EB"
          />
        </View>

        <View style={styles.serviceContent}>
          <AppText
            weight="bold"
            numberOfLines={1}
            style={styles.serviceName}
          >
            {serviceName}
          </AppText>

          <AppText style={styles.serviceLabel}>
            Service
          </AppText>
        </View>
      </View>

      {/* BASIC INFO */}

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons
            name="calendar-outline"
            size={17}
            color="#64748B"
          />

          <View style={styles.infoContent}>
            <AppText style={styles.infoLabel}>
              Date & Time
            </AppText>

            <AppText style={styles.infoValue}>
              {formattedDate} • {formattedTime}
            </AppText>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons
            name="location-outline"
            size={17}
            color="#64748B"
          />

          <View style={styles.infoContent}>
            <AppText style={styles.infoLabel}>
              Location
            </AppText>

            <AppText
              numberOfLines={2}
              style={styles.infoValue}
            >
              {address || "-"}
            </AppText>
          </View>
        </View>
      </View>

      {/* DESCRIPTION */}

      {!!description && (
        <View style={styles.description}>
          <AppText
            weight="bold"
            style={styles.descriptionTitle}
          >
            Your Request
          </AppText>

          <AppText
            numberOfLines={4}
            style={styles.descriptionText}
          >
            {description}
          </AppText>
        </View>
      )}

      {/* PHOTOS */}

      {photos && photos.length > 0 && (
        <View style={styles.photosSection}>
          <AppText
            weight="bold"
            style={styles.photosTitle}
          >
            Photos
          </AppText>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={
              styles.photosContainer
            }
          >
            {photos.map((uri, index) => (
              <Image
                key={`${uri}-${index}`}
                source={{ uri }}
                style={styles.photo}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </View>
      )}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },

  /*
   * SERVICE
   */

  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  serviceIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  serviceContent: {
    flex: 1,
    marginLeft: 11,
  },

  serviceName: {
    fontSize: 16,
    color: "#0F172A",
  },

  serviceLabel: {
    marginTop: 2,
    fontSize: 11,
    color: "#94A3B8",
  },

  /*
   * BASIC INFO
   */

  infoRow: {
    marginTop: 14,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 12,
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  infoContent: {
    flex: 1,
    marginLeft: 9,
  },

  infoLabel: {
    fontSize: 11,
    color: "#94A3B8",
  },

  infoValue: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: "#475569",
  },

  /*
   * DESCRIPTION
   */

  description: {
    marginTop: 13,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  descriptionTitle: {
    fontSize: 12,
    color: "#64748B",
  },

  descriptionText: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: "#475569",
  },

  /*
   * PHOTOS
   */

  photosSection: {
    marginTop: 13,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  photosTitle: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 8,
  },

  photosContainer: {
    gap: 8,
  },

  photo: {
    width: 92,
    height: 72,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
  },
});