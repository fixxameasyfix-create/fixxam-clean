import React, {
  memo,
  useCallback,
  useState,
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
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

const TABS = [
  "Products",
  "Orders",
  "Reviews",
] as const;

type ProductTab =
  (typeof TABS)[number];

/* ============================================================
   COMPONENT
============================================================ */

function ProductTabs() {
  const [
    active,
    setActive,
  ] =
    useState<ProductTab>(
      "Products",
    );

  /* ==========================================================
     SELECT TAB
  ========================================================== */

  const handleSelect =
    useCallback(
      (
        tab: ProductTab,
      ) => {
        setActive(
          tab,
        );
      },
      [],
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
      {TABS.map(
        tab => {
          const selected =
            active === tab;

          return (
            <Pressable
              key={
                tab
              }
              onPress={() => {
                handleSelect(
                  tab,
                );
              }}
              accessibilityRole="tab"
              accessibilityLabel={`${tab} tab`}
              accessibilityState={{
                selected,
              }}
              style={({
                pressed,
              }) => [
                styles.tab,

                selected
                  ? styles.activeTab
                  : null,

                pressed
                  ? styles.pressed
                  : null,
              ]}
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
                center
                style={[
                  styles.text,

                  selected
                    ? styles.activeText
                    : null,
                ]}
              >
                {tab}
              </AppText>

              <View
                style={[
                  styles.indicator,

                  selected
                    ? styles.activeIndicator
                    : null,
                ]}
              />
            </Pressable>
          );
        },
      )}
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

const MemoizedProductTabs =
  memo(
    ProductTabs,
  );

MemoizedProductTabs.displayName =
  "ProductTabs";

export default MemoizedProductTabs;

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.xl,

      padding:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    tab: {
      flex: 1,

      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,
    },

    activeTab: {
      backgroundColor:
        WorkerColors.primarySoft,
    },

    text: {
      color:
        Colors.textSecondary,
    },

    activeText: {
      color:
        WorkerColors.primary,
    },

    indicator: {
      width: 28,

      height: 3,

      marginTop:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        "transparent",
    },

    activeIndicator: {
      backgroundColor:
        WorkerColors.primary,
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