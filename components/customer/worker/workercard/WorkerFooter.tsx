import React from "react";
import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

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
          Starting From
        </AppText>

        <AppText
          weight="bold"
          style={styles.price}
        >
          ₦{(hourlyRate ?? 0).toLocaleString()}/hr
        </AppText>
      </View>

      <Pressable
        onPress={onBook}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
      >
        <AppText
          weight="bold"
          style={styles.buttonText}
        >
          Request Now
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    fontSize: 12,
    color: "#64748B",
  },

  price: {
    marginTop: 2,
    fontSize: 22,
    color: "#0F172A",
  },

  button: {
    backgroundColor: "#2563EB",

    paddingHorizontal: 22,
    paddingVertical: 12,

    borderRadius: 12,

    minWidth: 120,
    alignItems: "center",
  },

  buttonPressed: {
    opacity: 0.85,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
  },
});