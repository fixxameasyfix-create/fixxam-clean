import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import SkeletonBox from "./SkeletonBox";

export default function JobCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <SkeletonBox
          width={54}
          height={54}
          borderRadius={18}
        />

        <View style={styles.content}>
          <SkeletonBox
            width="70%"
            height={18}
          />

          <SkeletonBox
            width="50%"
            height={14}
            style={styles.space}
          />

          <SkeletonBox
            width={90}
            height={14}
            style={styles.space}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",

    borderRadius: 22,

    padding: 18,

    marginTop: 16,
  },

  row: {
    flexDirection: "row",
  },

  content: {
    flex: 1,
    marginLeft: 14,
  },

  space: {
    marginTop: 10,
  },
});