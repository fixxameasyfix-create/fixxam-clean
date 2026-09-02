import React from "react";

import {
  Pressable,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

type Props = {

  onPress: () => void;

  loading?: boolean;

};

export default function LogoutButton({

  onPress,

  loading = false,

}: Props) {

  return (

    <Pressable

      disabled={loading}

      onPress={onPress}

      style={[
        styles.button,
        loading && styles.disabled,
      ]}

    >

      <Ionicons
        name="log-out-outline"
        size={22}
        color="#FFFFFF"
      />

      <AppText
        weight="bold"
        style={styles.text}
      >

        {loading
          ? "Logging out..."
          : "Logout"}

      </AppText>

    </Pressable>

  );

}

const styles = StyleSheet.create({

  button: {

    height: 56,

    marginHorizontal: 16,

    marginTop: 24,

    marginBottom: 40,

    borderRadius: 18,

    backgroundColor: "#DC2626",

    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

  },

  text: {

    marginLeft: 10,

    color: "#FFFFFF",

    fontSize: 16,

  },

  disabled: {

    opacity: 0.7,

  },

});