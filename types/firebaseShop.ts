import type {
  Timestamp,
} from 'firebase/firestore';

import type {
  ShopCategoryId,
} from '../constants/shopCategories';

import type {
  WorkerShopBusinessHour,
} from './workerShop';

export type FirebaseShopService = {
  id: string;
  name: string;
  description: string;
  startingPrice: number;
  imageUrl: string;
  isActive: boolean;
};

export type FirebaseShop = {
  id: string;
  ownerId: string;

  name: string;
  category: ShopCategoryId;
  description: string;
  phone: string;

  address: string;
  latitude: number;
  longitude: number;

  coverPhotoUrl: string;
  logoUrl: string;

  businessHours: WorkerShopBusinessHour[];

  isActive: boolean;

  rating: number;
  reviewCount: number;

  serviceCount: number;
  minimumStartingPrice: number | null;

  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};