import React, { ReactNode } from "react";

import {
  View,
  StyleSheet,
} from "react-native";

import { AppText } from "@/components/ui";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function BookingSection({
  title,
  subtitle,
  children,
}: Props) {
  return (
    <View style={styles.container}>

      <View style={styles.header}>

        <AppText
          weight="bold"
          style={styles.title}
        >
          {title}
        </AppText>

        {!!subtitle && (
          <AppText
            style={styles.subtitle}
          >
            {subtitle}
          </AppText>
        )}

      </View>

      <View style={styles.content}>
        {children}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    marginBottom: 20,
  },

  header: {
    marginBottom: 10,
    paddingHorizontal: 4,
  },

  title: {
    fontSize: 17,
    color: "#111827",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },

  content: {
    gap: 12,
  },

});