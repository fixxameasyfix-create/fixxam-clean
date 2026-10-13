import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  router,
  useFocusEffect,
  useNavigation,
} from "expo-router";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import AppLoader from "@/components/common/AppLoader";

import { db } from "@/firebase/config";

import { useAuth } from "@/hooks/useAuth";

import OrderDeletionManager, {
  type OrderDeletionCounts,
  type OrderDeletionFilter,
} from "@/components/orders/OrderDeletionManager";

import OrderCard from "@/components/customerorders/orderCard";
import MarketOrderCard from "@/components/customerorders/marketOrderCard";
import ShopRequestCard from "@/components/customerorders/shopRequestCard";
import OrderEmptyState from "@/components/customerorders/orderEmptyState";
import OrdersHeader from "@/components/customerorders/ordersHeader";

import type {
  FilterType,
  MarketOrder,
  Order,
} from "@/components/customerorders/orders.types";

import type {
  FirebaseShopRequest,
} from "@/types/firebaseShopRequest";

import {
  subscribeToCustomerShopRequests,
} from "@/services/shopRequestService";

import {
  FILTERS,
  getOrdersErrorMessage,
  getTimestampMillis,
  mapFirestoreOrder,
  mapMarketOrder,
  normalizeStatus,
} from "@/components/customerorders/orders.utils";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
TYPES
============================================================== */

type OrderCategory =
  | "service"
  | "market"
  | "shop";

type CategoryIcon =
  | "tools"
  | "storefront-outline"
  | "clipboard-text-outline";

type CategoryCardConfig = {
  key: OrderCategory;
  title: string;
  description: string;
  icon: CategoryIcon;
  iconColor: string;
  iconBackground: string;
  arrowColor: string;
  arrowBackground: string;
};

/* ==============================================================
CATEGORY CONFIG
============================================================== */

const CATEGORY_CONFIG: CategoryCardConfig[] = [
  {
    key: "service",
    title: "Service Requests",
    description:
      "View service bookings and requests you have made.",
    icon: "tools",
    iconColor: "#087FEF",
    iconBackground: "#EAF4FF",
    arrowColor: "#087FEF",
    arrowBackground: "#EAF4FF",
  },

  {
    key: "market",
    title: "Market Requests",
    description:
      "View products and market orders you have placed.",
    icon: "storefront-outline",
    iconColor: "#12B878",
    iconBackground: "#E9FBF2",
    arrowColor: "#12B878",
    arrowBackground: "#E9FBF2",
  },

  {
    key: "shop",
    title: "Shop Requests",
    description:
      "View requests you have sent to shops.",
    icon: "clipboard-text-outline",
    iconColor: "#F28A00",
    iconBackground: "#FFF5DE",
    arrowColor: "#F28A00",
    arrowBackground: "#FFF5DE",
  },
];

/* ==============================================================
HELPERS
============================================================== */

function matchesFilter(
  status: string,
  filter: FilterType,
): boolean {
  const normalizedStatus =
    normalizeStatus(status);

  switch (filter) {
    case "pending":
      return normalizedStatus === "pending";

    case "active":
      return normalizedStatus === "accepted";

    case "completed":
      return normalizedStatus === "completed";

    case "cancelled":
      return (
        normalizedStatus === "cancelled" ||
        normalizedStatus === "expired"
      );

    case "all":
    default:
      return true;
  }
}

function getShopRequestCreatedAt(
  request: FirebaseShopRequest,
): number {
  return request.createdAt?.toMillis?.() ?? 0;
}

/* ==============================================================
SCREEN
============================================================== */

