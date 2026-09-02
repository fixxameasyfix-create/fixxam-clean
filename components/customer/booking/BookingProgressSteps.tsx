import React, {
  memo,
} from "react";

import {
  View,
  StyleSheet,
} from "react-native";

import { AppText } from "@/components/ui";

type Props = {
  currentStep: number;
};

const STEPS = [
  "Schedule",
  "Details",
  "Confirm",
];

function BookingProgressSteps({
  currentStep,
}: Props) {

  return (

    <View style={styles.container}>

      {STEPS.map(
        (
          step,
          index
        ) => {

          const active =
            index + 1 <=
            currentStep;

          return (

            <View
              key={step}
              style={styles.item}
            >

              <View
                style={[
                  styles.dot,

                  active &&
                    styles.activeDot,
                ]}
              />

              <AppText
                style={[
                  styles.label,

                  active &&
                    styles.activeLabel,
                ]}
              >
                {step}
              </AppText>

            </View>

          );

        }
      )}

    </View>

  );

}

export default memo(
  BookingProgressSteps
);

const styles = StyleSheet.create({

  container: {

    flexDirection: "row",

    justifyContent:
      "space-between",

    marginTop: 14,

  },

  item: {

    alignItems: "center",

    flex: 1,

  },

  dot: {

    width: 10,

    height: 10,

    borderRadius: 5,

    backgroundColor:
      "#CBD5E1",

    marginBottom: 6,

  },

  activeDot: {

    width: 12,

    height: 12,

    borderRadius: 6,

    backgroundColor:
      "#FF6B00",

  },

  label: {

    fontSize: 11,

    color: "#94A3B8",

    fontWeight: "600",

  },

  activeLabel: {

    color: "#0F172A",

    fontWeight: "700",

  },

});