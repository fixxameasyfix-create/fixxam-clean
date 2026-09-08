import React from "react";

import {
  StyleSheet,
} from "react-native";

import {
  AppScreen,
} from "@/components/ui";

import {
  FixxamTokens,
} from "@/theme";

import useMarket from "@/hooks/market/useMarket";

import useEmergencyRotation from "@/hooks/customer/useEmergencyRotation";
import useCustomerLocation from "@/hooks/customer/useCustomerLocation";

import {
  ContactWorkers,
  EmergencyCallModal,
  HeroCarousel,
  HomeCategories,
  HomeHeader,
  HomeSearch,
  NewArrivals,
  PopularServices,
  RecentlyViewed,
} from "@/components/customer/home";

/* ============================================================
   COMPONENT
============================================================ */

export default function CustomerHome() {
  /* ==========================================================
     MARKET
  ========================================================== */

  const {
    loading,
    products,
  } = useMarket();

  /* ==========================================================
     EMERGENCY
  ========================================================== */

  const emergency =
    useEmergencyRotation();

  /* ==========================================================
     CUSTOMER LOCATION
  ========================================================== */

  /*
   * Keeps the authenticated customer's
   * location data updated.
   *
   * Expected user location fields:
   *
   * latitude
   * longitude
   * geohash
   */

  useCustomerLocation();

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen
      role="customer"
      padded={false}
      contentContainerStyle={
        styles.container
      }
    >
      {/* HEADER */}

      <HomeHeader />

      {/* SEARCH */}

      <HomeSearch />

      {/* HERO */}

      <HeroCarousel />

      {/* CATEGORIES */}

      <HomeCategories />

      {/* NEW ARRIVALS */}

      <NewArrivals
        products={products}
        loading={loading}
      />

      {/* POPULAR SERVICES */}

      <PopularServices />

      {/* CONTACT WORKERS */}

      <ContactWorkers />

      {/* RECENTLY VIEWED */}

      <RecentlyViewed />

      {/* EMERGENCY */}

      <EmergencyCallModal
        visible={
          emergency.visible
        }
        service={
          emergency.service
        }
        onClose={
          emergency.close
        }
      />
    </AppScreen>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.xxxl,

      paddingBottom:
        FixxamTokens.spacing.xl,
    },
  });