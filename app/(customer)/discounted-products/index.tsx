import React, {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { router } from "expo-router";

import {
  AppText,
} from "@/components/ui";

import ProductGridCard from "@/components/customer/home/ProductGridCard";

import useCurrentLocation from "@/hooks/location/useCurrentLocation";

import {
  getNearbyDiscountedProducts,
  type DiscountedProduct,
} from "@/firebase/queries/discountedProducts";

const MAX_DISCOUNTED_PRODUCTS = 20;

export default function DiscountedProductsScreen() {
  const [products, setProducts] = useState<
    DiscountedProduct[]
  >([]);

  const [claimed, setClaimed] =
    useState(false);

  const [claiming, setClaiming] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const {
    location,
    loading: locationLoading,
    error: locationError,
    refresh,
  } = useCurrentLocation();

  /*
   * ==========================================================
   * CLAIM DISCOUNT
   * ==========================================================
   */

  const handleClaimDiscount =
    useCallback(async () => {
      if (claiming) {
        return;
      }

      setError(null);
      setClaiming(true);

      try {
        let customerLocation =
          location;

        /*
         * ------------------------------------------------------
         * LOCATION
         * ------------------------------------------------------
         */

        if (!customerLocation) {
          await refresh();

          setError(
            locationError ??
              "Unable to get your current location. Please enable location and try again.",
          );

          return;
        }

        /*
         * ------------------------------------------------------
         * GET DISCOUNTED PRODUCTS
         * ------------------------------------------------------
         */

        const nearbyDeals =
          await getNearbyDiscountedProducts({
            latitude:
              customerLocation.latitude,

            longitude:
              customerLocation.longitude,
          });

        /*
         * ------------------------------------------------------
         * ONLY DISCOUNTED PRODUCTS
         *
         * Extra client-side protection:
         * do not allow products without a valid
         * discounted price into this screen.
         * ------------------------------------------------------
         */

        const validDiscountedProducts =
          nearbyDeals.filter(
            (item) => {
              const originalPrice =
                Number(
                  item.product.price,
                );

              const discountedPrice =
                Number(
                  item.deal
                    ?.discountedPrice,
                );

              const discountPercentage =
                Number(
                  item.deal
                    ?.discountPercentage,
                );

              return (
                Number.isFinite(
                  originalPrice,
                ) &&
                originalPrice > 0 &&
                Number.isFinite(
                  discountedPrice,
                ) &&
                discountedPrice > 0 &&
                discountedPrice <
                  originalPrice &&
                Number.isFinite(
                  discountPercentage,
                ) &&
                discountPercentage > 0 &&
                discountPercentage < 100
              );
            },
          );

        /*
         * ------------------------------------------------------
         * MAXIMUM 20
         * ------------------------------------------------------
         */

        setProducts(
          validDiscountedProducts.slice(
            0,
            MAX_DISCOUNTED_PRODUCTS,
          ),
        );

        setClaimed(true);
      } catch (err) {
        console.error(
          "Failed to claim discounted products:",
          err,
        );

        setProducts([]);

        setError(
          "Unable to find discounted products near you. Please try again.",
        );
      } finally {
        setClaiming(false);
      }
    }, [
      claiming,
      location,
      locationError,
      refresh,
    ]);

  /*
   * ==========================================================
   * RETRY
   * ==========================================================
   */

  const handleRetry =
    useCallback(() => {
      void handleClaimDiscount();
    }, [
      handleClaimDiscount,
    ]);

  /*
   * ==========================================================
   * HEADER
   * ==========================================================
   */

  const renderHeader =
    useCallback(
      () => (
        <View style={styles.header}>
          <Pressable
            onPress={() =>
              router.back()
            }
            hitSlop={10}
            style={
              styles.backButton
            }
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <AppText
              style={
                styles.backIcon
              }
            >
              ‹
            </AppText>
          </Pressable>

          <View
            style={
              styles.headerText
            }
          >
            <AppText
              weight="bold"
              style={styles.title}
            >
              Discounted Products
            </AppText>

            <AppText
              style={
                styles.subtitle
              }
            >
              {claimed
                ? `${products.length} discounted products closest to you.`
                : "Find discounted products from workers near you."}
            </AppText>
          </View>
        </View>
      ),
      [
        claimed,
        products.length,
      ],
    );

  /*
   * ==========================================================
   * CLAIM STATE
   * ==========================================================
   */

  const renderClaimState =
    useCallback(
      () => (
        <View
          style={
            styles.claimContainer
          }
        >
          <View
            style={
              styles.tagCircle
            }
          >
            <AppText
              style={
                styles.tagIcon
              }
            >
              %
            </AppText>
          </View>

          <AppText
            weight="bold"
            style={
              styles.claimTitle
            }
          >
            Claim Your Discount
          </AppText>

          <AppText
            style={
              styles.claimDescription
            }
          >
            Get access to discounted
            products available from
            workers near your current
            location.
          </AppText>

          {error ? (
            <AppText
              style={
                styles.errorText
              }
            >
              {error}
            </AppText>
          ) : null}

          <Pressable
            onPress={
              handleClaimDiscount
            }
            disabled={
              claiming ||
              locationLoading
            }
            style={({
              pressed,
            }) => [
              styles.claimButton,

              pressed &&
                !claiming &&
                styles.claimButtonPressed,

              (claiming ||
                locationLoading) &&
                styles.claimButtonDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Claim discount"
          >
            {claiming ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <AppText
                  weight="bold"
                  style={
                    styles.claimButtonText
                  }
                >
                  Finding Deals...
                </AppText>
              </>
            ) : (
              <AppText
                weight="bold"
                style={
                  styles.claimButtonText
                }
              >
                Claim Discount
              </AppText>
            )}
          </Pressable>
        </View>
      ),
      [
        claiming,
        error,
        handleClaimDiscount,
        locationLoading,
      ],
    );

  /*
   * ==========================================================
   * EMPTY STATE
   * ==========================================================
   */

  const renderEmpty =
    useCallback(() => {
      /*
       * Before claiming.
       */

      if (!claimed) {
        return renderClaimState();
      }

      /*
       * Loading.
       */

      if (claiming) {
        return (
          <View
            style={
              styles.center
            }
          >
            <ActivityIndicator
              size="large"
              color="#2563EB"
            />

            <AppText
              weight="semibold"
              style={
                styles.loadingTitle
              }
            >
              Finding nearby discounts...
            </AppText>

            <AppText
              style={
                styles.loadingText
              }
            >
              We're checking products
              closest to your location.
            </AppText>
          </View>
        );
      }

      /*
       * Error.
       */

      if (error) {
        return (
          <View
            style={
              styles.center
            }
          >
            <AppText
              weight="bold"
              style={
                styles.emptyTitle
              }
            >
              Something went wrong
            </AppText>

            <AppText
              style={
                styles.emptyText
              }
            >
              {error}
            </AppText>

            <Pressable
              onPress={
                handleRetry
              }
              style={
                styles.retryButton
              }
              accessibilityRole="button"
              accessibilityLabel="Try again"
            >
              <AppText
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

      /*
       * No discounted products.
       */

      return (
        <View
          style={
            styles.center
          }
        >
          <AppText
            style={
              styles.emptyIcon
            }
          >
            🏷️
          </AppText>

          <AppText
            weight="bold"
            style={
              styles.emptyTitle
            }
          >
            No discounted products nearby
          </AppText>

          <AppText
            style={
              styles.emptyText
            }
          >
            There are currently no
            discounted products
            available near your
            location.
          </AppText>

          <Pressable
            onPress={
              handleRetry
            }
            style={
              styles.retryButton
            }
            accessibilityRole="button"
            accessibilityLabel="Refresh discounted products"
          >
            <AppText
              weight="bold"
              style={
                styles.retryText
              }
            >
              Refresh
            </AppText>
          </Pressable>
        </View>
      );
    }, [
      claimed,
      claiming,
      error,
      handleRetry,
      renderClaimState,
    ]);

  /*
   * ==========================================================
   * PRODUCT
   * ==========================================================
   */

  const renderProduct =
    useCallback(
      ({
        item,
      }: {
        item: DiscountedProduct;
      }) => {
        const product =
          item.product;

        /*
         * IMPORTANT:
         *
         * We pass the actual deal to
         * ProductGridCard.
         *
         * This is what was missing before.
         */

        return (
          <View
            style={
              styles.productItem
            }
          >
            <ProductGridCard
              id={product.id}
              name={product.name}
              price={product.price}
              image={
                product.thumbnail
              }

              activeDeal={
                item.deal
              }

              onPress={() =>
                router.push({
                  pathname:
                    "/(customer)/product/[id]",

                  params: {
                    id: product.id,
                  },
                })
              }

              onBuy={() =>
                router.push({
                  pathname:
                    "/(customer)/product/[id]",

                  params: {
                    id: product.id,
                  },
                })
              }
            />

            <AppText
              style={
                styles.distance
              }
            >
              {item.distance < 1
                ? `${Math.round(
                    item.distance *
                      1000,
                  )} m away`
                : `${item.distance.toFixed(
                    1,
                  )} km away`}
            </AppText>
          </View>
        );
      },
      [],
    );

  /*
   * ==========================================================
   * MAIN
   * ==========================================================
   */

  return (
    <SafeAreaView
      style={styles.screen}
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      <FlatList
        data={
          claimed
            ? products
            : []
        }
        keyExtractor={(item) =>
          item.product.id
        }
        numColumns={2}
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={[
          styles.list,

          products.length === 0 &&
            styles.emptyList,
        ]}
        columnWrapperStyle={
          claimed &&
          products.length > 0
            ? styles.row
            : undefined
        }
        renderItem={
          renderProduct
        }
        ListHeaderComponent={
          renderHeader
        }
        ListEmptyComponent={
          renderEmpty
        }
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
      />
    </SafeAreaView>
  );
}

/*
 * ============================================================
 * STYLES
 * ============================================================
 */

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor:
        "#FFFFFF",
    },

    header: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 20,
    },

    backButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 12,
      elevation: 2,
      shadowColor:
        "#000000",
      shadowOpacity: 0.08,
      shadowRadius: 5,
      shadowOffset: {
        width: 0,
        height: 2,
      },
    },

    backIcon: {
      fontSize: 38,
      lineHeight: 40,
      color: "#0F172A",
      marginTop: -4,
    },

    headerText: {
      flex: 1,
      paddingTop: 2,
    },

    title: {
      fontSize: 27,
      color: "#0F172A",
    },

    subtitle: {
      marginTop: 6,
      fontSize: 15,
      lineHeight: 22,
      color: "#64748B",
    },

    /*
     * CLAIM
     */

    claimContainer: {
      minHeight: 620,
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal: 32,
      paddingBottom: 80,
    },

    tagCircle: {
      width: 82,
      height: 82,
      borderRadius: 41,
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginBottom: 22,
    },

    tagIcon: {
      fontSize: 38,
      color: "#2563EB",
    },

    claimTitle: {
      fontSize: 24,
      color: "#0F172A",
      textAlign: "center",
    },

    claimDescription: {
      marginTop: 10,
      maxWidth: 330,
      fontSize: 15,
      lineHeight: 23,
      color: "#64748B",
      textAlign: "center",
    },

    errorText: {
      marginTop: 16,
      color: "#DC2626",
      fontSize: 13,
      lineHeight: 20,
      textAlign: "center",
    },

    claimButton: {
      minWidth: 210,
      height: 52,
      borderRadius: 14,
      backgroundColor:
        "#2563EB",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal: 24,
      marginTop: 26,
      gap: 10,
    },

    claimButtonPressed: {
      opacity: 0.85,
    },

    claimButtonDisabled: {
      opacity: 0.65,
    },

    claimButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
    },

    /*
     * LIST
     */

    list: {
      paddingHorizontal: 16,
      paddingBottom: 32,
    },

    row: {
      justifyContent:
        "space-between",
      marginBottom: 16,
    },

    productItem: {
      width: "48%",
    },

    distance: {
      marginTop: 6,
      fontSize: 12,
      color: "#64748B",
      textAlign: "center",
    },

    /*
     * EMPTY
     */

    emptyList: {
      flexGrow: 1,
    },

    center: {
      minHeight: 500,
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal: 32,
      paddingBottom: 80,
    },

    loadingTitle: {
      marginTop: 18,
      fontSize: 17,
      color: "#0F172A",
      textAlign: "center",
    },

    loadingText: {
      marginTop: 8,
      fontSize: 14,
      lineHeight: 21,
      color: "#64748B",
      textAlign: "center",
    },

    emptyIcon: {
      fontSize: 48,
      marginBottom: 18,
    },

    emptyTitle: {
      fontSize: 20,
      color: "#0F172A",
      textAlign: "center",
    },

    emptyText: {
      marginTop: 8,
      fontSize: 14,
      lineHeight: 22,
      color: "#64748B",
      textAlign: "center",
    },

    retryButton: {
      marginTop: 20,
      paddingHorizontal: 24,
      height: 46,
      borderRadius: 12,
      backgroundColor:
        "#2563EB",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    retryText: {
      color: "#FFFFFF",
      fontSize: 14,
    },
  });