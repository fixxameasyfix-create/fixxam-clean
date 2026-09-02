import React, { memo } from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  description: string;
};

const WorkerOrderRequest = memo(
  function WorkerOrderRequest({
    description,
  }: Props) {
    return (
      <View style={styles.requestCard}>
        <View style={styles.requestIcon}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={22}
            color="#2563EB"
          />
        </View>

        <AppText
          style={styles.description}
        >
          {description.trim() ||
            "No description provided."}
        </AppText>
      </View>
    );
  },
);

WorkerOrderRequest.displayName =
  "WorkerOrderRequest";

export default WorkerOrderRequest;

const styles = StyleSheet.create({
  requestCard: {
    padding: 13,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  requestIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  description: {
    flex: 1,
    marginLeft: 10,
    fontSize: 11.5,
    lineHeight: 18,
    color: "#334155",
  },
});