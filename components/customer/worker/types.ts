import type { GeoPoint } from "firebase/firestore";

export type WorkerService = {
  id?: string;
  name: string;

  icon?: string;
  color?: string;
  backgroundColor?: string;
};

export type WorkerCardData = {
  id: string;

  /**
   * Name saved from Build Your Profile.
   */
  fullName: string;

  /*
   * Kept for existing card logic/search compatibility.
   */
  firstName: string;
  surname: string;

  rating: number;
  totalReviews: number;

  online: boolean;
  verified: boolean;

  distance?: number;
  completedJobs?: number;

  category?: string;
  subcategory?: string;

  /**
   * Resolved service objects.
   */
  services: WorkerService[];

  /**
   * Original service document IDs.
   */
  serviceIds?: string[];

  workerProfile: {
    /**
     * Profile photo uploaded from
     * Build Your Profile.
     */
    photoUrl: string;

    /**
     * Customer can use this number
     * to call the worker.
     */
    phoneNumber: string;

    experience: string;

    state: string;

    lga: string;

    hourlyRate: number;

    latitude: number;

    longitude: number;

    geoPoint?: GeoPoint | null;

    geoHash?: string;

    address?: string;
  };
};