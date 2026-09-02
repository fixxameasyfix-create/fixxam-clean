import React, {
  useCallback,
  useEffect,
  useMemo,
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

import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  collection,
  getDocs,
  query,
  QueryDocumentSnapshot,
  where,
} from "firebase/firestore";

import { db } from "@/firebase/config";
import { AppText } from "@/components/ui";

import ProductGridCard from "@/components/customer/home/ProductGridCard";

import {
  CustomerColors,
} from "@/theme/customerColors";

import {
  FixxamTokens,
} from "@/theme/fixxamtokens";

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
  rating?: number;
  sold?: number;
  stock: number;
  status: "active" | "out_of_stock";
  workerId?: string;
  storeId?: string;
  serviceIds?: string[];
  serviceId?: string;

  activeDeal?: ActiveProductDeal | null;
};

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function normalizeString(
  value: unknown,
): string {
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

function normalizeStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter(
          (item): item is string =>
            typeof item === "string",
        )
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function getProductStatus(
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

function getProductServiceIds(
  product: Product,
): string[] {
  return Array.from(
    new Set(
      [
        product.serviceId,
        ...(product.serviceIds ?? []),
      ]
        .filter(
          (value): value is string =>
            typeof value === "string" &&
            value.trim().length > 0,
        )
        .map((value) => value.trim()),
    ),
  );
}

function belongsToService(
  product: Product,
  serviceId: string,
): boolean {
  const normalizedServiceId =
    serviceId.trim();

  if (!normalizedServiceId) {
    return false;
  }

  return getProductServiceIds(
    product,
  ).includes(normalizedServiceId);
}

function getProductImage(
  data: Record<string, unknown>,
): string {
  return (
    normalizeString(data.thumbnail) ||
    normalizeString(data.imageUrl) ||
    normalizeString(data.image)
  );
}

/*
 * ============================================================
 * SCREEN
 * ============================================================
 */

export default function ServiceMaterialsScreen() {
  const params =
    useLocalSearchParams<{
      serviceId?: string;
      serviceName?: string;
    }>();

  const serviceId =
    typeof params.serviceId === "string"
      ? params.serviceId.trim()
      : "";

  const serviceName =
    typeof params.serviceName === "string" &&
    params.serviceName.trim()
      ? params.serviceName.trim()
      : "Service";

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  /*
   * ==========================================================
   * LOAD PRODUCTS
   * ==========================================================
   */

  const loadProducts =
    useCallback(async () => {
      if (!serviceId) {
        setProducts([]);

        setError(
          "Invalid service. Please go back and select a service again.",
        );

        setLoading(false);
        setRefreshing(false);

        return;
      }

      try {
        setError(null);

        /*
         * ------------------------------------------------------
         * PRODUCTS USING serviceIds
         * ------------------------------------------------------
         */

        const serviceIdsQuery =
          query(
            collection(db, "products"),
            where(
              "serviceIds",
              "array-contains",
              serviceId,
            ),
          );

        /*
         * ------------------------------------------------------
         * PRODUCTS USING serviceId
         * ------------------------------------------------------
         */

        const serviceIdQuery =
          query(
            collection(db, "products"),
            where(
              "serviceId",
              "==",
              serviceId,
            ),
          );

        const [
          serviceIdsSnapshot,
          serviceIdSnapshot,
        ] = await Promise.all([
          getDocs(serviceIdsQuery),
          getDocs(serviceIdQuery),
        ]);

        /*
         * ------------------------------------------------------
         * REMOVE DUPLICATE PRODUCTS
         * ------------------------------------------------------
         */

        const documents =
          new Map<
            string,
            QueryDocumentSnapshot
          >();

        serviceIdsSnapshot.docs.forEach(
          (document) => {
            documents.set(
              document.id,
              document,
            );
          },
        );

        serviceIdSnapshot.docs.forEach(
          (document) => {
            documents.set(
              document.id,
              document,
            );
          },
        );

        /*
         * ------------------------------------------------------
         * NORMALIZE PRODUCTS
         * ------------------------------------------------------
         */

        const result =
          Array.from(
            documents.values(),
          ).reduce<Product[]>(
            (items, productDoc) => {
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

              if (
                !Number.isFinite(price) ||
                price < 0
              ) {
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
                getProductStatus(
                  data.status,
                  stock,
                );

              if (
                status !== "active"
              ) {
                return items;
              }

              const serviceIds =
                normalizeStringArray(
                  data.serviceIds,
                );

              const product: Product =
                {
                  id: productDoc.id,

                  name,

                  price,

                  thumbnail:
                    getProductImage(
                      data,
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

                  workerId:
                    normalizeString(
                      data.workerId,
                    ) || undefined,

                  storeId:
                    normalizeString(
                      data.storeId,
                    ) || undefined,

                  serviceId:
                    normalizeString(
                      data.serviceId,
                    ) || undefined,

                  serviceIds,
                };

              /*
               * Make sure the product actually
               * belongs to this service.
               */

              if (
                !belongsToService(
                  product,
                  serviceId,
                )
              ) {
                return items;
              }

              items.push(product);

              return items;
            },
            [],
          );

        /*
         * ------------------------------------------------------
         * SORT PRODUCTS
         * ------------------------------------------------------
         */

        result.sort(
          (a, b) =>
            a.name.localeCompare(
              b.name,
              undefined,
              {
                sensitivity: "base",
              },
            ),
        );

        /*
         * ------------------------------------------------------
         * LOAD ACTIVE DEALS
         * ------------------------------------------------------
         */

        const productIds =
          result
            .map(
              (product) =>
                product.id.trim(),
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
         * ------------------------------------------------------
         * MERGE DEALS
         * ------------------------------------------------------
         *
         * Deal exists:
         *   activeDeal = deal
         *
         * No deal:
         *   activeDeal = null
         *
         * ProductGridCard handles the UI:
         *   Deal
         *   No Deal
         * ------------------------------------------------------
         */

        const productsWithDeals =
          result.map(
            (product) => ({
              ...product,

              activeDeal:
                dealsByProductId.get(
                  product.id,
                ) ?? null,
            }),
          );

        setProducts(
          productsWithDeals,
        );
      } catch (loadError) {
        console.error(
          "FIND MATERIALS ERROR:",
          loadError,
        );

        setProducts([]);

        setError(
          "Unable to load materials for this service. Please try again.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, [serviceId]);

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
      if (refreshing) {
        return;
      }

      setRefreshing(true);

      void loadProducts();
    }, [
      loadProducts,
      refreshing,
    ]);

  /*
   * ==========================================================
   * PRODUCT DETAILS
   * ==========================================================
   */

  const handleProductPress =
    useCallback(
      (product: Product) => {
        router.push({
          pathname:
            "/(customer)/product/[id]",
          params: {
            id: product.id,
          },
        });
      },
      [],
    );

  /*
   * ==========================================================
   * HEADER BANNER
   * ==========================================================
   */

  const listHeader =
    useMemo(
      () => (
        <View
          style={
            styles.serviceBanner
          }
        >
          <View
            style={
              styles.serviceBannerIcon
            }
          >
            <MaterialCommunityIcons
              name="cube-outline"
              size={30}
              color={
                CustomerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.serviceBannerContent
            }
          >
            <AppText
              weight="bold"
              style={
                styles.serviceBannerTitle
              }
            >
              Available Materials
            </AppText>

            <AppText
              style={
                styles.serviceBannerDescription
              }
              numberOfLines={2}
            >
              Materials available for{" "}
              {serviceName}.
            </AppText>
          </View>
        </View>
      ),
      [serviceName],
    );

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={
            styles.loadingContainer
          }
        >
          <View
            style={
              styles.loadingIcon
            }
          >
            <MaterialCommunityIcons
              name="cube-outline"
              size={38}
              color={
                CustomerColors.primary
              }
            />
          </View>

          <ActivityIndicator
            size="small"
            color={
              CustomerColors.primary
            }
          />

          <AppText
            style={
              styles.loadingText
            }
          >
            Loading materials...
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
      style={styles.container}
      edges={["top", "bottom"]}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={styles.header}
      >
        <Pressable
          style={
            styles.backButton
          }
          onPress={() =>
            router.back()
          }
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={
              CustomerColors.textPrimary
            }
          />
        </Pressable>

        <View
          style={styles.headerText}
        >
          <AppText
            weight="bold"
            numberOfLines={1}
            style={styles.title}
          >
            {serviceName}
          </AppText>

          <AppText
            numberOfLines={1}
            style={styles.subtitle}
          >
            Materials available for
            this service
          </AppText>
        </View>
      </View>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error ? (
        <View
          style={
            styles.errorContainer
          }
        >
          <View
            style={styles.errorIcon}
          >
            <Ionicons
              name="alert-circle-outline"
              size={42}
              color={
                CustomerColors.error
              }
            />
          </View>

          <AppText
            weight="bold"
            style={styles.errorTitle}
          >
            Something went wrong
          </AppText>

          <AppText
            center
            style={styles.errorText}
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
            accessibilityLabel="Refresh materials"
          >
            <Ionicons
              name="refresh"
              size={18}
              color={
                CustomerColors.white
              }
            />

            <AppText
              weight="bold"
              style={styles.retryText}
            >
              REFRESH
            </AppText>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) =>
            item.id
          }
          numColumns={2}
          columnWrapperStyle={
            styles.columnWrapper
          }
          contentContainerStyle={
            styles.listContent
          }
          onRefresh={
            handleRefresh
          }
          refreshing={
            refreshing
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            listHeader
          }
          renderItem={({ item }) => (
            <View
              style={styles.gridItem}
            >
              <ProductGridCard
                id={item.id}
                name={item.name}
                price={item.price}
                image={
                  item.thumbnail
                }
                activeDeal={
                  item.activeDeal ?? null
                }
                onPress={() =>
                  handleProductPress(
                    item,
                  )
                }
                onBuy={() =>
                  handleProductPress(
                    item,
                  )
                }
              />
            </View>
          )}
          ListEmptyComponent={
            <View
              style={
                styles.emptyContainer
              }
            >
              <View
                style={styles.emptyIcon}
              >
                <MaterialCommunityIcons
                  name="cube-off-outline"
                  size={52}
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
                No Materials Available
              </AppText>

              <AppText
                center
                style={
                  styles.emptyText
                }
              >
                There are currently no
                materials available
                for {serviceName}.
              </AppText>

              <Pressable
                onPress={() =>
                  void loadProducts()
                }
                style={({
                  pressed,
                }) => [
                  styles.emptyButton,
                  pressed &&
                    styles.emptyButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Refresh materials"
              >
                <Ionicons
                  name="refresh"
                  size={18}
                  color={
                    CustomerColors.white
                  }
                />

                <AppText
                  weight="bold"
                  style={
                    styles.emptyButtonText
                  }
                >
                  REFRESH
                </AppText>
              </Pressable>
            </View>
          }
        />
      )}
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
    container: {
      flex: 1,
      backgroundColor:
        CustomerColors.background,
    },

    header: {
      minHeight: 76,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal:
        FixxamTokens.spacing.lg,
      paddingTop: 8,
      paddingBottom: 10,
    },

    backButton: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor:
        CustomerColors.white,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor:
        CustomerColors.border,
      shadowColor:
        CustomerColors.shadow,
      shadowOpacity: 0.07,
      shadowRadius: 7,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      elevation: 2,
    },

    headerText: {
      flex: 1,
      marginHorizontal:
        FixxamTokens.spacing.md,
    },

    title: {
      fontSize: 21,
      lineHeight: 26,
      color:
        CustomerColors.textPrimary,
    },

    subtitle: {
      marginTop: 2,
      fontSize: 13,
      lineHeight: 19,
      color:
        CustomerColors.textSecondary,
    },

    serviceBanner: {
      minHeight: 118,
      marginBottom:
        FixxamTokens.spacing.lg,
      padding:
        FixxamTokens.spacing.lg,
      borderRadius:
        FixxamTokens.radius.xl,
      backgroundColor: "#F1F7FF",
      borderWidth: 1,
      borderColor: "#D5E6FA",
      flexDirection: "row",
      alignItems: "center",
    },

    serviceBannerIcon: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: "#EAF2FF",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },

    serviceBannerContent: {
      flex: 1,
      marginLeft:
        FixxamTokens.spacing.md,
    },

    serviceBannerTitle: {
      fontSize: 20,
      lineHeight: 26,
      color:
        CustomerColors.textPrimary,
    },

    serviceBannerDescription: {
      marginTop: 4,
      fontSize: 14,
      lineHeight: 20,
      color:
        CustomerColors.textSecondary,
    },

    listContent: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,
      paddingBottom: 36,
    },

    columnWrapper: {
      justifyContent: "space-between",
    },

    gridItem: {
      width: "48.4%",
    },

    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 28,
      paddingTop: 90,
      paddingBottom: 50,
    },

    emptyIcon: {
      width: 104,
      height: 104,
      borderRadius: 32,
      backgroundColor: "#F1F5F9",
      alignItems: "center",
      justifyContent: "center",
    },

    emptyTitle: {
      marginTop: 22,
      fontSize: 22,
      lineHeight: 28,
      textAlign: "center",
      color:
        CustomerColors.textPrimary,
    },

    emptyText: {
      marginTop: 9,
      maxWidth: 330,
      fontSize: 14,
      lineHeight: 22,
      color:
        CustomerColors.textSecondary,
    },

    emptyButton: {
      minHeight: 50,
      marginTop: 24,
      paddingHorizontal: 26,
      borderRadius:
        FixxamTokens.radius.md,
      backgroundColor:
        CustomerColors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },

    emptyButtonPressed: {
      opacity: 0.82,
      transform: [
        {
          scale: 0.98,
        },
      ],
    },

    emptyButtonText: {
      fontSize: 13,
      color:
        CustomerColors.white,
    },

    errorContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 28,
    },

    errorIcon: {
      width: 88,
      height: 88,
      borderRadius: 28,
      backgroundColor:
        CustomerColors.emergencyBackground,
      alignItems: "center",
      justifyContent: "center",
    },

    errorTitle: {
      marginTop: 18,
      fontSize: 20,
      color:
        CustomerColors.textPrimary,
    },

    errorText: {
      marginTop: 8,
      fontSize: 14,
      lineHeight: 21,
      color:
        CustomerColors.textSecondary,
    },

    retryButton: {
      minHeight: 50,
      marginTop: 22,
      paddingHorizontal: 25,
      borderRadius:
        FixxamTokens.radius.md,
      backgroundColor:
        CustomerColors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },

    retryText: {
      fontSize: 13,
      color:
        CustomerColors.white,
    },

    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    loadingIcon: {
      width: 76,
      height: 76,
      marginBottom: 18,
      borderRadius: 24,
      backgroundColor: "#EAF2FF",
      alignItems: "center",
      justifyContent: "center",
    },

    loadingText: {
      marginTop: 10,
      fontSize: 13,
      color:
        CustomerColors.textSecondary,
    },
  });