import { useCallback, useEffect, useState } from "react";

import { getWorkerDetails } from "@/firebase/queries/workerDetails";

import {
  workerDetailsMapper,
  WorkerDetails,
} from "@/firebase/mappers/workerDetailsMapper";

type ReturnType = {
  loading: boolean;
  error: string | null;
  worker: WorkerDetails | null;
  reload: () => Promise<void>;
};

export default function useWorkerDetails(
  workerId: string,
): ReturnType {
  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [worker, setWorker] =
    useState<WorkerDetails | null>(
      null,
    );

  const load =
    useCallback(async () => {
      if (!workerId) {
        setError("Invalid worker.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const snapshot =
          await getWorkerDetails(
            workerId,
          );

        setWorker(
          workerDetailsMapper(
            snapshot,
          ),
        );
      } catch (err) {
        console.error(err);

        setError(
          "Unable to load worker details.",
        );
      } finally {
        setLoading(false);
      }
    }, [workerId]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    loading,
    error,
    worker,
    reload: load,
  };
}