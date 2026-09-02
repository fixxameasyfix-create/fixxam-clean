import { Order } from "@/types/order";

import {
  createOrder,
  updateOrder,
} from "@/firebase/queries/orders";

/* Customer */

export async function placeOrder(
  order: Order
) {
  return createOrder(order);
}

/* Seller */

export async function acceptOrder(
  id: string
) {
  return updateOrder(id, {
    status: "accepted",
  });
}

export async function packOrder(
  id: string
) {
  return updateOrder(id, {
    status: "packed",
  });
}

export async function shipOrder(
  id: string
) {
  return updateOrder(id, {
    status: "shipped",
  });
}

export async function deliverOrder(
  id: string
) {
  return updateOrder(id, {
    status: "delivered",
    paymentStatus: "paid",
  });
}

export async function cancelOrder(
  id: string
) {
  return updateOrder(id, {
    status: "cancelled",
  });
}