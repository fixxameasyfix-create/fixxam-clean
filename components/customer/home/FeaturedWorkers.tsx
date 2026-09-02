import React from "react";

import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  router,
} from "expo-router";

import useWorkers from "@/hooks/worker/useWorkers";

import {
  AppCard,
  AppText,
} from "@/components/ui";


export default function FeaturedWorkers() {


  const {
    workers,
    loading,
  } = useWorkers();



  if (loading) {
    return null;
  }



  return (

    <View style={styles.container}>


      <View style={styles.header}>


        <AppText
          weight="bold"
          style={styles.title}
        >
          Featured Workers
        </AppText>



        <TouchableOpacity>

          <AppText
            style={styles.seeAll}
          >
            See All
          </AppText>

        </TouchableOpacity>


      </View>



      <FlatList

        horizontal

        data={workers}

        keyExtractor={(item) =>
          item.uid
        }

        showsHorizontalScrollIndicator={false}

        contentContainerStyle={{
          paddingRight: 10,
        }}



        renderItem={({ item: worker }) => (


          <TouchableOpacity

            activeOpacity={0.85}

            onPress={() =>
              router.push({

                pathname:
                  "/(customer)/workers/[id]",

                params: {

                  id:
                    worker.uid,

                },

              })
            }

          >


            <AppCard
              style={styles.card}
            >


              <Image

                source={{

                  uri:
                    worker.photoUrl ||

                    "https://i.pravatar.cc/150?img=12",

                }}

                style={styles.image}

              />



              <AppText

                weight="bold"

                style={styles.name}

                numberOfLines={1}

              >

                {worker.name}

              </AppText>



              <AppText

                style={styles.service}

                numberOfLines={1}

              >

                {worker.service}

              </AppText>




              <View style={styles.info}>


                <View style={styles.ratingRow}>


                  <Ionicons

                    name="star"

                    size={13}

                    color="#F59E0B"

                  />



                  <AppText

                    style={styles.rating}

                  >

                    {worker.rating}

                  </AppText>


                </View>


              </View>





              <TouchableOpacity

                style={styles.button}

                onPress={() =>
                  router.push({

                    pathname:
                      "/(customer)/workers/[id]",

                    params: {

                      id:
                        worker.uid,

                    },

                  })
                }

              >

                <AppText

                  weight="bold"

                  style={styles.buttonText}

                >

                  Book

                </AppText>


              </TouchableOpacity>



            </AppCard>


          </TouchableOpacity>


        )}

      />


    </View>

  );

}



const styles = StyleSheet.create({


  container: {

    marginBottom: 22,

  },



  header: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 14,

  },



  title: {

    fontSize: 18,

    color: "#111827",

  },



  seeAll: {

    color: "#2563EB",

    fontWeight: "700",

    fontSize: 13,

  },



  card: {

    width: 170,

    marginRight: 14,

    padding: 14,

    alignItems: "center",

    borderRadius: 20,

  },



  image: {

    width: 64,

    height: 64,

    borderRadius: 32,

  },



  name: {

    marginTop: 12,

    fontSize: 15,

    color: "#111827",

  },



  service: {

    marginTop: 4,

    fontSize: 12,

    color: "#64748B",

  },



  info: {

    marginTop: 10,

    alignItems: "center",

  },



  ratingRow: {

    flexDirection: "row",

    alignItems: "center",

  },



  rating: {

    marginLeft: 4,

    fontSize: 12,

  },



  button: {

    marginTop: 12,

    width: "100%",

    height: 38,

    borderRadius: 12,

    backgroundColor: "#2563EB",

    justifyContent: "center",

    alignItems: "center",

  },



  buttonText: {

    color: "#FFFFFF",

    fontSize: 13,

  },


});