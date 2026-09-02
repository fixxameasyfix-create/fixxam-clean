import React, { memo } from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  onReview: () => void;
  onCall: () => void;
  onFavorite: () => void;
};

function WorkerActions({
  onReview,
  onCall,
  onFavorite,
}: Props) {
  return (
    <View style={styles.container}>
      {/* REVIEWS */}

      <Pressable
        style={({ pressed }) => [
          styles.actionButton,
          pressed && styles.pressed,
        ]}
        onPress={onReview}
        accessibilityRole="button"
        accessibilityLabel="View worker reviews"
      >
        <Ionicons
          name="star-outline"
          size={18}
          color="#F59E0B"
        />

        <AppText
          weight="bold"
          style={styles.actionText}
        >
          Reviews
        </AppText>
      </Pressable>

      {/* CALL */}

      <Pressable
        style={({ pressed }) => [
          styles.actionButton,
          styles.callButton,
          pressed && styles.pressed,
        ]}
        onPress={onCall}
        accessibilityRole="button"
        accessibilityLabel="Call worker"
      >
        <Ionicons
          name="call-outline"
          size={18}
          color="#FFFFFF"
        />

        <AppText
          weight="bold"
          style={styles.callText}
        >
          Call
        </AppText>
      </Pressable>

      {/* SAVE */}

      <Pressable
        style={({ pressed }) => [
          styles.actionButton,
          pressed && styles.pressed,
        ]}
        onPress={onFavorite}
        accessibilityRole="button"
        accessibilityLabel="Save worker"
      >
        <Ionicons
          name="heart-outline"
          size={18}
          color="#CBD5E1"
        />

        <AppText
          weight="bold"
          style={styles.actionText}
        >
          Save
        </AppText>
      </Pressable>
    </View>
  );
}

export default memo(WorkerActions);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    gap: 6,
  },

  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  callButton: {
    backgroundColor: "#F97316",
    borderColor: "#F97316",
  },

  actionText: {
    fontSize: 10.5,
    lineHeight: 14,
    color: "#0F172A",
  },

  callText: {
    fontSize: 10.5,
    lineHeight: 14,
    color: "#FFFFFF",
  },

  pressed: {
    opacity: 0.78,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },
});