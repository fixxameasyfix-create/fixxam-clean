import {
  useEffect,
  useState,
} from "react";

import {
  auth,
} from "@/firebase/config";

import getWorkerProducts, {
  type WorkerProduct,
} from "@/services/products/getWorkerProducts";

/* ==============================================================
   HOOK
============================================================== */

export default function useWorkerProducts() {
  const [
    loading,
    setLoading,
  ] = useState<boolean>(true);

  const [
    products,
    setProducts,
  ] = useState<WorkerProduct[]>([]);

  useEffect(() => {
    let mounted = true;

    const workerId =
      auth.currentUser?.uid?.trim() ?? "";

    /* ==========================================================
       NO AUTHENTICATED WORKER
    ========================================================== */

    if (!workerId) {
      setProducts([]);
      setLoading(false);

      return () => {
        mounted = false;
      };
    }

    setLoading(true);

    /* ==========================================================
       WORKER PRODUCTS SERVICE
    ========================================================== */

    const unsubscribe =
      getWorkerProducts(
        workerId,
        (
          workerProducts: WorkerProduct[],
        ) => {
          if (!mounted) {
            return;
          }

          setProducts(
            Array.isArray(
              workerProducts,
            )
              ? workerProducts
              : [],
          );

          setLoading(false);
        },
      );

    /* ==========================================================
       CLEANUP
    ========================================================== */

    return () => {
      mounted = false;

      unsubscribe();
    };
  }, []);

  /* ============================================================
     RETURN
  ============================================================ */

  return {
    loading,
    products,
  };
}