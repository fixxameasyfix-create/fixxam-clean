import React, {
  useCallback,
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
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import WorkerServiceOrderCard from "@/components/workerorders/WorkerServiceOrderCard";
import WorkerMarketOrderCard from "@/components/workerorders/WorkerMarketOrderCard";
import WorkerShopRequestCard from "@/components/workerorders/WorkerShopRequestCard";

import WorkerOrderDeletionManager from "@/components/orders/WorkerOrderDeletionManager";

import type {
  WorkerFilterType,
  WorkerMarketOrder,
  WorkerServiceOrder,
} from "@/types/workerOrders";

import type {
  FirebaseShopRequest,
} from "@/types/firebaseShopRequest";

import {
  CATEGORY_CONFIG,
  WORKER_FILTERS,
  getSafeId,
  type OrderCategory,
  type CategoryCardConfig,
} from "@/components/workerorders/workerOrdersConfig";

import {
  useWorkerOrders,
} from "@/components/workerorders/useWorkerOrders";

/* ==============================================================
SCREEN
============================================================== */

export default function WorkerOrdersScreen() {
  const navigation =
    useNavigation();

  /* ============================================================
  DATA
  ============================================================ */

  const {
    user,
    authReady,

    serviceOrders,
    marketOrders,
    shopRequests,

    serviceLoading,
    marketLoading,
    shopRequestsLoading,

    serviceError,
    marketError,
    shopRequestsError,

    filteredServiceOrders,
    filteredMarketOrders,
    filteredShopRequests,

    deletionCounts,

    selectedFilter,
    setSelectedFilter,
  } = useWorkerOrders();

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

  /* ============================================================
  MANAGEMENT
  ============================================================ */

  const [
    managementVisible,
    setManagementVisible,
  ] =
    useState(false);

  /* ============================================================
  HIDE TABS INSIDE CATEGORY
  ============================================================ */

  useFocusEffect(
    useCallback(() => {
      const tabNavigator =
        navigation.getParent();

      tabNavigator?.setOptions({
        tabBarStyle:
          selectedCategory !== null
            ? {
                display: "none",
              }
            : undefined,
      });

      return () => {
        tabNavigator?.setOptions({
          tabBarStyle: undefined,
        });
      };
    }, [
      navigation,
      selectedCategory,
    ]),
  );

  /* ============================================================
  HARDWARE BACK
  ============================================================ */

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (managementVisible) {
          setManagementVisible(false);
          return true;
        }

        if (
          selectedCategory !== null
        ) {
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
      setSelectedFilter,
    ]),
  );

  /* ============================================================
  CATEGORY COUNTS
  ============================================================ */

  const categoryCounts =
    useMemo(
      () => ({
        service:
          serviceOrders.length,
        market:
          marketOrders.length,
        shop:
          shopRequests.length,
      }),
      [
        serviceOrders,
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
          category =>
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
  CATEGORY NAVIGATION
  ============================================================ */

  const handleSelectCategory =
    useCallback(
      (category: OrderCategory) => {
        setSelectedFilter("all");
        setSelectedCategory(
          category,
        );
      },
      [setSelectedFilter],
    );

  const handleBackToCategories =
    useCallback(() => {
      setSelectedFilter("all");
      setSelectedCategory(null);
    }, [setSelectedFilter]);

  /* ============================================================
  MANAGEMENT
  ============================================================ */

  const handleOpenManagement =
    useCallback(() => {
      if (!user) {
        return;
      }

      setManagementVisible(true);
    }, [user]);

  const handleCloseManagement =
    useCallback(() => {
      setManagementVisible(false);
    }, []);

  const handleManagementFilter =
    useCallback(
      (filter: WorkerFilterType) => {
        if (!user) {
          return;
        }

        setSelectedFilter(filter);
      },
      [user, setSelectedFilter],
    );

  const handleDeleted =
    useCallback(() => {
      setSelectedFilter("all");
    }, [setSelectedFilter]);

  /* ============================================================
  SERVICE DETAILS
  ============================================================ */

  const handleServiceOrderPress =
    useCallback(
      (order: WorkerServiceOrder) => {
        const orderId =
          getSafeId(order.id);

        if (!orderId) {
          return;
        }

        router.push({
          pathname:
            "/(worker)/orders/[orderId]",
          params: {
            orderId,
          },
        });
      },
      [],
    );

  /* ============================================================
  MARKET DETAILS
  ============================================================ */

  const handleMarketOrderPress =
    useCallback(
      (order: WorkerMarketOrder) => {
        const marketId =
          getSafeId(order.id);

        if (!marketId) {
          return;
        }

        router.push({
          pathname:
            "/(worker)/orders/market/[market]",
          params: {
            market: marketId,
          },
        });
      },
      [],
    );



    /* ============================================================
MARKET CHAT
============================================================ */

const handleMarketChatPress = useCallback(
  (order: WorkerMarketOrder) => {
    const orderId = getSafeId(order.id);

    if (!orderId) {
      return;
    }

    router.push({
      pathname: "/(worker)/orders/market/chat",
      params: {
        orderId,
      },
    });
  },
  [],
);

  /* ============================================================
  SHOP DETAILS
  ============================================================ */

  const handleShopRequestPress =
    useCallback(
      (
        request: FirebaseShopRequest,
      ) => {
        const requestId =
          getSafeId(request.id);

        if (!requestId) {
          return;
        }

        router.push({
          pathname:
            "/(worker)/orders/shop-request/[requestId]",
          params: {
            requestId,
          },
        });
      },
      [],
    );

  /* ============================================================
  CATEGORY ICON
  ============================================================ */

  const renderCategoryIcon =
    useCallback(
      (
        category: CategoryCardConfig,
      ) => {
        const iconColor =
          WorkerColors.primary;

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
                color={iconColor}
              />

              <View
                style={
                  styles.smallBag
                }
              >
                <MaterialCommunityIcons
                  name="shopping-outline"
                  size={16}
                  color={iconColor}
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
                color={iconColor}
              />

              <View
                style={
                  styles.smallShop
                }
              >
                <MaterialCommunityIcons
                  name="storefront-outline"
                  size={16}
                  color={iconColor}
                />
              </View>
            </View>
          );
        }

        return (
          <MaterialCommunityIcons
            name="tools"
            size={36}
            color={iconColor}
          />
        );
      },
      [],
    );

  /* ============================================================
  CATEGORY HOME
  ============================================================ */

  const renderCategoryHome =
    () => {
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
              view and manage your
              jobs.
            </AppText>
          </View>

          <View
            style={
              styles.categoryGrid
            }
          >
            {CATEGORY_CONFIG.map(
              category => {
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
                    : String(count);

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
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${category.title}`}
                    accessibilityState={{
                      busy: loading,
                    }}
                    style={({
                      pressed,
                    }) => [
                      styles.categoryCard,

                      category.key ===
                        "shop" &&
                        styles.shopCard,

                      pressed &&
                        styles.categoryCardPressed,
                    ]}
                  >
                    {/* =================================================
                    ICON
                    ================================================= */}

                    <View
                      style={
                        styles.categoryIcon
                      }
                    >
                      {renderCategoryIcon(
                        category,
                      )}
                    </View>

                    {/* =================================================
                    COUNT
                    ================================================= */}

                    <View
                      style={
                        styles.categoryCount
                      }
                    >
                      {loading ? (
                        <ActivityIndicator
                          size="small"
                          color="#FFFFFF"
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

                    {/* =================================================
                    TITLE
                    ================================================= */}

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

                    {/* =================================================
                    DESCRIPTION
                    ================================================= */}

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

                    {/* =================================================
                    ARROW
                    ================================================= */}

                    <View
                      style={
                        styles.categoryArrow
                      }
                    >
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={28}
                        color={
                          WorkerColors.primary
                        }
                      />
                    </View>

                    {/* =================================================
                    SOFT GLOW
                    ================================================= */}

                    <View
                      pointerEvents="none"
                      style={
                        styles.cardGlow
                      }
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
            <ActivityIndicator
              size="small"
              color={
                WorkerColors.primary
              }
            />

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.loadingText
              }
            >
              Loading{" "}
              {activeCategoryTitle.toLowerCase()}
              ...
            </AppText>
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
          <View
            style={
              styles.emptyState
            }
          >
            <View
              style={
                styles.emptyIcon
              }
            >
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={30}
                color={
                  WorkerColors.primary
                }
              />
            </View>

            <AppText
              variant="heading3"
              weight="semibold"
              center
              style={
                styles.emptyTitle
              }
            >
              Unable to load requests
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              center
              style={
                styles.emptyText
              }
            >
              {categoryError}
            </AppText>
          </View>
        );
      }

      if (visibleCount === 0) {
        return (
          <View
            style={
              styles.emptyState
            }
          >
            <View
              style={
                styles.emptyIcon
              }
            >
              <MaterialCommunityIcons
                name="clipboard-text-outline"
                size={30}
                color={
                  WorkerColors.primary
                }
              />
            </View>

            <AppText
              variant="heading3"
              weight="semibold"
              center
              style={
                styles.emptyTitle
              }
            >
              No requests found
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              center
              style={
                styles.emptyText
              }
            >
              There are no{" "}
              {selectedFilter ===
              "all"
                ? ""
                : `${selectedFilter} `}
              requests in this
              category.
            </AppText>
          </View>
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
                order => (
                  <WorkerServiceOrderCard
                    key={`service-${order.id}`}
                    order={order}
                    onPress={
                      handleServiceOrderPress
                    }
                  />
                ),
              )}
            </View>
          ) : null}


{selectedCategory === "market" ? (
  <View style={styles.ordersList}>
    {filteredMarketOrders.map(order => (
      <WorkerMarketOrderCard
        key={`market-${order.id}`}
        order={order}
        onPress={handleMarketOrderPress}
        onChatPress={handleMarketChatPress}
      />
    ))}
  </View>
) : null}

{selectedCategory === "shop" ? (
  <View style={styles.ordersList}>
    {filteredShopRequests.map(request => (
      <WorkerShopRequestCard
        key={`shop-${request.id}`}
        request={request}
        onPress={handleShopRequestPress}
      />
    ))}
  </View>
) : null}
</>
);
};

  /* ============================================================
  AUTH RESOLVING
  ============================================================ */

  if (!authReady) {
    return (
      <AppScreen
        role="worker"
        padded={false}
        scrollEnabled={false}
        contentContainerStyle={
          styles.stateScreen
        }
      >
        <ActivityIndicator
          size="small"
          color={
            WorkerColors.primary
          }
        />

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.stateText
          }
        >
          Loading your account...
        </AppText>
      </AppScreen>
    );
  }

  /* ============================================================
  NOT AUTHENTICATED
  ============================================================ */

  if (!user) {
    return (
      <AppScreen
        role="worker"
        padded={false}
        scrollEnabled={false}
        contentContainerStyle={
          styles.stateScreen
        }
      >
        <View
          style={styles.authIcon}
        >
          <AppIcon
            name="profile"
            role="worker"
            size="lg"
            color={
              WorkerColors.primary
            }
          />
        </View>

        <AppText
          variant="heading3"
          weight="semibold"
          center
          style={
            styles.authTitle
          }
        >
          Sign in required
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.authText
          }
        >
          Sign in to view your
          requests and jobs.
        </AppText>
      </AppScreen>
    );
  }

  /* ============================================================
  UI
  ============================================================ */

  return (
    <>
      <AppScreen
        role="worker"
        padded={false}
        scrollEnabled
        contentContainerStyle={
          styles.screen
        }
      >
        <View
          style={styles.content}
        >
          {!selectedCategory ? (
            <>
              <View
                style={styles.header}
              >
                <View
                  style={
                    styles.headerText
                  }
                >
                  <AppText
                    variant="heading1"
                    weight="bold"
                    style={
                      styles.headerTitle
                    }
                  >
                    Orders
                  </AppText>

                  <AppText
                    variant="body"
                    tone="secondary"
                    style={
                      styles.headerSubtitle
                    }
                  >
                    Manage your service,
                    market and shop
                    requests
                  </AppText>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Manage jobs"
                  accessibilityHint="Manage your worker job history"
                  onPress={
                    handleOpenManagement
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.settingsButton,

                    pressed &&
                      styles.settingsButtonPressed,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="tune-variant"
                    size={23}
                    color={
                      WorkerColors.primary
                    }
                  />
                </Pressable>
              </View>

              {renderCategoryHome()}
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
                      styles.buttonPressed,
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
                  accessibilityLabel="Manage jobs"
                  hitSlop={8}
                  style={({
                    pressed,
                  }) => [
                    styles.manageButton,

                    pressed &&
                      styles.buttonPressed,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="tune-variant"
                    size={23}
                    color={
                      WorkerColors.primary
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
                {WORKER_FILTERS.map(
                  filter => {
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

      <WorkerOrderDeletionManager
        visible={
          managementVisible
        }
        counts={{
          pending:
            deletionCounts.pending,
          active:
            deletionCounts.active,
          completed:
            deletionCounts.completed,
          cancelled:
            deletionCounts.cancelled,
        }}
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

    header: {
      width: "100%",
      paddingTop:
        FixxamTokens.spacing.xs,
      paddingBottom:
        FixxamTokens.spacing.sm,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: FixxamTokens.spacing.sm,
    },

    headerText: {
      flex: 1,
      minWidth: 0,
    },

    headerTitle: {
      color: "#07152F",
    },

    headerSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    settingsButton: {
      width: 46,
      height: 46,
      flexShrink: 0,
      alignItems: "center",
      justifyContent:
        "center",
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        Colors.divider,
      borderRadius:
        FixxamTokens.radius.md,
      backgroundColor:
        Colors.surface,
    },

    settingsButtonPressed: {
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

    categoryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent:
        "space-between",
      rowGap:
        FixxamTokens.spacing.md,
    },

    /* ============================================================
    WORKER CATEGORY CARD
    ============================================================ */

    categoryCard: {
      width: "48.3%",
      minHeight: 270,
      position: "relative",
      overflow: "hidden",

      padding:
        FixxamTokens.spacing.lg,

      backgroundColor:
        "#FFFFFF",

      borderWidth: 1,
      borderColor: "#E8EEF7",
      borderRadius: 28,

      shadowColor: "#0B2447",
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

    categoryIcon: {
      width: 74,
      height: 74,

      alignItems: "center",
      justifyContent:
        "center",

      borderRadius: 25,

      marginBottom:
        FixxamTokens.spacing.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    layeredIcon: {
      width: 44,
      height: 44,

      alignItems: "center",
      justifyContent:
        "center",

      position: "relative",
    },

    smallBag: {
      position: "absolute",

      right: -5,
      bottom: -4,

      width: 24,
      height: 24,

      alignItems: "center",
      justifyContent:
        "center",

      borderRadius: 8,

      backgroundColor:
        WorkerColors.primarySoft,

      borderWidth: 1,
      borderColor:
        WorkerColors.primaryLight,
    },

    smallShop: {
      position: "absolute",

      right: -5,
      bottom: -4,

      width: 24,
      height: 24,

      alignItems: "center",
      justifyContent:
        "center",

      borderRadius: 8,

      backgroundColor:
        WorkerColors.primarySoft,

      borderWidth: 1,
      borderColor:
        WorkerColors.primaryLight,
    },

  categoryCount: {
  position: "absolute",
  top: 20,
  right: 18,

  minWidth: 36,
  height: 36,
  paddingHorizontal: 7,

  alignItems: "center",
  justifyContent: "center",

  borderRadius: 18,

  backgroundColor: "#EF2029",

  shadowColor: "#EF2029",
  shadowOpacity: 0.16,
  shadowRadius: 6,
  shadowOffset: {
    width: 0,
    height: 3,
  },

  elevation: 2,
},

categoryCountText: {
  color: "#FFFFFF",
  fontSize: 12,
  lineHeight: 15,
  fontWeight: "700",
},

    categoryTitle: {
      color: "#07152F",
      fontSize: 18,
      lineHeight: 24,
      paddingRight: 4,
    },

    categoryDescription: {
      marginTop:
        FixxamTokens.spacing.sm,

      color: "#718096",

      fontSize: 15,
      lineHeight: 22,

      paddingRight: 4,
    },

    categoryArrow: {
      position: "absolute",

      right: 20,
      bottom: 20,

      width: 48,
      height: 48,

      alignItems: "center",
      justifyContent:
        "center",

      borderRadius: 24,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    cardGlow: {
      position: "absolute",

      width: 170,
      height: 170,

      right: -90,
      bottom: -95,

      borderRadius: 100,

      backgroundColor:
        WorkerColors.primarySoft,

      opacity: 0.55,
    },

    /* ============================================================
    DETAIL
    ============================================================ */

    detailHeader: {
      minHeight: 64,

      flexDirection: "row",
      alignItems: "center",

      marginBottom:
        FixxamTokens.spacing.sm,
    },

    backButton: {
      width: 46,
      height: 46,

      alignItems: "center",
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

      alignItems: "center",
      justifyContent:
        "center",

      borderRadius: 15,

      backgroundColor:
        WorkerColors.primarySoft,

      borderWidth: 1,

      borderColor:
        WorkerColors.primarySoft,
    },

    buttonPressed: {
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

      alignItems: "center",
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
        WorkerColors.primary,

      backgroundColor:
        WorkerColors.primary,
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

    ordersList: {
      marginTop:
        FixxamTokens.spacing.sm,

      gap:
        FixxamTokens.spacing.sm,
    },

    /* ============================================================
    LOADING
    ============================================================ */

    loadingContainer: {
      minHeight: 220,

      alignItems: "center",
      justifyContent:
        "center",
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.sm,

      color:
        Colors.textSecondary,
    },

    /* ============================================================
    EMPTY
    ============================================================ */

    emptyState: {
      minHeight: 300,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems: "center",
      justifyContent:
        "center",
    },

    emptyIcon: {
      width: 64,
      height: 64,

      alignItems: "center",
      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    emptyTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    emptyText: {
      maxWidth: 300,

      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 21,
    },

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

    /* ============================================================
    AUTH / STATE
    ============================================================ */

    stateScreen: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems: "center",
      justifyContent:
        "center",

      backgroundColor:
        Colors.background,
    },

    stateText: {
      marginTop:
        FixxamTokens.spacing.sm,

      color:
        Colors.textSecondary,
    },

    authIcon: {
      width: 52,
      height: 52,

      alignItems: "center",
      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    authTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    authText: {
      maxWidth: 280,

      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },
  });