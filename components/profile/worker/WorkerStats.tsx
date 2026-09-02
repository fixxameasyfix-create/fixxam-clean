import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppCard,
  AppText,
} from "@/components/ui";

type Props = {
  jobs?: number | null;
  completed?: number | null;
  rating?: number | null;
  earnings?: number | null;
};

function safeNumber(
  value: number | null | undefined,
): number {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : 0;
}

export default function WorkerStats({
  jobs,
  completed,
  rating,
  earnings,
}: Props) {
  const safeJobs =
    safeNumber(jobs);

  const safeCompleted =
    safeNumber(completed);

  const safeRating =
    safeNumber(rating);

  const safeEarnings =
    safeNumber(earnings);

  const stats = [
    {
      label: "Jobs",
      value:
        safeJobs.toLocaleString(),
    },
    {
      label: "Completed",
      value:
        safeCompleted.toLocaleString(),
    },
    {
      label: "Rating",
      value:
        safeRating > 0
          ? safeRating.toFixed(1)
          : "New",
    },
    {
      label: "Earnings",
      value:
        `₦${safeEarnings.toLocaleString()}`,
    },
  ];

  return (
    <AppCard
      style={styles.card}
    >
      {stats.map((item) => (
        <View
          key={item.label}
          style={styles.item}
        >
          <AppText
            weight="bold"
            style={styles.value}
            numberOfLines={1}
          >
            {item.value}
          </AppText>

          <AppText
            style={styles.label}
            numberOfLines={1}
          >
            {item.label}
          </AppText>
        </View>
      ))}
    </AppCard>
  );
}

const styles =
  StyleSheet.create({
    card: {
      marginHorizontal: 0,
      marginTop: 0,
      marginBottom: 0,

      paddingVertical: 14,
      paddingHorizontal: 6,

      flexDirection: "row",
      justifyContent:
        "space-around",
      alignItems: "center",

      borderRadius: 17,
    },

    item: {
      flex: 1,
      minWidth: 0,

      alignItems: "center",
      justifyContent: "center",
    },

    value: {
      fontSize: 18,
      lineHeight: 22,
      color: "#0F172A",
    },

    label: {
      marginTop: 3,
      color: "#64748B",
      fontSize: 10.5,
      lineHeight: 15,
      textAlign: "center",
    },
  });