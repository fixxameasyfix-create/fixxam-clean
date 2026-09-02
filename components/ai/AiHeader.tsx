import React from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import {
  CustomerColors,
  FixxamTokens,
} from "@/theme";

interface Props {
  onMenuPress?: () => void;
}

export default function AiHeader({
  onMenuPress,
}: Props) {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <View style={styles.container}>
        {/* Back */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.sideButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={CustomerColors.textPrimary}
          />
        </TouchableOpacity>

        {/* Center */}
        <View style={styles.center}>
          <Text
            numberOfLines={1}
            style={styles.title}
          >
            Fixxam Smarter
          </Text>

          <Text
            numberOfLines={1}
            style={styles.subtitle}
          >
            Smart Repair Assistant
          </Text>
        </View>

        {/* Menu */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.sideButton}
          onPress={onMenuPress}
        >
          <Ionicons
            name="menu"
            size={28}
            color={CustomerColors.textPrimary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#FFFFFF",

    paddingTop:
      Platform.OS === "android"
        ? StatusBar.currentHeight
        : 50,

    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 4,
  },

  container: {
    height: 68,

    paddingHorizontal:
      FixxamTokens.spacing.md,

    flexDirection: "row",

    alignItems: "center",
  },

  sideButton: {
    width: 42,

    height: 42,

    borderRadius: 21,

    justifyContent: "center",

    alignItems: "center",
  },

  center: {
    flex: 1,

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: 10,
  },

  title: {
    fontSize: 21,

    fontWeight: "800",

    color:
      CustomerColors.textPrimary,

    letterSpacing: 0.2,
  },

  subtitle: {
    marginTop: 2,

    fontSize: 13,

    color:
      CustomerColors.textSecondary,
  },
});