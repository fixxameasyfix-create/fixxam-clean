import React, { memo } from "react";

import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

type Props = {
  uri?: string;

  onPress: () => void;

  onRemove: () => void;
};

function BookingPhotoSlot({
  uri,
  onPress,
  onRemove,
}: Props) {
  if (uri) {
    return (
      <View style={styles.container}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Replace photo"
          style={({ pressed }) => [
            styles.imageContainer,
            pressed &&
              styles.pressed,
          ]}
          onPress={onPress}
        >
          <Image
            source={{ uri }}
            style={styles.image}
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Remove photo"
          style={({ pressed }) => [
            styles.remove,
            pressed &&
              styles.pressed,
          ]}
          onPress={onRemove}
          hitSlop={8}
        >
          <Ionicons
            name="close"
            size={14}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add photo"
      style={({ pressed }) => [
        styles.empty,
        pressed &&
          styles.pressed,
      ]}
      onPress={onPress}
    >
      <Ionicons
        name="camera-outline"
        size={24}
        color="#F97316"
      />
    </Pressable>
  );
}

export default memo(
  BookingPhotoSlot
);

const styles = StyleSheet.create({
  container: {
    flex: 1,

    aspectRatio: 1,

    position: "relative",
  },

  imageContainer: {
    flex: 1,

    borderRadius: 14,

    overflow: "hidden",

    backgroundColor: "#F8FAFC",

    borderWidth: 1,

    borderColor: "#E2E8F0",
  },

  image: {
    width: "100%",

    height: "100%",
  },

  empty: {
    flex: 1,

    aspectRatio: 1,

    borderRadius: 14,

    borderWidth: 1,

    borderStyle: "dashed",

    borderColor: "#FDBA74",

    backgroundColor: "#FFF7ED",

    alignItems: "center",

    justifyContent: "center",
  },

  remove: {
    position: "absolute",

    top: 6,

    right: 6,

    width: 24,

    height: 24,

    borderRadius: 12,

    backgroundColor: "#EF4444",

    alignItems: "center",

    justifyContent: "center",

    borderWidth: 2,

    borderColor: "#FFFFFF",
  },

  pressed: {
    opacity: 0.75,
  },
});