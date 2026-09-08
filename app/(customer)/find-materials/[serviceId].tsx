import React, {
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
  View,
  type ListRenderItem,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  collection,
  getDocs,
  query,
  where,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import Toast from "react-native-toast-message";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import ProductGridCard from "@/components/customer/home/ProductGridCard";

import {
  db,
} from "@/firebase/config";

import getActiveProductDeals, {
  type ActiveProductDeal,
} from "@/services/deals/getActiveProductDeal";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Product = {
  id: string;

  name: string;

  price: number;

  thumbnail: string;

  rating?: number;

  sold?: number;

  stock: number;

  status:
    | "active"
    | "out_of_stock";

  workerId?: string;

  storeId?: string;

  serviceIds?: string[];

  serviceId?: string;

  activeDeal?:
    | ActiveProductDeal
    | null;
};

type LoadMode =
  | "initial"
  | "refresh"
  | "retry";

/* ==============================================================
   HELPERS
============================================================== */

function normalizeString(
  value: unknown,
): string {
  if (
    typeof value !== "string"
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
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string"
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

function normalizeStringArray(
  value: unknown,
): string[] {
  if (
    !Array.isArray(value)
  ) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter(
          (
            item,
          ): item is string =>
            typeof item ===
            "string",
        )
        .map(
          (item) =>
            item.trim(),
        )
        .filter(Boolean),
    ),
  );
}

function getProductStatus(
  value: unknown,
  stock: number,
):
  | "active"
  | "out_of_stock" {
  if (
    value ===
    "out_of_stock"
  ) {
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
        ...(product.serviceIds ??
          []),
      ]
        .filter(
          (
            value,
          ): value is string =>
            typeof value ===
              "string" &&
            value.trim()
              .length > 0,
        )
        .map(
          (value) =>
            value.trim(),
        ),
    ),
  );
}

function belongsToService(
  product: Product,
  serviceId: string,
): boolean {
  const normalizedServiceId =
    serviceId.trim();

  if (
    !normalizedServiceId
  ) {
    return false;
  }

  return getProductServiceIds(
    product,
  ).includes(
    normalizedServiceId,
  );
}

function getProductImage(
  data: Record<
    string,
    unknown
  >,
): string {
  return (
    normalizeString(
      data.thumbnail,
    ) ||
    normalizeString(
      data.imageUrl,
    ) ||
    normalizeString(
      data.image,
    )
  );
}

/* ==============================================================
   SCREEN
============================================================== */

