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

export default function HomeBanner() {
  return (
    <View style={styles.container}>

      <View style={styles.left}>

        <AppText
          weight="bold"
          style={styles.title}
        >
          Need a Professional?
        </AppText>

        <AppText
          style={styles.subtitle}
        >
  
          anytime, anywhere.
        </AppText>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.button}
        >
          <AppText
            weight="bold"
            style={styles.buttonText}
          >
            Book Now
          </AppText>

          <Ionicons
            name="arrow-forward"
            size={16}
            color="#FFFFFF"
          />
        </TouchableOpacity>

      </View>

      <View style={styles.iconBox}>
        <Ionicons
          name="construct"
          size={52}
          color="#FFFFFF"
        />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    backgroundColor: "#2563EB",

    borderRadius: 22,

    paddingHorizontal: 18,
    paddingVertical: 18,

    marginBottom: 20,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  left: {
    flex: 1,
    paddingRight: 12,
  },

  title: {
    fontSize: 20,
    color: "#FFFFFF",
  },

  subtitle: {
    marginTop: 6,

    fontSize: 13,
    lineHeight: 20,

    color: "#DBEAFE",
  },

  button: {
    marginTop: 14,

    alignSelf: "flex-start",

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#F97316",

    borderRadius: 14,

    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,

    marginRight: 6,
  },

  iconBox: {
    width: 78,
    height: 78,

    borderRadius: 20,

    backgroundColor: "rgba(255255,255,0.15)",

    justifyContent: "center",
    alignItems: "center",
  },

});