import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  title: string;

  subtitle?: string;

  showBackButton?: boolean;

  onBackPress?: () => void;

  rightComponent?: React.ReactNode;
};

export default function AppHeader({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  rightComponent,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBackButton && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.backButton}
            onPress={onBackPress}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#0F172A"
            />
          </TouchableOpacity>
        )}

        <View style={styles.textContainer}>
          <AppText
            weight="bold"
            style={styles.title}
          >
            {title}
          </AppText>

          {subtitle ? (
            <AppText style={styles.subtitle}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
      </View>

      {rightComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 72,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    paddingHorizontal: 16,

    backgroundColor: "#FFFFFF",
  },

  left: {
    flexDirection: "row",

    alignItems: "center",

    flex: 1,
  },

  backButton: {
    width: 44,
    height: 44,

    borderRadius: 14,

    backgroundColor: "#F8FAFC",

    justifyContent: "center",

    alignItems: "center",

    marginRight: 14,
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontSize: 22,
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: "#64748B",
  },
});