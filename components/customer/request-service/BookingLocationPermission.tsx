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
  granted: boolean;
  loading?: boolean;
  onRequestPermission: () => void;
};

function BookingLocationPermission({
  granted,
  loading = false,
  onRequestPermission,
}: Props) {
  if (granted) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* ======================================================
          INFO
      ====================================================== */}

      <View style={styles.iconBox}>
        <Ionicons
          name="location-outline"
          size={19}
          color="#D97706"
        />
      </View>

      <View style={styles.content}>
        <AppText
          weight="bold"
          style={styles.title}
        >
          Location access needed
        </AppText>

        <AppText
          style={styles.description}
        >
          Allow Fixxam to access your
          location so we can find where
          the worker should come.
        </AppText>
      </View>

      {/* ======================================================
          ACTION
      ====================================================== */}

      <Pressable
        onPress={onRequestPermission}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="Allow location access"
        accessibilityState={{
          disabled: loading,
        }}
        style={({ pressed }) => [
          styles.button,

          loading &&
            styles.buttonDisabled,

          pressed &&
            !loading &&
            styles.buttonPressed,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color="#2563EB"
          />
        ) : (
          <Ionicons
            name="chevron-forward"
            size={18}
            color="#2563EB"
          />
        )}
      </Pressable>
    </View>
  );
}

export default memo(
  BookingLocationPermission,
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 11,

    padding: 12,

    borderRadius: 17,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#E2E8F0",

    shadowColor: "#0F172A",

    shadowOpacity: 0.025,

    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 1,
  },

  iconBox: {
    width: 42,
    height: 42,

    borderRadius: 13,

    backgroundColor: "#FFF7ED",

    borderWidth: 1,

    borderColor: "#FED7AA",

    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flex: 1,

    minWidth: 0,

    marginLeft: 10,

    marginRight: 8,
  },

  title: {
    fontSize: 12.5,

    lineHeight: 18,

    color: "#0F172A",
  },

  description: {
    marginTop: 3,

    fontSize: 10.5,

    lineHeight: 15,

    color: "#64748B",
  },

  button: {
    width: 36,
    height: 36,

    borderRadius: 11,

    backgroundColor: "#EFF6FF",

    borderWidth: 1,

    borderColor: "#DBEAFE",

    alignItems: "center",
    justifyContent: "center",
  },

  buttonDisabled: {
    opacity: 0.45,
  },

  buttonPressed: {
    opacity: 0.65,

    transform: [
      {
        scale: 0.95,
      },
    ],
  },
});