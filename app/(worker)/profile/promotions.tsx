import {
  router,
} from "expo-router";

import React, {
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
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

import PromotionCard from "@/components/worker/promotions/PromotionCard";

import useWorkerPromotions, {
  type WorkerPromotion,
} from "@/hooks/worker/useWorkerPromotions";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type PromotionFilter =
  | "all"
  | WorkerPromotion["status"];

type FilterItem = {
  key: PromotionFilter;
  label: string;
};

/* ============================================================
   CONFIG
============================================================ */

const FILTERS: FilterItem[] = [
  {
    key: "all",
    label: "All",
  },
  {
    key: "active",
    label: "Active",
  },
  {
    key: "expired",
    label: "Expired",
  },
  {
    key: "disabled",
    label: "Disabled",
  },
];

/* ============================================================
   SCREEN
============================================================ */

export default function WorkerPromotionsScreen() {
  const {
    promotions,
    loading,
    error,
    refresh,
  } = useWorkerPromotions();

  const [
    activeFilter,
    setActiveFilter,
  ] =
    useState<PromotionFilter>(
      "all",
    );

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  /* ==========================================================
     FILTER
  ========================================================== */

  const filteredPromotions =
    useMemo(() => {
      if (
        activeFilter === "all"
      ) {
        return promotions;
      }

      return promotions.filter(
        (promotion) =>
          promotion.status ===
          activeFilter,
      );
    }, [
      activeFilter,
      promotions,
    ]);

  /* ==========================================================
     REFRESH
  ========================================================== */

  const handleRefresh =
    async () => {
      if (refreshing) {
        return;
      }

      setRefreshing(true);

      try {
        await refresh();
      } finally {
        setRefreshing(false);
      }
    };

 /* ==========================================================
   EDIT PROMOTION PRODUCT
========================================================== */

const handleEditPromotion =
  (
    promotion:
      WorkerPromotion,
  ) => {
    if (
      promotion.type !==
      "product"
    ) {
      return;
    }

    const productId =
      typeof promotion.itemId ===
      "string"
        ? promotion.itemId.trim()
        : "";

    if (!productId) {
      return;
    }

    router.push({
      pathname:
        "/(worker)/products/edit/[id]",

      params: {
        id: productId,
      },
    } as never);
  };

  /* ==========================================================
     EMPTY MESSAGE
  ========================================================== */

  const emptyMessage =
    activeFilter === "all"
      ? "You have no promotions yet."
      : `No ${activeFilter} promotions.`;

  /* ==========================================================
     UI
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
            styles.headerText
          }
        >
          <AppText
            variant="heading3"
            weight="semibold"
          >
            Promotions
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
          >
            Manage your discounts
          </AppText>
        </View>
      </View>

      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading &&
      promotions.length === 0 ? (
        <View
          style={
            styles.center
          }
        >
          <ActivityIndicator
            size="small"
            color={
              WorkerColors.primary
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
          refreshControl={
            <RefreshControl
              refreshing={
                refreshing
              }
              onRefresh={
                handleRefresh
              }
              tintColor={
                WorkerColors.primary
              }
            />
          }
        >
          {/* ==================================================
              FILTERS
          ================================================== */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.filters
            }
          >
            {FILTERS.map(
              (filter) => {
                const selected =
                  activeFilter ===
                  filter.key;

                return (
                  <Pressable
                    key={
                      filter.key
                    }
                    onPress={() =>
                      setActiveFilter(
                        filter.key,
                      )
                    }
                    accessibilityRole="button"
                    accessibilityState={{
                      selected,
                    }}
                    style={({
                      pressed,
                    }) => [
                      styles.filter,

                      selected
                        ? styles.filterSelected
                        : null,

                      pressed
                        ? styles.pressed
                        : null,
                    ]}
                  >
                    <AppText
                      variant="caption"
                      weight="semibold"
                      style={
                        selected
                          ? styles.filterTextSelected
                          : styles.filterText
                      }
                    >
                      {
                        filter.label
                      }
                    </AppText>
                  </Pressable>
                );
              },
            )}
          </ScrollView>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error ? (
            <View
              style={
                styles.messageCard
              }
            >
              <AppIcon
                name="warning"
                role="worker"
                size="md"
                color={
                  Colors.textSecondary
                }
              />

              <AppText
                variant="bodyMedium"
                weight="semibold"
              >
                Unable to load promotions
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.messageText
                }
              >
                Check your connection and try again.
              </AppText>

              <Pressable
                onPress={() =>
                  void handleRefresh()
                }
                style={({
                  pressed,
                }) => [
                  styles.retryButton,

                  pressed
                    ? styles.pressed
                    : null,
                ]}
              >
                <AppText
                  variant="caption"
                  weight="semibold"
                  style={
                    styles.retryText
                  }
                >
                  Try Again
                </AppText>
              </Pressable>
            </View>
          ) : filteredPromotions.length ===
            0 ? (
            /* ================================================
               EMPTY
            ================================================ */

            <View
              style={
                styles.messageCard
              }
            >
              <View
                style={
                  styles.emptyIcon
                }
              >
                <AppIcon
                  name="sparkles"
                  role="worker"
                  size="md"
                  color={
                    WorkerColors.primary
                  }
                />
              </View>

              <AppText
                variant="bodyMedium"
                weight="semibold"
              >
                No promotions
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.messageText
                }
              >
                {
                  emptyMessage
                }
              </AppText>
            </View>
          ) : (
            /* ================================================
               PROMOTIONS
            ================================================ */

            <View
              style={
                styles.list
              }
            >
              {filteredPromotions.map(
                (
                  promotion,
                ) => (
                  <PromotionCard
                    key={
                      promotion.id
                    }
                    promotion={
                      promotion
                    }
                    onPress={() =>
                      handleEditPromotion(
                        promotion,
                      )
                    }
                  />
                ),
              )}
            </View>
          )}
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
      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderBottomWidth:
        1,

      borderBottomColor:
        Colors.border,

      backgroundColor:
        Colors.background,
    },

    backButton: {
      width: 40,

      height: 40,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.md,
    },

    headerText: {
      flex: 1,
    },

    pressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    /* ========================================================
       FILTERS
    ======================================================== */

    filters: {
      gap:
        FixxamTokens.spacing.xs,

      paddingBottom:
        FixxamTokens.spacing.md,
    },

    filter: {
      minHeight: 36,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    filterSelected: {
      borderColor:
        WorkerColors.primary,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    filterText: {
      color:
        Colors.textSecondary,
    },

    filterTextSelected: {
      color:
        WorkerColors.primary,
    },

    /* ========================================================
       LIST
    ======================================================== */

    list: {
      gap:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       STATES
    ======================================================== */

    center: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    messageCard: {
      minHeight: 190,

      alignItems:
        "center",

      justifyContent:
        "center",

      padding:
        FixxamTokens.spacing.lg,

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    emptyIcon: {
      width: 44,

      height: 44,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginBottom:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    messageText: {
      marginTop:
        FixxamTokens.spacing.xs,

      textAlign:
        "center",
    },

    retryButton: {
      marginTop:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    retryText: {
      color:
        WorkerColors.primary,
    },
  });