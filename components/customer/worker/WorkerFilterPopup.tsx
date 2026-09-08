import React, {
  memo,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  View,
} from "react-native";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  AppButton,
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Filters = {
  onlineOnly: boolean;

  verifiedOnly: boolean;
};

type Props = {
  visible: boolean;

  filters: Filters;

  onClose: () => void;

  onApply: (
    filters: Filters,
  ) => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerFilterPopup({
  visible,
  filters,
  onClose,
  onApply,
}: Props) {
  const insets =
    useSafeAreaInsets();

  const [
    onlineOnly,
    setOnlineOnly,
  ] =
    useState(
      filters.onlineOnly,
    );

  const [
    verifiedOnly,
    setVerifiedOnly,
  ] =
    useState(
      filters.verifiedOnly,
    );

  /* ============================================================
     SYNC FILTERS
  ============================================================ */

  useEffect(() => {
    setOnlineOnly(
      filters.onlineOnly,
    );

    setVerifiedOnly(
      filters.verifiedOnly,
    );
  }, [
    filters.onlineOnly,
    filters.verifiedOnly,
  ]);

  /* ============================================================
     RESET
  ============================================================ */

  const handleReset =
    useCallback(() => {
      setOnlineOnly(
        false,
      );

      setVerifiedOnly(
        false,
      );
    }, []);

  /* ============================================================
     APPLY
  ============================================================ */

  const handleApply =
    useCallback(() => {
      onApply({
        onlineOnly,
        verifiedOnly,
      });
    }, [
      onApply,
      onlineOnly,
      verifiedOnly,
    ]);

  /* ============================================================
     UI
  ============================================================ */

  return (
    <Modal
      transparent
      visible={
        visible
      }
      animationType="fade"
      statusBarTranslucent
      onRequestClose={
        onClose
      }
    >
      {/* ======================================================
          BACKDROP
      ====================================================== */}

      <Pressable
        onPress={
          onClose
        }
        style={[
          styles.overlay,
          {
            paddingTop:
              insets.top +
              FixxamTokens.size
                .headerHeight +
              FixxamTokens.spacing.sm,
          },
        ]}
      >
        {/* ====================================================
            POPUP
        ==================================================== */}

        <Pressable
          accessibilityViewIsModal
          onPress={(
            event,
          ) => {
            event.stopPropagation();
          }}
          style={
            styles.popup
          }
        >
          {/* ==================================================
              HEADER
          ================================================== */}

          <View
            style={
              styles.header
            }
          >
            <View
              style={
                styles.headerIcon
              }
            >
              <AppIcon
                name="filter"
                role="customer"
                size="sm"
                state="active"
              />
            </View>

            <AppText
              variant="bodyLarge"
              weight="bold"
              numberOfLines={1}
              style={
                styles.title
              }
            >
              Filters
            </AppText>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close filters"
              hitSlop={8}
              onPress={
                onClose
              }
              style={({
                pressed,
              }) => [
                styles.closeButton,

                pressed
                  ? styles.pressed
                  : null,
              ]}
            >
              <AppIcon
                name="close"
                role="customer"
                size="sm"
                state="muted"
              />
            </Pressable>
          </View>

          {/* ==================================================
              ONLINE
          ================================================== */}

          <View
            style={
              styles.row
            }
          >
            <View
              style={
                styles.labelContainer
              }
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
              >
                Online Workers
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.description
                }
              >
                Show workers currently
                online
              </AppText>
            </View>

            <Switch
              value={
                onlineOnly
              }
              onValueChange={
                setOnlineOnly
              }
              accessibilityLabel="Online workers filter"
              trackColor={{
                false:
                  Colors.disabled,
                true:
                  CustomerColors.primary,
              }}
              thumbColor={
                Colors.surface
              }
              ios_backgroundColor={
                Colors.disabled
              }
            />
          </View>

          {/* ==================================================
              VERIFIED
          ================================================== */}

          <View
            style={
              styles.row
            }
          >
            <View
              style={
                styles.labelContainer
              }
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
              >
                Verified Workers
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.description
                }
              >
                Show verified workers
                only
              </AppText>
            </View>

            <Switch
              value={
                verifiedOnly
              }
              onValueChange={
                setVerifiedOnly
              }
              accessibilityLabel="Verified workers filter"
              trackColor={{
                false:
                  Colors.disabled,
                true:
                  CustomerColors.primary,
              }}
              thumbColor={
                Colors.surface
              }
              ios_backgroundColor={
                Colors.disabled
              }
            />
          </View>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <View
            style={
              styles.buttons
            }
          >
            <AppButton
              title="Reset"
              role="customer"
              variant="outline"
              onPress={
                handleReset
              }
              style={
                styles.button
              }
            />

            <AppButton
              title="Apply"
              role="customer"
              onPress={
                handleApply
              }
              style={
                styles.button
              }
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       OVERLAY
    ======================================================== */

    overlay: {
      flex: 1,

      justifyContent:
        "flex-start",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      backgroundColor:
        Colors.overlayLight,
    },

    /* ========================================================
       POPUP
    ======================================================== */

    popup: {
      width: "100%",

      maxWidth: 420,

      alignSelf:
        "center",

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
       HEADER
    ======================================================== */

    header: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    headerIcon: {
      width:
        FixxamTokens.size
          .avatarXs,

      height:
        FixxamTokens.size
          .avatarXs,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    title: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    closeButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    /* ========================================================
       FILTER ROW
    ======================================================== */

    row: {
      minHeight:
        FixxamTokens.size
          .buttonHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderBottomWidth: 1,

      borderBottomColor:
        Colors.divider,
    },

    labelContainer: {
      flex: 1,

      minWidth: 0,

      paddingRight:
        FixxamTokens.spacing.md,
    },

    description: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       ACTIONS
    ======================================================== */

    buttons: {
      flexDirection:
        "row",

      gap:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.lg,
    },

    button: {
      flex: 1,
    },

    /* ========================================================
       PRESSED
    ======================================================== */

    pressed: {
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
  });

export default memo(
  WorkerFilterPopup,
);