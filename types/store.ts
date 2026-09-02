export interface Store {
  id: string;

  ownerId: string;

  name: string;

  description: string;

  logo: string;

  coverPhoto: string;

  phone: string;

  email: string;

  stateId: string;

  lgaId: string;

  address: string;

  latitude: number;

  longitude: number;

  verified: boolean;

  active: boolean;

  rating: number;

  reviewsCount: number;

  followersCount: number;

  totalProducts: number;

  createdAt: any;

  updatedAt: any;
}