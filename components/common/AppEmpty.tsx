import React from "react";
import {
  View,
  StyleSheet,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import AppButton from "@/components/ui/AppButton";
import { AppText } from "@/components/ui";

type Props = {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  message: string;

  buttonText?: string;
  onPress?: () => void;

  iconColor?: string;
  iconBackgroundColor?: string;
};

export default function AppEmpty({
  icon = "package-variant-closed",

  title,
  message,

  buttonText,
  onPress,

  iconColor = "#2563EB",
  iconBackgroundColor = "#EFF6FF",
}: Props) {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor:
              iconBackgroundColor,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={56}
          color={iconColor}
        />
      </View>

      <AppText
        weight="bold"
        style={styles.title}
      >
        {title}
      </AppText>

      <AppText style={styles.message}>
        {message}
      </AppText>

      {buttonText && onPress && (
        <AppButton
          title={buttonText}
          onPress={onPress}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    paddingHorizontal: 24,
  },

  iconBox: {
    width: 120,
    height: 120,

    borderRadius: 32,

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 24,
  },

  title: {
    fontSize: 22,

    color: "#0F172A",

    textAlign: "center",
  },

  message: {
    marginTop: 10,

    fontSize: 15,

    color: "#64748B",

    textAlign: "center",

    lineHeight: 24,

    marginBottom: 28,
  },
});