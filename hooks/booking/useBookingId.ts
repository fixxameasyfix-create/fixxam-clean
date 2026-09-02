import { useCallback } from "react";

import { Timestamp } from "firebase/firestore";

export type BookingId = {
  id: string;
  createdAt: Timestamp;
  year: number;
};

export default function useBookingId() {

  const generateBookingId =
    useCallback((): BookingId => {

      const now = new Date();

      const year =
        now.getFullYear();

      const random =
        Math.random()
          .toString(36)
          .slice(2, 6)
          .toUpperCase();

      const id =
        `FXM-${year}-${Date.now()}-${random}`;

      return {

        id,

        year,

        createdAt:
          Timestamp.now(),

      };

    }, []);

  return {

    generateBookingId,

  };

}