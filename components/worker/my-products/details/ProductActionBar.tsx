import React from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

type Props = {

  loading: boolean;

  onEdit: () => void;

  onDelete: () => void;

};

export default function ProductActionBar({

  loading,

  onEdit,

  onDelete,

}: Props) {

  return (

    <View style={styles.container}>

      <Pressable

        style={[
          styles.button,
          styles.editButton,
        ]}

        onPress={onEdit}

        disabled={loading}

      >

        <Ionicons
          name="create-outline"
          size={20}
          color="#FFFFFF"
        />

        <AppText

          weight="bold"

          style={styles.buttonText}

        >

          Edit Product

        </AppText>

      </Pressable>

      <Pressable

        style={[
          styles.button,
          styles.deleteButton,
        ]}

        onPress={onDelete}

        disabled={loading}

      >

        {loading ? (

          <ActivityIndicator
            color="#FFFFFF"
          />

        ) : (

          <>

            <Ionicons
              name="trash-outline"
              size={20}
              color="#FFFFFF"
            />

            <AppText

              weight="bold"

              style={styles.buttonText}

            >

              Delete Product

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

      marginTop: 24,

      marginBottom: 40,

      gap: 14,

    },

    button: {

      height: 58,

      borderRadius: 18,

      flexDirection: "row",

      justifyContent:
        "center",

      alignItems:
        "center",

    },

    editButton: {

      backgroundColor:
        "#FF6B00",

    },

    deleteButton: {

      backgroundColor:
        "#DC2626",

    },

    buttonText: {

      color: "#FFFFFF",

      fontSize: 16,

      marginLeft: 10,

    },

  });