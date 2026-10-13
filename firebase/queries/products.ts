import {
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import {
  productsCollection,
} from "@/firebase/collections/products";

import { Product } from "@/types/product";

/* Create */

export async function createProduct(
  product: Product
) {
  return addDoc(productsCollection, product);
}

/* Get One */

export async function getProduct(
  id: string
) {
  return getDoc(
    doc(db, "products", id)
  );
}

/* Get All */

export async function getProducts() {
  return getDocs(productsCollection);
}

/* By Store */

export async function getStoreProducts(
  storeId: string
) {
  return getDocs(
    query(
      productsCollection,
      where("storeId", "==", storeId)
    )
  );
}

/* By Category */

export async function getProductsByCategory(
  categoryId: string
) {
  return getDocs(
    query(
      productsCollection,
      where("categoryId", "==", categoryId)
    )
  );
}

/* Active */

export async function getActiveProducts() {
  return getDocs(
    query(
      productsCollection,
      where(
        "status",
        "==",
        "active",
      ),
    ),
  );
}

/* Featured */

export async function getFeaturedProducts() {
  return getDocs(
    query(
      productsCollection,
      where("featured", "==", true)
    )
  );
}

/* Update */

export async function updateProduct(
  id: string,
  data: Partial<Product>
) {
  return updateDoc(
    doc(db, "products", id),
    data
  );
}

/* Delete */

export async function deleteProduct(
  id: string
) {
  return deleteDoc(
    doc(db, "products", id)
  );
}

/* By Worker */

export async function getWorkerProducts(
  workerId: string
) {
  return getDocs(
    query(
      productsCollection,
      where("workerId", "==", workerId),
      where("status", "==", "active")
    )
  );
}