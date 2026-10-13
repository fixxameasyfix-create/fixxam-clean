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

type Props = {
  visible: boolean;
  workerName: string;
  removing?: boolean;
  onClose: () => void;
  onUnrate: () => void;
};

function WorkerRateModal({
  visible,
  workerName,
  removing = false,
  onClose,
  onUnrate,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={
        removing
          ? undefined
          : onClose
      }
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
          <View
            style={
              styles.iconBox
            }
          >
            <AppIcon
              name="star"
              role="customer"
              size="xl"
              color={
                Colors.warning
              }
            />
          </View>

          <AppText
            variant="heading2"
            weight="bold"
            center
          >
            Rating Added
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.description
            }
          >
            You have rated{" "}
            {workerName} 3 stars.
          </AppText>

          <View
            style={
              styles.stars
            }
          >
            <AppIcon
              name="star"
              role="customer"
              size="md"
              color={
                Colors.warning
              }
            />

            <AppIcon
              name="star"
              role="customer"
              size="md"
              color={
                Colors.warning
              }
            />

            <AppIcon
              name="star"
              role="customer"
              size="md"
              color={
                Colors.warning
              }
            />
          </View>

          <AppText
            variant="caption"
            tone="secondary"
            center
            style={
              styles.hint
            }
          >
            Press Unrate if you want
            to remove your rating.
          </AppText>

          <View
            style={
              styles.actions
            }
          >
            <AppButton
              title="Close"
              role="customer"
              variant="outline"
              disabled={
                removing
              }
              onPress={
                onClose
              }
              style={
                styles.action
              }
            />

            <AppButton
              title={
                removing
                  ? "Removing..."
                  : "Unrate"
              }
              role="customer"
              disabled={
                removing
              }
              onPress={
                onUnrate
              }
              style={
                styles.action
              }
            />
          </View>
        </AppCard>
      </View>
    </Modal>
  );
}

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
        Colors.overlayMedium,
    },

    card: {
      width:
        "100%",

      maxWidth:
        380,

      alignItems:
        "center",

      padding:
        FixxamTokens.spacing.xl,
    },

    iconBox: {
      width:
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

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

    description: {
      maxWidth:
        320,

      marginTop:
        FixxamTokens.spacing.md,
    },

    stars: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      marginTop:
        FixxamTokens.spacing.lg,
    },

    hint: {
      maxWidth:
        300,

      marginTop:
        FixxamTokens.spacing.md,
    },

    actions: {
      width:
        "100%",

      flexDirection:
        "row",

      gap:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.xl,
    },

    action: {
      flex: 1,
    },
  });

export default memo(
  WorkerRateModal,
);