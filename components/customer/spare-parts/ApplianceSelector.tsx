import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { AppText } from "@/components/ui";
import { CustomerColors } from "@/theme/customerColors";

export type Appliance = {
  id: string;
  label: string;
  subtitle: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

type Props = {
  appliances: Appliance[];
  selectedId?: string | null;
  onSelect: (appliance: Appliance) => void;
};

export default function ApplianceSelector({
  appliances,
  selectedId,
  onSelect,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <AppText
          weight="bold"
          style={styles.title}
        >
          What are you fixing?
        </AppText>

        <AppText style={styles.subtitle}>
          Choose your appliance or equipment.
        </AppText>
      </View>

      <View style={styles.grid}>
        {appliances.map((item) => {
          const selected =
            selectedId === item.id;

          return (
            <Pressable
              key={item.id}
              onPress={() => onSelect(item)}
              style={({ pressed }) => [
                styles.card,
                selected &&
                  styles.cardSelected,
                pressed &&
                  styles.cardPressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{
                selected,
              }}
              accessibilityLabel={`Select ${item.label}`}
            >
              <View
                style={[
                  styles.iconContainer,
                  selected &&
                    styles.iconContainerSelected,
                ]}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={23}
                  color={
                    selected
                      ? CustomerColors.white
                      : CustomerColors.primary
                  }
                />
              </View>

              <AppText
                weight={
                  selected
                    ? "bold"
                    : undefined
                }
                numberOfLines={1}
                style={[
                  styles.label,
                  selected &&
                    styles.labelSelected,
                ]}
              >
                {item.label}
              </AppText>

              <AppText
                numberOfLines={1}
                style={styles.subtitle}
              >
                {item.subtitle}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 23,
    paddingHorizontal: 16,
  },

  heading: {
    marginBottom: 11,
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

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  card: {
    width: "31.8%",
    minHeight: 91,
    paddingHorizontal: 6,
    paddingVertical: 9,
    borderRadius: 16,
    backgroundColor: CustomerColors.white,
    borderWidth: 1,
    borderColor: CustomerColors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  cardSelected: {
    backgroundColor:
      `${CustomerColors.primary}0A`,
    borderColor:
      CustomerColors.primary,
  },

  cardPressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      `${CustomerColors.primary}0B`,
  },

  iconContainerSelected: {
    backgroundColor:
      CustomerColors.primary,
  },

  label: {
    marginTop: 7,
    fontSize: 11.5,
    lineHeight: 15,
    textAlign: "center",
    color: CustomerColors.textPrimary,
  },

  labelSelected: {
    color: CustomerColors.primary,
  },
});