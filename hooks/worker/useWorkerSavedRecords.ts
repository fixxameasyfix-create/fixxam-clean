import {
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  auth,
} from "@/firebase/config";

import {
  subscribeToWorkerSavedRecords,
  type WorkerSavedRecord,
} from "@/services/savedWorkers/workerSavedService";

/* ============================================================
   HOOK
============================================================ */

export default function useWorkerSavedRecords() {
  const [
    records,
    setRecords,
  ] =
    useState<
      WorkerSavedRecord[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  useEffect(() => {
    let unsubscribeRecords:
      | (() => void)
      | undefined;

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        user => {
          unsubscribeRecords?.();

          unsubscribeRecords =
            undefined;

          setRecords([]);
          setError(null);

          if (!user) {
            setLoading(false);

            return;
          }

          setLoading(true);

          unsubscribeRecords =
            subscribeToWorkerSavedRecords(
              user.uid,

              nextRecords => {
                setRecords(
                  nextRecords,
                );

                setLoading(
                  false,
                );
              },

              subscriptionError => {
                console.error(
                  "USE_WORKER_SAVED_RECORDS_ERROR:",
                  subscriptionError,
                );

                setRecords([]);

                setError(
                  "Unable to load your saved records.",
                );

                setLoading(
                  false,
                );
              },
            );
        },
      );

    return () => {
      unsubscribeRecords?.();
      unsubscribeAuth();
    };
  }, []);

  return {
    records,
    loading,
    error,
  };
}