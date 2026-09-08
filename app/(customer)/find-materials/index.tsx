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
  TextInput,
  View,
  type ListRenderItem,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  router,
} from "expo-router";

import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import Toast from "react-native-toast-message";

import {
  AppIcon,
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

/* ==============================================================
   TYPES
============================================================== */

type Service = {
  id: string;

  name: string;

  icon?: string;

  color?: string;

  backgroundColor?: string;

  aliases?: string[];

  keywords?: string[];

  tags?: string[];
};

type LoadMode =
  | "initial"
  | "refresh"
  | "retry";

type MaterialIconName =
  React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];

/* ==============================================================
   HELPERS
============================================================== */

function normalizeSearchText(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(
      /[^\p{L}\p{N}\s]/gu,
      " ",
    )
    .replace(
      /\s+/g,
      " ",
    );
}

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
          normalizeSearchText,
        )
        .filter(Boolean),
    ),
  );
}

function getServiceIcon(
  icon?: string,
): MaterialIconName {
  if (
    icon &&
    icon in
      MaterialCommunityIcons.glyphMap
  ) {
    return icon as MaterialIconName;
  }

  return "tools";
}

function getSearchTokens(
  value: string,
): string[] {
  return Array.from(
    new Set(
      normalizeSearchText(
        value,
      )
        .split(" ")
        .filter(
          (token) =>
            token.length >= 2,
        ),
    ),
  );
}

function matchesService(
  service: Service,
  searchQuery: string,
): boolean {
  const normalizedQuery =
    normalizeSearchText(
      searchQuery,
    );

  if (!normalizedQuery) {
    return true;
  }

  const searchableText =
    [
      service.name,
      service.aliases?.join(
        " ",
      ),
      service.keywords?.join(
        " ",
      ),
      service.tags?.join(
        " ",
      ),
    ]
      .map(
        normalizeSearchText,
      )
      .filter(Boolean)
      .join(" ");

  if (
    searchableText.includes(
      normalizedQuery,
    )
  ) {
    return true;
  }

  const tokens =
    getSearchTokens(
      normalizedQuery,
    );

  if (
    tokens.length === 0
  ) {
    return false;
  }

  return tokens.every(
    (token) =>
      searchableText.includes(
        token,
      ),
  );
}

/* ==============================================================
   SCREEN
============================================================== */

