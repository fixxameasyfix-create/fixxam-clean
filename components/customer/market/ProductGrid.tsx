import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type ListRenderItem,
} from "react-native";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import ProductGridCard from "@/components/customer/home/ProductGridCard";
import ProductReviewModal from "@/components/customer/home/ProductReviewModal";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import {
  auth,
  db,
} from "@/firebase/config";

import getActiveProductDeals, {
  type ActiveProductDeal,
} from "@/services/deals/getActiveProductDeal";

import {
  subscribeToProductRatingCount,
  toggleProductRating,
} from "@/services/productRatingService";

import {
  createProductReview,
  subscribeToProductReviewCount,
} from "@/services/productReviewService";

import {
  ensureWorkerRated,
} from "@/services/workerRatingService";

/* ==============================================================
   TYPES
============================================================== */

export type MarketProduct = {
  id: string;

  workerId: string;

  storeId?: string;

  name: string;

  price: number;

  thumbnail: string;

  rating?: number;

  sold?: number;
};

type ProductWithDeal =
  MarketProduct & {
    activeDeal:
      | ActiveProductDeal
      | null;
  };

type Props = {
  title?: string;

  products: MarketProduct[];

  loading?: boolean;

  showSeeAll?: boolean;

  onSeeAll?: () => void;

  onProductPress: (
    id: string,
  ) => void;

  onBuyPress: (
    product: MarketProduct,
  ) => void;
};

type ProductRatingCounts =
  Record<string, number>;

type ProductRatingLoading =
  Record<string, boolean>;

type ProductReviewCounts =
  Record<string, number>;

type SelectedReviewProduct = {
  id: string;

  name: string;

  workerId: string;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value.trim();
}

function cleanProfileName(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value.trim();
}

/* ==============================================================
   COMPONENT
============================================================== */

