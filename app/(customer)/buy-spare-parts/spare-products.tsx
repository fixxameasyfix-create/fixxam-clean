import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type GestureResponderEvent,
} from "react-native";

import {
  Image,
} from "expo-image";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import {
  router,
} from "expo-router";

import {
  AppButton,
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  db,
} from "@/firebase/config";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
  Typography,
} from "@/theme";

import getActiveProductDeals, {
  type ActiveProductDeal,
} from "@/services/deals/getActiveProductDeal";

/* ==============================================================
   TYPES
============================================================== */

type ProductStatus =
  | "active"
  | "out_of_stock";

type Product = {
  id: string;

  name: string;

  price: number;

  thumbnail: string;

  rating: number;

  sold: number;

  stock: number;

  status: ProductStatus;

  category?: string;

  categoryId?: string;

  workerId?: string;

  storeId?: string;

  serviceId?: string;

  serviceIds?: string[];
};

type ProductWithDeal =
  Product & {
    activeDeal:
      | ActiveProductDeal
      | null;
  };

type SparePartCardProps = {
  product: ProductWithDeal;

  onBuy: (
    product: ProductWithDeal,
  ) => void;
};

/* ==============================================================
   HELPERS
============================================================== */

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

function normalizeNumber(
  value: unknown,
  fallback = 0,
): number {
  if (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    )
  ) {
    return value;
  }

  if (
    typeof value ===
    "string"
  ) {
    const parsed =
      Number(
        value.replace(
          /,/g,
          "",
        ),
      );

    if (
      Number.isFinite(
        parsed,
      )
    ) {
      return parsed;
    }
  }

  return fallback;
}

function normalizeStatus(
  value: unknown,
  stock: number,
): ProductStatus {
  if (
    value ===
    "out_of_stock"
  ) {
    return "out_of_stock";
  }

  if (
    stock <= 0
  ) {
    return "out_of_stock";
  }

  return "active";
}

function normalizeSearch(
  value: string,
): string {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(
      /\s+/g,
      " ",
    );
}

function formatPrice(
  value: number,
): string {
  return `₦${new Intl.NumberFormat(
    "en-NG",
    {
      maximumFractionDigits:
        2,
    },
  ).format(value)}`;
}

function normalizeRating(
  value: unknown,
): number {
  return Math.min(
    5,
    Math.max(
      0,
      normalizeNumber(
        value,
        0,
      ),
    ),
  );
}

function normalizeCount(
  value: unknown,
): number {
  return Math.max(
    0,
    Math.floor(
      normalizeNumber(
        value,
        0,
      ),
    ),
  );
}

/* ==============================================================
   VALID DEAL
============================================================== */

function getValidDeal(
  product: Product,
  deal:
    | ActiveProductDeal
    | null,
): ActiveProductDeal | null {
  if (
    !deal
  ) {
    return null;
  }

  const originalPrice =
    normalizeNumber(
      product.price,
    );

  const discountedPrice =
    normalizeNumber(
      deal.discountedPrice,
    );

  const discountPercentage =
    normalizeNumber(
      deal.discountPercentage,
    );

  if (
    originalPrice <= 0 ||
    discountedPrice <= 0 ||
    discountedPrice >=
      originalPrice
  ) {
    return null;
  }

  if (
    discountPercentage <= 0 ||
    discountPercentage >= 100
  ) {
    return null;
  }

  return deal;
}

/* ==============================================================
   PRODUCT IMAGE
============================================================== */

const ProductImage =
  memo(function ProductImage({
    uri,
  }: {
    uri: string;
  }) {
    const [
      failed,
      setFailed,
    ] =
      useState(false);

    useEffect(() => {
      setFailed(
        false,
      );
    }, [
      uri,
    ]);

    if (
      !uri ||
      failed
    ) {
      return (
        <View
          style={
            styles.imagePlaceholder
          }
        >
          {/* MaterialCommunityIcons intentionally preserved */}
          <MaterialCommunityIcons
            name="image-off-outline"
            size={
              FixxamTokens.size
                .iconLg
            }
            color={
              Colors.textMuted
            }
          />
        </View>
      );
    }

    return (
      <Image
        source={{
          uri,
        }}
        style={
          styles.productImage
        }
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={150}
        accessibilityIgnoresInvertColors
        onError={() => {
          setFailed(
            true,
          );
        }}
      />
    );
  });

/* ==============================================================
   PRODUCT CARD
============================================================== */

