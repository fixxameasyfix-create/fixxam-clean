import React from "react";
import {
  Image,
  View,
  StyleSheet,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type Props = {
  uri?: string;

  size?: number;

  verified?: boolean;

  online?: boolean;
};

export default function AppAvatar({
  uri,

  size = 64,

  verified = false,

  online = false,
}: Props) {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
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
          <MaterialCommunityIcons
            name="account"
            size={size * 0.55}
            color="#94A3B8"
          />
        </View>
      )}

      {verified && (
        <View style={styles.verified}>
          <MaterialCommunityIcons
            name="check-decagram"
            size={20}
            color="#2563EB"
          />
        </View>
      )}

      {online && (
        <View style={styles.online} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },

  placeholder: {
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },

  verified: {
    position: "absolute",
    right: -2,
    bottom: -2,

    backgroundColor: "#FFFFFF",
    borderRadius: 20,
  },

  online: {
    position: "absolute",

    top: 2,
    right: 2,

    width: 14,
    height: 14,

    borderRadius: 7,

    backgroundColor: "#22C55E",

    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});