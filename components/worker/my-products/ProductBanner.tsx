import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
} from "react-native";

type ProductBannerProps = {
  onPress?: () => void;
};

export default function ProductBanner({
  onPress,
}: ProductBannerProps) {
  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
      android_ripple={{ color: "rgba(255,255,255,0.15)" }}
    >
      <Image
        source={require("@/assets/images/banners/market-banner.png")}
        style={styles.banner}
        resizeMode="cover"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 2,

    borderRadius: 29,
    overflow: "hidden",

    backgroundColor: "#35F5F5",

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 100,
  },

  banner: {
    width: "100%",
    height: 170,
  },
});