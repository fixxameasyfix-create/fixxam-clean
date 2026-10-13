import {
  router,
} from "expo-router";

import React from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import MarketOverview from "@/components/customer/market/MarketOverview";
import MarketSummary from "@/components/customer/market/MarketSummary";

import useCustomerMarketCounts from "@/hooks/customer/useCustomerMarketCounts";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   SCREEN
============================================================ */

export default function CustomerMyMarketScreen() {
  const {
    counts,
    loading,
  } = useCustomerMarketCounts();

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
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={
          styles.header
        }
      >
        <Pressable
          onPress={() =>
            router.back()
          }
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({
            pressed,
          }) => [
            styles.backButton,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppIcon
            name="chevron-left"
            role="customer"
            size="md"
            color={
              Colors.textPrimary
            }
          />
        </Pressable>

        <View
          style={
            styles.headerText
          }
        >
          <AppText
            variant="heading3"
            weight="semibold"
          >
            My Market
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
          >
            Manage your market activity
          </AppText>
        </View>
      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      {loading ? (
        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="small"
            color={
              CustomerColors.primary
            }
          />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.content
          }
        >
          <MarketOverview
            total={
              counts.total
            }
            pending={
              counts.pending
            }
            active={
              counts.active
            }
            completed={
              counts.completed
            }
          />

          <MarketSummary
            total={
              counts.total
            }
            pending={
              counts.pending
            }
            active={
              counts.active
            }
            completed={
              counts.completed
            }
            cancelled={
              counts.cancelled
            }
          />
        </ScrollView>
      )}
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
      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderBottomWidth: 1,

      borderBottomColor:
        Colors.border,

      backgroundColor:
        Colors.background,
    },

    backButton: {
      width: 40,

      height: 40,

      alignItems: "center",

      justifyContent: "center",

      marginRight:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.md,
    },

    pressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    headerText: {
      flex: 1,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      gap:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    /* ========================================================
       LOADING
    ======================================================== */

    loadingContainer: {
      flex: 1,

      alignItems: "center",

      justifyContent: "center",
    },
  });