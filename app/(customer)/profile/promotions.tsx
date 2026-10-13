import React, {
  useCallback,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
  type ListRenderItem,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  router,
} from "expo-router";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import useCustomerPromotions, {
  type CustomerPromotion,
} from "@/hooks/customer/useCustomerPromotions";

import CustomerPromotionCard from "@/components/customer/promotions/PromotionProductCard";

/* ============================================================
   SCREEN
============================================================ */

export default function CustomerPromotionsScreen() {
  const {
    promotions,
    loading,
    refreshing,
    error,
    refresh,
  } =
    useCustomerPromotions();

  /* ==========================================================
     PRODUCT
  ========================================================== */

  const handlePromotionPress =
    useCallback(
      (
        promotion:
          CustomerPromotion,
      ) => {
        const productId =
          promotion.product.id
            ?.trim();

        if (!productId) {
          return;
        }

        router.push({
          pathname:
            "/(customer)/product/[id]",

          params: {
            id:
              productId,
          },
        });
      },
      [],
    );

  /* ==========================================================
     RENDER ITEM
  ========================================================== */

  const renderItem =
    useCallback<
      ListRenderItem<CustomerPromotion>
    >(
      ({
        item,
      }) => (
        <CustomerPromotionCard
          promotion={
            item
          }
          onPress={
            handlePromotionPress
          }
        />
      ),
      [
        handlePromotionPress,
      ],
    );

  const keyExtractor =
    useCallback(
      (
        item:
          CustomerPromotion,
      ) =>
        item.id,
      [],
    );

  /* ==========================================================
     HEADER
  ========================================================== */

  const renderHeader =
    useCallback(
      () => (
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
            hitSlop={
              6
            }
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
              size="sm"
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
              variant="heading2"
              weight="bold"
              style={
                styles.title
              }
            >
              Promotions
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.subtitle
              }
            >
              Discover products currently on discount.
            </AppText>
          </View>
        </View>
      ),
      [],
    );

  /* ==========================================================
     EMPTY
  ========================================================== */

  const renderEmpty =
    useCallback(() => {
      if (loading) {
        return (
          <View
            style={
              styles.state
            }
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
                styles.stateText
              }
            >
              Loading promotions...
            </AppText>
          </View>
        );
      }

      if (error) {
        return (
          <View
            style={
              styles.state
            }
          >
            <View
              style={
                styles.errorIcon
              }
            >
              <AppIcon
                name="error"
                role="customer"
                size="lg"
                state="error"
              />
            </View>

            <AppText
              variant="bodyLarge"
              weight="bold"
              center
              style={
                styles.stateTitle
              }
            >
              Unable to load promotions
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              center
              style={
                styles.stateDescription
              }
            >
              {error}
            </AppText>

            <Pressable
              onPress={() => {
                void refresh();
              }}
              accessibilityRole="button"
              accessibilityLabel="Try again"
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
                Try Again
              </AppText>
            </Pressable>
          </View>
        );
      }

      return (
        <View
          style={
            styles.state
          }
        >
          <View
            style={
              styles.emptyIcon
            }
          >
            <AppIcon
              name="package"
              role="customer"
              size="lg"
              state="muted"
            />
          </View>

          <AppText
            variant="bodyLarge"
            weight="bold"
            center
            style={
              styles.stateTitle
            }
          >
            No active promotions
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.stateDescription
            }
          >
            Products with active discounts will appear here.
          </AppText>
        </View>
      );
    }, [
      error,
      loading,
      refresh,
    ]);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <SafeAreaView
      style={
        styles.screen
      }
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      <FlatList
        data={
          promotions
        }
        renderItem={
          renderItem
        }
        keyExtractor={
          keyExtractor
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.list,

          promotions.length ===
            0
            ? styles.emptyList
            : null,
        ]}
        ItemSeparatorComponent={
          Separator
        }
        ListHeaderComponent={
          renderHeader
        }
        ListEmptyComponent={
          renderEmpty
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={() => {
              void refresh();
            }}
            tintColor={
              CustomerColors.primary
            }
          />
        }
        initialNumToRender={
          8
        }
        maxToRenderPerBatch={
          10
        }
        windowSize={
          5
        }
      />
    </SafeAreaView>
  );
}

/* ============================================================
   SEPARATOR
============================================================ */

function Separator() {
  return (
    <View
      style={
        styles.separator
      }
    />
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    screen: {
      flex:
        1,

      backgroundColor:
        Colors.background,
    },

    list: {
      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    emptyList: {
      flexGrow:
        1,
    },

    header: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      paddingTop:
        FixxamTokens.spacing.xs,

      paddingBottom:
        FixxamTokens.spacing.lg,
    },

    backButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.sm,

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    headerContent: {
      flex:
        1,

      minWidth:
        0,

      paddingTop:
        FixxamTokens.spacing.xxs,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight:
        20,
    },

    separator: {
      height:
        FixxamTokens.spacing.sm,
    },

    state: {
      flex:
        1,

      minHeight:
        420,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,
    },

    stateText: {
      marginTop:
        FixxamTokens.spacing.md,
    },

    stateTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    stateDescription: {
      maxWidth:
        320,

      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight:
        21,
    },

    emptyIcon: {
      width:
        64,

      height:
        64,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.disabledBackground,
    },

    errorIcon: {
      width:
        64,

      height:
        64,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.errorSoft,
    },

    retryButton: {
      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

      marginTop:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "center",

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