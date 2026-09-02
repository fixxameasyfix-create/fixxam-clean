import React from "react";

import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

import {
  PRODUCT_CATEGORIES,
} from "@/constants/productCategories";

type Props = {

  visible: boolean;

  value: string;

  onClose: () => void;

  onSelect: (
    category: string,
  ) => void;

};

export default function CategoryPicker({

  visible,

  value,

  onClose,

  onSelect,

}: Props) {

  return (

    <Modal
      visible={visible}
      animationType="slide"
      transparent
    >

      <Pressable
        style={styles.overlay}
        onPress={onClose}
      >

        <Pressable
          style={styles.sheet}
        >

          <View
            style={styles.header}
          >

            <AppText
              weight="bold"
              style={styles.title}
            >
              Select Category
            </AppText>

            <Pressable
              onPress={onClose}
            >

              <Ionicons
                name="close"
                size={24}
                color="#64748B"
              />

            </Pressable>

          </View>

          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
          >

            {PRODUCT_CATEGORIES.map(
              (category) => (

                <Pressable
                  key={category}
                  style={styles.item}
                  onPress={() => {

                    onSelect(
                      category,
                    );

                    onClose();

                  }}
                >

                  <AppText
                    style={[
                      styles.text,

                      value ===
                        category &&
                        styles.active,

                    ]}
                  >

                    {category}

                  </AppText>

                  {value ===
                    category && (

                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color="#FF6B00"
                    />

                  )}

                </Pressable>

              ),
            )}

          </ScrollView>

        </Pressable>

      </Pressable>

    </Modal>

  );

}

const styles =
  StyleSheet.create({

    overlay: {

      flex: 1,

      backgroundColor:
        "rgba(0,0,0,0.35)",

      justifyContent:
        "flex-end",

    },

    sheet: {

      backgroundColor:
        "#FFFFFF",

      borderTopLeftRadius: 28,

      borderTopRightRadius: 28,

      maxHeight: "70%",

      padding: 20,

    },

    header: {

      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      marginBottom: 18,

    },

    title: {

      fontSize: 20,

    },

    item: {

      height: 56,

      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      borderBottomWidth: 1,

      borderBottomColor:
        "#F1F5F9",

    },

    text: {

      fontSize: 16,

      color: "#0F172A",

    },

    active: {

      color: "#FF6B00",

      fontWeight: "700",

    },

  });