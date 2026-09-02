import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { useRouter } from "expo-router";

import { AppText } from "@/components/ui";
import AppIcon from "@/components/common/AppIcon";

import { getCategories } from "@/firebase/queries/categories";

type Category = {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  backgroundColor?: string;
};

export default function HomeCategories() {
  const router = useRouter();

  const [categories, setCategories] =
    useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const snapshot = await getCategories();

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Category, "id">),
      }));

      setCategories(data);
    } catch (error) {
      console.log(error);
    }
  }

   function shortName(name: string) {
  switch (name) {
    case "Home Services":
      return "Home";

    case "Construction & Building":
      return "Building";

    case "Electrical & Energy":
      return "Electrical";

    case "Security Services":
      return "Security";

    case "Automotive Services":
      return "Automotiv";

    case "Technology Services":
      return "Technolog";

    case "Beauty & Personal Care":
      return "Beauty";

    case "Fashion & Tailoring":
      return "Fashion";

    case "Events & Entertainment":
      return "Events";

    case "Business & Professional Services":
      return "Business";

    case "Healthcare Services":
      return "Healthcare";

    case "Agriculture & Farming":
      return "Agriculture";

    case "Food & Hospitality":
      return "Food";

    case "Logistics & Transportation":
      return "Logistics";

    case "Education & Training":
      return "Education";

    default:
      return name;
  }
}

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText
          weight="bold"
          style={styles.title}
        >
          Categories
        </AppText>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            router.push(
              "/(customer)/details/categories"
            )
          }
        >
          <AppText style={styles.seeAll}>
            See All
          </AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {categories.slice(0, 8).map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.8}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname:
                  "/(customer)/details/categories/[id]",
                params: {
                  id: item.id,
                },
              } as const)
            }
          >
            <AppIcon
              icon={item.icon}
              color={item.color}
              backgroundColor={
                item.backgroundColor
              }
              size={28}
              containerSize={56}
              borderRadius={16}
            />

            <AppText
              weight="bold"
              numberOfLines={4}
              style={styles.cardTitle}
            >
              {shortName(item.name)}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 20,
    color: "#0F172A",
  },

  seeAll: {
    fontSize: 15,
    color: "#2563EB",
    fontWeight: "700",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "21%",

    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    alignItems: "center",
    justifyContent: "center",

    paddingVertical: 12,
    paddingHorizontal: 6,

    marginBottom: 14,

    borderWidth: 1,
    borderColor: "#F1F5F9",

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  cardTitle: {
    marginTop: 8,

    fontSize: 12,

    lineHeight: 15,

    textAlign: "center",

    color: "#0F172A",
  },
});