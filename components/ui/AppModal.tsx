import React from "react";
import {
  Modal,
  View,
  StyleSheet,
} from "react-native";

import AppCard from "./AppCard";

interface AppModalProps {
  visible: boolean;
  children: React.ReactNode;
  onClose?: () => void;
}

export default function AppModal({
  visible,
  children,
}: AppModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <AppCard style={styles.card}>
          {children}
        </AppCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    width: "100%",
    maxWidth: 420,
  },
});