import React, { memo } from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

import { Booking } from "@/types/booking";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  status: Booking["status"];
};

const steps = [
  {
    key: "accepted",
    title: "Confirmed",
  },
  {
    key: "in-progress",
    title: "Working",
  },
  {
    key: "completed",
    title: "Done",
  },
] as const;

type TimelineStepKey =
  (typeof steps)[number]["key"];

/* ============================================================
   HELPERS
============================================================ */

function getCurrentIndex(
  status: Booking["status"],
): number {
  switch (status) {
    case "accepted":
      return 0;

    case "in-progress":
      return 1;

    case "completed":
      return 2;

    /*
     * Timeline bai bayyana ba
     * kafin worker ya karɓi order.
     */
    case "pending":

    /*
     * Cancelled / expired orders
     * ba su da active progress.
     */
    case "cancelled":
    case "expired":

    default:
      return -1;
  }
}

/* ============================================================
   COMPONENT
============================================================ */

function OrderTimeline({
  status,
}: Props) {
  const currentIndex =
    getCurrentIndex(status);

  /*
   * Kada timeline ya bayyana
   * idan order bai fara active flow ba.
   */
  if (currentIndex < 0) {
    return null;
  }

  const currentStep =
    steps[currentIndex];

  if (!currentStep) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View style={styles.topRow}>
        <AppText
          weight="bold"
          style={styles.title}
        >
          Progress
        </AppText>

        <View style={styles.currentBadge}>
          <View style={styles.dot} />

          <AppText
            weight="bold"
            style={styles.currentText}
          >
            {currentStep.title}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          TIMELINE
      ====================================================== */}

      <View style={styles.progressRow}>
        {steps.map(
          (step, index) => {
            const completed =
              index < currentIndex;

            const active =
              index === currentIndex;

            return (
              <React.Fragment
                key={
                  step.key as TimelineStepKey
                }
              >
                {/* STEP */}

                <View style={styles.step}>
                  <View
                    style={[
                      styles.circle,

                      completed &&
                        styles.completedCircle,

                      active &&
                        styles.activeCircle,
                    ]}
                  >
                    <Ionicons
                      name={
                        completed
                          ? "checkmark"
                          : active
                          ? "ellipse"
                          : "ellipse-outline"
                      }
                      size={
                        completed
                          ? 12
                          : 9
                      }
                      color={
                        completed ||
                        active
                          ? "#FFFFFF"
                          : "#CBD5E1"
                      }
                    />
                  </View>

                  <AppText
                    numberOfLines={1}
                    style={[
                      styles.stepText,

                      completed &&
                        styles.completedText,

                      active &&
                        styles.activeText,
                    ]}
                  >
                    {step.title}
                  </AppText>
                </View>

                {/* CONNECTOR */}

                {index <
                  steps.length - 1 && (
                  <View
                    style={[
                      styles.line,

                      index <
                        currentIndex &&
                        styles.completedLine,
                    ]}
                  />
                )}
              </React.Fragment>
            );
          },
        )}
      </View>
    </View>
  );
}

/* ============================================================
   EXPORT
============================================================ */

export default memo(
  OrderTimeline,
);

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  container: {
    width: "100%",

    marginBottom: 12,

    paddingVertical: 12,
    paddingHorizontal: 14,

    backgroundColor: "#FFFFFF",

    borderRadius: 16,

    borderWidth: 1,
    borderColor: "#EEF2F7",
  },

  /* ==========================================================
     HEADER
  ========================================================== */

  topRow: {
    width: "100%",

    flexDirection: "row",

    alignItems: "center",

    justifyContent:
      "space-between",

    marginBottom: 14,
  },

  title: {
    fontSize: 14,

    color: "#0F172A",
  },

  currentBadge: {
    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 8,
    paddingVertical: 5,

    borderRadius: 999,

    backgroundColor: "#EFF6FF",
  },

  dot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    marginRight: 5,

    backgroundColor: "#2563EB",
  },

  currentText: {
    fontSize: 10.5,

    color: "#2563EB",
  },

  /* ==========================================================
     PROGRESS
  ========================================================== */

  progressRow: {
    width: "100%",

    flexDirection: "row",

    alignItems: "flex-start",
  },

  step: {
    width: 50,

    alignItems: "center",
  },

  circle: {
    width: 22,
    height: 22,

    borderRadius: 11,

    backgroundColor: "#FFFFFF",

    borderWidth: 1.5,
    borderColor: "#CBD5E1",

    alignItems: "center",
    justifyContent: "center",
  },

  completedCircle: {
    backgroundColor: "#22C55E",

    borderColor: "#22C55E",
  },

  activeCircle: {
    backgroundColor: "#2563EB",

    borderColor: "#2563EB",
  },

  line: {
    flex: 1,

    height: 2,

    marginTop: 10,

    backgroundColor: "#E2E8F0",
  },

  completedLine: {
    backgroundColor: "#22C55E",
  },

  /* ==========================================================
     LABEL
  ========================================================== */

  stepText: {
    width: 55,

    marginTop: 5,

    fontSize: 9.5,

    lineHeight: 12,

    color: "#94A3B8",

    textAlign: "center",
  },

  completedText: {
    color: "#16A34A",
  },

  activeText: {
    color: "#2563EB",

    fontWeight: "700",
  },
});