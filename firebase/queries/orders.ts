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
  ordersCollection,
} from "@/firebase/collections/orders";

import { Order } from "@/types/order";

/* Create */

export async function createOrder(
  order: Order
) {

  return addDoc(
    ordersCollection,
    {

      ...order,

      status:
        order.status ?? "pending",

    }
  );

}

/* Get One */

export async function getOrder(
  id: string
) {
  return getDoc(
    doc(db, "orders", id)
  );
}

/* Customer */

export async function getCustomerOrders(
  customerId: string
) {
  return getDocs(
    query(
      ordersCollection,
      where(
        "customerId",
        "==",
        customerId
      )
    )
  );
}

/* Seller */

export async function getSellerOrders(
  sellerId: string
) {
  return getDocs(
    query(
      ordersCollection,
      where(
        "sellerId",
        "==",
        sellerId
      )
    )
  );
}

/* Update */

export async function updateOrder(
  id: string,
  data: Partial<Order>
) {
  return updateDoc(
    doc(db, "orders", id),
    data
  );
}

/* Delete */

export async function deleteOrder(
  id: string
) {
  return deleteDoc(
    doc(db, "orders", id)
  );
}