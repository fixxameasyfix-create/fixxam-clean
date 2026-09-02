import React from "react";

import {
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

type Props = {

  title?: string;

  children: React.ReactNode;

  style?: ViewStyle;

};

export default function ProfileSection({

  title,

  children,

  style,

}: Props) {

  return (

    <View
      style={[
        styles.container,
        style,
      ]}
    >

      {!!title && (

        <AppText
          weight="bold"
          style={styles.title}
        >

          {title}

        </AppText>

      )}

      <View style={styles.card}>

        {children}

      </View>

    </View>

  );

}

const styles = StyleSheet.create({

  container: {

    marginHorizontal: 16,

    marginBottom: 20,

  },

  title: {

    fontSize: 16,

    color: "#0F172A",

    marginBottom: 10,

  },

  card: {

    backgroundColor: "#FFFFFF",

    borderRadius: 20,

    overflow: "hidden",

    shadowColor: "#000",

    shadowOpacity: 0.05,

    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 3,

  },

});