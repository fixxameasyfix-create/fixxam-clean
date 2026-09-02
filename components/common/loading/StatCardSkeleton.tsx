import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import SkeletonBox from "./SkeletonBox";

export default function StatCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View>
          <SkeletonBox
            width={70}
            height={30}
            borderRadius={8}
          />

          <SkeletonBox
            width={90}
            height={14}
            borderRadius={6}
            style={styles.space}
          />
        </View>

        <SkeletonBox
          width={50}
          height={50}
          borderRadius={15}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,

    backgroundColor: "#FFFFFF",

    borderRadius: 20,

    padding: 18,
  },

  row: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  space: {
    marginTop: 10,
  },
});