import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import { AppText } from "@/components/ui";

import BookingProgressBar from "./BookingProgressBar";
import BookingProgressSteps from "./BookingProgressSteps";

type Props = {
  currentStep: number;
  totalSteps: number;
};

function BookingProgress({
  currentStep,
  totalSteps,
}: Props) {

  const progress =
    (currentStep / totalSteps) * 100;

  return (

    <View style={styles.card}>

      <View style={styles.header}>

        <View>

          <AppText
            weight="bold"
            style={styles.title}
          >
            Booking Progress
          </AppText>

          <AppText
            style={styles.subtitle}
          >
            {Math.round(progress)}
            % Complete
          </AppText>

        </View>

        <View style={styles.badge}>

          <AppText
            style={styles.badgeText}
          >
            Step {currentStep}
            {" / "}
            {totalSteps}
          </AppText>

        </View>

      </View>

      <BookingProgressBar
        progress={progress}
      />

      <BookingProgressSteps
        currentStep={currentStep}
      />

    </View>

  );

}

export default memo(
  BookingProgress
);

const styles = StyleSheet.create({

  card: {

    backgroundColor: "#FFFFFF",

    borderRadius: 22,

    padding: 18,

    marginBottom: 18,

    borderWidth: 1,

    borderColor: "#EEF2F7",

    shadowColor: "#000",

    shadowOpacity: 0.05,

    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,

  },

  header: {

    flexDirection: "row",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginBottom: 16,

  },

  title: {

    fontSize: 18,

    color: "#0F172A",

  },

  subtitle: {

    marginTop: 3,

    fontSize: 12,

    color: "#94A3B8",

  },

  badge: {

    backgroundColor: "#FFF7ED",

    paddingHorizontal: 12,

    paddingVertical: 7,

    borderRadius: 999,

  },

  badgeText: {

    color: "#EA580C",

    fontSize: 12,

    fontWeight: "700",

  },

});