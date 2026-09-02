import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { AppText } from "@/components/ui";
import { CustomerColors } from "@/theme/customerColors";

export type FinderAction =
  | "search"
  | "help"
  | "photo";

type Props = {
  onPress: (action: FinderAction) => void;
};

type ActionItem = {
  id: FinderAction;
  title: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

const ACTIONS: ActionItem[] = [
  {
    id: "search",
    title: "Search for a part",
    description:
      "Type the part name, model or problem.",
    icon: "magnify",
  },
  {
    id: "help",
    title: "Help me find it",
    description:
      "Don't know the part name? We'll guide you.",
    icon: "puzzle-outline",
  },
  {
    id: "photo",
    title: "Take a photo",
    description:
      "Show us the part you are looking for.",
    icon: "camera-outline",
  },
];

export default function SparePartFinderActions({
  onPress,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <AppText
          weight="bold"
          style={styles.title}
        >
          How would you like to find it?
        </AppText>

        <AppText style={styles.subtitle}>
          Choose the easiest option for you.
        </AppText>
      </View>

      <View style={styles.list}>
        {ACTIONS.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onPress(item.id)}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={item.title}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={item.icon}
                size={25}
                color={CustomerColors.primary}
              />
            </View>

            <View style={styles.content}>
              <AppText
                weight="bold"
                style={styles.cardTitle}
              >
                {item.title}
              </AppText>

              <AppText
                numberOfLines={2}
                style={styles.cardDescription}
              >
                {item.description}
              </AppText>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={CustomerColors.textSecondary}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 7,
    paddingHorizontal: 16,
  },

  heading: {
    marginBottom: 12,
  },

  title: {
    fontSize: 18,
    lineHeight: 23,
    color: CustomerColors.textPrimary,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 11.5,
    lineHeight: 17,
    color: CustomerColors.textSecondary,
  },

  list: {
    gap: 9,
  },

  card: {
    minHeight: 70,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 17,
    backgroundColor: CustomerColors.white,
    borderWidth: 1,
    borderColor: CustomerColors.border,
    flexDirection: "row",
    alignItems: "center",
  },

  cardPressed: {
    opacity: 0.78,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      `${CustomerColors.primary}0C`,
  },

  content: {
    flex: 1,
    marginLeft: 11,
    paddingRight: 8,
  },

  cardTitle: {
    fontSize: 13.5,
    lineHeight: 18,
    color: CustomerColors.textPrimary,
  },

  cardDescription: {
    marginTop: 2,
    fontSize: 10.5,
    lineHeight: 15,
    color: CustomerColors.textSecondary,
  },
});