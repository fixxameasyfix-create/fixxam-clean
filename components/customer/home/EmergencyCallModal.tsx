import React, { memo, useCallback } from "react";

import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

import { router } from "expo-router";

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
  service: EmergencyService | null;
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
  const {
    width,
    height,
  } = useWindowDimensions();

  /* ==========================================================
     RESPONSIVE CARD SIZE
  ========================================================== */

  const horizontalMargin =
    Math.max(
      20,
      Math.min(
        32,
        width * 0.07,
      ),
    );

  const cardWidth = Math.min(
    width - horizontalMargin * 2,
    400,
  );

  /*
   * Original image ratio:
   * 1024 × 1536 = 2:3
   */
  const cardHeight =
    cardWidth * 1.5;

  /*
   * Prevent the modal from becoming
   * too tall on smaller phones.
   */
  const maxCardHeight =
    height * 0.78;

  const finalHeight =
    Math.min(
      cardHeight,
      maxCardHeight,
    );

  const finalWidth =
    finalHeight / 1.5;

  /* ==========================================================
     CONTACT WORKERS
  ========================================================== */

  const handleCall =
    useCallback(() => {
      if (!service) {
        return;
      }

      onClose();

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
      <View style={styles.overlay}>
        <View
          accessibilityViewIsModal
          style={[
            styles.cardWrapper,
            {
              width: finalWidth,
              height: finalHeight,
            },
          ]}
        >
          {/* ==================================================
              PROMOTIONAL CARD

              IMPORTANT:
              - No black background
              - No extra padding
              - No contain letterboxing
              - Preserve original 2:3 ratio
          ================================================== */}

          <Image
            source={service.image}
            style={styles.image}
            resizeMode="stretch"
            accessibilityRole="image"
            accessibilityLabel={`${service.title} emergency service`}
          />

          {/* ==================================================
              CLOSE HOTSPOT

              The X is already inside the image.
          ================================================== */}

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close emergency service"
            accessibilityHint="Closes this emergency service window"
            hitSlop={10}
            style={({ pressed }) => [
              styles.closeHotspot,
              pressed && styles.pressed,
            ]}
          />

          {/* ==================================================
              CALL NOW HOTSPOT

              The Call Now button is already inside
              the promotional image.
          ================================================== */}

          <Pressable
            onPress={handleCall}
            accessibilityRole="button"
            accessibilityLabel={`Contact workers for ${service.title}`}
            accessibilityHint="Opens the contact workers screen"
            style={({ pressed }) => [
              styles.callHotspot,
              pressed && styles.pressed,
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

      /*
       * Premium dark overlay.
       *
       * IMPORTANT:
       * This is ONLY behind the card.
       * It does not cover the image.
       */
      backgroundColor:
        "rgba(15, 23, 42, 0.48)",
    },

    /* ========================================================
       CARD WRAPPER
    ======================================================== */

    cardWrapper: {
      position: "relative",

      overflow: "hidden",

      borderRadius: 24,

      /*
       * The image itself has rounded corners,
       * but this ensures a clean modal edge.
       */
      backgroundColor:
        "transparent",

      /*
       * Premium shadow
       */
      shadowColor:
        "#000",

      shadowOffset: {
        width: 0,
        height: 12,
      },

      shadowOpacity: 0.28,

      shadowRadius: 24,

      elevation: 18,
    },

    /* ========================================================
       IMAGE
    ======================================================== */

    image: {
      width: "100%",

      height: "100%",

      /*
       * stretch is intentional because
       * the container uses the exact same
       * 2:3 ratio as the source image.
       */
      borderRadius: 24,
    },

    /* ========================================================
       CLOSE BUTTON HOTSPOT
    ======================================================== */

    closeHotspot: {
      position: "absolute",

      top: "1.5%",

      right: "1.5%",

      width: "15%",

      height: "10%",

      zIndex: 20,

      backgroundColor:
        "transparent",
    },

    /* ========================================================
       CALL BUTTON HOTSPOT
    ======================================================== */

    callHotspot: {
      position: "absolute",

      left: "5%",

      right: "5%",

      bottom: "4%",

      height: "10%",

      zIndex: 20,

      backgroundColor:
        "transparent",
    },

    /* ========================================================
       PRESS FEEDBACK
    ======================================================== */

    pressed: {
      opacity: 0.72,
    },
  });