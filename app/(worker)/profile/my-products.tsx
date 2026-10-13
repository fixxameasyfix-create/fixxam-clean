import React from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import ProductPerformanceOverview from "@/components/worker/jobs/ProductPerformanceOverview";
import ProductPerformanceCard from "@/components/worker/jobs/ProductPerformanceCard";

import useWorkerProductPerformance from "@/hooks/worker/useWorkerProductPerformance";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   SCREEN
============================================================ */

export default function WorkerMyProductsScreen() {
  const {
    performance,
    loading,
    error,
  } =
    useWorkerProductPerformance();

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <SafeAreaView
        style={
          styles.safeArea
        }
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
            Loading product performance...
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
      style={
        styles.safeArea
      }
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
        style={
          styles.header
        }
      >
        <Pressable
          onPress={() =>
            router.back()
          }
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          style={({ pressed }) => [
            styles.backButton,

            pressed
              ? styles.backButtonPressed
              : null,
          ]}
        >
          <AppIcon
            name="back"
            role="worker"
            size="md"
            color={
              Colors.textPrimary
            }
          />
        </Pressable>

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
            My Products
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
          >
            Manage your product performance
          </AppText>
        </View>
      </View>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <ScrollView
        style={
          styles.scroll
        }
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* ===================================================
            ERROR
        =================================================== */}

        {error ? (
          <View
            style={
              styles.errorCard
            }
          >
            <AppText
              variant="bodyMedium"
              weight="semibold"
              style={
                styles.errorTitle
              }
            >
              Unable to load products
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.errorText
              }
            >
              {error}
            </AppText>
          </View>
        ) : (
          <>
            {/* ===============================================
                OVERVIEW
            =============================================== */}

            <ProductPerformanceOverview
              totalProducts={
                performance.totalProducts
              }
              activeProducts={
                performance.activeProducts
              }
              productsSold={
                performance.productsSold
              }
              totalViews={
                performance.totalViews
              }
            />

            {/* ===============================================
                PRODUCT PERFORMANCE
            =============================================== */}

            <View
              style={
                styles.section
              }
            >
              <ProductPerformanceCard
                totalProducts={
                  performance.totalProducts
                }
                activeProducts={
                  performance.activeProducts
                }
                outOfStockProducts={
                  performance.outOfStockProducts
                }
                productsSold={
                  performance.productsSold
                }
                totalViews={
                  performance.totalViews
                }
                featuredProducts={
                  performance.featuredProducts
                }
              />
            </View>
          </>
        )}
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

      flexDirection:
        "row",

      alignItems:
        "center",

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

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,
    },

    backButtonPressed: {
      opacity: 0.6,
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

      alignItems:
        "center",

      justifyContent:
        "center",

      padding:
        FixxamTokens.spacing.lg,
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.sm,

      textAlign:
        "center",
    },

    /* ========================================================
       ERROR
    ======================================================== */

    errorCard: {
      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    errorTitle: {
      color:
        Colors.textPrimary,
    },

    errorText: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },
  });