import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { storage } from "@/firebase/config";

export async function uploadBookingPhotos(
  photos: string[],
) {
  const validPhotos = photos.filter(
    (photo) =>
      typeof photo === "string" &&
      photo.trim().length > 0,
  );

  const uploadedPhotos = await Promise.all(
    validPhotos.map(async (photo, index) => {
      if (!photo.startsWith("file://")) {
        return photo;
      }

      const response = await fetch(photo);

      const blob = await response.blob();

      const fileName = `bookings/${Date.now()}-${index}.jpg`;

      const storageRef = ref(
        storage,
        fileName,
      );

      await uploadBytes(
        storageRef,
        blob,
      );

      return getDownloadURL(
        storageRef,
      );
    }),
  );

  return uploadedPhotos;
}