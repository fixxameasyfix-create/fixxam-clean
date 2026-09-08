import React, {
  memo,
  useCallback,
  useState,
} from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import type {
  AppIconName,
} from "@/components/ui/AppIcon";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type CategoryId =
  | "all"
  | "building"
  | "electrical"
  | "plumbing"
  | "painting"
  | "more";

type CategoryItem = {
  id: CategoryId;

  label: string;

  icon: AppIconName;
};

/* ============================================================
   CATEGORIES
============================================================ */

const CATEGORIES: readonly CategoryItem[] = [
  {
    id: "all",
    label: "All",
    icon: "grid",
  },
  {
    id: "building",
    label: "Building",
    icon: "service",
  },
  {
    id: "electrical",
    label: "Electrical",
    icon: "electrician",
  },
  {
    id: "plumbing",
    label: "Plumbing",
    icon: "plumbing",
  },
  {
    id: "painting",
    label: "Paint",
    icon: "painting",
  },
  {
    id: "more",
    label: "More",
    icon: "more",
  },
];

/* ============================================================
   COMPONENT
============================================================ */

function CategoryChips() {
  const [
    selected,
    setSelected,
  ] =
    useState<CategoryId>(
      "all",
    );

  /* ==========================================================
     SELECT
  ========================================================== */

  const handleSelect =
    useCallback(
      (
        id: CategoryId,
      ) => {
        setSelected(
          id,
        );
      },
      [],
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={
        false
      }
      contentContainerStyle={
        styles.container
      }
      keyboardShouldPersistTaps="handled"
    >
      {CATEGORIES.map(
        category => {
          const active =
            selected ===
            category.id;

          return (
            <Pressable
              key={
                category.id
              }
              onPress={() => {
                handleSelect(
                  category.id,
                );
              }}
              accessibilityRole="button"
              accessibilityLabel={`${category.label} category`}
              accessibilityState={{
                selected:
                  active,
              }}
              style={({
                pressed,
              }) => [
                styles.chip,

                active
                  ? styles.activeChip
                  : null,

                pressed
                  ? styles.pressed
                  : null,
              ]}
            >
              <AppIcon
                name={
                  category.icon
                }
                role="worker"
                size="sm"
                color={
                  active
                    ? Colors.textInverse
                    : WorkerColors.primary
                }
              />

              <AppText
                variant="caption"
                weight="bold"
                numberOfLines={1}
                style={[
                  styles.label,

                  active
                    ? styles.activeLabel
                    : null,
                ]}
              >
                {category.label}
              </AppText>
            </Pressable>
          );
        },
      )}
    </ScrollView>
  );
}

/* ============================================================
   MEMO
============================================================ */

const MemoizedCategoryChips =
  memo(
    CategoryChips,
  );

MemoizedCategoryChips.displayName =
  "CategoryChips";

export default MemoizedCategoryChips;

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      paddingBottom:
        FixxamTokens.spacing.md,

      gap:
        FixxamTokens.spacing.sm,
    },

    chip: {
      width: 68,

      minHeight: 64,

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      paddingVertical:
        FixxamTokens.spacing.sm,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    activeChip: {
      borderColor:
        WorkerColors.primary,

      backgroundColor:
        WorkerColors.primary,
    },

    label: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xs,

      textAlign:
        "center",

      color:
        Colors.textSecondary,
    },

    activeLabel: {
      color:
        Colors.textInverse,
    },

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