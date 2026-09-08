import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  useRouter,
} from "expo-router";

import Toast from "react-native-toast-message";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

/*
 * IMPORTANT:
 *
 * This is the existing dynamic service/category
 * icon renderer.
 *
 * Keep it because Firebase provides:
 * icon
 * color
 * backgroundColor
 */
import ServiceIcon from "@/components/common/AppIcon";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import {
  getCategories,
} from "@/firebase/queries/categories";

/* ============================================================
   TYPES
============================================================ */

type Category = {
  id: string;

  name: string;

  icon?: string;

  color?: string;

  backgroundColor?: string;
};

/* ============================================================
   CONSTANTS
============================================================ */

const HOME_CATEGORY_LIMIT = 8;

/* ============================================================
   HELPERS
============================================================ */

function cleanText(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function shortName(
  name: string,
): string {
  switch (name) {
    case "Home Services":
      return "Home";

    case "Construction & Building":
      return "Building";

    case "Electrical & Energy":
      return "Electrical";

    case "Security Services":
      return "Security";

    case "Automotive Services":
      return "Automotive";

    case "Technology Services":
      return "Technology";

    case "Beauty & Personal Care":
      return "Beauty";

    case "Fashion & Tailoring":
      return "Fashion";

    case "Events & Entertainment":
      return "Events";

    case "Business & Professional Services":
      return "Business";

    case "Healthcare Services":
      return "Healthcare";

    case "Agriculture & Farming":
      return "Agriculture";

    case "Food & Hospitality":
      return "Food";

    case "Logistics & Transportation":
      return "Logistics";

    case "Education & Training":
      return "Education";

    default:
      return name;
  }
}

/* ============================================================
   COMPONENT
============================================================ */

export default function HomeCategories() {
  const router =
    useRouter();

  const [
    categories,
    setCategories,
  ] =
    useState<Category[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  /* ==========================================================
     LOAD CATEGORIES
  ========================================================== */

  useEffect(() => {
    let active = true;

    const loadCategories =
      async () => {
        try {
          setLoading(true);

          const snapshot =
            await getCategories();

          if (!active) {
            return;
          }

          const data =
            snapshot.docs
              .map(
                (
                  document,
                ): Category | null => {
                  const raw =
                    document.data() as Partial<
                      Omit<
                        Category,
                        "id"
                      >
                    >;

                  const name =
                    cleanText(
                      raw.name,
                    );

                  if (
                    !document.id ||
                    !name
                  ) {
                    return null;
                  }

                  return {
                    id:
                      document.id,

                    name,

                    icon:
                      cleanText(
                        raw.icon,
                      ) ||
                      undefined,

                    color:
                      cleanText(
                        raw.color,
                      ) ||
                      undefined,

                    backgroundColor:
                      cleanText(
                        raw.backgroundColor,
                      ) ||
                      undefined,
                  };
                },
              )
              .filter(
                (
                  item,
                ): item is Category =>
                  item !== null,
              );

          setCategories(
            data,
          );
        } catch (error) {
          console.error(
            "HOME_CATEGORIES_LOAD_ERROR",
            error,
          );

          if (!active) {
            return;
          }

          setCategories([]);

          Toast.show({
            type: "error",
            text1:
              "Unable to load categories",
            text2:
              "Please check your connection and try again.",
          });
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

    void loadCategories();

    return () => {
      active = false;
    };
  }, []);

  /* ==========================================================
     VISIBLE CATEGORIES
  ========================================================== */

  const visibleCategories =
    useMemo(
      () =>
        categories.slice(
          0,
          HOME_CATEGORY_LIMIT,
        ),
      [categories],
    );

  /* ==========================================================
     SEE ALL
  ========================================================== */

  const handleSeeAll =
    useCallback(() => {
      router.push(
        "/(customer)/details/categories",
      );
    }, [router]);

  /* ==========================================================
     CATEGORY
  ========================================================== */

  const handleCategoryPress =
    useCallback(
      (
        categoryId: string,
      ) => {
        const safeId =
          categoryId.trim();

        if (!safeId) {
          return;
        }

        router.push({
          pathname:
            "/(customer)/details/categories/[id]",

          params: {
            id: safeId,
          },
        } as const);
      },
      [router],
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View
      style={
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
        <AppText
          variant="heading3"
          weight="bold"
          style={
            styles.title
          }
        >
          Categories
        </AppText>

        <Pressable
          onPress={
            handleSeeAll
          }
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="See all categories"
          style={({
            pressed,
          }) => [
            styles.seeAllButton,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.seeAll
            }
          >
            See All
          </AppText>

          <AppIcon
            name="next"
            role="customer"
            size="xs"
            color={
              CustomerColors.primary
            }
          />
        </Pressable>
      </View>

      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading ? (
        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="small"
            color={
              CustomerColors.primary
            }
          />

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.loadingText
            }
          >
            Loading categories...
          </AppText>
        </View>
      ) : (
        /* ====================================================
           GRID
        ==================================================== */

        <View
          style={
            styles.grid
          }
        >
          {visibleCategories.map(
            (item) => (
              <Pressable
                key={item.id}
                onPress={() =>
                  handleCategoryPress(
                    item.id,
                  )
                }
                accessibilityRole="button"
                accessibilityLabel={`Open ${item.name} category`}
                style={({
                  pressed,
                }) => [
                  styles.card,

                  pressed
                    ? styles.cardPressed
                    : null,
                ]}
              >
                {/* ===========================================
                    DYNAMIC FIREBASE ICON

                    Preserve existing ServiceIcon.
                =========================================== */}

                <ServiceIcon
                  icon={
                    item.icon
                  }
                  color={
                    item.color
                  }
                  backgroundColor={
                    item.backgroundColor
                  }
                  size={28}
                  containerSize={56}
                  borderRadius={16}
                />

                <AppText
                  variant="caption"
                  weight="bold"
                  numberOfLines={2}
                  style={
                    styles.cardTitle
                  }
                >
                  {shortName(
                    item.name,
                  )}
                </AppText>
              </Pressable>
            ),
          )}
        </View>
      )}
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CONTAINER
    ======================================================== */

    container: {
      marginBottom:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      marginBottom:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems: "center",
    },

    title: {
      color:
        Colors.textPrimary,
    },

    seeAllButton: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xxs,

      borderRadius:
        FixxamTokens.radius.sm,
    },

    seeAll: {
      color:
        CustomerColors.primary,
    },

    /* ========================================================
       GRID
    ======================================================== */

    grid: {
      flexDirection: "row",

      flexWrap: "wrap",

      justifyContent:
        "space-between",
    },

    card: {
      width: "23%",

      minHeight: 112,

      marginBottom:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      alignItems: "center",

      justifyContent:
        "flex-start",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    cardPressed: {
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

    cardTitle: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 16,

      textAlign: "center",

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       LOADING
    ======================================================== */

    loadingContainer: {
      minHeight: 140,

      alignItems: "center",

      justifyContent:
        "center",
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       PRESS
    ======================================================== */

    pressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },
  });