import React from "react";

import {
  FlatList,
  StyleSheet,
  View,
} from "react-native";

import PopularMaterialCard from "./PopularMaterialCard";

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
  onProductPress: (id: string) => void;
  onBuy: (product: MarketProduct) => void;
};

export default function PopularMaterialsGrid({
  products,
  onProductPress,
  onBuy,
}: Props) {
  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => (
        <View style={styles.separator} />
      )}
      renderItem={({ item }) => (
        <PopularMaterialCard
          id={item.id}
          name={item.name}
          price={item.price}
          image={item.thumbnail}
          rating={item.rating ?? 0}
          sold={item.sold ?? 0}
          onPress={() =>
            onProductPress(item.id)
          }
          onBuy={() => onBuy(item)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },

  separator: {
    width: 14,
  },
});