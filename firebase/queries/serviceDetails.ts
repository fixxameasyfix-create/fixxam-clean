import {
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export async function getServiceDetails(
  serviceId: string,
) {
  try {
    console.log("Loading service:", serviceId);

    const serviceRef = doc(
      db,
      "services",
      serviceId,
    );

    console.log("Path:", serviceRef.path);

    const snapshot =
      await getDoc(serviceRef);

    console.log(
      "Exists:",
      snapshot.exists(),
    );

    if (!snapshot.exists()) {
      return {
        id: serviceId,
        name: serviceId,
        icon: "shape-outline",
        color: "#2563EB",
        backgroundColor: "#EFF6FF",
        price: 0,
        category: "",
        subcategory: "",
      };
    }

    const data = snapshot.data();

    return {
      id: snapshot.id,
      name: data.name ?? "",
      icon: data.icon ?? "shape-outline",
      color: data.color ?? "#2563EB",
      backgroundColor:
        data.backgroundColor ??
        "#EFF6FF",
      price: data.price ?? 0,
      category:
        data.category ?? "",
      subcategory:
        data.subcategory ?? "",
    };
  } catch (error: any) {
    console.log("SERVICE ERROR");
    console.log("Code:", error.code);
    console.log("Message:", error.message);
    console.log(error);

    throw error;
  }
}