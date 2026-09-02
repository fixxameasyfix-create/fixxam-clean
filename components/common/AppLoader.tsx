import React from "react";
import {
  View,
  StyleSheet,
} from "react-native";

import LottieView from "lottie-react-native";

import { AppText } from "@/components/ui";

type Props = {
  message?: string;
  size?: number;
};

export default function AppLoader({
  message = "Please wait...",
  size = 180,
}: Props) {
  return (
    <View style={styles.container}>
      <LottieView
        source={require("@/assets/animations/loading.json")}
        autoPlay
        loop
        style={{
          width: size,
          height: size,
        }}
      />

      <AppText
        weight="semibold"
        style={styles.message}
      >
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    backgroundColor: "#FFFFFF",
  },

  message: {
    marginTop: -10,

    fontSize: 16,

    color: "#64748B",

    textAlign: "center",
  },
});