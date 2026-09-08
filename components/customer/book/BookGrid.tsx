import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import DashboardWideCard from "@/components/common/dashboard/DashboardWideCard";

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
      {/* ======================================================
          BOOK AUTOMATICALLY
      ====================================================== */}


      <DashboardWideCard
  title="Book Automatically"
  description="Let Fixxam find the right worker nearby."
  icon="sparkles-outline"
  iconColor="#F97316"
  iconBackground="#FFF7ED"
  onPress={() =>
    router.push(
      "/(customer)/ai-booking",
    )
  }
/>

      {/* ======================================================
          BOOK OPTIONS
      ====================================================== */}

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

        {/* ====================================================
            TODAY'S GOOD DEALS
        ==================================================== */}

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

      marginTop:
        FixxamTokens.spacing.md,

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