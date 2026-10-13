import React, { memo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { AppText } from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

export type OrderCategory =
  | "service"
  | "market"
  | "shop";

type CategoryIcon =
  | "tools"
  | "store-outline"
  | "clipboard-text-outline";

type CategoryItem = {
  key: OrderCategory;
  label: string;
  icon: CategoryIcon;
};

const CATEGORIES: CategoryItem[] = [
  {
    key: "service",
    label: "Service",
    icon: "tools",
  },
  {
    key: "market",
    label: "Market",
    icon: "store-outline",
  },
  {
    key: "shop",
    label: "Shop",
    icon: "clipboard-text-outline",
  },
];

type Props = {
  selected: OrderCategory | null;
  onSelect: (category: OrderCategory) => void;
};

function OrdersCategoryTabs({
  selected,
  onSelect,
}: Props) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {CATEGORIES.map((category) => {
          const active =
            selected === category.key;

          return (
            <Pressable
              key={category.key}
              onPress={() =>
                onSelect(category.key)
              }
              accessibilityRole="tab"
              accessibilityLabel={`${category.label} orders`}
              accessibilityState={{
                selected: active,
              }}
              style={({ pressed }) => [
                styles.item,
                active && styles.itemActive,
                pressed && styles.pressed,
              ]}
            >
              <MaterialCommunityIcons
                name={category.icon}
                size={18}
                color={
                  active
                    ? Colors.textInverse
                    : CustomerColors.primary
                }
              />

              <AppText
                variant="caption"
                weight="semibold"
                style={[
                  styles.label,
                  active && styles.labelActive,
                ]}
              >
                {category.label}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default memo(OrdersCategoryTabs);

const styles = StyleSheet.create({
  container: {
    marginTop: FixxamTokens.spacing.md,
  },

  content: {
    gap: FixxamTokens.spacing.sm,
    paddingRight: FixxamTokens.spacing.lg,
  },

  item: {
    minHeight:
      FixxamTokens.size.minimumTouchTarget,

    paddingHorizontal:
      FixxamTokens.spacing.lg,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: FixxamTokens.spacing.xs,

    borderWidth: 1,
    borderColor: Colors.border,

    borderRadius:
      FixxamTokens.radius.chip,

    backgroundColor: Colors.surface,
  },

  itemActive: {
    borderColor: CustomerColors.primary,
    backgroundColor: CustomerColors.primary,
  },

  label: {
    color: Colors.textSecondary,
  },

  labelActive: {
    color: Colors.textInverse,
  },

  pressed: {
    opacity:
      FixxamTokens.motion.pressedOpacity,

    transform: [
      {
        scale:
          FixxamTokens.motion.scalePressed,
      },
    ],
  },
});