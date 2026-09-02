import React, { useEffect } from "react";
import {
  SafeAreaView,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import CircularRing from "./CircularRing";

export default function SplashTwo() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/splash-three");
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#FF7A00",
      }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularRing number="2" />
      </View>

      <View
        style={{
          paddingBottom: 60,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 22,
            fontWeight: "500",
          }}
        >
          Quick - Reliable - Trust.
        </Text>
      </View>
    </SafeAreaView>
  );
}