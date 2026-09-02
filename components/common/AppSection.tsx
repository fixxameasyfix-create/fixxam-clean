import React from "react";
import {
  View,
  StyleSheet,
} from "react-native";

import { AppText } from "@/components/ui";

type Props = {
  title: string;
  subtitle?: string;
  rightComponent?: React.ReactNode;
  children: React.ReactNode;
};

export default function AppSection({
  title,
  subtitle,
  rightComponent,
  children,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.left}>
          <AppText
            weight="bold"
            style={styles.title}
          >
            {title}
          </AppText>

          {subtitle ? (
            <AppText style={styles.subtitle}>
              {subtitle}
            </AppText>
          ) : null}
        </View>

        {rightComponent}
      </View>

      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  left: {
    flex: 1,
  },

  title: {
    fontSize: 20,
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748B",
  },

  content: {
    marginTop: 2,
  },
});