import React, {
  memo,
  useCallback,
} from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
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

  onChange: (
    filter: WorkerFilterType,
  ) => void;

  /**
   * Temporary compatibility with the current parent screen.
   * Counts are already displayed in WorkerOrdersOverview.
   */
  counts?: WorkerOrderCounts;

  /**
   * Temporary compatibility with the current parent screen.
   */
  totalJobs?: number;
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
    label: "New",
  },
  {
    key: "active",
    label: "Active",
  },
  {
    key: "completed",
    label: "Completed",
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

        onChange(filter);
      },
      [
        onChange,
        selectedFilter,
      ],
    );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.container}
    >
      {FILTERS.map(
        filter => {
          const active =
            selectedFilter ===
            filter.key;

          return (
            <Pressable
              key={filter.key}
              onPress={() =>
                handleChange(
                  filter.key,
                )
              }
              accessibilityRole="tab"
              accessibilityLabel={
                filter.label
              }
              accessibilityState={{
                selected: active,
              }}
              style={({
                pressed,
              }) => [
                styles.button,

                active &&
                  styles.buttonActive,

                pressed &&
                  styles.pressed,
              ]}
            >
              <AppText
                variant="body"
                weight={
                  active
                    ? "semibold"
                    : "regular"
                }
                numberOfLines={1}
                style={[
                  styles.text,

                  active &&
                    styles.textActive,
                ]}
              >
                {filter.label}
              </AppText>
            </Pressable>
          );
        },
      )}
    </ScrollView>
  );
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
      paddingVertical:
        FixxamTokens.spacing.md,

      paddingRight:
        FixxamTokens.spacing.md,

      gap:
        FixxamTokens.spacing.sm,
    },

    button: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      alignItems: "center",

      justifyContent: "center",

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