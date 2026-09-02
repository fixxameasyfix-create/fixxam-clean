import React, { memo } from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

/* ============================================================
   TYPES
============================================================ */

type Step = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
};

/* ============================================================
   CONSTANTS
============================================================ */

const STEPS: readonly Step[] = [
  {
    title: "Inspect",
    icon: "search-outline",
  },
  {
    title: "Confirm",
    icon: "checkmark-circle-outline",
  },
  {
    title: "Pay",
    icon: "card-outline",
  },
];

/* ============================================================
   COMPONENT
============================================================ */

function PayAfterDelivery() {
  return (
    <View style={styles.container}>
      {/* ======================================================
          ICON
      ====================================================== */}

      <View style={styles.iconBox}>
        <Ionicons
          name="shield-checkmark"
          size={32}
          color="#2563EB"
        />
      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <View style={styles.content}>
        <AppText
          weight="bold"
          style={styles.title}
          numberOfLines={1}
        >
          Pay After Delivery
        </AppText>

        <AppText
          style={styles.subtitle}
          numberOfLines={2}
        >
          Inspect your items, confirm and then pay
        </AppText>

        {/* ====================================================
            STEPS
        ==================================================== */}

        <View style={styles.steps}>
          {STEPS.map((step, index) => (
            <React.Fragment key={step.title}>
              <View style={styles.step}>
                <View style={styles.stepIconBox}>
                  <Ionicons
                    name={step.icon}
                    size={18}
                    color="#64748B"
                  />
                </View>

                <AppText
                  style={styles.stepText}
                  numberOfLines={1}
                >
                  {step.title}
                </AppText>
              </View>

              {index < STEPS.length - 1 && (
                <View style={styles.connector}>
                  <Ionicons
                    name="arrow-forward"
                    size={15}
                    color="#CBD5E1"
                  />
                </View>
              )}
            </React.Fragment>
          ))}
        </View>
      </View>
    </View>
  );
}

export default memo(PayAfterDelivery);

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  /* ==========================================================
     CONTAINER
  ========================================================== */

  container: {
    flexDirection: "row",
    alignItems: "center",

    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 24,

    padding: 16,

    backgroundColor: "#EFF6FF",

    borderRadius: 22,

    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  /* ==========================================================
     MAIN ICON
  ========================================================== */

  iconBox: {
    width: 58,
    height: 58,

    borderRadius: 20,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  /* ==========================================================
     CONTENT
  ========================================================== */

  content: {
    flex: 1,

    marginLeft: 14,

    minWidth: 0,
  },

  title: {
    fontSize: 17,
    lineHeight: 22,

    color: "#0F172A",
  },

  subtitle: {
    marginTop: 3,

    fontSize: 12.5,
    lineHeight: 18,

    color: "#64748B",
  },

  /* ==========================================================
     STEPS
  ========================================================== */

  steps: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 12,
  },

  step: {
    alignItems: "center",

    minWidth: 48,
  },

  stepIconBox: {
    width: 30,
    height: 30,

    borderRadius: 10,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  stepText: {
    marginTop: 4,

    fontSize: 10.5,
    lineHeight: 14,

    color: "#64748B",

    textAlign: "center",
  },

  /* ==========================================================
     CONNECTOR
  ========================================================== */

  connector: {
    flex: 1,

    minWidth: 12,

    alignItems: "center",
    justifyContent: "center",

    marginHorizontal: 2,

    marginBottom: 16,
  },
});