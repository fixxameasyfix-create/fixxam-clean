import React, { memo } from "react";

import {
  StyleSheet,
  Switch,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  value: boolean;
  available: boolean;
  urgentFee: number;
  opensAt: string;
  closesAt: string;
  onChange: (value: boolean) => void;
};

function BookingUrgentSwitch({
  value,
  available,
  urgentFee,
  opensAt,
  closesAt,
  onChange,
}: Props) {
  return (
    <View style={styles.container}>
      {/* ======================================================
          SERVICE INFO
      ====================================================== */}

      <View style={styles.infoRow}>
        <View style={styles.infoContent}>
          <AppText
            weight="bold"
            style={styles.title}
          >
            Priority Matching
          </AppText>

          <AppText style={styles.time}>
            {opensAt} – {closesAt}
          </AppText>
        </View>

        <AppText
          weight="bold"
          style={styles.fee}
        >
          +₦{urgentFee.toLocaleString()}
        </AppText>
      </View>

      {/* ======================================================
          ENABLE SWITCH
      ====================================================== */}

      <View style={styles.switchRow}>
        <View style={styles.switchInfo}>
          <View style={styles.labelRow}>
           <AppText
  weight="bold"
  style={styles.enable}
>
  Get matched faster
</AppText>

            <AppText
              weight="bold"
              style={styles.enable}
            >
              Get matched faster
            </AppText>
          </View>

          <AppText style={styles.helper}>
            Find an available worker sooner
          </AppText>
        </View>

        <Switch
          value={value}
          disabled={!available}
          onValueChange={onChange}
          trackColor={{
            false: "#CBD5E1",
            true: "#F97316",
          }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#CBD5E1"
        />
      </View>
    </View>
  );
}

export default memo(
  BookingUrgentSwitch,
);

const styles =
  StyleSheet.create({
    container: {
      paddingTop: 2,
    },

    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",

      marginBottom: 12,
    },

    infoContent: {
      flex: 1,
      paddingRight: 12,
    },

    title: {
      fontSize: 14,
      lineHeight: 19,
      color: "#0F172A",
    },

    time: {
      marginTop: 3,
      fontSize: 12,
      lineHeight: 17,
      color: "#64748B",
    },

    fee: {
      fontSize: 14,
      color: "#F97316",
    },

    switchRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",

      paddingTop: 10,

      borderTopWidth: 1,
      borderTopColor: "#F1F5F9",
    },

    switchInfo: {
      flex: 1,
      paddingRight: 12,
    },

    labelRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    enable: {
      marginLeft: 6,
      fontSize: 14,
      lineHeight: 19,
      color: "#0F172A",
    },

    helper: {
      marginTop: 2,
      fontSize: 11,
      lineHeight: 16,
      color: "#64748B",
    },
  });