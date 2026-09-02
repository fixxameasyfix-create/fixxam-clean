import React from "react";

import {
  Pressable,
  StyleSheet,
  Switch,
  View,
} from "react-native";

import { AppText } from "@/components/ui";

type Props = {

  delivery: boolean;

  featured: boolean;

  condition: "new" | "used";

  onToggleDelivery: (
    value: boolean,
  ) => void;

  onToggleFeatured: (
    value: boolean,
  ) => void;

  onChangeCondition: (
    value: "new" | "used",
  ) => void;

};

export default function ProductOptions({

  delivery,

  featured,

  condition,

  onToggleDelivery,

  onToggleFeatured,

  onChangeCondition,

}: Props) {

  return (

    <View style={styles.container}>

      <View style={styles.card}>

        <View style={styles.row}>

          <View>

            <AppText
              weight="bold"
            >
              Delivery Available
            </AppText>

            <AppText
              style={styles.subtitle}
            >
              Customers can request delivery.
            </AppText>

          </View>

          <Switch
            value={delivery}
            onValueChange={
              onToggleDelivery
            }
            trackColor={{
              false: "#CBD5E1",
              true: "#FF6B00",
            }}
          />

        </View>

      </View>

      <View style={styles.card}>

        <View style={styles.row}>

          <View>

            <AppText
              weight="bold"
            >
              Featured Product
            </AppText>

            <AppText
              style={styles.subtitle}
            >
              Highlight this product.
            </AppText>

          </View>

          <Switch
            value={featured}
            onValueChange={
              onToggleFeatured
            }
            trackColor={{
              false: "#CBD5E1",
              true: "#FF6B00",
            }}
          />

        </View>

      </View>

      <AppText
        weight="bold"
        style={styles.label}
      >
        Condition
      </AppText>

      <View style={styles.conditionRow}>

        <Pressable

          style={[
            styles.option,

            condition === "new" &&
              styles.active,

          ]}

          onPress={() =>
            onChangeCondition(
              "new",
            )
          }

        >

          <AppText

            style={[
              styles.optionText,

              condition ===
                "new" &&
                styles.activeText,

            ]}

          >
            New
          </AppText>

        </Pressable>

        <Pressable

          style={[
            styles.option,

            condition === "used" &&
              styles.active,

          ]}

          onPress={() =>
            onChangeCondition(
              "used",
            )
          }

        >

          <AppText

            style={[
              styles.optionText,

              condition ===
                "used" &&
                styles.activeText,

            ]}

          >
            Used
          </AppText>

        </Pressable>

      </View>

    </View>

  );

}

const styles = StyleSheet.create({

  container: {

    marginBottom: 24,

  },

  card: {

    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    padding: 16,

    marginBottom: 14,

    borderWidth: 1,

    borderColor: "#E2E8F0",

  },

  row: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

  },

  subtitle: {

    marginTop: 4,

    color: "#64748B",

    fontSize: 13,

  },

  label: {

    marginBottom: 10,

    fontSize: 15,

  },

  conditionRow: {

    flexDirection: "row",

    gap: 12,

  },

  option: {

    flex: 1,

    height: 52,

    borderRadius: 14,

    borderWidth: 1,

    borderColor: "#CBD5E1",

    justifyContent: "center",

    alignItems: "center",

    backgroundColor: "#FFFFFF",

  },

  active: {

    backgroundColor: "#FF6B00",

    borderColor: "#FF6B00",

  },

  optionText: {

    color: "#334155",

    fontWeight: "600",

  },

  activeText: {

    color: "#FFFFFF",

  },

});