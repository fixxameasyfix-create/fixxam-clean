import React from "react";
import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  onPress: () => void;
  badge?: string;
};

export default function DashboardCard({
  title,
  description,
  icon,
  iconColor,
  iconBackground,
  onPress,
  badge,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.card}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor:
              iconBackground,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={28}
          color={iconColor}
        />
      </View>

     {badge && (
  <View style={styles.badge}>
    <AppText style={styles.badgeText}>
      {badge}
    </AppText>
  </View>
)}

      <AppText
        weight="bold"
        style={styles.title}
      >
        {title}
      </AppText>

      <AppText style={styles.description}>
        {description}
      </AppText>

      <View style={styles.arrow}>
        <Ionicons
          name="chevron-forward"
          size={24}
          color="#2563EB"
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 190,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 4,
  },

  iconContainer: {
    width: 62,
    height: 62,
    borderRadius: 18,

    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    marginTop: 18,
    fontSize: 24,
    color: "#0F172A",
  },

  description: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
  },

  arrow: {
    position: "absolute",
    right: 20,
    bottom: 20,
  },

  badge: {
  position: "absolute",
  top: 16,
  left: 60,

  backgroundColor: "#EF4444",

  borderRadius: 20,

  paddingHorizontal: 8,
  paddingVertical: 3,
},

badgeText: {
  color: "#FFFFFF",
  fontSize: 11,
  fontWeight: "700",
},

});