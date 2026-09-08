import React, {
  useCallback,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import ProductSearch from "./ProductSearch";
import CategoryChips from "./CategoryChips";
import ProductBanner from "./ProductBanner";
import ProductTabs from "./ProductTabs";
import ProductList from "./ProductList";

/* ============================================================
   SCREEN
============================================================ */

export default function MyProductsScreen() {
  /* ==========================================================
     SEE ALL
  ========================================================== */

  const handleSeeAll =
    useCallback(() => {
      router.push(
        "/(worker)/products",
      );
    }, []);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen
      role="worker"
      contentContainerStyle={
        styles.screen
      }
    >
      {/* ======================================================
          SEARCH
      ====================================================== */}

      <ProductSearch />

      {/* ======================================================
          CATEGORIES
      ====================================================== */}

      <CategoryChips />

      {/* ======================================================
          BANNER
      ====================================================== */}

      <ProductBanner />

      {/* ======================================================
          TABS
      ====================================================== */}

      <ProductTabs />

      {/* ======================================================
          PRODUCTS HEADER
      ====================================================== */}

      <View
        style={
          styles.productsHeader
        }
      >
        <View
          style={
            styles.headerText
          }
        >
          <AppText
            variant="heading2"
            weight="bold"
            style={
              styles.title
            }
          >
            My Products
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.subtitle
            }
          >
            Manage your products
          </AppText>
        </View>

        <Pressable
          onPress={
            handleSeeAll
          }
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="See all products"
          accessibilityHint="Opens all products"
          style={({
            pressed,
          }) => [
            styles.seeAllButton,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppText
            variant="bodyMedium"
            weight="bold"
            style={
              styles.seeAllText
            }
          >
            See All
          </AppText>

          <AppIcon
            name="next"
            role="worker"
            size="xs"
            color={
              WorkerColors.primary
            }
          />
        </Pressable>
      </View>

      {/* ======================================================
          PRODUCTS
      ====================================================== */}

      <ProductList
        showSeeAll={
          false
        }
      />

      <View
        style={
          styles.bottomSpace
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
    /* ========================================================
       SCREEN
    ======================================================== */

    screen: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.xl,

      paddingBottom:
        FixxamTokens.spacing.sm,

      backgroundColor:
        Colors.background,
    },

    /* ========================================================
       PRODUCTS HEADER
    ======================================================== */

    productsHeader: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,
    },

    headerText: {
      flex: 1,

      minWidth: 0,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       SEE ALL
    ======================================================== */

    seeAllButton: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      paddingLeft:
        FixxamTokens.spacing.sm,

      paddingRight:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.md,
    },

    seeAllText: {
      color:
        WorkerColors.primary,
    },

    /* ========================================================
       BOTTOM
    ======================================================== */

    bottomSpace: {
      height:
        FixxamTokens.spacing.xxl,
    },

    /* ========================================================
       STATES
    ======================================================== */

    pressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },
  });