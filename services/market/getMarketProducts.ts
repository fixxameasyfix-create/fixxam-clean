import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

export type MarketProduct = {

  id: string;

  workerId: string;

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

  status: string;

};

export default async function getMarketProducts(): Promise<
  MarketProduct[]
> {

  const q = query(

    collection(
      db,
      "products",
    ),

    where(
      "status",
      "==",
      "active",
    ),

    orderBy(
      "createdAt",
      "desc",
    ),

  );

  const snapshot =
    await getDocs(q);

  return snapshot.docs.map(
    (doc) => ({

      id: doc.id,

      ...doc.data(),

    }),
  ) as MarketProduct[];

}