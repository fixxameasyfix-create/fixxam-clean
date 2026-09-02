import React from "react";

import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {

  images: string[];

  onPickImages: () => void;

  onRemoveImage: (
    uri: string,
  ) => void;

};

export default function ProductImages({

  images,

  onPickImages,

  onRemoveImage,

}: Props) {

  return (

    <View style={styles.container}>

      <AppText
        weight="bold"
        style={styles.title}
      >
        Product Images
      </AppText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
      >

        {images.map((uri) => (

          <View
            key={uri}
            style={styles.imageCard}
          >

            <Image
              source={{
                uri,
              }}
              style={styles.image}
            />

            <Pressable
              style={styles.remove}
              onPress={() =>
                onRemoveImage(uri)
              }
            >

              <Ionicons
                name="close-circle"
                size={24}
                color="#EF4444"
              />

            </Pressable>

          </View>

        ))}

        {images.length < 5 && (

          <Pressable
            style={styles.addCard}
            onPress={onPickImages}
          >

            <Ionicons
              name="camera-outline"
              size={34}
              color="#94A3B8"
            />

            <AppText
              style={styles.addText}
            >
              Add Image
            </AppText>

          </Pressable>

        )}

      </ScrollView>

    </View>

  );

}

const styles =
  StyleSheet.create({

    container: {

      marginBottom: 24,

    },

    title: {

      fontSize: 18,

      marginBottom: 12,

    },

    imageCard: {

      width: 120,

      height: 120,

      borderRadius: 20,

      overflow: "hidden",

      marginRight: 12,

    },

    image: {

      width: "100%",

      height: "100%",

      resizeMode: "cover",

    },

    remove: {

      position: "absolute",

      top: 6,

      right: 6,

      backgroundColor:
        "#FFFFFF",

      borderRadius: 20,

    },

    addCard: {

      width: 120,

      height: 120,

      borderRadius: 20,

      borderWidth: 2,

      borderStyle: "dashed",

      borderColor:
        "#CBD5E1",

      backgroundColor:
        "#FFFFFF",

      justifyContent:
        "center",

      alignItems:
        "center",

    },

    addText: {

      marginTop: 8,

      color: "#64748B",

      fontSize: 12,

      textAlign: "center",

    },

  });