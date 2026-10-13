import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import useTodayDeals from "@/hooks/deals/useTodayDeals";

import {
  FixxamTokens,
} from "@/theme";

import BookCard from "./BookCard";

import {
  bookCards,
} from "./BookData";

/* ==============================================================
   COMPONENT
============================================================== */

export default function BookGrid() {
  const deal =
    useTodayDeals();

  return (
    <View
      style={styles.container}
    >
      <View
        style={styles.grid}
      >
        {bookCards.map(
          (item) => (
            <View
              key={item.title}
              style={
                styles.gridItem
              }
            >
              <BookCard
                {...item}
              />
            </View>
          ),
        )}

        <View
          style={styles.gridItem}
        >
          <BookCard
            title={
              deal?.title ??
              "Today's Good Deals"
            }
            description={
              deal?.description ??
              "Discover today's best promotions, discounts and featured offers."
            }
            icon="star"
            iconColor="#F59E0B"
            iconBackground="#FFFBEA"
            onPress={() =>
              router.push(
                "/good-deals",
              )
            }
          />
        </View>
      </View>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",
    },

    grid: {
      width: "100%",

      flexDirection: "row",

      flexWrap: "wrap",

      justifyContent:
        "space-between",

      rowGap:
        FixxamTokens.spacing.md,
    },

    gridItem: {
      width: "48.5%",
    },
  });