import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

export default function LimitedOffer() {
  return (
    <View style={styles.container}>

      <View style={styles.iconBox}>

        <Ionicons
          name="gift-outline"
          size={42}
          color="#FFFFFF"
        />

      </View>

      <View style={styles.content}>

        <AppText
          weight="bold"
          style={styles.title}
        >
          Invite Friends
        </AppText>

        <AppText
          style={styles.subtitle}
        >
          Invite your friends to Fixxam and unlock exclusive offers.
        </AppText>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.button}
        >

          <AppText
            weight="bold"
            style={styles.buttonText}
          >
            Invite Now
          </AppText>

        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    backgroundColor: "#2563EB",
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },

  iconBox: {
    width: 74,
    height: 74,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  content: {
    flex: 1,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 18,
  },

  subtitle: {
    color: "#DBEAFE",
    marginTop: 6,
    lineHeight: 20,
  },

  button: {
    marginTop: 14,
    alignSelf: "flex-start",
    backgroundColor: "#F97316",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
  },

  buttonText: {
    color: "#FFFFFF",
  },

});