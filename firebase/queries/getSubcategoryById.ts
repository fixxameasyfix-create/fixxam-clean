import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

import {
  subcategoryMapper,
  type SubcategoryData,
} from "@/firebase/mappers/subcategoryMapper";

/* ==============================================================
   GET SUBCATEGORY BY ID
============================================================== */

export async function getSubcategoryById(
  subcategoryId: string,
): Promise<SubcategoryData | null> {
  const cleanSubcategoryId =
    subcategoryId.trim();

  if (
    !cleanSubcategoryId
  ) {
    return null;
  }

  const subcategoryRef =
    doc(
      db,
      "subcategories",
      cleanSubcategoryId,
    );

  const snapshot =
    await getDoc(
      subcategoryRef,
    );

  if (
    !snapshot.exists()
  ) {
    return null;
  }

  return subcategoryMapper(
    snapshot,
  );
}