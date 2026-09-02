import React from "react";

import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  id: string;
  name: string;
  price: number;
  image?: string;
  rating?: number;
  sold?: number;
  onPress: () => void;
  onBuy: () => void;
};

export default function PopularMaterialCard({
  name,
  price,
  image,
  rating = 0,
  sold = 0,
  onPress,
  onBuy,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`View ${name}`}
    >
      {/* IMAGE */}
      <View style={styles.imageContainer}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons
              name="cube-outline"
              size={32}
              color="#CBD5E1"
            />
          </View>
        )}

        {/* FAVORITE */}
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
          }}
          style={styles.favoriteButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Favorite ${name}`}
        >
          <Ionicons
            name="heart-outline"
            size={21}
            color="#64748B"
          />
        </Pressable>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        <AppText
          weight="bold"
          numberOfLines={2}
          style={styles.name}
        >
          {name}
        </AppText>

        {/* RATING */}
        <View style={styles.ratingRow}>
          <Ionicons
            name="star"
            size={15}
            color="#F59E0B"
          />

          <AppText
            weight="bold"
            style={styles.rating}
          >
            {rating.toFixed(1)}
          </AppText>

          <AppText style={styles.sold}>
            ({sold})
          </AppText>
        </View>

        {/* PRICE + BUY */}
        <View style={styles.footer}>
          <AppText
            weight="bold"
            numberOfLines={1}
            style={styles.price}
          >
            ₦{price.toLocaleString("en-NG")}
          </AppText>

          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onBuy();
            }}
            style={({ pressed }) => [
              styles.buyButton,
              pressed && styles.buyPressed,
            ]}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`Buy ${name}`}
          >
            <AppText
              weight="bold"
              style={styles.buyText}
            >
              BUY
            </AppText>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 142,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    overflow: "hidden",
    elevation: 4,

    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },

  imageContainer: {
    width: "100%",
    height: 190,
    backgroundColor: "#F1F5F9",
    position: "relative",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,

    width: 42,
    height: 42,
    borderRadius: 21,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",

    elevation: 3,

    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  content: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 11,
  },

  name: {
    fontSize: 16,
    lineHeight: 20,
    color: "#111827",
    minHeight: 40,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  rating: {
    marginLeft: 5,
    fontSize: 13,
    color: "#111827",
  },

  sold: {
    marginLeft: 4,
    fontSize: 13,
    color: "#6B7280",
  },

  footer: {
    marginTop: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  price: {
    flex: 1,
    fontSize: 17,
    color: "#2563EB",
    marginRight: 6,
  },

  buyButton: {
    minWidth: 68,
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 21,
    backgroundColor: "#2563EB",

    alignItems: "center",
    justifyContent: "center",

    elevation: 3,

    shadowColor: "#2563EB",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  buyPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.94 }],
  },

  buyText: {
    color: "#FFFFFF",
    fontSize: 13,
  },
});