function ProductGrid({
  title = "Popular Materials",
  products,
  loading = false,
  showSeeAll = true,
  onSeeAll,
  onProductPress,
  onBuyPress,
}: Props) {
  /* ============================================================
     DEAL STATE
  ============================================================ */

  const [
    dealsByProductId,
    setDealsByProductId,
  ] =
    useState<
      Map<
        string,
        ActiveProductDeal
      >
    >(
      new Map(),
    );

  const [
    dealsLoading,
    setDealsLoading,
  ] =
    useState(false);

  /* ============================================================
     PRODUCT RATING STATE
  ============================================================ */

  const [
    ratingCounts,
    setRatingCounts,
  ] =
    useState<ProductRatingCounts>(
      {},
    );

  const [
    ratingLoading,
    setRatingLoading,
  ] =
    useState<ProductRatingLoading>(
      {},
    );

  /* ============================================================
     PRODUCT REVIEW STATE
  ============================================================ */

  const [
    reviewCounts,
    setReviewCounts,
  ] =
    useState<ProductReviewCounts>(
      {},
    );

  const [
    selectedReviewProduct,
    setSelectedReviewProduct,
  ] =
    useState<
      SelectedReviewProduct | null
    >(null);

  const [
    reviewSubmitting,
    setReviewSubmitting,
  ] =
    useState(false);

  /* ============================================================
     PRODUCT IDS
  ============================================================ */

  const productIds =
    useMemo(
      () =>
        Array.from(
          new Set(
            products
              .map(
                product =>
                  cleanString(
                    product.id,
                  ),
              )
              .filter(
                Boolean,
              ),
          ),
        ),
      [
        products,
      ],
    );

  /* ============================================================
     LOAD ACTIVE DEALS
  ============================================================ */

  useEffect(() => {
    let cancelled =
      false;

    setDealsByProductId(
      new Map(),
    );

    if (
      productIds.length === 0
    ) {
      setDealsLoading(
        false,
      );

      return () => {
        cancelled =
          true;
      };
    }

    async function loadDeals() {
      try {
        setDealsLoading(
          true,
        );

        const result =
          await getActiveProductDeals(
            productIds,
          );

        if (
          cancelled
        ) {
          return;
        }

        setDealsByProductId(
          result,
        );
      } catch (
        error
      ) {
        console.error(
          "PRODUCT_GRID_DEAL_LOAD_ERROR:",
          error,
        );

        if (
          !cancelled
        ) {
          setDealsByProductId(
            new Map(),
          );
        }
      } finally {
        if (
          !cancelled
        ) {
          setDealsLoading(
            false,
          );
        }
      }
    }

    void loadDeals();

    return () => {
      cancelled =
        true;
    };
  }, [
    productIds,
  ]);

  /* ============================================================
     PRODUCT RATING COUNTS
  ============================================================ */

  useEffect(() => {
    if (
      productIds.length === 0
    ) {
      setRatingCounts(
        {},
      );

      return;
    }

    const activeProductIds =
      new Set(
        productIds,
      );

    setRatingCounts(
      current => {
        const next:
          ProductRatingCounts =
          {};

        productIds.forEach(
          productId => {
            next[
              productId
            ] =
              current[
                productId
              ] ??
              0;
          },
        );

        return next;
      },
    );

    const unsubscribers =
      productIds.map(
        productId =>
          subscribeToProductRatingCount(
            productId,

            count => {
              if (
                !activeProductIds.has(
                  productId,
                )
              ) {
                return;
              }

              setRatingCounts(
                current => {
                  if (
                    current[
                      productId
                    ] ===
                    count
                  ) {
                    return current;
                  }

                  return {
                    ...current,

                    [productId]:
                      count,
                  };
                },
              );
            },

            error => {
              if (
                __DEV__
              ) {
                console.error(
                  "PRODUCT_GRID_RATING_COUNT_ERROR",
                  {
                    productId,
                    error,
                  },
                );
              }
            },
          ),
      );

    return () => {
      activeProductIds.clear();

      unsubscribers.forEach(
        unsubscribe => {
          unsubscribe();
        },
      );
    };
  }, [
    productIds,
  ]);

  /* ============================================================
     PRODUCT REVIEW COUNTS
  ============================================================ */

  useEffect(() => {
    if (
      productIds.length === 0
    ) {
      setReviewCounts(
        {},
      );

      return;
    }

    const activeProductIds =
      new Set(
        productIds,
      );

    setReviewCounts(
      current => {
        const next:
          ProductReviewCounts =
          {};

        productIds.forEach(
          productId => {
            next[
              productId
            ] =
              current[
                productId
              ] ??
              0;
          },
        );

        return next;
      },
    );

    const unsubscribers =
      productIds.map(
        productId =>
          subscribeToProductReviewCount(
            productId,

            count => {
              if (
                !activeProductIds.has(
                  productId,
                )
              ) {
                return;
              }

              setReviewCounts(
                current => {
                  if (
                    current[
                      productId
                    ] ===
                    count
                  ) {
                    return current;
                  }

                  return {
                    ...current,

                    [productId]:
                      count,
                  };
                },
              );
            },

            error => {
              if (
                __DEV__
              ) {
                console.error(
                  "PRODUCT_GRID_REVIEW_COUNT_ERROR",
                  {
                    productId,
                    error,
                  },
                );
              }
            },
          ),
      );

    return () => {
      activeProductIds.clear();

      unsubscribers.forEach(
        unsubscribe => {
          unsubscribe();
        },
      );
    };
  }, [
    productIds,
  ]);

  /* ============================================================
     DISPLAY PRODUCTS
  ============================================================ */

  const displayProducts =
    useMemo<
      ProductWithDeal[]
    >(
      () =>
        products.map(
          product => ({
            ...product,

            activeDeal:
              dealsByProductId.get(
                product.id,
              ) ??
              null,
          }),
        ),
      [
        dealsByProductId,
        products,
      ],
    );

  /* ============================================================
     RATE PRODUCT
  ============================================================ */

  const handleProductRating =
    useCallback(
      async (
        productId: string,
      ) => {
        const safeProductId =
          cleanString(
            productId,
          );

        if (
          !safeProductId
        ) {
          return;
        }

        if (
          ratingLoading[
            safeProductId
          ]
        ) {
          return;
        }

        setRatingLoading(
          current => ({
            ...current,

            [safeProductId]:
              true,
          }),
        );

        try {
          await toggleProductRating(
            safeProductId,
          );
        } catch (
          error
        ) {
          if (
            __DEV__
          ) {
            console.error(
              "PRODUCT_GRID_RATING_TOGGLE_ERROR",
              {
                productId:
                  safeProductId,

                error,
              },
            );
          }

          const message =
            error instanceof Error
              ? error.message
              : "Unable to update product rating.";

          Alert.alert(
            "Rating",
            message,
          );
        } finally {
          setRatingLoading(
            current => ({
              ...current,

              [safeProductId]:
                false,
            }),
          );
        }
      },
      [
        ratingLoading,
      ],
    );

  /* ============================================================
     OPEN REVIEW
  ============================================================ */

  const handleReviewPress =
    useCallback(
      (
        product: ProductWithDeal,
      ) => {
        const productId =
          cleanString(
            product.id,
          );

        if (
          !productId
        ) {
          Alert.alert(
            "Review",
            "Product information is unavailable.",
          );

          return;
        }

        const workerId =
          cleanString(
            product.workerId,
          );

        if (
          !workerId
        ) {
          Alert.alert(
            "Review",
            "Product owner information is unavailable.",
          );

          return;
        }

        setSelectedReviewProduct({
          id:
            productId,

          name:
            product.name,

          workerId,
        });
      },
      [],
    );

  /* ============================================================
     CLOSE REVIEW
  ============================================================ */

  const handleCloseReview =
    useCallback(
      () => {
        if (
          reviewSubmitting
        ) {
          return;
        }

        setSelectedReviewProduct(
          null,
        );
      },
      [
        reviewSubmitting,
      ],
    );

  /* ============================================================
     SUBMIT REVIEW
  ============================================================ */

  const handleSubmitReview =
    useCallback(
      async (
        rating: number,
        comment: string,
      ) => {
        if (
          !selectedReviewProduct ||
          reviewSubmitting
        ) {
          return;
        }

        const currentUser =
          auth.currentUser;

        if (
          !currentUser
        ) {
          Alert.alert(
            "Sign in required",
            "You must be signed in to review this product.",
          );

          return;
        }

        setReviewSubmitting(
          true,
        );

        try {
          /* ==================================================
             CUSTOMER PROFILE
          ================================================== */

          const profileSnapshot =
            await getDoc(
              doc(
                db,
                "users",
                currentUser.uid,
              ),
            );

          if (
            !profileSnapshot.exists()
          ) {
            Alert.alert(
              "Review",
              "Your customer profile could not be found.",
            );

            return;
          }

          const profileData =
            profileSnapshot.data();

          const savedFullName =
            cleanProfileName(
              profileData.fullName,
            );

          const firstName =
            cleanProfileName(
              profileData.firstName,
            );

          const otherName =
            cleanProfileName(
              profileData.otherName,
            );

          const surname =
            cleanProfileName(
              profileData.surname,
            );

          const customerName =
            savedFullName ||
            [
              firstName,
              otherName,
              surname,
            ]
              .filter(
                Boolean,
              )
              .join(" ");

          if (
            !customerName
          ) {
            Alert.alert(
              "Review",
              "Please complete your profile name before submitting a review.",
            );

            return;
          }

          /* ==================================================
             CREATE PRODUCT REVIEW
          ================================================== */

          await createProductReview({
            productId:
              selectedReviewProduct.id,

            productName:
              selectedReviewProduct.name,

            workerId:
              selectedReviewProduct.workerId,

            customerName,

            rating,

            comment,
          });

          /* ==================================================
             QUICK WORKER RATING

             Kept exactly the same as New Arrivals.
          ================================================== */

          await ensureWorkerRated(
            selectedReviewProduct.workerId,
          );

          setSelectedReviewProduct(
            null,
          );

          Alert.alert(
            "Review submitted",
            "Your product review has been submitted successfully.",
          );
        } catch (
          error
        ) {
          if (
            __DEV__
          ) {
            console.error(
              "PRODUCT_GRID_REVIEW_SUBMIT_ERROR",
              {
                productId:
                  selectedReviewProduct.id,

                workerId:
                  selectedReviewProduct.workerId,

                error,
              },
            );
          }

          const message =
            error instanceof Error
              ? error.message
              : "Unable to submit your review.";

          Alert.alert(
            "Review",
            message,
          );
        } finally {
          setReviewSubmitting(
            false,
          );
        }
      },
      [
        reviewSubmitting,
        selectedReviewProduct,
      ],
    );

  /* ============================================================
     RENDER PRODUCT
  ============================================================ */

  const renderProduct =
    useCallback<
      ListRenderItem<ProductWithDeal>
    >(
      ({
        item,
      }) => {
        const productId =
          cleanString(
            item.id,
          );

        const ratingCount =
          ratingCounts[
            productId
          ] ??
          0;

        const reviewCount =
          reviewCounts[
            productId
          ] ??
          0;

        return (
          <View
            style={
              styles.cardWrapper
            }
          >
            <ProductGridCard
              id={
                item.id
              }
              name={
                item.name
              }
              price={
                item.price
              }
              image={
                item.thumbnail
              }
              rating={
                item.rating
              }
              ratingCount={
                ratingCount
              }
              reviewCount={
                reviewCount
              }
              activeDeal={
                item.activeDeal
              }
              onRatingPress={() => {
                void handleProductRating(
                  item.id,
                );
              }}
              onReviewPress={() => {
                handleReviewPress(
                  item,
                );
              }}
              onPress={() =>
                onProductPress(
                  item.id,
                )
              }
              onBuy={() =>
                onBuyPress(
                  item,
                )
              }
            />
          </View>
        );
      },
      [
        handleProductRating,
        handleReviewPress,
        onBuyPress,
        onProductPress,
        ratingCounts,
        reviewCounts,
      ],
    );

  const keyExtractor =
    useCallback(
      (
        item: ProductWithDeal,
      ) => item.id,
      [],
    );

  /* ============================================================
     LOADING
  ============================================================ */

  if (
    loading
  ) {
    return (
      <View
        accessibilityRole="progressbar"
        accessibilityLabel="Loading products"
        style={
          styles.loading
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
            styles.loadingText
          }
        >
          Loading products...
        </AppText>
      </View>
    );
  }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={
          styles.header
        }
      >
        <AppText
          variant="heading3"
          weight="bold"
          numberOfLines={1}
          style={
            styles.title
          }
        >
          {title}
        </AppText>

        {showSeeAll &&
        onSeeAll ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`See all ${title}`}
            hitSlop={8}
            onPress={
              onSeeAll
            }
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
                styles.seeAll
              }
            >
              See All
            </AppText>

            <AppIcon
              name="next"
              role="customer"
              size="xs"
              state="active"
            />
          </Pressable>
        ) : null}
      </View>

      {/* ======================================================
          PRODUCTS
      ====================================================== */}

      {displayProducts.length ===
      0 ? (
        <View
          style={
            styles.empty
          }
        >
          <View
            style={
              styles.emptyIcon
            }
          >
            <AppIcon
              name="shop"
              role="customer"
              size="xl"
              state="muted"
            />
          </View>

          <AppText
            variant="bodyLarge"
            weight="bold"
            center
            style={
              styles.emptyTitle
            }
          >
            No Products Found
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.emptyText
            }
          >
            Products added by workers will appear here.
          </AppText>
        </View>
      ) : (
        <FlatList
          data={
            displayProducts
          }
          keyExtractor={
            keyExtractor
          }
          renderItem={
            renderProduct
          }
          numColumns={2}
          scrollEnabled={false}
          showsVerticalScrollIndicator={
            false
          }
          columnWrapperStyle={
            styles.row
          }
        />
      )}

      {/* ======================================================
          DEAL REFRESH
      ====================================================== */}

      {dealsLoading &&
      displayProducts.length >
        0 ? (
        <View
          accessibilityRole="progressbar"
          accessibilityLabel="Updating product deals"
          style={
            styles.dealLoading
          }
        >
          <ActivityIndicator
            size="small"
            color={
              CustomerColors.primary
            }
          />

          <AppText
            variant="caption"
            tone="secondary"
          >
            Updating deals...
          </AppText>
        </View>
      ) : null}

      {/* ======================================================
          PRODUCT REVIEW MODAL
      ====================================================== */}

      <ProductReviewModal
        visible={
          selectedReviewProduct !==
          null
        }
        productName={
          selectedReviewProduct
            ?.name ??
          ""
        }
        submitting={
          reviewSubmitting
        }
        onClose={
          handleCloseReview
        }
        onSubmit={
          handleSubmitReview
        }
      />
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      marginHorizontal:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.xl,
    },

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.md,
    },

    title: {
      flex: 1,

      minWidth: 0,

      color:
        Colors.textPrimary,
    },

    seeAllButton: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    seeAll: {
      color:
        CustomerColors.primary,
    },

    row: {
      justifyContent:
        "space-between",

      marginBottom:
        FixxamTokens.spacing.md,
    },

    cardWrapper: {
      width:
        "48.2%",
    },

    loading: {
      minHeight:
        220,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginHorizontal:
        FixxamTokens.spacing.lg,
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.md,
    },

    dealLoading: {
      minHeight:
        28,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      paddingTop:
        FixxamTokens.spacing.xs,
    },

    empty: {
      minHeight:
        220,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingVertical:
        FixxamTokens.spacing.xxl,

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
      width:
        72,

      height:
        72,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.disabledBackground,
    },

    emptyTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    emptyText: {
      maxWidth:
        280,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight:
        20,
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

export default memo(
  ProductGrid,
);