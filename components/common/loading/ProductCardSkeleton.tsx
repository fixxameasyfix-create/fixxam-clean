import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import SkeletonBox from "./SkeletonBox";

export default function ProductCardSkeleton() {
  return (
    <View style={styles.card}>
      <SkeletonBox
        height={110}
        borderRadius={16}
      />

      <SkeletonBox
        height={16}
        width="80%"
        style={styles.title}
      />

      <SkeletonBox
        height={16}
        width={70}
        style={styles.price}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 150,

    backgroundColor: "#FFFFFF",

    borderRadius: 20,

    padding: 12,

    marginRight: 14,
  },

  title: {
    marginTop: 12,
  },

  price: {
    marginTop: 10,
  },
});