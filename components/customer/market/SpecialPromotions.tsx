import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
  Image,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

export default function SpecialPromotions() {

  return (

    <View style={styles.container}>

      <View style={styles.header}>

        <AppText
          weight="bold"
          style={styles.title}
        >
          Special Promotions
        </AppText>

        <Pressable>

          <AppText
            style={styles.seeAll}
          >
            See All
          </AppText>

        </Pressable>

      </View>


      <View style={styles.row}>


        <View style={styles.cardGreen}>

          <AppText
            weight="bold"
            style={styles.heading}
          >
            Buy 2 Bags of Cement
          </AppText>

          <AppText
            style={styles.sub}
          >
            Get 5% OFF
          </AppText>

          <Pressable
            style={styles.greenButton}
          >

            <AppText
              weight="bold"
              style={styles.buttonText}
            >
              Claim Offer
            </AppText>

          </Pressable>

        </View>


        <View style={styles.cardOrange}>

          <Image

            source={{
              uri:
                "https://images.unsplash.com/photo-1556740749-887f6717d7e4",
            }}

            style={styles.image}

          />

          <AppText
            weight="bold"
            style={styles.heading}
          >
            Free Delivery
          </AppText>

          <AppText
            style={styles.sub}
          >
            Orders above ₦20,000
          </AppText>

          <Pressable
            style={styles.orangeButton}
          >

            <AppText
              weight="bold"
              style={styles.buttonText}
            >
              Shop Now
            </AppText>

          </Pressable>

        </View>

      </View>

    </View>

  );

}

const styles = StyleSheet.create({

  container: {

    marginTop: 30,

    marginBottom: 24,

  },

  header: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 16,

  },

  title: {

    fontSize: 22,

  },

  seeAll: {

    color: "#2563EB",

    fontWeight: "700",

  },

  row: {

    flexDirection: "row",

    gap: 12,

  },

  cardGreen: {

    flex: 1,

    backgroundColor: "#E8F8EC",

    borderRadius: 20,

    padding: 16,

  },

  cardOrange: {

    flex: 1,

    backgroundColor: "#FFF4E6",

    borderRadius: 20,

    padding: 16,

    alignItems: "center",

  },

  image: {

    width: 70,

    height: 70,

    borderRadius: 10,

    marginBottom: 10,

  },

  heading: {

    fontSize: 16,

  },

  sub: {

    color: "#64748B",

    marginVertical: 8,

  },

  greenButton: {

    backgroundColor: "#16A34A",

    height: 42,

    borderRadius: 12,

    justifyContent: "center",

    alignItems: "center",

    marginTop: 10,

  },

  orangeButton: {

    backgroundColor: "#F97316",

    height: 42,

    borderRadius: 12,

    justifyContent: "center",

    alignItems: "center",

    marginTop: 10,

    alignSelf: "stretch",

  },

  buttonText: {

    color: "#FFFFFF",

  },

});