import React from "react";

import {
  Image,
  StyleSheet,
  View,
} from "react-native";

type Props = {
  photoUrl?: string;
  online?: boolean;
};

export default function WorkerAvatar({
  photoUrl,
  online,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <Image
        source={
          photoUrl
            ? {
                uri: photoUrl,
              }
            : require("@/assets/images/avatar-placeholder.png")
        }
        style={styles.image}
      />

      {online && (
        <View style={styles.online} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 92,
    height: 92,

    borderRadius: 46,

    borderWidth: 4,
    borderColor: "#22C55E",

    overflow: "visible",

    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width: 84,
    height: 84,

    borderRadius: 42,
  },

  online: {
    position: "absolute",

    right: -2,
    bottom: -2,

    width: 22,
    height: 22,

    borderRadius: 11,

    backgroundColor: "#22C55E",

    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
});