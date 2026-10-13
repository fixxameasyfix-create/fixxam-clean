import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import CategoryCard from "@/components/categories/CategoryCard";

import useServicesBySubcategory from "@/hooks/services/useServicesBySubcategory";

import type {
  ServiceCardData,
} from "@/firebase/mappers/serviceMapper";

import {
  getCategoryById,
} from "@/firebase/queries/getCategoryById";

import {
  getSubcategoryById,
} from "@/firebase/queries/getSubcategoryById";

import type {
  CategoryData,
} from "@/firebase/mappers/categoryMapper";

import type {
  SubcategoryData,
} from "@/firebase/mappers/subcategoryMapper";

import {
  resolveServiceFulfillmentMode,
} from "@/types/serviceFulfillmentResolver";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

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

/* ==============================================================
   SEPARATOR
============================================================== */

function ServiceSeparator() {
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

export default function ServicesScreen() {
  const params =
    useLocalSearchParams<{
      id?: string;

      categoryId?: string;

      reward?: string;
    }>();

  const subcategoryId =
    cleanString(
      params.id,
    );

  const categoryId =
    cleanString(
      params.categoryId,
    );

  const reward =
    cleanString(
      params.reward,
    );

  /* ============================================================
     SERVICES
  ============================================================ */

  const {
    services,
    loading,
    refreshing,
    onRefresh,
  } =
    useServicesBySubcategory(
      subcategoryId,
    );

  /* ============================================================
     FULFILLMENT PARENTS
  ============================================================ */

  const [
    category,
    setCategory,
  ] =
    useState<
      CategoryData | null
    >(null);

  const [
    subcategory,
    setSubcategory,
  ] =
    useState<
      SubcategoryData | null
    >(null);

  const [
    fulfillmentLoading,
    setFulfillmentLoading,
  ] =
    useState(true);

  /* ============================================================
     LOAD FULFILLMENT PARENTS
  ============================================================ */

  useEffect(() => {
    let active =
      true;

    const loadFulfillmentParents =
      async () => {
        try {
          setFulfillmentLoading(
            true,
          );

          const [
            categoryResult,
            subcategoryResult,
          ] =
            await Promise.all([
              categoryId
                ? getCategoryById(
                    categoryId,
                  )
                : Promise.resolve(
                    null,
                  ),

              subcategoryId
                ? getSubcategoryById(
                    subcategoryId,
                  )
                : Promise.resolve(
                    null,
                  ),
            ]);

          if (
            !active
          ) {
            return;
          }

          setCategory(
            categoryResult,
          );

          setSubcategory(
            subcategoryResult,
          );
        } catch (
          loadError
        ) {
          console.error(
            "LOAD_FULFILLMENT_PARENTS_ERROR:",
            loadError,
          );

          if (
            active
          ) {
            setCategory(
              null,
            );

            setSubcategory(
              null,
            );
          }
        } finally {
          if (
            active
          ) {
            setFulfillmentLoading(
              false,
            );
          }
        }
      };

    void loadFulfillmentParents();

    return () => {
      active =
        false;
    };
  }, [
    categoryId,
    subcategoryId,
  ]);

  /* ============================================================
     BACK
  ============================================================ */

  const handleBack =
    useCallback(() => {
      router.back();
    }, []);

  /* ============================================================
     OPEN WORKERS
  ============================================================ */

  const handleServicePress =
    useCallback(
      (
        service:
          ServiceCardData,
      ) => {
        /*
         * Do not navigate until parent
         * fulfillment data has finished
         * loading.
         */
        if (
          fulfillmentLoading
        ) {
          return;
        }

        const serviceId =
          cleanString(
            service.id,
          );

        const serviceName =
          cleanString(
            service.name,
          );

        if (
          !serviceId ||
          !serviceName
        ) {
          return;
        }

        /*
         * Resolve using:
         *
         * Service
         *   ↓
         * Subcategory
         *   ↓
         * Category
         *   ↓
         * needs_review
         */
        const fulfillmentMode =
          resolveServiceFulfillmentMode({
            serviceMode:
              service.fulfillmentMode,

            subcategoryMode:
              subcategory?.fulfillmentMode,

            categoryMode:
              category?.fulfillmentMode,
          });

        /*
         * Keep the EXACT icon coming
         * from the selected service.
         */
        const serviceIcon =
          cleanString(
            service.icon,
          );

        router.push({
          pathname:
            "/(customer)/details/workers/[id]",

          params: {
            /*
             * Route ID
             */
            id:
              serviceId,

            /*
             * Service ID
             */
            serviceId,

            /*
             * Service name
             */
            service:
              serviceName,

            /*
             * RESOLVED FULFILLMENT MODE
             */
            fulfillmentMode,

            /*
             * EXACT SERVICE ICON
             */
            ...(serviceIcon
              ? {
                  serviceIcon,
                }
              : {}),

            /*
             * Category
             */
            ...(categoryId
              ? {
                  categoryId,
                }
              : {}),

            /*
             * Reward
             */
            ...(reward
              ? {
                  reward,
                }
              : {}),
          },
        });
      },
      [
        category,
        categoryId,
        fulfillmentLoading,
        reward,
        subcategory,
      ],
    );

  /* ============================================================
     RENDER SERVICE
  ============================================================ */

  const renderService =
    useCallback(
      ({
        item,
      }: {
        item:
          ServiceCardData;
      }) => (
        <CategoryCard
          /*
           * EXACT SERVICE ICON
           */
          icon={
            item.icon
          }
          iconColor={
            item.color
          }
          backgroundColor={
            item.backgroundColor
          }
          title={
            item.name
          }
          onPress={() =>
            handleServicePress(
              item,
            )
          }
        />
      ),
      [
        handleServicePress,
      ],
    );

  /* ============================================================
     LOADING
  ============================================================ */

  if (
    loading ||
    fulfillmentLoading
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
            Loading services...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <AppScreen
      role="customer"
      padded={false}
    >
      <View
        style={
          styles.container
        }
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

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

          <AppText
            variant="heading3"
            weight="bold"
            center
            numberOfLines={1}
            style={
              styles.title
            }
          >
            Services
          </AppText>

          <View
            pointerEvents="none"
            style={
              styles.placeholder
            }
          />
        </View>

        {/* ====================================================
            SERVICES
        ==================================================== */}

        <FlatList
          data={
            services
          }
          keyExtractor={(
            item,
          ) =>
            item.id
          }
          renderItem={
            renderService
          }
          ItemSeparatorComponent={
            ServiceSeparator
          }
          refreshing={
            refreshing
          }
          onRefresh={
            onRefresh
          }
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.content
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
                  name="service"
                  role="customer"
                  size="xl"
                  state="muted"
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
                No Services Found
              </AppText>

              <AppText
                variant="body"
                tone="secondary"
                center
                style={
                  styles.emptyText
                }
              >
                There are no services
                available in this
                category yet.
              </AppText>
            </View>
          }
        />
      </View>
    </AppScreen>
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

      flexDirection:
        "row",

      alignItems:
        "center",

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

    title: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.sm,
    },

    placeholder: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,
    },

    /* ========================================================
       LIST
    ======================================================== */

    content: {
      flexGrow: 1,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.xxl,
    },

    separator: {
      height:
        FixxamTokens.spacing.sm,
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

    /* ========================================================
       EMPTY
    ======================================================== */

    empty: {
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

    emptyTitle: {
      marginTop:
        FixxamTokens.spacing.md,
    },

    emptyText: {
      maxWidth: 320,

      marginTop:
        FixxamTokens.spacing.sm,
    },
  });