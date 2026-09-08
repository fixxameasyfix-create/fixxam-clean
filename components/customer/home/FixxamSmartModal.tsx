import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
} from "react-native";

import {
  Modal,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

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

/* ============================================================
   CONSTANTS
============================================================ */

const MAX_CARD_WIDTH = 350;

const ANCHOR_GAP = 10;

const ARROW_SIZE = 14;

const INITIAL_SCALE = 0.88;

/* ============================================================
   HELPERS
============================================================ */

function clamp(
  value: number,
  min: number,
  max: number,
): number {
  return Math.min(
    Math.max(value, min),
    max,
  );
}

/* ============================================================
   COMPONENT
============================================================ */

export default function FixxamSmartModal({
  visible,
  anchor,
  onClose,
}: FixxamSmartModalProps) {
  const {
    width: screenWidth,
    height: screenHeight,
  } = useWindowDimensions();

  const insets =
    useSafeAreaInsets();

  const [
    cardHeight,
    setCardHeight,
  ] = useState(0);

  const opacity =
    useRef(
      new Animated.Value(0),
    ).current;

  const scale =
    useRef(
      new Animated.Value(
        INITIAL_SCALE,
      ),
    ).current;

  /* ==========================================================
     ANIMATION
  ========================================================== */

  useEffect(() => {
    if (!visible) {
      opacity.setValue(0);

      scale.setValue(
        INITIAL_SCALE,
      );

      return;
    }

    opacity.setValue(0);

    scale.setValue(
      INITIAL_SCALE,
    );

    const animation =
      Animated.parallel([
        Animated.spring(
          scale,
          {
            toValue: 1,
            useNativeDriver: true,
            damping: 18,
            stiffness: 260,
            mass: 0.7,
          },
        ),

        Animated.timing(
          opacity,
          {
            toValue: 1,
            duration:
              FixxamTokens.motion.fast,
            useNativeDriver: true,
          },
        ),
      ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [
    visible,
    opacity,
    scale,
  ]);

  /* ==========================================================
     CARD SIZE
  ========================================================== */

  const cardWidth =
    useMemo(
      () =>
        Math.min(
          screenWidth -
            FixxamTokens.spacing.lg *
              2,

          MAX_CARD_WIDTH,
        ),
      [screenWidth],
    );

  /* ==========================================================
     POSITION
  ========================================================== */

  const position =
    useMemo(() => {
      const edgePadding =
        FixxamTokens.spacing.lg;

      const safeTop =
        insets.top +
        edgePadding;

      const safeBottom =
        screenHeight -
        insets.bottom -
        edgePadding;

      const maxLeft =
        Math.max(
          edgePadding,

          screenWidth -
            cardWidth -
            edgePadding,
        );

      const left =
        clamp(
          anchor.x +
            anchor.width -
            cardWidth,

          edgePadding,

          maxLeft,
        );

      const spaceBelow =
        safeBottom -
        (anchor.y +
          anchor.height);

      const spaceAbove =
        anchor.y -
        safeTop;

      /*
       * Prefer below the anchor.
       *
       * If the measured card cannot fit
       * below and there is more room
       * above, flip the popover upward.
       */
      const showAbove =
        cardHeight > 0 &&
        spaceBelow <
          cardHeight +
            ANCHOR_GAP &&
        spaceAbove >
          spaceBelow;

      const preferredTop =
        showAbove
          ? anchor.y -
            cardHeight -
            ANCHOR_GAP
          : anchor.y +
            anchor.height +
            ANCHOR_GAP;

      const maxTop =
        cardHeight > 0
          ? Math.max(
              safeTop,

              safeBottom -
                cardHeight,
            )
          : safeBottom;

      const top =
        clamp(
          preferredTop,

          safeTop,

          maxTop,
        );

      const anchorCenter =
        anchor.x +
        anchor.width / 2;

      const arrowLeft =
        clamp(
          anchorCenter -
            left -
            ARROW_SIZE / 2,

          FixxamTokens.spacing.md,

          cardWidth -
            ARROW_SIZE -
            FixxamTokens.spacing.md,
        );

      return {
        left,
        top,
        arrowLeft,
        showAbove,
      };
    }, [
      anchor.height,
      anchor.width,
      anchor.x,
      anchor.y,
      cardHeight,
      cardWidth,
      insets.bottom,
      insets.top,
      screenHeight,
      screenWidth,
    ]);

  /* ==========================================================
     MEASURE CARD
  ========================================================== */

  const handleCardLayout = (
    event: LayoutChangeEvent,
  ) => {
    const nextHeight =
      event.nativeEvent.layout
        .height;

    if (
      Math.abs(
        nextHeight -
          cardHeight,
      ) > 1
    ) {
      setCardHeight(
        nextHeight,
      );
    }
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        style={styles.overlay}
      >
        {/* ==================================================
            BACKDROP
        ================================================== */}

        <Pressable
          style={
            StyleSheet.absoluteFill
          }
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close Fixxam Smart"
        />

        {/* ==================================================
            SMART CARD
        ================================================== */}

        <Animated.View
          accessibilityViewIsModal
          onLayout={
            handleCardLayout
          }
          style={[
            styles.card,

            {
              width:
                cardWidth,

              left:
                position.left,

              top:
                position.top,

              opacity,

              transform: [
                {
                  scale,
                },
              ],
            },
          ]}
        >
          {/* =================================================
              POINTER ARROW
          ================================================= */}

          <View
            pointerEvents="none"
            style={[
              styles.arrow,

              position.showAbove
                ? styles.arrowBottom
                : styles.arrowTop,

              {
                left:
                  position.arrowLeft,
              },
            ]}
          />

          {/* =================================================
              HEADER
          ================================================= */}

          <View
            style={styles.header}
          >
            <View
              style={
                styles.smartIconBox
              }
            >
              <MaterialCommunityIcons
                name="lightbulb-on-outline"
                size={27}
                color={
                  CustomerColors.primary
                }
              />
            </View>

            <View
              style={
                styles.headerContent
              }
            >
              <AppText
                variant="bodyLarge"
                weight="bold"
                style={styles.title}
              >
                Fixxam Smart
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.subtitle
                }
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

                pressed
                  ? styles.closePressed
                  : null,
              ]}
            >
              <MaterialCommunityIcons
                name="close"
                size={19}
                color={
                  Colors.textSecondary
                }
              />
            </Pressable>
          </View>

          {/* =================================================
              CONTENT
          ================================================= */}

          <View
            style={styles.content}
          >
            <AppText
              variant="body"
              tone="secondary"
              style={styles.paragraph}
            >
              Fixxam Smart helps you find the right service and trusted professional for your needs.
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={styles.paragraph}
            >
              Tell us what you need, and Fixxam makes it easier to discover the right help, compare available options, and get your job started with confidence.
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={[
                styles.paragraph,
                styles.lastParagraph,
              ]}
            >
              From small repairs to bigger projects, Fixxam is here to make getting help simple, safe, and stress-free.
            </AppText>
          </View>

          {/* =================================================
              FOOTER
          ================================================= */}

          <View
            style={styles.footer}
          >
            <View
              style={
                styles.footerIcon
              }
            >
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={17}
                color={
                  Colors.success
                }
              />
            </View>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.footerText
              }
            >
              Smart help from Fixxam, whenever you need it.
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
    /* ========================================================
       OVERLAY
    ======================================================== */

    overlay: {
      flex: 1,

      backgroundColor:
        Colors.overlayLight,
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      position: "absolute",

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       ARROW
    ======================================================== */

    arrow: {
      position: "absolute",

      width:
        ARROW_SIZE,

      height:
        ARROW_SIZE,

      backgroundColor:
        Colors.surface,

      transform: [
        {
          rotate: "45deg",
        },
      ],
    },

    arrowTop: {
      top:
        -(ARROW_SIZE / 2),

      borderTopWidth: 1,

      borderLeftWidth: 1,

      borderColor:
        Colors.border,
    },

    arrowBottom: {
      bottom:
        -(ARROW_SIZE / 2),

      borderRightWidth: 1,

      borderBottomWidth: 1,

      borderColor:
        Colors.border,
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

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    headerContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 15,
    },

    closeButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      marginLeft:
        FixxamTokens.spacing.xs,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    closePressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      marginTop:
        FixxamTokens.spacing.lg,
    },

    paragraph: {
      marginBottom:
        FixxamTokens.spacing.sm,

      lineHeight: 19,
    },

    lastParagraph: {
      marginBottom: 0,
    },

    /* ========================================================
       FOOTER
    ======================================================== */

    footer: {
      marginTop:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      borderTopWidth: 1,

      borderTopColor:
        Colors.divider,
    },

    footerIcon: {
      width: 30,

      height: 30,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.successSoft,
    },

    footerText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      lineHeight: 15,
    },
  });