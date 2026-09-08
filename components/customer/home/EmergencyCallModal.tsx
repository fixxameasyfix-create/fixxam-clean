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

import {
  router,
} from "expo-router";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

import type {
  EmergencyService,
} from "@/constants/emergencyServices";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  visible: boolean;

  service:
    | EmergencyService
    | null;

  onClose: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

function EmergencyCallModal({
  visible,
  service,
  onClose,
}: Props) {
  /* ==========================================================
     CONTACT WORKERS
  ========================================================== */

  const handleCall =
    useCallback(() => {
      if (!service) {
        return;
      }

      /*
       * Close the emergency modal first
       * so it cannot remain mounted over
       * the next screen.
       */
      onClose();

      /*
       * Preserve the existing route.
       *
       * Call Now does not open
       * the phone dialer.
       */
      router.push(
        "/(customer)/contact-worker/contact",
      );
    }, [
      onClose,
      service,
    ]);

  /* ==========================================================
     EMPTY
  ========================================================== */

  if (!service) {
    return null;
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        style={styles.overlay}
      >
        <View
          accessibilityViewIsModal
          style={styles.modal}
        >
          {/* ==================================================
              EMERGENCY IMAGE

              The image already contains:
              - Emergency artwork
              - SOS icon
              - Title
              - Description
              - Close icon
              - Call Now button
          ================================================== */}

          <Image
            source={service.image}
            style={styles.image}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel={`${service.title} emergency service`}
          />

          {/* ==================================================
              CLOSE HOTSPOT
          ================================================== */}

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close emergency service"
            accessibilityHint="Closes this emergency service window"
            hitSlop={8}
            style={({ pressed }) => [
              styles.closeHotspot,

              pressed
                ? styles.hotspotPressed
                : null,
            ]}
          />

          {/* ==================================================
              CONTACT WORKERS HOTSPOT
          ================================================== */}

          <Pressable
            onPress={handleCall}
            accessibilityRole="button"
            accessibilityLabel={`Contact workers for ${service.title}`}
            accessibilityHint="Opens the contact workers screen"
            style={({ pressed }) => [
              styles.callHotspot,

              pressed
                ? styles.hotspotPressed
                : null,
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

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       OVERLAY
    ======================================================== */

    overlay: {
      flex: 1,

      alignItems: "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingVertical:
        FixxamTokens.spacing.lg,

      backgroundColor:
        Colors.overlayStrong,
    },

    /* ========================================================
       MODAL
    ======================================================== */

    modal: {
      width: "100%",

      maxWidth: 430,

      aspectRatio: 2 / 3,

      position: "relative",

      overflow: "hidden",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       IMAGE
    ======================================================== */

    image: {
      width: "100%",

      height: "100%",
    },

    /* ========================================================
       CLOSE HOTSPOT
    ======================================================== */

    closeHotspot: {
      position: "absolute",

      top: 0,

      right: 0,

      width: "18%",

      height: "14%",

      zIndex: 20,

      backgroundColor:
        "transparent",
    },

    /* ========================================================
       CALL HOTSPOT
    ======================================================== */

    callHotspot: {
      position: "absolute",

      left: 0,

      right: 0,

      bottom: 0,

      height: "15%",

      zIndex: 20,

      backgroundColor:
        "transparent",
    },

    /* ========================================================
       PRESS
    ======================================================== */

    hotspotPressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },
  });