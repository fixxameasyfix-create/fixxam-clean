import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export type CreateProductInput = {
  workerId: string;

  storeId?: string;

  name: string;

  description: string;

  category: string;

  price: number;

  stock: number;

  thumbnail: string;

  images: string[];

  delivery: boolean;

  condition: "new" | "used";

  featured: boolean;

  /**
   * Services this product/material
   * can be used for.
   */
  serviceIds: string[];
};

export default async function createProduct(
  data: CreateProductInput,
): Promise<string> {
  const serviceIds = Array.from(
    new Set(
      data.serviceIds
        .filter(
          (id): id is string =>
            typeof id === "string",
        )
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  );

 const docRef = await addDoc(
  collection(db, "products"),
  {
    workerId: data.workerId,

    storeId: data.storeId ?? "",

    name: data.name.trim(),

    description: data.description.trim(),

    category: data.category.trim(),

    price: data.price,

    stock: data.stock,

    thumbnail: data.thumbnail,

    images: data.images,

    delivery: data.delivery,

    condition: data.condition,

    featured: data.featured,

    serviceIds,

    // Initial marketplace metrics
    rating: 0,
    sold: 0,

    status: "active",

    createdAt: serverTimestamp(),

    updatedAt: serverTimestamp(),
  },
);

  return docRef.id;
}