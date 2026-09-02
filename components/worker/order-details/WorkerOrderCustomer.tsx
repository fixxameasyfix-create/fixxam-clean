import React from "react";

import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

type Props = {
  name: string;
  photo?: string;
  phone?: string;
  rating?: number;
  verified?: boolean;

  onCall?: () => void;
  onMessage?: () => void;
};

export default function WorkerOrderCustomer({
  name,
  photo,
  phone,
  rating = 0,
  verified = false,
  onCall,
  onMessage,
}: Props) {
  const safeRating = Number.isFinite(
    rating,
  )
    ? Math.max(0, rating)
    : 0;

  const displayName =
    name.trim() || "Customer";

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {photo ? (
          <Image
            source={{
              uri: photo,
            }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons
              name="person"
              size={28}
              color="#FF6B00"
            />
          </View>
        )}

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <AppText
              weight="bold"
              numberOfLines={1}
              style={styles.name}
            >
              {displayName}
            </AppText>

            {verified && (
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#16A34A"
              />
            )}
          </View>

          {phone ? (
            <AppText
              numberOfLines={1}
              style={styles.phone}
            >
              {phone}
            </AppText>
          ) : null}

          <View style={styles.ratingRow}>
            <Ionicons
              name="star"
              size={16}
              color="#F59E0B"
            />

            <AppText
              style={styles.rating}
            >
              {safeRating.toFixed(1)}
            </AppText>
          </View>
        </View>
      </View>

      {(onCall || onMessage) && (
        <View style={styles.actions}>
          {onCall && (
            <Pressable
              onPress={onCall}
              accessibilityRole="button"
              accessibilityLabel={`Call ${displayName}`}
              hitSlop={8}
              style={({ pressed }) => [
                styles.actionButton,
                pressed &&
                  styles.actionPressed,
              ]}
            >
              <Ionicons
                name="call-outline"
                size={22}
                color="#FF6B00"
              />
            </Pressable>
          )}

          {onMessage && (
            <Pressable
              onPress={onMessage}
              accessibilityRole="button"
              accessibilityLabel={`Message ${displayName}`}
              hitSlop={8}
              style={({ pressed }) => [
                styles.actionButton,
                pressed &&
                  styles.actionPressed,
              ]}
            >
              <Ionicons
                name="chatbubble-outline"
                size={22}
                color="#FF6B00"
              />
            </Pressable>
          )}
        </View>
      )}
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

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F1F5F9",
  },

  placeholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
  },

  info: {
    flex: 1,
    marginLeft: 14,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  name: {
    flexShrink: 1,
    fontSize: 18,
    color: "#0F172A",
  },

  phone: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 13,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  rating: {
    marginLeft: 4,
    color: "#64748B",
    fontSize: 13,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 18,
  },

  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  actionPressed: {
    opacity: 0.65,
  },
});