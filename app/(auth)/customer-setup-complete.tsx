import React, { useState } from "react";

import { AppScreen } from "@/components/ui";

import CustomerSignupForm from "@/components/auth/CustomerSignupForm";

export default function CustomerSignup() {
  const [step, setStep] = useState(1);

  return (
    <AppScreen>
      <CustomerSignupForm
        step={step}
        setStep={setStep}
      />
    </AppScreen>
  );
}