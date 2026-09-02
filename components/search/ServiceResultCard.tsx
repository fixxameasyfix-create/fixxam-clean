import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

type Props = {
  service: {
    id: string;
    name: string;
    description?: string;
  };
};

export default function ServiceResultCard({
  service,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.container}
      onPress={() =>
        router.push({
          pathname:
            "/(customer)/details/workers/[id]" as any,
          params: {
            id: service.id,
          },
        })
      }
    >
      <View style={styles.icon}>
        <Ionicons
          name="construct"
          size={22}
          color="#2563EB"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>
          {service.name}
        </Text>

        {!!service.description && (
          <Text
            numberOfLines={1}
            style={styles.description}
          >
            {service.description}
          </Text>
        )}
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#94A3B8"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
  },

  icon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    flex: 1,
    marginLeft: 12,
  },

  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  description: {
    marginTop: 2,
    fontSize: 12,
    color: "#64748B",
  },
});