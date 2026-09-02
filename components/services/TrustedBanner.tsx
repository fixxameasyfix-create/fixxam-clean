import React from "react";

import {
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

interface Props {
  onPress?: () => void;
}

export default function TrustedBanner({
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.container}
    >
      <Image
        source={require("@/assets/images/banner-worker.png")}
        style={styles.banner}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 24,
    overflow: "hidden",
  },

  banner: {
    width: "100%",
    height: 190,
    borderRadius: 24,
  },
});