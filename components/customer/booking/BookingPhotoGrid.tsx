import React, { memo } from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import BookingPhotoSlot from "./BookingPhotoSlot";

type Props = {
  photos: string[];

  onAddPhoto: (
    index: number
  ) => void;

  onRemovePhoto: (
    index: number
  ) => void;
};

function BookingPhotoGrid({
  photos,
  onAddPhoto,
  onRemovePhoto,
}: Props) {
  return (
    <View style={styles.container}>
      {Array.from({
        length: 3,
      }).map((_, index) => (
        <BookingPhotoSlot
          key={index}
          uri={photos[index]}
          onPress={() =>
            onAddPhoto(index)
          }
          onRemove={() =>
            onRemovePhoto(index)
          }
        />
      ))}
    </View>
  );
}

export default memo(
  BookingPhotoGrid
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",

    gap: 10,

    marginTop: 4,
  },
});