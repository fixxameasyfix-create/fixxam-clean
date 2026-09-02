import React from "react";
import {
  View,
  StyleSheet,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { AppText } from "@/components/ui";

type Props = {
  rating: number;
  reviews?: number;
  size?: number;
};

export default function AppRating({
  rating,
  reviews,
  size = 16,
}: Props) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="star"
        size={size}
        color="#F59E0B"
      />

      <AppText
        weight="bold"
        style={styles.rating}
      >
        {rating.toFixed(1)}
      </AppText>

      {reviews !== undefined && (
        <AppText style={styles.reviews}>
          ({reviews})
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },

  rating: {
    marginLeft: 6,
    fontSize: 14,
    color: "#0F172A",
  },

  reviews: {
    marginLeft: 4,
    fontSize: 13,
    color: "#64748B",
  },
});