import { GeoPoint } from "firebase/firestore";

export interface Worker {
  id: string;

  userId: string;

  firstName: string;
  surname: string;
  otherName?: string;

  fullName: string;

  email: string;
  phone: string;

  photoUrl: string;
  coverPhotoUrl: string;

  categoryId: string;
  subcategoryId: string;

  services: string[];

  experience: string;

  bio: string;

  stateId: string;
  lgaId: string;

  address: string;

  latitude: number;
  longitude: number;

  geoHash?: string;

geoPoint?: GeoPoint;

city?: string;

state?: string;

  hourlyRate: number;

  verified: boolean;

  online: boolean;

  available: boolean;

  rating: number;

  reviewsCount: number;

  completedJobs: number;

  jobsCancelled: number;

  responseTime: string;

  
  distance?: number;

primaryServiceId?: string;

primaryServiceName?: string;

storeId?: string;

  createdAt: any;

  updatedAt: any;

  lastSeen: any;
}