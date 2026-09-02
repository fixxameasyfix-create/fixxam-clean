import {
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";

import {
  deleteObject,
  ref,
} from "firebase/storage";

import {
  db,
  storage,
} from "@/firebase/config";

export default async function deleteProduct(
  id: string,
) {

  const document =
    await getDoc(
      doc(
        db,
        "products",
        id,
      ),
    );

  if (
    document.exists()
  ) {

    const data =
      document.data();

    if (
      data.storagePath
    ) {

      try {

        await deleteObject(
          ref(
            storage,
            data.storagePath,
          ),
        );

      } catch {

        console.log(
          "Storage image already removed.",
        );

      }

    }

  }

  await deleteDoc(
    doc(
      db,
      "products",
      id,
    ),
  );

}