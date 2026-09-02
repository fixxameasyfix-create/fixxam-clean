import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import * as Crypto from "expo-crypto";

import useDebounce from "@/hooks/shared/useDebounce";

import googlePlaceDetails from "@/services/google/googlePlaceDetails";
import googlePlaces from "@/services/google/googlePlaces";

import {
  GooglePlaceSuggestion,
} from "@/services/google/types";

export type LocationSuggestion = {
  id: string;
  title: string;
  subtitle: string;
  latitude: number;
  longitude: number;
};

type Props = {
  onSelectLocation: (
    latitude: number,
    longitude: number,
    address: string
  ) => void;
};

export default function useLocationSearch({
  onSelectLocation,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  const [query, setQuery] =
    useState("");

  const [suggestions, setSuggestions] =
    useState<LocationSuggestion[]>([]);

  const debouncedQuery =
    useDebounce(query, 500);

  const sessionToken = useRef(
    Crypto.randomUUID()
  );

  const requestId = useRef(0);

  const search = useCallback(
    async (text: string) => {
      const trimmedText =
        text.trim();

      if (trimmedText.length < 3) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      const currentRequestId =
        ++requestId.current;

      try {
        setLoading(true);

        const response =
          await googlePlaces(
            trimmedText,
            sessionToken.current
          );

        if (
          currentRequestId !==
          requestId.current
        ) {
          return;
        }

        const nextSuggestions =
          response.suggestions?.reduce<
            LocationSuggestion[]
          >((result, item) => {
            const prediction =
              item.placePrediction;

            if (!prediction?.placeId) {
              return result;
            }

            result.push({
              id: prediction.placeId,

              title:
                prediction
                  .structuredFormat
                  ?.mainText
                  ?.text ??
                prediction.text?.text ??
                "",

              subtitle:
                prediction
                  .structuredFormat
                  ?.secondaryText
                  ?.text ??
                "",

              latitude: 0,
              longitude: 0,
            });

            return result;
          }, []) ?? [];

        setSuggestions(
          nextSuggestions
        );
      } catch (error) {
        if (
          currentRequestId !==
          requestId.current
        ) {
          return;
        }

        console.error(
          "Location search failed:",
          error
        );

        setSuggestions([]);
      } finally {
        if (
          currentRequestId ===
          requestId.current
        ) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    search(debouncedQuery);
  }, [
    debouncedQuery,
    search,
  ]);

  const select = useCallback(
    async (
      item: LocationSuggestion
    ) => {
      const currentRequestId =
        ++requestId.current;

      try {
        setLoading(true);

        const result =
          await googlePlaceDetails(
            item.id
          );

        if (
          currentRequestId !==
          requestId.current
        ) {
          return;
        }

        onSelectLocation(
          result.latitude,
          result.longitude,
          result.address
        );

        setQuery(
          result.address
        );

        setSuggestions([]);

        sessionToken.current =
          Crypto.randomUUID();
      } catch (error) {
        if (
          currentRequestId !==
          requestId.current
        ) {
          return;
        }

        console.error(
          "Failed to select location:",
          error
        );
      } finally {
        if (
          currentRequestId ===
          requestId.current
        ) {
          setLoading(false);
        }
      }
    },
    [onSelectLocation]
  );

  return useMemo(
    () => ({
      loading,
      query,
      suggestions,
      setQuery,
      select,
    }),
    [
      loading,
      query,
      suggestions,
      select,
    ]
  );
}