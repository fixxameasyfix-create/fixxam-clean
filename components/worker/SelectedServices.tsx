import React from "react";
import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

import {
  ServiceItem,
} from "@/constants/serviceLoader";

type Props = {
  selectedServices: string[];
  availableServices: ServiceItem[];
  onRemove: (
    serviceId: string,
  ) => void;
};

export default function SelectedServices({
  selectedServices,
  availableServices,
  onRemove,
}: Props) {
  if (
    selectedServices.length === 0
  ) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <View>
          <AppText
            weight="semibold"
            style={styles.title}
          >
            Selected services
          </AppText>

          <AppText style={styles.subtitle}>
            Services you offer to customers
          </AppText>
        </View>

        <View style={styles.counterBadge}>
          <AppText
            weight="bold"
            style={styles.counterText}
          >
            {selectedServices.length}/4
          </AppText>
        </View>
      </View>

      {/* SERVICES */}

      <View style={styles.chipsContainer}>
        {selectedServices.map(
          (serviceId) => {
            const service =
              availableServices.find(
                (item) =>
                  item.id === serviceId,
              );

            if (!service) {
              return null;
            }

            return (
              <View
                key={serviceId}
                style={styles.chip}
              >
                <View
                  style={
                    styles.serviceIcon
                  }
                >
                  <Ionicons
                    name="checkmark"
                    size={13}
                    color="#FF6B00"
                  />
                </View>

                <AppText
                  weight="semibold"
                  numberOfLines={1}
                  style={styles.chipText}
                >
                  {service.name}
                </AppText>

                <Pressable
                  onPress={() =>
                    onRemove(
                      serviceId,
                    )
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${service.name}`}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.removeButton,
                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="close"
                    size={14}
                    color="#64748B"
                  />
                </Pressable>
              </View>
            );
          },
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E8EDF3",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginBottom: 10,
  },

  title: {
    fontSize: 13,
    lineHeight: 18,
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 10.5,
    lineHeight: 16,
    color: "#64748B",
  },

  counterBadge: {
    minWidth: 38,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 9,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
  },

  counterText: {
    fontSize: 10.5,
    color: "#EA580C",
  },

  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

  chip: {
    maxWidth: "100%",
    minHeight: 34,
    paddingLeft: 7,
    paddingRight: 5,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

  serviceIcon: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },

  chipText: {
    maxWidth: 150,
    fontSize: 10.5,
    color: "#334155",
  },

  removeButton: {
    width: 26,
    height: 26,
    marginLeft: 4,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },

  pressed: {
    opacity: 0.6,
    transform: [
      {
        scale: 0.94,
      },
    ],
  },
});