import { QueryDocumentSnapshot } from "firebase/firestore";

/* ======================
   Worker
====================== */

export function workerSearchMapper(
  doc: QueryDocumentSnapshot,
) {
  const data = doc.data();

  return {
    id: doc.id,

    type: "worker",

    firstName: data.firstName ?? "",

    surname: data.surname ?? "",

    fullName: `${data.firstName ?? ""} ${data.surname ?? ""}`,

    online: data.online ?? false,

    verified: data.verified ?? false,

    rating: data.rating ?? 0,

    totalReviews: data.totalReviews ?? 0,

    workerProfile: {
      photoUrl:
        data.workerProfile?.photoUrl ?? "",

      experience:
        data.workerProfile?.experience ?? "",

      state:
        data.workerProfile?.state ?? "",

      lga:
        data.workerProfile?.lga ?? "",

      hourlyRate:
        data.workerProfile?.hourlyRate ?? 0,

      latitude:
        data.workerProfile?.latitude,

      longitude:
        data.workerProfile?.longitude,
    },

    category:
      data.workerProfile?.category ?? "",

    subcategory:
      data.workerProfile?.subcategory ?? "",

    services:
      data.workerProfile?.serviceDetails ?? [],
  };
}

/* ======================
   Service
====================== */

export function serviceSearchMapper(
  doc: QueryDocumentSnapshot,
) {
  const data = doc.data();

  return {
    id: doc.id,

    type: "service",

    name: data.name ?? "",

    description:
      data.description ?? "",

    categoryId:
      data.categoryId ?? "",

    subcategoryId:
      data.subcategoryId ?? "",

    icon:
      data.icon ?? "shape",

    color:
      data.color ?? "#2563EB",

    backgroundColor:
      data.backgroundColor ?? "#EFF6FF",
  };
}