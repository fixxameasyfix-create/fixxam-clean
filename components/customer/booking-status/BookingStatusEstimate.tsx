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

  price?: number | null;

  message?: string;

  onAccept?: () => void;

  onDecline?: () => void;

};


export default function BookingStatusEstimate({

  price,

  message = "",

  onAccept,

  onDecline,

}: Props) {


  const hasEstimate =
    price !== null &&
    price !== undefined &&
    price > 0;


  return (

    <View style={styles.card}>


      <View style={styles.header}>


        <Ionicons

          name="calculator-outline"

          size={22}

          color="#2563EB"

        />


        <AppText
          weight="bold"
          style={styles.title}
        >
          {
            hasEstimate
              ? "Estimate Received"
              : "Waiting for Estimate"
          }
        </AppText>


      </View>



      {
        hasEstimate ? (

          <>

            <AppText
              style={styles.label}
            >
              Estimated Price
            </AppText>


            <AppText
              weight="bold"
              style={styles.price}
            >
              ₦{price.toLocaleString()}
            </AppText>


            {
              message && (

                <View style={styles.messageBox}>

                  <AppText
                    style={styles.message}
                  >
                    {message}
                  </AppText>

                </View>

              )
            }



            <View style={styles.actions}>


              <AppText
                style={styles.accept}
                onPress={onAccept}
              >
                Accept
              </AppText>


              <AppText
                style={styles.decline}
                onPress={onDecline}
              >
                Decline
              </AppText>


            </View>


          </>


        ) : (

          <AppText
            style={styles.description}
          >
            Worker will review your request
            and send a price estimate.
          </AppText>

        )

      }


    </View>

  );

}



const styles = StyleSheet.create({

  card: {

    backgroundColor:"#FFFFFF",

    borderRadius:24,

    padding:18,

    marginTop:16,

  },


  header: {

    flexDirection:"row",

    alignItems:"center",

    marginBottom:16,

  },


  title: {

    marginLeft:10,

    fontSize:17,

    color:"#0F172A",

  },


  label: {

    color:"#64748B",

    fontSize:13,

  },


  price: {

    marginTop:6,

    fontSize:28,

    color:"#FF6B00",

  },


  messageBox: {

    backgroundColor:"#F8FAFC",

    borderRadius:16,

    padding:12,

    marginTop:14,

  },


  message: {

    color:"#475569",

  },


  description: {

    color:"#64748B",

    lineHeight:20,

  },


  actions: {

    flexDirection:"row",

    marginTop:18,

    gap:12,

  },


  accept: {

    flex:1,

    textAlign:"center",

    padding:14,

    borderRadius:16,

    backgroundColor:"#22C55E",

    color:"#FFFFFF",

    fontWeight:"700",

  },


  decline: {

    flex:1,

    textAlign:"center",

    padding:14,

    borderRadius:16,

    backgroundColor:"#FEE2E2",

    color:"#DC2626",

    fontWeight:"700",

  },

});