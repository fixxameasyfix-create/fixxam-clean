import React, { memo } from "react";

import useBooking from "@/hooks/booking/useBooking";

import BookingLocationCard from "../request-service/BookingLocationCard";
import BookingDateCard from "./BookingDateCard";
import BookingNoteCard from "./BookingNoteCard";
import BookingPhotoCard from "./BookingPhotoCard";
import BookingTimeCard from "./BookingTimeCard";

type Props = {
  booking: ReturnType<typeof useBooking>;
};

function BookingContent({
  booking,
}: Props) {
  return (
    <>
      {/* ==================================================
          DATE
      ================================================== */}

      <BookingDateCard
        value={booking.date}
        onChange={(date) => {
          booking.haptics.selection();
          booking.setDate(date);
        }}
      />

      {/* ==================================================
          TIME
      ================================================== */}

      <BookingTimeCard
        value={booking.time}
        onChange={(time) => {
          booking.haptics.selection();
          booking.setTime(time);
        }}
      />

      {/* ==================================================
          LOCATION
      ================================================== */}

      <BookingLocationCard
        locationType={
          booking.locationType
        }
        address={
          booking.address
        }
        onLocationTypeChange={
          booking.setLocationType
        }
        onAddressChange={
          booking.setAddress
        }
      />

      {/* ==================================================
          PHOTOS
      ================================================== */}

      <BookingPhotoCard
        photos={
          booking.photos
        }
        addPhoto={
          booking.addPhoto
        }
        replacePhoto={
          booking.replacePhoto
        }
        removePhoto={
          booking.removePhoto
        }
      />

      {/* ==================================================
          ADDITIONAL DETAILS

          KeyboardAwareScrollView zai gano wannan
          TextInput idan user ya danna shi, sannan
          ya matsar da screen sama domin input ya
          kasance a sama da keyboard.
      ================================================== */}

      <BookingNoteCard
        value={booking.note}
        onChange={booking.setNote}
      />
    </>
  );
}

export default memo(
  BookingContent,
);