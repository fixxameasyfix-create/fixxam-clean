import React from "react";

import {
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { AppText } from "@/components/ui";

type Props = {

  price: string;

  stock: string;

  onChangePrice: (
    value: string,
  ) => void;

  onChangeStock: (
    value: string,
  ) => void;

};

export default function ProductPricing({

  price,

  stock,

  onChangePrice,

  onChangeStock,

}: Props) {

  return (

    <View style={styles.container}>

      <View style={styles.row}>

        <View style={styles.column}>

          <AppText
            weight="bold"
            style={styles.label}
          >
            Price (₦)
          </AppText>

          <TextInput
            value={price}
            onChangeText={
              onChangePrice
            }
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />

        </View>

        <View style={styles.column}>

          <AppText
            weight="bold"
            style={styles.label}
          >
            Stock
          </AppText>

          <TextInput
            value={stock}
            onChangeText={
              onChangeStock
            }
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />

        </View>

      </View>

    </View>

  );

}

const styles =
  StyleSheet.create({

    container: {

      marginBottom: 24,

    },

    row: {

      flexDirection: "row",

      gap: 14,

    },

    column: {

      flex: 1,

    },

    label: {

      marginBottom: 8,

      fontSize: 15,

    },

    input: {

      height: 56,

      backgroundColor:
        "#FFFFFF",

      borderRadius: 16,

      borderWidth: 1,

      borderColor:
        "#E2E8F0",

      paddingHorizontal: 16,

      fontSize: 15,

      color: "#0F172A",

    },

  });