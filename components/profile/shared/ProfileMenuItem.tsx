import React from "react";

import {
  Pressable,
  StyleSheet,
  ViewStyle,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

type Props = {

  title: string;

  icon: keyof typeof Ionicons.glyphMap;

  onPress?: () => void;

  danger?: boolean;

  style?: ViewStyle;

};

export default function ProfileMenuItem({

  title,

  icon,

  onPress,

  danger = false,

  style,

}: Props) {

  return (

    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        style,
      ]}
    >

      <Ionicons
        name={icon}
        size={22}
        color={
          danger
            ? "#DC2626"
            : "#475569"
        }
      />

      <AppText
        style={[
          styles.title,
          danger && {
            color: "#DC2626",
          },
        ]}
      >
        {title}
      </AppText>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#94A3B8"
      />

    </Pressable>

  );

}

const styles = StyleSheet.create({

  container: {

    flexDirection: "row",

    alignItems: "center",

    height: 58,

    paddingHorizontal: 18,

    backgroundColor: "#FFFFFF",

    borderBottomWidth: 1,

    borderBottomColor: "#F1F5F9",

  },

  title: {

    flex: 1,

    marginLeft: 14,

    fontSize: 15,

    color: "#111827",

    fontWeight: "600",

  },

});