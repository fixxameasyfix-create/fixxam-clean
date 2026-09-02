import React from "react";

import { AppScreen } from "@/components/ui";
import WorkerSignupForm from "@/components/auth/WorkerSignupForm";

export default function WorkerSignup() {
  return (
    <AppScreen
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingBottom: 40,
      }}
    >
     

      <WorkerSignupForm />
    </AppScreen>
  );
}