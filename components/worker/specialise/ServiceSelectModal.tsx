import React, { memo } from "react";

import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

/* ============================================================
   TYPES
============================================================ */

export type ServiceOption = {
  id: string;
  name: string;
};

type Props = {
  visible: boolean;
  services: ServiceOption[];
  selectedId: string;
  onSelect: (item: ServiceOption) => void;
  onClose: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

function ServiceSelectModal({
  visible,
  services,
  selectedId,
  onSelect,
  onClose,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.overlay}
        onPress={onClose}
      >
        <Pressable
          style={styles.sheet}
          onPress={(event) =>
            event.stopPropagation()
          }
        >
          {/* HANDLE */}

          <View style={styles.handle} />

          {/* HEADER */}

          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons
                name="briefcase-outline"
                size={22}
                color="#FF6B00"
              />
            </View>

            <View style={styles.headerText}>
              <AppText
                weight="bold"
                style={styles.title}
              >
                Select Service
              </AppText>

              <AppText style={styles.subtitle}>
                Choose the service you provide.
              </AppText>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close service selection"
              hitSlop={10}
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="close"
                size={21}
                color="#64748B"
              />
            </Pressable>
          </View>

          {/* SERVICES */}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              styles.list
            }
          >
            {services.map((item) => {
              const selected =
                item.id === selectedId;

              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected,
                  }}
                  accessibilityLabel={`Select ${item.name}`}
                  onPress={() =>
                    onSelect(item)
                  }
                  style={({ pressed }) => [
                    styles.serviceOption,
                    selected &&
                      styles.selectedOption,
                    pressed &&
                      styles.optionPressed,
                  ]}
                >
                  <View
                    style={[
                      styles.serviceIcon,
                      selected &&
                        styles.selectedIcon,
                    ]}
                  >
                    <Ionicons
                      name="briefcase-outline"
                      size={20}
                      color={
                        selected
                          ? "#FF6B00"
                          : "#64748B"
                      }
                    />
                  </View>

                  <AppText
                    weight={
                      selected
                        ? "bold"
                        : undefined
                    }
                    style={[
                      styles.serviceName,
                      selected &&
                        styles.selectedName,
                    ]}
                  >
                    {item.name}
                  </AppText>

                  <View
                    style={
                      styles.checkContainer
                    }
                  >
                    {selected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color="#FF6B00"
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ============================================================
   MEMO
============================================================ */

ServiceSelectModal.displayName =
  "ServiceSelectModal";

export default memo(
  ServiceSelectModal,
);

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor:
      "rgba(15,23,42,0.45)",
  },

  sheet: {
    width: "100%",
    maxHeight: "75%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
  },

  handle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: 18,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 19,
    lineHeight: 24,
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    color: "#64748B",
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },

  list: {
    paddingTop: 4,
    paddingBottom: 4,
  },

  serviceOption: {
    minHeight: 58,
    borderRadius: 16,
    paddingHorizontal: 11,
    marginBottom: 7,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  selectedOption: {
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
  },

  optionPressed: {
    opacity: 0.7,
  },

  serviceIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  selectedIcon: {
    backgroundColor: "#FFEDD5",
  },

  serviceName: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#334155",
  },

  selectedName: {
    color: "#FF6B00",
  },

  checkContainer: {
    width: 28,
    alignItems: "flex-end",
  },

  closePressed: {
    opacity: 0.7,
  },

  pressed: {
    opacity: 0.7,
  },
});