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
  LocationLanguageTicker,
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
   * Gets the authenticated customer's
   * real device location.
   *
   * The hook:
   *
   * - requests location permission
   * - gets GPS coordinates
   * - reverse-geocodes the coordinates
   * - saves latitude/longitude/geohash
   * - returns a readable address
   */

  const {
    address,
    loading: locationLoading,
  } = useCustomerLocation();

  /* ==========================================================
     LOCATION DISPLAY
  ========================================================== */

  /*
   * Never use a fake or hard-coded address.
   *
   * While GPS/reverse-geocoding is still loading,
   * keep the ticker empty.
   *
   * If the device cannot provide an address,
   * the ticker receives a safe fallback.
   */

  const currentLocation =
    address ??
    (locationLoading
      ? "Finding your current location..."
      : "Location unavailable");

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
      {/* ======================================================
          HEADER
      ====================================================== */}

      <HomeHeader />

      {/* ======================================================
          LOCATION LANGUAGE TICKER
      ====================================================== */}

      <LocationLanguageTicker
        location={
          currentLocation
        }
      />

      {/* ======================================================
          SEARCH
      ====================================================== */}

      <HomeSearch />

      {/* ======================================================
          HERO
      ====================================================== */}

      <HeroCarousel />

      {/* ======================================================
          CATEGORIES
      ====================================================== */}

      <HomeCategories />

      {/* ======================================================
          NEW ARRIVALS
      ====================================================== */}

      <NewArrivals
        products={products}
        loading={loading}
      />

      {/* ======================================================
          POPULAR SERVICES
      ====================================================== */}

      <PopularServices />

      {/* ======================================================
          CONTACT WORKERS
      ====================================================== */}

      <ContactWorkers />

      {/* ======================================================
          RECENTLY VIEWED
      ====================================================== */}

      <RecentlyViewed />

      {/* ======================================================
          EMERGENCY
      ====================================================== */}

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