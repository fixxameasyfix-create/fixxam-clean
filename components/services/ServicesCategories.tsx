import React from "react";

import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppText,
} from "@/components/ui";

import type {
  ServiceCategory,
} from "@/firebase/queries/services/listenCategories";

interface Props {
  categories: ServiceCategory[];
  selected: string;
  onSelect: (
    id: string,
  ) => void;
}

export default function ServicesCategories({
  categories,
  selected,
  onSelect,
}: Props) {
  return (
    <FlatList
      horizontal
      data={categories}
      keyExtractor={(
        item,
      ) => item.id}
      showsHorizontalScrollIndicator={
        false
      }
      contentContainerStyle={
        styles.list
      }
      renderItem={({
        item,
      }) => {
        const active =
          item.id === selected;

        return (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              onSelect(
                item.id,
              )
            }
            style={[
              styles.chip,
              active &&
                styles.activeChip,
            ]}
          >
            <MaterialCommunityIcons
              name={
                (item.icon ||
                  "apps") as any
              }
              size={17}
              color={
                active
                  ? "#FFFFFF"
                  : "#2563EB"
              }
            />

            <AppText
              weight="bold"
              style={[
                styles.label,
                active &&
                  styles.activeLabel,
              ]}
            >
              {item.name}
            </AppText>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles =
  StyleSheet.create({
    list: {
      paddingRight: 12,
    },

    chip: {
      height: 42,
      paddingHorizontal: 15,
      marginRight: 8,

      flexDirection:
        "row",
      alignItems: "center",
      justifyContent:
        "center",

      borderRadius: 21,

      backgroundColor:
        "#FFFFFF",

      borderWidth: 1,
      borderColor:
        "#E2E8F0",

      shadowColor:
        "#0F172A",
      shadowOpacity:
        0.04,
      shadowRadius: 6,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      elevation: 2,
    },

    activeChip: {
      backgroundColor:
        "#2563EB",
      borderColor:
        "#2563EB",
    },

    label: {
      marginLeft: 6,
      fontSize: 13,
      color: "#0F172A",
    },

    activeLabel: {
      color: "#FFFFFF",
    },
  });