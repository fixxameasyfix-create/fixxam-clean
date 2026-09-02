import React from "react";

import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  workerId: string;
  name: string;
  photoUrl?: string;
  location?: string;
  rating?: number;
  phoneNumber?: string;
  onViewProfile: () => void;
  onCall: () => void;
};

export default function ProductSeller({
  name,
  photoUrl,
  location,
  rating = 0,
  onViewProfile,
  onCall,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.sellerHeader}>
        <View style={styles.avatarWrapper}>
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              style={styles.avatar}
              resizeMode="cover"
              accessibilityLabel={`${name} profile photo`}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons
                name="person-outline"
                size={18}
                color="#64748B"
              />
            </View>
          )}
        </View>

        <View style={styles.sellerInfo}>
          <AppText
            weight="bold"
            numberOfLines={1}
            style={styles.name}
          >
            {name || "Worker"}
          </AppText>

          {!!location && (
            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={11}
                color="#64748B"
              />

              <AppText
                numberOfLines={1}
                style={styles.location}
              >
                {location}
              </AppText>
            </View>
          )}
        </View>
      </View>

      <View style={styles.ratingRow}>
        <Ionicons
          name="star"
          size={12}
          color="#F59E0B"
        />

        <AppText
          weight="bold"
          style={styles.rating}
        >
          {Number(rating || 0).toFixed(1)}
        </AppText>

        <AppText style={styles.ratingLabel}>
          Worker
        </AppText>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.profileButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={onViewProfile}
          accessibilityRole="button"
          accessibilityLabel={`View ${name || "worker"}'s profile`}
        >
          <Ionicons
            name="person-outline"
            size={14}
            color="#2563EB"
          />

          <AppText
            weight="bold"
            style={styles.profileButtonText}
          >
            View Profile
          </AppText>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.callButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={onCall}
          accessibilityRole="button"
          accessibilityLabel={`Call ${name || "worker"}`}
        >
          <Ionicons
            name="call-outline"
            size={14}
            color="#FFFFFF"
          />

          <AppText
            weight="bold"
            style={styles.callButtonText}
          >
            Call
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 12,
    padding: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOpacity: 0.035,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 1,
  },

  sellerHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
  },

  avatar: {
    width: "100%",
    height: "100%",
  },

  avatarPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
  },

  sellerInfo: {
    flex: 1,
    marginLeft: 8,
  },

  name: {
    fontSize: 13,
    lineHeight: 17,
    color: "#0F172A",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  location: {
    flex: 1,
    marginLeft: 3,
    fontSize: 9.5,
    lineHeight: 13,
    color: "#64748B",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    paddingVertical: 5,
    paddingHorizontal: 7,
    borderRadius: 8,
    backgroundColor: "#FFFBEB",
  },

  rating: {
    marginLeft: 3,
    fontSize: 10,
    lineHeight: 13,
    color: "#0F172A",
  },

  ratingLabel: {
    marginLeft: 4,
    fontSize: 9,
    lineHeight: 12,
    color: "#64748B",
  },

  actions: {
    flexDirection: "row",
    marginTop: 8,
    gap: 6,
  },

  profileButton: {
    flex: 1,
    height: 34,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#2563EB",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  profileButtonText: {
    marginLeft: 4,
    fontSize: 10,
    lineHeight: 13,
    color: "#2563EB",
  },

  callButton: {
    flex: 1,
    height: 34,
    borderRadius: 9,
    backgroundColor: "#F97316",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  callButtonText: {
    marginLeft: 4,
    fontSize: 10,
    lineHeight: 13,
    color: "#FFFFFF",
  },

  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});