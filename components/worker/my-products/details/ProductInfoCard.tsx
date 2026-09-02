import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

type Product = {

  name: string;

  category: string;

  price: number;

  stock: number;

  description: string;

  delivery?: boolean;

  featured?: boolean;

  condition?: "new" | "used";

};

type Props = {

  product: Product;

};

function InfoRow({

  icon,

  label,

  value,

}: {

  icon: keyof typeof Ionicons.glyphMap;

  label: string;

  value: string;

}) {

  return (

    <View style={styles.row}>

      <View style={styles.left}>

        <Ionicons
          name={icon}
          size={18}
          color="#64748B"
        />

        <AppText
          style={styles.label}
        >
          {label}
        </AppText>

      </View>

      <AppText
        weight="bold"
        style={styles.value}
      >
        {value}
      </AppText>

    </View>

  );

}

export default function ProductInfoCard({

  product,

}: Props) {

  return (

    <View style={styles.card}>

      <AppText
        weight="bold"
        style={styles.name}
      >
        {product.name}
      </AppText>

      <AppText
        style={styles.category}
      >
        {product.category}
      </AppText>

      <AppText
        weight="bold"
        style={styles.price}
      >
        ₦{Number(
          product.price,
        ).toLocaleString()}
      </AppText>

      <View style={styles.divider} />

      <InfoRow
        icon="cube-outline"
        label="Stock"
        value={`${product.stock}`}
      />

      <InfoRow
        icon="car-outline"
        label="Delivery"
        value={
          product.delivery
            ? "Available"
            : "Not Available"
        }
      />

      <InfoRow
        icon="pricetag-outline"
        label="Condition"
        value={
          product.condition ??
          "New"
        }
      />

      <InfoRow
        icon="star-outline"
        label="Featured"
        value={
          product.featured
            ? "Yes"
            : "No"
        }
      />

      <View style={styles.divider} />

      <AppText
        weight="bold"
        style={styles.descriptionTitle}
      >
        Description
      </AppText>

      <AppText
        style={styles.description}
      >
        {product.description ||
          "No description provided."}
      </AppText>

    </View>

  );

}

const styles =
  StyleSheet.create({

    card: {

      backgroundColor:
        "#FFFFFF",

      borderRadius: 24,

      padding: 20,

      shadowColor: "#000",

      shadowOpacity: 0.05,

      shadowRadius: 10,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 4,

    },

    name: {

      fontSize: 24,

      color: "#0F172A",

    },

    category: {

      marginTop: 4,

      color: "#64748B",

      fontSize: 15,

    },

    price: {

      marginTop: 18,

      fontSize: 32,

      color: "#FF6B00",

    },

    divider: {

      height: 1,

      backgroundColor:
        "#F1F5F9",

      marginVertical: 18,

    },

    row: {

      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems: "center",

      marginBottom: 16,

    },

    left: {

      flexDirection: "row",

      alignItems: "center",

    },

    label: {

      marginLeft: 10,

      color: "#64748B",

    },

    value: {

      color: "#0F172A",

    },

    descriptionTitle: {

      fontSize: 17,

      marginBottom: 10,

    },

    description: {

      color: "#475569",

      lineHeight: 22,

    },

});