import React, { useMemo } from "react";
import {
  StyleSheet,
  View,
} from "react-native";

import states from "@/assets/data/states.json";
import lgas from "@/assets/data/lgas.json";

import SearchableModalPicker from "@/components/selectors/SearchableModalPicker";

type Props = {
  state: string;
  lga: string;

  setState: (value: string) => void;
  setLga: (value: string) => void;
};

export default function LocationSelector({
  state,
  lga,
  setState,
  setLga,
}: Props) {
  const availableLgas = useMemo(() => {
    const data =
      lgas as Record<string, string[]>;

    return state
      ? data[state] || []
      : [];
  }, [state]);

  return (
    <View style={styles.container}>
      <SearchableModalPicker
        label="State"
        placeholder="Select State"
        value={state}
        data={states as string[]}
        onSelect={(value) => {
          setState(value);
          setLga("");
        }}
      />

      <View style={styles.space} />

      <SearchableModalPicker
        label="Local Government"
        placeholder="Select LGA"
        value={lga}
        data={availableLgas}
        onSelect={setLga}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },

  space: {
    height: 12,
  },
});