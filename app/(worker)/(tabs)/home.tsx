import React, {
  memo,
} from "react";

import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  Header,
  MyProducts,
  WorkerStats,
} from "@/components/worker/home";

import WorkerQuickActions from "@/components/worker/home/WorkerQuickActions";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   COMPONENT
============================================================ */

function WorkerHome() {
  return (
    <SafeAreaView
      edges={[
        "top",
      ]}
      style={
        styles.safeArea
      }
    >
      <ScrollView
        style={
          styles.container
        }
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        showsHorizontalScrollIndicator={
          false
        }
        bounces
        alwaysBounceVertical
        keyboardShouldPersistTaps="handled"
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <Header />

        {/* ====================================================
            WORKER STATS
        ==================================================== */}

        <View
          style={
            styles.section
          }
        >
          <WorkerStats />
        </View>

        {/* ====================================================
            QUICK ACTIONS
        ==================================================== */}

        <View
          style={
            styles.section
          }
        >
          <WorkerQuickActions />
        </View>

        {/* ====================================================
            MY PRODUCTS
        ==================================================== */}

        <View
          style={
            styles.section
          }
        >
          <MyProducts />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================================================
   MEMO
============================================================ */

WorkerHome.displayName =
  "WorkerHome";

export default memo(
  WorkerHome,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,

      backgroundColor:
        Colors.background,
    },

    container: {
      flex: 1,

      backgroundColor:
        Colors.background,
    },

    content: {
      flexGrow: 1,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.size.tabBarHeight +
        FixxamTokens.spacing.xxl,
    },

    section: {
      marginTop:
        FixxamTokens.spacing.lg,
    },
  });