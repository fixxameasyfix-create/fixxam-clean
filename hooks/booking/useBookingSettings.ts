export interface BookingSettings {

  urgentEnabled: boolean;

  urgentFee: number;

  estimatedArrival: string;

  workingHours: {

    opensAt: number;

    closesAt: number;

  };

  maxPhotos: number;

  maxNoteLength: number;

}