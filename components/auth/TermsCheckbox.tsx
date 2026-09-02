import React from "react";
import {
  View,
  Pressable,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

import {
  CustomerColors,
  WorkerColors,
  FixxamTokens,
  FIXXAM,
} from "@/theme";

type Props = {
  checked: boolean;
  onToggle: () => void;
  variant?: "customer" | "worker";
};

export default function TermsCheckbox({
  checked,
  onToggle,
  variant = "customer",
}: Props) {
  const activeColor =
    variant === "worker"
      ? WorkerColors.primary
      : CustomerColors.primary;

  return (
    <Pressable
      onPress={onToggle}
      style={styles.container}
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: activeColor,
            backgroundColor: checked
              ? activeColor
              :CustomerColors.white,
          },
        ]}
      >
        {checked && (
          <Ionicons
            name="checkmark"
            size={16}
            color="#FFFFFF"
          />
        )}
      </View>

      <View style={styles.textContainer}>
        <AppText style={styles.text}>
          I agree to the
        </AppText>

        <AppText
          style={[
            styles.link,
            {
              color: activeColor,
            },
          ]}
        >
          {" "}Terms & Conditions
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: FixxamTokens.spacing.xs,
  },

  checkbox: {
    width: 24,
    height: 24,

    borderWidth: 1.5,
    borderRadius: 8,

    justifyContent: "center",
    alignItems: "center",

    ...FixxamTokens.shadow.card,
  },

  textContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    flex: 1,

    marginLeft: FixxamTokens.spacing.sm,
  },

  text: {
    fontSize: FIXXAM.SMALL_SIZE,
    color: CustomerColors.textPrimary,
  },

  link: {
    fontSize: FIXXAM.SMALL_SIZE,
    fontWeight: "700",
  },
});