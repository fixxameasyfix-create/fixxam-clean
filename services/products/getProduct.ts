import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

export default async function getProduct(
  productId: string,
) {

  const snap = await getDoc(
    doc(
      db,
      "products",
      productId,
    ),
  );

  if (!snap.exists()) {
    return null;
  }

  return {
    id: snap.id,
    ...snap.data(),
  };

}