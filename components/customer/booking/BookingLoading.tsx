import React from "react";

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import { AppText } from "@/components/ui";

type Props = {
  visible: boolean;
  message?: string;
};

export default function BookingLoading({
  visible,
  message = "Preparing your booking...",
}: Props) {

  if (!visible) {
    return null;
  }

  return (

    <View style={styles.overlay}>

      <View style={styles.card}>

        <ActivityIndicator
          size="large"
          color="#FF6B00"
        />

        <AppText
          weight="bold"
          style={styles.title}
        >
          Please wait...
        </AppText>

        <AppText
          style={styles.message}
        >
          {message}
        </AppText>

      </View>

    </View>

  );

}

const styles = StyleSheet.create({

  overlay: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor: "rgba(15,23,42,0.25)",

    justifyContent: "center",

    alignItems: "center",

    zIndex: 999,
  },

  card: {

    width: "82%",

    backgroundColor: "#FFFFFF",

    borderRadius: 28,

    paddingVertical: 28,

    paddingHorizontal: 22,

    alignItems: "center",

    elevation: 12,

    shadowColor: "#000",

    shadowOpacity: 0.08,

    shadowRadius: 16,

    shadowOffset: {
      width: 0,
      height: 4,
    },

  },

  title: {

    marginTop: 18,

    fontSize: 18,

    color: "#111827",

  },

  message: {

    marginTop: 8,

    textAlign: "center",

    color: "#64748B",

    lineHeight: 22,

  },

});