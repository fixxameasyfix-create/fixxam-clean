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
  AppIcon,
  AppText,
} from "@/components/ui";

import type {
  AppIconName,
} from "@/components/ui/AppIcon";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Category = {
  id: string;

  title: string;

  icon: AppIconName;
};

type Props = {
  selected: string;

  onSelect: (
    id: string,
  ) => void;
};

/* ==============================================================
   CATEGORIES
============================================================== */

const categories: Category[] = [
  {
    id: "all",
    title: "All",
    icon: "service",
  },
  {
    id: "building",
    title: "Building",
    icon: "professional",
  },
  {
    id: "electrical",
    title: "Electrical",
    icon: "electrician",
  },
  {
    id: "plumbing",
    title: "Plumbing",
    icon: "plumbing",
  },
  {
    id: "paint",
    title: "Paint",
    icon: "painting",
  },
  {
    id: "more",
    title: "More",
    icon: "more",
  },
];

/* ==============================================================
   COMPONENT
============================================================== */

function CategoryTabs({
  selected,
  onSelect,
}: Props) {
  const handleSelect =
    useCallback(
      (
        id: string,
      ) => {
        onSelect(id);
      },
      [onSelect],
    );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={
        false
      }
      contentContainerStyle={
        styles.container
      }
    >
      {categories.map(
        (item) => {
          const active =
            selected ===
            item.id;

          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`Show ${item.title} products`}
              accessibilityState={{
                selected: active,
              }}
              onPress={() =>
                handleSelect(
                  item.id,
                )
              }
              style={({
                pressed,
              }) => [
                styles.item,

                pressed
                  ? styles.pressed
                  : null,
              ]}
            >
              <View
                style={[
                  styles.iconBox,

                  active
                    ? styles.activeIconBox
                    : null,
                ]}
              >
                <AppIcon
                  name={item.icon}
                  role="customer"
                  size="sm"
                  color={
                    active
                      ? Colors.textInverse
                      : CustomerColors.primary
                  }
                />
              </View>

              <AppText
                variant="caption"
                weight={
                  active
                    ? "bold"
                    : undefined
                }
                numberOfLines={1}
                style={[
                  styles.title,

                  active
                    ? styles.activeTitle
                    : null,
                ]}
              >
                {item.title}
              </AppText>
            </Pressable>
          );
        },
      )}
    </ScrollView>
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

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.md,
    },

    item: {
      width: 64,

      minHeight:
        FixxamTokens.size
          .cardMinHeight,

      alignItems:
        "center",
    },

    iconBox: {
      width:
        FixxamTokens.size
          .iconBox,

      height:
        FixxamTokens.size
          .iconBox,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    activeIconBox: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primary,
    },

    title: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xs,

      textAlign:
        "center",

      color:
        Colors.textSecondary,
    },

    activeTitle: {
      color:
        CustomerColors.primary,
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

export default memo(
  CategoryTabs,
);