const SparePartCard =
  memo(function SparePartCard({
    product,
    onBuy,
  }: SparePartCardProps) {
    const inStock =
      product.stock > 0 &&
      product.status ===
        "active";

    const validDeal =
      getValidDeal(
        product,
        product.activeDeal,
      );

    const hasDeal =
      Boolean(
        validDeal,
      );

    const originalPrice =
      normalizeNumber(
        product.price,
      );

    const discountedPrice =
      hasDeal
        ? normalizeNumber(
            validDeal
              ?.discountedPrice,
          )
        : originalPrice;

    const discountPercentage =
      hasDeal
        ? normalizeNumber(
            validDeal
              ?.discountPercentage,
          )
        : 0;

    /* ==========================================================
       OPEN
    ========================================================== */

    const handleOpen =
      useCallback(() => {
        onBuy(
          product,
        );
      }, [
        onBuy,
        product,
      ]);

    /* ==========================================================
       BUY
    ========================================================== */

    const handleBuyPress =
      useCallback(
        (
          event:
            GestureResponderEvent,
        ) => {
          event.stopPropagation();

          if (
            !inStock
          ) {
            return;
          }

          onBuy(
            product,
          );
        },
        [
          inStock,
          onBuy,
          product,
        ],
      );

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${product.name}`}
        accessibilityHint="Opens spare part details"
        onPress={
          handleOpen
        }
        style={({
          pressed,
        }) => [
          styles.productCard,

          pressed
            ? styles.productCardPressed
            : null,
        ]}
      >
        {/* ====================================================
            IMAGE
        ==================================================== */}

        <View
          style={
            styles.imageContainer
          }
        >
          <ProductImage
            uri={
              product.thumbnail
            }
          />

          {hasDeal ? (
            <View
              style={
                styles.discountBadge
              }
            >
              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.discountText
                }
              >
                -
                {discountPercentage.toFixed(
                  0,
                )}
                %
              </AppText>
            </View>
          ) : null}
        </View>

        {/* ====================================================
            INFORMATION
        ==================================================== */}

        <View
          style={
            styles.productInfo
          }
        >
          {/* ==================================================
              NAME
          ================================================== */}

          <AppText
            variant="bodyLarge"
            weight="bold"
            numberOfLines={2}
          >
            {product.name}
          </AppText>

          {/* ==================================================
              RATING / STOCK
          ================================================== */}

          <View
            style={
              styles.metaRow
            }
          >
            <View
              style={
                styles.ratingRow
              }
            >
              <AppIcon
                name="star"
                role="customer"
                size="xs"
                color={
                  Colors.warning
                }
              />

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.ratingText
                }
              >
                {product.rating.toFixed(
                  1,
                )}
              </AppText>

              <AppText
                variant="caption"
                tone="muted"
                style={
                  styles.reviewText
                }
              >
                ({product.sold})
              </AppText>
            </View>

            <View
              style={
                styles.stockRow
              }
            >
              <View
                style={[
                  styles.stockDot,

                  inStock
                    ? styles.stockDotAvailable
                    : styles.stockDotUnavailable,
                ]}
              />

              <AppText
                variant="caption"
                style={[
                  styles.stockText,

                  inStock
                    ? styles.stockTextAvailable
                    : styles.stockTextUnavailable,
                ]}
              >
                {inStock
                  ? "In stock"
                  : "Out of stock"}
              </AppText>
            </View>
          </View>

          {/* ==================================================
              DEAL
          ================================================== */}

          <View
            style={[
              styles.dealRow,

              !hasDeal
                ? styles.noDealRow
                : null,
            ]}
          >
            <AppIcon
              name="payment"
              role="customer"
              size="xs"
              color={
                hasDeal
                  ? Colors.error
                  : Colors.textMuted
              }
            />

            <AppText
              variant="caption"
              weight="bold"
              style={[
                styles.dealText,

                !hasDeal
                  ? styles.noDealText
                  : null,
              ]}
            >
              {hasDeal
                ? `Deal -${discountPercentage.toFixed(
                    0,
                  )}%`
                : "Regular price"}
            </AppText>
          </View>

          {/* ==================================================
              PRICE / BUY
          ================================================== */}

          <View
            style={
              styles.bottomRow
            }
          >
            <View
              style={
                styles.priceContainer
              }
            >
              <AppText
                variant="bodyLarge"
                weight="bold"
                numberOfLines={1}
                style={[
                  styles.price,

                  hasDeal
                    ? styles.discountedPrice
                    : null,
                ]}
              >
                {formatPrice(
                  hasDeal
                    ? discountedPrice
                    : originalPrice,
                )}
              </AppText>

              {hasDeal ? (
                <AppText
                  variant="caption"
                  tone="muted"
                  numberOfLines={1}
                  style={
                    styles.originalPrice
                  }
                >
                  {formatPrice(
                    originalPrice,
                  )}
                </AppText>
              ) : null}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Buy ${product.name}`}
              accessibilityState={{
                disabled:
                  !inStock,
              }}
              disabled={
                !inStock
              }
              onPress={
                handleBuyPress
              }
              style={({
                pressed,
              }) => [
                styles.buyButton,

                !inStock
                  ? styles.buyButtonDisabled
                  : null,

                pressed &&
                inStock
                  ? styles.buyButtonPressed
                  : null,
              ]}
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
                style={
                  styles.buyButtonText
                }
              >
                Buy
              </AppText>
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  });

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

  /*
   * Prevent an older Firestore response
   * from replacing a newer request.
   */
  const requestIdRef =
    useRef(0);

  /* ============================================================
     LOAD PRODUCTS + DEALS
  ============================================================ */

  const loadProducts =
    useCallback(async () => {
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

              /*
               * Current catalog only shows
               * products customers can buy.
               */
              if (
                status !==
                "active"
              ) {
                return items;
              }

              const serviceIds =
                Array.isArray(
                  data.serviceIds,
                )
                  ? data.serviceIds
                      .map(
                        (
                          id: unknown,
                        ) =>
                          normalizeString(
                            id,
                          ),
                      )
                      .filter(
                        Boolean,
                      )
                  : [];

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

                sold:
                  normalizeCount(
                    data.sold,
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
              });

              return items;
            },
            [],
          );

        /* ======================================================
           MOST SOLD FIRST
        ====================================================== */

        activeProducts.sort(
          (
            a,
            b,
          ) =>
            b.sold -
            a.sold,
        );

        /* ======================================================
           DEALS
        ====================================================== */

        const productIds =
          activeProducts.map(
            (
              product,
            ) =>
              product.id,
          );

        let dealsByProductId =
          new Map<
            string,
            ActiveProductDeal
          >();

        if (
          productIds.length >
          0
        ) {
          dealsByProductId =
            await getActiveProductDeals(
              productIds,
            );
        }

        /* ======================================================
           MERGE
        ====================================================== */

        const productsWithDeals =
          activeProducts.map(
            (
              product,
            ) => {
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

        /*
         * Ignore stale request.
         */
        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        setProducts(
          productsWithDeals,
        );
      } catch (
        loadError
      ) {
        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        console.error(
          "BUY_SPARE_PARTS_LOAD_ERROR:",
          loadError,
        );

        /*
         * Do not destroy already loaded
         * products when pull-to-refresh
         * temporarily fails.
         */
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
    }, []);

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    void loadProducts();

    return () => {
      /*
       * Invalidates pending request
       * state updates after unmount.
       */
      requestIdRef.current +=
        1;
    };
  }, [
    loadProducts,
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
     SEARCH
  ============================================================ */

  const normalizedSearch =
    normalizeSearch(
      search,
    );

  const hasSearch =
    normalizedSearch.length >
    0;

  const filteredProducts =
    useMemo(() => {
      if (
        !normalizedSearch
      ) {
        return products;
      }

      return products.filter(
        (
          product,
        ) => {
          const searchableText =
            [
              product.name,

              product.category,

              product.categoryId,
            ]
              .filter(
                Boolean,
              )
              .join(
                " ",
              )
              .toLocaleLowerCase();

          return searchableText.includes(
            normalizedSearch,
          );
        },
      );
    }, [
      normalizedSearch,
      products,
    ]);

  /* ============================================================
     PRODUCT DETAILS
  ============================================================ */

  const handleBuy =
    useCallback(
      (
        product:
          ProductWithDeal,
      ) => {
        if (
          product.stock <= 0 ||
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
      setSearch(
        "",
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
     RENDER ITEM
  ============================================================ */

  const renderProduct =
    useCallback(
      ({
        item,
      }: {
        item:
          ProductWithDeal;
      }) => (
        <SparePartCard
          product={
            item
          }
          onBuy={
            handleBuy
          }
        />
      ),
      [
        handleBuy,
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
     HEADER
  ============================================================ */

  const listHeader = (
    <>
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={
          styles.header
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
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
            numberOfLines={1}
          >
            Fixxam Spare Parts
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            style={
              styles.headerSubtitle
            }
          >
            Find parts from verified
            Fixxam stores
          </AppText>
        </View>
      </View>

      {/* ======================================================
          SEARCH
      ====================================================== */}

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
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          accessibilityLabel="Search for a spare part"
          style={
            styles.searchInput
          }
        />

        {hasSearch ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={8}
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

      {/* ======================================================
          REFRESH ERROR
      ====================================================== */}

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
     EMPTY
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
          {/* MaterialCommunityIcons intentionally preserved */}
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
          No Spare Parts Found
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.emptyDescription
          }
        >
          {hasSearch
            ? `No spare part matches "${search.trim()}".`
            : "There are no spare parts available yet."}
        </AppText>

        {hasSearch ? (
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
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        contentContainerStyle={
          styles.listContent
        }
        style={
          styles.screen
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

    /* ========================================================
       HEADER
    ======================================================== */

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

    /* ========================================================
       SEARCH
    ======================================================== */

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

    /* ========================================================
       REFRESH ERROR
    ======================================================== */

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

    /* ========================================================
       PRODUCT CARD
    ======================================================== */

    productCard: {
      minHeight: 158,

      flexDirection:
        "row",

      padding:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    productCardPressed: {
      borderColor:
        CustomerColors.primary,

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

    separator: {
      height:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       IMAGE
    ======================================================== */

    imageContainer: {
      width: 130,

      height: 140,

      flexShrink: 0,

      overflow:
        "hidden",

      position:
        "relative",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.disabledBackground,
    },

    productImage: {
      width: "100%",

      height: "100%",
    },

    imagePlaceholder: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.disabledBackground,
    },

    /* ========================================================
       DISCOUNT
    ======================================================== */

    discountBadge: {
      position:
        "absolute",

      top:
        FixxamTokens.spacing.sm,

      right:
        FixxamTokens.spacing.sm,

      minHeight: 28,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        Colors.error,
    },

    discountText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       PRODUCT INFO
    ======================================================== */

    productInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       META
    ======================================================== */

    metaRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      flexWrap:
        "wrap",

      gap:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.sm,
    },

    ratingRow: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    ratingText: {
      marginLeft:
        FixxamTokens.spacing.xxs,
    },

    reviewText: {
      marginLeft:
        FixxamTokens.spacing.xxs,
    },

    stockRow: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    stockDot: {
      width: 7,

      height: 7,

      marginRight:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,
    },

    stockDotAvailable: {
      backgroundColor:
        Colors.success,
    },

    stockDotUnavailable: {
      backgroundColor:
        Colors.error,
    },

    stockText: {
      flexShrink: 0,
    },

    stockTextAvailable: {
      color:
        Colors.textSecondary,
    },

    stockTextUnavailable: {
      color:
        Colors.error,
    },

    /* ========================================================
       DEAL
    ======================================================== */

    dealRow: {
      alignSelf:
        "flex-start",

      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xxs,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        Colors.errorSoft,
    },

    noDealRow: {
      backgroundColor:
        Colors.disabledBackground,
    },

    dealText: {
      marginLeft:
        FixxamTokens.spacing.xs,

      color:
        Colors.error,
    },

    noDealText: {
      color:
        Colors.textSecondary,
    },

    /* ========================================================
       PRICE
    ======================================================== */

    bottomRow: {
      flex: 1,

      flexDirection:
        "row",

      alignItems:
        "flex-end",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.sm,
    },

    priceContainer: {
      flex: 1,

      minWidth: 0,

      justifyContent:
        "flex-end",
    },

    price: {
      color:
        CustomerColors.primary,
    },

    discountedPrice: {
      color:
        Colors.error,
    },

    originalPrice: {
      marginTop:
        FixxamTokens.spacing.xxs,

      textDecorationLine:
        "line-through",
    },

    /* ========================================================
       BUY
    ======================================================== */

    buyButton: {
      minWidth: 76,

      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        CustomerColors.primary,
    },

    buyButtonPressed: {
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

    buyButtonDisabled: {
      backgroundColor:
        Colors.disabled,
    },

    buyButtonText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       EMPTY / ERROR
    ======================================================== */

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
      maxWidth: 320,

      marginTop:
        FixxamTokens.spacing.sm,
    },

    emptyAction: {
      minWidth: 180,

      marginTop:
        FixxamTokens.spacing.lg,
    },

    /* ========================================================
       LOADING
    ======================================================== */

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