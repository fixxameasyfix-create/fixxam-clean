import React, { memo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

type Props = {
  saving: boolean;
  onSave: () => Promise<boolean>;
};

function WorkerProfileActions({
  saving,
  onSave,
}: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onSave}
        disabled={saving}
        style={({ pressed }) => [
          styles.button,
          pressed &&
            styles.pressed,
          saving &&
            styles.disabled,
        ]}
      >
        {saving ? (
          <ActivityIndicator
            color="#FFFFFF"
          />
        ) : (
          <AppText
            variant="body"
            style={styles.buttonText}
          >
            Save & Publish
          </AppText>
        )}
      </Pressable>

      <View
        style={styles.security}
      >
        <AppText
          variant="caption"
          tone="secondary"
          center
        >
          Your profile is securely
          published to Fixxam customers.
        </AppText>
      </View>
    </View>
  );
}

export default memo(
  WorkerProfileActions,
);

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },

  button: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#17202A",
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  disabled: {
    opacity: 0.65,
  },

  pressed: {
    opacity: 0.8,
  },

  security: {
    marginTop: 12,
    paddingHorizontal: 10,
  },
});