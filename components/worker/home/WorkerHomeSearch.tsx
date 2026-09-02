import React from "react";

import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

type Props = {

  value?: string;

  onChangeText?: (
    text: string,
  ) => void;

  onFilterPress?: () => void;

};

export default function WorkerHomeSearch({

  value = "",

  onChangeText,

  onFilterPress,

}: Props) {

  return (

    <View style={styles.container}>

      <View style={styles.search}>

        <Ionicons
          name="search"
          size={20}
          color="#94A3B8"
        />

        <TextInput

          placeholder="Search jobs..."

          placeholderTextColor="#94A3B8"

          value={value}

          onChangeText={onChangeText}

          style={styles.input}

        />

      </View>

      <Pressable

        onPress={onFilterPress}

        style={styles.filter}

      >

        <Ionicons

          name="options"

          size={22}

          color="#FFFFFF"

        />

      </Pressable>

    </View>

  );

}

const styles = StyleSheet.create({

  container: {

    flexDirection: "row",

    marginBottom: 20,

  },

  search: {

    flex: 1,

    height: 54,

    borderRadius: 18,

    backgroundColor: "#FFFFFF",

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 16,

    marginRight: 12,

  },

  input: {

    flex: 1,

    marginLeft: 10,

    fontSize: 15,

    color: "#0F172A",

  },

  filter: {

    width: 54,

    height: 54,

    borderRadius: 18,

    backgroundColor: "#FF6B00",

    justifyContent: "center",

    alignItems: "center",

  },

});