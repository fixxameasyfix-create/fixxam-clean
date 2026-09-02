import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

type Props = {

  customerName: string;

  serviceName: string;

  address: string;

  status: string;

  date?: string;

  amount?: number;

  onPress: () => void;

};

export default function WorkerJobCard({

  customerName,

  serviceName,

  address,

  status,

  date,

  amount,

  onPress,

}: Props) {

  return (

    <Pressable

      onPress={onPress}

      style={styles.card}

    >

      <View style={styles.icon}>

        <Ionicons

          name="construct-outline"

          size={24}

          color="#FF6B00"

        />

      </View>

      <View style={styles.content}>

        <AppText
          weight="bold"
        >
          {serviceName}
        </AppText>

        <AppText
          style={styles.customer}
        >
          {customerName}
        </AppText>

        <AppText
          style={styles.address}
        >
          {address}
        </AppText>

        <View style={styles.footer}>

          <View
            style={styles.statusBadge}
          >

            <AppText
              style={styles.statusText}
            >
              {status}
            </AppText>

          </View>

          {
            amount != null && (

              <AppText
                weight="bold"
                style={styles.amount}
              >
                ₦{amount.toLocaleString()}
              </AppText>

            )
          }

        </View>

        {
          date && (

            <AppText
              style={styles.date}
            >
              {date}
            </AppText>

          )
        }

      </View>

    </Pressable>

  );

}

const styles = StyleSheet.create({

  card: {

    flexDirection: "row",

    backgroundColor: "#FFFFFF",

    borderRadius: 22,

    padding: 16,

    marginBottom: 14,

  },

  icon: {

    width: 52,

    height: 52,

    borderRadius: 26,

    backgroundColor: "#FFF7ED",

    justifyContent: "center",

    alignItems: "center",

  },

  content: {

    flex: 1,

    marginLeft: 14,

  },

  customer: {

    marginTop: 4,

    color: "#64748B",

  },

  address: {

    marginTop: 4,

    color: "#64748B",

    fontSize: 13,

  },

  footer: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginTop: 10,

  },

  statusBadge: {

    backgroundColor: "#FFF7ED",

    paddingHorizontal: 12,

    paddingVertical: 6,

    borderRadius: 20,

  },

  statusText: {

    color: "#FF6B00",

    fontSize: 12,

    fontWeight: "700",

    textTransform: "capitalize",

  },

  amount: {

    color: "#0F172A",

    fontSize: 15,

  },

  date: {

    marginTop: 8,

    color: "#94A3B8",

    fontSize: 12,

  },

});