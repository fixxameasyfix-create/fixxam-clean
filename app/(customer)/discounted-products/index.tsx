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
  doc,
  getDoc,
} from "firebase/firestore";

import Toast from "react-native-toast-message";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import ProductGridCard from "@/components/customer/home/ProductGridCard";

import ProductReviewModal from "@/components/customer/home/ProductReviewModal";

import useCurrentLocation from "@/hooks/location/useCurrentLocation";

import {
  getNearbyDiscountedProducts,
  type DiscountedProduct,
} from "@/firebase/queries/discountedProducts";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  subscribeToProductRatingCount,
  toggleProductRating,
} from "@/services/productRatingService";

import {
  createProductReview,
  subscribeToProductReviewCount,
} from "@/services/productReviewService";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   CONSTANTS
============================================================== */

const MAX_DISCOUNTED_PRODUCTS =
  20;

const LOCATION_WAIT_TIMEOUT_MS =
  12_000;

/* ==============================================================
   TYPES
============================================================== */

type SelectedReviewProduct = {
  id: string;

  name: string;

  workerId: string;
};

/* ==============================================================
   HELPERS
============================================================== */

function isValidCoordinate(
  value: unknown,
): value is number {
  return (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    )
  );
}

function normalizeString(
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

function isValidDiscountedProduct(
  item: DiscountedProduct,
): boolean {
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
    originalPrice >
      0 &&
    Number.isFinite(
      discountedPrice,
    ) &&
    discountedPrice >
      0 &&
    discountedPrice <
      originalPrice &&
    Number.isFinite(
      discountPercentage,
    ) &&
    discountPercentage >
      0 &&
    discountPercentage <
      100
  );
}

function formatDistance(
  value: unknown,
): string {
  const distance =
    Number(
      value,
    );

  if (
    !Number.isFinite(
      distance,
    ) ||
    distance < 0
  ) {
    return "";
  }

  if (
    distance < 1
  ) {
    return `${Math.round(
      distance *
        1000,
    )} m away`;
  }

  return `${distance.toFixed(
    1,
  )} km away`;
}

/* ==============================================================
   SCREEN
============================================================== */

