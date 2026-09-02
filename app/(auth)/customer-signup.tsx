import React, { useState } from "react";

import { AppScreen } from "@/components/ui";

import AuthHeader from "@/components/auth/AuthHeader";
import CustomerSignupForm from "@/components/auth/CustomerSignupForm";

export default function CustomerSignup() {
  const [step, setStep] = useState(1);

  return (
    <AppScreen>
      {step === 1 && (
        <AuthHeader
          title="Join as a Customer"
          subtitle="Find Trusted Professionals Near You"
          icon="person-circle"
        />
      )}

      <CustomerSignupForm
        step={step}
        setStep={setStep}
      />
    </AppScreen>
  );
}