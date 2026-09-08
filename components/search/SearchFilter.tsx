import React, {
  memo,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

export type SearchFilterType =
  | "all"
  | "services"
  | "workers";

type Props = {
  value: SearchFilterType;

  onChange: (
    value: SearchFilterType,
  ) => void;
};

type FilterItem = {
  value: SearchFilterType;

  label: string;
};

/* ============================================================
   FILTERS
============================================================ */

const FILTERS: FilterItem[] = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "services",
    label: "Services",
  },
  {
    value: "workers",
    label: "Workers",
  },
];

/* ============================================================
   COMPONENT
============================================================ */

function SearchFilter({
  value,
  onChange,
}: Props) {
  return (
    <View
      style={
        styles.container
      }
    >
      <View
        accessibilityRole="tablist"
        style={
          styles.tabs
        }
      >
        {FILTERS.map(
          filter => {
            const active =
              value ===
              filter.value;

            return (
              <Pressable
                key={
                  filter.value
                }
                onPress={() => {
                  if (!active) {
                    onChange(
                      filter.value,
                    );
                  }
                }}
                accessibilityRole="tab"
                accessibilityLabel={`${filter.label} search results`}
                accessibilityState={{
                  selected:
                    active,
                }}
                style={({
                  pressed,
                }) => [
                  styles.button,

                  active
                    ? styles.activeButton
                    : null,

                  pressed
                    ? styles.pressed
                    : null,
                ]}
              >
                <AppText
                  variant="caption"
                  weight="bold"
                  numberOfLines={1}
                  style={[
                    styles.text,

                    active
                      ? styles.activeText
                      : null,
                  ]}
                >
                  {filter.label}
                </AppText>
              </Pressable>
            );
          },
        )}
      </View>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

const MemoizedSearchFilter =
  memo(
    SearchFilter,
  );

MemoizedSearchFilter.displayName =
  "SearchFilter";

export default MemoizedSearchFilter;

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.md,
    },

    tabs: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    button: {
      flex: 1,

      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        Colors.surface,
    },

    activeButton: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primary,
    },

    text: {
      textAlign:
        "center",

      color:
        Colors.textSecondary,
    },

    activeText: {
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