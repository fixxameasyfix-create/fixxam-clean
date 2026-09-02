import React, {
  useMemo,
} from "react";

import {
  Image,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

type Props = {
  photos?: string[];
};

export default function WorkerOrderPhotos({
  photos = [],
}: Props) {
  const validPhotos = useMemo(
    () =>
      Array.from(
        new Set(
          photos.filter(
            (photo): photo is string =>
              typeof photo === "string" &&
              photo.trim().length > 0,
          ),
        ),
      ),
    [photos],
  );

  if (validPhotos.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <AppText
        weight="bold"
        style={styles.title}
      >
        Booking Photos
      </AppText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.photosContent
        }
      >
        {validPhotos.map(
          (photo, index) => (
            <Image
              key={`${photo}-${index}`}
              source={{
                uri: photo,
              }}
              style={styles.image}
              resizeMode="cover"
            />
          ),
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
  },

  title: {
    fontSize: 18,
    color: "#0F172A",
    marginBottom: 14,
  },

  photosContent: {
    paddingRight: 6,
  },

  image: {
    width: 120,
    height: 120,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: "#F1F5F9",
  },
});