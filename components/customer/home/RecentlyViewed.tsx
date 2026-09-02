import React from "react";
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppCard,
  AppText,
} from "@/components/ui";

const recentlyViewed = [
  {
    id: "1",
    name: "John Musa",
    service: "Electrician",
    rating: "4.9",
    image: "https://i.pravatar.cc/150?img=41",
  },
  {
    id: "2",
    name: "Aliyu Ibrahim",
    service: "Plumber",
    rating: "4.8",
    image: "https://i.pravatar.cc/150?img=42",
  },
  {
    id: "3",
    name: "David Peter",
    service: "Cleaner",
    rating: "5.0",
    image: "https://i.pravatar.cc/150?img=43",
  },
];

export default function RecentlyViewed() {
  return (
    <View style={styles.container}>

      <View style={styles.header}>

        <AppText
          weight="bold"
          style={styles.title}
        >
          Recently Viewed
        </AppText>

        <TouchableOpacity>
          <AppText style={styles.seeAll}>
            See All
          </AppText>
        </TouchableOpacity>

      </View>

      <FlatList
        horizontal
        data={recentlyViewed}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingRight: 12,
        }}
        renderItem={({ item }) => (
          <AppCard style={styles.card}>

            <Image
              source={{
                uri: item.image,
              }}
              style={styles.image}
            />

            <AppText
              weight="bold"
              numberOfLines={1}
              style={styles.name}
            >
              {item.name}
            </AppText>

            <AppText
              numberOfLines={1}
              style={styles.service}
            >
              {item.service}
            </AppText>

            <View style={styles.ratingRow}>

              <Ionicons
                name="star"
                size={13}
                color="#F59E0B"
              />

              <AppText style={styles.rating}>
                {item.rating}
              </AppText>

            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.button}
            >
              <Ionicons
                name="refresh-outline"
                size={15}
                color="#FFFFFF"
              />

              <AppText
                weight="bold"
                style={styles.buttonText}
              >
                View Again
              </AppText>

            </TouchableOpacity>

          </AppCard>
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    marginBottom: 22,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  title: {
    fontSize: 18,
    color: "#111827",
  },

  seeAll: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },

  card: {
    width: 170,

    marginRight: 14,

    padding: 14,

    alignItems: "center",

    borderRadius: 20,
  },

  image: {
    width: 62,
    height: 62,

    borderRadius: 31,
  },

  name: {
    marginTop: 10,

    fontSize: 15,

    color: "#111827",
  },

  service: {
    marginTop: 2,

    fontSize: 12,

    color: "#64748B",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 8,
  },

  rating: {
    marginLeft: 4,

    fontSize: 12,
  },

  button: {
    marginTop: 12,

    width: "100%",

    height: 38,

    borderRadius: 12,

    backgroundColor: "#2563EB",

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    marginLeft: 5,

    color: "#FFFFFF",

    fontSize: 13,
  },

});