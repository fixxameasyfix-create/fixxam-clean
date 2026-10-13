import React, {
  useMemo,
} from "react";

import {
  AppScreen,
} from "@/components/ui";

import WorkerSignupForm from "@/components/auth/WorkerSignupForm";

import {
  FixxamTokens,
} from "@/theme";

import {
  useLocalSearchParams,
} from "expo-router";

/* ============================================================
   TYPES
============================================================ */

type RegistrationSource =
  | "customer"
  | "new";

/* ============================================================
   SCREEN
============================================================ */

export default function WorkerSignup() {
  const params =
    useLocalSearchParams<{
      source?: string;
    }>();

  /* ==========================================================
     REGISTRATION SOURCE

     customer → prefill worker registration from
                existing customer details.

     new      → start worker registration with
                independent personal details.
  ========================================================== */

  const source =
    useMemo<RegistrationSource>(
      () =>
        params.source ===
        "customer"
          ? "customer"
          : "new",
      [params.source],
    );

  return (
    <AppScreen
      role="worker"
      scrollEnabled
      keyboardAvoiding
      contentContainerStyle={{
        flexGrow: 1,

        paddingHorizontal:
          FixxamTokens.spacing.lg,

        paddingBottom:
          FixxamTokens.spacing.xxl,
      }}
    >
      <WorkerSignupForm
        registrationSource={
          source
        }
      />
    </AppScreen>
  );
}