import { useState } from "react";

export function useWorkerSteps(
  totalSteps = 5
) {
  const [step, setStep] =
    useState(1);

  const nextStep = () => {
    setStep((prev) =>
      Math.min(prev + 1, totalSteps)
    );
  };

  const prevStep = () => {
    setStep((prev) =>
      Math.max(prev - 1, 1)
    );
  };

  const goToStep = (
    value: number
  ) => {
    if (
      value >= 1 &&
      value <= totalSteps
    ) {
      setStep(value);
    }
  };

  return {
    step,
    setStep,
    nextStep,
    prevStep,
    goToStep,
  };
}