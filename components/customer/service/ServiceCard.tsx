import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { AppText } from "@/components/ui";

export type ServiceCardData = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  backgroundColor: string;
};

type Props = {
  service: ServiceCardData;
  onPress: () => void;
};

export default function ServiceCard({
  service,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`View materials for ${service.name}`}
    >
      {/* ICON */}

      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor:
              service.backgroundColor,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={
            service.icon as keyof typeof MaterialCommunityIcons.glyphMap
          }
          size={24}
          color={service.color}
        />
      </View>

      {/* TEXT */}

      <View style={styles.content}>
        <AppText
          weight="bold"
          style={styles.name}
          numberOfLines={1}
        >
          {service.name}
        </AppText>

        {!!service.description && (
          <AppText
            style={styles.description}
            numberOfLines={1}
          >
            {service.description}
          </AppText>
        )}
      </View>

      {/* ARROW */}

      <View style={styles.arrowContainer}>
        <Ionicons
          name="chevron-forward"
          size={21}
          color="#94A3B8"
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",

    width: "100%",

    minHeight: 82,

    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    paddingHorizontal: 14,
    paddingVertical: 10,

    marginBottom: 12,

    borderWidth: 1,
    borderColor: "#E5E7EB",

    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  pressed: {
    opacity: 0.92,

    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  iconContainer: {
    width: 48,
    height: 48,

    borderRadius: 14,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 14,

    flexShrink: 0,
  },

  content: {
    flex: 1,
    minWidth: 0,

    justifyContent: "center",
  },

  name: {
    fontSize: 15,
    lineHeight: 20,

    color: "#111827",
  },

  description: {
    marginTop: 2,

    fontSize: 11,
    lineHeight: 16,

    color: "#64748B",
  },

  arrowContainer: {
    width: 30,
    height: 30,

    alignItems: "center",
    justifyContent: "center",

    marginLeft: 8,
  },
})