import React, { useMemo } from "react";

import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import AppIcon from "@/components/common/AppIcon";
import { AppText } from "@/components/ui";

export type WorkerService = {
  id: string;
  name?: string;
  price?: number;
  icon?: string;
  color?: string;
  backgroundColor?: string;
};

type Props = {
  visible: boolean;
  services: WorkerService[];
  selectedServices: string[];
  onToggle: (serviceId: string) => void;
  onClose: () => void;
  onContinue: () => void;
};

export default function WorkerServicePickerModal({
  visible,
  services,
  selectedServices,
  onToggle,
  onClose,
  onContinue,
}: Props) {
  const selectedCount = selectedServices.length;
  const canContinue = selectedCount > 0;

  const selectedTotal = useMemo(() => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(
        (item) => item.id === serviceId,
      );

      return total + Number(service?.price ?? 0);
    }, 0);
  }, [selectedServices, services]);

  const handleToggle = (serviceId: string) => {
    const alreadySelected =
      selectedServices.includes(serviceId);

    if (
      !alreadySelected &&
      selectedServices.length >= 4
    ) {
      return;
    }

    onToggle(serviceId);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* HEADER */}

          <View style={styles.header}>
            <View style={styles.headerText}>
              <AppText
                weight="bold"
                style={styles.title}
              >
                Choose Services
              </AppText>

              <AppText style={styles.subtitle}>
                Select up to 4 services
              </AppText>
            </View>

            <Pressable
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Close service selection"
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="close"
                size={17}
                color="#475569"
              />
            </Pressable>
          </View>

          {/* SERVICES */}

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={
              styles.servicesContent
            }
          >
            {services.length === 0 ? (
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="briefcase-outline"
                    size={21}
                    color="#94A3B8"
                  />
                </View>

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
            ) : (
              services.map((service) => {
                const selected =
                  selectedServices.includes(
                    service.id,
                  );

                return (
                  <Pressable
                    key={service.id}
                    onPress={() =>
                      handleToggle(service.id)
                    }
                    accessibilityRole="button"
                    accessibilityState={{
                      selected,
                    }}
                    accessibilityLabel={`${
                      service.name ||
                      "Unnamed Service"
                    } service`}
                    style={({ pressed }) => [
                      styles.serviceCard,
                      selected &&
                        styles.selectedCard,
                      pressed &&
                        styles.pressed,
                    ]}
                  >
                    <View style={styles.serviceLeft}>
                      <AppIcon
                        icon={service.icon}
                        color={service.color}
                        backgroundColor={
                          service.backgroundColor
                        }
                        containerSize={32}
                        size={14}
                      />

                      <View style={styles.serviceInfo}>
                        <AppText
                          weight="bold"
                          style={[
                            styles.serviceName,
                            selected &&
                              styles.selectedText,
                          ]}
                          numberOfLines={1}
                        >
                          {service.name ||
                            "Unnamed Service"}
                        </AppText>

                        <AppText
                          style={[
                            styles.servicePrice,
                            selected &&
                              styles.selectedPrice,
                          ]}
                        >
                          ₦
                          {Number(
                            service.price ?? 0,
                          ).toLocaleString()}
                        </AppText>
                      </View>
                    </View>

                    <Ionicons
                      name={
                        selected
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={18}
                      color={
                        selected
                          ? "#FFFFFF"
                          : "#CBD5E1"
                      }
                    />
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          {/* FOOTER */}

          <View style={styles.footer}>
            <View style={styles.summary}>
              <View>
                <AppText
                  style={styles.summaryLabel}
                >
                  Selected
                </AppText>

                <AppText
                  weight="bold"
                  style={styles.summaryCount}
                >
                  {selectedCount} / 4
                </AppText>
              </View>

              {selectedCount > 0 && (
                <View style={styles.totalBox}>
                  <AppText
                    style={styles.totalLabel}
                  >
                    Starting total
                  </AppText>

                  <AppText
                    weight="bold"
                    style={styles.total}
                  >
                    ₦
                    {selectedTotal.toLocaleString()}
                  </AppText>
                </View>
              )}
            </View>

            <Pressable
              disabled={!canContinue}
              onPress={onContinue}
              accessibilityRole="button"
              accessibilityState={{
                disabled: !canContinue,
              }}
              style={({ pressed }) => [
                styles.continueButton,
                !canContinue &&
                  styles.disabledButton,
                pressed &&
                  canContinue &&
                  styles.pressed,
              ]}
            >
              <AppText
                weight="bold"
                style={styles.continueText}
              >
                Continue
              </AppText>

              <Ionicons
                name="arrow-forward"
                size={16}
                color="#FFFFFF"
              />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },

  sheet: {
    height: "64%",

    backgroundColor: "#F8FAFC",

    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,

    overflow: "hidden",
  },

  /* HEADER */

  header: {
    minHeight: 52,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 13,
    paddingVertical: 7,

    backgroundColor: "#FFFFFF",

    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
  },

  headerText: {
    flex: 1,
    paddingRight: 8,
  },

  title: {
    fontSize: 14,
    lineHeight: 18,
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 1,
    fontSize: 9.5,
    lineHeight: 13,
    color: "#64748B",
  },

  closeButton: {
    width: 29,
    height: 29,

    borderRadius: 10,

    backgroundColor: "#F1F5F9",

    alignItems: "center",
    justifyContent: "center",
  },

  /* SERVICES */

  servicesContent: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 8,
  },

  serviceCard: {
    minHeight: 45,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: "#FFFFFF",

    borderRadius: 10,

    borderWidth: 1,
    borderColor: "#E2E8F0",

    paddingHorizontal: 8,

    marginBottom: 5,
  },

  selectedCard: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  serviceLeft: {
    flex: 1,

    flexDirection: "row",
    alignItems: "center",

    paddingRight: 6,
  },

  serviceInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 7,
  },

  serviceName: {
    fontSize: 10.5,
    lineHeight: 14,
    color: "#0F172A",
  },

  servicePrice: {
    marginTop: 0,
    fontSize: 9,
    lineHeight: 12,
    color: "#64748B",
  },

  selectedText: {
    color: "#FFFFFF",
  },

  selectedPrice: {
    color: "#DBEAFE",
  },

  /* EMPTY */

  empty: {
    alignItems: "center",
    justifyContent: "center",

    paddingVertical: 24,
    paddingHorizontal: 15,

    backgroundColor: "#FFFFFF",

    borderRadius: 13,
  },

  emptyIcon: {
    width: 38,
    height: 38,

    borderRadius: 12,

    backgroundColor: "#F1F5F9",

    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 7,
    fontSize: 11.5,
    lineHeight: 15,
    color: "#0F172A",
  },

  emptyText: {
    marginTop: 2,
    fontSize: 9.5,
    lineHeight: 14,
    color: "#64748B",
    textAlign: "center",
  },

  /* FOOTER */

  footer: {
    paddingHorizontal: 10,
    paddingTop: 7,
    paddingBottom: 9,

    backgroundColor: "#FFFFFF",

    borderTopWidth: 1,
    borderTopColor: "#EEF2F7",
  },

  summary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 6,
  },

  summaryLabel: {
    fontSize: 9,
    lineHeight: 12,
    color: "#64748B",
  },

  summaryCount: {
    marginTop: 0,
    fontSize: 11.5,
    lineHeight: 15,
    color: "#0F172A",
  },

  totalBox: {
    alignItems: "flex-end",
  },

  totalLabel: {
    fontSize: 8,
    lineHeight: 11,
    color: "#64748B",
  },

  total: {
    marginTop: 0,
    fontSize: 12,
    lineHeight: 16,
    color: "#2563EB",
  },

  continueButton: {
    height: 38,

    borderRadius: 10,

    backgroundColor: "#2563EB",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 5,
  },

  continueText: {
    fontSize: 10.5,
    lineHeight: 14,
    color: "#FFFFFF",
  },

  disabledButton: {
    backgroundColor: "#CBD5E1",
  },

  pressed: {
    opacity: 0.75,

    transform: [
      {
        scale: 0.98,
      },
    ],
  },
});