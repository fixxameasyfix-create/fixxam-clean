import categories from "@/assets/data/categories.json";
import lgas from "@/assets/data/lgas.json";
import serviceMapping from "@/assets/data/service-mapping.json";
import subcategories from "@/assets/data/subcategories.json";

import { serviceRegistry } from "./serviceRegistry";

export interface ServiceItem {
  id: string;
  name: string;
}

export const getCategories = (): string[] => {
  return categories as string[];
};

export const getSubcategories = (
  category: string
): string[] => {
  const data =
    subcategories as Record<
      string,
      string[]
    >;

  return data[category] || [];
};

export const getServiceFileName = (
  subcategory: string
): string | null => {
  const data =
    serviceMapping as Record<
      string,
      string
    >;

  return data[subcategory] || null;
};

export const getServices = (
  subcategory: string
): ServiceItem[] => {
  try {
    const fileName =
      getServiceFileName(subcategory);

    console.log(
      "subcategory:",
      subcategory
    );

    console.log(
      "fileName:",
      fileName
    );

    if (!fileName) {
      return [];
    }

    return (
      serviceRegistry[
        fileName as keyof typeof serviceRegistry
      ] || []
    ) as ServiceItem[];
  } catch (error) {
    console.log(
      "SERVICE ERROR:",
      error
    );
    return [];
  }
};

export const getStates = (): string[] => {
  const data =
    lgas as Record<
      string,
      string[]
    >;

  return Object.keys(data);
};

export const getLgas = (
  state: string
): string[] => {
  const data =
    lgas as Record<
      string,
      string[]
    >;

  return data[state] || [];
};