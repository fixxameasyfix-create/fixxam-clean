import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

type Props = {

  hasWorkerAccount: boolean;

  onPress: () => void;

};

export default function CustomerQuickAction({

  hasWorkerAccount,

  onPress,

}: Props) {

  return (

    <Pressable
      onPress={onPress}
      style={styles.container}
    >

      <View style={styles.iconContainer}>

        <Ionicons
          name={
            hasWorkerAccount
              ? "swap-horizontal"
              : "briefcase"
          }
          size={28}
          color="#2563EB"
        />

      </View>

      <View style={styles.content}>

        <AppText
          weight="bold"
          style={styles.title}
        >

          {hasWorkerAccount
            ? "Switch to Worker"
            : "Become a Worker"}

        </AppText>

        <AppText style={styles.subtitle}>

          {hasWorkerAccount
            ? "Start receiving jobs and manage your business."
            : "Create your worker account and begin earning."}

        </AppText>

      </View>

      <Ionicons
        name="chevron-forward"
        size={22}
        color="#94A3B8"
      />

    </Pressable>

  );

}

const styles = StyleSheet.create({

  container: {

    marginHorizontal: 16,

    marginBottom: 20,

    padding: 18,

    borderRadius: 20,

    backgroundColor: "#EFF6FF",

    flexDirection: "row",

    alignItems: "center",

  },

  iconContainer: {

    width: 56,

    height: 56,

    borderRadius: 28,

    backgroundColor: "#DBEAFE",

    justifyContent: "center",

    alignItems: "center",

  },

  content: {

    flex: 1,

    marginHorizontal: 14,

  },

  title: {

    fontSize: 17,

    color: "#1E3A8A",

  },

  subtitle: {

    marginTop: 4,

    color: "#64748B",

    lineHeight: 20,

  },

});