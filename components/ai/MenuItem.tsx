import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui";
import {
  CustomerColors,
  FixxamTokens,
} from "@/theme";

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  danger?: boolean;
  onPress: () => void;
}

export default function MenuItem({
  icon,
  title,
  danger = false,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={styles.container}
    >
      <View
        style={[
          styles.iconBox,
          danger && styles.iconDanger,
        ]}
      >
        <Ionicons
          name={icon}
          size={22}
          color={
            danger
              ? "#EF4444"
              : CustomerColors.primary
          }
        />
      </View>

      <AppText
        weight="semibold"
        style={[
          styles.title,
          danger && styles.dangerText,
        ]}
      >
        {title}
      </AppText>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#B8C1CC"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 18,

    borderRadius: 18,

    marginBottom: 10,

    backgroundColor: "#FFFFFF",
  },

  iconBox: {
    width: 42,

    height: 42,

    borderRadius: 14,

    backgroundColor: "#EEF4FF",

    justifyContent: "center",

    alignItems: "center",
  },

  iconDanger: {
    backgroundColor: "#FEECEC",
  },

  title: {
    flex: 1,

    marginLeft: 14,

    fontSize: 16,

    color: CustomerColors.textPrimary,
  },

  dangerText: {
    color: "#EF4444",
  },
});