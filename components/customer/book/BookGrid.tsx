import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import { router } from "expo-router";

import DashboardWideCard from "@/components/common/dashboard/DashboardWideCard";

import useTodayDeals from "@/hooks/deals/useTodayDeals";

import BookCard from "./BookCard";
import { bookCards } from "./BookData";

export default function BookGrid() {
  const deal = useTodayDeals();

  return (
    <View style={styles.container}>
      {/* =====================================================
          BOOK AUTOMATICALLY
          FULL WIDTH
      ===================================================== */}

      <View style={styles.wideCard}>
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
      </View>

      {/* =====================================================
          ALL BOOK OPTIONS
          2 EQUAL COLUMNS
      ===================================================== */}

      <View style={styles.gridSection}>
        <View style={styles.grid}>
          {/* FIND WORKER */}

          <View style={styles.gridItem}>
            <BookCard
              {...bookCards[0]}
            />
          </View>

          {/* CHOOSE SERVICES */}

          <View style={styles.gridItem}>
            <BookCard
              {...bookCards[1]}
            />
          </View>

          {/* HELP ME FIX */}

          <View style={styles.gridItem}>
            <BookCard
              {...bookCards[2]}
            />
          </View>

          {/* FIX YOURSELF */}

          <View style={styles.gridItem}>
            <BookCard
              {...bookCards[3]}
            />
          </View>

          {/* BUY SPARE PARTS */}

          <View style={styles.gridItem}>
            <BookCard
              {...bookCards[4]}
            />
          </View>

          {/* FIND MATERIALS */}

          <View style={styles.gridItem}>
            <BookCard
              {...bookCards[5]}
            />
          </View>

          {/* GET WORKER BY CALL */}

          <View style={styles.gridItem}>
            <BookCard
              {...bookCards[6]}
            />
          </View>

          {/* =================================================
              TODAY'S GOOD DEALS
              SAME CARD SIZE AS EVERYTHING ELSE
          ================================================= */}

          <View style={styles.gridItem}>
            <BookCard
              title={
                deal?.title ??
                "Today's Good Deals"
              }
              description={
                deal?.description ??
                "Discover today's best promotions, discounts and featured offers."
              }
              icon="gift-outline"
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
    </View>
  );
}

/* ==============================================================
   STYLES
================================================================ */

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  wideCard: {
    width: "100%",
  },

  gridSection: {
    width: "100%",
    marginTop: 14,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },

  gridItem: {
    width: "48.5%",
  },
});