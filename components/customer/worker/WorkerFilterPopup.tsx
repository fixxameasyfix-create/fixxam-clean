import React, { useEffect, useState } from "react";

import {
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";

type Filters = {
  onlineOnly: boolean;
  verifiedOnly: boolean;
};

type Props = {
  visible: boolean;
  filters: Filters;
  onClose: () => void;
  onApply: (filters: Filters) => void;
};

export default function WorkerFilterPopup({
  visible,
  filters,
  onClose,
  onApply,
}: Props) {
  const [onlineOnly, setOnlineOnly] =
    useState(filters.onlineOnly);

  const [verifiedOnly, setVerifiedOnly] =
    useState(filters.verifiedOnly);

  useEffect(() => {
    setOnlineOnly(filters.onlineOnly);
    setVerifiedOnly(filters.verifiedOnly);
  }, [filters]);

  const handleReset = () => {
    setOnlineOnly(false);
    setVerifiedOnly(false);
  };

  const handleApply = () => {
    onApply({
      onlineOnly,
      verifiedOnly,
    });
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.overlay}
        onPress={onClose}
      >
        <Pressable
          style={styles.popup}
          onPress={(event) => event.stopPropagation()}
        >
          {/* HEADER */}

          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons
                name="options-outline"
                size={17}
                color="#2563EB"
              />
            </View>

            <AppText
              weight="bold"
              style={styles.title}
            >
              Filters
            </AppText>

            <Pressable
              onPress={onClose}
              hitSlop={8}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close filters"
            >
              <Ionicons
                name="close"
                size={17}
                color="#64748B"
              />
            </Pressable>
          </View>

          {/* ONLINE */}

          <View style={styles.row}>
            <View style={styles.labelContainer}>
              <AppText
                weight="bold"
                style={styles.label}
              >
                Online Workers
              </AppText>

              <AppText style={styles.description}>
                Show workers currently online
              </AppText>
            </View>

            <Switch
              value={onlineOnly}
              onValueChange={setOnlineOnly}
              accessibilityLabel="Online workers filter"
            />
          </View>

          {/* VERIFIED */}

          <View style={styles.row}>
            <View style={styles.labelContainer}>
              <AppText
                weight="bold"
                style={styles.label}
              >
                Verified Workers
              </AppText>

              <AppText style={styles.description}>
                Show verified workers only
              </AppText>
            </View>

            <Switch
              value={verifiedOnly}
              onValueChange={setVerifiedOnly}
              accessibilityLabel="Verified workers filter"
            />
          </View>

          {/* BUTTONS */}

          <View style={styles.buttons}>
            <View style={styles.buttonWrapper}>
              <AppButton
                title="Reset"
                onPress={handleReset}
              />
            </View>

            <View style={styles.buttonWrapper}>
              <AppButton
                title="Apply"
                onPress={handleApply}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.16)",
    justifyContent: "flex-start",
    paddingHorizontal: 12,
    paddingTop: 88,
  },

  popup: {
    width: "100%",
    padding: 13,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",

    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 8,
  },

  header: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    flex: 1,
    marginLeft: 7,
    fontSize: 15,
    lineHeight: 19,
    color: "#0F172A",
  },

  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },

  row: {
    minHeight: 52,
    marginTop: 5,
    paddingVertical: 7,
    paddingHorizontal: 3,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  labelContainer: {
    flex: 1,
    paddingRight: 8,
  },

  label: {
    fontSize: 12,
    lineHeight: 16,
    color: "#0F172A",
  },

  description: {
    marginTop: 1,
    fontSize: 9.5,
    lineHeight: 13,
    color: "#94A3B8",
  },

  buttons: {
    flexDirection: "row",
    gap: 7,
    marginTop: 11,
  },

  buttonWrapper: {
    flex: 1,
  },
});