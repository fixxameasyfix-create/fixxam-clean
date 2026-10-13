import React, {
  memo,
} from "react";

import {
  Modal,
  StyleSheet,
  View,
} from "react-native";

import {
  AppButton,
  AppCard,
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

type Props = {
  visible: boolean;

  onClose: () => void;

  onSignIn: () => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function RequestServiceSignInModal({
  visible,
  onClose,
  onSignIn,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        style={
          styles.overlay
        }
      >
        <AppCard
          role="customer"
          variant="elevated"
          style={
            styles.card
          }
        >
          {/* ==================================================
              ICON
          ================================================== */}

          <View
            style={
              styles.iconBox
            }
          >
            <AppIcon
              name="profile"
              role="customer"
              size="lg"
              state="active"
            />
          </View>

          {/* ==================================================
              CONTENT
          ================================================== */}

          <AppText
            variant="heading2"
            weight="bold"
            style={
              styles.title
            }
          >
            Sign in required
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.message
            }
          >
            Please sign in before sending your
            service request.
          </AppText>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <View
            style={
              styles.actions
            }
          >
            <AppButton
              title="Cancel"
              role="customer"
              variant="outline"
              onPress={
                onClose
              }
              style={
                styles.button
              }
            />

            <AppButton
              title="Sign In"
              role="customer"
              rightIconName="next"
              onPress={
                onSignIn
              }
              style={
                styles.button
              }
            />
          </View>
        </AppCard>
      </View>
    </Modal>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    overlay: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      backgroundColor:
        Colors.overlayStrong,
    },

    card: {
      width:
        "100%",

      maxWidth:
        390,

      padding:
        FixxamTokens.spacing.xl,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,
    },

    iconBox: {
      width:
        56,

      height:
        56,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginBottom:
        FixxamTokens.spacing.lg,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    message: {
      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight:
        21,

      color:
        Colors.textSecondary,
    },

    actions: {
      flexDirection:
        "row",

      gap:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.xl,
    },

    button: {
      flex:
        1,
    },
  });

export default memo(
  RequestServiceSignInModal,
);