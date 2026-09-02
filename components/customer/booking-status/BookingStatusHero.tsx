import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";


type Props = {

  bookingId?: string;

  title?: string;

  subtitle?: string;

};


export default function BookingStatusHero({

  bookingId,

  title = "Booking Request Sent",

  subtitle =
    "Your request has been sent to the worker.",

}: Props) {


  return (

    <View style={styles.container}>


      <View style={styles.icon}>

        <Ionicons
          name="checkmark"
          size={34}
          color="#FFFFFF"
        />

      </View>


      <AppText
        weight="bold"
        style={styles.title}
      >
        {title}
      </AppText>


      <AppText
        style={styles.subtitle}
      >
        {subtitle}
      </AppText>


      {
        bookingId && (

          <View style={styles.badge}>

            <AppText
              style={styles.badgeText}
            >
              #{bookingId}
            </AppText>

          </View>

        )
      }


    </View>

  );

}


const styles = StyleSheet.create({

  container: {

    alignItems: "center",

    paddingHorizontal: 24,

    marginBottom: 24,

  },


  icon: {

    width: 76,

    height: 76,

    borderRadius: 38,

    backgroundColor: "#22C55E",

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 18,

  },


  title: {

    fontSize: 24,

    color: "#0F172A",

    textAlign: "center",

  },


  subtitle: {

    marginTop: 8,

    color: "#64748B",

    textAlign: "center",

    lineHeight: 20,

  },


  badge: {

    marginTop: 16,

    paddingHorizontal: 14,

    paddingVertical: 6,

    borderRadius: 20,

    backgroundColor: "#EEF2FF",

  },


  badgeText: {

    color: "#2563EB",

    fontSize: 12,

    fontWeight: "700",

  },

});