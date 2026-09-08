import React, {
  memo,
  useCallback,
} from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import type {
  WorkerFilterType,
  WorkerOrderCounts,
} from "@/types/workerOrders";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  selectedFilter: WorkerFilterType;

  counts: WorkerOrderCounts;

  totalJobs: number;

  onChange: (
    filter: WorkerFilterType,
  ) => void;
};

type FilterItem = {
  key: WorkerFilterType;

  label: string;
};

/* ==============================================================
   FILTERS
============================================================== */

const FILTERS: readonly FilterItem[] = [
  {
    key: "all",
    label: "All",
  },
  {
    key: "pending",
    label: "New Requests",
  },
  {
    key: "active",
    label: "Active",
  },
  {
    key: "completed",
    label: "Done",
  },
  {
    key: "cancelled",
    label: "Cancelled",
  },
];

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerOrdersFilters({
  selectedFilter,
  counts,
  totalJobs,
  onChange,
}: Props) {
  const handleChange =
    useCallback(
      (
        filter: WorkerFilterType,
      ) => {
        if (
          selectedFilter ===
          filter
        ) {
          return;
        }

        onChange(
          filter,
        );
      },
      [
        onChange,
        selectedFilter,
      ],
    );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={
        false
      }
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={
        styles.container
      }
    >
      {FILTERS.map(
        filter => {
          const active =
            selectedFilter ===
            filter.key;

          const count =
            getFilterCount(
              filter.key,
              counts,
              totalJobs,
            );

          return (
            <Pressable
              key={
                filter.key
              }
              onPress={() => {
                handleChange(
                  filter.key,
                );
              }}
              accessibilityRole="tab"
              accessibilityLabel={`${filter.label}, ${count}`}
              accessibilityState={{
                selected:
                  active,
              }}
              style={({
                pressed,
              }) => [
                styles.button,

                active
                  ? styles.buttonActive
                  : null,

                pressed
                  ? styles.pressed
                  : null,
              ]}
            >
              <AppText
                variant="caption"
                weight={
                  active
                    ? "bold"
                    : "regular"
                }
                numberOfLines={1}
                style={[
                  styles.text,

                  active
                    ? styles.textActive
                    : null,
                ]}
              >
                {filter.label}
              </AppText>

              <View
                style={[
                  styles.count,

                  active
                    ? styles.countActive
                    : null,
                ]}
              >
                <AppText
                  variant="caption"
                  weight="bold"
                  style={[
                    styles.countText,

                    active
                      ? styles.countTextActive
                      : null,
                  ]}
                >
                  {count}
                </AppText>
              </View>
            </Pressable>
          );
        },
      )}
    </ScrollView>
  );
}

/* ==============================================================
   COUNT
============================================================== */

function getFilterCount(
  filter: WorkerFilterType,
  counts: WorkerOrderCounts,
  totalJobs: number,
): number {
  switch (filter) {
    case "pending":
      return counts.pending;

    case "active":
      return counts.active;

    case "completed":
      return counts.completed;

    case "cancelled":
      return counts.cancelled;

    case "all":
    default:
      return totalJobs;
  }
}

/* ==============================================================
   MEMO
============================================================== */

WorkerOrdersFilters.displayName =
  "WorkerOrdersFilters";

export default memo(
  WorkerOrdersFilters,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      paddingTop:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.md,

      gap:
        FixxamTokens.spacing.sm,
    },

    /* ==========================================================
       FILTER
    ========================================================== */

    button: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    buttonActive: {
      borderColor:
        WorkerColors.primary,

      backgroundColor:
        WorkerColors.primary,
    },

    text: {
      color:
        Colors.textSecondary,
    },

    textActive: {
      color:
        Colors.textInverse,
    },

    /* ==========================================================
       COUNT
    ========================================================== */

    count: {
      minWidth: 24,

      minHeight: 24,

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    countActive: {
      backgroundColor:
        Colors.surface,
    },

    countText: {
      color:
        Colors.textSecondary,
    },

    countTextActive: {
      color:
        WorkerColors.primary,
    },

    /* ==========================================================
       STATE
    ========================================================== */

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