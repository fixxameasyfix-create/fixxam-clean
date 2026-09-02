export type OrderStatus =
  | "pending"
  | "accepted"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {

  id: string;

  customerId: string;

  storeId: string;

  sellerId: string;

  products: {

    productId: string;

    name: string;

    image: string;

    price: number;

    quantity: number;

  }[];

  subtotal: number;

  deliveryFee: number;

  total: number;

  paymentMethod:
    "cash";

  paymentStatus:
    | "pending"
    | "paid";

  status: OrderStatus;

  receiverName: string;

  receiverPhone: string;

  stateId: string;

  lgaId: string;

  address: string;

  note: string;

  createdAt:any;

  updatedAt:any;

}