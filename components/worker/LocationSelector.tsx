import React, {
  memo,
  useCallback,
  useMemo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import states from "@/assets/data/states.json";
import lgas from "@/assets/data/lgas.json";

import SearchableModalPicker from "@/components/selectors/SearchableModalPicker";

import {
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  state: string;

  lga: string;

  setState: (
    value: string,
  ) => void;

  setLga: (
    value: string,
  ) => void;
};

/* ============================================================
   DATA
============================================================ */

const STATE_OPTIONS =
  states as string[];

const LGA_MAP =
  lgas as Record<
    string,
    string[]
  >;

/* ============================================================
   COMPONENT
============================================================ */

function LocationSelector({
  state,
  lga,
  setState,
  setLga,
}: Props) {
  /* ==========================================================
     LGA OPTIONS
  ========================================================== */

  const availableLgas =
    useMemo(() => {
      if (!state) {
        return [];
      }

      return (
        LGA_MAP[state] ??
        []
      );
    }, [state]);

  /* ==========================================================
     STATE SELECT
  ========================================================== */

  const handleStateSelect =
    useCallback(
      (value: string) => {
        setState(value);

        // State change invalidates
        // the previous LGA.
        setLga("");
      },
      [
        setLga,
        setState,
      ],
    );

  /* ==========================================================
     LGA SELECT
  ========================================================== */

  const handleLgaSelect =
    useCallback(
      (value: string) => {
        setLga(value);
      },
      [setLga],
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View
      style={
        styles.container
      }
    >
      <SearchableModalPicker
        label="State"
        placeholder="Select State"
        value={state}
        data={STATE_OPTIONS}
        onSelect={
          handleStateSelect
        }
        icon="location-outline"
      />

      <View
        style={
          styles.space
        }
      />

      <SearchableModalPicker
        label="Local Government Area"
        placeholder="Select LGA"
        value={lga}
        data={availableLgas}
        onSelect={
          handleLgaSelect
        }
        icon="map-outline"
      />
    </View>
  );
}

export default memo(
  LocationSelector,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      marginBottom:
        FixxamTokens.spacing.sm,
    },

    space: {
      height: 4,
    },
  });