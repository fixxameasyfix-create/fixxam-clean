import { useCallback, useState } from "react";

export type FakeServiceStatus =
  | "pending"
  | "accepted"
  | "awaiting_start_confirmation"
  | "in-progress"
  | "awaiting_completion_confirmation"
  | "completed";

type FakeServiceLifecycle = {
  status: FakeServiceStatus;
  startService: () => boolean;
  confirmStart: () => boolean;
  completeService: () => boolean;
  confirmCompletion: () => boolean;
  reset: (status?: FakeServiceStatus) => void;
};

export function useFakeServiceLifecycle(
  initialStatus: FakeServiceStatus = "accepted",
): FakeServiceLifecycle {
  const [status, setStatus] =
    useState<FakeServiceStatus>(initialStatus);

  const startService = useCallback(() => {
    if (status !== "accepted") return false;

    setStatus("awaiting_start_confirmation");
    return true;
  }, [status]);

  const confirmStart = useCallback(() => {
    if (status !== "awaiting_start_confirmation") return false;

    setStatus("in-progress");
    return true;
  }, [status]);

  const completeService = useCallback(() => {
    if (status !== "in-progress") return false;

    setStatus("awaiting_completion_confirmation");
    return true;
  }, [status]);

  const confirmCompletion = useCallback(() => {
    if (status !== "awaiting_completion_confirmation") return false;

    setStatus("completed");
    return true;
  }, [status]);

  const reset = useCallback(
    (nextStatus: FakeServiceStatus = "accepted") => {
      setStatus(nextStatus);
    },
    [],
  );

  return {
    status,
    startService,
    confirmStart,
    completeService,
    confirmCompletion,
    reset,
  };
}