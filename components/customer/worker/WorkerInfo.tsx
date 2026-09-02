import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  firstName: string;
  surname: string;

  category?: string;
  subcategory?: string;

  rating: number;
  totalReviews: number;

  state?: string;
  lga?: string;

  hourlyRate?: number;
};

export default function WorkerInfo({
  firstName,
  surname,
  category,
  subcategory,
  rating,
  totalReviews,
  state,
  lga,
  hourlyRate,
}: Props) {
  const location = [lga, state]
    .filter(Boolean)
    .join(", ");

  return (
    <View style={styles.container}>
      {/* NAME */}

      <AppText
        weight="bold"
        numberOfLines={1}
        style={styles.name}
      >
        {firstName} {surname}
      </AppText>

      {/* RATING */}

      <View style={styles.ratingRow}>
        <Ionicons
          name="star"
          size={12}
          color="#F59E0B"
        />

        <AppText style={styles.meta}>
          {rating.toFixed(1)}
        </AppText>

        <AppText style={styles.meta}>
          ({totalReviews})
        </AppText>
      </View>

      {/* CATEGORY */}

      {!!category && (
        <AppText
          numberOfLines={1}
          style={styles.category}
        >
          {subcategory
            ? `${category} • ${subcategory}`
            : category}
        </AppText>
      )}

      {/* LOCATION */}

      {!!location && (
        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={12}
            color="#64748B"
          />

          <AppText
            numberOfLines={1}
            style={styles.meta}
          >
            {location}
          </AppText>
        </View>
      )}

      {/* HOURLY RATE */}

      {hourlyRate != null && (
        <AppText
          weight="bold"
          style={styles.price}
        >
          ₦{hourlyRate.toLocaleString()}/hr
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 8,
    minWidth: 0,
  },

  name: {
    fontSize: 13,
    lineHeight: 17,
    color: "#0F172A",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  category: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 14,
    color: "#475569",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    minWidth: 0,
  },

  meta: {
    marginLeft: 3,
    fontSize: 9.5,
    lineHeight: 13,
    color: "#64748B",
  },

  price: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
    color: "#F97316",
  },
});