export default function OrdersScreen() {
  const navigation = useNavigation();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const authenticated =
    Boolean(user);

  /* ============================================================
  CATEGORY
  ============================================================ */

  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState<OrderCategory | null>(
      null,
    );

  const [
    selectedFilter,
    setSelectedFilter,
  ] =
    useState<FilterType>("all");

  /* ============================================================
  MANAGEMENT
  ============================================================ */

  const [
    managementVisible,
    setManagementVisible,
  ] =
    useState(false);

  /* ============================================================
  HIDE BOTTOM TABS
  ============================================================ */

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle:
        selectedCategory
          ? {
              display: "none",
            }
          : undefined,
    });

    return () => {
      navigation.setOptions({
        tabBarStyle: undefined,
      });
    };
  }, [
    navigation,
    selectedCategory,
  ]);

  /* ============================================================
  ANDROID HARDWARE BACK
  ============================================================ */

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (managementVisible) {
          setManagementVisible(false);
          return true;
        }

        if (selectedCategory !== null) {
          setSelectedFilter("all");
          setSelectedCategory(null);

          return true;
        }

        return false;
      };

      const subscription =
        BackHandler.addEventListener(
          "hardwareBackPress",
          onBackPress,
        );

      return () => {
        subscription.remove();
      };
    }, [
      managementVisible,
      selectedCategory,
    ]),
  );

  /* ============================================================
  DATA
  ============================================================ */

  const [
    orders,
    setOrders,
  ] = useState<Order[]>([]);

  const [
    marketOrders,
    setMarketOrders,
  ] =
    useState<MarketOrder[]>([]);

  const [
    shopRequests,
    setShopRequests,
  ] =
    useState<
      FirebaseShopRequest[]
    >([]);

  /* ============================================================
  LOADING
  ============================================================ */

  const [
    serviceLoading,
    setServiceLoading,
  ] =
    useState(false);

  const [
    marketLoading,
    setMarketLoading,
  ] =
    useState(false);

  const [
    shopRequestsLoading,
    setShopRequestsLoading,
  ] =
    useState(false);

  /* ============================================================
  ERRORS
  ============================================================ */

  const [
    serviceError,
    setServiceError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    marketError,
    setMarketError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    shopRequestsError,
    setShopRequestsError,
  ] =
    useState<string | null>(
      null,
    );

  /* ============================================================
  FIREBASE LISTENERS
  ============================================================ */

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setMarketOrders([]);
      setShopRequests([]);

      setServiceLoading(false);
      setMarketLoading(false);
      setShopRequestsLoading(false);

      setServiceError(null);
      setMarketError(null);
      setShopRequestsError(null);

      setSelectedCategory(null);
      setSelectedFilter("all");
      setManagementVisible(false);

      return;
    }

    setServiceLoading(true);
    setMarketLoading(true);
    setShopRequestsLoading(true);

    setServiceError(null);
    setMarketError(null);
    setShopRequestsError(null);

    /* ========================================================
       SERVICE REQUESTS
    ======================================================== */

    const bookingsQuery =
      query(
        collection(
          db,
          "bookings",
        ),
        where(
          "customerId",
          "==",
          user.uid,
        ),
      );

    const unsubscribeBookings =
      onSnapshot(
        bookingsQuery,

        (snapshot) => {
          const nextOrders =
            snapshot.docs
              .filter(
                (document) =>
                  document.data()
                    .deletedByCustomer !==
                  true,
              )
              .map(
                (document) =>
                  mapFirestoreOrder(
                    document.id,
                    document.data(),
                  ),
              )
              .sort(
                (a, b) =>
                  getTimestampMillis(
                    b.createdAt,
                  ) -
                  getTimestampMillis(
                    a.createdAt,
                  ),
              );

          setOrders(nextOrders);
          setServiceLoading(false);
          setServiceError(null);
        },

        (error) => {
          console.error(
            "CUSTOMER_ORDERS_LISTENER_ERROR:",
            error,
          );

          setOrders([]);
          setServiceLoading(false);

          setServiceError(
            getOrdersErrorMessage(
              error,
            ),
          );
        },
      );

    /* ========================================================
       MARKET REQUESTS
    ======================================================== */

    const marketQuery =
      query(
        collection(
          db,
          "orders",
        ),
        where(
          "customerId",
          "==",
          user.uid,
        ),
      );

    const unsubscribeMarket =
      onSnapshot(
        marketQuery,

        (snapshot) => {
          const nextMarketOrders =
            snapshot.docs
              .filter(
                (document) =>
                  document.data()
                    .deletedByCustomer !==
                  true,
              )
              .map(
                (document) =>
                  mapMarketOrder(
                    document.id,
                    document.data(),
                  ),
              )
              .sort(
                (a, b) =>
                  getTimestampMillis(
                    b.createdAt,
                  ) -
                  getTimestampMillis(
                    a.createdAt,
                  ),
              );

          setMarketOrders(
            nextMarketOrders,
          );

          setMarketLoading(false);
          setMarketError(null);
        },

        (error) => {
          console.error(
            "CUSTOMER_MARKET_ORDERS_LISTENER_ERROR:",
            error,
          );

          setMarketOrders([]);
          setMarketLoading(false);

          setMarketError(
            getOrdersErrorMessage(
              error,
            ),
          );
        },
      );

    /* ========================================================
       SHOP REQUESTS
    ======================================================== */

    const unsubscribeShopRequests =
      subscribeToCustomerShopRequests(
        user.uid,

        (requests) => {
          setShopRequests(requests);
          setShopRequestsLoading(false);
          setShopRequestsError(null);
        },

        (error) => {
          console.error(
            "CUSTOMER_SHOP_REQUESTS_LISTENER_ERROR:",
            error,
          );

          setShopRequests([]);
          setShopRequestsLoading(false);

          setShopRequestsError(
            getOrdersErrorMessage(
              error,
            ),
          );
        },
      );

    return () => {
      unsubscribeBookings();
      unsubscribeMarket();
      unsubscribeShopRequests();
    };
  }, [user]);

  /* ============================================================
  CATEGORY COUNTS
  ============================================================ */

  const categoryCounts =
    useMemo(
      () => ({
        service:
          orders.length,

        market:
          marketOrders.length,

        shop:
          shopRequests.length,
      }),
      [
        orders,
        marketOrders,
        shopRequests,
      ],
    );

  /* ============================================================
  ACTIVE CATEGORY
  ============================================================ */

  const activeCategory =
    useMemo(
      () =>
        CATEGORY_CONFIG.find(
          (category) =>
            category.key ===
            selectedCategory,
        ) ?? null,
      [selectedCategory],
    );

  const activeCategoryTitle =
    activeCategory?.title ??
    "Requests";

  /* ============================================================
  CATEGORY LOADING
  ============================================================ */

  const categoryLoading =
    useMemo(() => {
      switch (
        selectedCategory
      ) {
        case "service":
          return serviceLoading;

        case "market":
          return marketLoading;

        case "shop":
          return shopRequestsLoading;

        default:
          return false;
      }
    }, [
      selectedCategory,
      serviceLoading,
      marketLoading,
      shopRequestsLoading,
    ]);

  /* ============================================================
  CATEGORY ERROR
  ============================================================ */

  const categoryError =
    useMemo(() => {
      switch (
        selectedCategory
      ) {
        case "service":
          return serviceError;

        case "market":
          return marketError;

        case "shop":
          return shopRequestsError;

        default:
          return null;
      }
    }, [
      selectedCategory,
      serviceError,
      marketError,
      shopRequestsError,
    ]);

  /* ============================================================
  FILTERED SERVICE
  ============================================================ */

  const filteredServiceOrders =
    useMemo<Order[]>(
      () =>
        orders
          .filter(
            (order) =>
              matchesFilter(
                order.status,
                selectedFilter,
              ),
          )
          .sort(
            (a, b) =>
              getTimestampMillis(
                b.createdAt,
              ) -
              getTimestampMillis(
                a.createdAt,
              ),
          ),
      [
        orders,
        selectedFilter,
      ],
    );

  /* ============================================================
  FILTERED MARKET
  ============================================================ */

  const filteredMarketOrders =
    useMemo<MarketOrder[]>(
      () =>
        marketOrders
          .filter(
            (order) =>
              matchesFilter(
                order.status,
                selectedFilter,
              ),
          )
          .sort(
            (a, b) =>
              getTimestampMillis(
                b.createdAt,
              ) -
              getTimestampMillis(
                a.createdAt,
              ),
          ),
      [
        marketOrders,
        selectedFilter,
      ],
    );

  /* ============================================================
  FILTERED SHOP
  ============================================================ */

  const filteredShopRequests =
    useMemo<FirebaseShopRequest[]>(
      () =>
        shopRequests
          .filter(
            (request) =>
              matchesFilter(
                request.status,
                selectedFilter,
              ),
          )
          .sort(
            (a, b) =>
              getShopRequestCreatedAt(
                b,
              ) -
              getShopRequestCreatedAt(
                a,
              ),
          ),
      [
        shopRequests,
        selectedFilter,
      ],
    );

  /* ============================================================
  DELETION COUNTS
  ============================================================ */

  const deletionCounts =
    useMemo<OrderDeletionCounts>(
      () => {
        const counts: OrderDeletionCounts =
          {
            pending: 0,
            active: 0,
            completed: 0,
            cancelled: 0,
          };

        const statuses = [
          ...orders.map(
            (order) =>
              order.status,
          ),

          ...marketOrders.map(
            (order) =>
              order.status,
          ),

          ...shopRequests.map(
            (request) =>
              request.status,
          ),
        ];

        for (
          const status of statuses
        ) {
          switch (
            normalizeStatus(
              status,
            )
          ) {
            case "pending":
              counts.pending += 1;
              break;

            case "accepted":
              counts.active += 1;
              break;

            case "completed":
              counts.completed += 1;
              break;

            case "cancelled":
            case "expired":
              counts.cancelled += 1;
              break;

            default:
              break;
          }
        }

        return counts;
      },
      [
        orders,
        marketOrders,
        shopRequests,
      ],
    );

  /* ============================================================
  NAVIGATION
  ============================================================ */

  const handleSelectCategory =
    useCallback(
      (
        category: OrderCategory,
      ) => {
        setSelectedFilter("all");
        setSelectedCategory(
          category,
        );
      },
      [],
    );

  const handleBackToCategories =
    useCallback(() => {
      setSelectedFilter("all");
      setSelectedCategory(null);
    }, []);

  /* ============================================================
  LOGIN
  ============================================================ */

  const handleLogin =
    useCallback(() => {
      router.push(
        "/(auth)/login",
      );
    }, []);

  /* ============================================================
  SERVICE DETAILS
  ============================================================ */

  const handleViewOrder =
    useCallback(
      (order: Order) => {
        router.push({
          pathname:
            "/(customer)/orders/[orderId]",

          params: {
            orderId: order.id,
          },
        });
      },
      [],
    );

  /* ============================================================
  MARKET DETAILS
  ============================================================ */

  const handleViewMarketOrder =
    useCallback(
      (
        order: MarketOrder,
      ) => {
        router.push({
          pathname:
            "/(customer)/orders/market/[orderId]",

          params: {
            orderId: order.id,
          },
        });
      },
      [],
    );

  /* ============================================================
  SHOP DETAILS
  ============================================================ */

  const handleViewShopRequest =
    useCallback(
      (
        request: FirebaseShopRequest,
      ) => {
        const requestId =
          request.id.trim();

        if (!requestId) {
          return;
        }

        router.push({
          pathname:
            "/(customer)/orders/shop-request/[requestId]",

          params: {
            requestId,
          },
        });
      },
      [],
    );

  /* ============================================================
  MANAGEMENT
  ============================================================ */

  const handleOpenManagement =
    useCallback(() => {
      if (!authenticated) {
        return;
      }

      setManagementVisible(true);
    }, [authenticated]);

  const handleCloseManagement =
    useCallback(() => {
      setManagementVisible(false);
    }, []);

  const handleManagementFilter =
    useCallback(
      (
        filter: OrderDeletionFilter,
      ) => {
        if (!authenticated) {
          return;
        }

        setSelectedFilter(filter);
      },
      [authenticated],
    );

  const handleDeleted =
    useCallback(() => {
      setSelectedFilter("all");
    }, []);

  /* ============================================================
  CATEGORY ICON
  ============================================================ */

  const renderCategoryIcon =
    (
      category: CategoryCardConfig,
    ) => {
      if (
        category.key ===
        "market"
      ) {
        return (
          <View
            style={
              styles.layeredIcon
            }
          >
            <MaterialCommunityIcons
              name="storefront-outline"
              size={34}
              color={
                category.iconColor
              }
            />

            <View
              style={
                styles.smallBag
              }
            >
              <MaterialCommunityIcons
                name="shopping-outline"
                size={16}
                color={
                  category.iconColor
                }
              />
            </View>
          </View>
        );
      }

      if (
        category.key ===
        "shop"
      ) {
        return (
          <View
            style={
              styles.layeredIcon
            }
          >
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={34}
              color={
                category.iconColor
              }
            />

            <View
              style={
                styles.smallShop
              }
            >
              <MaterialCommunityIcons
                name="storefront-outline"
                size={16}
                color={
                  category.iconColor
                }
              />
            </View>
          </View>
        );
      }

      return (
        <MaterialCommunityIcons
          name="tools"
          size={36}
          color={
            category.iconColor
          }
        />
      );
    };

  /* ============================================================
  CATEGORY HOME
  ============================================================ */

  const renderCategoryHome =
    () => {
      if (!authenticated) {
        return (
          <OrderEmptyState
            filter={
              selectedFilter
            }
            onLogin={
              handleLogin
            }
          />
        );
      }

      return (
        <View
          style={
            styles.categoryContainer
          }
        >
          <View
            style={styles.intro}
          >
            <AppText
              variant="heading2"
              weight="bold"
              style={
                styles.introTitle
              }
            >
              Your Requests
            </AppText>

            <AppText
              variant="body"
              style={
                styles.introDescription
              }
            >
              Choose a category to
              view your requests
              and orders.
            </AppText>
          </View>

          <View
            style={
              styles.categoryGrid
            }
          >
            {CATEGORY_CONFIG.map(
              (
                category,
              ) => {
                const count =
                  categoryCounts[
                    category.key
                  ];

                const loading =
                  category.key ===
                  "service"
                    ? serviceLoading
                    : category.key ===
                      "market"
                      ? marketLoading
                      : shopRequestsLoading;

                const displayCount =
                  count > 99
                    ? "99+"
                    : String(
                        count,
                      );

                return (
                  <Pressable
                    key={
                      category.key
                    }
                    onPress={() =>
                      handleSelectCategory(
                        category.key,
                      )
                    }
                    disabled={
                      loading
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${category.title}`}
                    accessibilityState={{
                      busy: loading,
                      disabled:
                        loading,
                    }}
                    style={({
                      pressed,
                    }) => [
                      styles.categoryCard,

                      category.key ===
                        "shop" &&
                        styles.shopCard,

                      pressed &&
                        !loading &&
                        styles.categoryCardPressed,

                      loading &&
                        styles.categoryCardLoading,
                    ]}
                  >
                    {/* ==================================================
                        CATEGORY ICON
                    ================================================== */}

                    <View
                      style={[
                        styles.categoryIcon,
                        {
                          backgroundColor:
                            category.iconBackground,
                        },
                      ]}
                    >
                      {renderCategoryIcon(
                        category,
                      )}
                    </View>

                    {/* ==================================================
                        COUNT / LOADING
                    ================================================== */}

                    <View
                      style={[
                        styles.categoryCount,
                        loading &&
                          styles.categoryCountLoading,
                      ]}
                    >
                      {loading ? (
                        <ActivityIndicator
                          size="small"
                          color={
                            category.iconColor
                          }
                        />
                      ) : (
                        <AppText
                          variant="caption"
                          weight="bold"
                          style={
                            styles.categoryCountText
                          }
                        >
                          {
                            displayCount
                          }
                        </AppText>
                      )}
                    </View>

                    {/* ==================================================
                        TITLE
                    ================================================== */}

                    <AppText
                      variant="body"
                      weight="bold"
                      style={
                        styles.categoryTitle
                      }
                      numberOfLines={2}
                    >
                      {
                        category.title
                      }
                    </AppText>

                    {/* ==================================================
                        DESCRIPTION
                    ================================================== */}

                    <AppText
                      variant="caption"
                      style={
                        styles.categoryDescription
                      }
                      numberOfLines={3}
                    >
                      {
                        category.description
                      }
                    </AppText>

                    {/* ==================================================
                        ARROW
                    ================================================== */}

                    <View
                      style={[
                        styles.categoryArrow,
                        {
                          backgroundColor:
                            category.arrowBackground,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={28}
                        color={
                          category.arrowColor
                        }
                      />
                    </View>

                    {/* ==================================================
                        GLOW
                    ================================================== */}

                    <View
                      pointerEvents="none"
                      style={[
                        styles.cardGlow,
                        {
                          backgroundColor:
                            category.iconBackground,
                        },
                      ]}
                    />
                  </Pressable>
                );
              },
            )}
          </View>
        </View>
      );
    };

  /* ============================================================
  CATEGORY DETAIL
  ============================================================ */

  const renderCategoryDetail =
    () => {
      if (!selectedCategory) {
        return null;
      }

      if (categoryLoading) {
        return (
          <View
            style={
              styles.loadingContainer
            }
          >
            <AppLoader
              role="customer"
              size="sm"
              message={`Loading ${activeCategoryTitle.toLowerCase()}...`}
            />
          </View>
        );
      }

      const visibleCount =
        selectedCategory ===
        "service"
          ? filteredServiceOrders.length
          : selectedCategory ===
            "market"
            ? filteredMarketOrders.length
            : filteredShopRequests.length;

      if (
        visibleCount === 0 &&
        categoryError
      ) {
        return (
          <OrderEmptyState
            filter={
              selectedFilter
            }
            error={
              categoryError
            }
          />
        );
      }

      if (
        visibleCount === 0
      ) {
        return (
          <OrderEmptyState
            filter={
              selectedFilter
            }
          />
        );
      }

      return (
        <>
          {categoryError ? (
            <View
              style={
                styles.warning
              }
            >
              <AppText
                variant="caption"
                tone="warning"
              >
                Some requests could
                not be loaded.
              </AppText>
            </View>
          ) : null}

          {selectedCategory ===
          "service" ? (
            <View
              style={
                styles.ordersList
              }
            >
              {filteredServiceOrders.map(
                (
                  order,
                ) => (
                  <OrderCard
                    key={`service-${order.id}`}
                    order={
                      order
                    }
                    onPress={() =>
                      handleViewOrder(
                        order,
                      )
                    }
                  />
                ),
              )}
            </View>
          ) : null}

          {selectedCategory ===
          "market" ? (
            <View
              style={
                styles.ordersList
              }
            >
              {filteredMarketOrders.map(
                (
                  order,
                ) => (
                  <MarketOrderCard
                    key={`market-${order.id}`}
                    order={
                      order
                    }
                    onPress={() =>
                      handleViewMarketOrder(
                        order,
                      )
                    }
                  />
                ),
              )}
            </View>
          ) : null}

          {selectedCategory ===
          "shop" ? (
            <View
              style={
                styles.ordersList
              }
            >
              {filteredShopRequests.map(
                (
                  request,
                ) => (
                  <ShopRequestCard
                    key={`shop-${request.id}`}
                    request={
                      request
                    }
                    onPress={() =>
                      handleViewShopRequest(
                        request,
                      )
                    }
                  />
                ),
              )}
            </View>
          ) : null}
        </>
      );
    };

  /* ============================================================
  UI
  ============================================================ */

  return (
    <>
      <AppScreen
        role="customer"
        padded={false}
        scrollEnabled
        contentContainerStyle={
          styles.screen
        }
      >
        <View
          style={
            styles.content
          }
        >
          {!selectedCategory ? (
            <>
              <OrdersHeader
                authenticated={
                  authenticated
                }
                onManage={
                  handleOpenManagement
                }
              />

              {authLoading ? (
                <View
                  style={
                    styles.loadingContainer
                  }
                >
                  <AppLoader
                    role="customer"
                    size="sm"
                    message="Checking your account..."
                  />
                </View>
              ) : (
                renderCategoryHome()
              )}
            </>
          ) : (
            <>
              <View
                style={
                  styles.detailHeader
                }
              >
                <Pressable
                  onPress={
                    handleBackToCategories
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Go back to request categories"
                  hitSlop={8}
                  style={({
                    pressed,
                  }) => [
                    styles.backButton,

                    pressed &&
                      styles.backButtonPressed,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="arrow-left"
                    size={24}
                    color={
                      Colors.textPrimary
                    }
                  />
                </Pressable>

                <View
                  style={
                    styles.detailHeaderText
                  }
                >
                  <AppText
                    variant="heading2"
                    weight="bold"
                  >
                    {
                      activeCategoryTitle
                    }
                  </AppText>

                  <AppText
                    variant="caption"
                    style={
                      styles.detailSubtitle
                    }
                  >
                    View and manage your
                    requests
                  </AppText>
                </View>

                <Pressable
                  onPress={
                    handleOpenManagement
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Manage orders"
                  hitSlop={8}
                  style={({
                    pressed,
                  }) => [
                    styles.manageButton,

                    pressed &&
                      styles.backButtonPressed,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="tune-variant"
                    size={23}
                    color={
                      CustomerColors.primary
                    }
                  />
                </Pressable>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.filterContent
                }
              >
                {FILTERS.map(
                  (
                    filter,
                  ) => {
                    const active =
                      selectedFilter ===
                      filter.key;

                    return (
                      <Pressable
                        key={
                          filter.key
                        }
                        onPress={() =>
                          setSelectedFilter(
                            filter.key,
                          )
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`${filter.label} ${activeCategoryTitle}`}
                        accessibilityState={{
                          selected:
                            active,
                        }}
                        style={({
                          pressed,
                        }) => [
                          styles.filterButton,

                          active &&
                            styles.filterButtonActive,

                          pressed &&
                            styles.filterPressed,
                        ]}
                      >
                        <AppText
                          variant="caption"
                          weight="semibold"
                          style={{
                            color:
                              active
                                ? Colors.textInverse
                                : Colors.textSecondary,
                          }}
                        >
                          {
                            filter.label
                          }
                        </AppText>
                      </Pressable>
                    );
                  },
                )}
              </ScrollView>

              {renderCategoryDetail()}
            </>
          )}
        </View>
      </AppScreen>

      {authenticated ? (
        <OrderDeletionManager
          visible={
            managementVisible
          }
          counts={
            deletionCounts
          }
          selectedFilter={
            selectedFilter
          }
          onClose={
            handleCloseManagement
          }
          onFilterSelect={
            handleManagementFilter
          }
          onDeleted={
            handleDeleted
          }
        />
      ) : null}
    </>
  );
}

/* ==============================================================
STYLES
============================================================== */

const styles =
  StyleSheet.create({
    screen: {
      flexGrow: 1,

      backgroundColor:
        "#F7FAFF",
    },

    content: {
      width: "100%",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    /* ========================================================
       CATEGORY HOME
    ======================================================== */

    categoryContainer: {
      flex: 1,

      marginTop:
        FixxamTokens.spacing.lg,
    },

    intro: {
      marginBottom:
        FixxamTokens.spacing.xl,
    },

    introTitle: {
      color: "#07152F",

      fontSize: 32,

      lineHeight: 38,

      letterSpacing: -0.8,
    },

    introDescription: {
      marginTop:
        FixxamTokens.spacing.xs,

      color: "#718096",

      lineHeight: 23,

      fontSize: 16,
    },

    /* ========================================================
       CATEGORY GRID
    ======================================================== */

    categoryGrid: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      justifyContent:
        "space-between",

      rowGap:
        FixxamTokens.spacing.md,
    },

    categoryCard: {
      width: "48.3%",

      minHeight: 270,

      position:
        "relative",

      overflow:
        "hidden",

      padding:
        FixxamTokens.spacing.lg,

      backgroundColor:
        "#FFFFFF",

      borderWidth: 1,

      borderColor:
        "#E8EEF7",

      borderRadius: 28,

      shadowColor:
        "#0B2447",

      shadowOpacity: 0.1,

      shadowRadius: 16,

      shadowOffset: {
        width: 0,
        height: 7,
      },

      elevation: 4,
    },

    shopCard: {
      width: "100%",

      minHeight: 205,
    },

    categoryCardLoading: {
      opacity: 0.96,
    },

    categoryCardPressed: {
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

    /* ========================================================
       CATEGORY ICON
    ======================================================== */

    categoryIcon: {
      width: 74,

      height: 74,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 25,

      marginBottom:
        FixxamTokens.spacing.lg,
    },

    layeredIcon: {
      width: 44,

      height: 44,

      alignItems:
        "center",

      justifyContent:
        "center",

      position:
        "relative",
    },

    smallBag: {
      position:
        "absolute",

      right: -5,

      bottom: -4,

      width: 24,

      height: 24,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 8,

      backgroundColor:
        "#E9FBF2",

      borderWidth: 1,

      borderColor:
        "#D5F5E5",
    },

    smallShop: {
      position:
        "absolute",

      right: -5,

      bottom: -4,

      width: 24,

      height: 24,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 8,

      backgroundColor:
        "#FFF5DE",

      borderWidth: 1,

      borderColor:
        "#FFE9B8",
    },

    /* ========================================================
       CATEGORY COUNT / LOADER
    ======================================================== */

    categoryCount: {
      position:
        "absolute",

      top: 16,

      right: 16,

      minWidth: 34,

      height: 34,

      paddingHorizontal: 5,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 17,

      backgroundColor:
        "#EF2029",

      shadowColor:
        "#EF2029",

      shadowOpacity: 0.14,

      shadowRadius: 5,

      shadowOffset: {
        width: 0,

        height: 2,
      },

      elevation: 2,
    },

    categoryCountLoading: {
      backgroundColor:
        "#F2F6FC",

      borderWidth: 1,

      borderColor:
        "#E3EBF7",

      shadowColor:
        "transparent",

      shadowOpacity: 0,

      shadowRadius: 0,

      elevation: 0,
    },

    categoryCountText: {
      color:
        "#FFFFFF",

      fontSize: 11,

      lineHeight: 14,

      textAlign:
        "center",
    },

    /* ========================================================
       CATEGORY TEXT
    ======================================================== */

    categoryTitle: {
      color:
        "#07152F",

      fontSize: 18,

      lineHeight: 24,

      paddingRight: 4,
    },

    categoryDescription: {
      marginTop:
        FixxamTokens.spacing.sm,

      color:
        "#718096",

      fontSize: 15,

      lineHeight: 22,

      paddingRight: 4,
    },

    /* ========================================================
       CATEGORY ARROW
    ======================================================== */

    categoryArrow: {
      position:
        "absolute",

      right: 20,

      bottom: 20,

      width: 48,

      height: 48,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 24,
    },

    cardGlow: {
      position:
        "absolute",

      width: 170,

      height: 170,

      right: -90,

      bottom: -95,

      borderRadius: 100,

      opacity: 0.3,
    },

    /* ========================================================
       DETAIL HEADER
    ======================================================== */

    detailHeader: {
      minHeight: 64,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        FixxamTokens.spacing.sm,
    },

    backButton: {
      width: 46,

      height: 46,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 15,

      backgroundColor:
        Colors.surface,

      borderWidth: 1,

      borderColor:
        Colors.border,
    },

    manageButton: {
      width: 46,

      height: 46,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius: 15,

      backgroundColor:
        CustomerColors.primarySoft,

      borderWidth: 1,

      borderColor:
        CustomerColors.primarySoft,
    },

    backButtonPressed: {
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

    detailHeaderText: {
      flex: 1,

      marginHorizontal:
        FixxamTokens.spacing.md,
    },

    detailSubtitle: {
      marginTop: 2,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       FILTER
    ======================================================== */

    filterContent: {
      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.md,

      paddingRight:
        FixxamTokens.spacing.sm,

      gap:
        FixxamTokens.spacing.sm,
    },

    filterButton: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        Colors.surface,
    },

    filterButtonActive: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primary,
    },

    filterPressed: {
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

    /* ========================================================
       ORDERS
    ======================================================== */

    ordersList: {
      marginTop:
        FixxamTokens.spacing.sm,

      gap:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       LOADING
    ======================================================== */

    loadingContainer: {
      minHeight: 220,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    /* ========================================================
       WARNING
    ======================================================== */

    warning: {
      marginTop:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.xs,

      padding:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.warningSoft,
    },
  });