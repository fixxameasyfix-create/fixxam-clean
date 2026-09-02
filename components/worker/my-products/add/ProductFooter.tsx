import React from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {

  loading: boolean;

  onSave: () => void;

  buttonText?: string;

};

export default function ProductFooter({

  loading,

  onSave,

  buttonText = "Publish Product",

}: Props) {

  return (

    <View style={styles.container}>

      <Pressable

        style={[
          styles.button,
          loading &&
            styles.disabled,
        ]}

        disabled={loading}

        onPress={onSave}

      >

        {loading ? (

          <ActivityIndicator
            color="#FFFFFF"
          />

        ) : (

          <>

            <Ionicons
              name="cloud-upload-outline"
              size={20}
              color="#FFFFFF"
            />

            <AppText

              weight="bold"

              style={styles.text}

            >

              {buttonText}

            </AppText>

          </>

        )}

      </Pressable>

    </View>

  );

}

const styles =
  StyleSheet.create({

    container: {

      marginTop: 10,

      marginBottom: 40,

    },

    button: {

      height: 58,

      borderRadius: 18,

      backgroundColor:
        "#FF6B00",

      flexDirection: "row",

      justifyContent:
        "center",

      alignItems:
        "center",

    },

    disabled: {

      opacity: 0.6,

    },

    text: {

      color: "#FFFFFF",

      fontSize: 16,

      marginLeft: 10,

    },

  });