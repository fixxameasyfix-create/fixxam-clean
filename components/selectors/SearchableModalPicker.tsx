import React, { useMemo, useState } from "react";
import {
  Modal,
  View,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui";

type Props = {
  label: string;
  placeholder: string;
  value: string;
  data: string[];
  onSelect: (value: string) => void;
};

export default function SearchableModalPicker({
  label,
  placeholder,
  value,
  data,
  onSelect,
}: Props) {
  const [visible, setVisible] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const filteredData =
    useMemo(() => {
      return data.filter((item) =>
        item
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
      );
    }, [data, search]);

  return (
    <>
      <AppText
        weight="semibold"
        style={styles.label}
      >
        {label}
      </AppText>

      <Pressable
        style={styles.selector}
        onPress={() =>
          setVisible(true)
        }
      >
        <AppText
          color={
            value
              ? "#111827"
              : "#9CA3AF"
          }
        >
          {value || placeholder}
        </AppText>

        <Ionicons
          name="chevron-down"
          size={16}
          color="#F97316"
        />
      </Pressable>

      <Modal
        visible={visible}
        animationType="slide"
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <AppText
              size="lg"
              weight="bold"
            >
              Select {label}
            </AppText>

            <Pressable
              onPress={() =>
                setVisible(false)
              }
            >
              <Ionicons
                name="close"
                size={20}
                color="#F97316"
              />
            </Pressable>
          </View>

          <TextInput
            placeholder={`Search ${label}`}
            value={search}
            onChangeText={setSearch}
            style={styles.search}
            placeholderTextColor="#94A3B8"
          />

          <FlatList
            data={filteredData}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={
              false
            }
            renderItem={({ item }) => {
              const selected =
                value === item;

              return (
                <Pressable
                  style={[
                    styles.item,
                    selected &&
                      styles.selectedItem,
                  ]}
                  onPress={() => {
                    onSelect(item);

                    setVisible(
                      false
                    );

                    setSearch("");
                  }}
                >
                  <AppText
                    style={
                      selected
                        ? styles.selectedText
                        : undefined
                    }
                  >
                    {item}
                  </AppText>

                  {selected && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color="#FFFFFF"
                    />
                  )}
                </Pressable>
              );
            }}
          />
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
    marginBottom: 4,
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

    marginBottom: 8,

    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 1,
    },

    elevation: 1,
  },

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",

    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },

  header: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 12,
  },

  search: {
    height: 44,

    borderWidth: 1.2,

    borderColor: "#F97316",

    borderRadius: 12,

    paddingHorizontal: 12,

    backgroundColor: "#FFFFFF",

    fontSize: 14,

    marginBottom: 12,
  },

  item: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    backgroundColor: "#FFFFFF",

    paddingVertical: 12,
    paddingHorizontal: 14,

    borderRadius: 12,

    marginBottom: 6,

    borderWidth: 1,

    borderColor: "#E5E7EB",
  },

  selectedItem: {
    backgroundColor: "#F97316",

    borderColor: "#F97316",
  },

  selectedText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});