import React from "react";
import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  hourlyRate?: number;
  onBook: () => void;
};

export default function WorkerFooter({
  hourlyRate,
  onBook,
}: Props) {
  return (
    <View style={styles.container}>
      <View>
        <AppText style={styles.label}>
          Hourly Rate
        </AppText>

        <AppText
          weight="bold"
          style={styles.price}
        >
          {hourlyRate != null
            ? `₦${hourlyRate.toLocaleString()}/hr`
            : "Negotiable"}
        </AppText>
      </View>

      <Pressable
        onPress={onBook}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.pressed,
        ]}
      >
        <AppText
          weight="bold"
          style={styles.buttonText}
        >
          Book Now
        </AppText>

        <Ionicons
          name="arrow-forward"
          size={18}
          color="#FFFFFF"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    fontSize: 11,
    color: "#64748B",
  },

  price: {
    marginTop: 2,
    fontSize: 18,
    color: "#F97316",
  },

  button: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#2563EB",

    paddingHorizontal: 18,
    paddingVertical: 10,

    borderRadius: 12,
  },

  pressed: {
    opacity: 0.9,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginRight: 6,
  },
});