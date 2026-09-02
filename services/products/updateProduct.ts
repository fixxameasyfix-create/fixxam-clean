import {
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

export default async function updateProduct(
  productId: string,
  data: Record<string, any>,
) {

  await updateDoc(
    doc(
      db,
      "products",
      productId,
    ),
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
  );

}