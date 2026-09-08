import React, {
  useCallback,
} from "react";

import {
  ActivityIndicator,
  FlatList,
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

import CategoryCard from "@/components/categories/CategoryCard";

import useRecommendedServices from "@/hooks/services/useRecommendedServices";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   COMPONENT
============================================================ */

export default function RecommendedDealsScreen() {
  const {
    services,
    loading,
    refreshing,
    error,
    onRefresh,
  } =
    useRecommendedServices();

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const handleBack =
    useCallback(() => {
      router.back();
    }, []);

  const handleServicePress =
    useCallback(
      (
        serviceId: string,
      ) => {
        router.push({
          pathname:
            "/(customer)/details/workers/[id]",

          params: {
            id: serviceId,
          },
        });
      },
      [],
    );

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <AppScreen
        role="customer"
        style={styles.screen}
      >
        <View
          style={styles.center}
        >
          <ActivityIndicator
            size="large"
            color={
              CustomerColors.primary
            }
          />

          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.loadingText
            }
          >
            Loading recommended services...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen
      role="customer"
      style={styles.screen}
    >
      {/* ====================================================
          HEADER
      ==================================================== */}

      <View
        style={styles.header}
      >
        <Pressable
          onPress={
            handleBack
          }
          hitSlop={8}
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
            variant="heading2"
            weight="bold"
            style={styles.title}
          >
            Recommended Deals
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.subtitle
            }
          >
            Discover services selected for today.
          </AppText>
        </View>
      </View>

      {/* ====================================================
          DAILY BANNER
      ==================================================== */}

      <View
        style={
          styles.dailyBanner
        }
      >
        <View
          style={
            styles.dailyIcon
          }
        >
          <AppIcon
            name="star"
            role="customer"
            size="md"
            color={
              CustomerColors.primary
            }
          />
        </View>

        <View
          style={
            styles.dailyContent
          }
        >
          <AppText
            variant="bodyMedium"
            weight="bold"
            numberOfLines={1}
            style={
              styles.dailyTitle
            }
          >
            Today's Recommended Services
          </AppText>

          <AppText
            variant="caption"
            numberOfLines={2}
            style={
              styles.dailyText
            }
          >
            We selected up to 10 services from Fixxam for today.
          </AppText>
        </View>
      </View>

      {/* ====================================================
          ERROR
      ==================================================== */}

      {error ? (
        <View
          style={styles.errorCard}
        >
          <AppIcon
            name="error"
            size="sm"
            color={
              Colors.error
            }
          />

          <AppText
            variant="body"
            numberOfLines={3}
            style={
              styles.errorText
            }
          >
            {error}
          </AppText>
        </View>
      ) : null}

      {/* ====================================================
          SERVICES
      ==================================================== */}

      <FlatList
        data={services}
        keyExtractor={(
          item,
        ) => item.id}
        renderItem={({
          item,
        }) => (
          <CategoryCard
            icon={item.icon}
            iconColor={
              item.color
            }
            backgroundColor={
              item.backgroundColor
            }
            title={item.name}
            onPress={() =>
              handleServicePress(
                item.id,
              )
            }
          />
        )}
        refreshing={
          refreshing
        }
        onRefresh={
          onRefresh
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={[
          styles.content,

          services.length === 0
            ? styles.emptyContent
            : null,
        ]}
        ListEmptyComponent={
          <View
            style={styles.empty}
          >
            <View
              style={
                styles.emptyIcon
              }
            >
              <AppIcon
                name="star"
                role="customer"
                size="xl"
                color={
                  CustomerColors.primary
                }
              />
            </View>

            <AppText
              variant="heading3"
              weight="bold"
              center
              style={
                styles.emptyTitle
              }
            >
              No Recommended Services
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              center
              style={
                styles.emptyText
              }
            >
              There are no services available to recommend right now.
            </AppText>

            <Pressable
              onPress={
                onRefresh
              }
              accessibilityRole="button"
              accessibilityLabel="Try loading recommended services again"
              style={({
                pressed,
              }) => [
                styles.retryButton,

                pressed
                  ? styles.pressed
                  : null,
              ]}
            >
              <AppIcon
                name="refresh"
                role="customer"
                size="xs"
                color={
                  Colors.textInverse
                }
              />

              <AppText
                variant="bodyMedium"
                weight="bold"
                style={
                  styles.retryText
                }
              >
                TRY AGAIN
              </AppText>
            </Pressable>
          </View>
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
      backgroundColor:
        Colors.background,
    },

    /* ========================================================
       LOADING
    ======================================================== */

    center: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems: "center",

      justifyContent:
        "center",
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.lg,

      flexDirection: "row",

      alignItems:
        "flex-start",
    },

    backButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    headerText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 21,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       DAILY BANNER
    ======================================================== */

    dailyBanner: {
      marginHorizontal:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    dailyIcon: {
      width:
        FixxamTokens.size
          .iconBox,

      height:
        FixxamTokens.size
          .iconBox,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    dailyContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    dailyTitle: {
      color:
        Colors.textPrimary,
    },

    dailyText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       ERROR
    ======================================================== */

    errorCard: {
      marginHorizontal:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems:
        "flex-start",

      borderWidth: 1,

      borderColor:
        Colors.error,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.errorSoft,
    },

    errorText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        Colors.error,
    },

    /* ========================================================
       LIST
    ======================================================== */

    content: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.xxxl,

      gap:
        FixxamTokens.spacing.md,
    },

    emptyContent: {
      flexGrow: 1,
    },

    /* ========================================================
       EMPTY STATE
    ======================================================== */

    empty: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingVertical:
        FixxamTokens.spacing.xxl,

      alignItems: "center",

      justifyContent:
        "center",
    },

    emptyIcon: {
      width: 76,

      height: 76,

      marginBottom:
        FixxamTokens.spacing.lg,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    emptyTitle: {
      color:
        Colors.textPrimary,
    },

    emptyText: {
      maxWidth: 300,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 21,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       RETRY
    ======================================================== */

    retryButton: {
      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

      marginTop:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    retryText: {
      color:
        Colors.textInverse,
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