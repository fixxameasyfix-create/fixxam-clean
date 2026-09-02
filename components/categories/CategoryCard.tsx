import React from "react";
import {
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { AppText } from "@/components/ui";

type Props = {
  icon: string;
  iconColor: string;
  backgroundColor: string;
  title: string;
  onPress: () => void;
};

export default function CategoryCard({
  icon,
  iconColor,
  backgroundColor,
  title,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.card}
      onPress={onPress}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={22}
          color={iconColor}
        />
      </View>

      <View style={styles.content}>
        <AppText
          weight="bold"
          style={styles.title}
          numberOfLines={1}
        >
          {title}
        </AppText>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#94A3B8"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",

    height: 64,

    backgroundColor: "#FFFFFF",

    borderRadius: 14,

    paddingHorizontal: 14,

    marginBottom: 8,

    borderWidth: 1,
    borderColor: "#EEF2F7",

    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  iconContainer: {
    width: 40,
    height: 40,

    borderRadius: 12,

    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    fontSize: 15,
    color: "#0F172A",
  },
});