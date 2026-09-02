import React from "react";

import {
  StyleSheet,
} from "react-native";

import {
  AppScreen,
} from "@/components/ui";

import useMarket from "@/hooks/market/useMarket";

import useEmergencyRotation from "@/hooks/customer/useEmergencyRotation";

import useCustomerLocation from "@/hooks/customer/useCustomerLocation";

import {
  HomeHeader,
  HomeSearch,
  HeroCarousel,
  HomeCategories,
  NewArrivals,
  PopularServices,
  ContactWorkers,
  RecentlyViewed,
  EmergencyCallModal,
} from "@/components/customer/home";

/* ============================================================
   CUSTOMER HOME
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
   * Gets customer's current location
   * and keeps users/{customerUid}
   * location data updated.
   *
   * Expected fields:
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
      contentContainerStyle={
        styles.container
      }
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <HomeHeader />

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
        products={
          products
        }
        loading={
          loading
        }
      />

      {/* ======================================================
          POPULAR SERVICES
      ====================================================== */}

      <PopularServices />

      {/* ======================================================
          CONTACT WORKERS
          
          Worker images are loaded inside
          ContactWorkers from:
          
          workerProfile.photoUrl
          
          in workerPublicProfiles.
      ====================================================== */}

      <ContactWorkers />

      {/* ======================================================
          RECENTLY VIEWED
      ====================================================== */}

      <RecentlyViewed />

      {/* ======================================================
          EMERGENCY CALL
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
      paddingHorizontal: 16,
      paddingTop: 35,
      paddingBottom: 24,
    },
  });