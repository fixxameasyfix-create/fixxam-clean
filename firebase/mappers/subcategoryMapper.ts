import type {
  QueryDocumentSnapshot,
} from "firebase/firestore";

import {
  isServiceFulfillmentMode,
  type ServiceFulfillmentMode,
} from "@/types/serviceFulfillment";

/* ==============================================================
   TYPES
============================================================== */

export type SubcategoryData = {
  id: string;

  name: string;

  categoryId: string;

  icon: string;

  color: string;

  backgroundColor: string;

  /*
   * Optional default fulfillment mode
   * inherited by services in this subcategory.
   */
  fulfillmentMode?: ServiceFulfillmentMode;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value.trim();
}

/* ==============================================================
   SUBCATEGORY MAPPER
============================================================== */

export function subcategoryMapper(
  doc: QueryDocumentSnapshot,
): SubcategoryData {
  const data =
    doc.data();

  const name =
    cleanString(
      data.name,
    );

  const categoryId =
    cleanString(
      data.categoryId,
    );

  const icon =
    cleanString(
      data.icon,
    );

  const color =
    cleanString(
      data.color,
    );

  const backgroundColor =
    cleanString(
      data.backgroundColor,
    );

  const fulfillmentMode =
    isServiceFulfillmentMode(
      data.fulfillmentMode,
    )
      ? data.fulfillmentMode
      : undefined;

  return {
    id: doc.id,

    name,

    categoryId,

    icon,

    color,

    backgroundColor,

    fulfillmentMode,
  };
}