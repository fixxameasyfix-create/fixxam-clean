import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Review = {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
};

type Props = {
  rating: number;
  totalReviews: number;
  reviews: Review[];
};

export default function WorkerReviews({
  rating,
  totalReviews,
  reviews,
}: Props) {
  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <Ionicons
          name="star"
          size={17}
          color="#F59E0B"
        />

        <AppText
          weight="bold"
          style={styles.title}
        >
          Customer Reviews
        </AppText>
      </View>

      {/* SUMMARY */}

      <View style={styles.summary}>
        <AppText
          weight="bold"
          style={styles.bigRating}
        >
          {rating.toFixed(1)}
        </AppText>

        <View style={styles.summaryText}>
          <AppText
            weight="bold"
            style={styles.summaryTitle}
          >
            Excellent
          </AppText>

          <AppText style={styles.summarySub}>
            {totalReviews} Reviews
          </AppText>
        </View>
      </View>

      {/* REVIEWS */}

      {reviews.length > 0 &&
        reviews.slice(0, 3).map((item) => (
          <View
            key={item.id}
            style={styles.card}
          >
            <View style={styles.row}>
              {/* AVATAR */}

              <View style={styles.avatar}>
                <AppText
                  weight="bold"
                  style={styles.avatarText}
                >
                  {item.customerName
                    .charAt(0)
                    .toUpperCase()}
                </AppText>
              </View>

              {/* CUSTOMER */}

              <View style={styles.customerInfo}>
                <AppText
                  weight="bold"
                  style={styles.customerName}
                  numberOfLines={1}
                >
                  {item.customerName}
                </AppText>

                <View style={styles.ratingRow}>
                  {Array.from({ length: 5 }).map(
                    (_, i) => (
                      <Ionicons
                        key={i}
                        name={
                          i < item.rating
                            ? "star"
                            : "star-outline"
                        }
                        size={11}
                        color="#F59E0B"
                      />
                    ),
                  )}
                </View>
              </View>

              {/* DATE */}

              <AppText style={styles.date}>
                {item.date}
              </AppText>
            </View>

            {/* COMMENT */}

            <AppText
              style={styles.comment}
              numberOfLines={3}
            >
              {item.comment}
            </AppText>
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    marginTop: 8,
    marginBottom: 10,
  },

  /* HEADER */

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  title: {
    marginLeft: 5,
    fontSize: 12,
    lineHeight: 16,
    color: "#0F172A",
  },

  /* SUMMARY */

  summary: {
    height: 48,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderRadius: 11,

    paddingHorizontal: 11,

    borderWidth: 1,
    borderColor: "#EEF2F7",

    marginBottom: 6,
  },

  bigRating: {
    fontSize: 20,
    lineHeight: 24,
    color: "#F59E0B",
  },

  summaryText: {
    marginLeft: 8,
  },

  summaryTitle: {
    fontSize: 11,
    lineHeight: 14,
    color: "#0F172A",
  },

  summarySub: {
    marginTop: 1,
    fontSize: 9.5,
    lineHeight: 13,
    color: "#64748B",
  },

  /* REVIEW CARD */

  card: {
    backgroundColor: "#FFFFFF",

    borderRadius: 11,

    padding: 9,

    marginBottom: 5,

    borderWidth: 1,
    borderColor: "#EEF2F7",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 27,
    height: 27,

    borderRadius: 13.5,

    backgroundColor: "#2563EB",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 7,
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 10,
  },

  customerInfo: {
    flex: 1,
    minWidth: 0,
  },

  customerName: {
    fontSize: 10.5,
    lineHeight: 14,
    color: "#0F172A",
  },

  ratingRow: {
    flexDirection: "row",
    marginTop: 1,
  },

  date: {
    marginLeft: 5,
    fontSize: 8.5,
    lineHeight: 12,
    color: "#94A3B8",
  },

  comment: {
    marginTop: 5,
    fontSize: 9.5,
    lineHeight: 14,
    color: "#475569",
  },
});