export type GooglePlacesResponse = {
  suggestions?: GooglePlaceSuggestion[];
};

export type GooglePlaceSuggestion = {
  placePrediction: {
    placeId: string;

    text: {
      text: string;
    };

    structuredFormat?: {
      mainText?: {
        text: string;
      };

      secondaryText?: {
        text: string;
      };
    };
  };
};

export type GooglePlaceDetailsResponse = {
  id: string;

  formattedAddress: string;

  location: {
    latitude: number;

    longitude: number;
  };
};

export type GooglePlaceLocation = {
  latitude: number;

  longitude: number;

  address: string;
};