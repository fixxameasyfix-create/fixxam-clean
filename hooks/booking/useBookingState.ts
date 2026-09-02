import { useState } from "react";

export type BookingLocationType =
  | "current"
  | "manual";

const MAX_PHOTOS = 3;

export default function useBookingState() {
  const [date, setDate] =
    useState(new Date());

  const [time, setTime] =
    useState(new Date());

  const [
    locationType,
    setLocationType,
  ] = useState<BookingLocationType>(
    "current"
  );

  const [address, setAddress] =
    useState("");

  const [photos, setPhotos] =
    useState<string[]>([]);

  const [note, setNote] =
    useState("");

  function addPhoto(
    uri: string
  ) {
    setPhotos((current) => {
      const next = [...current];

      while (
        next.length < MAX_PHOTOS
      ) {
        next.push("");
      }

      const emptyIndex =
        next.findIndex(
          (photo) => !photo
        );

      if (emptyIndex === -1) {
        return next;
      }

      next[emptyIndex] = uri;

      return next;
    });
  }

  function replacePhoto(
    index: number,
    uri: string
  ) {
    if (
      index < 0 ||
      index >= MAX_PHOTOS
    ) {
      return;
    }

    setPhotos((current) => {
      const next = [...current];

      while (
        next.length < MAX_PHOTOS
      ) {
        next.push("");
      }

      next[index] = uri;

      return next;
    });
  }

  function removePhoto(
    index: number
  ) {
    if (
      index < 0 ||
      index >= MAX_PHOTOS
    ) {
      return;
    }

    setPhotos((current) => {
      const next = [...current];

      while (
        next.length < MAX_PHOTOS
      ) {
        next.push("");
      }

      next[index] = "";

      return next;
    });
  }

  function clearPhotos() {
    setPhotos([]);
  }

  return {
    date,
    setDate,

    time,
    setTime,

    locationType,
    setLocationType,

    address,
    setAddress,

    photos,
    setPhotos,

    addPhoto,
    replacePhoto,
    removePhoto,
    clearPhotos,

    note,
    setNote,
  };
}