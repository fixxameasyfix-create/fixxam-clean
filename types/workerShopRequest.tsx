export type WorkerShopRequestStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'completed';

export type WorkerShopRequest = {
  id: string;

  customerId: string;
  customerName: string;

  serviceId: string;
  serviceName: string;
  servicePriceLabel: string;

  requestedDate: string;
  requestedTime: string;

  description: string;

  photoUris: string[];

  status: WorkerShopRequestStatus;

  createdAtLabel: string;
};