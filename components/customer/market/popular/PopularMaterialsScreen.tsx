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
  StyleSheet,
  View,
  type ListRenderItem,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  AppText,
} from "@/components/ui";

import ProductGridCard from "@/components/customer/home/ProductGridCard";
import ProductReviewModal from "@/components/customer/home/ProductReviewModal";

import useMarket from "@/hooks/market/useMarket";

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

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import PopularMaterialsCategories from "./PopularMaterialsCategories";
import PopularMaterialsEmpty from "./PopularMaterialsEmpty";
import PopularMaterialsHeader from "./PopularMaterialsHeader";
import PopularMaterialsLoading from "./PopularMaterialsLoading";
import PopularMaterialsSearch from "./PopularMaterialsSearch";

/* ==============================================================
   TYPES
============================================================== */

interface MarketProduct {
  id: string;

  workerId?: string;

  workerRating?: number;

  storeId?: string;

  name: string;

  price: number;

  thumbnail: string;

  category: string;

  rating?: number;

  sold?: number;
}

interface ProductWithDeal
  extends MarketProduct {
  activeDeal:
    | ActiveProductDeal
    | null;
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
   HELPERS
============================================================== */

function cleanString(
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

function normalizePrice(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    return 0;
  }

  return value;
}

function isValidProduct(
  product: MarketProduct,
): boolean {
  return Boolean(
    cleanString(
      product.id,
    ) &&
      cleanString(
        product.name,
      ),
  );
}

/* ==============================================================
   SCREEN
============================================================== */

export default function PopularMaterialsScreen() {
  const [
    search,
    setSearch,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState("all");

  const {
    loading,
    products,
  } = useMarket();

  /* ============================================================
     DEAL STATE
  ============================================================ */

  const [
    dealsByProductId,
    setDealsByProductId,
  ] = useState<
    Map<
      string,
      ActiveProductDeal
    >
  >(
    () => new Map(),
  );

  const [
    dealsLoading,
    setDealsLoading,
  ] = useState(false);

  /* ============================================================
     RATING STATE
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
     REVIEW STATE
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
     NORMALIZE PRODUCTS
  ============================================================ */

  const marketProducts =
    useMemo<MarketProduct[]>(
      () => {
        if (
          !Array.isArray(
            products,
          )
        ) {
          return [];
        }

        return (
          products as MarketProduct[]
        )
          .filter(
            isValidProduct,
          )
          .map(
            product => ({
              ...product,

              id:
                cleanString(
                  product.id,
                ),

              name:
                cleanString(
                  product.name,
                ),

              thumbnail:
                cleanString(
                  product.thumbnail,
                ),

              category:
                cleanString(
                  product.category,
                ),

              workerId:
                cleanString(
                  product.workerId,
                ) ||
                undefined,

              storeId:
                cleanString(
                  product.storeId,
                ) ||
                undefined,

              price:
                normalizePrice(
                  product.price,
                ),
            }),
          );
      },
      [
        products,
      ],
    );

  /* ============================================================
     PRODUCT IDS
  ============================================================ */

  const productIds =
    useMemo(
      () =>
        Array.from(
          new Set(
            marketProducts
              .map(
                product =>
                  product.id,
              )
              .filter(
                Boolean,
              ),
          ),
        ),
      [
        marketProducts,
      ],
    );

  /* ============================================================
     LOAD ACTIVE DEALS
  ============================================================ */

  useEffect(() => {
    let cancelled =
      false;

    if (
      productIds.length ===
      0
    ) {
      setDealsByProductId(
        new Map(),
      );

      setDealsLoading(
        false,
      );

      return () => {
        cancelled =
          true;
      };
    }

    const loadDeals =
      async () => {
        setDealsLoading(
          true,
        );

        try {
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
            result instanceof Map
              ? result
              : new Map(),
          );
        } catch (
          error
        ) {
          if (
            __DEV__
          ) {
            console.error(
              "POPULAR_MATERIALS_DEAL_LOAD_ERROR",
              error,
            );
          }

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
      };

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
      productIds.length ===
      0
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

        for (
          const productId of
          productIds
        ) {
          next[
            productId
          ] =
            current[
              productId
            ] ??
            0;
        }

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
                  "POPULAR_MATERIALS_RATING_COUNT_ERROR",
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
      productIds.length ===
      0
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

        for (
          const productId of
          productIds
        ) {
          next[
            productId
          ] =
            current[
              productId
            ] ??
            0;
        }

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
                  "POPULAR_MATERIALS_REVIEW_COUNT_ERROR",
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
     FILTER PRODUCTS
  ============================================================ */

  const filteredProducts =
    useMemo<
      MarketProduct[]
    >(
      () => {
        const normalizedSearch =
          cleanString(
            search,
          ).toLowerCase();

        const normalizedCategory =
          cleanString(
            category,
          ).toLowerCase();

        return marketProducts.filter(
          product => {
            const productName =
              product.name.toLowerCase();

            const productCategory =
              product.category.toLowerCase();

            const matchesSearch =
              !normalizedSearch ||
              productName.includes(
                normalizedSearch,
              );

            const matchesCategory =
              !normalizedCategory ||
              normalizedCategory ===
                "all" ||
              productCategory ===
                normalizedCategory;

            return (
              matchesSearch &&
              matchesCategory
            );
          },
        );
      },
      [
        category,
        marketProducts,
        search,
      ],
    );

  /* ============================================================
     DISPLAY PRODUCTS
  ============================================================ */

  const displayProducts =
    useMemo<
      ProductWithDeal[]
    >(
      () =>
        filteredProducts.map(
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
        filteredProducts,
      ],
    );

  /* ============================================================
     NAVIGATION
  ============================================================ */

  const handleProductPress =
    useCallback(
      (
        id: string,
      ) => {
        const productId =
          cleanString(
            id,
          );

        if (
          !productId
        ) {
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

  const handleBuy =
    useCallback(
      (
        id: string,
      ) => {
        const productId =
          cleanString(
            id,
          );

        if (
          !productId
        ) {
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

  /* ============================================================
     PRODUCT RATING
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
          !safeProductId ||
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
              "POPULAR_MATERIALS_RATING_TOGGLE_ERROR",
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
        product:
          ProductWithDeal,
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

          /*
           * Preserve the same review flow
           * currently used by NewArrivals.
           */
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
              "POPULAR_MATERIALS_REVIEW_SUBMIT_ERROR",
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
              workerId={
                item.workerId
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
                handleBuy(
                  item.id,
                )
              }
            />
          </View>
        );
      },
      [
        handleBuy,
        handleProductPress,
        handleProductRating,
        handleReviewPress,
        ratingCounts,
        reviewCounts,
      ],
    );

  const keyExtractor =
    useCallback(
      (
        item:
          ProductWithDeal,
      ) =>
        item.id,
      [],
    );

  /* ============================================================
     HEADER
  ============================================================ */

  const listHeader =
    useMemo(
      () => (
        <>
          <PopularMaterialsHeader />

          <PopularMaterialsSearch
            value={
              search
            }
            onChangeText={
              setSearch
            }
          />

          <PopularMaterialsCategories
            selected={
              category
            }
            onSelect={
              setCategory
            }
          />

          {dealsLoading &&
          marketProducts.length >
            0 ? (
            <View
              accessibilityRole="progressbar"
              accessibilityLabel="Updating material deals"
              style={
                styles.dealsLoading
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
        </>
      ),
      [
        category,
        dealsLoading,
        marketProducts.length,
        search,
      ],
    );

  /* ============================================================
     UI
  ============================================================ */

  return (
    <>
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
        numColumns={
          2
        }
        showsVerticalScrollIndicator={
          false
        }
        style={
          styles.container
        }
        contentContainerStyle={[
          styles.content,

          displayProducts.length ===
            0
            ? styles.emptyContent
            : null,
        ]}
        columnWrapperStyle={
          styles.columnWrapper
        }
        ListHeaderComponent={
          listHeader
        }
        ListEmptyComponent={
          loading ? (
            <PopularMaterialsLoading />
          ) : (
            <PopularMaterialsEmpty />
          )
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={
          6
        }
        maxToRenderPerBatch={
          8
        }
        windowSize={
          7
        }
      />

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
    </>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      flex:
        1,

      backgroundColor:
        Colors.background,
    },

    content: {
      flexGrow:
        1,

      paddingBottom:
        FixxamTokens.spacing.xxl,
    },

    emptyContent: {
      flexGrow:
        1,
    },

    columnWrapper: {
      gap:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.md,
    },

    cardWrapper: {
      flex:
        1,

      minWidth:
        0,
    },

    dealsLoading: {
      minHeight:
        30,

      marginBottom:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },
  });