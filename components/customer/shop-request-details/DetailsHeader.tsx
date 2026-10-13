import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui";
import { Colors, FixxamTokens } from "@/theme";

type Props = {
  onBack: () => void;
};

export default function DetailsHeader({
  onBack,
}: Props) {
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
        style={({ pressed }) => [
          styles.headerButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="arrow-back"
          size={21}
          color={Colors.textPrimary}
        />
      </Pressable>

      <View style={styles.headerTitleContainer}>
        <AppText
          weight="bold"
          style={styles.headerTitle}
        >
          Request Details
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          style={styles.headerSubtitle}
        >
          Shop service request
        </AppText>
      </View>

      <View style={styles.headerPlaceholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: FixxamTokens.motion.pressedOpacity,
  },

  header: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },

  headerButton: {
    width: FixxamTokens.size.minimumTouchTarget,
    height: FixxamTokens.size.minimumTouchTarget,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: FixxamTokens.radius.chip,
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    textAlign: "center",
    fontSize: 16,
  },

  headerSubtitle: {
    marginTop: 1,
    textAlign: "center",
  },

  headerPlaceholder: {
    width: FixxamTokens.size.minimumTouchTarget,
  },
});