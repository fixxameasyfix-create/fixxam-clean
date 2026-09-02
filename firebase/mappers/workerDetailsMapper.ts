import { DocumentSnapshot } from "firebase/firestore";

export type WorkerDetails = {
  id: string;

  firstName: string;
  surname: string;

  email: string;
  phoneNumber: string;

  rating: number;
  totalReviews: number;

  verified: boolean;
  online: boolean;

  workerProfile: {
    photoUrl: string;
    bio: string;
    experience: string;

    category: string;
    subcategory: string;

    state: string;
    lga: string;

    hourlyRate: number;

    latitude?: number;
    longitude?: number;
  };

  services: {
    id?: string;
    name: string;
  }[];
};

export function workerDetailsMapper(
  snapshot: DocumentSnapshot,
): WorkerDetails {
  const data = snapshot.data();

  if (!data) {
    throw new Error(
      "Worker data not found.",
    );
  }

  return {
    id: snapshot.id,

    firstName: data.firstName ?? "",
    surname: data.surname ?? "",

    email: data.email ?? "",
    phoneNumber:
      data.phoneNumber ?? "",

    rating: data.rating ?? 0,
    totalReviews:
      data.reviewsCount ?? 0,

    verified:
      data.verified ?? false,

    online:
      data.online ?? false,

    workerProfile: {
      photoUrl:
        data.workerProfile
          ?.photoUrl ?? "",

      bio:
        data.workerProfile?.bio ??
        "",

      experience:
        data.workerProfile
          ?.experience ?? "",

      category:
        data.workerProfile
          ?.category ?? "",

      subcategory:
        data.workerProfile
          ?.subcategory ?? "",

      state:
        data.workerProfile
          ?.state ?? "",

      lga:
        data.workerProfile?.lga ??
        "",

      hourlyRate:
        data.workerProfile
          ?.hourlyRate ?? 0,

      latitude:
        data.workerProfile
          ?.latitude,

      longitude:
        data.workerProfile
          ?.longitude,
    },

    services:
      data.workerProfile
        ?.serviceDetails ?? [],
  };
}