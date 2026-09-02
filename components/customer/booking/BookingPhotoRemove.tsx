import React, {
  memo,
} from "react";

import {
  Pressable,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

type Props = {
  onPress: () => void;
};

function BookingPhotoRemove({
  onPress,
}: Props) {

  return (

    <Pressable
      style={styles.container}
      onPress={onPress}
      hitSlop={10}
    >

      <Ionicons
        name="close"
        size={14}
        color="#FFFFFF"
      />

    </Pressable>

  );

}

export default memo(
  BookingPhotoRemove
);

const styles = StyleSheet.create({

  container: {

    position: "absolute",

    top: 8,

    right: 8,

    width: 28,

    height: 28,

    borderRadius: 14,

    backgroundColor: "rgba(15,23,42,0.85)",

    justifyContent: "center",

    alignItems: "center",

    shadowColor: "#000",

    shadowOpacity: 0.2,

    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 5,

  },

});