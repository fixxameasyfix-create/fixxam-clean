import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  AppButton,
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
  Typography,
} from "@/theme";

import getActiveProductDeals from "@/services/deals/getActiveProductDeal";

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

import SparePartCard from "@/components/spare-parts/SparePartCard";

import ProductReviewModal from "@/components/customer/home/ProductReviewModal";

import type {
  Product,
  ProductWithDeal,
  RankedProduct,
  SpareProductsParams,
} from "./types";

import {
  calculateAiMatchScore,
  getValidDeal,
  matchesManualSearch,
  normalizeAiMode,
  normalizeCount,
  normalizeNumber,
  normalizeParam,
  normalizeRating,
  normalizeSearch,
  normalizeStatus,
  normalizeString,
  normalizeStringArray,
  parseAiKeywords,
} from "./utils";

/* ==============================================================
   CONSTANTS
============================================================== */

const WORKER_QUERY_BATCH_SIZE =
  30;

/* ==============================================================
   TYPES
============================================================== */

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

function chunkWorkerIds(
  workerIds: string[],
): string[][] {
  const batches:
    string[][] = [];

  for (
    let index = 0;
    index < workerIds.length;
    index +=
      WORKER_QUERY_BATCH_SIZE
  ) {
    batches.push(
      workerIds.slice(
        index,
        index +
          WORKER_QUERY_BATCH_SIZE,
      ),
    );
  }

  return batches;
}

