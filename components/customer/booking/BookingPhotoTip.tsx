import React, { memo, useState } from "react";

import BookingCard from "./BookingCard";
import BookingPhotoHeader from "./BookingPhotoHeader";
import BookingPhotoGrid from "./BookingPhotoGrid";
import BookingPhotoPickerSheet from "./BookingPhotoPickerSheet";

import useBookingPhotos from "@/hooks/booking/useBookingPhotos";

type Props = {
  urgent: boolean;
  photos: string[];
  addPhoto: (uri: string) => void;
  replacePhoto: (
    index: number,
    uri: string
  ) => void;
  removePhoto: (
    index: number
  ) => void;
};

function BookingPhotoCard({
  photos,
  addPhoto,
  replacePhoto,
  removePhoto,
}: Props) {
  const [pickerVisible, setPickerVisible] =
    useState(false);

  const [selectedIndex, setSelectedIndex] =
    useState(0);

  const bookingPhotos =
    useBookingPhotos({
      photos,
      addPhoto,
      replacePhoto,
    });

  function openPicker(index: number) {
    setSelectedIndex(index);
    setPickerVisible(true);
  }

  async function handleCamera() {
    setPickerVisible(false);

    try {
      await bookingPhotos.openCamera(
        photos[selectedIndex]
          ? selectedIndex
          : undefined
      );
    } catch (error) {
      console.error(
        "BOOKING CAMERA ERROR:",
        error,
      );
    }
  }

  async function handleGallery() {
    setPickerVisible(false);

    try {
      await bookingPhotos.openGallery(
        photos[selectedIndex]
          ? selectedIndex
          : undefined
      );
    } catch (error) {
      console.error(
        "BOOKING GALLERY ERROR:",
        error,
      );
    }
  }

  return (
    <BookingCard>
      <BookingPhotoHeader
        count={photos.filter(Boolean).length}
      />

      <BookingPhotoGrid
        photos={photos}
        onAddPhoto={openPicker}
        onRemovePhoto={removePhoto}
      />

      <BookingPhotoPickerSheet
        visible={pickerVisible}
        onClose={() =>
          setPickerVisible(false)
        }
        onCamera={handleCamera}
        onGallery={handleGallery}
      />
    </BookingCard>
  );
}

export default memo(
  BookingPhotoCard,
);