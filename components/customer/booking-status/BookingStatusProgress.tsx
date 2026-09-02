import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";


type Step = {

  key: string;

  title: string;

  description: string;

};


type Props = {

  steps: Step[];

  currentIndex: number;

};


export default function BookingStatusProgress({

  steps,

  currentIndex,

}: Props) {


  return (

    <View style={styles.container}>

      {
        steps.map((step, index) => {

          const completed =
            index <= currentIndex;


          return (

            <View
              key={step.key}
              style={styles.item}
            >


              <View style={styles.left}>


                <View
                  style={[
                    styles.circle,

                    completed &&
                      styles.activeCircle,

                  ]}
                >

                  <Ionicons

                    name={
                      completed
                        ? "checkmark"
                        : "ellipse-outline"
                    }

                    size={16}

                    color={
                      completed
                        ? "#FFFFFF"
                        : "#94A3B8"
                    }

                  />

                </View>


                {
                  index !== steps.length - 1 && (

                    <View
                      style={[
                        styles.line,

                        index < currentIndex &&
                          styles.activeLine,

                      ]}
                    />

                  )
                }


              </View>



              <View style={styles.content}>


                <AppText
                  weight="bold"
                >
                  {step.title}
                </AppText>


                <AppText
                  style={styles.description}
                >
                  {step.description}
                </AppText>


              </View>


            </View>

          );

        })
      }


    </View>

  );

}



const styles = StyleSheet.create({

  container: {

    backgroundColor:
      "#FFFFFF",

    borderRadius:24,

    padding:20,

  },


  item: {

    flexDirection:"row",

  },


  left: {

    alignItems:"center",

    width:32,

  },


  circle: {

    width:24,

    height:24,

    borderRadius:12,

    borderWidth:2,

    borderColor:"#CBD5E1",

    justifyContent:"center",

    alignItems:"center",

  },


  activeCircle: {

    backgroundColor:"#2563EB",

    borderColor:"#2563EB",

  },


  line: {

    width:2,

    height:45,

    backgroundColor:"#E2E8F0",

  },


  activeLine: {

    backgroundColor:"#2563EB",

  },


  content: {

    flex:1,

    marginLeft:12,

    paddingBottom:24,

  },


  description: {

    marginTop:4,

    color:"#64748B",

    fontSize:13,

  },

});