export default function FindMaterialsServicesScreen() {
  const [
    services,
    setServices,
  ] =
    useState<Service[]>([]);

  const [
    searchQuery,
    setSearchQuery,
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

  const requestIdRef =
    useRef(0);

  /* ============================================================
     LOAD SERVICES
  ============================================================ */

  const loadServices =
    useCallback(
      async (
        mode: LoadMode =
          "initial",
      ) => {
        const requestId =
          ++requestIdRef.current;

        if (
          mode === "initial"
        ) {
          setLoading(true);
        }

        if (
          mode === "refresh"
        ) {
          setRefreshing(true);
        }

        if (
          mode !== "refresh"
        ) {
          setError(null);
        }

        try {
          const servicesQuery =
            query(
              collection(
                db,
                "services",
              ),
              orderBy(
                "name",
                "asc",
              ),
            );

          const snapshot =
            await getDocs(
              servicesQuery,
            );

          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          const result =
            snapshot.docs.reduce<
              Service[]
            >(
              (
                items,
                document,
              ) => {
                const data =
                  document.data();

                const name =
                  normalizeString(
                    data.name,
                  );

                if (!name) {
                  return items;
                }

                items.push({
                  id:
                    document.id,

                  name,

                  icon:
                    normalizeString(
                      data.icon,
                    ) ||
                    undefined,

                  color:
                    normalizeString(
                      data.color,
                    ) ||
                    undefined,

                  backgroundColor:
                    normalizeString(
                      data.backgroundColor,
                    ) ||
                    undefined,

                  aliases:
                    normalizeStringArray(
                      data.aliases,
                    ),

                  keywords:
                    normalizeStringArray(
                      data.keywords,
                    ),

                  tags:
                    normalizeStringArray(
                      data.tags,
                    ),
                });

                return items;
              },
              [],
            );

          setServices(
            result,
          );

          setError(null);
        } catch (
          loadError
        ) {
          console.error(
            "FIND_MATERIALS_SERVICES_LOAD_ERROR:",
            loadError,
          );

          if (
            requestId !==
            requestIdRef.current
          ) {
            return;
          }

          if (
            mode ===
              "refresh" &&
            services.length > 0
          ) {
            Toast.show({
              type: "error",
              text1:
                "Unable to refresh services",
              text2:
                "Please try again.",
            });

            return;
          }

          setServices([]);

          setError(
            "Unable to load services. Please try again.",
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
        services.length,
      ],
    );

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    void loadServices(
      "initial",
    );

    return () => {
      requestIdRef.current +=
        1;
    };
  }, [
    loadServices,
  ]);

  /* ============================================================
     FILTER
  ============================================================ */

  const filteredServices =
    useMemo(() => {
      if (
        !searchQuery.trim()
      ) {
        return services;
      }

      return services.filter(
        (service) =>
          matchesService(
            service,
            searchQuery,
          ),
      );
    }, [
      searchQuery,
      services,
    ]);

  /* ============================================================
     ACTIONS
  ============================================================ */

  const handleRefresh =
    useCallback(() => {
      if (
        refreshing ||
        loading
      ) {
        return;
      }

      void loadServices(
        "refresh",
      );
    }, [
      loadServices,
      loading,
      refreshing,
    ]);

  const handleRetry =
    useCallback(() => {
      void loadServices(
        "retry",
      );
    }, [
      loadServices,
    ]);

  const handleClearSearch =
    useCallback(() => {
      setSearchQuery("");
    }, []);

  const handleServicePress =
    useCallback(
      (
        service: Service,
      ) => {
        router.push({
          pathname:
            "/(customer)/find-materials/[serviceId]",

          params: {
            serviceId:
              service.id,

            serviceName:
              service.name,
          },
        });
      },
      [],
    );

  /* ============================================================
     LIST HEADER
  ============================================================ */

  const listHeader =
    useMemo(
      () => (
        <View
          style={
            styles.listHeader
          }
        >
          <View
            style={
              styles.listHeaderIcon
            }
          >
            <AppIcon
              name="service"
              role="customer"
              size="md"
              state="active"
            />
          </View>

          <View
            style={
              styles.listHeaderText
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.listHeaderTitle
              }
            >
              {searchQuery.trim()
                ? `${
                    filteredServices.length
                  } ${
                    filteredServices.length ===
                    1
                      ? "Service"
                      : "Services"
                  } Found`
                : "Available Services"}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.listHeaderDescription
              }
            >
              {searchQuery.trim()
                ? `Results for "${searchQuery.trim()}"`
                : "Choose a service to see matching materials."}
            </AppText>
          </View>
        </View>
      ),
      [
        filteredServices.length,
        searchQuery,
      ],
    );

  /* ============================================================
     RENDER SERVICE
  ============================================================ */

  const renderService =
    useCallback<
      ListRenderItem<Service>
    >(
      ({
        item,
      }) => {
        const icon =
          getServiceIcon(
            item.icon,
          );

        const iconColor =
          item.color ||
          CustomerColors.primary;

        const iconBackground =
          item.backgroundColor ||
          CustomerColors.primarySoft;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Find materials for ${item.name}`}
            onPress={() =>
              handleServicePress(
                item,
              )
            }
            style={({
              pressed,
            }) => [
              styles.serviceCard,

              pressed
                ? styles.pressed
                : null,
            ]}
          >
            {/* Exact Firebase service icon preserved */}
            <View
              style={[
                styles.serviceIcon,
                {
                  backgroundColor:
                    iconBackground,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={icon}
                size={25}
                color={
                  iconColor
                }
              />
            </View>

            <View
              style={
                styles.serviceContent
              }
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
                numberOfLines={2}
                style={
                  styles.serviceName
                }
              >
                {item.name}
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                numberOfLines={1}
                style={
                  styles.serviceDescription
                }
              >
                View materials available for this service
              </AppText>
            </View>

            <View
              style={
                styles.arrowButton
              }
            >
              <AppIcon
                name="next"
                role="customer"
                size="xs"
                state="active"
              />
            </View>
          </Pressable>
        );
      },
      [
        handleServicePress,
      ],
    );

  const keyExtractor =
    useCallback(
      (
        item: Service,
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
          accessibilityLabel="Loading services"
          style={
            styles.center
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
            Loading services...
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
            Choose a Service
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            numberOfLines={2}
            style={
              styles.subtitle
            }
          >
            Select the service you need materials for.
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
            ? styles.searchFocused
            : null,
        ]}
      >
        <AppIcon
          name="search"
          role="customer"
          size="sm"
          color={
            searchFocused
              ? CustomerColors.primary
              : Colors.textMuted
          }
        />

        <TextInput
          value={
            searchQuery
          }
          onChangeText={
            setSearchQuery
          }
          onFocus={() =>
            setSearchFocused(
              true,
            )
          }
          onBlur={() =>
            setSearchFocused(
              false,
            )
          }
          placeholder="Search services..."
          placeholderTextColor={
            Colors.textMuted
          }
          style={
            styles.searchInput
          }
          autoCorrect={
            false
          }
          autoCapitalize="none"
          returnKeyType="search"
          accessibilityLabel="Search services"
        />

        {searchQuery.length >
        0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={6}
            onPress={
              handleClearSearch
            }
            style={({
              pressed,
            }) => [
              styles.clearButton,

              pressed
                ? styles.pressed
                : null,
            ]}
          >
            <AppIcon
              name="close"
              role="customer"
              size="sm"
              state="muted"
            />
          </Pressable>
        ) : null}
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
                styles.actionText
              }
            >
              Try Again
            </AppText>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={
            filteredServices
          }
          keyExtractor={
            keyExtractor
          }
          renderItem={
            renderService
          }
          refreshing={
            refreshing
          }
          onRefresh={
            handleRefresh
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.list
          }
          ListHeaderComponent={
            listHeader
          }
          ListEmptyComponent={
            <View
              style={
                styles.empty
              }
            >
              <View
                style={
                  styles.emptyIcon
                }
              >
                <AppIcon
                  name={
                    searchQuery.trim()
                      ? "search"
                      : "service"
                  }
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
                  styles.emptyTitle
                }
              >
                {searchQuery.trim()
                  ? "No Matching Services"
                  : "No Services Found"}
              </AppText>

              <AppText
                variant="body"
                tone="secondary"
                center
                style={
                  styles.emptyText
                }
              >
                {searchQuery.trim()
                  ? `We couldn't find a service matching "${searchQuery.trim()}".`
                  : "There are no services available right now."}
              </AppText>

              {searchQuery.trim() ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  onPress={
                    handleClearSearch
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.clearSearchButton,

                    pressed
                      ? styles.pressed
                      : null,
                  ]}
                >
                  <AppText
                    variant="bodyMedium"
                    weight="bold"
                    style={
                      styles.actionText
                    }
                  >
                    Clear Search
                  </AppText>
                </Pressable>
              ) : null}
            </View>
          }
          initialNumToRender={8}
          maxToRenderPerBatch={10}
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
      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.md,
    },

    backButton: {
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

      lineHeight: 19,
    },

    /* ========================================================
       SEARCH
    ======================================================== */

    searchContainer: {
      height:
        FixxamTokens.size
          .inputHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginHorizontal:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.search,

      backgroundColor:
        Colors.surface,
    },

    searchFocused: {
      borderColor:
        CustomerColors.primary,
    },

    searchInput: {
      flex: 1,

      minWidth: 0,

      height: "100%",

      marginLeft:
        FixxamTokens.spacing.sm,

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
    },

    /* ========================================================
       LIST
    ======================================================== */

    list: {
      flexGrow: 1,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.xxl,
    },

    listHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    listHeaderIcon: {
      width: 44,

      height: 44,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    listHeaderText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    listHeaderTitle: {
      color:
        Colors.textPrimary,
    },

    listHeaderDescription: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 18,
    },

    /* ========================================================
       SERVICE CARD
    ======================================================== */

    serviceCard: {
      minHeight: 72,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    serviceIcon: {
      width: 48,

      height: 48,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,
    },

    serviceContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,

      paddingRight:
        FixxamTokens.spacing.xs,
    },

    serviceName: {
      color:
        Colors.textPrimary,
    },

    serviceDescription: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 17,
    },

    arrowButton: {
      width: 36,

      height: 36,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    empty: {
      minHeight: 360,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xxl,
    },

    emptyIcon: {
      width: 82,

      height: 82,

      alignItems:
        "center",

      justifyContent:
        "center",

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
      maxWidth: 320,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,
    },

    clearSearchButton: {
      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

      alignItems:
        "center",

      justifyContent:
        "center",

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

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xxl,
    },

    errorIcon: {
      width: 82,

      height: 82,

      alignItems:
        "center",

      justifyContent:
        "center",

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
      maxWidth: 320,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,
    },

    retryButton: {
      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

      alignItems:
        "center",

      justifyContent:
        "center",

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

    center: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.md,
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