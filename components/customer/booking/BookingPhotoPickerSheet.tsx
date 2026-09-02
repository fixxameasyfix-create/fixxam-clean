import React, { memo } from "react";

import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  visible: boolean;

  onClose: () => void;

  onCamera: () => void;

  onGallery: () => void;
};

function BookingPhotoPickerSheet({
  visible,
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
      <Pressable
        style={styles.overlay}
        onPress={onClose}
      >
        <Pressable
          style={styles.sheet}
          onPress={(event) =>
            event.stopPropagation()
          }
        >
          <View style={styles.handle} />

          <AppText
            weight="bold"
            style={styles.title}
          >
            Add Photo
          </AppText>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Take photo"
            onPress={onCamera}
            style={({ pressed }) => [
              styles.option,
              pressed &&
                styles.pressed,
            ]}
          >
            <View style={styles.iconBox}>
              <Ionicons
                name="camera-outline"
                size={20}
                color="#F97316"
              />
            </View>

            <AppText
              weight="bold"
              style={styles.optionText}
            >
              Take Photo
            </AppText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choose photo from gallery"
            onPress={onGallery}
            style={({ pressed }) => [
              styles.option,
              pressed &&
                styles.pressed,
            ]}
          >
            <View style={styles.iconBox}>
              <Ionicons
                name="images-outline"
                size={20}
                color="#2563EB"
              />
            </View>

            <AppText
              weight="bold"
              style={styles.optionText}
            >
              Choose from Gallery
            </AppText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            onPress={onClose}
            style={({ pressed }) => [
              styles.cancel,
              pressed &&
                styles.pressed,
            ]}
          >
            <AppText
              weight="bold"
              style={styles.cancelText}
            >
              Cancel
            </AppText>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default memo(
  BookingPhotoPickerSheet
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,

    justifyContent: "flex-end",

    backgroundColor:
      "rgba(15, 23, 42, 0.35)",
  },

  sheet: {
    backgroundColor: "#FFFFFF",

    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,

    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
  },

  handle: {
    alignSelf: "center",

    width: 38,
    height: 4,

    borderRadius: 2,

    backgroundColor: "#CBD5E1",

    marginBottom: 18,
  },

  title: {
    fontSize: 18,

    color: "#0F172A",

    marginBottom: 8,
  },

  option: {
    minHeight: 54,

    flexDirection: "row",

    alignItems: "center",

    borderRadius: 14,

    paddingHorizontal: 4,
  },

  iconBox: {
    width: 36,
    height: 36,

    borderRadius: 10,

    backgroundColor: "#F8FAFC",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 10,
  },

  optionText: {
    fontSize: 14,

    color: "#0F172A",
  },

  cancel: {
    minHeight: 48,

    alignItems: "center",
    justifyContent: "center",

    marginTop: 6,

    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  cancelText: {
    fontSize: 14,

    color: "#EF4444",
  },

  pressed: {
    opacity: 0.7,
  },
});