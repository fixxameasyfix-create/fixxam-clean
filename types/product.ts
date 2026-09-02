export interface Product {

  id: string;

  workerId: string;

  storeId?: string;

  workerName: string;

  name: string;

  description: string;

  category: string;

  price: number;

  stock: number;

  thumbnail: string;

  images: string[];

  featured: boolean;

  delivery: boolean;

  condition:
    | "new"
    | "used";

  status:
    | "active"
    | "out_of_stock";

  sold: number;

  views: number;

  rating: number;

  createdAt: unknown;

  updatedAt: unknown;

}