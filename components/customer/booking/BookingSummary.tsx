type Props = {
  // Worker
  workerId: string;
  workerName: string;
  workerPhoto: string;
  workerRating: number;
  workerVerified: boolean;

  // Service
  serviceId: string;
  serviceName: string;

  // Booking
  bookingId: string;

  bookingDate: string;
  bookingTime: string;

  address: string;

  photos: string[];

  note: string;

  urgent: boolean;

  // Price
  currency?: string;

  basePrice: number;
  urgentFee: number;

  // ETA
  estimatedArrival?: string;

  // Loading
  loading?: boolean;

  // Actions
  onEdit: () => void;
  onConfirm: () => void;
};