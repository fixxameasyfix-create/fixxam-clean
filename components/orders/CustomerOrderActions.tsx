import React, {
  memo,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   CONSTANTS
============================================================== */

const CALL_COLOR =
  "#F97316";

const CALL_ICON_BACKGROUND =
  "#FB923C";

/* ==============================================================
   TYPES
============================================================== */

type CustomerOrderActionsProps = {
  onCall: () => void;

  onCancel: () => void;

  callDisabled?: boolean;

  cancelDisabled?: boolean;
};

/* ==============================================================
   COMPONENT
============================================================== */

function CustomerOrderActions({
  onCall,
  onCancel,
  callDisabled = false,
  cancelDisabled = false,
}: CustomerOrderActionsProps) {
  return (
    <View
      style={styles.container}
    >
      {/* ======================================================
          CALL
      ====================================================== */}

      <Pressable
        onPress={onCall}
        disabled={callDisabled}
        accessibilityRole="button"
        accessibilityLabel="Call worker"
        accessibilityState={{
          disabled:
            callDisabled,
        }}
        style={({
          pressed,
        }) => [
          styles.callButton,

          /*
           * Intentionally remains visually
           * orange while disabled.
           */
          pressed &&
          !callDisabled
            ? styles.pressed
            : null,
        ]}
      >
        <View
          style={styles.callIcon}
        >
          <AppIcon
            name="phone"
            size="sm"
            color={
              Colors.textInverse
            }
          />
        </View>

        <AppText
          variant="caption"
          weight="bold"
          style={
            styles.callText
          }
        >
          CALL
        </AppText>
      </Pressable>

      {/* ======================================================
          CANCEL
      ====================================================== */}

      <Pressable
        onPress={onCancel}
        disabled={
          cancelDisabled
        }
        accessibilityRole="button"
        accessibilityLabel="Cancel order"
        accessibilityState={{
          disabled:
            cancelDisabled,
        }}
        style={({
          pressed,
        }) => [
          styles.cancelButton,

          cancelDisabled
            ? styles.cancelButtonDisabled
            : null,

          pressed &&
          !cancelDisabled
            ? styles.pressed
            : null,
        ]}
      >
        <View
          style={[
            styles.cancelIcon,

            cancelDisabled
              ? styles.disabledIcon
              : null,
          ]}
        >
          <AppIcon
            name="error"
            size="sm"
            color={
              cancelDisabled
                ? Colors.textMuted
                : Colors.textInverse
            }
          />
        </View>

        <AppText
          variant="caption"
          weight="bold"
          style={[
            styles.cancelText,

            cancelDisabled
              ? styles.disabledText
              : null,
          ]}
        >
          CANCEL ORDER
        </AppText>
      </Pressable>
    </View>
  );
}

export default memo(
  CustomerOrderActions,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       CONTAINER
    ======================================================== */

    container: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      gap:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       CALL
    ======================================================== */

    callButton: {
      flex: 1,

      minHeight: 58,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CALL_COLOR,

      /*
       * Preserve existing UX:
       * disabled call remains visually strong.
       */
      opacity: 1,
    },

    callIcon: {
      width: 38,

      height: 38,

      marginRight:
        FixxamTokens.spacing.sm,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CALL_ICON_BACKGROUND,
    },

    callText: {
      letterSpacing: 0.3,

      color:
        Colors.textInverse,
    },

    /* ========================================================
       CANCEL
    ======================================================== */

    cancelButton: {
      flex: 1,

      minHeight: 58,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.error,
    },

    cancelButtonDisabled: {
      backgroundColor:
        Colors.disabledBackground,
    },

    cancelIcon: {
      width: 38,

      height: 38,

      marginRight:
        FixxamTokens.spacing.sm,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.error,
    },

    cancelText: {
      letterSpacing: 0.2,

      color:
        Colors.textInverse,
    },

    /* ========================================================
       DISABLED
    ======================================================== */

    disabledIcon: {
      backgroundColor:
        Colors.disabled,
    },

    disabledText: {
      color:
        Colors.textMuted,
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