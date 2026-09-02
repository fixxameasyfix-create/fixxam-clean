import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

type Worker = {
  id: string;
  fullName: string;
  category: string;
  rating: number;
  verified: boolean;
};

type Props = {
  worker: Worker;
};

export default function WorkerResultCard({
  worker,
}: Props) {
  return (
    <Pressable
      style={styles.container}
      onPress={() =>
        router.push({
          pathname: "/(customer)/workers/[id]",
          params: { id: worker.id },
        })
      }
    >
      <View style={styles.avatar}>
        <Ionicons
          name="person"
          size={24}
          color="#2563EB"
        />
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.name}>
            {worker.fullName}
          </Text>

          {worker.verified && (
            <Ionicons
              name="checkmark-circle"
              size={16}
              color="#22C55E"
            />
          )}
        </View>

        <Text style={styles.category}>
          {worker.category}
        </Text>
      </View>

      <View style={styles.rating}>
        <Ionicons
          name="star"
          size={14}
          color="#F59E0B"
        />

        <Text style={styles.ratingText}>
          {worker.rating.toFixed(1)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    flex: 1,
    marginLeft: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginRight: 4,
  },

  category: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },

  rating: {
    flexDirection: "row",
    alignItems: "center",
  },

  ratingText: {
    marginLeft: 4,
    fontWeight: "600",
    color: "#0F172A",
  },
});