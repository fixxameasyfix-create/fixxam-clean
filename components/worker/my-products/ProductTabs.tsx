import React, {
  useState,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

const tabs = [

  "Products",

  "Orders",

  "Reviews",

];

export default function ProductTabs() {

  const [
    active,
    setActive,
  ] = useState("Products");

  return (

    <View style={styles.container}>

      {tabs.map((tab) => {

        const selected =
          active === tab;

        return (

          <Pressable
            key={tab}
            style={styles.tab}
            onPress={() =>
              setActive(tab)
            }
          >

            <AppText
              weight="bold"
              style={[
                styles.text,
                selected &&
                  styles.activeText,
              ]}
            >
              {tab}
            </AppText>

            {selected && (

              <View
                style={styles.indicator}
              />

            )}

          </Pressable>

        );

      })}

    </View>

  );

}

const styles =
  StyleSheet.create({

    container: {

      flexDirection: "row",

      backgroundColor:
        "#FFFFFF",

      borderRadius: 18,

      padding: 6,

      marginBottom: 20,

      shadowColor: "#000",

      shadowOpacity: 0.05,

      shadowRadius: 10,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 3,

    },

    tab: {

      flex: 1,

      alignItems: "center",

      paddingVertical: 12,

    },

    text: {

      color: "#64748B",

      fontSize: 15,

    },

    activeText: {

      color: "#FF6B00",

    },

    indicator: {

      marginTop: 8,

      width: 30,

      height: 3,

      borderRadius: 2,

      backgroundColor:
        "#FF6B00",

    },

  });