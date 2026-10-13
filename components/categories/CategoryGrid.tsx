import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  AppButton,
  AppIcon,
  AppText,
} from "@/components/ui";

import CategoryCard from "./CategoryCard";

import {
  categoryMapper,
  type CategoryData,
} from "@/firebase/mappers/categoryMapper";

import {
  getCategories,
} from "@/firebase/queries/categories";

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
   COMPONENT
============================================================== */

export default function CategoryGrid() {
  const params =
    useLocalSearchParams<{
      reward?: string;
    }>();

  const reward =
    cleanString(
      params.reward,
    );

  /* ============================================================
     STATE
  ============================================================ */

  const [
    categories,
    setCategories,
  ] =
    useState<
      CategoryData[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  /* ============================================================
     LOAD CATEGORIES
  ============================================================ */

  const loadCategories =
    useCallback(async () => {
      try {
        setLoading(
          true,
        );

        setError(
          null,
        );

        const snapshot =
          await getCategories();

        const data =
          snapshot.docs
            .map(
              categoryMapper,
            )
            .filter(
              (
                item,
              ) =>
                Boolean(
                  item.name,
                ),
            )
            .map(
              (
                item,
              ): CategoryData => ({
                ...item,

                icon:
                  item.icon ||
                  "service",

                color:
                  item.color ||
                  CustomerColors.primary,

                backgroundColor:
                  item.backgroundColor ||
                  CustomerColors.primarySoft,
              }),
            );

        setCategories(
          data,
        );
      } catch (
        loadError
      ) {
        console.error(
          "LOAD_CATEGORIES_ERROR:",
          loadError,
        );

        setCategories(
          [],
        );

        setError(
          "Unable to load categories. Please try again.",
        );
      } finally {
        setLoading(
          false,
        );
      }
    }, []);

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    let active =
      true;

    const run =
      async () => {
        if (
          !active
        ) {
          return;
        }

        await loadCategories();
      };

    void run();

    return () => {
      active =
        false;
    };
  }, [
    loadCategories,
  ]);

  /* ============================================================
     CATEGORY PRESS
  ============================================================ */

  const handleCategoryPress =
    useCallback(
      (
        categoryId:
          string,
      ) => {
        router.push({
          pathname:
            "/(customer)/details/categories/[id]",

          params: {
            id:
              categoryId,

            ...(reward
              ? {
                  reward,
                }
              : {}),
          },
        } as const);
      },
      [
        reward,
      ],
    );

  /* ============================================================
     LOADING
  ============================================================ */

  if (
    loading
  ) {
    return (
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
          Loading categories...
        </AppText>
      </View>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

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
          style={[
            styles.stateIcon,
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
            styles.stateTitle
          }
        >
          Unable to load categories
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.stateText
          }
        >
          {error}
        </AppText>

        <AppButton
          title="Try Again"
          role="customer"
          leftIconName="refresh"
          onPress={
            loadCategories
          }
          style={
            styles.retryButton
          }
        />
      </View>
    );
  }

  /* ============================================================
     EMPTY
  ============================================================ */

  if (
    categories.length ===
    0
  ) {
    return (
      <View
        style={
          styles.stateContainer
        }
      >
        <View
          style={
            styles.stateIcon
          }
        >
          <AppIcon
            name="service"
            role="customer"
            size="lg"
            state="muted"
          />
        </View>

        <AppText
          variant="bodyLarge"
          weight="bold"
          center
          style={
            styles.stateTitle
          }
        >
          No categories yet
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.stateText
          }
        >
          There are currently no
          service categories available.
        </AppText>
      </View>
    );
  }

  /* ============================================================
     CATEGORIES
  ============================================================ */

  return (
    <View
      style={
        styles.container
      }
    >
      {categories.map(
        (
          item,
        ) => (
          <CategoryCard
            key={
              item.id
            }
            title={
              item.name
            }
            icon={
              item.icon
            }
            iconColor={
              item.color
            }
            backgroundColor={
              item.backgroundColor
            }
            onPress={() =>
              handleCategoryPress(
                item.id,
              )
            }
          />
        ),
      )}
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      gap:
        FixxamTokens.spacing.sm,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.xl,
    },

    /* ========================================================
       LOADING
    ======================================================== */

    loadingContainer: {
      minHeight: 240,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingVertical:
        FixxamTokens.spacing.xxxl,
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       STATE
    ======================================================== */

    stateContainer: {
      minHeight: 280,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingVertical:
        FixxamTokens.spacing.xxxl,
    },

    stateIcon: {
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

    stateTitle: {
      marginTop:
        FixxamTokens.spacing.md,
    },

    stateText: {
      maxWidth: 320,

      marginTop:
        FixxamTokens.spacing.sm,
    },

    retryButton: {
      minWidth: 170,

      marginTop:
        FixxamTokens.spacing.lg,
    },
  });