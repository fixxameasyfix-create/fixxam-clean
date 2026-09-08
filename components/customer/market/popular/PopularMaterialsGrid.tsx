import React, {
  memo,
  useCallback,
} from "react";

import {
  FlatList,
  StyleSheet,
  View,
  type ListRenderItem,
} from "react-native";

import {
  FixxamTokens,
} from "@/theme";

import PopularMaterialCard from "./PopularMaterialCard";

/* ==============================================================
   TYPES
============================================================== */

export type MarketProduct = {
  id: string;

  workerId: string;

  storeId?: string;

  name: string;

  price: number;

  thumbnail: string;

  rating?: number;

  sold?: number;
};

type Props = {
  products: MarketProduct[];

  onProductPress: (
    id: string,
  ) => void;

  onBuy: (
    product: MarketProduct,
  ) => void;
};

/* ==============================================================
   SEPARATOR
============================================================== */

function ItemSeparator() {
  return (
    <View
      style={
        styles.separator
      }
    />
  );
}

/* ==============================================================
   COMPONENT
============================================================== */

function PopularMaterialsGrid({
  products,
  onProductPress,
  onBuy,
}: Props) {
  const keyExtractor =
    useCallback(
      (
        item: MarketProduct,
      ) => item.id,
      [],
    );

  const renderItem =
    useCallback<
      ListRenderItem<MarketProduct>
    >(
      ({ item }) => (
        <PopularMaterialCard
          id={item.id}
          name={item.name}
          price={item.price}
          image={item.thumbnail}
          rating={item.rating}
          sold={item.sold}
          onPress={() =>
            onProductPress(
              item.id,
            )
          }
          onBuy={() =>
            onBuy(item)
          }
        />
      ),
      [
        onBuy,
        onProductPress,
      ],
    );

  return (
    <FlatList
      horizontal
      data={products}
      keyExtractor={
        keyExtractor
      }
      renderItem={
        renderItem
      }
      ItemSeparatorComponent={
        ItemSeparator
      }
      showsHorizontalScrollIndicator={
        false
      }
      contentContainerStyle={
        styles.list
      }
      keyboardShouldPersistTaps="handled"
      initialNumToRender={4}
      maxToRenderPerBatch={6}
      windowSize={5}
    />
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    list: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.sm,
    },

    separator: {
      width:
        FixxamTokens.spacing.md,
    },
  });

export default memo(
  PopularMaterialsGrid,
);