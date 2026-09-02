import React, {
  useState,
} from "react";

import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

import {
  acceptOffer,
} from "@/firebase/queries/bookings/acceptOffer";

import {
  rejectOffer,
} from "@/firebase/queries/bookings/rejectOffer";

import {
  addOffer,
} from "@/firebase/queries/bookings/addOffer";


type Props = {

  bookingId: string;

  price: number;

  message: string;

};


export default function BookingEstimateCard({

  bookingId,

  price,

  message,

}: Props) {


  const [
    showCounter,
    setShowCounter,
  ] = useState(false);


  const [
    counterPrice,
    setCounterPrice,
  ] = useState("");


  const [
    counterMessage,
    setCounterMessage,
  ] = useState("");



  async function handleAccept() {

  await
  acceptOffer(
  bookingId,
)



}



  async function handleReject() {

  await rejectOffer(
    bookingId,
  );

}



  async function handleCounter() {

  if (!counterPrice) {

    return;

  }

  await addOffer({

    bookingId,

    sender:
      "customer",

    amount:
      Number(counterPrice),

    message:
      counterMessage,

  });

  setCounterPrice("");

  setCounterMessage("");

  setShowCounter(false);

}



  return (

    <View style={styles.card}>


      <AppText
        weight="bold"
        style={styles.title}
      >
        💰 Worker Estimate
      </AppText>



      <AppText style={styles.price}>

        ₦{price.toLocaleString()}

      </AppText>



      <AppText style={styles.message}>

        {message}

      </AppText>



      <Pressable

        style={styles.accept}

        onPress={handleAccept}

      >

        <AppText style={styles.buttonText}>

          Accept Offer

        </AppText>

      </Pressable>



      <Pressable

        style={styles.counter}

        onPress={() =>
          setShowCounter(true)
        }

      >

        <AppText style={styles.counterText}>

          Counter Offer

        </AppText>

      </Pressable>



      <Pressable

        style={styles.reject}

        onPress={handleReject}

      >

        <AppText style={styles.rejectText}>

          Reject

        </AppText>

      </Pressable>



      {
        showCounter && (

          <View style={styles.counterBox}>


            <TextInput

              placeholder="New price"

              keyboardType="numeric"

              value={counterPrice}

              onChangeText={
                setCounterPrice
              }

              style={styles.input}

            />



            <TextInput

              placeholder="Message"

              value={counterMessage}

              onChangeText={
                setCounterMessage
              }

              style={styles.input}

            />



            <Pressable

              onPress={handleCounter}

              style={styles.send}

            >

              <AppText style={styles.buttonText}>

                Send Offer

              </AppText>

            </Pressable>


          </View>

        )

      }


    </View>

  );

}



const styles = StyleSheet.create({

  card: {

    backgroundColor:"#FFFFFF",

    borderRadius:24,

    padding:20,

    marginTop:16,

  },


  title: {

    fontSize:18,

  },


  price: {

    fontSize:28,

    fontWeight:"700",

    marginTop:12,

  },


  message: {

    marginTop:8,

    color:"#64748B",

  },


  accept: {

    backgroundColor:"#2563EB",

    padding:14,

    borderRadius:14,

    marginTop:20,

    alignItems:"center",

  },


  counter: {

    backgroundColor:"#F1F5F9",

    padding:14,

    borderRadius:14,

    marginTop:10,

    alignItems:"center",

  },


  reject: {

    backgroundColor:"#FEE2E2",

    padding:14,

    borderRadius:14,

    marginTop:10,

    alignItems:"center",

  },


  buttonText: {

    color:"#FFFFFF",

    fontWeight:"700",

  },


  counterText: {

    color:"#0F172A",

    fontWeight:"700",

  },


  rejectText: {

    color:"#DC2626",

    fontWeight:"700",

  },


  counterBox: {

    marginTop:20,

  },


  input: {

    borderWidth:1,

    borderColor:"#CBD5E1",

    borderRadius:12,

    padding:12,

    marginBottom:10,

  },


  send: {

    backgroundColor:"#16A34A",

    padding:14,

    borderRadius:14,

    alignItems:"center",

  },

});