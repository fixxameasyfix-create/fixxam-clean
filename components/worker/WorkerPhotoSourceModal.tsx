import React, { memo } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { AppText } from "@/components/ui";
import { Colors, FixxamTokens } from "@/theme";

type Props = {
  visible: boolean;
  loading?: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
};

function WorkerPhotoSourceModal({
  visible,
  loading = false,
  onClose,
  onCamera,
  onGallery,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          disabled={loading}
        />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <AppText style={styles.title}>
            Add Work Photo
          </AppText>

          <AppText
            color="secondary"
            style={styles.subtitle}
          >
            Choose how you want to add your work photo.
          </AppText>

          <View style={styles.options}>
            <Pressable
              disabled={loading}
              onPress={onCamera}
              style={({ pressed }) => [
                styles.option,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.iconCircle}>
                <AppText style={styles.icon}>
                  📷
                </AppText>
              </View>

              <AppText style={styles.optionTitle}>
                Camera
              </AppText>

              <AppText
                color="secondary"
                style={styles.optionText}
              >
                Take a new photo
              </AppText>
            </Pressable>

            <Pressable
              disabled={loading}
              onPress={onGallery}
              style={({ pressed }) => [
                styles.option,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.iconCircle}>
                <AppText style={styles.icon}>
                  🖼️
                </AppText>
              </View>

              <AppText style={styles.optionTitle}>
                Gallery
              </AppText>

              <AppText
                color="secondary"
                style={styles.optionText}
              >
                Choose existing photos
              </AppText>
            </Pressable>
          </View>

          <View style={styles.separator} />

          <Pressable
            disabled={loading}
            onPress={onClose}
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && styles.pressed,
            ]}
          >
            <AppText style={styles.cancelText}>
              Cancel
            </AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default memo(WorkerPhotoSourceModal);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },

  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: FixxamTokens.spacing.lg,
    paddingTop: FixxamTokens.spacing.sm,
    paddingBottom: FixxamTokens.spacing.xl,
  },

  handle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    backgroundColor: "#D1D5DB",
    marginBottom: FixxamTokens.spacing.lg,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginTop: FixxamTokens.spacing.xs,
  },

  options: {
    flexDirection: "row",
    gap: FixxamTokens.spacing.sm,
    marginTop: FixxamTokens.spacing.lg,
  },

  option: {
    flex: 1,
    minHeight: 150,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: FixxamTokens.spacing.sm,
    backgroundColor: "#FFFFFF",
  },

  pressed: {
    opacity: 0.7,
  },

  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF8E8",
    marginBottom: FixxamTokens.spacing.sm,
  },

  icon: {
    fontSize: 27,
  },

  optionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  optionText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },

  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
    marginTop: FixxamTokens.spacing.lg,
  },

  cancelButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: FixxamTokens.spacing.sm,
  },

  cancelText: {
    fontSize: 16,
    fontWeight: "600",
  },
});