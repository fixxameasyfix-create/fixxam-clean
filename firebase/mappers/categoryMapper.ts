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

export type CategoryData = {
  id: string;

  name: string;

  icon: string;

  color: string;

  backgroundColor: string;

  /*
   * Default fulfillment mode inherited
   * by subcategories and services.
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
    typeof value !== "string"
  ) {
    return "";
  }

  return value.trim();
}

/* ==============================================================
   CATEGORY MAPPER
============================================================== */

export function categoryMapper(
  doc: QueryDocumentSnapshot,
): CategoryData {
  const data =
    doc.data();

  const name =
    cleanString(
      data.name,
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

    icon,

    color,

    backgroundColor,

    fulfillmentMode,
  };
}