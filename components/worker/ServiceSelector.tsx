import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  AppButton,
  AppText,
} from "@/components/ui";

import {
  getServices,
  ServiceItem,
} from "@/constants/serviceLoader";

type Props = {
  subcategory: string;
  selectedServices: string[];
  setSelectedServices: React.Dispatch<
    React.SetStateAction<string[]>
  >;
};

export default function ServiceSelector({
  subcategory,
  selectedServices,
  setSelectedServices,
}: Props) {
  const [visible, setVisible] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const availableServices =
    useMemo<ServiceItem[]>(() => {
      if (!subcategory) {
        return [];
      }

      try {
        return getServices(
          subcategory
        );
      } catch {
        return [];
      }
    }, [subcategory]);

  const filteredServices =
    availableServices.filter(
      (item) =>
        item.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  const toggleService = (
    serviceId: string
  ) => {
    if (
      selectedServices.includes(
        serviceId
      )
    ) {
      setSelectedServices(
        selectedServices.filter(
          (id) => id !== serviceId
        )
      );

      return;
    }

    if (
      selectedServices.length >= 4
    ) {
      return;
    }

    setSelectedServices([
      ...selectedServices,
      serviceId,
    ]);
  };

  return (
    <>
      <AppText
        weight="semibold"
        style={styles.label}
      >
        Services (Max 4)
      </AppText>

      <Pressable
        style={styles.selector}
        onPress={() =>
          setVisible(true)
        }
      >
        <AppText
          color={
            selectedServices.length >
            0
              ? "#111827"
              : "#9CA3AF"
          }
        >
          {selectedServices.length >
          0
            ? `${selectedServices.length} Services Selected`
            : "Select Services"}
        </AppText>

        <AppText
          style={styles.arrow}
        >
          ▼
        </AppText>
      </Pressable>

      <AppText
        style={styles.counter}
      >
        Selected:
        {" "}
        {selectedServices.length}
        /4
      </AppText>

      {selectedServices.length >
        0 && (
        <View
          style={
            styles.selectedContainer
          }
        >
          {selectedServices.map(
            (serviceId) => {
              const service =
                availableServices.find(
                  (s) =>
                    s.id ===
                    serviceId
                );

              if (!service)
                return null;

              return (
                <Pressable
                  key={serviceId}
                  style={
                    styles.selectedChip
                  }
                  onPress={() =>
                    toggleService(
                      serviceId
                    )
                  }
                >
                  <AppText
                    style={
                      styles.selectedText
                    }
                  >
                    {service.name} ✕
                  </AppText>
                </Pressable>
              );
            }
          )}
        </View>
      )}

      <Modal
        visible={visible}
        animationType="slide"
        transparent
      >
        <View
          style={
            styles.overlay
          }
        >
          <View
            style={styles.modal}
          >
            <AppText
              weight="bold"
              style={
                styles.modalTitle
              }
            >
              Select Services
            </AppText>

            <TextInput
              placeholder="Search services..."
              value={search}
              onChangeText={
                setSearch
              }
              style={
                styles.searchInput
              }
            />

            <AppText
              style={
                styles.counter
              }
            >
              Selected:
              {" "}
              {
                selectedServices.length
              }
              /4
            </AppText>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
            >
              {filteredServices.map(
                (item) => {
                  const selected =
                    selectedServices.includes(
                      item.id
                    );

                  return (
                    <Pressable
                      key={
                        item.id
                      }
                      style={[
                        styles.serviceItem,
                        selected &&
                          styles.serviceItemSelected,
                      ]}
                      onPress={() =>
                        toggleService(
                          item.id
                        )
                      }
                    >
                      <AppText
                        style={
                          selected
                            ? styles.serviceTextSelected
                            : undefined
                        }
                      >
                        {
                          item.name
                        }
                      </AppText>
                    </Pressable>
                  );
                }
              )}
            </ScrollView>

            <AppButton
              title="Done"
              variant="worker"
              onPress={() =>
                setVisible(
                  false
                )
              }
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },

  selector: {
    height: 44,

    borderWidth: 1.2,
    borderColor: "#F97316",

    borderRadius: 12,

    paddingHorizontal: 12,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    backgroundColor: "#FFFFFF",

    marginBottom: 6,
  },

  arrow: {
    color: "#F97316",
    fontSize: 14,
    fontWeight: "700",
  },

  counter: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 6,
  },

  selectedContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },

  selectedChip: {
    backgroundColor: "#FFF7ED",

    borderWidth: 1,
    borderColor: "#F97316",

    borderRadius: 999,

    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  selectedText: {
    color: "#F97316",
    fontSize: 11,
    fontWeight: "700",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },

  modal: {
    backgroundColor: "#FFFFFF",

    padding: 16,

    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,

    maxHeight: "80%",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },

  searchInput: {
    height: 44,

    borderWidth: 1,
    borderColor: "#E5E7EB",

    borderRadius: 12,

    paddingHorizontal: 12,

    backgroundColor: "#F8FAFC",

    fontSize: 14,

    marginBottom: 12,
  },

  serviceItem: {
    borderWidth: 1,
    borderColor: "#E5E7EB",

    borderRadius: 12,

    paddingVertical: 12,
    paddingHorizontal: 14,

    marginBottom: 8,

    backgroundColor: "#FFFFFF",
  },

  serviceItemSelected: {
    backgroundColor: "#F97316",
    borderColor: "#F97316",
  },

  serviceTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
});