export default function DiscountedProductsScreen() {
  const [
    products,
    setProducts,
  ] =
    useState<
      DiscountedProduct[]
    >([]);

  const [
    claimed,
    setClaimed,
  ] =
    useState(false);

  const [
    claiming,
    setClaiming,
  ] =
    useState(false);

  const [
    waitingForLocation,
    setWaitingForLocation,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  /* ============================================================
     RATING / REVIEW STATE
  ============================================================ */

  const [
    ratingCounts,
    setRatingCounts,
  ] =
    useState<
      Record<
        string,
        number
      >
    >({});

  const [
    reviewCounts,
    setReviewCounts,
  ] =
    useState<
      Record<
        string,
        number
      >
    >({});

  const [
    ratingLoading,
    setRatingLoading,
  ] =
    useState<
      Record<
        string,
        boolean
      >
    >({});

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

  const {
    location,
    loading:
      locationLoading,
    error:
      locationError,
    refresh,
  } =
    useCurrentLocation();

  /* ============================================================
     LOAD NEARBY DEALS
  ============================================================ */

  const loadNearbyDeals =
    useCallback(
      async (
        latitude: number,
        longitude: number,
      ) => {
        if (
          !isValidCoordinate(
            latitude,
          ) ||
          !isValidCoordinate(
            longitude,
          )
        ) {
          setClaiming(
            false,
          );

          setError(
            "Your current location is invalid. Please refresh your location and try again.",
          );

          return;
        }

        const requestId =
          ++requestIdRef.current;

        setError(
          null,
        );

        setClaiming(
          true,
        );

        try {
          const nearbyDeals =
            await getNearbyDiscountedProducts(
              {
                latitude,
                longitude,
              },
            );

          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          const validProducts =
            nearbyDeals
              .filter(
                isValidDiscountedProduct,
              )
              .slice(
                0,
                MAX_DISCOUNTED_PRODUCTS,
              );

          setProducts(
            validProducts,
          );

          setClaimed(
            true,
          );
        } catch (
          err
        ) {
          if (
            __DEV__
          ) {
            console.warn(
              "DISCOUNTED_PRODUCTS_LOAD_ERROR:",
              err,
            );
          }

          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          setProducts(
            [],
          );

          setClaimed(
            true,
          );

          setError(
            "Unable to find discounted products near you. Please try again.",
          );
        } finally {
          if (
            requestId ===
            requestIdRef.current
          ) {
            setClaiming(
              false,
            );
          }
        }
      },
      [],
    );

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
                (
                  item,
                ) =>
                  normalizeString(
                    item.product.id,
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
     REALTIME RATING + REVIEW COUNTS
  ============================================================ */

  useEffect(() => {
    if (
      productIds.length ===
      0
    ) {
      setRatingCounts(
        {},
      );

      setReviewCounts(
        {},
      );

      return;
    }

    const unsubscribers:
      Array<
        () => void
      > = [];

    productIds.forEach(
      (
        productId,
      ) => {
        const unsubscribeRating =
          subscribeToProductRatingCount(
            productId,
            (
              count,
            ) => {
              setRatingCounts(
                (
                  current,
                ) => ({
                  ...current,

                  [productId]:
                    count,
                }),
              );
            },
            (
              subscriptionError,
            ) => {
              if (
                __DEV__
              ) {
                console.warn(
                  "DISCOUNTED_PRODUCT_RATING_COUNT_ERROR:",
                  {
                    productId,
                    error:
                      subscriptionError,
                  },
                );
              }
            },
          );

        const unsubscribeReview =
          subscribeToProductReviewCount(
            productId,
            (
              count,
            ) => {
              setReviewCounts(
                (
                  current,
                ) => ({
                  ...current,

                  [productId]:
                    count,
                }),
              );
            },
            (
              subscriptionError,
            ) => {
              if (
                __DEV__
              ) {
                console.warn(
                  "DISCOUNTED_PRODUCT_REVIEW_COUNT_ERROR:",
                  {
                    productId,
                    error:
                      subscriptionError,
                  },
                );
              }
            },
          );

        unsubscribers.push(
          unsubscribeRating,
          unsubscribeReview,
        );
      },
    );

    return () => {
      unsubscribers.forEach(
        (
          unsubscribe,
        ) => {
          unsubscribe();
        },
      );
    };
  }, [
    productIds,
  ]);

  /* ============================================================
     WAIT FOR LOCATION
  ============================================================ */

  useEffect(() => {
    if (
      !waitingForLocation
    ) {
      return;
    }

    if (
      location &&
      isValidCoordinate(
        location.latitude,
      ) &&
      isValidCoordinate(
        location.longitude,
      )
    ) {
      setWaitingForLocation(
        false,
      );

      void loadNearbyDeals(
        location.latitude,
        location.longitude,
      );
    }
  }, [
    loadNearbyDeals,
    location,
    waitingForLocation,
  ]);

  /* ============================================================
     LOCATION ERROR
  ============================================================ */

  useEffect(() => {
    if (
      !waitingForLocation ||
      locationLoading ||
      !locationError
    ) {
      return;
    }

    if (
      location &&
      isValidCoordinate(
        location.latitude,
      ) &&
      isValidCoordinate(
        location.longitude,
      )
    ) {
      return;
    }

    setWaitingForLocation(
      false,
    );

    setClaiming(
      false,
    );

    setError(
      locationError ||
        "Unable to get your current location. Please enable location and try again.",
    );
  }, [
    location,
    locationError,
    locationLoading,
    waitingForLocation,
  ]);

  /* ============================================================
     LOCATION TIMEOUT
  ============================================================ */

  useEffect(() => {
    if (
      !waitingForLocation
    ) {
      return;
    }

    const timeout =
      setTimeout(
        () => {
          setWaitingForLocation(
            false,
          );

          setClaiming(
            false,
          );

          setError(
            "Unable to get your current location. Please check your location settings and try again.",
          );
        },
        LOCATION_WAIT_TIMEOUT_MS,
      );

    return () => {
      clearTimeout(
        timeout,
      );
    };
  }, [
    waitingForLocation,
  ]);

  /* ============================================================
     CLEANUP
  ============================================================ */

  useEffect(() => {
    return () => {
      requestIdRef.current +=
        1;
    };
  }, []);

  /* ============================================================
     CLAIM DISCOUNT
  ============================================================ */

  const handleClaimDiscount =
    useCallback(() => {
      if (
        claiming ||
        waitingForLocation
      ) {
        return;
      }

      setError(
        null,
      );

      if (
        location &&
        isValidCoordinate(
          location.latitude,
        ) &&
        isValidCoordinate(
          location.longitude,
        )
      ) {
        void loadNearbyDeals(
          location.latitude,
          location.longitude,
        );

        return;
      }

      setClaiming(
        true,
      );

      setWaitingForLocation(
        true,
      );

      void Promise.resolve(
        refresh(),
      ).catch(
        (
          err,
        ) => {
          if (
            __DEV__
          ) {
            console.warn(
              "DISCOUNT_LOCATION_REFRESH_ERROR:",
              err,
            );
          }

          setWaitingForLocation(
            false,
          );

          setClaiming(
            false,
          );

          setError(
            "Unable to get your current location. Please enable location and try again.",
          );
        },
      );
    }, [
      claiming,
      loadNearbyDeals,
      location,
      refresh,
      waitingForLocation,
    ]);

  /* ============================================================
     RETRY
  ============================================================ */

  const handleRetry =
    useCallback(() => {
      handleClaimDiscount();
    }, [
      handleClaimDiscount,
    ]);

  /* ============================================================
     PRODUCT DETAILS
  ============================================================ */

  const handleProductPress =
    useCallback(
      (
        productId: string,
      ) => {
        const cleanProductId =
          normalizeString(
            productId,
          );

        if (
          !cleanProductId
        ) {
          return;
        }

        router.push({
          pathname:
            "/(customer)/product/[id]",

          params: {
            id:
              cleanProductId,
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
        const cleanProductId =
          normalizeString(
            productId,
          );

        if (
          !cleanProductId ||
          ratingLoading[
            cleanProductId
          ]
        ) {
          return;
        }

        if (
          !auth.currentUser
        ) {
          Alert.alert(
            "Sign in required",
            "Please sign in to rate this product.",
          );

          return;
        }

        setRatingLoading(
          (
            current,
          ) => ({
            ...current,

            [cleanProductId]:
              true,
          }),
        );

        try {
          await toggleProductRating(
            cleanProductId,
          );
        } catch (
          ratingError
        ) {
          if (
            __DEV__
          ) {
            console.warn(
              "DISCOUNTED_PRODUCT_RATING_ERROR:",
              {
                productId:
                  cleanProductId,

                error:
                  ratingError,
              },
            );
          }

          Toast.show({
            type:
              "error",

            text1:
              "Unable to update rating",

            text2:
              "Please try again.",
          });
        } finally {
          setRatingLoading(
            (
              current,
            ) => ({
              ...current,

              [cleanProductId]:
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
        item: DiscountedProduct,
      ) => {
        if (
          !auth.currentUser
        ) {
          Alert.alert(
            "Sign in required",
            "Please sign in to review this product.",
          );

          return;
        }

        const productId =
          normalizeString(
            item.product.id,
          );

        const productName =
          normalizeString(
            item.product.name,
          );

        const workerId =
          normalizeString(
            item.product.workerId,
          );

        if (
          !productId
        ) {
          Toast.show({
            type:
              "error",

            text1:
              "Unable to review product",

            text2:
              "Invalid product.",
          });

          return;
        }

        if (
          !workerId
        ) {
          Toast.show({
            type:
              "error",

            text1:
              "Unable to review product",

            text2:
              "Product owner information is missing.",
          });

          return;
        }

        setSelectedReviewProduct({
          id:
            productId,

          name:
            productName ||
            "Product",

          workerId,
        });
      },
      [],
    );

  /* ============================================================
     CLOSE REVIEW
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
     SUBMIT REVIEW
  ============================================================ */

  const handleSubmitReview =
    useCallback(
      async (
        rating: number,
        comment: string,
      ) => {
        const selectedProduct =
          selectedReviewProduct;

        if (
          !selectedProduct
        ) {
          return;
        }

        const user =
          auth.currentUser;

        if (
          !user
        ) {
          Alert.alert(
            "Sign in required",
            "Please sign in to review this product.",
          );

          return;
        }

        const cleanComment =
          comment.trim();

        if (
          !Number.isFinite(
            rating,
          ) ||
          rating < 1 ||
          rating > 5
        ) {
          Alert.alert(
            "Rating required",
            "Please choose a rating from 1 to 5 stars.",
          );

          return;
        }

        if (
          cleanComment.length <
          3
        ) {
          Alert.alert(
            "Review too short",
            "Please write at least 3 characters.",
          );

          return;
        }

        if (
          cleanComment.length >
          500
        ) {
          Alert.alert(
            "Review too long",
            "Your review cannot exceed 500 characters.",
          );

          return;
        }

        try {
          setReviewSubmitting(
            true,
          );

          const userSnapshot =
            await getDoc(
              doc(
                db,
                "users",
                user.uid,
              ),
            );

          const userData =
            userSnapshot.exists()
              ? userSnapshot.data()
              : {};

          const fullName =
            normalizeString(
              userData.fullName,
            );

          const generatedName =
            [
              normalizeString(
                userData.firstName,
              ),

              normalizeString(
                userData.otherName,
              ),

              normalizeString(
                userData.surname,
              ),
            ]
              .filter(
                Boolean,
              )
              .join(
                " ",
              );

          const customerName =
            fullName ||
            generatedName ||
            normalizeString(
              user.displayName,
            ) ||
            "Customer";

          await createProductReview({
            productId:
              selectedProduct.id,

            productName:
              selectedProduct.name,

            workerId:
              selectedProduct.workerId,

            customerName,

            rating,

            comment:
              cleanComment,
          });

          setSelectedReviewProduct(
            null,
          );

          Toast.show({
            type:
              "success",

            text1:
              "Review submitted",

            text2:
              "Thank you for your review.",
          });
        } catch (
          reviewError
        ) {
          if (
            __DEV__
          ) {
            console.warn(
              "DISCOUNTED_PRODUCT_REVIEW_SUBMIT_ERROR:",
              reviewError,
            );
          }

          Alert.alert(
            "Unable to submit review",
            "Please try again.",
          );
        } finally {
          setReviewSubmitting(
            false,
          );
        }
      },
      [
        selectedReviewProduct,
      ],
    );

  /* ============================================================
     HEADER SUBTITLE
  ============================================================ */

  const headerSubtitle =
    useMemo(() => {
      if (
        !claimed
      ) {
        return "Find discounted products from workers near you.";
      }

      const count =
        products.length;

      if (
        count === 0
      ) {
        return "Discounted products closest to your location.";
      }

      return `${count} discounted ${
        count === 1
          ? "product"
          : "products"
      } closest to you.`;
    }, [
      claimed,
      products.length,
    ]);

  /* ============================================================
     HEADER
  ============================================================ */

  const renderHeader =
    useCallback(
      () => (
        <View
          style={
            styles.header
          }
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={
              6
            }
            onPress={() =>
              router.back()
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
              styles.headerText
            }
          >
            <AppText
              variant="heading2"
              weight="bold"
              numberOfLines={
                2
              }
              style={
                styles.title
              }
            >
              Discounted Products
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.subtitle
              }
            >
              {headerSubtitle}
            </AppText>
          </View>
        </View>
      ),
      [
        headerSubtitle,
      ],
    );

  /* ============================================================
     CLAIM STATE
  ============================================================ */

  const renderClaimState =
    useCallback(
      () => (
        <View
          style={
            styles.stateContainer
          }
        >
          <View
            style={
              styles.claimIconBox
            }
          >
            <AppIcon
              name="payment"
              role="customer"
              size="xl"
              state="active"
            />
          </View>

          <AppText
            variant="heading2"
            weight="bold"
            center
            style={
              styles.stateTitle
            }
          >
            Claim Your Discount
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.stateDescription
            }
          >
            Get access to discounted products available from workers near your current location.
          </AppText>

          {error ? (
            <View
              style={
                styles.inlineError
              }
            >
              <AppIcon
                name="error"
                role="customer"
                size="xs"
                state="error"
              />

              <AppText
                variant="caption"
                style={
                  styles.errorText
                }
              >
                {error}
              </AppText>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Claim discount"
            accessibilityState={{
              disabled:
                claiming ||
                locationLoading,

              busy:
                claiming ||
                waitingForLocation,
            }}
            disabled={
              claiming ||
              locationLoading
            }
            onPress={
              handleClaimDiscount
            }
            style={({
              pressed,
            }) => [
              styles.primaryButton,

              pressed &&
              !claiming
                ? styles.pressed
                : null,

              claiming ||
              locationLoading
                ? styles.buttonDisabled
                : null,
            ]}
          >
            {claiming ||
            waitingForLocation ? (
              <>
                <ActivityIndicator
                  size="small"
                  color={
                    Colors.textInverse
                  }
                />

                <AppText
                  variant="bodyMedium"
                  weight="bold"
                  style={
                    styles.primaryButtonText
                  }
                >
                  {waitingForLocation
                    ? "Getting Location..."
                    : "Finding Deals..."}
                </AppText>
              </>
            ) : (
              <AppText
                variant="bodyMedium"
                weight="bold"
                style={
                  styles.primaryButtonText
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
        waitingForLocation,
      ],
    );

  /* ============================================================
     EMPTY / LOADING / ERROR
  ============================================================ */

  const renderEmpty =
    useCallback(() => {
      if (
        !claimed
      ) {
        return renderClaimState();
      }

      if (
        claiming ||
        waitingForLocation
      ) {
        return (
          <View
            style={
              styles.stateContainer
            }
          >
            <ActivityIndicator
              size="large"
              color={
                CustomerColors.primary
              }
            />

            <AppText
              variant="bodyLarge"
              weight="bold"
              center
              style={
                styles.loadingTitle
              }
            >
              Finding nearby discounts...
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              center
              style={
                styles.stateDescription
              }
            >
              We're checking products closest to your location.
            </AppText>
          </View>
        );
      }

      if (
        error
      ) {
        return (
          <View
            style={
              styles.stateContainer
            }
          >
            <View
              style={
                styles.errorIconBox
              }
            >
              <AppIcon
                name="error"
                role="customer"
                size="xl"
                state="error"
              />
            </View>

            <AppText
              variant="heading3"
              weight="bold"
              center
              style={
                styles.stateTitle
              }
            >
              Something went wrong
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
              accessibilityRole="button"
              accessibilityLabel="Try again"
              onPress={
                handleRetry
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
                variant="bodyMedium"
                weight="bold"
                style={
                  styles.primaryButtonText
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
            styles.stateContainer
          }
        >
          <View
            style={
              styles.emptyIconBox
            }
          >
            <AppIcon
              name="package"
              role="customer"
              size="xl"
              state="muted"
            />
          </View>

          <AppText
            variant="heading3"
            weight="bold"
            center
            style={
              styles.stateTitle
            }
          >
            No discounted products nearby
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.stateDescription
            }
          >
            There are currently no discounted products available near your location.
          </AppText>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Refresh discounted products"
            onPress={
              handleRetry
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
                styles.primaryButtonText
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
      waitingForLocation,
    ]);

  /* ============================================================
     PRODUCT
  ============================================================ */

  const renderProduct =
    useCallback<
      ListRenderItem<DiscountedProduct>
    >(
      ({
        item,
      }) => {
        const product =
          item.product;

        const productId =
          normalizeString(
            product.id,
          );

        const distanceLabel =
          formatDistance(
            item.distance,
          );

        return (
          <View
            style={
              styles.productItem
            }
          >
            <ProductGridCard
              id={
                product.id
              }
              workerId={
                product.workerId
              }
              name={
                product.name
              }
              price={
                product.price
              }
              image={
                product.thumbnail
              }
              rating={
                item.workerRating
              }
              ratingCount={
                ratingCounts[
                  productId
                ] ??
                0
              }
              reviewCount={
                reviewCounts[
                  productId
                ] ??
                0
              }
              activeDeal={
                item.deal
              }
              onRatingPress={() => {
                void handleProductRating(
                  productId,
                );
              }}
              onReviewPress={() => {
                handleReviewPress(
                  item,
                );
              }}
              onPress={() => {
                handleProductPress(
                  productId,
                );
              }}
              onBuy={() => {
                handleProductPress(
                  productId,
                );
              }}
            />

            {distanceLabel ? (
              <View
                style={
                  styles.distanceRow
                }
              >
                <AppIcon
                  name="location"
                  role="customer"
                  size="xs"
                  state="muted"
                />

                <AppText
                  variant="caption"
                  tone="secondary"
                  numberOfLines={
                    1
                  }
                >
                  {distanceLabel}
                </AppText>
              </View>
            ) : null}
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
     KEY EXTRACTOR
  ============================================================ */

  const keyExtractor =
    useCallback(
      (
        item: DiscountedProduct,
      ) =>
        item.product.id,
      [],
    );

  /* ============================================================
     MAIN
  ============================================================ */

  return (
    <>
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
            claimed
              ? products
              : []
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
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.list,

            products.length ===
            0
              ? styles.emptyList
              : null,
          ]}
          columnWrapperStyle={
            claimed &&
            products.length >
              0
              ? styles.row
              : undefined
          }
          ListHeaderComponent={
            renderHeader
          }
          ListEmptyComponent={
            renderEmpty
          }
          initialNumToRender={
            6
          }
          maxToRenderPerBatch={
            8
          }
          windowSize={
            5
          }
        />
      </SafeAreaView>

      {/* ======================================================
          REVIEW MODAL
      ====================================================== */}

      <ProductReviewModal
        visible={
          selectedReviewProduct !==
          null
        }
        productName={
          selectedReviewProduct?.name ??
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
    screen: {
      flex:
        1,

      backgroundColor:
        Colors.background,
    },

    header: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.md,

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
        FixxamTokens.spacing.md,

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    headerText: {
      flex:
        1,

      minWidth:
        0,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight:
        21,
    },

    stateContainer: {
      minHeight:
        420,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xxl,

      paddingVertical:
        FixxamTokens.spacing.xxl,
    },

    claimIconBox: {
      width:
        80,

      height:
        80,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    errorIconBox: {
      width:
        80,

      height:
        80,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.errorSoft,
    },

    emptyIconBox: {
      width:
        80,

      height:
        80,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    stateTitle: {
      marginTop:
        FixxamTokens.spacing.lg,

      color:
        Colors.textPrimary,
    },

    stateDescription: {
      maxWidth:
        330,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight:
        22,
    },

    loadingTitle: {
      marginTop:
        FixxamTokens.spacing.lg,

      color:
        Colors.textPrimary,
    },

    inlineError: {
      maxWidth:
        340,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        FixxamTokens.spacing.xs,

      marginTop:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.errorSoft,
    },

    errorText: {
      flex:
        1,

      color:
        Colors.error,

      lineHeight:
        18,
    },

    primaryButton: {
      minWidth:
        210,

      minHeight:
        FixxamTokens.size
          .buttonHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.xl,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    retryButton: {
      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      marginTop:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    primaryButtonText: {
      color:
        Colors.textInverse,
    },

    buttonDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
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

    list: {
      flexGrow:
        1,

      paddingBottom:
        FixxamTokens.spacing.xxl,
    },

    emptyList: {
      flexGrow:
        1,
    },

    row: {
      gap:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.md,
    },

    productItem: {
      flex:
        1,

      minWidth:
        0,
    },

    distanceRow: {
      minHeight:
        24,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      marginTop:
        FixxamTokens.spacing.xs,
    },
  });