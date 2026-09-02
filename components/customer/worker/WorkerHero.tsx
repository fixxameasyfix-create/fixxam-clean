import React from "react";
import {
  View,
  StyleSheet,
  Image,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

import { LinearGradient } from "expo-linear-gradient";

type Props = {
  photo?: string;
  name: string;
  category?: string;
  location?: string;
  rating: number;
  reviews: number;
  verified: boolean;
  online: boolean;
};

export default function WorkerHero({
  photo,
  name,
  category,
  location,
  rating,
  reviews,
  verified,
  online,
}: Props) {


return (
  <View style={styles.container}>
    <LinearGradient
  colors={[
    "#2563EB",
    "#3B82F6",
    "#60A5FA",
  ]}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.cover}
>
      <View
  style={[
    styles.avatarRing,
    {
      borderColor: online ? "#22C55E" : "#EF4444",
    },
  ]}
>
  <Image
    source={{
      uri:
        photo && photo.trim().length > 0
          ? photo
          : "https://ui-avatars.com/api/?name=Worker&background=2563EB&color=fff&size=256",
    }}
    style={styles.photo}
    resizeMode="cover"
  />

  {verified && (
    <View style={styles.verifiedBadge}>
      <Ionicons
        name="checkmark"
        size={14}
        color="#FFFFFF"
      />
    </View>
  )}
</View>

      <AppText
        weight="bold"
        style={styles.name}
      >
        {name}
      </AppText>

      {!!category && (
        <AppText style={styles.category}>
          {category}
        </AppText>
      )}

      <View style={styles.badgesRow}>

        <View style={styles.badge}>
          <Ionicons
            name="star"
            size={14}
            color="#FACC15"
          />

          <AppText style={styles.badgeText}>
            {rating.toFixed(1)} ({reviews})
          </AppText>
        </View>

        {!!location && (
          <View style={styles.badge}>
            <Ionicons
              name="location"
              size={14}
              color="#60A5FA"
            />

            <AppText style={styles.badgeText}>
              {location}
            </AppText>
          </View>
        )}

      </View>

    </LinearGradient>
  </View>
);

}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 10,

    borderRadius: 26,
    overflow: "hidden",

    shadowColor: "#2563EB",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 6,
  },

  cover: {
    alignItems: "center",

    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 20,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  avatarRing: {
    width: 92,
    height: 92,
    borderRadius: 46,

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 3,

    marginBottom: 14,
  },

  photo: {
    width: 84,
    height: 84,
    borderRadius: 42,

    backgroundColor: "#E2E8F0",
  },

  verifiedBadge: {
    position: "absolute",

    right: 2,
    bottom: 2,

    width: 20,
    height: 20,
    borderRadius: 10,

    backgroundColor: "#22C55E",

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  name: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "800",
  },

  category: {
    marginTop: 4,

    fontSize: 15,

    color: "rgba(255,255,255,0.82)",
  },

  badgesRow: {
    flexDirection: "row",

    justifyContent: "center",

    flexWrap: "wrap",

    marginTop: 16,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",

    height: 36,

    paddingHorizontal: 14,

    backgroundColor: "rgba(255,255,255,0.14)",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",

    borderRadius: 18,

    marginHorizontal: 5,
    marginVertical: 4,
  },

  badgeText: {
    marginLeft: 6,

    fontSize: 13,

    fontWeight: "600",

    color: "#FFFFFF",
  },
});