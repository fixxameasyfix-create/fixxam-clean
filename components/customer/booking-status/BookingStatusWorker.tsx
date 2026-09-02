import React from "react";

import {
  StyleSheet,
  View,
  Image,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";


type Props = {

  name: string;

  photo?: string;

  serviceName: string;

  rating?: number;

  verified?: boolean;

  status?: string;

};


export default function BookingStatusWorker({

  name,

  photo,

  serviceName,

  rating = 0,

  verified = false,

  status = "Waiting for worker review",

}: Props) {


  return (

    <View style={styles.card}>


      {
        photo ? (

          <Image

            source={{
              uri: photo,
            }}

            style={styles.avatar}

          />

        ) : (

          <View style={styles.placeholder}>

            <Ionicons

              name="person"

              size={28}

              color="#2563EB"

            />

          </View>

        )
      }



      <View style={styles.info}>


        <View style={styles.nameRow}>

  <AppText
    weight="bold"
    style={styles.name}
  >
    {name || "Worker"}
  </AppText>


  {
    verified && (

      <Ionicons
        name="checkmark-circle"
        size={18}
        color="#22C55E"
      />

    )
  }

</View>


        <AppText
          style={styles.service}
        >
          {serviceName}
        </AppText>



        <View style={styles.row}>


          <Ionicons

            name="star"

            size={14}

            color="#F59E0B"

          />


          <AppText
            style={styles.rating}
          >
            {rating.toFixed(1)}
          </AppText>


        </View>



        <AppText
          style={styles.status}
        >
          🟢 {status}
        </AppText>


      </View>


    </View>

  );

}



const styles = StyleSheet.create({

  card: {

    flexDirection:"row",

    alignItems:"center",

    backgroundColor:"#FFFFFF",

    borderRadius:24,

    padding:16,

    marginTop:16,

  },


  avatar: {

    width:56,

    height:56,

    borderRadius:28,

  },


  placeholder: {

    width:56,

    height:56,

    borderRadius:28,

    backgroundColor:"#EFF6FF",

    justifyContent:"center",

    alignItems:"center",

  },


  info: {

    marginLeft:14,

    flex:1,

  },


  name: {

    fontSize:17,

    color:"#0F172A",

  },


  service: {

    marginTop:4,

    color:"#64748B",

  },


  row: {

    flexDirection:"row",

    alignItems:"center",

    marginTop:6,

  },


  rating: {

    marginLeft:4,

    color:"#64748B",

    fontSize:13,

  },


  status: {

    marginTop:6,

    color:"#16A34A",

    fontSize:13,

  },

  nameRow: {

  flexDirection:"row",

  alignItems:"center",

},

});