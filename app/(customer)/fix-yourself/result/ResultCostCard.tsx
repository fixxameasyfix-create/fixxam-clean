import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import {
  AppCard,
  AppText,
} from "@/components/ui";

import type {
  EstimatedCost,
} from "@/services/fixxamAi";

import {
  CustomerColors,
  FixxamTokens,
} from "@/theme";

interface Props {
  cost: EstimatedCost;
  estimatedTime: string;
}

export default function ResultCostCard({
  cost,
  estimatedTime,
}: Props) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="cash-multiple"
            size={18}
            color={CustomerColors.primary}
          />
        </View>

        <AppText
          size="lg"
          weight="bold"
          style={styles.title}
        >
          Cost & Time
        </AppText>
      </View>

      <View style={styles.list}>
        <InfoRow
          icon="currency-ngn"
          value={`${cost.currency} ${cost.min.toLocaleString()} - ${cost.max.toLocaleString()}`}
        />

        <View style={styles.divider} />

        <InfoRow
          icon="clock-outline"
          value={estimatedTime}
        />
      </View>
    </AppCard>
  );
}

interface InfoRowProps {
  icon:
    | "currency-ngn"
    | "clock-outline";

  value: string;
}

function InfoRow({
  icon,
  value,
}: InfoRowProps) {
  return (
    <View style={styles.row}>
      <MaterialCommunityIcons
        name={icon}
        size={18}
        color={CustomerColors.primary}
      />

      <AppText
        weight="bold"
        style={styles.value}
        numberOfLines={1}
      >
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: FixxamTokens.spacing.md,
    gap: FixxamTokens.spacing.sm,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },

  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      CustomerColors.diagnosisBackground,
  },

  title: {
    marginLeft: 10,
  },

  list: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor:
      CustomerColors.border,
    backgroundColor:
      CustomerColors.card,
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  value: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color:
      CustomerColors.primaryText,
  },

  divider: {
    height: 1,
    backgroundColor:
      CustomerColors.border,
    marginHorizontal: 12,
  },
});