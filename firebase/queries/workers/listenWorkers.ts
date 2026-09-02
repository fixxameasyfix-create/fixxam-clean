import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import type { Worker } from "@/types/worker";

export function listenWorkers(
  serviceId: string,
  callback: (workers: Worker[]) => void,
) {
  const q = query(
    collection(db, "users"),
    where("activeRole", "==", "worker"),
    where("available", "==", true),
    orderBy("completedJobs", "desc"),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const workers: Worker[] = snapshot.docs
        .map((doc) => {
          const data = doc.data();

          const profile = data.workerProfile ?? {};

          return {
            id: doc.id,

            userId: data.uid ?? doc.id,

            firstName: data.firstName ?? "",
            surname: data.surname ?? "",
            otherName: data.otherName,

            fullName:
              `${data.firstName ?? ""} ${data.surname ?? ""}`.trim(),

            email: data.email ?? "",
            phone: data.phone ?? "",

            photoUrl: profile.photoUrl ?? "",
            coverPhotoUrl: profile.coverPhotoUrl ?? "",

            categoryId: profile.categoryId ?? "",
            subcategoryId: profile.subcategoryId ?? "",

            services: profile.selectedServices ?? [],

            experience: profile.experience ?? "",

            bio: profile.bio ?? "",

            stateId: profile.state ?? "",
            lgaId: profile.lga ?? "",

            address: profile.address ?? "",

            latitude: Number(profile.latitude ?? 0),
            longitude: Number(profile.longitude ?? 0),

            hourlyRate: Number(profile.hourlyRate ?? 0),

            verified: data.verified ?? false,

            online: data.online ?? false,

            available: data.available ?? false,

            rating: Number(data.rating ?? 0),

            reviewsCount: Number(data.reviewsCount ?? 0),

            completedJobs: Number(data.completedJobs ?? 0),

            jobsCancelled: Number(data.jobsCancelled ?? 0),

            responseTime: data.responseTime ?? "",

            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            lastSeen: data.lastSeen,
          };
        })
        .filter((worker) =>
          serviceId
            ? worker.services.includes(serviceId)
            : true,
        );

      callback(workers);
    },
    (error) => {
      console.error(
        "listenWorkers:",
        error,
      );

      callback([]);
    },
  );
}