import React, {
  useDeferredValue,
  useMemo,
  useState,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  Stack,
} from "expo-router";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import ServicesHeader from "@/components/services/ServicesHeader";
import ServicesSearch from "@/components/services/ServicesSearch";
import MostBookedServices from "@/components/services/MostBookedServices";
import ServicesCategories from "@/components/services/ServicesCategories";
import ServicesStats from "@/components/services/ServicesStats";
import ServicesGrid from "@/components/services/ServicesGrid";
import ServicesLoading from "@/components/services/ServicesLoading";
import EmptyServices from "@/components/services/EmptyServices";

import useServices from "@/hooks/services/useServices";
import useCategories from "@/hooks/services/useCategories";
import usePopularServices from "@/hooks/services/usePopularServices";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   CONSTANTS
============================================================== */

const ALL_CATEGORY_ID =
  "all";

/* ==============================================================
   HELPERS
============================================================== */

function safeCount(
  value: unknown,
): number {
  const parsed =
    typeof value ===
    "number"
      ? value
      : Number(value);

  if (
    !Number.isFinite(
      parsed,
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    parsed,
  );
}

/* ==============================================================
   SCREEN
============================================================== */

export default function ServicesScreen() {
  /* ============================================================
     SEARCH
  ============================================================ */

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState(
      ALL_CATEGORY_ID,
    );

  /*
   * The input stays responsive while heavier
   * service filtering can use the deferred value.
   */
  const deferredSearch =
    useDeferredValue(
      search.trim(),
    );

  /* ============================================================
     ALL SERVICES
  ============================================================ */

  const {
    services,
    loading,
  } =
    useServices(
      deferredSearch,
      selectedCategory,
    );

  /* ============================================================
     CATEGORIES
  ============================================================ */

  const {
    categories,
  } =
    useCategories();

  /* ============================================================
     MOST BOOKED
     
     This remains independent from filtered services.
  ============================================================ */

  const {
    services:
      popularServices,

    loading:
      popularLoading,
  } =
    usePopularServices();

  /* ============================================================
     STATS
  ============================================================ */

  const totalServices =
    services.length;

  const totalBookings =
    useMemo(
      () =>
        services.reduce(
          (
            total,
            service,
          ) =>
            total +
            safeCount(
              service.bookingCount,
            ),
          0,
        ),
      [
        services,
      ],
    );

  /* ============================================================
     DERIVED UI
  ============================================================ */

  const hasSearch =
    search.trim().length >
    0;

  const isAllCategories =
    selectedCategory ===
    ALL_CATEGORY_ID;

  const showPopular =
    !hasSearch &&
    isAllCategories &&
    !popularLoading &&
    popularServices.length >
      0;

  const sectionTitle =
    hasSearch
      ? "Search results"
      : !isAllCategories
        ? "Services"
        : "All Services";

  const serviceCountLabel =
    `${totalServices} ${
      totalServices === 1
        ? "service"
        : "services"
    } available`;

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <>
      <Stack.Screen
        options={{
          headerShown:
            false,
        }}
      />

      <AppScreen
        role="customer"
        contentContainerStyle={
          styles.container
        }
      >
        {/* ======================================================
            HEADER
        ====================================================== */}

        <ServicesHeader />

        {/* ======================================================
            SEARCH
        ====================================================== */}

        <ServicesSearch
          value={
            search
          }
          onChangeText={
            setSearch
          }
        />

        {/* ======================================================
            CATEGORIES
        ====================================================== */}

        <View
          style={
            styles.categorySection
          }
        >
          <View
            style={
              styles.sectionHeader
            }
          >
            <AppText
              variant="heading3"
              weight="bold"
              style={
                styles.sectionTitle
              }
            >
              Categories
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.sectionSubtitle
              }
            >
              Browse services by category
            </AppText>
          </View>

          <ServicesCategories
            categories={
              categories
            }
            selected={
              selectedCategory
            }
            onSelect={
              setSelectedCategory
            }
          />
        </View>

        {/* ======================================================
            SERVICES
        ====================================================== */}

        {loading ? (
          <ServicesLoading />
        ) : (
          <>
            {/* ==================================================
                MOST BOOKED
            ================================================== */}

            {showPopular ? (
              <MostBookedServices
                services={
                  popularServices
                }
              />
            ) : null}

            {/* ==================================================
                ALL SERVICES
            ================================================== */}

            <View
              style={
                styles.servicesSection
              }
            >
              <View
                style={
                  styles.servicesHeader
                }
              >
                <AppText
                  variant="heading3"
                  weight="bold"
                  style={
                    styles.sectionTitle
                  }
                >
                  {sectionTitle}
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.sectionSubtitle
                  }
                >
                  {serviceCountLabel}
                </AppText>
              </View>

              {totalServices ===
              0 ? (
                <EmptyServices />
              ) : (
                <>
                  <ServicesGrid
                    services={
                      services
                    }
                  />

                  <ServicesStats
                    totalServices={
                      totalServices
                    }
                    totalBookings={
                      totalBookings
                    }
                  />
                </>
              )}
            </View>
          </>
        )}
      </AppScreen>
    </>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      flexGrow: 1,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.xxxl,

      backgroundColor:
        Colors.background,
    },

    categorySection: {
      marginTop:
        FixxamTokens.spacing.xs,
    },

    sectionHeader: {
      marginBottom:
        FixxamTokens.spacing.sm,
    },

    servicesHeader: {
      marginBottom:
        FixxamTokens.spacing.md,
    },

    sectionTitle: {
      color:
        Colors.textPrimary,
    },

    sectionSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textMuted,
    },

    servicesSection: {
      marginTop:
        FixxamTokens.spacing.xl,
    },
  });