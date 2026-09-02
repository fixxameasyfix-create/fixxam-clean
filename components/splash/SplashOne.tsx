import React, {
  useEffect,
} from "react";

import {
  SafeAreaView,
  Text,
  View,
} from "react-native";

import {
  router,
  useRootNavigationState,
} from "expo-router";

import CircularRing from "./CircularRing";


export default function SplashOne() {

  const navigationState =
    useRootNavigationState();


  useEffect(() => {

    if (!navigationState?.key) {
      return;
    }


    const timer = setTimeout(() => {

      router.replace("/splash-two");

    }, 1000);


    return () =>
      clearTimeout(timer);


  }, [
    navigationState,
  ]);


  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#0057FF",
      }}
    >

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularRing number="1" />
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