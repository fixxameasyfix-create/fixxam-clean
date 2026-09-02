import React, {
  memo,
  useCallback,
} from "react";

import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { router } from "expo-router";

import type {
  EmergencyService,
} from "@/constants/emergencyServices";

type Props = {
  visible: boolean;
  service: EmergencyService | null;
  onClose: () => void;
};

function EmergencyCallModal({
  visible,
  service,
  onClose,
}: Props) {
  const handleCall = useCallback(() => {
    if (!service) {
      return;
    }

    /*
     * Call Now no longer opens the phone dialer.
     *
     * It takes the customer directly to:
     *
     * app/(customer)/contact-worker/index.tsx
     */
    router.push(
      "/(customer)/contact-worker/contact",
    );
  }, [service]);

  if (!service) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* =====================================================
              FULL EMERGENCY IMAGE

              The image already contains:
              - Emergency image
              - SOS icon
              - Title
              - Description
              - ×
              - Call Now
          ===================================================== */}

          <Image
            source={service.image}
            style={styles.image}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel={`${service.title} emergency service`}
          />

          {/* =====================================================
              CLOSE HOTSPOT

              Invisible Pressable positioned over the ×
              already contained inside the image.
          ===================================================== */}

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close emergency service"
            hitSlop={8}
            style={({ pressed }) => [
              styles.closeHotspot,
              pressed &&
                styles.hotspotPressed,
            ]}
          />

          {/* =====================================================
              CALL NOW HOTSPOT

              Invisible Pressable positioned over the
              Call Now button contained inside the image.

              It now opens Contact Workers instead of
              opening the phone dialer.
          ===================================================== */}

          <Pressable
            onPress={handleCall}
            accessibilityRole="button"
            accessibilityLabel={`Contact workers for ${service.title}`}
            style={({ pressed }) => [
              styles.callHotspot,
              pressed &&
                styles.hotspotPressed,
            ]}
          />
        </View>
      </View>
    </Modal>
  );
}

export default memo(
  EmergencyCallModal,
);

const styles = StyleSheet.create({
  /* ============================================================
     OVERLAY
  ============================================================ */

  overlay: {
    flex: 1,

    backgroundColor:
      "rgba(15, 23, 42, 0.68)",

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  /* ============================================================
     MODAL
  ============================================================ */

  modal: {
    width: "100%",

    maxWidth: 430,

    aspectRatio: 2 / 3,

    position: "relative",

    overflow: "hidden",

    backgroundColor: "#FFFFFF",

    borderRadius: 30,

    shadowColor: "#000000",

    shadowOpacity: 0.25,

    shadowRadius: 30,

    shadowOffset: {
      width: 0,
      height: 16,
    },

    elevation: 20,
  },

  /* ============================================================
     IMAGE
  ============================================================ */

  image: {
    width: "100%",
    height: "100%",
  },

  /* ============================================================
     CLOSE HOTSPOT
  ============================================================ */

  closeHotspot: {
    position: "absolute",

    top: 0,
    right: 0,

    width: "18%",
    height: "14%",

    zIndex: 20,

    backgroundColor: "transparent",
  },

  /* ============================================================
     CALL NOW HOTSPOT
  ============================================================ */

  callHotspot: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,

    height: "15%",

    zIndex: 20,

    backgroundColor: "transparent",
  },

  /* ============================================================
     PRESSED STATE
  ============================================================ */

  hotspotPressed: {
    opacity: 0.75,
  },
});