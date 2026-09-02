import React from "react";

import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";

const { width } = Dimensions.get("window");

type Props = {
  images: string[];
};

export default function ProductGallery({
  images,
}: Props) {
  const galleryImages =
    images.length > 0
      ? images
      : [
          "https://via.placeholder.com/600x400?text=No+Image",
        ];

  return (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {galleryImages.map((image, index) => (
        <Image
          key={`${image}-${index}`}
          source={{ uri: image }}
          style={styles.image}
          resizeMode="cover"
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
  },

  image: {
    width: width - 32,

    height: 210,

    borderRadius: 18,

    marginBottom: 14,

    backgroundColor: "#F1F5F9",
  },
});