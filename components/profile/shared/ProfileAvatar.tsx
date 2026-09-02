import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

type Props = {
  photoUrl?: string;
  size?: number;
  editable?: boolean;
  onPress?: () => void;
};

export default function ProfileAvatar({
  photoUrl,
  size = 72,
  editable = false,
  onPress,
}: Props) {
  return (
    <Pressable
      disabled={!editable}
      onPress={onPress}
      style={styles.container}
    >
      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        >
          <Ionicons
            name="person"
            size={size * 0.4}
            color="#94A3B8"
          />
        </View>
      )}

      {editable && (
        <View style={styles.camera}>
          <Ionicons
            name="camera"
            size={14}
            color="#FFFFFF"
          />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
  },

  placeholder: {
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },

  camera: {
    position: "absolute",

    right: -2,
    bottom: -2,

    width: 24,
    height: 24,
    borderRadius: 12,

    backgroundColor: "#2563EB",

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 2,
    borderColor: "#FFFFFF",

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 3,
  },
});