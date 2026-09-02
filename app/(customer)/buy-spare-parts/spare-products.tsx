import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { router } from "expo-router";

import { AppText } from "@/components/ui";
import { db } from "@/firebase/config";

import { CustomerColors } from "@/theme/customerColors";
import { FixxamTokens } from "@/theme/fixxamtokens";

import getActiveProductDeals, {
  type ActiveProductDeal,
} from "@/services/deals/getActiveProductDeal";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

type Product = {
  id: string;
  name: string;
  price: number;
  thumbnail: string;
  rating: number;
  sold: number;
  stock: number;
  status: "active" | "out_of_stock";
  category?: string;
  categoryId?: string;
  workerId?: string;
  storeId?: string;
  serviceId?: string;
  serviceIds?: string[];
};

type ProductWithDeal = Product & {
  activeDeal: ActiveProductDeal | null;
};

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function normalizeString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizeNumber(
  value: unknown,
  fallback = 0,
): number {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(
      value.replace(/,/g, ""),
    );

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function normalizeStatus(
  value: unknown,
  stock: number,
): "active" | "out_of_stock" {
  if (value === "out_of_stock") {
    return "out_of_stock";
  }

  if (stock <= 0) {
    return "out_of_stock";
  }

  return "active";
}

function normalizeSearch(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function formatPrice(value: number): string {
  return `₦${new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 2,
  }).format(value)}`;
}

/*
 * ============================================================
 * VALID DEAL
 * ============================================================
 */

function getValidDeal(
  product: Product,
  deal: ActiveProductDeal | null,
): ActiveProductDeal | null {
  if (!deal) {
    return null;
  }

  const originalPrice =
    normalizeNumber(product.price);

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
    discountedPrice >= originalPrice
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

/*
 * ============================================================
 * PRODUCT IMAGE
 * ============================================================
 */

function ProductImage({
  uri,
}: {
  uri: string;
}) {
  const [failed, setFailed] =
    useState(false);

  if (!uri || failed) {
    return (
      <View
        style={
          styles.imagePlaceholder
        }
      >
        <MaterialCommunityIcons
          name="image-off-outline"
          size={30}
          color={
            CustomerColors.textSecondary
          }
        />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={
        styles.productImage
      }
      resizeMode="cover"
      onError={() =>
        setFailed(true)
      }
    />
  );
}

/*
 * ============================================================
 * PRODUCT CARD
 * ============================================================
 */

function SparePartCard({
  product,
  onBuy,
}: {
  product: ProductWithDeal;
  onBuy: (
    product: ProductWithDeal,
  ) => void;
}) {
  const inStock =
    product.stock > 0 &&
    product.status === "active";

  const validDeal =
    getValidDeal(
      product,
      product.activeDeal,
    );

  const hasDeal =
    Boolean(validDeal);

  const originalPrice =
    normalizeNumber(
      product.price,
    );

  const discountedPrice =
    hasDeal
      ? normalizeNumber(
          validDeal?.discountedPrice,
        )
      : originalPrice;

  const discountPercentage =
    hasDeal
      ? normalizeNumber(
          validDeal?.discountPercentage,
        )
      : 0;

  return (
    <Pressable
      onPress={() =>
        onBuy(product)
      }
      accessibilityRole="button"
      accessibilityLabel={`View ${product.name}`}
      style={({ pressed }) => [
        styles.productCard,
        pressed &&
          styles.productCardPressed,
      ]}
    >
      {/* ==================================================
          IMAGE
      ================================================== */}

      <View
        style={
          styles.imageContainer
        }
      >
        <ProductImage
          uri={product.thumbnail}
        />

        {/* DISCOUNT PERCENTAGE */}

        {hasDeal && (
          <View
            style={
              styles.discountBadge
            }
          >
            <AppText
              weight="bold"
              style={
                styles.discountText
              }
            >
              -{discountPercentage.toFixed(0)}%
            </AppText>
          </View>
        )}
      </View>

      {/* ==================================================
          INFORMATION
      ================================================== */}

      <View
        style={
          styles.productInfo
        }
      >
        {/* PRODUCT NAME */}

        <AppText
          weight="bold"
          numberOfLines={2}
          style={
            styles.productName
          }
        >
          {product.name}
        </AppText>

        {/* ==================================================
            RATING + STOCK
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
            <Ionicons
              name="star"
              size={15}
              color="#F5B400"
            />

            <AppText
              style={
                styles.ratingText
              }
            >
              {product.rating.toFixed(
                1,
              )}
            </AppText>

            <AppText
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
                {
                  backgroundColor:
                    inStock
                      ? "#16A34A"
                      : CustomerColors.error,
                },
              ]}
            />

            <AppText
              style={[
                styles.stockText,
                {
                  color:
                    inStock
                      ? "#64748B"
                      : CustomerColors.error,
                },
              ]}
            >
              {inStock
                ? "In stock"
                : "Out of stock"}
            </AppText>
          </View>
        </View>

        {/* ==================================================
            DEAL / NO DEAL
        ================================================== */}

        <View
          style={[
            styles.dealRow,
            !hasDeal &&
              styles.noDealRow,
          ]}
        >
          <Ionicons
            name={
              hasDeal
                ? "pricetag"
                : "pricetag-outline"
            }
            size={12}
            color={
              hasDeal
                ? "#DC2626"
                : "#94A3B8"
            }
          />

          <AppText
            weight="bold"
            style={[
              styles.dealText,
              !hasDeal &&
                styles.noDealText,
            ]}
          >
            {hasDeal
              ? `Deal -${discountPercentage.toFixed(
                  0,
                )}%`
              : "No Deal"}
          </AppText>
        </View>

        {/* ==================================================
            PRICE + BUY
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
              weight="bold"
              numberOfLines={1}
              style={[
                styles.price,
                hasDeal &&
                  styles.discountedPrice,
              ]}
            >
              {formatPrice(
                hasDeal
                  ? discountedPrice
                  : originalPrice,
              )}
            </AppText>

            {hasDeal && (
              <AppText
                numberOfLines={1}
                style={
                  styles.originalPrice
                }
              >
                {formatPrice(
                  originalPrice,
                )}
              </AppText>
            )}
          </View>

          <Pressable
            onPress={() =>
              onBuy(product)
            }
            disabled={!inStock}
            accessibilityRole="button"
            accessibilityLabel={`Buy ${product.name}`}
            accessibilityState={{
              disabled: !inStock,
            }}
            onPressIn={() => {}}
            style={({ pressed }) => [
              styles.buyButton,
              !inStock &&
                styles.buyButtonDisabled,
              pressed &&
                inStock &&
                styles.buyButtonPressed,
            ]}
          >
            <AppText
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
}

/*
 * ============================================================
 * SCREEN
 * ============================================================
 */

export default function BuySparePartsScreen() {
  const [
    products,
    setProducts,
  ] = useState<
    ProductWithDeal[]
  >([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  /*
   * ==========================================================
   * LOAD PRODUCTS + DEALS
   * ==========================================================
   */

  const loadProducts =
    useCallback(async () => {
      try {
        setError(null);

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

              if (!name) {
                return items;
              }

              const price =
                normalizeNumber(
                  data.price,
                  0,
                );

              if (price < 0) {
                return items;
              }

              const stock =
                Math.max(
                  0,
                  Math.floor(
                    normalizeNumber(
                      data.stock,
                      0,
                    ),
                  ),
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

              items.push({
                id: productDoc.id,

                name,

                price,

                thumbnail:
                  normalizeString(
                    data.thumbnail,
                  ),

                rating:
                  normalizeNumber(
                    data.rating,
                    0,
                  ),

                sold:
                  normalizeNumber(
                    data.sold,
                    0,
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

                serviceIds:
                  Array.isArray(
                    data.serviceIds,
                  )
                    ? data.serviceIds.filter(
                        (
                          id: unknown,
                        ): id is string =>
                          typeof id ===
                          "string",
                      )
                    : [],
              });

              return items;
            },
            [],
          );

        /*
         * Most sold first.
         */

        activeProducts.sort(
          (a, b) =>
            b.sold - a.sold,
        );

        /*
         * ======================================================
         * LOAD ACTIVE DEALS
         * ======================================================
         */

        const productIds =
          activeProducts
            .map((product) =>
              String(
                product.id,
              ).trim(),
            )
            .filter(Boolean);

        let dealsByProductId =
          new Map<
            string,
            ActiveProductDeal
          >();

        if (
          productIds.length > 0
        ) {
          dealsByProductId =
            await getActiveProductDeals(
              productIds,
            );
        }

        /*
         * ======================================================
         * MERGE PRODUCTS + DEALS
         * ======================================================
         */

        const productsWithDeals =
          activeProducts.map(
            (product) => {
              const deal =
                dealsByProductId.get(
                  String(
                    product.id,
                  ).trim(),
                ) ?? null;

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
      } catch (loadError) {
        console.error(
          "BUY SPARE PARTS LOAD ERROR:",
          loadError,
        );

        setProducts([]);

        setError(
          "Unable to load spare parts. Please try again.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, []);

  /*
   * ==========================================================
   * INITIAL LOAD
   * ==========================================================
   */

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  /*
   * ==========================================================
   * REFRESH
   * ==========================================================
   */

  const handleRefresh =
    useCallback(() => {
      setRefreshing(true);

      void loadProducts();
    }, [loadProducts]);

  /*
   * ==========================================================
   * FILTER PRODUCTS
   * ==========================================================
   */

  const filteredProducts =
    useMemo(() => {
      const normalizedSearch =
        normalizeSearch(search);

      if (!normalizedSearch) {
        return products;
      }

      return products.filter(
        (product) => {
          const searchableText =
            [
              product.name,
              product.category,
              product.categoryId,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

          return searchableText.includes(
            normalizedSearch,
          );
        },
      );
    }, [products, search]);

  /*
   * ==========================================================
   * BUY / PRODUCT DETAILS
   * ==========================================================
   */

  const handleBuy =
    useCallback(
      (
        product: ProductWithDeal,
      ) => {
        if (
          product.stock <= 0
        ) {
          return;
        }

        const productId =
          String(
            product.id ?? "",
          ).trim();

        if (!productId) {
          return;
        }

        router.push({
          pathname:
            "/(customer)/product/[id]",
          params: {
            id: productId,
          },
        });
      },
      [],
    );

  /*
   * ==========================================================
   * CLEAR SEARCH
   * ==========================================================
   */

  const handleClearSearch =
    useCallback(() => {
      setSearch("");
    }, []);

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (loading) {
    return (
      <SafeAreaView
        style={
          styles.container
        }
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
            style={
              styles.loadingText
            }
          >
            Loading spare parts...
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * ==========================================================
   * MAIN SCREEN
   * ==========================================================
   */

  return (
    <SafeAreaView
      style={
        styles.container
      }
    >
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) =>
          item.id
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        refreshing={
          refreshing
        }
        onRefresh={
          handleRefresh
        }
        contentContainerStyle={
          styles.listContent
        }
        ListHeaderComponent={
          <>
            {/* HEADER */}

            <View
              style={
                styles.header
              }
            >
              <Pressable
                onPress={() =>
                  router.back()
                }
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                style={({
                  pressed,
                }) => [
                  styles.backButton,
                  pressed &&
                    styles.backButtonPressed,
                ]}
              >
                <Ionicons
                  name="arrow-back"
                  size={22}
                  color={
                    CustomerColors.textPrimary
                  }
                />
              </Pressable>

              <AppText
                weight="bold"
                numberOfLines={1}
                style={
                  styles.headerTitle
                }
              >
                Fixxam Spare Parts
              </AppText>
            </View>

            {/* SEARCH */}

            <View
              style={
                styles.searchContainer
              }
            >
              <Ionicons
                name="search-outline"
                size={23}
                color={
                  CustomerColors.textSecondary
                }
              />

              <TextInput
                value={search}
                onChangeText={
                  setSearch
                }
                placeholder="Search for a spare part..."
                placeholderTextColor={
                  CustomerColors.textSecondary
                }
                style={
                  styles.searchInput
                }
                autoCorrect={
                  false
                }
                autoCapitalize="none"
                returnKeyType="search"
                accessibilityLabel="Search for a spare part"
              />

              {search.length >
                0 && (
                <Pressable
                  onPress={
                    handleClearSearch
                  }
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  style={
                    styles.clearButton
                  }
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={
                      CustomerColors.textSecondary
                    }
                  />
                </Pressable>
              )}
            </View>
          </>
        }
        renderItem={({
          item,
        }) => (
          <SparePartCard
            product={item}
            onBuy={
              handleBuy
            }
          />
        )}
        ListEmptyComponent={
          error ? (
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
                <Ionicons
                  name="alert-circle-outline"
                  size={38}
                  color={
                    CustomerColors.error
                  }
                />
              </View>

              <AppText
                weight="bold"
                style={
                  styles.emptyTitle
                }
              >
                Something went wrong
              </AppText>

              <AppText
                center
                style={
                  styles.emptyDescription
                }
              >
                {error}
              </AppText>

              <Pressable
                onPress={() =>
                  void loadProducts()
                }
                style={
                  styles.retryButton
                }
                accessibilityRole="button"
                accessibilityLabel="Try loading spare parts again"
              >
                <AppText
                  weight="bold"
                  style={
                    styles.retryText
                  }
                >
                  TRY AGAIN
                </AppText>
              </Pressable>
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
                  size={38}
                  color={
                    CustomerColors.textSecondary
                  }
                />
              </View>

              <AppText
                weight="bold"
                style={
                  styles.emptyTitle
                }
              >
                No Spare Parts Found
              </AppText>

              <AppText
                center
                style={
                  styles.emptyDescription
                }
              >
                {search.trim()
                  ? `No spare part matches "${search.trim()}".`
                  : "There are no spare parts available yet."}
              </AppText>

              {search.trim() && (
                <Pressable
                  onPress={
                    handleClearSearch
                  }
                  style={
                    styles.retryButton
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                >
                  <AppText
                    weight="bold"
                    style={
                      styles.retryText
                    }
                  >
                    CLEAR SEARCH
                  </AppText>
                </Pressable>
              )}
            </View>
          )
        }
        ListFooterComponent={
          <View
            style={
              styles.footerSpace
            }
          />
        }
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
    /*
     * SCREEN
     */

    container: {
      flex: 1,
      backgroundColor:
        CustomerColors.background,
    },

    listContent: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,
      paddingTop: 4,
      paddingBottom: 30,
    },

    /*
     * HEADER
     */

    header: {
      height: 54,
      flexDirection:
        "row",
      alignItems:
        "center",
      marginBottom: 14,
    },

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor:
        CustomerColors.white,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderWidth: 1,
      borderColor:
        CustomerColors.border,
      shadowColor:
        CustomerColors.shadow,
      shadowOpacity: 0.05,
      shadowRadius: 5,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      elevation: 1,
    },

    backButtonPressed: {
      opacity: 0.7,
      transform: [
        {
          scale: 0.96,
        },
      ],
    },

    headerTitle: {
      flex: 1,
      marginLeft: 11,
      fontSize: 21,
      lineHeight: 26,
      color:
        CustomerColors.textPrimary,
    },

    /*
     * SEARCH
     */

    searchContainer: {
      height: 54,
      marginBottom: 18,
      paddingHorizontal: 14,
      borderRadius: 18,
      backgroundColor:
        CustomerColors.white,
      borderWidth: 1,
      borderColor:
        CustomerColors.border,
      flexDirection:
        "row",
      alignItems:
        "center",
      shadowColor:
        CustomerColors.shadow,
      shadowOpacity: 0.05,
      shadowRadius: 6,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      elevation: 1,
    },

    searchInput: {
      flex: 1,
      height: "100%",
      marginLeft: 9,
      paddingVertical: 0,
      fontSize: 15,
      color:
        CustomerColors.textPrimary,
    },

    clearButton: {
      width: 28,
      height: 28,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    /*
     * PRODUCT CARD
     *
     * Horizontal card.
     */

    productCard: {
      minHeight: 158,
      marginBottom: 12,
      padding: 9,
      borderRadius:
        FixxamTokens.radius.xl,
      backgroundColor:
        CustomerColors.white,
      borderWidth: 1,
      borderColor:
        CustomerColors.border,
      flexDirection:
        "row",
      shadowColor:
        CustomerColors.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 7,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      elevation: 2,
    },

    productCardPressed: {
      opacity: 0.92,
      transform: [
        {
          scale: 0.99,
        },
      ],
    },

    /*
     * IMAGE
     */

    imageContainer: {
      width: 130,
      height: 140,
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor:
        "#F1F5F9",
      position: "relative",
    },

    productImage: {
      width: "100%",
      height: "100%",
    },

    imagePlaceholder: {
      flex: 1,
      backgroundColor:
        "#F1F5F9",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    /*
     * DISCOUNT BADGE
     */

    discountBadge: {
      position:
        "absolute",
      top: 8,
      right: 8,
      minWidth: 44,
      height: 28,
      paddingHorizontal: 7,
      borderRadius: 9,
      backgroundColor:
        "#DC2626",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    discountText: {
      fontSize: 11,
      color:
        CustomerColors.white,
    },

    /*
     * INFORMATION
     */

    productInfo: {
      flex: 1,
      minWidth: 0,
      marginLeft: 12,
      paddingVertical: 3,
    },

    productName: {
      fontSize: 17,
      lineHeight: 22,
      color:
        CustomerColors.textPrimary,
    },

    /*
     * META
     */

    metaRow: {
      marginTop: 7,
      flexDirection:
        "row",
      alignItems:
        "center",
      flexWrap:
        "wrap",
      gap: 7,
    },

    ratingRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    ratingText: {
      marginLeft: 4,
      fontSize: 12,
      color:
        CustomerColors.textSecondary,
    },

    reviewText: {
      marginLeft: 2,
      fontSize: 11,
      color:
        CustomerColors.textSecondary,
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
      borderRadius: 4,
      marginRight: 4,
    },

    stockText: {
      fontSize: 11,
    },

    /*
     * DEAL / NO DEAL
     */

    dealRow: {
      alignSelf:
        "flex-start",
      marginTop: 6,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 7,
      backgroundColor:
        "#FEF2F2",
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    dealText: {
      marginLeft: 4,
      fontSize: 9,
      color:
        "#DC2626",
    },

    noDealRow: {
      backgroundColor:
        "#F1F5F9",
    },

    noDealText: {
      color:
        "#64748B",
    },

    /*
     * PRICE + BUY
     */

    bottomRow: {
      flex: 1,
      marginTop: 6,
      flexDirection:
        "row",
      alignItems:
        "flex-end",
      justifyContent:
        "space-between",
      gap: 7,
    },

    priceContainer: {
      flex: 1,
      minWidth: 0,
      justifyContent:
        "flex-end",
    },

    price: {
      fontSize: 18,
      lineHeight: 23,
      color:
        CustomerColors.primary,
    },

    discountedPrice: {
      color:
        "#DC2626",
    },

    originalPrice: {
      marginTop: 2,
      fontSize: 11,
      lineHeight: 15,
      color:
        CustomerColors.textSecondary,
      textDecorationLine:
        "line-through",
    },

    buyButton: {
      minWidth: 76,
      height: 40,
      paddingHorizontal: 15,
      borderRadius: 20,
      backgroundColor:
        CustomerColors.primary,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    buyButtonPressed: {
      opacity: 0.82,
      transform: [
        {
          scale: 0.96,
        },
      ],
    },

    buyButtonDisabled: {
      backgroundColor:
        CustomerColors.border,
    },

    buyButtonText: {
      fontSize: 14,
      color:
        CustomerColors.white,
    },

    /*
     * EMPTY / ERROR
     */

    emptyContainer: {
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal: 24,
      paddingTop: 55,
      paddingBottom: 45,
    },

    emptyIcon: {
      width: 72,
      height: 72,
      borderRadius: 22,
      backgroundColor:
        "#F1F5F9",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    emptyTitle: {
      marginTop: 14,
      fontSize: 18,
      color:
        CustomerColors.textPrimary,
    },

    emptyDescription: {
      maxWidth: 320,
      marginTop: 7,
      fontSize: 13,
      lineHeight: 20,
      color:
        CustomerColors.textSecondary,
    },

    retryButton: {
      minHeight: 42,
      marginTop: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
      backgroundColor:
        CustomerColors.primary,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    retryText: {
      fontSize: 12,
      color:
        CustomerColors.white,
    },

    /*
     * LOADING
     */

    loadingContainer: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color:
        CustomerColors.textSecondary,
    },

    /*
     * FOOTER
     */

    footerSpace: {
      height: 24,
    },
  });