import React from "react";

import {
  Alert,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import AppIcon from "@/components/common/AppIcon";

import {
  AppText,
} from "@/components/ui";

export type WorkerService = {
  id: string;
  name: string;
  price?: number | string;
  icon?: string;
  color?: string;
  backgroundColor?: string;
};

type Props = {
  services: WorkerService[];
  selectedServices: string[];
  onToggle: (serviceId: string) => void;
};

export default function WorkerServices({
  services,
  selectedServices,
  onToggle,
}: Props) {
  const toggle = (id: string) => {
    const isSelected =
      selectedServices.includes(id);

    if (
      !isSelected &&
      selectedServices.length >= 4
    ) {
      Alert.alert(
        "Maximum Reached",
        "You can select up to 4 services.",
      );

      return;
    }

    onToggle(id);
  };

  return (
    <View style={styles.container}>
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View style={styles.header}>
        <AppText
          weight="bold"
          style={styles.heading}
        >
          Services
        </AppText>

        <AppText style={styles.subtitle}>
          Choose up to 4 services
        </AppText>
      </View>

      {/* ======================================================
          SERVICES
      ====================================================== */}

      {services.length > 0 ? (
        services.map((service) => {
          const selected =
            selectedServices.includes(
              service.id,
            );

          return (
            <Pressable
              key={service.id}
              onPress={() =>
                toggle(service.id)
              }
              style={({ pressed }) => [
                styles.card,
                selected &&
                  styles.selectedCard,
                pressed &&
                  styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{
                selected,
              }}
              accessibilityLabel={
                selected
                  ? `${service.name}, selected`
                  : `Select ${service.name}`
              }
            >
              <View style={styles.left}>
                <AppIcon
                  icon={service.icon}
                  color={
                    selected
                      ? "#FFFFFF"
                      : service.color
                  }
                  backgroundColor={
                    selected
                      ? "rgba(255,255,255,0.16)"
                      : service.backgroundColor
                  }
                  containerSize={34}
                  size={16}
                />

                <AppText
                  weight="bold"
                  numberOfLines={2}
                  style={[
                    styles.name,
                    selected &&
                      styles.selectedName,
                  ]}
                >
                  {service.name}
                </AppText>
              </View>

              <Ionicons
                name={
                  selected
                    ? "checkmark-circle"
                    : "ellipse-outline"
                }
                size={21}
                color={
                  selected
                    ? "#FFFFFF"
                    : "#CBD5E1"
                }
              />
            </Pressable>
          );
        })
      ) : (
        <View style={styles.emptyCard}>
          <Ionicons
            name="briefcase-outline"
            size={24}
            color="#94A3B8"
          />

          <AppText
            weight="bold"
            style={styles.emptyTitle}
          >
            No services available
          </AppText>

          <AppText style={styles.emptyText}>
            This worker has not added any
            services yet.
          </AppText>
        </View>
      )}
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },

  header: {
    marginBottom: 8,
  },

  heading: {
    fontSize: 16,
    lineHeight: 21,
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 17,
    color: "#64748B",
  },

  card: {
    minHeight: 56,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: "#FFFFFF",

    borderRadius: 16,

    paddingHorizontal: 12,
    paddingVertical: 8,

    marginBottom: 8,

    borderWidth: 1,
    borderColor: "#EEF2F7",

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  selectedCard: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  pressed: {
    opacity: 0.9,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  left: {
    flex: 1,

    flexDirection: "row",
    alignItems: "center",

    marginRight: 10,
  },

  name: {
    flex: 1,

    marginLeft: 10,

    fontSize: 14,
    lineHeight: 20,

    color: "#0F172A",
  },

  selectedName: {
    color: "#FFFFFF",
  },

  emptyCard: {
    minHeight: 120,

    borderRadius: 16,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#EEF2F7",

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 20,
    paddingVertical: 20,

    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  emptyTitle: {
    marginTop: 8,

    fontSize: 14,

    color: "#0F172A",
  },

  emptyText: {
    marginTop: 4,

    fontSize: 12,
    lineHeight: 18,

    color: "#64748B",

    textAlign: "center",
  },
});