import {
  useCallback,
  useMemo,
  useState,
} from "react";

import type {
  AiBookingInputMode,
  AiBookingMatch,
  AiBookingState,
} from "./types";

const MAX_PHOTOS = 3;

const INITIAL_STATE: AiBookingState = {
  mode: null,

  text: "",

  photos: [],

  status: "idle",

  match: null,

  error: null,
};

export default function useAiBooking() {
  const [state, setState] =
    useState<AiBookingState>(
      INITIAL_STATE,
    );

  const selectMode = useCallback(
    (mode: AiBookingInputMode) => {
      setState((current) => ({
        ...current,

        mode,

        status: "idle",

        error: null,

        match: null,
      }));
    },
    [],
  );

  const setText = useCallback(
    (text: string) => {
      setState((current) => ({
        ...current,

        text,

        error: null,
      }));
    },
    [],
  );

  const addPhoto = useCallback(
    (uri: string) => {
      const normalizedUri =
        uri.trim();

      if (!normalizedUri) {
        return;
      }

      setState((current) => {
        if (
          current.photos.length >=
          MAX_PHOTOS
        ) {
          return current;
        }

        if (
          current.photos.includes(
            normalizedUri,
          )
        ) {
          return current;
        }

        return {
          ...current,

          photos: [
            ...current.photos,
            normalizedUri,
          ],

          error: null,
        };
      });
    },
    [],
  );

  const removePhoto = useCallback(
    (index: number) => {
      setState((current) => {
        if (
          index < 0 ||
          index >=
            current.photos.length
        ) {
          return current;
        }

        return {
          ...current,

          photos:
            current.photos.filter(
              (_, photoIndex) =>
                photoIndex !== index,
            ),

          error: null,
        };
      });
    },
    [],
  );

  const setAnalyzing = useCallback(
    () => {
      setState((current) => ({
        ...current,

        status: "analyzing",

        error: null,
      }));
    },
    [],
  );

  const setMatch = useCallback(
    (match: AiBookingMatch) => {
      setState((current) => ({
        ...current,

        status: "matched",

        match,

        error: null,
      }));
    },
    [],
  );

  const setError = useCallback(
    (error: string) => {
      setState((current) => ({
        ...current,

        status: "error",

        error:
          error.trim() ||
          "Something went wrong. Please try again.",

        match: null,
      }));
    },
    [],
  );

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const canAnalyze =
    state.mode === "text"
      ? state.text.trim().length >= 5
      : state.mode === "photo"
        ? state.photos.length > 0
        : false;

  return useMemo(
    () => ({
      ...state,

      canAnalyze,

      maxPhotos: MAX_PHOTOS,

      selectMode,

      setText,

      addPhoto,

      removePhoto,

      setAnalyzing,

      setMatch,

      setError,

      reset,
    }),
    [
      state,
      canAnalyze,
      selectMode,
      setText,
      addPhoto,
      removePhoto,
      setAnalyzing,
      setMatch,
      setError,
      reset,
    ],
  );
}