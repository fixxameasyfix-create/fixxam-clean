import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui";

interface NearbyWorkerCardProps {
  onPress: () => void;
  onBookNow: () => void;
}

export default function NearbyWorkerCard({
  onPress,
  onBookNow,
}: NearbyWorkerCardProps) {
  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: "https://i.pravatar.cc/150?img=12",
            }}
            style={styles.avatar}
          />

          <Pressable
            style={styles.plusButton}
            onPress={onPress}
          >
            <Ionicons
              name="add"
              size={14}
              color="#fff"
            />
          </Pressable>
        </View>

        <View style={styles.info}>
          <AppText
            weight="bold"
            style={styles.name}
          >
            Hassan Abdullahi
          </AppText>

          <AppText style={styles.profession}>
            Electrician
          </AppText>

          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={14}
              color="#64748B"
            />

            <AppText style={styles.location}>
              Kuje, Abuja • 1.4 km
            </AppText>
          </View>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Ionicons
            name="briefcase-outline"
            size={16}
            color="#2563EB"
          />
          <AppText>25 Jobs</AppText>
        </View>

        <View style={styles.stat}>
          <Ionicons
            name="star"
            size={16}
            color="#F59E0B"
          />
          <AppText>4.9</AppText>
        </View>

        <View style={styles.stat}>
          <View style={styles.onlineDot} />
          <AppText>Available</AppText>
        </View>
      </View>

      <View style={styles.footer}>
        <AppText
          weight="bold"
          style={styles.price}
        >
          ₦2,500/hr
        </AppText>

        <Pressable
          style={styles.button}
          onPress={onBookNow}
        >
          <AppText style={styles.buttonText}>
            Book Now
          </AppText>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },

  header: {
    flexDirection: "row",
  },

  avatarContainer: {
    position: "relative",
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },

  plusButton: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },

  name: {
    fontSize: 17,
  },

  profession: {
    marginTop: 2,
    color: "#64748B",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  location: {
    marginLeft: 4,
    color: "#64748B",
  },

  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },

  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },

  price: {
    fontSize: 18,
    color: "#2563EB",
  },

  button: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});