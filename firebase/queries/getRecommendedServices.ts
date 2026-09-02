import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import {
  serviceMapper,
  ServiceCardData,
} from "@/firebase/mappers/serviceMapper";

const RECOMMENDED_SERVICE_LIMIT = 10;

/**
 * Fisher-Yates shuffle.
 *
 * Creates a fresh random ordering every time
 * this function is called.
 */
function shuffleServices(
  services: ServiceCardData[],
): ServiceCardData[] {
  const shuffled = [...services];

  for (
    let index = shuffled.length - 1;
    index > 0;
    index -= 1
  ) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1),
    );

    [
      shuffled[index],
      shuffled[randomIndex],
    ] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

export async function getRecommendedServices(): Promise<
  ServiceCardData[]
> {
  const snapshot =
    await getDocs(
      collection(
        db,
        "services",
      ),
    );

  const services =
    snapshot.docs
      .map((document) =>
        serviceMapper(document),
      )
      .filter(
        (service) =>
          service.id.length > 0 &&
          service.name.length > 0,
      );

  /*
   * Every Firebase fetch gets a new
   * random selection.
   */
  return shuffleServices(
    services,
  ).slice(
    0,
    RECOMMENDED_SERVICE_LIMIT,
  );
}