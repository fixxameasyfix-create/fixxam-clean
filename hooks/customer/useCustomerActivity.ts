import {
  useEffect,
  useState,
} from "react";

import {
  subscribeToFixxamActivity,
} from "@/firebase/queries/fixxamActivity";

import type {
  FixxamActivityPeriod,
  FixxamActivityResult,
} from "@/utils/fixxam/calculateFixxamActivity";

import { auth } from "@/firebase/config";

/* ============================================================
   DEFAULT RESULT
============================================================ */

const EMPTY_ACTIVITY: FixxamActivityResult = {
  period: "30D",

  volume: 0,

  transactions: 0,

  successfulTransactions: 0,

  failedTransactions: 0,

  successRate: 0,

  growth: 0,

  chartData: [],
};

/* ============================================================
   HOOK
============================================================ */

export default function useCustomerActivity(
  period: FixxamActivityPeriod = "30D",
) {
  const [activity, setActivity] =
    useState<FixxamActivityResult>(
      EMPTY_ACTIVITY,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<Error | null>(null);

  useEffect(() => {
    const customerId =
      auth.currentUser?.uid;

    if (!customerId) {
      setActivity({
        ...EMPTY_ACTIVITY,
        period,
      });

      setLoading(false);

      setError(
        new Error(
          "Customer is not authenticated.",
        ),
      );

      return;
    }

    let active = true;

    setLoading(true);
    setError(null);

    const unsubscribe =
      subscribeToFixxamActivity(
        customerId,
        period,
        (result) => {
          if (!active) {
            return;
          }

          setActivity(result);
          setLoading(false);
          setError(null);

          console.log(
            "FIXXAM_ACTIVITY_RESULT",
            {
              period: result.period,
              volume: result.volume,
              transactions:
                result.transactions,
              successfulTransactions:
                result.successfulTransactions,
              failedTransactions:
                result.failedTransactions,
              successRate:
                result.successRate,
              chartData:
                result.chartData,
            },
          );
        },
        (listenerError) => {
          if (!active) {
            return;
          }

          console.error(
            "CUSTOMER_ACTIVITY_ERROR",
            listenerError,
          );

          setLoading(false);
          setError(listenerError);
        },
      );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [period]);

  return {
    activity,
    loading,
    error,
  };
}