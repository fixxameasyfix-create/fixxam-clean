import React from "react";

import {
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { AppText } from "@/components/ui";

type Props = {

  description: string;

  onChangeDescription: (
    value: string,
  ) => void;

};

export default function ProductDescription({

  description,

  onChangeDescription,

}: Props) {

  return (

    <View style={styles.container}>

      <AppText
        weight="bold"
        style={styles.label}
      >
        Description
      </AppText>

      <TextInput
        value={description}
        onChangeText={
          onChangeDescription
        }
        placeholder="Describe your product..."
        placeholderTextColor="#94A3B8"
        multiline
        numberOfLines={6}
        style={styles.input}
      />

    </View>

  );

}

const styles =
  StyleSheet.create({

    container: {

      marginBottom: 24,

    },

    label: {

      marginBottom: 8,

      fontSize: 15,

    },

    input: {

      minHeight: 140,

      backgroundColor:
        "#FFFFFF",

      borderRadius: 16,

      borderWidth: 1,

      borderColor:
        "#E2E8F0",

      paddingHorizontal: 16,

      paddingVertical: 14,

      textAlignVertical:
        "top",

      fontSize: 15,

      color: "#0F172A",

    },

  });