import React from "react";

import {
  StyleSheet,
  View,
  Pressable,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";


type Props = {

  onContact?: () => void;

  onCancel?: () => void;

};


export default function BookingStatusActions({

  onContact,

  onCancel,

}: Props) {


  return (

    <View style={styles.container}>


      <Pressable

        style={styles.primary}

        onPress={onContact}

      >

        <Ionicons

          name="chatbubble-outline"

          size={20}

          color="#FFFFFF"

        />


        <AppText
          style={styles.primaryText}
        >
          Contact Worker
        </AppText>


      </Pressable>



      <Pressable

        style={styles.secondary}

        onPress={onCancel}

      >

        <Ionicons

          name="close-circle-outline"

          size={20}

          color="#DC2626"

        />


        <AppText
          style={styles.secondaryText}
        >
          Cancel Booking
        </AppText>


      </Pressable>


    </View>

  );

}


const styles = StyleSheet.create({

  container: {

    marginTop:20,

    gap:12,

  },


  primary: {

    height:54,

    borderRadius:18,

    backgroundColor:"#2563EB",

    flexDirection:"row",

    justifyContent:"center",

    alignItems:"center",

    gap:8,

  },


  primaryText: {

    color:"#FFFFFF",

    fontWeight:"700",

  },


  secondary: {

    height:54,

    borderRadius:18,

    backgroundColor:"#FEE2E2",

    flexDirection:"row",

    justifyContent:"center",

    alignItems:"center",

    gap:8,

  },


  secondaryText: {

    color:"#DC2626",

    fontWeight:"700",

  },


});