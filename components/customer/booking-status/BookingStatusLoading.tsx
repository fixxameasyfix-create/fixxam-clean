import React from "react";

import {
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";

import {
  AppText,
} from "@/components/ui";


export default function BookingStatusLoading() {

  return (

    <View style={styles.container}>

      <ActivityIndicator
        size="large"
        color="#2563EB"
      />


      <AppText
        weight="bold"
        style={styles.title}
      >
        Loading Booking
      </AppText>


      <AppText
        style={styles.subtitle}
      >
        Please wait while we fetch
        your booking details.
      </AppText>


    </View>

  );

}


const styles = StyleSheet.create({

  container: {

    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    padding: 24,

    backgroundColor: "#F8FAFC",

  },


  title: {

    marginTop: 16,

    fontSize: 18,

    color: "#0F172A",

  },


  subtitle: {

    marginTop: 6,

    textAlign: "center",

    color: "#64748B",

  },

});