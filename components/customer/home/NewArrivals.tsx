import React, {
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
} from "react-native";

import {
  router,
} from "expo-router";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import ProductGridCard from "./ProductGridCard";
import ProductReviewModal from "./ProductReviewModal";

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

import {
  auth,
  db,
} from "@/firebase/config";

/* ==============================================================
   TYPES
============================================================== */

interface Product {
  id: string;

  name: string;

  price: number;

  thumbnail: string;

  storeId?: string;

  workerId?: string;

  workerRating?: number;
}

interface ProductWithDeal
  extends Product {
  activeDeal:
    | ActiveProductDeal
    | null;
}

interface Props {
  products: Product[];

  loading: boolean;
}

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
   CONSTANTS
============================================================== */

const PRODUCT_LIMIT = 10;

const PRODUCT_CARD_WIDTH = 168;

/* ==============================================================
   HELPERS
============================================================== */

function cleanId(
  value: unknown,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value.trim();
}

function cleanProfileName(
  value: unknown,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value.trim();
}

/* ==============================================================
   COMPONENT
============================================================== */

export default function NewArrivals({
  products,
  loading,
}: Props) {
  const [
    productsWithDeals,
    setProductsWithDeals,
  ] =
    useState<
      ProductWithDeal[]
    >([]);

  const [
    dealsLoading,
    setDealsLoading,
  ] =
    useState(false);

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
     VISIBLE PRODUCTS
  ============================================================ */

  const visibleProducts =
    useMemo(
      () =>
        Array.isArray(
          products,
        )
          ? products
              .filter(
                product =>
                  typeof product.id ===
                    "string" &&
                  product.id
                    .trim()
                    .length >
                    0,
              )
              .slice(
                0,
                PRODUCT_LIMIT,
              )
          : [],
      [
        products,
      ],
    );

  /* ============================================================
     PRODUCT IDS
  ============================================================ */

  const visibleProductIds =
    useMemo(
      () =>
        [
          ...new Set(
            visibleProducts
              .map(
                product =>
                  cleanId(
                    product.id,
                  ),
              )
              .filter(
                Boolean,
              ),
          ),
        ],
      [
        visibleProducts,
      ],
    );

  /* ============================================================
     FALLBACK PRODUCTS
  ============================================================ */

  const fallbackProducts =
    useMemo<
      ProductWithDeal[]
    >(
      () =>
        visibleProducts.map(
          product => ({
            ...product,

            activeDeal:
              null,
          }),
        ),
      [
        visibleProducts,
      ],
    );

  /* ============================================================
     LOAD ACTIVE DEALS
  ============================================================ */

  useEffect(() => {
    let cancelled =
      false;

    const loadDeals =
      async () => {
        if (
          visibleProducts.length ===
          0
        ) {
          setProductsWithDeals(
            [],
          );

          setDealsLoading(
            false,
          );

          return;
        }

        setProductsWithDeals(
          fallbackProducts,
        );

        try {
          setDealsLoading(
            true,
          );

          const productIds = [
            ...new Set(
              visibleProducts.map(
                product =>
                  product.id,
              ),
            ),
          ];

          if (
            productIds.length ===
            0
          ) {
            return;
          }

          const dealsByProductId =
            await getActiveProductDeals(
              productIds,
            );

          if (
            cancelled
          ) {
            return;
          }

          const mergedProducts =
            visibleProducts.map(
              product => ({
                ...product,

                activeDeal:
                  dealsByProductId.get(
                    product.id,
                  ) ??
                  null,
              }),
            );

          setProductsWithDeals(
            mergedProducts,
          );
        } catch (
          error
        ) {
          if (
            __DEV__
          ) {
            console.error(
              "NEW_ARRIVALS_DEAL_LOAD_ERROR",
              error,
            );
          }

          if (
            cancelled
          ) {
            return;
          }

          setProductsWithDeals(
            fallbackProducts,
          );
        } finally {
          if (
            !cancelled
          ) {
            setDealsLoading(
              false,
            );
          }
        }
      };

    void loadDeals();

    return () => {
      cancelled =
        true;
    };
  }, [
    fallbackProducts,
    visibleProducts,
  ]);

  /* ============================================================
     PRODUCT RATING COUNTS
  ============================================================ */

  useEffect(() => {
    if (
      visibleProductIds.length ===
      0
    ) {
      setRatingCounts(
        {},
      );

      return;
    }

    const activeProductIds =
      new Set(
        visibleProductIds,
      );

    setRatingCounts(
      current => {
        const next:
          ProductRatingCounts =
          {};

        for (
          const productId of
          visibleProductIds
        ) {
          next[productId] =
            current[
              productId
            ] ??
            0;
        }

        return next;
      },
    );

    const unsubscribers =
      visibleProductIds.map(
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
                  "NEW_ARRIVALS_PRODUCT_RATING_COUNT_ERROR",
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
    visibleProductIds,
  ]);

  /* ============================================================
     PRODUCT REVIEW COUNTS
  ============================================================ */

  useEffect(() => {
    if (
      visibleProductIds.length ===
      0
    ) {
      setReviewCounts(
        {},
      );

      return;
    }

    const activeProductIds =
      new Set(
        visibleProductIds,
      );

    setReviewCounts(
      current => {
        const next:
          ProductReviewCounts =
          {};

        for (
          const productId of
          visibleProductIds
        ) {
          next[productId] =
            current[
              productId
            ] ??
            0;
        }

        return next;
      },
    );

    const unsubscribers =
      visibleProductIds.map(
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
                  "NEW_ARRIVALS_PRODUCT_REVIEW_COUNT_ERROR",
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
    visibleProductIds,
  ]);

  /* ============================================================
     DISPLAY DATA
  ============================================================ */

  const displayProducts =
    productsWithDeals.length >
    0
      ? productsWithDeals
      : fallbackProducts;

  /* ============================================================
     PRODUCT DETAILS
  ============================================================ */

  const handleProductPress =
    useCallback(
      (
        productId: string,
      ) => {
        const safeProductId =
          cleanId(
            productId,
          );

        if (
          !safeProductId
        ) {
          return;
        }

        router.push({
          pathname:
            "/(customer)/product/[id]",

          params: {
            id:
              safeProductId,
          },
        });
      },
      [],
    );

  /* ============================================================
     PRODUCT RATING
  ============================================================ */

  const handleProductRating =
    useCallback(
      async (
        productId: string,
      ) => {
        const safeProductId =
          cleanId(
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

          /*
           * Firestore realtime listener
           * updates the count.
           */
        } catch (
          error
        ) {
          if (
            __DEV__
          ) {
            console.error(
              "NEW_ARRIVALS_PRODUCT_RATING_TOGGLE_ERROR",
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
     OPEN PRODUCT REVIEW
  ============================================================ */

  const handleReviewPress =
    useCallback(
      (
        product: ProductWithDeal,
      ) => {
        const productId =
          cleanId(
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
          cleanId(
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
     CLOSE PRODUCT REVIEW
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
     SUBMIT PRODUCT REVIEW
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
             LOAD CUSTOMER PROFILE
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

             Product gets customer's selected
             1–5 star rating + comment.
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
             ENSURE WORKER FIXED 3-STAR RATING

             IMPORTANT:

             The product review can be:
             1, 2, 3, 4 or 5 stars.

             The worker does NOT receive that value.

             Worker receives fixed 3 stars only.

             One customer = one quick rating per worker.
          ================================================== */

          await ensureWorkerRated(
            selectedReviewProduct.workerId,
          );

          /* ==================================================
             SUCCESS
          ================================================== */

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
              "NEW_ARRIVALS_PRODUCT_REVIEW_SUBMIT_ERROR",
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
     SEE ALL
  ============================================================ */

  const handleSeeAll =
    useCallback(
      () => {
        router.push(
          "/(customer)/market/popular",
        );
      },
      [],
    );

  /* ============================================================
     RENDER PRODUCT
  ============================================================ */

  const renderProduct =
    useCallback(
      ({
        item,
      }: {
        item: ProductWithDeal;
      }) => {
        const productId =
          cleanId(
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
              styles.item
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
                item.workerRating
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
                handleProductPress(
                  item.id,
                )
              }
              onBuy={() =>
                handleProductPress(
                  item.id,
                )
              }
            />
          </View>
        );
      },
      [
        handleProductPress,
        handleProductRating,
        handleReviewPress,
        ratingCounts,
        reviewCounts,
      ],
    );

  /* ============================================================
     RENDER
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
        <View
          style={
            styles.headerLeft
          }
        >
          <AppText
            variant="heading3"
            weight="bold"
            numberOfLines={
              1
            }
            style={
              styles.title
            }
          >
            New Arrivals
          </AppText>

          {dealsLoading ? (
            <ActivityIndicator
              size="small"
              color={
                CustomerColors.primary
              }
              style={
                styles.dealLoader
              }
            />
          ) : null}
        </View>

        <Pressable
          hitSlop={
            8
          }
          onPress={
            handleSeeAll
          }
          accessibilityRole="button"
          accessibilityLabel="See all new arrivals"
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
            variant="caption"
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
            color={
              CustomerColors.primary
            }
          />
        </Pressable>
      </View>

      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading ? (
        <View
          style={
            styles.center
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
            style={
              styles.loadingText
            }
          >
            Loading products...
          </AppText>
        </View>
      ) : displayProducts.length ===
        0 ? (
        /* ====================================================
           EMPTY
        ==================================================== */

        <View
          style={
            styles.center
          }
        >
          <View
            style={
              styles.emptyIcon
            }
          >
            <AppIcon
              name="package"
              size="lg"
              state="muted"
            />
          </View>

          <AppText
            variant="body"
            weight="bold"
            style={
              styles.emptyTitle
            }
          >
            No products available
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            center
            style={
              styles.emptyText
            }
          >
            New market products will
            appear here when available.
          </AppText>
        </View>
      ) : (
        /* ====================================================
           PRODUCTS
        ==================================================== */

        <FlatList
          horizontal
          data={
            displayProducts
          }
          keyExtractor={(
            item,
          ) =>
            item.id
          }
          renderItem={
            renderProduct
          }
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.list
          }
          initialNumToRender={
            5
          }
          maxToRenderPerBatch={
            PRODUCT_LIMIT
          }
          windowSize={
            3
          }
          keyboardShouldPersistTaps="handled"
        />
      )}

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
      marginBottom:
        FixxamTokens.spacing.sm,
    },

    header: {
      marginBottom:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",
    },

    headerLeft: {
      flex:
        1,

      minWidth:
        0,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginRight:
        FixxamTokens.spacing.sm,
    },

    title: {
      flexShrink:
        1,

      color:
        Colors.textPrimary,
    },

    dealLoader: {
      marginLeft:
        FixxamTokens.spacing.sm,
    },

    seeAllButton: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink:
        0,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xxs,

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.sm,
    },

    seeAll: {
      color:
        CustomerColors.primary,
    },

    list: {
      paddingRight:
        FixxamTokens.spacing.md,
    },

    item: {
      width:
        PRODUCT_CARD_WIDTH,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    center: {
      minHeight:
        140,

      paddingVertical:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.sm,
    },

    emptyIcon: {
      width:
        FixxamTokens.size
          .avatarLg,

      height:
        FixxamTokens.size
          .avatarLg,

      marginBottom:
        FixxamTokens.spacing.sm,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    emptyTitle: {
      color:
        Colors.textPrimary,
    },

    emptyText: {
      maxWidth:
        280,

      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight:
        17,
    },

    pressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },
  });