function normalizeWorkerRating(
  value: unknown,
): number {
  const parsed =
    Number(
      value,
    );

  if (
    !Number.isFinite(
      parsed,
    ) ||
    parsed <= 0
  ) {
    return 0;
  }

  return Math.min(
    5,
    Math.max(
      0,
      parsed,
    ),
  );
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
   SEPARATOR
============================================================== */

function ProductSeparator() {
  return (
    <View
      style={
        styles.separator
      }
    />
  );
}

/* ==============================================================
   SCREEN
============================================================== */

export default function BuySparePartsScreen() {
  const params =
    useLocalSearchParams<
      SpareProductsParams
    >();

  /* ============================================================
     ROUTE / AI CONTEXT
  ============================================================ */

  const equipmentId =
    useMemo(
      () =>
        normalizeParam(
          params.equipmentId,
        ),
      [
        params.equipmentId,
      ],
    );

  const equipmentName =
    useMemo(
      () =>
        normalizeParam(
          params.equipmentName,
        ),
      [
        params.equipmentName,
      ],
    );

  const brandId =
    useMemo(
      () =>
        normalizeParam(
          params.brandId,
        ),
      [
        params.brandId,
      ],
    );

  const brandName =
    useMemo(
      () =>
        normalizeParam(
          params.brandName,
        ),
      [
        params.brandName,
      ],
    );

  const aiPartName =
    useMemo(
      () =>
        normalizeParam(
          params.aiPartName,
        ),
      [
        params.aiPartName,
      ],
    );

  const aiCategory =
    useMemo(
      () =>
        normalizeParam(
          params.aiCategory,
        ),
      [
        params.aiCategory,
      ],
    );

  const aiSearchQuery =
    useMemo(
      () =>
        normalizeParam(
          params.aiSearchQuery,
        ),
      [
        params.aiSearchQuery,
      ],
    );

  const aiKeywords =
    useMemo(
      () =>
        parseAiKeywords(
          params.aiKeywords,
        ),
      [
        params.aiKeywords,
      ],
    );

  const aiMode =
    useMemo(
      () =>
        normalizeAiMode(
          params.aiMode,
        ),
      [
        params.aiMode,
      ],
    );

  const aiConfidence =
    useMemo(() => {
      const value =
        normalizeNumber(
          normalizeParam(
            params.aiConfidence,
          ),
          0,
        );

      return Math.min(
        1,
        Math.max(
          0,
          value,
        ),
      );
    }, [
      params.aiConfidence,
    ]);

  const hasSmartSearch =
    Boolean(
      aiPartName ||
      aiSearchQuery ||
      aiKeywords.length >
        0 ||
      equipmentId ||
      equipmentName ||
      brandId ||
      brandName,
    );

  /* ============================================================
     STATE
  ============================================================ */

  const [
    products,
    setProducts,
  ] =
    useState<
      ProductWithDeal[]
    >([]);

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    searchFocused,
    setSearchFocused,
  ] =
    useState(false);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const [
    showAllProducts,
    setShowAllProducts,
  ] =
    useState(false);

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

  const requestIdRef =
    useRef(0);

  /* ============================================================
     RESET SMART FALLBACK
  ============================================================ */

  useEffect(() => {
    setShowAllProducts(
      false,
    );
  }, [
    aiPartName,
    aiSearchQuery,
    equipmentId,
    brandId,
  ]);

  /* ============================================================
     LOAD PRODUCTS
  ============================================================ */

  const loadProducts =
    useCallback(
      async () => {
        const requestId =
          ++requestIdRef.current;

        try {
          setError(
            null,
          );

          const productsQuery =
            query(
              collection(
                db,
                "products",
              ),
              where(
                "status",
                "==",
                "active",
              ),
            );

          const snapshot =
            await getDocs(
              productsQuery,
            );

          const activeProducts =
            snapshot.docs.reduce<
              Product[]
            >(
              (
                items,
                productDoc,
              ) => {
                const data =
                  productDoc.data();

                const name =
                  normalizeString(
                    data.name,
                  );

                if (
                  !name
                ) {
                  return items;
                }

                const price =
                  normalizeNumber(
                    data.price,
                    0,
                  );

                if (
                  price < 0
                ) {
                  return items;
                }

                const stock =
                  normalizeCount(
                    data.stock,
                  );

                const status =
                  normalizeStatus(
                    data.status,
                    stock,
                  );

                if (
                  status !==
                  "active"
                ) {
                  return items;
                }

                const serviceIds =
                  normalizeStringArray(
                    data.serviceIds,
                  );

                const equipmentIds =
                  normalizeStringArray(
                    data.equipmentIds,
                  );

                const equipmentNames =
                  normalizeStringArray(
                    data.equipmentNames,
                  );

                const keywords =
                  normalizeStringArray(
                    data.keywords ??
                      data.searchKeywords,
                  );

                const tags =
                  normalizeStringArray(
                    data.tags,
                  );

                items.push({
                  id:
                    productDoc.id,

                  name,

                  price,

                  thumbnail:
                    normalizeString(
                      data.thumbnail,
                    ),

                  rating:
                    normalizeRating(
                      data.rating,
                    ),

                  workerRating:
                    0,

                  sold:
                    normalizeCount(
                      data.sold,
                    ),

                  favoriteCount:
                    normalizeCount(
                      data.favoriteCount,
                    ),

                  ratingCount:
                    normalizeCount(
                      data.ratingCount,
                    ),

                  reviewCount:
                    normalizeCount(
                      data.reviewCount,
                    ),

                  stock,

                  status,

                  category:
                    normalizeString(
                      data.category,
                    ) ||
                    undefined,

                  categoryId:
                    normalizeString(
                      data.categoryId,
                    ) ||
                    undefined,

                  workerId:
                    normalizeString(
                      data.workerId,
                    ) ||
                    undefined,

                  storeId:
                    normalizeString(
                      data.storeId,
                    ) ||
                    undefined,

                  serviceId:
                    normalizeString(
                      data.serviceId,
                    ) ||
                    undefined,

                  serviceIds,

                  brandId:
                    normalizeString(
                      data.brandId,
                    ) ||
                    undefined,

                  brandName:
                    normalizeString(
                      data.brandName ??
                        data.brand,
                    ) ||
                    undefined,

                  equipmentId:
                    normalizeString(
                      data.equipmentId,
                    ) ||
                    undefined,

                  equipmentIds,

                  equipmentName:
                    normalizeString(
                      data.equipmentName,
                    ) ||
                    undefined,

                  equipmentNames,

                  keywords,

                  tags,
                });

                return items;
              },
              [],
            );

          /* ====================================================
             DEFAULT CATALOG ORDER
          ==================================================== */

          activeProducts.sort(
            (
              a,
              b,
            ) =>
              b.sold -
              a.sold,
          );

          /* ====================================================
             WORKER IDS
          ==================================================== */

          const workerIds =
            Array.from(
              new Set(
                activeProducts
                  .map(
                    product =>
                      product.workerId ??
                      "",
                  )
                  .filter(
                    workerId =>
                      workerId.length >
                      0,
                  ),
              ),
            );

          /* ====================================================
             WORKER RATINGS
          ==================================================== */

          const workerRatings =
            new Map<
              string,
              number
            >();

          const workerIdBatches =
            chunkWorkerIds(
              workerIds,
            );

          if (
            workerIdBatches.length >
            0
          ) {
            const workerSnapshots =
              await Promise.all(
                workerIdBatches.map(
                  workerIdBatch =>
                    getDocs(
                      query(
                        collection(
                          db,
                          "workerPublicProfiles",
                        ),
                        where(
                          documentId(),
                          "in",
                          workerIdBatch,
                        ),
                      ),
                    ),
                ),
              );

            if (
              requestId !==
              requestIdRef.current
            ) {
              return;
            }

            for (
              const workerSnapshot of
              workerSnapshots
            ) {
              for (
                const workerDoc of
                workerSnapshot.docs
              ) {
                const workerData =
                  workerDoc.data();

                workerRatings.set(
                  workerDoc.id,
                  normalizeWorkerRating(
                    workerData.rating,
                  ),
                );
              }
            }
          }

          /* ====================================================
             MERGE WORKER RATINGS
          ==================================================== */

          const productsWithWorkerRatings:
            Product[] =
            activeProducts.map(
              product => ({
                ...product,

                workerRating:
                  product.workerId
                    ? workerRatings.get(
                        product.workerId,
                      ) ??
                      0
                    : 0,
              }),
            );

          /* ====================================================
             ACTIVE DEALS
          ==================================================== */

          const productIds =
            productsWithWorkerRatings.map(
              product =>
                product.id,
            );

          const dealsByProductId =
            productIds.length >
              0
              ? await getActiveProductDeals(
                  productIds,
                )
              : new Map();

          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          /* ====================================================
             MERGE PRODUCTS + DEALS
          ==================================================== */

          const productsWithDeals:
            ProductWithDeal[] =
            productsWithWorkerRatings.map(
              product => {
                const deal =
                  dealsByProductId.get(
                    product.id,
                  ) ??
                  null;

                return {
                  ...product,

                  activeDeal:
                    getValidDeal(
                      product,
                      deal,
                    ),
                };
              },
            );

          setProducts(
            productsWithDeals,
          );
        } catch (
          loadError: unknown
        ) {
          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          if (
            __DEV__
          ) {
            console.warn(
              "BUY_SPARE_PARTS_LOAD_ERROR:",
              loadError,
            );
          }

          setError(
            "Unable to load spare parts. Please try again.",
          );
        } finally {
          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          setLoading(
            false,
          );

          setRefreshing(
            false,
          );
        }
      },
      [],
    );

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    void loadProducts();

    return () => {
      requestIdRef.current +=
        1;
    };
  }, [
    loadProducts,
  ]);

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
                  normalizeString(
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

            subscriptionError => {
              if (
                __DEV__
              ) {
                console.error(
                  "SPARE_PART_RATING_COUNT_ERROR",
                  {
                    productId,
                    error:
                      subscriptionError,
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

            subscriptionError => {
              if (
                __DEV__
              ) {
                console.error(
                  "SPARE_PART_REVIEW_COUNT_ERROR",
                  {
                    productId,
                    error:
                      subscriptionError,
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
     REFRESH
  ============================================================ */

  const handleRefresh =
    useCallback(() => {
      if (
        refreshing
      ) {
        return;
      }

      setRefreshing(
        true,
      );

      void loadProducts();
    }, [
      loadProducts,
      refreshing,
    ]);

  /* ============================================================
     MANUAL SEARCH
  ============================================================ */

  const normalizedSearch =
    normalizeSearch(
      search,
    );

  const hasManualSearch =
    normalizedSearch.length >
    0;

  /* ============================================================
     AI RANKING
  ============================================================ */

  const smartRankedProducts =
    useMemo(() => {
      if (
        !hasSmartSearch
      ) {
        return products;
      }

      const ranked:
        RankedProduct[] =
        products
          .map(
            product => ({
              product,

              score:
                calculateAiMatchScore({
                  product,

                  aiPartName,

                  aiCategory,

                  aiSearchQuery,

                  aiKeywords,

                  equipmentId,

                  equipmentName,

                  brandId,

                  brandName,
                }),
            }),
          )
          .filter(
            item =>
              item.score >
              0,
          );

      ranked.sort(
        (
          a,
          b,
        ) => {
          if (
            a.score !==
            b.score
          ) {
            return (
              b.score -
              a.score
            );
          }

          return (
            b.product.sold -
            a.product.sold
          );
        },
      );

      return ranked.map(
        item =>
          item.product,
      );
    }, [
      aiCategory,
      aiKeywords,
      aiPartName,
      aiSearchQuery,
      brandId,
      brandName,
      equipmentId,
      equipmentName,
      hasSmartSearch,
      products,
    ]);

  /* ============================================================
     FINAL PRODUCTS
  ============================================================ */

  const filteredProducts =
    useMemo(() => {
      if (
        hasManualSearch
      ) {
        return products
          .filter(
            product =>
              matchesManualSearch(
                product,
                normalizedSearch,
              ),
          )
          .sort(
            (
              a,
              b,
            ) =>
              b.sold -
              a.sold,
          );
      }

      if (
        hasSmartSearch &&
        !showAllProducts
      ) {
        return smartRankedProducts;
      }

      return products;
    }, [
      hasManualSearch,
      hasSmartSearch,
      normalizedSearch,
      products,
      showAllProducts,
      smartRankedProducts,
    ]);

  /* ============================================================
     SMART SEARCH TITLE
  ============================================================ */

  const smartSearchTitle =
    useMemo(() => {
      if (
        aiPartName
      ) {
        return `Matching ${aiPartName}`;
      }

      if (
        equipmentName
      ) {
        return `Parts for ${equipmentName}`;
      }

      return "Fixxam smart match";
    }, [
      aiPartName,
      equipmentName,
    ]);

  /* ============================================================
     SMART SEARCH DESCRIPTION
  ============================================================ */

  const smartSearchDescription =
    useMemo(() => {
      if (
        aiPartName &&
        equipmentName
      ) {
        return `Showing the closest catalog matches for ${aiPartName} and your selected ${equipmentName}.`;
      }

      if (
        aiPartName
      ) {
        return `Showing products that best match ${aiPartName}.`;
      }

      if (
        equipmentName
      ) {
        return `Showing products that best match your selected ${equipmentName}.`;
      }

      if (
        aiSearchQuery
      ) {
        return `Showing products that best match "${aiSearchQuery}".`;
      }

      return "Showing the closest matches from Fixxam stores.";
    }, [
      aiPartName,
      aiSearchQuery,
      equipmentName,
    ]);

  /* ============================================================
     OPEN PRODUCT
  ============================================================ */

  const handleBuy =
    useCallback(
      (
        product:
          ProductWithDeal,
      ) => {
        if (
          product.stock <=
            0 ||
          product.status !==
            "active"
        ) {
          return;
        }

        const productId =
          normalizeString(
            product.id,
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
        product:
          ProductWithDeal,
      ) => {
        const productId =
          normalizeString(
            product.id,
          );

        if (
          !productId ||
          ratingLoading[
            productId
          ]
        ) {
          return;
        }

        setRatingLoading(
          current => ({
            ...current,

            [productId]:
              true,
          }),
        );

        try {
          await toggleProductRating(
            productId,
          );
        } catch (
          ratingError
        ) {
          if (
            __DEV__
          ) {
            console.error(
              "SPARE_PART_RATING_ERROR",
              {
                productId,

                error:
                  ratingError,
              },
            );
          }

          Alert.alert(
            "Rating",
            ratingError instanceof
              Error
              ? ratingError.message
              : "Unable to update product rating.",
          );
        } finally {
          setRatingLoading(
            current => ({
              ...current,

              [productId]:
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
        product:
          ProductWithDeal,
      ) => {
        const productId =
          normalizeString(
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
          normalizeString(
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
    useCallback(() => {
      if (
        reviewSubmitting
      ) {
        return;
      }

      setSelectedReviewProduct(
        null,
      );
    }, [
      reviewSubmitting,
    ]);

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
             PRESERVE EXISTING WORKER RATING FLOW
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
          reviewError
        ) {
          if (
            __DEV__
          ) {
            console.error(
              "SPARE_PART_REVIEW_ERROR",
              {
                productId:
                  selectedReviewProduct.id,

                workerId:
                  selectedReviewProduct.workerId,

                error:
                  reviewError,
              },
            );
          }

          Alert.alert(
            "Review",
            reviewError instanceof
              Error
              ? reviewError.message
              : "Unable to submit your review.",
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
     BACK
  ============================================================ */

  const handleBack =
    useCallback(() => {
      if (
        router.canGoBack()
      ) {
        router.back();

        return;
      }

      router.replace(
        "/(customer)/buy-spare-parts/find-part",
      );
    }, []);

  /* ============================================================
     CLEAR SEARCH
  ============================================================ */

  const handleClearSearch =
    useCallback(() => {
      setSearch("");
    }, []);

  /* ============================================================
     SHOW ALL
  ============================================================ */

  const handleShowAll =
    useCallback(() => {
      setSearch("");

      setShowAllProducts(
        true,
      );
    }, []);

  /* ============================================================
     RETURN TO SMART MATCH
  ============================================================ */

  const handleReturnToSmartMatches =
    useCallback(() => {
      setSearch("");

      setShowAllProducts(
        false,
      );
    }, []);

  /* ============================================================
     RETRY
  ============================================================ */

  const handleRetry =
    useCallback(() => {
      if (
        loading
      ) {
        return;
      }

      setLoading(
        true,
      );

      void loadProducts();
    }, [
      loadProducts,
      loading,
    ]);

  /* ============================================================
     RENDER PRODUCT
  ============================================================ */

  const renderProduct =
    useCallback(
      ({
        item,
      }: {
        item:
          ProductWithDeal;
      }) => {
        const productId =
          normalizeString(
            item.id,
          );

        const productWithCounts:
          ProductWithDeal = {
          ...item,

          ratingCount:
            ratingCounts[
              productId
            ] ??
            0,

          reviewCount:
            reviewCounts[
              productId
            ] ??
            0,
        };

        return (
          <SparePartCard
            product={
              productWithCounts
            }
            onBuy={
              handleBuy
            }
            onRating={
              handleProductRating
            }
            onReview={
              handleReviewPress
            }
          />
        );
      },
      [
        handleBuy,
        handleProductRating,
        handleReviewPress,
        ratingCounts,
        reviewCounts,
      ],
    );

  /* ============================================================
     LOADING
  ============================================================ */

  if (
    loading &&
    products.length ===
      0
  ) {
    return (
      <AppScreen
        role="customer"
        padded={false}
      >
        <View
          style={
            styles.loadingContainer
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
            Loading spare parts...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     LIST HEADER
  ============================================================ */

  const listHeader = (
    <>
      <View
        style={
          styles.header
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={
            8
          }
          onPress={
            handleBack
          }
          style={({
            pressed,
          }) => [
            styles.backButton,

            pressed
              ? styles.backButtonPressed
              : null,
          ]}
        >
          <AppIcon
            name="back"
            role="customer"
            size="sm"
            state="default"
          />
        </Pressable>

        <View
          style={
            styles.headerContent
          }
        >
          <AppText
            variant="heading1"
            weight="bold"
            numberOfLines={
              1
            }
          >
            Fixxam Spare Parts
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={
              1
            }
            style={
              styles.headerSubtitle
            }
          >
            Find parts from verified
            Fixxam stores
          </AppText>
        </View>
      </View>

      {hasSmartSearch &&
      !hasManualSearch ? (
        <View
          style={
            styles.smartMatchCard
          }
        >
          <View
            style={
              styles.smartMatchIcon
            }
          >
            <AppIcon
              name="search"
              role="customer"
              size="sm"
              state="active"
            />
          </View>

          <View
            style={
              styles.smartMatchContent
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              numberOfLines={
                1
              }
            >
              {showAllProducts
                ? "Showing all spare parts"
                : smartSearchTitle}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.smartMatchDescription
              }
            >
              {showAllProducts
                ? "Smart matching is paused while you browse the full catalog."
                : smartSearchDescription}
            </AppText>

            {!showAllProducts &&
            aiMode !==
              "equipment" &&
            aiConfidence >
              0 ? (
              <AppText
                variant="caption"
                tone="muted"
                style={
                  styles.confidenceText
                }
              >
                Match confidence:{" "}
                {Math.round(
                  aiConfidence *
                    100,
                )}
                %
              </AppText>
            ) : null}

            {showAllProducts ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Return to smart matches"
                onPress={
                  handleReturnToSmartMatches
                }
                style={
                  styles.smartLink
                }
              >
                <AppText
                  variant="caption"
                  weight="bold"
                  style={
                    styles.smartLinkText
                  }
                >
                  Return to smart matches
                </AppText>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}

      <View
        style={[
          styles.searchContainer,

          searchFocused
            ? styles.searchContainerFocused
            : null,
        ]}
      >
        <AppIcon
          name="search"
          role="customer"
          size="sm"
          state={
            searchFocused
              ? "active"
              : "muted"
          }
        />

        <TextInput
          value={
            search
          }
          onChangeText={
            setSearch
          }
          onFocus={() => {
            setSearchFocused(
              true,
            );
          }}
          onBlur={() => {
            setSearchFocused(
              false,
            );
          }}
          placeholder="Search for a spare part..."
          placeholderTextColor={
            Colors.textMuted
          }
          selectionColor={
            CustomerColors.primary
          }
          autoCorrect={
            false
          }
          autoCapitalize="none"
          returnKeyType="search"
          accessibilityLabel="Search for a spare part"
          style={
            styles.searchInput
          }
        />

        {hasManualSearch ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={
              8
            }
            onPress={
              handleClearSearch
            }
            style={({
              pressed,
            }) => [
              styles.clearButton,

              pressed
                ? styles.clearButtonPressed
                : null,
            ]}
          >
            <AppIcon
              name="close"
              role="customer"
              size="xs"
              state="muted"
            />
          </Pressable>
        ) : null}
      </View>

      {hasManualSearch &&
      hasSmartSearch ? (
        <View
          style={
            styles.manualSearchNotice
          }
        >
          <AppText
            variant="caption"
            tone="secondary"
          >
            Searching the full Fixxam catalog
            for "{search.trim()}".
          </AppText>
        </View>
      ) : null}

      {error &&
      products.length >
        0 ? (
        <View
          style={
            styles.refreshError
          }
        >
          <AppIcon
            name="warning"
            role="customer"
            size="xs"
            state="warning"
          />

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.refreshErrorText
            }
          >
            Couldn't refresh the latest
            products. Showing previously
            loaded results.
          </AppText>
        </View>
      ) : null}
    </>
  );

  /* ============================================================
     EMPTY STATE
  ============================================================ */

  const listEmpty =
    error &&
    products.length ===
      0 ? (
      <View
        style={
          styles.emptyContainer
        }
      >
        <View
          style={[
            styles.emptyIcon,
            styles.errorIcon,
          ]}
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
            styles.emptyTitle
          }
        >
          Something went wrong
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.emptyDescription
          }
        >
          {error}
        </AppText>

        <AppButton
          title="Try Again"
          role="customer"
          leftIconName="refresh"
          onPress={
            handleRetry
          }
          style={
            styles.emptyAction
          }
        />
      </View>
    ) : (
      <View
        style={
          styles.emptyContainer
        }
      >
        <View
          style={
            styles.emptyIcon
          }
        >
          <MaterialCommunityIcons
            name="package-variant-closed"
            size={
              FixxamTokens.size
                .iconXl
            }
            color={
              Colors.textMuted
            }
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
          {hasManualSearch
            ? "No Spare Parts Found"
            : hasSmartSearch &&
                !showAllProducts
              ? "No Matching Parts Found"
              : "No Spare Parts Available"}
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.emptyDescription
          }
        >
          {hasManualSearch
            ? `No spare part matches "${search.trim()}".`
            : hasSmartSearch &&
                !showAllProducts
              ? "We couldn't find a close match in the current Fixxam catalog. You can browse all available spare parts instead."
              : "There are no spare parts available yet."}
        </AppText>

        {hasManualSearch ? (
          <AppButton
            title="Clear Search"
            role="customer"
            variant="outline"
            leftIconName="close"
            onPress={
              handleClearSearch
            }
            style={
              styles.emptyAction
            }
          />
        ) : null}

        {!hasManualSearch &&
        hasSmartSearch &&
        !showAllProducts &&
        products.length >
          0 ? (
          <AppButton
            title="Show All Spare Parts"
            role="customer"
            variant="outline"
            leftIconName="search"
            onPress={
              handleShowAll
            }
            style={
              styles.emptyAction
            }
          />
        ) : null}
      </View>
    );

  /* ============================================================
     UI
  ============================================================ */

  return (
    <AppScreen
      role="customer"
      padded={false}
    >
      <FlatList
        data={
          filteredProducts
        }
        keyExtractor={(
          item,
        ) =>
          item.id
        }
        renderItem={
          renderProduct
        }
        ItemSeparatorComponent={
          ProductSeparator
        }
        ListHeaderComponent={
          listHeader
        }
        ListEmptyComponent={
          listEmpty
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshing={
          refreshing
        }
        onRefresh={
          handleRefresh
        }
        initialNumToRender={
          8
        }
        maxToRenderPerBatch={
          8
        }
        windowSize={
          7
        }
        contentContainerStyle={
          styles.listContent
        }
        style={
          styles.screen
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
    </AppScreen>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,

      backgroundColor:
        Colors.background,
    },

    listContent: {
      flexGrow: 1,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    header: {
      minHeight:
        FixxamTokens.size
          .headerHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingVertical:
        FixxamTokens.spacing.sm,
    },

    backButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius
          .iconButton,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    backButtonPressed: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primarySoft,

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

    headerContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    headerSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    smartMatchCard: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      marginBottom:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        CustomerColors.primary,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    smartMatchIcon: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius
          .iconButton,

      backgroundColor:
        Colors.surface,
    },

    smartMatchContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    smartMatchDescription: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    confidenceText: {
      marginTop:
        FixxamTokens.spacing.xs,
    },

    smartLink: {
      alignSelf:
        "flex-start",

      marginTop:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xxs,
    },

    smartLinkText: {
      color:
        CustomerColors.primary,
    },

    searchContainer: {
      minHeight:
        FixxamTokens.size
          .inputHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        FixxamTokens.spacing.lg,

      paddingLeft:
        FixxamTokens.spacing.md,

      paddingRight:
        FixxamTokens.spacing.xs,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.search,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    searchContainerFocused: {
      borderColor:
        CustomerColors.primary,
    },

    searchInput: {
      flex: 1,

      minWidth: 0,

      minHeight:
        FixxamTokens.size
          .inputHeight,

      marginLeft:
        FixxamTokens.spacing.sm,

      paddingHorizontal: 0,

      paddingVertical: 0,

      fontSize:
        Typography.fontSize.md,

      color:
        Colors.textPrimary,
    },

    clearButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius
          .iconButton,
    },

    clearButtonPressed: {
      backgroundColor:
        CustomerColors.primarySoft,

      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    manualSearchNotice: {
      marginTop:
        -FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.md,
    },

    refreshError: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      marginBottom:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.warning,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.warningSoft,
    },

    refreshErrorText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.xs,
    },

    separator: {
      height:
        FixxamTokens.spacing.md,
    },

    emptyContainer: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingVertical:
        FixxamTokens.spacing.xxxl,
    },

    emptyIcon: {
      width:
        FixxamTokens.size
          .avatarXl,

      height:
        FixxamTokens.size
          .avatarXl,

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
      backgroundColor:
        Colors.errorSoft,
    },

    emptyTitle: {
      marginTop:
        FixxamTokens.spacing.md,
    },

    emptyDescription: {
      maxWidth: 340,

      marginTop:
        FixxamTokens.spacing.sm,
    },

    emptyAction: {
      minWidth: 190,

      marginTop:
        FixxamTokens.spacing.lg,
    },

    loadingContainer: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.background,
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.md,
    },
  });