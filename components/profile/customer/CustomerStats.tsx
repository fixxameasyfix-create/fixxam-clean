import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppCard,
  AppText,
} from "@/components/ui";

type Props = {

  orders: number;

  saved: number;

  reviews: number;

};

export default function CustomerStats({

  orders,

  saved,

  reviews,

}: Props) {

  const stats = [

    {
      label: "Orders",
      value: orders,
    },

    {
      label: "Saved",
      value: saved,
    },

    {
      label: "Reviews",
      value: reviews,
    },

  ];

  return (

    <AppCard style={styles.card}>

      {stats.map((item) => (

        <View
          key={item.label}
          style={styles.item}
        >

          <AppText
            weight="bold"
            style={styles.value}
          >

            {item.value}

          </AppText>

          <AppText
            style={styles.label}
          >

            {item.label}

          </AppText>

        </View>

      ))}

    </AppCard>

  );

}

const styles = StyleSheet.create({

  card: {

    marginHorizontal: 16,

    marginTop: 16,

    marginBottom: 20,

    paddingVertical: 18,

    flexDirection: "row",

    justifyContent: "space-around",

    borderRadius: 18,

  },

  item: {

    alignItems: "center",

  },

  value: {

    fontSize: 22,

    color: "#0F172A",

  },

  label: {

    marginTop: 6,

    color: "#64748B",

    fontSize: 13,

  },

});