import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

type Props = {

  role: "customer" | "worker";

  verified?: boolean;

};

export default function ProfileBadge({

  role,

  verified = true,

}: Props) {

  const isWorker =
    role === "worker";

  return (

    <View
      style={[
        styles.container,
        {
          backgroundColor: isWorker
            ? "#DCFCE7"
            : "#DBEAFE",
        },
      ]}
    >

      <Ionicons
        name={
          verified
            ? "checkmark-circle"
            : "alert-circle"
        }
        size={11}
        color={
          isWorker
            ? "#16A34A"
            : "#2563EB"
        }
      />

      <AppText
        weight="bold"
        style={[
          styles.text,
          {
            color: isWorker
              ? "#15803D"
              : "#2563EB",
          },
        ]}
      >

        {verified
          ? `${
              isWorker
                ? "Worker"
                : "Customer"
            } Account`
          : "Verification Pending"}

      </AppText>

    </View>

  );

}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 2,
    paddingVertical: 4,

    borderRadius: 999,

    marginTop: 1,
  },

  text: {
    marginLeft: 2,

    fontSize: 11,

    fontWeight: "700",

    lineHeight: 14,
  },
});