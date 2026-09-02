import React from "react";
import { StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AppText } from "@/components/ui";

type Props = {
  description: string;
};

export default function ProductDescription({
  description,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name="document-text-outline"
          size={15}
          color="#2563EB"
        />

        <AppText weight="bold" style={styles.title}>
          Product Description
        </AppText>
      </View>

      <AppText style={styles.description}>
        {description || "No description available for this product."}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginHorizontal: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  title: {
    marginLeft: 5,
    fontSize: 12,
    lineHeight: 16,
    color: "#111827",
  },

  description: {
    fontSize: 11,
    lineHeight: 16,
    color: "#4B5563",
  },
});