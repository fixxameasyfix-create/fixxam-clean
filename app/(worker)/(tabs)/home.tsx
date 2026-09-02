import React from "react";

import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  Header,
  WorkerStats,
  MyProducts,
} from "@/components/worker/home";

import WorkerQuickActions from "@/components/worker/home/WorkerQuickActions";

export default function WorkerHome() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      bounces
      alwaysBounceVertical
      keyboardShouldPersistTaps="handled"
    >
      {/* ==========================================
          HEADER
      ========================================== */}

      <Header
        notificationCount={3}
        onAvatarPress={() => {}}
        onNotifications={() => {}}
      />

      {/* ==========================================
          WORKER STATS
      ========================================== */}

      <WorkerStats />

      {/* ==========================================
          QUICK ACTIONS
      ========================================== */}

      <View style={styles.quickActionsWrapper}>
        <WorkerQuickActions />
      </View>

      {/* ==========================================
          MY PRODUCTS
      ========================================== */}

      <View style={styles.myProductsWrapper}>
        <MyProducts />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 31,
    paddingBottom: 150,
  },

  quickActionsWrapper: {
    marginTop: -25,
  },

  myProductsWrapper: {
    marginTop: -25,
  },
});