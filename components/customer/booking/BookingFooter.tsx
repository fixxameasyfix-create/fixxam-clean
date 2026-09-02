import React, { memo } from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
};

function BookingFooter({
  disabled = false,
  loading = false,
  onPress,
}: Props) {
  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (isDisabled) {
      return;
    }

    onPress();
  };

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Continue booking"
        accessibilityState={{
          disabled: isDisabled,
          busy: loading,
        }}
        disabled={isDisabled}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.button,
          isDisabled && styles.disabled,
          pressed &&
            !isDisabled &&
            styles.pressed,
        ]}
      >
        {loading ? (
          <View style={styles.loadingContent}>
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />

            <AppText
              weight="bold"
              style={styles.loadingText}
            >
              Processing...
            </AppText>
          </View>
        ) : (
          <>
            <AppText
              weight="bold"
              style={styles.text}
            >
              Continue
            </AppText>

            <View style={styles.arrowCircle}>
              <Ionicons
                name="arrow-forward"
                size={14}
                color="#F97316"
              />
            </View>
          </>
        )}
      </Pressable>
    </View>
  );
}

export default memo(BookingFooter);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 4,
  },

  button: {
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: "#F97316",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 14,

    shadowColor: "#F97316",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.16,
    shadowRadius: 6,

    elevation: 3,
  },

  disabled: {
    backgroundColor: "#CBD5E1",
    shadowOpacity: 0,
    elevation: 0,
  },

  pressed: {
    opacity: 0.88,

    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  text: {
    flex: 1,

    color: "#FFFFFF",

    fontSize: 12,
    lineHeight: 16,

    fontWeight: "700",
  },

  arrowCircle: {
    width: 26,
    height: 26,

    borderRadius: 13,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",

    marginLeft: 8,
  },

  loadingContent: {
    flex: 1,

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    gap: 8,
  },

  loadingText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
});