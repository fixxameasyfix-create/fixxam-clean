/* ============================================================
   FIXXAM ACTIVITY HOOK
============================================================ */

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { auth } from "@/firebase/config";

import {
  subscribeToFixxamActivity,
} from "@/firebase/queries/fixxamActivity";

import type {
  FixxamActivityPeriod,
  FixxamActivityResult,
} from "@/utils/fixxam/calculateFixxamActivity";

/* ============================================================
   TYPES
============================================================ */

export type UseFixxamActivityResult = {
  activity: FixxamActivityResult | null;

  period: FixxamActivityPeriod;

  setPeriod: (
    period: FixxamActivityPeriod,
  ) => void;

  loading: boolean;

  error: string | null;

  refresh: () => void;
};

/* ============================================================
   HOOK
============================================================ */

export function useFixxamActivity(
  initialPeriod: FixxamActivityPeriod = "30D",
): UseFixxamActivityResult {
  const [
    period,
    setPeriodState,
  ] = useState<FixxamActivityPeriod>(
    initialPeriod,
  );

  const [
    activity,
    setActivity,
  ] =
    useState<FixxamActivityResult | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    refreshKey,
    setRefreshKey,
  ] = useState(0);

  /* ==========================================================
     PERIOD
  ========================================================== */

  const setPeriod =
    useCallback(
      (
        nextPeriod: FixxamActivityPeriod,
      ) => {
        if (
          nextPeriod === period
        ) {
          return;
        }

        console.log(
          "FIXXAM_ACTIVITY_PERIOD_CHANGED",
          nextPeriod,
        );

        setLoading(true);
        setError(null);

        setPeriodState(
          nextPeriod,
        );
      },
      [period],
    );

  /* ==========================================================
     REFRESH
  ========================================================== */

  const refresh =
    useCallback(() => {
      console.log(
        "FIXXAM_ACTIVITY_REFRESH",
      );

      setLoading(true);
      setError(null);

      setRefreshKey(
        (value) =>
          value + 1,
      );
    }, []);

  /* ==========================================================
     SUBSCRIBE
  ========================================================== */

  useEffect(() => {
    let active = true;

    const customerId =
      auth.currentUser?.uid;

    console.log(
      "==========================================",
    );

    console.log(
      "FIXXAM_ACTIVITY_HOOK_STARTED",
    );

    console.log(
      "CUSTOMER ID:",
      customerId,
    );

    console.log(
      "PERIOD:",
      period,
    );

    console.log(
      "REFRESH KEY:",
      refreshKey,
    );

    console.log(
      "==========================================",
    );

    /* --------------------------------------------------------
       AUTH CHECK
    -------------------------------------------------------- */

    if (!customerId) {
      console.log(
        "FIXXAM_ACTIVITY_NO_CUSTOMER_ID",
      );

      setActivity(null);
      setLoading(false);

      setError(
        "Please sign in to view Activity.",
      );

      return () => {
        active = false;
      };
    }

    /* --------------------------------------------------------
       START
    -------------------------------------------------------- */

    console.log(
      "FIXXAM_ACTIVITY_SUBSCRIBING",
      {
        customerId,
        period,
      },
    );

    setLoading(true);
    setError(null);

    /* --------------------------------------------------------
       FIRESTORE SUBSCRIPTION
    -------------------------------------------------------- */

    const unsubscribe =
      subscribeToFixxamActivity(
        customerId,

        period,

        /* ----------------------------------------------------
           RESULT
        ---------------------------------------------------- */

        (result) => {
          console.log(
            "==========================================",
          );

          console.log(
            "FIXXAM_ACTIVITY_RESULT_RECEIVED",
          );

          console.log(
            "RESULT:",
            result,
          );

          console.log(
            "VOLUME:",
            result.volume,
          );

          console.log(
            "TRANSACTIONS:",
            result.transactions,
          );

          console.log(
            "SUCCESSFUL:",
            result.successfulTransactions,
          );

          console.log(
            "FAILED:",
            result.failedTransactions,
          );

          console.log(
            "SUCCESS RATE:",
            result.successRate,
          );

          console.log(
            "GROWTH:",
            result.growth,
          );

          console.log(
            "CHART DATA:",
            result.chartData,
          );

          console.log(
            "==========================================",
          );

          if (!active) {
            return;
          }

          setActivity(result);
          setLoading(false);
          setError(null);
        },

        /* ----------------------------------------------------
           ERROR
        ---------------------------------------------------- */

        (listenerError) => {
          console.error(
            "==========================================",
          );

          console.error(
            "FIXXAM_ACTIVITY_LISTENER_ERROR",
          );

          console.error(
            listenerError,
          );

          console.error(
            "==========================================",
          );

          if (!active) {
            return;
          }

          setActivity(null);
          setLoading(false);

          setError(
            listenerError.message ||
              "Unable to load Activity.",
          );
        },
      );

    /* --------------------------------------------------------
       CLEANUP
    -------------------------------------------------------- */

    return () => {
      console.log(
        "FIXXAM_ACTIVITY_UNSUBSCRIBED",
      );

      active = false;

      unsubscribe();
    };
  }, [
    period,
    refreshKey,
  ]);

  /* ==========================================================
     RESULT
  ========================================================== */

  return {
    activity,
    period,
    setPeriod,
    loading,
    error,
    refresh,
  };
}