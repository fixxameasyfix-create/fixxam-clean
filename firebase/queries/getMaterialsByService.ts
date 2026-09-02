import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import type {
  MarketProduct,
} from "@/hooks/market/useMarket";

export async function getMaterialsByService(
  serviceId: string,
): Promise<MarketProduct[]> {
  const normalizedServiceId =
    serviceId.trim();

  if (!normalizedServiceId) {
    return [];
  }

  const materialsQuery = query(
    collection(db, "products"),

    where(
      "status",
      "==",
      "active",
    ),

    where(
      "serviceIds",
      "array-contains",
      normalizedServiceId,
    ),
  );

  const snapshot =
    await getDocs(
      materialsQuery,
    );

  return snapshot.docs.map(
    (document) => {
      const data =
        document.data();

      return {
        id: document.id,

        workerId:
          typeof data.workerId ===
          "string"
            ? data.workerId
            : "",

        storeId:
          typeof data.storeId ===
          "string"
            ? data.storeId
            : undefined,

        name:
          typeof data.name ===
          "string"
            ? data.name
            : "",

        description:
          typeof data.description ===
          "string"
            ? data.description
            : "",

        category:
          typeof data.category ===
          "string"
            ? data.category
            : "",

        price:
          typeof data.price ===
          "number"
            ? data.price
            : 0,

        stock:
          typeof data.stock ===
          "number"
            ? data.stock
            : 0,

        thumbnail:
          typeof data.thumbnail ===
          "string"
            ? data.thumbnail
            : "",

        images:
          Array.isArray(data.images)
            ? data.images.filter(
                (
                  image,
                ): image is string =>
                  typeof image ===
                  "string",
              )
            : [],

        delivery:
          data.delivery === true,

        condition:
          data.condition ===
          "used"
            ? "used"
            : "new",

        featured:
          data.featured === true,

        status:
          typeof data.status ===
          "string"
            ? data.status
            : "active",

        rating:
          typeof data.rating ===
          "number"
            ? data.rating
            : 0,

        sold:
          typeof data.sold ===
          "number"
            ? data.sold
            : 0,

        serviceIds:
          Array.isArray(
            data.serviceIds,
          )
            ? data.serviceIds.filter(
                (
                  id,
                ): id is string =>
                  typeof id ===
                  "string",
              )
            : [],
      };
    },
  );
}