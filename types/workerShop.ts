export type WorkerShopService = {
  id: string;
  name: string;
  description: string;
  startingPrice: number;
  imageUri: string;
  isActive: boolean;
};


export type WorkerShopBusinessHour = {
  id: string;
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};