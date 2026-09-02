import React, {
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

export default function ServicesScreen() {
  const [
    search,
    setSearch,
  ] = useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("all");

  /* ==========================================================
     ALL SERVICES
  ========================================================== */

  const {
    services,
    loading,
  } = useServices(
    search,
    selectedCategory,
  );

  /* ==========================================================
     CATEGORIES
  ========================================================== */

  const {
    categories,
  } = useCategories();

  /* ==========================================================
     MOST BOOKED SERVICES
     
     IMPORTANT:
     This comes from services.completedCount,
     NOT from the filtered useServices() result.
  ========================================================== */

  const {
    services: popularServices,
    loading:
      popularLoading,
  } = usePopularServices();

  /* ==========================================================
     STATS
  ========================================================== */

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
            Number(
              service.bookingCount ??
                0,
            ),
          0,
        ),
      [services],
    );

  /* ==========================================================
     SHOW MOST BOOKED
     
     Only show it when the customer is
     browsing the main services page.
  ========================================================== */

  const showPopular =
    search.trim().length === 0 &&
    selectedCategory === "all" &&
    !popularLoading &&
    popularServices.length > 0;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <AppScreen
        contentContainerStyle={
          styles.container
        }
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <ServicesHeader />

        {/* ==================================================
            SEARCH
        ================================================== */}

        <ServicesSearch
          value={search}
          onChangeText={
            setSearch
          }
        />

        {/* ==================================================
            CATEGORIES
        ================================================== */}

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
            <View>
              <AppText
                weight="bold"
                style={
                  styles.sectionTitle
                }
              >
                Categories
              </AppText>

              <AppText
                style={
                  styles.sectionSubtitle
                }
              >
                Browse services by category
              </AppText>
            </View>
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

        {/* ==================================================
            SERVICES LOADING
        ================================================== */}

        {loading ? (
          <ServicesLoading />
        ) : (
          <>
            {/* ==============================================
                MOST BOOKED
            ============================================== */}

            {showPopular && (
              <MostBookedServices
                services={
                  popularServices
                }
              />
            )}

            {/* ==============================================
                ALL SERVICES
            ============================================== */}

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
                <View>
                  <AppText
                    weight="bold"
                    style={
                      styles.sectionTitle
                    }
                  >
                    {search.trim()
                      ? "Search results"
                      : selectedCategory !==
                          "all"
                        ? "Services"
                        : "All Services"}
                  </AppText>

                  <AppText
                    style={
                      styles.sectionSubtitle
                    }
                  >
                    {totalServices}{" "}
                    {totalServices ===
                    1
                      ? "service"
                      : "services"}{" "}
                    available
                  </AppText>
                </View>
              </View>

              {services.length ===
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

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor:
        "#F8FAFC",
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 32,
    },

    categorySection: {
      marginTop: 4,
    },

    sectionHeader: {
      marginBottom: 8,
    },

    servicesHeader: {
      marginBottom: 12,
    },

    sectionTitle: {
      fontSize: 19,
      lineHeight: 24,
      color: "#0F172A",
    },

    sectionSubtitle: {
      marginTop: 2,
      fontSize: 12,
      lineHeight: 17,
      color: "#94A3B8",
    },

    servicesSection: {
      marginTop: 20,
    },
  });