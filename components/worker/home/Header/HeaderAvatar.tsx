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
  photoURL?: string | null;
  workerName: string;
  onPress?: () => void;
};

export default function HeaderAvatar({
  photoURL,
  workerName,
  onPress,
}: Props) {
  const initials = workerName
    .trim()
    .split(" ")
    .map((name) => name.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Pressable
      onPress={onPress}
      style={styles.container}
    >
      {photoURL ? (
        <Image
          source={{ uri: photoURL }}
          style={styles.image}
        />
      ) : (
        <View style={styles.placeholder}>
          {initials ? (
            <AppText
              weight="bold"
              style={styles.initials}
            >
              {initials}
            </AppText>
          ) : (
            <Ionicons
              name="person"
              size={28}
              color="#FFFFFF"
            />
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  placeholder: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: "#FF6B00",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#FF6B00",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 5,
  },

  initials: {
    color: "#FFFFFF",
    fontSize: 22,
  },
});