import React, { memo } from "react";
import { StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  title: string;
  subtitle: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

function WorkerOfferHeader({
  title,
  subtitle,
  icon = "cash-outline",
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Ionicons
          name={icon}
          size={23}
          color="#7C3AED"
        />
      </View>

      <View style={styles.content}>
        <AppText
          weight="bold"
          style={styles.title}
        >
          {title}
        </AppText>

        <AppText style={styles.subtitle}>
          {subtitle}
        </AppText>
      </View>
    </View>
  );
}

export default memo(WorkerOfferHeader);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flex: 1,
    marginLeft: 11,
  },

  title: {
    fontSize: 14,
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 10.5,
    lineHeight: 16,
    color: "#64748B",
  },
});