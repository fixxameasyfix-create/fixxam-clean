import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
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
  AppScreen,
  AppText,
} from "@/components/ui";

import CategoryCard from "@/components/categories/CategoryCard";

import {
  getSubcategories,
} from "@/firebase/queries/subcategories";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Subcategory = {
  id: string;

  name: string;

  icon: string;

  color: string;

  backgroundColor: string;
};

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
   SCREEN
============================================================== */

export default function CategoryScreen() {
  const params =
    useLocalSearchParams<{
      id: string;

      reward?: string;
    }>();

  const categoryId =
    cleanString(
      params.id,
    );

  const reward =
    cleanString(
      params.reward,
    );

  /* ============================================================
     STATE
  ============================================================ */

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    subcategories,
    setSubcategories,
  ] =
    useState<
      Subcategory[]
    >([]);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  /* ============================================================
     LOAD SUBCATEGORIES
  ============================================================ */

  const loadSubcategories =
    useCallback(async () => {
      if (
        !categoryId
      ) {
        setSubcategories(
          [],
        );

        setError(
          "Category information is unavailable.",
        );

        setLoading(
          false,
        );

        return;
      }

      try {
        setLoading(
          true,
        );

        setError(
          null,
        );

        const snapshot =
          await getSubcategories(
            categoryId,
          );

        const data =
          snapshot.docs.reduce<
            Subcategory[]
          >(
            (
              items,
              document,
            ) => {
              const raw =
                document.data();

              const name =
                cleanString(
                  raw.name,
                );

              if (
                !name
              ) {
                return items;
              }

              items.push({
                id:
                  document.id,

                name,

                icon:
                  cleanString(
                    raw.icon,
                  ) ||
                  "service",

                color:
                  cleanString(
                    raw.color,
                  ) ||
                  CustomerColors.primary,

                backgroundColor:
                  cleanString(
                    raw.backgroundColor,
                  ) ||
                  CustomerColors.primarySoft,
              });

              return items;
            },
            [],
          );

        setSubcategories(
          data,
        );
      } catch (
        loadError
      ) {
        console.error(
          "LOAD_SUBCATEGORIES_ERROR:",
          loadError,
        );

        setSubcategories(
          [],
        );

        setError(
          "Unable to load subcategories. Please try again.",
        );
      } finally {
        setLoading(
          false,
        );
      }
    }, [
      categoryId,
    ]);

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    void loadSubcategories();
  }, [
    loadSubcategories,
  ]);

  /* ============================================================
     BACK
  ============================================================ */

  const handleBack =
    useCallback(() => {
      router.back();
    }, []);

  /* ============================================================
     SUBCATEGORY
  ============================================================ */

  const handleSubcategoryPress =
    useCallback(
      (
        subcategoryId:
          string,
      ) => {
        router.push({
          pathname:
            "/(customer)/details/services/[id]",

          params: {
            id:
              subcategoryId,

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
        categoryId,
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
      <AppScreen
        role="customer"
        padded={false}
        contentContainerStyle={
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
          Loading subcategories...
        </AppText>
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
      contentContainerStyle={
        styles.container
      }
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
          Subcategories
        </AppText>

        <View
          style={
            styles.placeholder
          }
        />
      </View>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error ? (
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
            Unable to load services
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
              loadSubcategories
            }
            style={
              styles.stateButton
            }
          />
        </View>
      ) : subcategories.length ===
        0 ? (
        /* ====================================================
           EMPTY
        ==================================================== */

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
            No subcategories yet
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
            services available in this
            category.
          </AppText>
        </View>
      ) : (
        /* ====================================================
           SUBCATEGORY LIST
        ==================================================== */

        <View
          style={
            styles.list
          }
        >
          {subcategories.map(
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
                  handleSubcategoryPress(
                    item.id,
                  )
                }
              />
            ),
          )}
        </View>
      )}
    </AppScreen>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.xxl,
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

      marginBottom:
        FixxamTokens.spacing.md,
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

    placeholder: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,
    },

    title: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       LIST
    ======================================================== */

    list: {
      gap:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       STATE
    ======================================================== */

    stateContainer: {
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

    stateButton: {
      minWidth: 170,

      marginTop:
        FixxamTokens.spacing.lg,
    },
  });