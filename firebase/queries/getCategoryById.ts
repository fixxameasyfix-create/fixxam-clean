import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

import {
  categoryMapper,
  type CategoryData,
} from "@/firebase/mappers/categoryMapper";

/* ==============================================================
   GET CATEGORY BY ID
============================================================== */

export async function getCategoryById(
  categoryId: string,
): Promise<CategoryData | null> {
  const cleanCategoryId =
    categoryId.trim();

  if (
    !cleanCategoryId
  ) {
    return null;
  }

  const categoryRef =
    doc(
      db,
      "categories",
      cleanCategoryId,
    );

  const snapshot =
    await getDoc(
      categoryRef,
    );

  if (
    !snapshot.exists()
  ) {
    return null;
  }

  return categoryMapper(
    snapshot,
  );
}