import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import JobPerformanceOverview from "@/components/worker/jobs/JobPerformanceOverview";
import JobSuccessCard from "@/components/worker/jobs/JobSuccessCard";

import useWorkerJobPerformance from "@/hooks/worker/useWorkerJobPerformance";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   SCREEN
============================================================ */

export default function WorkerMyJobsScreen() {
  const {
    performance,
    loading,
  } = useWorkerJobPerformance();

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={[
          "top",
          "left",
          "right",
        ]}
      >
        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="small"
            color={
              WorkerColors.primary
            }
          />

          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.loadingText
            }
          >
            Loading job performance...
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  /* ==========================================================
     SCREEN
  ========================================================== */

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <View
        style={styles.header}
      >
        <View
          style={
            styles.backButton
          }
          onTouchEnd={() =>
            router.back()
          }
        >
          <AppIcon
            name="back"
            role="worker"
            size="md"
            color={
              Colors.textPrimary
            }
          />
        </View>

        <View
          style={
            styles.headerContent
          }
        >
          <AppText
            variant="heading3"
            weight="semibold"
            style={
              styles.headerTitle
            }
          >
            My Jobs
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
          >
            Your work performance
          </AppText>
        </View>
      </View>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* ===================================================
            PERFORMANCE OVERVIEW
        =================================================== */}

        <JobPerformanceOverview
          rating={
            performance.rating
          }
          jobsDone={
            performance.jobsDone
          }
          reviews={
            performance.reviews
          }
          jobSuccess={
            performance.jobSuccess
          }
        />

        {/* ===================================================
            PERFORMANCE DETAILS
        =================================================== */}

        <View
          style={
            styles.section
          }
        >
          <JobSuccessCard
            jobSuccess={
              performance.jobSuccess
            }
            rating={
              performance.rating
            }
            completedJobs={
              performance.jobsDone
            }
            reviews={
              performance.reviews
            }
          />
        </View>

        {/*
          RecentPerformanceCard ba mu haɗa shi yanzu ba.

          Dalili:
          Muna buƙatar tabbatar da real completion/review
          timestamp fields kafin mu lissafa Last 30 Days.

          Ba za mu nuna fake data ba.
        */}
      </ScrollView>
    </SafeAreaView>
  );
}

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

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      minHeight: 64,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,

      backgroundColor:
        Colors.surface,
    },

    backButton: {
      width: 44,

      height: 44,

      alignItems: "center",

      justifyContent:
        "center",
    },

    headerContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.xs,
    },

    headerTitle: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    scroll: {
      flex: 1,
    },

    content: {
      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    section: {
      marginTop:
        FixxamTokens.spacing.lg,
    },

    /* ========================================================
       LOADING
    ======================================================== */

    loadingContainer: {
      flex: 1,

      alignItems: "center",

      justifyContent:
        "center",

      padding:
        FixxamTokens.spacing.lg,
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.sm,

      textAlign: "center",
    },
  });