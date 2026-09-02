import React, {
  useEffect,
  useRef,
} from "react";

import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppText,
} from "@/components/ui";

interface FixxamSmartModalProps {
  visible: boolean;

  anchor: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  onClose: () => void;
}

export default function FixxamSmartModal({
  visible,
  anchor,
  onClose,
}: FixxamSmartModalProps) {
  const opacity = useRef(
    new Animated.Value(0),
  ).current;

  const scale = useRef(
    new Animated.Value(0.88),
  ).current;

  useEffect(() => {
    if (visible) {
      opacity.setValue(0);
      scale.setValue(0.88);

      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          damping: 18,
          stiffness: 260,
          mass: 0.7,
        }),

        Animated.timing(opacity, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();

      return;
    }

    opacity.setValue(0);
    scale.setValue(0.88);
  }, [
    visible,
    opacity,
    scale,
  ]);

  const screenWidth =
    Dimensions.get("window").width;

  const cardWidth = Math.min(
    screenWidth - 32,
    350,
  );

  const left = Math.max(
    16,
    Math.min(
      anchor.x +
        anchor.width -
        cardWidth,
      screenWidth -
        cardWidth -
        16,
    ),
  );

  const top =
    anchor.y +
    anchor.height +
    10;

  const arrowRight = Math.max(
    16,
    Math.min(
      anchor.x +
        anchor.width / 2 -
        left -
        7,
      cardWidth - 22,
    ),
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* BACKDROP */}

        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        {/* MODAL */}

        <Animated.View
          style={[
            styles.card,
            {
              width: cardWidth,
              left,
              top,
              opacity,
              transform: [
                {
                  scale,
                },
              ],
            },
          ]}
        >
          {/* ==================================================
              ARROW
          ================================================== */}

          <View
            style={[
              styles.arrow,
              {
                right: arrowRight,
              },
            ]}
          />

          {/* ==================================================
              HEADER
          ================================================== */}

          <View style={styles.header}>
            <View style={styles.smartIconBox}>
              <MaterialCommunityIcons
                name="lightbulb-on-outline"
                size={27}
                color="#F97316"
              />
            </View>

            <View
              style={styles.headerContent}
            >
              <AppText
                weight="bold"
                style={styles.title}
              >
                Fixxam Smart
              </AppText>

              <AppText
                style={styles.subtitle}
              >
                Your smart way to get things done.
              </AppText>
            </View>

            <Pressable
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Close Fixxam Smart"
              style={({ pressed }) => [
                styles.closeButton,
                pressed &&
                  styles.closePressed,
              ]}
            >
              <MaterialCommunityIcons
                name="close"
                size={19}
                color="#64748B"
              />
            </Pressable>
          </View>

          {/* ==================================================
              CONTENT
          ================================================== */}

          <View style={styles.content}>
            <AppText
              style={styles.paragraph}
            >
              Fixxam Smart helps you find the
              right service and trusted
              professional for your needs.
            </AppText>

            <AppText
              style={styles.paragraph}
            >
              Tell us what you need, and Fixxam
              makes it easier to discover the
              right help, compare available
              options, and get your job started
              with confidence.
            </AppText>

            <AppText
              style={[
                styles.paragraph,
                styles.lastParagraph,
              ]}
            >
              From small repairs to bigger
              projects, Fixxam is here to make
              getting help simple, safe, and
              stress-free.
            </AppText>
          </View>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <View style={styles.footer}>
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={17}
              color="#16A34A"
            />

            <AppText
              style={styles.footerText}
            >
              Smart help from Fixxam, whenever
              you need it.
            </AppText>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor:
        "rgba(15, 23, 42, 0.22)",
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      position: "absolute",

      backgroundColor: "#FFFFFF",

      borderRadius: 20,

      padding: 15,

      borderWidth: 1,
      borderColor: "#E2E8F0",

      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.16,
      shadowRadius: 18,

      elevation: 10,
    },

    /* ========================================================
       ARROW
    ======================================================== */

    arrow: {
      position: "absolute",

      top: -7,

      width: 14,
      height: 14,

      backgroundColor: "#FFFFFF",

      borderLeftWidth: 1,
      borderTopWidth: 1,
      borderColor: "#E2E8F0",

      transform: [
        {
          rotate: "45deg",
        },
      ],
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection: "row",
      alignItems: "center",
    },

    smartIconBox: {
      width: 46,
      height: 46,

      borderRadius: 14,

      backgroundColor: "#FFF7ED",

      borderWidth: 1,
      borderColor: "#FFEDD5",

      alignItems: "center",
      justifyContent: "center",
    },

    headerContent: {
      flex: 1,
      minWidth: 0,
      marginLeft: 9,
    },

    title: {
      fontSize: 16,
      lineHeight: 20,
      color: "#0F172A",
    },

    subtitle: {
      marginTop: 2,
      fontSize: 9.5,
      lineHeight: 14,
      color: "#64748B",
    },

    closeButton: {
      width: 31,
      height: 31,

      marginLeft: 7,

      borderRadius: 9,

      backgroundColor: "#F8FAFC",

      alignItems: "center",
      justifyContent: "center",
    },

    closePressed: {
      opacity: 0.65,
      transform: [
        {
          scale: 0.94,
        },
      ],
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      marginTop: 17,
    },

    paragraph: {
      marginBottom: 11,

      fontSize: 11.5,
      lineHeight: 18,

      color: "#475569",
    },

    lastParagraph: {
      marginBottom: 0,
    },

    /* ========================================================
       FOOTER
    ======================================================== */

    footer: {
      marginTop: 13,

      paddingTop: 11,

      borderTopWidth: 1,
      borderTopColor: "#F1F5F9",

      flexDirection: "row",
      alignItems: "center",
    },

    footerText: {
      flex: 1,
      marginLeft: 6,

      fontSize: 9,
      lineHeight: 14,

      color: "#64748B",
    },
  });