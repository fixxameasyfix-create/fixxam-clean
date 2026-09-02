import React, {
  memo,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  onPress: () => void;
};

function BookingPhotoAddSlot({
  onPress,
}: Props) {

  return (

    <Pressable
      style={styles.container}
      onPress={onPress}
    >

      <View style={styles.iconBox}>

        <Ionicons
          name="camera"
          size={26}
          color="#EA580C"
        />

      </View>

      <AppText
        weight="bold"
        style={styles.title}
      >
        Add Photo
      </AppText>

      <AppText
        style={styles.subtitle}
      >
        Camera or Gallery
      </AppText>

    </Pressable>

  );

}

export default memo(
  BookingPhotoAddSlot
);

const styles = StyleSheet.create({

  container: {

    flex: 1,

    aspectRatio: 1,

    borderRadius: 20,

    borderWidth: 2,

    borderStyle: "dashed",

    borderColor: "#FDBA74",

    backgroundColor: "#FFF7ED",

    justifyContent: "center",

    alignItems: "center",

    padding: 12,

  },

  iconBox: {

    width: 52,

    height: 52,

    borderRadius: 26,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 10,

  },

  title: {

    fontSize: 13,

    color: "#C2410C",

    textAlign: "center",

  },

  subtitle: {

    marginTop: 4,

    fontSize: 11,

    color: "#94A3B8",

    textAlign: "center",

    lineHeight: 16,

  },

});