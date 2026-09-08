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
   CONSTANTS
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

  const handleStateSelect =
    useCallback(
      (
        value: string,
      ) => {
        setState(value);

        setLga("");
      },
      [
        setLga,
        setState,
      ],
    );

  const handleLgaSelect =
    useCallback(
      (
        value: string,
      ) => {
        setLga(value);
      },
      [setLga],
    );

  return (
    <View
      style={
        styles.container
      }
    >
      <SearchableModalPicker
        label="State"
        placeholder="Select State"
        value={
          state
        }
        data={
          STATE_OPTIONS
        }
        onSelect={
          handleStateSelect
        }
      />

      <View
        style={
          styles.space
        }
      />

      <SearchableModalPicker
        label="Local Government"
        placeholder="Select LGA"
        value={
          lga
        }
        data={
          availableLgas
        }
        onSelect={
          handleLgaSelect
        }
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
        FixxamTokens.spacing.lg,
    },

    space: {
      height:
        FixxamTokens.spacing.md,
    },
  });