export default function ServiceMaterialsScreen() {
  const params =
    useLocalSearchParams<{
      serviceId?: string;
      serviceName?: string;
    }>();

  const serviceId =
    typeof params.serviceId ===
      "string"
      ? params.serviceId.trim()
      : "";

  const serviceName =
    typeof params.serviceName ===
      "string" &&
    params.serviceName.trim()
      ? params.serviceName.trim()
      : "Service";

  const [
    products,
    setProducts,
  ] =
    useState<Product[]>([]);

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

  const requestIdRef =
    useRef(0);

  /* ============================================================
     LOAD PRODUCTS
  ============================================================ */

  const loadProducts =
    useCallback(
      async (
        mode: LoadMode =
          "initial",
      ) => {
        const requestId =
          ++requestIdRef.current;

        if (
          !serviceId
        ) {
          setProducts([]);

          setError(
            "Invalid service. Please go back and select a service again.",
          );

          setLoading(false);
          setRefreshing(
            false,
          );

          return;
        }

        if (
          mode === "initial"
        ) {
          setLoading(true);
        }

        if (
          mode === "refresh"
        ) {
          setRefreshing(
            true,
          );
        }

        if (
          mode !== "refresh"
        ) {
          setError(null);
        }

        try {
          /* ==================================================
             FIRESTORE QUERIES
          ================================================== */

          const serviceIdsQuery =
            query(
              collection(
                db,
                "products",
              ),
              where(
                "serviceIds",
                "array-contains",
                serviceId,
              ),
            );

          const serviceIdQuery =
            query(
              collection(
                db,
                "products",
              ),
              where(
                "serviceId",
                "==",
                serviceId,
              ),
            );

          const [
            serviceIdsSnapshot,
            serviceIdSnapshot,
          ] =
            await Promise.all(
              [
                getDocs(
                  serviceIdsQuery,
                ),
                getDocs(
                  serviceIdQuery,
                ),
              ],
            );

          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          /* ==================================================
             REMOVE DUPLICATES
          ================================================== */

          const documents =
            new Map<
              string,
              QueryDocumentSnapshot
            >();

          serviceIdsSnapshot.docs.forEach(
            (
              document,
            ) => {
              documents.set(
                document.id,
                document,
              );
            },
          );

          serviceIdSnapshot.docs.forEach(
            (
              document,
            ) => {
              documents.set(
                document.id,
                document,
              );
            },
          );

          /* ==================================================
             NORMALIZE
          ================================================== */

          const result =
            Array.from(
              documents.values(),
            ).reduce<
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

                if (
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
                  status !==
                  "active"
                ) {
                  return items;
                }

                const product: Product =
                  {
                    id:
                      productDoc.id,

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
                      normalizeStringArray(
                        data.serviceIds,
                      ),

                    activeDeal:
                      null,
                  };

                if (
                  !belongsToService(
                    product,
                    serviceId,
                  )
                ) {
                  return items;
                }

                items.push(
                  product,
                );

                return items;
              },
              [],
            );

          result.sort(
            (
              a,
              b,
            ) =>
              a.name.localeCompare(
                b.name,
                undefined,
                {
                  sensitivity:
                    "base",
                },
              ),
          );

          /* ==================================================
             DEALS
          ================================================== */

          const productIds =
            result
              .map(
                (
                  product,
                ) =>
                  product.id.trim(),
              )
              .filter(
                Boolean,
              );

          let productsWithDeals =
            result;

          if (
            productIds.length >
            0
          ) {
            try {
              const dealsByProductId =
                await getActiveProductDeals(
                  productIds,
                );

              if (
                requestId !==
                requestIdRef.current
              ) {
                return;
              }

              productsWithDeals =
                result.map(
                  (
                    product,
                  ) => ({
                    ...product,

                    activeDeal:
                      dealsByProductId.get(
                        product.id,
                      ) ??
                      null,
                  }),
                );
            } catch (
              dealError
            ) {
              console.error(
                "SERVICE_MATERIALS_DEAL_LOAD_ERROR:",
                dealError,
              );

              /*
               * Deals are optional.
               * Products must remain usable.
               */
              productsWithDeals =
                result.map(
                  (
                    product,
                  ) => ({
                    ...product,

                    activeDeal:
                      null,
                  }),
                );
            }
          }

          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          setProducts(
            productsWithDeals,
          );

          setError(null);
        } catch (
          loadError
        ) {
          console.error(
            "SERVICE_MATERIALS_LOAD_ERROR:",
            loadError,
          );

          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          if (
            mode === "refresh" &&
            products.length >
              0
          ) {
            Toast.show({
              type: "error",
              text1:
                "Unable to refresh materials",
              text2:
                "Please try again.",
            });

            return;
          }

          setProducts([]);

          setError(
            "Unable to load materials for this service. Please try again.",
          );
        } finally {
          if (
            requestId ===
            requestIdRef.current
          ) {
            setLoading(false);

            setRefreshing(
              false,
            );
          }
        }
      },
      [
        products.length,
        serviceId,
      ],
    );

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    void loadProducts(
      "initial",
    );

    return () => {
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
        refreshing ||
        loading
      ) {
        return;
      }

      void loadProducts(
        "refresh",
      );
    }, [
      loadProducts,
      loading,
      refreshing,
    ]);

  /* ============================================================
     RETRY
  ============================================================ */

  const handleRetry =
    useCallback(() => {
      void loadProducts(
        "retry",
      );
    }, [
      loadProducts,
    ]);

  /* ============================================================
     PRODUCT DETAILS
  ============================================================ */

  const handleProductPress =
    useCallback(
      (
        product: Product,
      ) => {
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

  /* ============================================================
     HEADER BANNER
  ============================================================ */

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
              variant="heading3"
              weight="bold"
              style={
                styles.serviceBannerTitle
              }
            >
              Available Materials
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              numberOfLines={2}
              style={
                styles.serviceBannerDescription
              }
            >
              Materials available for{" "}
              {serviceName}.
            </AppText>
          </View>
        </View>
      ),
      [
        serviceName,
      ],
    );

  /* ============================================================
     RENDER PRODUCT
  ============================================================ */

  const renderProduct =
    useCallback<
      ListRenderItem<Product>
    >(
      ({
        item,
      }) => (
        <View
          style={
            styles.gridItem
          }
        >
          <ProductGridCard
            id={item.id}
            name={item.name}
            price={item.price}
            image={
              item.thumbnail
            }
            activeDeal={
              item.activeDeal ??
              null
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
      ),
      [
        handleProductPress,
      ],
    );

  const keyExtractor =
    useCallback(
      (
        item: Product,
      ) => item.id,
      [],
    );

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <SafeAreaView
        style={
          styles.container
        }
        edges={[
          "top",
          "bottom",
        ]}
      >
        <View
          accessibilityRole="progressbar"
          accessibilityLabel="Loading materials"
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
            variant="body"
            tone="secondary"
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

  /* ============================================================
     MAIN
  ============================================================ */

  return (
    <SafeAreaView
      style={
        styles.container
      }
      edges={[
        "top",
        "bottom",
      ]}
    >
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
          hitSlop={6}
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
            numberOfLines={1}
            style={
              styles.title
            }
          >
            {serviceName}
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            numberOfLines={1}
            style={
              styles.subtitle
            }
          >
            Materials available for this service
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
            style={
              styles.errorIcon
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
              styles.errorTitle
            }
          >
            Something went wrong
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.errorText
            }
          >
            {error}
          </AppText>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Refresh materials"
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
                styles.actionText
              }
            >
              Refresh
            </AppText>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={
            keyExtractor
          }
          renderItem={
            renderProduct
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
          ListEmptyComponent={
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
                  name="cube-off-outline"
                  size={52}
                  color={
                    Colors.textMuted
                  }
                />
              </View>

              <AppText
                variant="heading3"
                weight="bold"
                center
                style={
                  styles.emptyTitle
                }
              >
                No Materials Available
              </AppText>

              <AppText
                variant="body"
                tone="secondary"
                center
                style={
                  styles.emptyText
                }
              >
                There are currently no materials available for{" "}
                {serviceName}.
              </AppText>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Refresh materials"
                onPress={
                  handleRetry
                }
                style={({
                  pressed,
                }) => [
                  styles.emptyButton,

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
                    styles.actionText
                  }
                >
                  Refresh
                </AppText>
              </Pressable>
            </View>
          }
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={7}
        />
      )}
    </SafeAreaView>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      backgroundColor:
        Colors.background,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      minHeight:
        FixxamTokens.size
          .headerHeight,

      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

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

      alignItems: "center",

      justifyContent: "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    headerText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       SERVICE BANNER
    ======================================================== */

    serviceBanner: {
      minHeight: 110,

      flexDirection: "row",

      alignItems: "center",

      marginBottom:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.lg,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    serviceBannerIcon: {
      width: 60,

      height: 60,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    serviceBannerContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    serviceBannerTitle: {
      color:
        Colors.textPrimary,
    },

    serviceBannerDescription: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 20,
    },

    /* ========================================================
       LIST
    ======================================================== */

    listContent: {
      flexGrow: 1,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.xxl,
    },

    columnWrapper: {
      gap:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.md,
    },

    gridItem: {
      flex: 1,

      minWidth: 0,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyContainer: {
      minHeight: 380,

      alignItems: "center",

      justifyContent: "center",

      paddingHorizontal:
        FixxamTokens.spacing.xxl,

      paddingVertical:
        FixxamTokens.spacing.xxl,
    },

    emptyIcon: {
      width: 92,

      height: 92,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.disabledBackground,
    },

    emptyTitle: {
      marginTop:
        FixxamTokens.spacing.lg,

      color:
        Colors.textPrimary,
    },

    emptyText: {
      maxWidth: 330,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 22,
    },

    emptyButton: {
      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

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

    /* ========================================================
       ERROR
    ======================================================== */

    errorContainer: {
      flex: 1,

      alignItems: "center",

      justifyContent: "center",

      paddingHorizontal:
        FixxamTokens.spacing.xxl,
    },

    errorIcon: {
      width: 88,

      height: 88,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.errorSoft,
    },

    errorTitle: {
      marginTop:
        FixxamTokens.spacing.lg,

      color:
        Colors.textPrimary,
    },

    errorText: {
      maxWidth: 330,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 21,
    },

    retryButton: {
      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

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

    actionText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       LOADING
    ======================================================== */

    loadingContainer: {
      flex: 1,

      alignItems: "center",

      justifyContent: "center",
    },

    loadingIcon: {
      width: 76,

      height: 76,

      alignItems: "center",

      justifyContent: "center",

      marginBottom:
        FixxamTokens.spacing.lg,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       PRESSED
    ======================================================== */

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