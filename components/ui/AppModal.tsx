import React, { memo, type ReactNode } from "react";

import {
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  type ModalProps,
} from "react-native";

import AppCard from "./AppCard";

import {
  Colors,
  FixxamTokens,
  type FixxamRole,
} from "@/theme";

export interface AppModalProps {
  visible: boolean;

  children: ReactNode;

  onClose?: () => void;

  role?: FixxamRole;

  dismissOnBackdrop?: boolean;

  animationType?: ModalProps["animationType"];

  cardStyle?: StyleProp<ViewStyle>;

  overlayStyle?: StyleProp<ViewStyle>;
}

function AppModal({
  visible,
  children,
  onClose,
  role = "customer",
  dismissOnBackdrop = true,
  animationType = "fade",
  cardStyle,
  overlayStyle,
}: AppModalProps) {
  const canDismiss =
    dismissOnBackdrop &&
    typeof onClose === "function";

  const handleBackdropPress = () => {
    if (canDismiss) {
      onClose?.();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        accessibilityRole={
          canDismiss ? "button" : undefined
        }
        accessibilityLabel={
          canDismiss
            ? "Close modal"
            : undefined
        }
        onPress={handleBackdropPress}
        style={[
          styles.overlay,
          overlayStyle,
        ]}
      >
        <Pressable
          onPress={(event) =>
            event.stopPropagation()
          }
          style={styles.cardWrapper}
        >
          <AppCard
            role={role}
            variant="elevated"
            style={[
              styles.card,
              cardStyle,
            ]}
          >
            {children}
          </AppCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      Colors.overlayMedium,

    padding:
      FixxamTokens.spacing.xl,
  },

  cardWrapper: {
    width: "100%",
    maxWidth: 420,
  },

  card: {
    width: "100%",

    borderRadius:
      FixxamTokens.radius.modal,
  },
});

export default memo(AppModal);