import React from "react";

import {
  AppScreen,
} from "@/components/ui";

import WorkerSignupForm from "@/components/auth/WorkerSignupForm";

import {
  FixxamTokens,
} from "@/theme";

/* ============================================================
   SCREEN
============================================================ */

export default function WorkerSignup() {
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
      <WorkerSignupForm />
    </AppScreen>
  );
}