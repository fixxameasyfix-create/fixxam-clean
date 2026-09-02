import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

type Tab =
  | "pending"
  | "active"
  | "completed";

type Props = {

  value: Tab;

  onChange: (
    value: Tab
  ) => void;

};

const tabs = [

  {
    key: "pending" as Tab,
    label: "Pending",
  },

  {
    key: "active" as Tab,
    label: "Active",
  },

  {
    key: "completed" as Tab,
    label: "Completed",
  },

];

export default function WorkerJobsTabs({

  value,

  onChange,

}: Props) {

  return (

    <View style={styles.container}>

      {tabs.map((tab) => (

        <Pressable
          key={tab.key}
          onPress={() =>
            onChange(tab.key)
          }
          style={[
            styles.tab,
            value === tab.key &&
              styles.activeTab,
          ]}
        >

          <AppText
            weight="bold"
            style={[
              styles.label,
              value === tab.key &&
                styles.activeLabel,
            ]}
          >

            {tab.label}

          </AppText>

        </Pressable>

      ))}

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 6,
    marginBottom: 20,
  },

  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 14,
  },

  activeTab: {
    backgroundColor: "#FF6B00",
  },

  label: {
    color: "#64748B",
  },

  activeLabel: {
    color: "#FFFFFF",
  },

});