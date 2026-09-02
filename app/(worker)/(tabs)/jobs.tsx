import React from "react";
import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { router } from "expo-router";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import DashboardCard from "@/components/common/dashboard/DashboardCard";
import DashboardWideCard from "@/components/common/dashboard/DashboardWideCard";

import usePendingBookingsCount from "@/hooks/booking/usePendingBookingsCount";

export default function WorkerJobsScreen() {
  const pendingCount =
    usePendingBookingsCount();

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <AppText
          weight="bold"
          style={styles.title}
        >
          Jobs
        </AppText>

        <AppText style={styles.subtitle}>
          Manage jobs and grow your business.
        </AppText>

        <View style={styles.row}>
          <DashboardCard
            title="Helping Box"
            description="Get useful tips for every job."
            icon="briefcase"
            iconColor="#FF6B00"
            iconBackground="#FFF7ED"
           onPress={() =>
  router.push("/(worker)/jobs/helping-box")
}
          />

          <View style={styles.gap} />

        <DashboardCard
  title="Build Your Profile"
  description="Manage your experience, skills and work profile."
  icon="person"
  iconColor="#FF6B00"
  iconBackground="#FFF7ED"
  onPress={() =>
    router.push("/(worker)/jobs/build-profile")
  }
/>
        </View>

        <View style={styles.row}>
          <DashboardCard
            badge={
              pendingCount > 0
                ? String(pendingCount)
                : undefined
            }
            title="New Job is Incoming"
            description="View new customer requests."
            icon="notifications"
            iconColor="#FF6B00"
            iconBackground="#FFF7ED"
            onPress={() =>
              router.push("/(worker)/new-job")
            }
          />

          <View style={styles.gap} />

         <DashboardCard
  title="Specialise Your Market"
  description="Grow your business."
  icon="locate"
  iconColor="#FF6B00"
  iconBackground="#FFF7ED"
  onPress={() =>
    router.push("/(worker)/specialise")
  }
/>
        </View>

        <View style={styles.row}>
          <DashboardCard
            title="Go to Market"
            description="Sell your materials."
            icon="cart"
            iconColor="#FF6B00"
            iconBackground="#FFF7ED"
            onPress={() =>
              router.push("/(worker)/(tabs)/my-products")
            }
          />

          <View style={styles.gap} />

          <DashboardCard
            title="Today's Weather"
            description="Check today's weather."
            icon="partly-sunny"
            iconColor="#FF6B00"
            iconBackground="#FFF7ED"
            onPress={() => {}}
          />
        </View>

        <DashboardWideCard
          title="Today's Date"
          description={new Date().toDateString()}
          icon="calendar"
          iconColor="#FF6B00"
          iconBackground="#FFF7ED"
          onPress={() => {}}
        />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: "#F8FAFC",
  },

  title: {
    fontSize: 30,
    marginBottom: 6,
  },

  subtitle: {
    color: "#64748B",
    marginBottom: 20,
  },

  row: {
    flexDirection: "row",
    marginBottom: 16,
  },

  gap: {
    width: 16,
  },
});